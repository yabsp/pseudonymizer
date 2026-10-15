import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
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
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
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

  it('KNOWN BUG: makes an existing, readable settings file private when saving', knownGap('writeFileSync only applies mode 0600 when it creates the file; an existing 0644 file keeps the API key world-readable'), async () => {
    fs.writeFileSync(file, '{}', { mode: 0o644 });
    fs.chmodSync(file, 0o644);
    await server.api('PUT', '/api/settings', SETTINGS);
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  });
});
