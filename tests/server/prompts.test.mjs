import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { assertOnlyUserCanAccess } from '../helpers/file-access.mjs';
import { startServer } from '../helpers/server.mjs';

const RULES = '# Regeln\nVerstecke alle Namen, auch "Hans Muster".\n';

describe('saving prompt files', () => {
  describe('in the project folder (npm start)', () => {
    let server;
    before(async () => (server = await startServer()));
    after(async () => server.close());

    it('saves an override next to the default, which stays as shipped, and serves it from then on', async () => {
      const defaults = fs.readFileSync(path.join(server.dir, 'prompts', 'rules.default.md'), 'utf8');
      const res = await server.api('PUT', '/api/prompts/rules.md', { text: RULES });
      assert.equal(res.status, 200, res.body);
      assert.deepEqual(res.json(), { file: 'prompts/rules.md' });
      assert.equal(fs.readFileSync(path.join(server.dir, 'prompts', 'rules.md'), 'utf8'), RULES);
      assert.equal(fs.readFileSync(path.join(server.dir, 'prompts', 'rules.default.md'), 'utf8'), defaults);
      assert.equal((await server.request({ path: '/prompts/rules.md' })).body, RULES);
      assertOnlyUserCanAccess(path.join(server.dir, 'prompts', 'rules.md'));
    });

    it('refuses other file names, defaults, paths, bad bodies and other sites', async () => {
      for (const name of ['rules.default.md', 'other.md', '..%2Fsettings.json', 'README.md']) {
        const { status } = await server.api('PUT', '/api/prompts/' + name, { text: 'x' });
        assert.ok(status === 404 || status === 405, `${name}: ${status}`); // 405: no route matches a path with "%"
      }
      assert.equal((await server.api('PUT', '/api/prompts/system.md', { text: 3 })).status, 400);
      assert.equal((await server.api('PUT', '/api/prompts/system.md', { text: 'x' }, { Origin: 'https://attacker.example' })).status, 403);
      assert.equal((await server.api('PUT', '/api/prompts/system.md', { text: 'x' }, { 'Content-Type': 'text/plain' })).status, 415);
      assert.ok(!fs.existsSync(path.join(server.dir, 'prompts', 'system.md')));
    });
  });

  describe('in the data folder (desktop app, whose program files are read-only)', () => {
    let server;
    let dataDir;
    before(async () => {
      dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-data-'));
      server = await startServer({ env: { PSEUDONYMIZER_DATA_DIR: dataDir } });
    });
    after(async () => {
      await server.close();
      fs.rmSync(dataDir, { recursive: true, force: true });
    });

    it('saves to the data folder and serves the saved file before the program\'s own', async () => {
      assert.equal((await server.request({ path: '/prompts/rules.md' })).status, 404, 'no override yet');
      assert.equal((await server.api('PUT', '/api/prompts/rules.md', { text: RULES })).status, 200);
      assert.equal(fs.readFileSync(path.join(dataDir, 'prompts', 'rules.md'), 'utf8'), RULES);
      assert.ok(!fs.existsSync(path.join(server.dir, 'prompts', 'rules.md')), 'program folder untouched');
      assert.equal((await server.request({ path: '/prompts/rules.md' })).body, RULES);
      assert.match((await server.request({ path: '/prompts/rules.default.md' })).body, /\S/);
    });
  });
});
