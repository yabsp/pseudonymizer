// The options the desktop app (desktop/main.js) starts the server with.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { assertOnlyUserCanAccess } from '../helpers/file-access.mjs';
import { PYTHON } from '../helpers/python.mjs';
import { FIXTURES, GLINER_HELPER, SETTINGS_FILE, startServer } from '../helpers/server.mjs';

const MODEL = 'urchade/gliner_multi_pii-v1';
const IS_WINDOWS = process.platform === 'win32';

describe('desktop app options', () => {
  let dataDir;
  let helperDir;
  let server;
  before(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-data-'));
    helperDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-helper-'));
    // Stands in for the PyInstaller program: one executable, started without arguments.
    const helper = path.join(helperDir, 'detection-helper');
    fs.writeFileSync(helper, `#!/bin/sh\nexec "${PYTHON}" "${GLINER_HELPER}"\n`, { mode: 0o755 });
    server = await startServer({
      env: {
        PSEUDONYMIZER_APP: 'desktop',
        PSEUDONYMIZER_DATA_DIR: dataDir,
        DETECTION_HELPER: helper,
        PYTHONPATH: path.join(FIXTURES, 'fake_gliner'),
        FAKE_GLINER_ENTITIES: JSON.stringify({ 'Hans Muster': ['person', 0.95] }),
      },
    });
  });
  after(async () => {
    await server?.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(helperDir, { recursive: true, force: true });
  });

  it('says it is the desktop app, which has no Presidio', async () => {
    const res = await server.request({ path: '/api/about' });
    assert.deepEqual(res.json(), { app: 'desktop', detectors: ['gliner', 'ollama'], documents: [] });
  });

  it('saves settings in the data folder, readable by the user only, not in the program folder', async () => {
    const res = await server.api('PUT', '/api/settings', { detector: 'gliner' });
    assert.equal(res.status, 200, res.body);
    const file = path.join(dataDir, 'settings.json');
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { detector: 'gliner' });
    assertOnlyUserCanAccess(file);
    assert.ok(!fs.existsSync(path.join(server.dir, SETTINGS_FILE)));
  });

  it('says clearly that it can\'t open PDFs yet', async () => {
    const res = await server.request({
      method: 'POST', path: '/api/extract/pdf', body: Buffer.from('%PDF-1.7\n'),
      headers: { Origin: server.origin, 'Content-Type': 'application/pdf' },
    });
    assert.equal(res.status, 501);
    assert.match(res.json().error, /not part of the desktop app yet.*paste it instead/);
  });

  it('starts the bundled helper program instead of Python with a script', { skip: IS_WINDOWS && 'the stand-in helper is a shell script' }, async () => {
    const res = await server.api('POST', '/api/detect/gliner', { text: 'Patient Hans Muster', labels: ['person'], threshold: 0.4, model: MODEL });
    assert.equal(res.status, 200, res.body);
    assert.deepEqual(res.json().entities.map((e) => e.text), ['Hans Muster']);
  });
});

describe('the server as started with "npm start"', () => {
  it('offers all three detectors', async () => {
    const server = await startServer();
    try {
      assert.deepEqual((await server.request({ path: '/api/about' })).json(), { app: 'server', detectors: ['gliner', 'presidio', 'ollama'], documents: ['pdf'] });
    } finally {
      await server.close();
    }
  });
});

describe('the API secret of the desktop app', () => {
  const token = 'ab'.repeat(32);
  let server;
  before(async () => {
    server = await startServer({ env: { PSEUDONYMIZER_API_TOKEN: token } });
  });
  after(async () => server?.close());

  it('answers the API only with the secret, and still serves the page', async () => {
    assert.equal((await server.request({ path: '/api/about' })).status, 403);
    assert.equal((await server.request({ path: '/api/about', headers: { 'X-Pseudonymizer-Token': 'cd'.repeat(32) } })).status, 403);
    assert.equal((await server.request({ path: '/api/about', headers: { 'X-Pseudonymizer-Token': token.slice(1) } })).status, 403);
    assert.equal((await server.request({ path: '/api/about', headers: { 'X-Pseudonymizer-Token': token } })).status, 200);
    assert.equal((await server.request({ path: '/' })).status, 200);
  });
});

describe('invalid desktop options', () => {
  for (const [name, env, message] of [
    ['a relative data folder', { PSEUDONYMIZER_DATA_DIR: 'data' }, /PSEUDONYMIZER_DATA_DIR must be an absolute path/],
    ['a helper that does not exist', { DETECTION_HELPER: '/nonexistent/detection-helper' }, /DETECTION_HELPER points to .* which does not exist/],
    ['an unknown app kind', { PSEUDONYMIZER_APP: 'cloud' }, /PSEUDONYMIZER_APP must be "server" or "desktop"/],
    ['an API secret that is too short', { PSEUDONYMIZER_API_TOKEN: 'abc' }, /PSEUDONYMIZER_API_TOKEN must be 64 hex digits/],
  ]) {
    it(`stop the server from starting: ${name}`, async () => {
      await assert.rejects(startServer({ env }), message);
    });
  }
});
