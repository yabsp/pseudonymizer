import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { readConfig } from '../../server/config.js';
import { acceleratorsFor, decodeSpans, largestDifference, loadGliner, pickDevice, planWindows, splitWords, WINDOW_WORDS } from '../../server/gliner.js';
import { fakeModel, ROOT, startServer } from '../helpers/server.mjs';

const ENTITIES = [{ text: 'Reto Ammann', label: 'person' }, { text: 'Klinik Seeblick', label: 'organization', score: 0.35 }];
const LABELS = ['person', 'organization'];

describe('detection API', () => {
  let server;
  const loads = { count: 0 };
  before(async () => {
    server = await startServer({ loadModel: fakeModel(ENTITIES, { loads }) });
  });
  after(() => server.close());

  it('loads the model with the first request only, and an empty text only loads it', async () => {
    assert.equal(loads.count, 0);
    const warmUp = await server.api('POST', '/api/detect', { text: '', labels: [] });
    assert.equal(warmUp.status, 200, warmUp.body);
    assert.deepEqual([warmUp.json().entities, warmUp.json().model, warmUp.json().device], [[], 'Stand-in model', 'the processor']);
    assert.deepEqual(loads.options.device, { name: 'auto' });
    await server.api('POST', '/api/detect', { text: 'Reto Ammann', labels: LABELS });
    assert.equal(loads.count, 1);
  });

  it('returns what the model finds for the labels, down to the threshold', async () => {
    const text = 'Klinik Seeblick berichtet über Reto Ammann.';
    const balanced = (await server.api('POST', '/api/detect', { text, labels: LABELS, threshold: 0.4 })).json();
    assert.deepEqual(balanced.entities, [{ text: 'Reto Ammann', label: 'person', start: 31, end: 42, score: 0.9 }]);
    const high = (await server.api('POST', '/api/detect', { text, labels: LABELS, threshold: 0.3 })).json();
    assert.deepEqual(high.entities.map((e) => e.text).sort(), ['Klinik Seeblick', 'Reto Ammann']);
    const onlyOrganizations = (await server.api('POST', '/api/detect', { text, labels: ['organization'], threshold: 0.3 })).json();
    assert.deepEqual(onlyOrganizations.entities.map((e) => e.text), ['Klinik Seeblick']);
  });

  it('refuses requests it can not read as a detection request', async () => {
    const bad = [
      { text: 5, labels: LABELS }, { text: 'x', labels: 'person' }, { text: 'x', labels: [1] }, { text: 'x', labels: [''] },
      { text: 'x', labels: Array(101).fill('a') }, { text: 'x', labels: ['a'.repeat(101)] },
      { text: 'x', labels: LABELS, threshold: '0.4' }, { text: 'x', labels: LABELS, threshold: 0 }, { text: 'x', labels: LABELS, threshold: 1 },
    ];
    for (const body of bad) assert.equal((await server.api('POST', '/api/detect', body)).status, 400, JSON.stringify(body).slice(0, 80));
    assert.equal((await server.api('POST', '/api/detect', { text: 'x'.repeat(server.config.maxTextChars + 1), labels: LABELS })).status, 413);
    assert.equal((await server.api('POST', '/api/detect', { text: 'x', labels: LABELS }, { Origin: 'https://attacker.example' })).status, 403);
    assert.equal((await server.api('POST', '/api/detect', { text: 'x', labels: LABELS }, { 'Content-Type': 'text/plain' })).status, 415);
  });

  it('stops reading a text when the page cancels, and reads the next one', async () => {
    const controller = new AbortController();
    const slow = server.request({
      method: 'POST', path: '/api/detect', signal: controller.signal, headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'SLOW Reto Ammann', labels: LABELS }),
    }).catch((e) => e);
    await sleep(100);
    const waiting = server.api('POST', '/api/detect', { text: 'Reto Ammann', labels: LABELS });
    await sleep(100);
    controller.abort();
    assert.equal((await slow).name, 'AbortError');
    const next = await waiting;
    assert.equal(next.status, 200);
    assert.deepEqual(next.json().entities.map((e) => e.text), ['Reto Ammann']);
  });
});

describe('detection without the model', () => {
  it('says how to install it, and works once it is there, without a restart', async () => {
    const modelDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-model-'));
    let installed = false;
    const loadModel = async (dir, options) => (installed ? fakeModel(ENTITIES)() : loadGliner(dir, options));
    const server = await startServer({ env: { PSEUDONYMIZER_MODEL_DIR: modelDir }, loadModel });
    try {
      const res = await server.api('POST', '/api/detect', { text: 'Reto Ammann', labels: LABELS });
      assert.equal(res.status, 502);
      assert.match(res.json().error, /detection model is not installed.*npm run setup/);
      installed = true;
      assert.equal((await server.api('POST', '/api/detect', { text: 'Reto Ammann', labels: LABELS })).status, 200);
    } finally {
      await server.close();
      fs.rmSync(modelDir, { recursive: true, force: true });
    }
  });
});

describe('reading a text in windows', () => {
  it('counts words as the model does: punctuation alone, words joined by "-" or "_" as one', () => {
    const text = 'Jean-Luc, a_b@c.d  Müller!';
    assert.deepEqual(splitWords(text).map((w) => text.slice(w.start, w.end)), ['Jean-Luc', ',', 'a_b', '@', 'c', '.', 'd', 'Müller', '!']);
  });

  it('gives a short text one window', () => {
    const text = 'Ein kurzer Satz.';
    assert.deepEqual(planWindows(text, splitWords(text)), [[0, 4]]);
  });

  it('ends a window at a line break and starts the next one right there', () => {
    const line = Array.from({ length: 50 }, (_, i) => `w${i}`).join(' ');
    const text = [line, line, line, line, line].join('\n'); // 250 words, a line break every 50
    const words = splitWords(text);
    const windows = planWindows(text, words);
    assert.deepEqual(windows, [[0, 150], [150, 250]]);
    for (const [from, to] of windows) assert.ok(to - from <= WINDOW_WORDS);
  });

  it('overlaps windows inside a line that is longer than a window, so no value is cut in two', () => {
    const text = Array.from({ length: 400 }, (_, i) => `w${i}`).join(' ');
    const windows = planWindows(text, splitWords(text));
    assert.deepEqual(windows[0], [0, 150]);
    assert.deepEqual(windows[1], [110, 260]);
    assert.equal(windows.at(-1)[1], 400);
    for (let i = 1; i < windows.length; i++) assert.ok(windows[i][0] <= windows[i - 1][1] - 40, 'overlap of at least 40 words');
  });

  it('covers every word of long texts whatever their line breaks (generated)', () => {
    for (const lineLength of [1, 7, 60, 149, 150, 151, 333]) {
      const text = Array.from({ length: 1000 }, (_, i) => `w${i}${(i + 1) % lineLength ? ' ' : '\n'}`).join('');
      const words = splitWords(text);
      const covered = new Set();
      for (const [from, to] of planWindows(text, words)) {
        assert.ok(to > from && to - from <= WINDOW_WORDS, `window size with lines of ${lineLength}`);
        for (let i = from; i < to; i++) covered.add(i);
      }
      assert.equal(covered.size, words.length, `lines of ${lineLength} words`);
    }
  });
});

describe('decoding the model output', () => {
  // 3 words, spans of up to 2 words, 2 labels: one logit per (start, width, label)
  const logitOf = (p) => Math.log(p / (1 - p));
  const logits = (scores) => {
    const data = new Float32Array(3 * 2 * 2).fill(-10);
    for (const [from, width, label, p] of scores) data[(from * 2 + width) * 2 + label] = logitOf(p);
    return data;
  };

  it('keeps the best span and drops what overlaps it', () => {
    const spans = decodeSpans(logits([[0, 1, 0, 0.9], [1, 0, 1, 0.8], [2, 0, 1, 0.7]]), 3, 2, 2, 0.4);
    assert.deepEqual(spans.map((s) => [s.from, s.to, s.label]), [[0, 1, 0], [2, 2, 1]]);
    assert.ok(Math.abs(spans[0].score - 0.9) < 1e-6);
  });

  it('ignores scores under the threshold and spans that run past the last word', () => {
    assert.deepEqual(decodeSpans(logits([[0, 0, 0, 0.39], [2, 1, 0, 0.99]]), 3, 2, 2, 0.4), []);
  });

  it('gives the same spans whether the threshold is applied while decoding or afterwards', () => {
    const data = logits([[0, 0, 0, 0.35], [0, 1, 1, 0.6], [1, 0, 0, 0.45], [2, 0, 0, 0.25], [2, 0, 1, 0.5]]);
    const direct = decodeSpans(data, 3, 2, 2, 0.4);
    const filtered = decodeSpans(data, 3, 2, 2, 0.2).filter((s) => s.score >= 0.4);
    assert.deepEqual(filtered, direct);
  });
});

// Loading ONNX Runtime in a source file: a static import (from 'onnxruntime-node') or a dynamic one
// (import('onnxruntime-node')), with single or double quotes.
const LOADS_ONNX_RUNTIME = /(?:from\s*|import\s*\(\s*)['"]onnxruntime-node['"]/g;

describe('the library that runs the model', () => {
  // As shipped, ONNX Runtime sends usage reports to Microsoft and keeps a file about them in the user's folder
  // (measured, docs/reference.md, "Checking for network calls"); ORT_DISABLE_TELEMETRY=1 stops both, but only if it is
  // set before the library is loaded.
  it('is loaded in server/gliner.js only, after its usage reports are turned off', () => {
    const inFolder = (dir) => fs.readdirSync(path.join(ROOT, dir), { recursive: true }).map((file) => `${dir}/${file.split(path.sep).join('/')}`);
    const sources = [...inFolder('desktop'), ...inFolder('server'), ...inFolder('scripts'), ...inFolder('public/js')].filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
    const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.deepEqual(sources.filter((file) => read(file).match(LOADS_ONNX_RUNTIME)), ['server/gliner.js']);

    const source = read('server/gliner.js');
    const loaded = [...source.matchAll(LOADS_ONNX_RUNTIME)];
    assert.equal(loaded.length, 1);
    assert.ok(loaded[0][0].startsWith('import'), 'loaded when the model is needed, not when the file is read');
    const turnedOff = source.indexOf("process.env.ORT_DISABLE_TELEMETRY = '1'");
    assert.ok(turnedOff !== -1 && turnedOff < loaded[0].index, 'ORT_DISABLE_TELEMETRY must be set before the library is loaded');
  });
});

describe('choosing where the model runs', () => {
  const ALL = [{ name: 'cpu', bundled: true }, { name: 'dml', bundled: true }, { name: 'webgpu', bundled: true }, { name: 'cuda', bundled: true }, { name: 'coreml', bundled: true }];

  it('reads the device setting, and refuses one it does not know', () => {
    const device = (value) => readConfig({ PSEUDONYMIZER_DEVICE: value }).device;
    assert.deepEqual([device(undefined), device(''), device('auto'), device('cpu')], [{ name: 'auto' }, { name: 'auto' }, { name: 'auto' }, { name: 'cpu' }]);
    assert.deepEqual([device('dml'), device('dml:1'), device('cuda:0')], [{ name: 'dml' }, { name: 'dml', deviceId: 1 }, { name: 'cuda', deviceId: 0 }]);
    for (const wrong of ['gpu', 'DML', 'azure', 'cpu:1', 'auto:0', 'dml:', 'dml:x', 'dml:123']) assert.throws(() => device(wrong), /PSEUDONYMIZER_DEVICE/, wrong);
  });

  it('tries this system\'s accelerators that ONNX Runtime has, never one that is not on the list', () => {
    const names = (device, supported, platform) => acceleratorsFor(device, supported, platform).map((a) => a.deviceId === undefined ? a.name : `${a.name}:${a.deviceId}`);
    assert.deepEqual(names({ name: 'auto' }, ALL, 'win32'), ['dml']);
    assert.deepEqual(names({ name: 'auto' }, ALL, 'linux'), ['cuda']);
    assert.deepEqual(names({ name: 'auto' }, ALL, 'darwin'), ['coreml']);
    const linux = [{ name: 'cpu', bundled: true }, { name: 'webgpu', bundled: true }, { name: 'cuda', bundled: false }, { name: 'tensorrt', bundled: false }];
    assert.deepEqual(names({ name: 'auto' }, linux, 'linux'), [], 'CUDA only when its library is installed, WebGPU only when asked for');
    assert.deepEqual(acceleratorsFor({ name: 'auto' }, linux, 'linux', (name) => name === 'cuda').map((a) => a.name), ['cuda']);
    assert.deepEqual(names({ name: 'auto' }, [{ name: 'cpu', bundled: true }, { name: 'azure', bundled: true }], 'freebsd'), []);
    assert.deepEqual(names({ name: 'cpu' }, ALL, 'win32'), []);
    assert.deepEqual(names({ name: 'webgpu' }, ALL, 'linux'), ['webgpu']);
    assert.deepEqual(names({ name: 'dml', deviceId: 1 }, [{ name: 'cpu' }], 'win32'), ['dml:1']);
  });

  it('compares probabilities, and treats what can not be compared as different', () => {
    assert.equal(largestDifference([0.1, 0.5, 0.9], [0.1, 0.52, 0.89]), 0.020000000000000018);
    assert.equal(largestDifference([0.1, 0.5], [0.1, 0.5]), 0);
    assert.equal(largestDifference([0.1, 0.5], [0.1]), Infinity);
    assert.equal(largestDifference([0.1, 0.5], [NaN, 0.5]), Infinity);
  });

  /** Sessions that say what happens to them; results: probabilities and time of the check, per device. */
  function fakeDevices(results, { failing = [] } = {}) {
    const events = [];
    const open = async (accelerator) => {
      const name = accelerator?.name ?? 'cpu';
      if (failing.includes(name)) throw new Error(`${name} is missing\nmore detail`);
      events.push(`open ${name}`);
      return { name, release: async () => events.push(`release ${name}`) };
    };
    const check = async (session) => results[session.name];
    return { events, open, check };
  }
  const DML = { name: 'dml', label: 'the graphics card (DirectML)' };
  const WEBGPU = { name: 'webgpu', label: 'the graphics card (WebGPU)' };
  const SAME = [0.1, 0.9];

  it('runs on the processor when there is no accelerator, without a check', async () => {
    const { events, open } = fakeDevices({});
    const chosen = await pickDevice([], { open, check: () => assert.fail('no check needed'), mustBeFaster: true });
    assert.deepEqual([chosen.session.name, chosen.device], ['cpu', { name: 'cpu', label: 'the processor' }]);
    assert.deepEqual(events, ['open cpu']);
  });

  it('uses an accelerator that finds the same and is faster, with one copy of the model at a time', async () => {
    const { events, open, check } = fakeDevices({ cpu: { probabilities: SAME, ms: 300 }, dml: { probabilities: [0.1, 0.9001], ms: 100 } });
    const chosen = await pickDevice([DML], { open, check, mustBeFaster: true });
    assert.equal(chosen.session.name, 'dml');
    assert.equal(chosen.device.label, 'the graphics card (DirectML)');
    assert.deepEqual([chosen.device.checked.ms, chosen.device.checked.processorMs], [100, 300]);
    assert.deepEqual(events, ['open cpu', 'release cpu', 'open dml']);
  });

  it('falls back to the processor when an accelerator finds something else, and says why', async () => {
    const { events, open, check } = fakeDevices({ cpu: { probabilities: SAME, ms: 300 }, dml: { probabilities: [0.1, 0.5], ms: 100 } });
    const chosen = await pickDevice([DML], { open, check, mustBeFaster: true });
    assert.equal(chosen.session.name, 'cpu');
    assert.equal(chosen.device.label, 'the processor (the graphics card (DirectML) gave other results)');
    assert.deepEqual(events, ['open cpu', 'release cpu', 'open dml', 'release dml', 'open cpu']);
  });

  it('treats a broken result as other results', async () => {
    const { open, check } = fakeDevices({ cpu: { probabilities: SAME, ms: 300 }, dml: { probabilities: [NaN, NaN], ms: 100 } });
    assert.equal((await pickDevice([DML], { open, check, mustBeFaster: false })).session.name, 'cpu');
  });

  it('skips a slower accelerator unless it was asked for by name', async () => {
    const results = { cpu: { probabilities: SAME, ms: 300 }, dml: { probabilities: SAME, ms: 400 } };
    const automatic = await pickDevice([DML], { ...fakeDevices(results), mustBeFaster: true });
    assert.equal(automatic.device.label, 'the processor (the graphics card (DirectML) was not faster)');
    const asked = await pickDevice([DML], { ...fakeDevices(results), mustBeFaster: false });
    assert.equal(asked.session.name, 'dml');
  });

  it('tries the next accelerator when one can not start', async () => {
    const { events, open, check } = fakeDevices({ cpu: { probabilities: SAME, ms: 300 }, webgpu: { probabilities: SAME, ms: 200 } }, { failing: ['dml'] });
    const chosen = await pickDevice([DML, WEBGPU], { open, check, mustBeFaster: true });
    assert.equal(chosen.session.name, 'webgpu');
    assert.deepEqual(events, ['open cpu', 'release cpu', 'open webgpu']);
    const none = await pickDevice([DML], { ...fakeDevices({ cpu: { probabilities: SAME, ms: 300 } }, { failing: ['dml'] }), mustBeFaster: true });
    assert.equal(none.device.label, 'the processor (the graphics card (DirectML) could not be used: dml is missing)');
  });
});
