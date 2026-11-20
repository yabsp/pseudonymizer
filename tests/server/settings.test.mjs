import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { startServer } from '../helpers/server.mjs';

const SETTINGS = { threshold: '0.4', cliAdapter: 'claude-code', model: 'claude-opus-5-5', ocr: true };

describe('settings API', () => {
  let server;
  let file;
  beforeEach(async () => {
    server = await startServer();
    file = path.join(server.dataDir, 'settings.json');
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
    if (process.platform !== 'win32') assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    assert.deepEqual((await server.api('GET', '/api/settings')).json(), SETTINGS);
    assert.deepEqual(fs.readdirSync(server.dataDir).filter((name) => name.endsWith('.tmp')), [], 'no temporary file left');
  });

  it('refuses writes from other websites and simple cross-site form posts', async () => {
    fs.writeFileSync(file, JSON.stringify({ cliAdapter: 'codex' }));
    const attempts = [
      { Origin: 'https://attacker.example' },
      { Origin: 'null' },
      { Origin: undefined },
      { 'Content-Type': 'text/plain' },
      { 'Content-Type': 'application/x-www-form-urlencoded' },
    ];
    for (const headers of attempts) {
      const res = await server.api('PUT', '/api/settings', { cliAdapter: 'evil' }, headers);
      assert.ok([403, 415].includes(res.status), `${JSON.stringify(headers)} -> ${res.status}`);
    }
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { cliAdapter: 'codex' });
  });

  it('rejects anything that is not a JSON object', async () => {
    for (const body of ['[1,2]', 'null', '"text"', '42', '{broken', '']) {
      const res = await server.request({ method: 'PUT', path: '/api/settings', body, headers: { Origin: server.origin, 'Content-Type': 'application/json' } });
      assert.equal(res.status, 400, body);
      assert.ok(res.json().error, body);
    }
    assert.ok(!fs.existsSync(file));
  });

  it('rejects a request that is larger than the limit instead of reading it all', async () => {
    const small = await startServer({ config: { maxJsonBytes: 1000 } });
    try {
      const res = await small.api('PUT', '/api/settings', { text: 'x'.repeat(5000) });
      assert.equal(res.status, 413);
    } finally {
      await small.close();
    }
  });

  it('reports a damaged settings file instead of crashing', async () => {
    fs.writeFileSync(file, '{"cliAdapter": "codex",');
    const res = await server.api('GET', '/api/settings');
    assert.equal(res.status, 500);
    assert.match(res.json().error, /settings\.json/);
    assert.equal((await server.api('GET', '/api/about')).status, 200, 'the server keeps running');
  });
});

describe('texts of the Settings tab', () => {
  let server;
  beforeEach(async () => {
    server = await startServer();
  });
  afterEach(() => server.close());

  it('gives the shipped texts until the user saves their own', async () => {
    const files = (await server.api('GET', '/api/prompts')).json();
    assert.deepEqual(files.map((f) => [f.name, f.file]), [
      ['gliner-labels.txt', 'prompts/gliner-labels.default.txt'], ['not-sensitive.txt', 'prompts/not-sensitive.default.txt'], ['system.md', 'prompts/system.default.md'],
    ]);
    assert.match(files[0].text, /person = PERSON/);
    assert.match(files[2].text, /\[\[PERSON_1\]\]/);
  });

  it('saves a text into the data folder, where it wins over the shipped one, which stays as it is', async () => {
    const saved = await server.api('PUT', '/api/prompts/system.md', { text: 'Antworte auf Deutsch.\n' });
    assert.equal(saved.status, 200, saved.body);
    assert.deepEqual(saved.json(), { file: 'prompts/system.md' });
    assert.equal(fs.readFileSync(path.join(server.dataDir, 'prompts', 'system.md'), 'utf8'), 'Antworte auf Deutsch.\n');
    const system = (await server.api('GET', '/api/prompts')).json().find((f) => f.name === 'system.md');
    assert.deepEqual([system.file, system.text], ['prompts/system.md', 'Antworte auf Deutsch.\n']);
    assert.match(fs.readFileSync(path.join(server.config.promptsDir, 'system.default.md'), 'utf8'), /placeholders/);
  });

  it('only writes the files it knows, and only text', async () => {
    for (const name of ['evil.md', 'system.default.md', '..%2Fsettings.json', 'gliner-labels.txt.bak']) {
      assert.equal((await server.api('PUT', '/api/prompts/' + name, { text: 'x' })).status, 404, name);
    }
    assert.equal((await server.api('PUT', '/api/prompts/system.md', { text: 5 })).status, 400);
    assert.equal((await server.api('PUT', '/api/prompts/system.md', { text: 'x' }, { Origin: 'https://attacker.example' })).status, 403);
    assert.ok(!fs.existsSync(path.join(server.dataDir, 'prompts')));
  });
});
