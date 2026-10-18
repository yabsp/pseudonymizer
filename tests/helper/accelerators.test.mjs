import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { PYTHON } from '../helpers/python.mjs';
import { FIXTURES, ROOT } from '../helpers/server.mjs';

// Runs Python with python/ importable and the GLiNER stand-in, which finds the strings in FAKE_GLINER_ENTITIES.
function runPython(code, entities = {}) {
  const result = spawnSync(PYTHON, ['-c', code], {
    cwd: path.join(ROOT, 'python'), encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: path.join(FIXTURES, 'fake_gliner'), FAKE_GLINER_ENTITIES: JSON.stringify(entities) },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

// Every value in the safety check's text, as the CPU (the stand-in) finds it.
const CANARY = { 'Maria Keller': ['person', 0.99], 'Rebgasse 21': ['address', 0.9], 'Matteo Ghirlanda': ['person', 0.95] };

describe('hardware check', () => {
  it('describes this machine and lists every back end with whether it can be used', () => {
    const { system, backends } = runPython('import json, accelerators; print(json.dumps(accelerators.probe()))');
    for (const key of ['os', 'architecture', 'cpu', 'threads', 'gpus']) assert.ok(key in system, key);
    assert.deepEqual(backends.map((b) => b.id), ['torch-cuda', 'onnx-cuda', 'torch-xpu', 'onnx-directml', 'torch-mps', 'onnx-coreml', 'torch-cpu', 'onnx-cpu']);
    for (const b of backends) assert.ok(b.available || b.reason, `${b.id} says why it can't be used`);
  });

  it('refuses unknown hardware, and hardware this machine lacks, with the reason', () => {
    const answer = runPython(`
import json, accelerators
results = {}
try:
    accelerators.resolve('onnx-azure')
except ValueError as e:
    results['unknown'] = str(e)
missing = next((b['id'] for b in accelerators.backend_status() if not b['available']), None)
try:
    accelerators.resolve(missing)
except RuntimeError as e:
    results['missing'] = str(e)
results['auto'] = accelerators.resolve('auto')
print(json.dumps(results))`);
    assert.match(answer.unknown, /unknown hardware "onnx-azure"/);
    assert.match(answer.missing, /is not available on this machine/);
    assert.ok(answer.auto);
  });
});

describe('checking a back end against the CPU', () => {
  it('accepts tiny score differences but not a missing or extra certain value', () => {
    const result = runPython(`
import json, accelerators as a
cpu = [(0, 12, 'person', 0.99), (20, 31, 'address', 0.55)]
print(json.dumps({
  'same': a.same_findings(cpu, [(0, 12, 'person', 0.97), (20, 31, 'address', 0.62)]),
  'unsure value lost': a.same_findings(cpu, [(0, 12, 'person', 0.97)]),
  'name lost': a.same_findings(cpu, [(20, 31, 'address', 0.55)]),
  'certain extra': a.same_findings(cpu, cpu + [(40, 50, 'person', 0.9)]),
}))`);
    assert.deepEqual(result, { same: true, 'unsure value lost': true, 'name lost': false, 'certain extra': false });
  });

  for (const [problem, broken, notice] of [
    ['finds different values', 'class Broken:\n    def predict_entities(self, *a, **k): return []\n', /found different values than the CPU.*runs on the CPU/],
    ['fails to load', 'class Broken:\n    def __init__(self): raise MemoryError("out of GPU memory")\n', /could not be used \(MemoryError: out of GPU memory\).*runs on the CPU/],
  ]) {
    it(`falls back to the CPU and says so when a GPU ${problem}`, () => {
      const runtime = runPython(`
import json, accelerators, gliner_helper
${broken}
accelerators.resolve = lambda requested: 'onnx-cuda'
real_load = accelerators.load_gliner
accelerators.load_gliner = lambda name, backend: Broken() if backend == 'onnx-cuda' else real_load(name, backend)
model, runtime = gliner_helper.load_checked('urchade/gliner_multi_pii-v1', 'onnx-cuda')
print(json.dumps(runtime))`, CANARY);
      assert.equal(runtime.id, 'torch-cpu');
      assert.match(runtime.notice, notice);
    });
  }

  it('uses a GPU that finds the same values, and marks it as checked', () => {
    const runtime = runPython(`
import json, accelerators, gliner_helper
accelerators.resolve = lambda requested: 'onnx-cuda'
real_load = accelerators.load_gliner
accelerators.load_gliner = lambda name, backend: real_load(name, 'torch-cpu')
model, runtime = gliner_helper.load_checked('urchade/gliner_multi_pii-v1', 'onnx-cuda')
print(json.dumps(runtime))`, CANARY);
    assert.deepEqual(runtime, { id: 'onnx-cuda', label: 'NVIDIA GPU (ONNX Runtime CUDA)', verified: true });
  });

  it('never offers an ONNX Runtime provider outside the local allowlist', () => {
    const providers = runPython('import json, accelerators; print(json.dumps(sorted(accelerators.ONNX_PROVIDERS.values())))');
    assert.deepEqual(providers, ['CPUExecutionProvider', 'CUDAExecutionProvider', 'CoreMLExecutionProvider', 'DmlExecutionProvider']);
  });
});
