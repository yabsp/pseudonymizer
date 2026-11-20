"""Checks the small detection model against the official one, tensor by tensor.

The small model ("npm run setup -- --model small") is published by a third party. This script shows that it is the
official full-precision file with nothing changed but how the weights are stored: the same graph, apart from MatMul
nodes that became MatMulNBits and the token embeddings (Gather) that became GatherBlockQuantized; every other tensor
identical; and every 8-bit weight within one quantization step of the official value.

Not part of the app and not needed to run it. It needs Python with the packages onnx and numpy:

    python scripts/verify-small-model.py models/gliner/model.onnx models/gliner/model_q8w.onnx

Result on 2026-11-11 for the files pinned in scripts/setup.mjs: 4958 nodes in the same order, 81 MatMul and 1 Gather
changed, 137 other tensors identical, largest difference one step (99.995 % of the weights within half a step).
"""
import hashlib
import sys

import numpy as np
import onnx
from onnx import numpy_helper

if len(sys.argv) != 3:
    sys.exit('usage: verify-small-model.py <official model.onnx> <small model_q8w.onnx>')
external = {entry.value for tensor in onnx.load(sys.argv[2], load_external_data=False).graph.initializer
            for entry in tensor.external_data if entry.key == 'location'}
official = onnx.load(sys.argv[1])
small = onnx.load(sys.argv[2])  # with the data file next to it

attributes = lambda node: {a.name: onnx.helper.get_attribute_value(a) for a in node.attribute}
array = numpy_helper.to_array
official_tensors = {t.name: t for t in official.graph.initializer}
small_tensors = {t.name: t for t in small.graph.initializer}
digest = lambda tensor: hashlib.sha256(array(tensor).tobytes()).hexdigest()
official_nodes = {tuple(node.output): node for node in official.graph.node}

same_order = [tuple(n.output) for n in official.graph.node] == [tuple(n.output) for n in small.graph.node]
print(f'nodes: {len(official.graph.node)} and {len(small.graph.node)}, same outputs in the same order: {same_order}')
print('inputs and outputs equal:', [i.name for i in official.graph.input] == [i.name for i in small.graph.input]
      and [o.name for o in official.graph.output] == [o.name for o in small.graph.output])
print('data files the small model names:', sorted(external))

problems = [] if same_order else ['the nodes differ']
changed = {}
replaced = set()   # official tensors that the small model stores in 8 bits
stored = set()     # the tensors it stores them in
worst_steps = 0.0
over_half = total = 0
for node in small.graph.node:
    original = official_nodes.get(tuple(node.output))
    if original is None:
        problems.append(f'{node.op_type} {tuple(node.output)}: not in the official model')
        continue
    kinds = (original.op_type, node.op_type)
    if kinds[0] == kinds[1]:
        if list(node.input) != list(original.input) or attributes(node).keys() != attributes(original).keys():
            problems.append(f'{node.op_type} {tuple(node.output)}: other inputs or attributes')
        continue
    changed[kinds] = changed.get(kinds, 0) + 1
    a = attributes(node)
    if kinds == ('MatMul', 'MatMulNBits'):
        weight = array(official_tensors[original.input[1]]).astype(np.float32)  # (K, N)
        K, N, block = a['K'], a['N'], a['block_size']
        if weight.shape != (K, N) or a['bits'] != 8 or K % block or node.input[0] != original.input[0]:
            problems.append(f'MatMulNBits {tuple(node.output)}: unexpected shape or attributes')
            continue
        # As stored: (output column, block, value); the middle of the 8-bit range is 128 unless zero points say otherwise.
        packed = array(small_tensors[node.input[1]]).reshape(N, -1, block).astype(np.float32)
        scales = array(small_tensors[node.input[2]]).reshape(N, -1, 1).astype(np.float32)
        zero = array(small_tensors[node.input[3]]).reshape(N, -1, 1).astype(np.float32) if len(node.input) > 3 and node.input[3] else 128.0
        steps = np.abs((packed - zero) * scales - weight.T.reshape(N, -1, block)) / scales
        replaced.add(original.input[1])
    elif kinds == ('Gather', 'GatherBlockQuantized'):
        weight = array(official_tensors[original.input[0]]).astype(np.float32)
        block = a['block_size']
        if a['bits'] != 8 or node.input[1] != original.input[1]:
            problems.append('GatherBlockQuantized: unexpected attributes')
            continue
        packed = array(small_tensors[node.input[0]]).astype(np.float32).reshape(weight.shape[0], -1, block)
        scales = array(small_tensors[node.input[2]]).astype(np.float32)[..., None]
        zero = array(small_tensors[node.input[3]]).astype(np.float32)[..., None]
        steps = np.abs((packed - zero) * scales - weight.reshape(weight.shape[0], -1, block)) / scales
        replaced.add(original.input[0])
    else:
        problems.append(f'{kinds[0]} became {kinds[1]} at {tuple(node.output)}')
        continue
    stored.update(name for name in node.input if name in small_tensors)
    # One step is the most a faithful 8-bit copy can be off: the quantizer clips the largest value of a block.
    if float(steps.max()) > 1.0 + 1e-4:
        problems.append(f'{node.op_type} {tuple(node.output)}: a weight is {float(steps.max()):.2f} steps off')
    worst_steps = max(worst_steps, float(steps.max()))
    over_half += int((steps > 0.5 + 1e-4).sum())
    total += steps.size

others = [name for name in official_tensors if name not in replaced]
different = [name for name in others if name not in small_tensors or digest(official_tensors[name]) != digest(small_tensors[name])]
extra = [name for name in small_tensors if name not in official_tensors and name not in stored]
print('changed node types:', {f'{a} -> {b}': n for (a, b), n in changed.items()})
print(f'8-bit weights: largest difference {worst_steps:.3f} steps, {100 * (1 - over_half / max(total, 1)):.3f} % within half a step')
print(f'other tensors: {len(others) - len(different)} identical, {len(different)} different or missing, {len(extra)} extra')
problems += [f'tensor {name} differs' for name in different[:5]] + [f'extra tensor {name}' for name in extra[:5]]
if external - {'model_q8w.onnx_data'}:
    problems.append(f'names other data files: {sorted(external)}')
for problem in problems[:20]:
    print('PROBLEM:', problem)
print('RESULT:', 'DIFFERENCES FOUND' if problems else 'only the weights are stored differently')
sys.exit(1 if problems else 0)
