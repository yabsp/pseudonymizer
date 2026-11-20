import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { ROOT, startServer } from '../helpers/server.mjs';

describe('static files', () => {
  let server;
  before(async () => {
    server = await startServer();
    fs.writeFileSync(path.join(server.dataDir, 'settings.json'), JSON.stringify({ note: 'PRIVATE-SETTING' }));
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

  it('every module the page loads exists (regression guard for moved files)', async () => {
    // An import in a module: "from './x.js'" or "import('./x.js')", the path in group 1.
    const IMPORT = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;
    const dir = path.join(ROOT, 'public', 'js');
    for (const file of fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.js'))) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      for (const [, target] of source.matchAll(IMPORT)) {
        assert.ok(fs.existsSync(path.resolve(dir, path.dirname(file), target)), `${file} imports ${target}`);
      }
    }
  });

  it('serves the logo for the browser tab as images (regression: SVG was sent as a download type)', async () => {
    const types = { '/favicon.svg': 'image/svg+xml; charset=utf-8', '/favicon.ico': 'image/x-icon', '/apple-touch-icon.png': 'image/png' };
    for (const [file, type] of Object.entries(types)) {
      const res = await server.request({ path: file });
      assert.equal(res.status, 200, file);
      assert.equal(res.headers['content-type'], type, file);
    }
  });

  it('tells the browser that the page may only talk to this server', async () => {
    const page = await server.request({ path: '/' });
    const policy = page.headers['content-security-policy'];
    assert.match(policy, /default-src 'self'/);
    assert.match(policy, /connect-src 'self'/);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.doesNotMatch(policy, /https?:|\*|'unsafe-inline'|'unsafe-eval'/);
    assert.equal(page.headers['access-control-allow-origin'], undefined, 'no CORS');
    assert.equal(page.headers['x-content-type-options'], 'nosniff');
  });

  it('serves the PDF reader and the text recognition from the installed packages', { skip: !fs.existsSync(path.join(ROOT, 'node_modules', 'pdfjs-dist')) && 'run "npm run setup" first' }, async () => {
    for (const file of ['/vendor/pdfjs/build/pdf.min.mjs', '/vendor/pdfjs/build/pdf.worker.min.mjs', '/vendor/tesseract/worker.min.js', '/vendor/tessdata/deu.traineddata.gz', '/vendor/tessdata/fra.traineddata.gz']) {
      assert.equal((await server.request({ path: file })).status, 200, file);
    }
    assert.match((await server.request({ path: '/vendor/pdfjs/build/pdf.min.mjs' })).headers['content-type'], /^text\/javascript/);
    for (const file of ['/vendor/pdfjs/package.json/../../onnxruntime-node/package.json', '/vendor/onnxruntime-node/package.json', '/vendor/', '/vendor/pdfjs/%2e%2e/%2e%2e/package.json', '/vendor/__proto__/x', '/vendor/tessdata/xx.traineddata.gz', '/vendor/tessdata/..%2f..%2fpackage.json']) {
      assert.notEqual((await server.request({ path: file })).status, 200, file);
    }
  });

  it('never serves files outside the public folder, however the path is encoded', async () => {
    const attempts = [
      '/../../../../../../etc/passwd',
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd',
      '/..%2f..%2f..%2f..%2f..%2fetc%2fpasswd',
      '/.%2e/.%2e/.%2e/.%2e/.%2e/etc/passwd',
      '/%252e%252e/%252e%252e/etc/passwd',
      '/vendor/pdfjs/../../../../../../etc/passwd',
      '//etc/passwd',
      '/..\\..\\..\\..\\etc\\passwd',
    ];
    for (const attempt of attempts) {
      const res = await server.request({ path: attempt });
      assert.notEqual(res.status, 200, attempt);
      assert.doesNotMatch(res.body, /root:/, attempt);
    }
  });

  it('does not serve settings, server code, configuration, texts or project files', async () => {
    const files = [
      '/settings.json', '/%73ettings.json', '/./settings.json', '/server/index.js', '/config/adapters.json', '/package.json', '/AGENTS.md',
      '/app.js', '/adapters.json', '/../server/index.js', '/prompts/system.default.md', '/models/gliner/model.json', '/.npmrc', '/.git/config',
    ];
    for (const file of files) {
      const res = await server.request({ path: file });
      assert.equal(res.status, 404, file);
      assert.doesNotMatch(res.body, /PRIVATE-SETTING/, file);
    }
  });

  it('answers 404 for missing files and 405 for other methods', async () => {
    assert.equal((await server.request({ path: '/nope.js' })).status, 404);
    assert.equal((await server.request({ method: 'DELETE', path: '/js/main.js' })).status, 405);
    assert.equal((await server.request({ path: '/api/nothing' })).status, 404);
    assert.equal((await server.request({ method: 'DELETE', path: '/api/settings' })).status, 405);
  });

  it('rejects API requests addressed to another host name (DNS rebinding)', async () => {
    const res = await server.request({ path: '/api/settings', headers: { Host: `attacker.example:${server.port}` } });
    assert.equal(res.status, 403);
    assert.equal((await server.request({ path: '/api/settings', headers: { Host: `localhost:${server.port}` } })).status, 200);
    assert.equal((await server.request({ path: '/api/settings', headers: { Host: `127.0.0.1:${server.port}` } })).status, 200);
  });

  it('a malformed URL does not stop the server', async () => {
    assert.equal((await server.request({ path: '/%E0%A4%A' })).status, 400);
    assert.equal((await server.request({ path: '/' })).status, 200);
  });

  it('says what the app has: version, AI tools, languages for scanned pages', async () => {
    const about = (await server.api('GET', '/api/about')).json();
    assert.match(about.version, /^\d+\.\d+\.\d+$/);
    assert.deepEqual(about.adapters, []);
    assert.ok(Array.isArray(about.ocrLanguages));
  });
});
