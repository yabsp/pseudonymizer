import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { FIXTURES, startServer } from '../helpers/server.mjs';

const FAKE_ENV = {
  PYTHONPATH: path.join(FIXTURES, 'fake_gliner'),
  FAKE_GLINER_ENTITIES: JSON.stringify({
    'Reto Ammann': ['person', 0.97],
    'Klinik Seeblick': ['organization', 0.81],
    'Dorfstrasse 7': ['address', 0.38],
  }),
};
const MODEL = 'urchade/gliner_multi_pii-v1';
const TEXT = 'Herr Reto Ammann, Dorfstrasse 7, wurde in der Klinik Seeblick behandelt.';

describe('GLiNER detection endpoint', () => {
  let server;
  const detect = (body, headers) => server.api('POST', '/api/detect/gliner', { labels: ['person', 'organization', 'address'], threshold: 0.4, model: MODEL, ...body }, headers);
  before(async () => { server = await startServer({ env: FAKE_ENV }); });
  after(() => server.close());

  it('returns the values the model finds, above the threshold', async () => {
    const res = await detect({ text: TEXT });
    assert.equal(res.status, 200, res.body);
    assert.deepEqual(res.json().entities.map((e) => [e.text, e.label]), [['Reto Ammann', 'person'], ['Klinik Seeblick', 'organization']]);
    const lower = await detect({ text: TEXT, threshold: 0.3 });
    assert.ok(lower.json().entities.some((e) => e.text === 'Dorfstrasse 7'));
  });

  it('only returns the labels that were asked for', async () => {
    const res = await detect({ text: TEXT, labels: ['organization'] });
    assert.deepEqual(res.json().entities.map((e) => e.text), ['Klinik Seeblick']);
  });

  it('answers parallel requests with their own results', async () => {
    const texts = Array.from({ length: 8 }, (_, i) => (i % 2 ? `Nr. ${i}: Reto Ammann` : `Nr. ${i}: Klinik Seeblick`));
    const results = await Promise.all(texts.map((text) => detect({ text })));
    results.forEach((res, i) => assert.equal(res.json().entities[0].text, i % 2 ? 'Reto Ammann' : 'Klinik Seeblick'));
  });

  it('rejects hardware choices that are not on the list', async () => {
    for (const accelerator of ['cuda', 'onnx-azure', 'torch-cuda --x', '', 7]) {
      assert.equal((await detect({ text: TEXT, accelerator })).status, 400, String(accelerator));
    }
    // "auto" depends on this machine's PyTorch (.venv may have a GPU build), so only the CPU's id is checked.
    assert.equal((await detect({ text: TEXT, accelerator: 'auto' })).status, 200);
    const res = await detect({ text: TEXT, accelerator: 'torch-cpu' });
    assert.equal(res.status, 200);
    assert.equal(res.json().runtime.id, 'torch-cpu');
  });

  it('describes the hardware, only for this app', async () => {
    const res = await server.api('POST', '/api/hardware', {});
    assert.equal(res.status, 200, res.body);
    assert.ok(res.json().system.cpu !== undefined && Array.isArray(res.json().backends));
    assert.equal((await server.api('POST', '/api/hardware', {}, { Origin: 'https://attacker.example' })).status, 403);
  });

  it('rejects model names that are not "owner/name"', async () => {
    for (const model of ['../../etc/passwd', 'gliner', 'a/b/c', 'a b/c', '', undefined]) {
      const res = await detect({ text: TEXT, model });
      assert.equal(res.status, 400, String(model));
    }
  });

  it('reports a model that cannot be loaded, then keeps working', async () => {
    const res = await detect({ text: TEXT, model: 'missing/model' });
    assert.equal(res.status, 502);
    assert.match(res.json().error, /not a valid model identifier/);
    assert.equal((await detect({ text: TEXT })).status, 200);
  });

  it('restarts the helper after it crashed', async () => {
    const crashed = await detect({ text: TEXT, model: 'crash/model' });
    assert.equal(crashed.status, 502);
    assert.match(crashed.json().error, /stopped/);
    const again = await detect({ text: TEXT });
    assert.equal(again.status, 200);
    assert.equal(again.json().entities.length, 2);
  });

  it('refuses other websites', async () => {
    assert.equal((await detect({ text: TEXT }, { Origin: 'https://attacker.example' })).status, 403);
  });
});

describe('cancelling detection', () => {
  let server;
  let pidFile;
  const isAlive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  const waitUntil = async (condition, what) => {
    for (let waited = 0; !condition(); waited += 50) {
      if (waited > 30000) throw new Error('timed out waiting until ' + what);
      await sleep(50);
    }
  };
  // Starts a detection that the signal can cancel, as the page does; a cancelled one resolves to its error.
  const detect = (text, signal) => server.request({
    method: 'POST',
    path: '/api/detect/gliner',
    signal,
    headers: { Origin: server.origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, labels: ['person', 'organization'], threshold: 0.4, model: MODEL, accelerator: 'torch-cpu' }),
  }).catch((e) => e);
  /** Starts a detection the helper keeps reading; resolves once it does, with the id of the helper's process. */
  async function startSlow(signal) {
    fs.rmSync(pidFile, { force: true });
    const result = detect('FAKE_SLOW', signal);
    await waitUntil(() => fs.existsSync(pidFile) && fs.statSync(pidFile).size > 0, 'the helper reads the text');
    return { result, pid: Number(fs.readFileSync(pidFile, 'utf8')) };
  }

  before(async () => {
    pidFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-pid-')), 'helper.pid');
    server = await startServer({ env: { ...FAKE_ENV, FAKE_GLINER_PID_FILE: pidFile } });
  });
  after(async () => {
    await server.close();
    fs.rmSync(path.dirname(pidFile), { recursive: true, force: true });
  });

  it('stops the helper\'s work on a running detection, and the next one works', async () => {
    const cancel = new AbortController();
    const { result, pid } = await startSlow(cancel.signal);
    assert.ok(isAlive(pid));
    cancel.abort();
    assert.equal((await result).name, 'AbortError');
    await waitUntil(() => !isAlive(pid), 'the helper has stopped');
    const next = await detect(TEXT);
    assert.equal(next.status, 200, next.body);
    assert.equal(next.json().entities.length, 2);
    assert.ok(server.isRunning());
  });

  it('answers a waiting detection when the running one is cancelled', async () => {
    const cancel = new AbortController();
    const { result, pid } = await startSlow(cancel.signal);
    const waitingOne = detect(TEXT);
    await sleep(100);
    cancel.abort();
    await result;
    const answer = await waitingOne;
    assert.equal(answer.status, 200, answer.body);
    assert.equal(answer.json().entities[0].text, 'Reto Ammann');
    await waitUntil(() => !isAlive(pid), 'the helper has stopped');
  });

  it('keeps the helper and its model when only a waiting detection is cancelled', async () => {
    const cancelSlow = new AbortController();
    const { result, pid } = await startSlow(cancelSlow.signal);
    const cancelWaiting = new AbortController();
    const waitingOne = detect(TEXT, cancelWaiting.signal);
    await sleep(100);
    cancelWaiting.abort();
    assert.equal((await waitingOne).name, 'AbortError');
    await sleep(300);
    assert.ok(isAlive(pid));
    cancelSlow.abort();
    await result;
    await waitUntil(() => !isAlive(pid), 'the helper has stopped');
  });
});

describe('GLiNER detection endpoint without GLiNER', () => {
  it('explains that the package is missing', async () => {
    const server = await startServer({ env: { PYTHONPATH: path.join(FIXTURES, 'no_gliner') } });
    try {
      const res = await server.api('POST', '/api/detect/gliner', { text: 'x', labels: ['person'], model: MODEL });
      assert.equal(res.status, 502);
      assert.match(res.json().error, /"gliner" is not installed.*docs\/setup\.md/);
    } finally {
      await server.close();
    }
  });

  it('explains that Python cannot be started', async () => {
    const server = await startServer({ env: { GLINER_PYTHON: '/nonexistent/python3' } });
    try {
      const res = await server.api('POST', '/api/detect/gliner', { text: 'x', labels: ['person'], model: MODEL });
      assert.equal(res.status, 502);
      assert.match(res.json().error, /Could not start the detection helper/);
      assert.ok(server.isRunning());
    } finally {
      await server.close();
    }
  });
});

describe('Presidio detection endpoint', () => {
  let server;
  const detect = (body, headers) => server.api('POST', '/api/detect/presidio', { labels: ['person', 'organization'], threshold: 0.4, model: MODEL, ...body }, headers);
  before(async () => {
    server = await startServer({ env: { ...FAKE_ENV, FAKE_PRESIDIO_ENTITIES: JSON.stringify({ Dorfstrasse: ['LOCATION', 0.85] }) } });
  });
  after(() => server.close());

  it('returns GLiNER\'s and Presidio\'s values and the language used', async () => {
    const res = await detect({ text: TEXT, language: 'auto' });
    assert.equal(res.status, 200, res.body);
    assert.equal(res.json().language, 'de');
    assert.deepEqual(res.json().entities.map((e) => [e.text, e.source]), [['Reto Ammann', 'gliner'], ['Klinik Seeblick', 'gliner'], ['Dorfstrasse', 'presidio']]);
  });

  it('answers the GLiNER endpoint with the values and where detection ran, and no language', async () => {
    const res = await server.api('POST', '/api/detect/gliner', { text: TEXT, labels: ['person'], threshold: 0.4, model: MODEL });
    assert.deepEqual(Object.keys(res.json()), ['entities', 'runtime']);
  });

  it('rejects languages other than auto, de, fr and en, among them Italian', async () => {
    for (const language of ['it', 'es', 'DE', '../de', '', 3]) assert.equal((await detect({ text: TEXT, language })).status, 400, String(language));
    assert.equal((await detect({ text: TEXT })).status, 200);
  });

  it('refuses other websites', async () => {
    assert.equal((await detect({ text: TEXT }, { Origin: 'https://attacker.example' })).status, 403);
  });
});
