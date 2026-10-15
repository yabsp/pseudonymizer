import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
import { ROOT, SETTINGS_FILE, startServer } from '../helpers/server.mjs';

describe('static files', () => {
  let server;
  before(async () => {
    server = await startServer({
      files: {
        [SETTINGS_FILE]: JSON.stringify({ apiKey: 'sk-ant-SECRET-test-key' }),
        '.venv/pyvenv.cfg': 'home = /usr/bin',
        '.claude/settings.local.json': '{"permissions":{}}',
      },
    });
  });
  after(() => server.close());

  it('serves the app', async () => {
    const page = await server.request({ path: '/' });
    assert.equal(page.status, 200);
    assert.match(page.headers['content-type'], /^text\/html/);
    assert.match(page.body, /<title>Pseudonymizer<\/title>/);
    const modules = fs.readdirSync(path.join(ROOT, 'public', 'js'), { recursive: true }).filter((f) => f.endsWith('.js'));
    assert.ok(modules.includes('main.js'));
    for (const file of modules) {
      const script = await server.request({ path: '/js/' + file.split(path.sep).join('/') });
      assert.equal(script.status, 200, file);
      assert.match(script.headers['content-type'], /^text\/javascript/, file);
    }
  });

  it('serves the logo for the browser tab as images (regression: SVG was sent as a download type)', async () => {
    const types = { '/favicon.svg': 'image/svg+xml; charset=utf-8', '/favicon.ico': 'image/x-icon', '/apple-touch-icon.png': 'image/png' };
    for (const [file, type] of Object.entries(types)) {
      const res = await server.request({ path: file });
      assert.equal(res.status, 200, file);
      assert.equal(res.headers['content-type'], type, file);
    }
    const page = await server.request({ path: '/' });
    assert.match(page.body, /<link rel="icon" href="favicon.svg" type="image\/svg\+xml">/);
  });

  it('serves the prompt files the app loads', async () => {
    const res = await server.request({ path: '/prompts/system.default.md' });
    assert.equal(res.status, 200);
    assert.match(res.body, /placeholder/i);
    const labels = await server.request({ path: '/prompts/gliner-labels.default.txt' });
    assert.equal(labels.status, 200);
    assert.match(labels.headers['content-type'], /^text\/plain/);
    assert.match(labels.body, /^person = PERSON$/m);
    const words = await server.request({ path: '/prompts/not-sensitive.default.txt' });
    assert.equal(words.status, 200);
    assert.match(words.body, /^ich$/m);
  });

  it('never serves files outside the project, however the path is encoded', async () => {
    const attempts = [
      '/../../../../../../etc/passwd',
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd',
      '/..%2f..%2f..%2f..%2f..%2fetc%2fpasswd',
      '/.%2e/.%2e/.%2e/.%2e/.%2e/etc/passwd',
      '/%252e%252e/%252e%252e/etc/passwd',
      '/prompts/../../../../../../etc/passwd',
      '//etc/passwd',
      '/..\\..\\..\\..\\etc\\passwd',
    ];
    for (const attempt of attempts) {
      const res = await server.request({ path: attempt });
      assert.notEqual(res.status, 200, attempt);
      assert.doesNotMatch(res.body, /root:/, attempt);
    }
  });

  it('never serves settings.json, which can hold the API key', async () => {
    for (const attempt of ['/settings.json', '/%73ettings.json', '/./settings.json', '/prompts/../settings.json', '/prompts/%2e%2e/settings.json']) {
      const res = await server.request({ path: attempt });
      assert.equal(res.status, 404, attempt);
      assert.doesNotMatch(res.body, /SECRET/, attempt);
    }
  });

  it('never serves hidden folders such as .venv and .claude', async () => {
    for (const attempt of ['/.venv/pyvenv.cfg', '/%2evenv/pyvenv.cfg', '/.claude/settings.local.json', '/prompts/../.claude/settings.local.json']) {
      assert.equal((await server.request({ path: attempt })).status, 404, attempt);
    }
  });

  it('does not serve server code, adapter configuration, the Python helper or project files', async () => {
    const files = [
      '/server/index.js', '/config/adapters.json', '/python/gliner_helper.py', '/package.json', '/AGENTS.md',
      '/server.js', '/adapters.json', '/gliner_helper.py', '/../server/index.js', '/prompts/../config/adapters.json',
    ];
    for (const file of files) assert.equal((await server.request({ path: file })).status, 404, file);
  });

  it('answers 404 for missing files and 405 for other methods', async () => {
    assert.equal((await server.request({ path: '/nope.js' })).status, 404);
    assert.equal((await server.request({ method: 'DELETE', path: '/js/main.js' })).status, 405);
  });

  it('rejects API requests addressed to another host name (DNS rebinding)', async () => {
    const res = await server.request({ path: '/api/settings', headers: { Host: `attacker.example:${server.port}` } });
    assert.equal(res.status, 403);
    assert.equal((await server.request({ path: '/api/settings', headers: { Host: `localhost:${server.port}` } })).status, 200);
  });
});

describe('malformed requests', () => {
  it('KNOWN BUG: a malformed URL does not crash the server', knownGap('decodeURIComponent throws on "%E0%A4%A" and the uncaught error stops the server; any web page can trigger it with an <img> tag'), async () => {
    const server = await startServer();
    try {
      const res = await server.request({ path: '/%E0%A4%A' }).catch((e) => ({ status: 0, error: e }));
      assert.equal(res.status, 400);
      assert.ok(server.isRunning(), 'server still running');
      assert.equal((await server.request({ path: '/' })).status, 200);
    } finally {
      await server.close();
    }
  });
});
