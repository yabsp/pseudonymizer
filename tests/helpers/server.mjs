// Tests run the server from a temporary copy of the project, so they never touch the real settings.json
// or adapters.json and can replace the CLIs and GLiNER with fakes.
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PYTHON } from './python.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const FIXTURES = path.join(ROOT, 'tests', 'fixtures');

const PROJECT_FILES = ['package.json', 'server', 'public', 'prompts', 'python', 'config'];
const SERVER_ENTRY = 'server/index.js';
export const ADAPTERS_FILE = 'config/adapters.json';
export const SETTINGS_FILE = 'settings.json';
export const GLINER_HELPER = path.join(ROOT, 'python', 'gliner_helper.py');
// For startServer's files: the copy's document reader replaced by a fake that needs no Docling.
export const FAKE_DOCUMENT_READER = {
  'python/document_extraction.py': fs.readFileSync(path.join(FIXTURES, 'fake_document_extraction.py'), 'utf8'),
};

const IS_WINDOWS = process.platform === 'win32';
const TASKKILL = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
const FOLDER_IN_USE = ['EBUSY', 'EPERM', 'ENOTEMPTY'];

/** Windows keeps a folder in use for a moment after the processes in it ended. */
async function removeFolder(dir) {
  for (let attempt = 1; ; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (e) {
      if (!FOLDER_IN_USE.includes(e.code) || attempt === 50) throw e;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function freePort() {
  const probe = net.createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address();
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

/** files: { 'path/relative/to/root': 'content' }, created in the copy after the project files. */
export async function startServer({ adapters = {}, env = {}, files = {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-test-'));
  for (const f of PROJECT_FILES) fs.cpSync(path.join(ROOT, f), path.join(dir, f), { recursive: true });
  fs.writeFileSync(path.join(dir, ADAPTERS_FILE), JSON.stringify(adapters));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }

  const port = await freePort();
  const child = spawn(process.execPath, [path.join(dir, SERVER_ENTRY)], {
    env: { ...process.env, PORT: String(port), GLINER_PYTHON: PYTHON, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start: ' + output)), 10000);
    child.stdout.on('data', (d) => { output += d; if (/running at/.test(output)) { clearTimeout(timer); resolve(); } });
    child.stderr.on('data', (d) => (output += d));
    child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`server exited with ${code}: ${output}`)); });
  });

  const origin = `http://localhost:${port}`;
  return {
    dir,
    port,
    origin,
    child,
    output: () => output,
    isRunning: () => child.exitCode === null && child.signalCode === null,
    request: (options) => request(port, options),
    // As the app sends it; a header set to undefined is left out.
    api: (method, urlPath, body, headers = {}) => request(port, {
      method, path: urlPath, body: body === undefined ? undefined : JSON.stringify(body),
      headers: Object.fromEntries(Object.entries({ Origin: origin, 'Content-Type': 'application/json', ...headers }).filter(([, v]) => v !== undefined)),
    }),
    async close() {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = new Promise((resolve) => child.once('exit', resolve));
        // On Windows, ending the server leaves the helpers it started running until they notice, and they keep
        // the copy's folder in use, so the whole tree is ended.
        if (IS_WINDOWS) spawnSync(TASKKILL, ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        else child.kill();
        await exited;
      }
      await removeFolder(dir);
    },
  };
}

// Not fetch: fetch normalises ".." in paths and doesn't allow setting the Host header.
export function request(port, { method = 'GET', path: urlPath = '/', headers = {}, body, signal } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: urlPath, headers, signal }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data,
        json: () => JSON.parse(data),
      }));
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}
