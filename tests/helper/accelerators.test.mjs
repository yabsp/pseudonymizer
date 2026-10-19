import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { PYTHON } from '../helpers/python.mjs';
import { FIXTURES, ROOT } from '../helpers/server.mjs';

// Runs Python with python/ importable and the GLiNER stand-in, which finds the strings in FAKE_GLINER_ENTITIES.
function runPython(code, entities = {}, env = {}) {
  const result = spawnSync(PYTHON, ['-c', code], {
    cwd: path.join(ROOT, 'python'), encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: path.join(FIXTURES, 'fake_gliner'), FAKE_GLINER_ENTITIES: JSON.stringify(entities), ...env },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

// Every value in the safety check's text, as the CPU (the stand-in) finds it.
const CANARY = { 'Maria Keller': ['person', 0.99], 'Rebgasse 21': ['address', 0.9], 'Matteo Ghirlanda': ['person', 0.95] };

describe('hardware check', () => {
  it('turns off ONNX Runtime\'s telemetry before anything that loads it is imported, whatever the environment says', () => {
    // Records the setting at the moment each package is first imported; the stand-ins don't load ONNX Runtime
    // themselves, but the real gliner and docling do.
    const seen = runPython(`
import json, os, sys
seen = {}
class Watch:
    def find_spec(self, name, path=None, target=None):
        top = name.split('.')[0]
        if top in ('gliner', 'docling', 'onnxruntime'):
            seen.setdefault(top, os.environ.get('ORT_DISABLE_TELEMETRY'))
        return None
sys.meta_path.insert(0, Watch())
import gliner_helper, document_extraction
print(json.dumps(seen))`, {}, { ORT_DISABLE_TELEMETRY: '0' });
    assert.equal(seen.gliner, '1');
    for (const [name, value] of Object.entries(seen)) assert.equal(value, '1', name);
  });

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

  it('marks a GPU that PyTorch counts but can\'t open as unavailable, so "auto" moves on', (t) => {
    const answer = runPython(`
import json, accelerators
try:
    import torch
except ImportError:
    print(json.dumps({'skipped': True}))
    raise SystemExit
def cannot_open(index):
    raise RuntimeError('No CUDA GPUs are available')
torch.cuda.is_available = lambda: True
torch.cuda.get_device_name = cannot_open
status = {b['id']: b for b in accelerators.backend_status()}
print(json.dumps({'cuda': status['torch-cuda'], 'auto': accelerators.resolve('auto')}))`);
    if (answer.skipped) return t.skip('PyTorch is not installed');
    assert.equal(answer.cuda.available, false);
    assert.match(answer.cuda.reason, /can't use it \(No CUDA GPUs are available\)/);
    assert.notEqual(answer.auto, 'torch-cuda');
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

  it('loads a model for a PyTorch GPU once: checked on the CPU, then moved', () => {
    const answer = runPython(`
import json, accelerators, gliner_helper
accelerators.resolve = lambda requested: 'torch-xpu'
loads = []
real_load = accelerators.load_gliner
def counting_load(name, backend):
    loads.append(backend)
    return real_load(name, backend)
accelerators.load_gliner = counting_load
model, runtime = gliner_helper.load_checked('urchade/gliner_multi_pii-v1', 'torch-xpu')
print(json.dumps({'loads': loads, 'device': model.device, 'runtime': runtime}))`, CANARY);
    assert.deepEqual(answer, { loads: ['torch-cpu'], device: 'xpu', runtime: { id: 'torch-xpu', label: 'Intel GPU (PyTorch XPU)', verified: true } });
  });

  it('falls back to the CPU when a PyTorch GPU finds different values after the move', () => {
    const runtime = runPython(`
import json, accelerators, gliner, gliner_helper
accelerators.resolve = lambda requested: 'torch-xpu'
real_to = gliner.GLiNER.to
def computes_wrongly(self, device):
    if device != 'cpu':
        self.predict_entities = lambda *args, **kwargs: []
    return real_to(self, device)
gliner.GLiNER.to = computes_wrongly
model, runtime = gliner_helper.load_checked('urchade/gliner_multi_pii-v1', 'torch-xpu')
print(json.dumps(runtime))`, CANARY);
    assert.equal(runtime.id, 'torch-cpu');
    assert.match(runtime.notice, /Intel GPU \(PyTorch XPU\) found different values than the CPU.*runs on the CPU/);
  });

  it('never offers an ONNX Runtime provider outside the local allowlist', () => {
    const providers = runPython('import json, accelerators; print(json.dumps(sorted(accelerators.ONNX_PROVIDERS.values())))');
    assert.deepEqual(providers, ['CPUExecutionProvider', 'CUDAExecutionProvider', 'CoreMLExecutionProvider', 'DmlExecutionProvider']);
  });
});

describe('reading the windows of a long text', () => {
  // Names spread over a text of 2000 words, so it has many windows.
  const NAMES = { 'Reto Ammann': ['person', 0.9], 'Laura Bianchi': ['person', 0.9] };
  const readAs = (backend) => runPython(`
import json, gliner_helper
words = [f'wort{i}' for i in range(2000)]
words[5], words[1990] = 'Reto Ammann', 'Laura Bianchi'
model, _runtime = gliner_helper.load_checked('urchade/gliner_multi_pii-v1', 'torch-cpu')
calls = []
real_inference = model.inference
def recording_inference(texts, labels, threshold=0.5, batch_size=8):
    calls.append(batch_size)
    return real_inference(texts, labels, threshold=threshold, batch_size=batch_size)
model.inference = recording_inference
gliner_helper.get_model = lambda name, requested='auto': model
gliner_helper.loaded['runtime'] = {'id': '${backend}'}
found = gliner_helper.detect_with_gliner(' '.join(words), {'model': 'urchade/gliner_multi_pii-v1', 'labels': ['person']})
print(json.dumps({'batchSizes': calls, 'found': [e['text'] for e in found]}))`, NAMES);

  it('reads them in batches on a GPU and one at a time on the CPU, with the same values', () => {
    const gpu = readAs('torch-xpu');
    const cpu = readAs('torch-cpu');
    assert.deepEqual(gpu, { batchSizes: [8], found: ['Reto Ammann', 'Laura Bianchi'] });
    assert.deepEqual(cpu, { batchSizes: [1], found: ['Reto Ammann', 'Laura Bianchi'] });
  });
});
