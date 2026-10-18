import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { assertOnlyUserCanAccess } from '../helpers/file-access.mjs';
import { SETTINGS_FILE, startServer } from '../helpers/server.mjs';

const SETTINGS = {
  detector: 'gliner', glinerModel: 'urchade/gliner_multi_pii-v1', glinerThreshold: '0.4',
  provider: 'anthropic', model: 'claude-opus-5-5', useRegex: true, apiKey: 'sk-ant-test-0000',
};

describe('settings API', () => {
  let server;
  let file;
  beforeEach(async () => {
    server = await startServer();
    file = path.join(server.dir, SETTINGS_FILE);
  });
  afterEach(() => server.close());

  it('returns empty settings before anything was saved', async () => {
    const res = await server.api('GET', '/api/settings');
    assert.equal(res.status, 200);
    assert.deepEqual(res.json(), {});
  });

  it('saves settings to a file only the user can read, and returns them', async () => {
    const saved = await server.api('PUT', '/api/settings', SETTINGS);
    assert.equal(saved.status, 200);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), SETTINGS);
    assertOnlyUserCanAccess(file);
    assert.deepEqual((await server.api('GET', '/api/settings')).json(), SETTINGS);
  });

  it('refuses writes from other websites and simple cross-site form posts', async () => {
    fs.writeFileSync(file, JSON.stringify({ provider: 'cli' }));
    const attacker = { apiKey: 'stolen?', baseUrl: 'https://attacker.example' };
    const attempts = [
      { Origin: 'https://attacker.example' },
      { Origin: 'null' },
      { Origin: undefined },
      { 'Content-Type': 'text/plain' },
      { 'Content-Type': 'application/x-www-form-urlencoded' },
    ];
    for (const headers of attempts) {
      const res = await server.api('PUT', '/api/settings', attacker, headers);
      assert.ok([403, 415].includes(res.status), `${JSON.stringify(headers)} -> ${res.status}`);
    }
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { provider: 'cli' });
  });

  it('rejects anything that is not a JSON object', async () => {
    for (const body of ['[1,2]', 'null', '"text"', '42', '{broken', '']) {
      const res = await server.request({ method: 'PUT', path: '/api/settings', body, headers: { Origin: server.origin, 'Content-Type': 'application/json' } });
      assert.equal(res.status, 400, body);
      assert.ok(res.json().error, body);
    }
    assert.ok(!fs.existsSync(file));
  });

  it('reports a damaged settings file instead of crashing', async () => {
    fs.writeFileSync(file, '{"provider": "cli",');
    const res = await server.api('GET', '/api/settings');
    assert.equal(res.status, 500);
    assert.match(res.json().error, /settings\.json/);
    assert.ok(server.isRunning());
  });

  it('makes an existing, readable settings file private when saving (regression: 0644 stayed 0644)', async () => {
    fs.writeFileSync(file, '{}', { mode: 0o644 });
    fs.chmodSync(file, 0o644);
    assert.equal((await server.api('PUT', '/api/settings', SETTINGS)).status, 200);
    assertOnlyUserCanAccess(file);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), SETTINGS);
    assert.deepEqual(fs.readdirSync(server.dir).filter((name) => name.endsWith('.tmp')), [], 'no temporary file left');
  });
});

describe('settings in a folder that passes no access rights on (Windows)', { skip: process.platform !== 'win32' && 'Windows access lists only' }, () => {
  it('still leaves only the user with access (regression: SYSTEM and administrators kept access on a CI runner)', async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-noinherit-'));
    // Only the user, without (OI)(CI): new files get no inherited entries, so Windows gives them explicit ones.
    const sid = execFileSync(path.join(process.env.SystemRoot, 'System32', 'whoami.exe'), ['/user', '/fo', 'csv', '/nh'], { encoding: 'utf8' })
      .trim().split(',').pop().replaceAll('"', '');
    execFileSync(path.join(process.env.SystemRoot, 'System32', 'icacls.exe'), [dataDir, '/inheritance:r', '/grant:r', `*${sid}:F`]);
    const server = await startServer({ env: { PSEUDONYMIZER_DATA_DIR: dataDir } });
    try {
      const res = await server.api('PUT', '/api/settings', SETTINGS);
      assert.equal(res.status, 200, res.body);
      assertOnlyUserCanAccess(path.join(dataDir, 'settings.json'));
    } finally {
      await server.close();
      fs.rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
