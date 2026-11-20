// Tests run the app's server in this process on a free port, with a data folder of their own, so they never touch
// the real settings.json, the real AI tools or the real model.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfig } from '../../server/config.js';
import { createApp } from '../../server/index.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const FIXTURES = path.join(ROOT, 'tests', 'fixtures');

/**
 * A stand-in for the detection model: "finds" every text of entities that is in the text it is given.
 * entities: [{ text, label, score? }]. A text containing "SLOW" takes until its signal is aborted.
 */
export function fakeModel(entities = [], { name = 'Stand-in model', loads = { count: 0 } } = {}) {
  return async (modelDir, options) => {
    loads.count++;
    loads.options = options;
    return {
      name,
      device: { name: 'cpu', label: 'the processor' },
      async detect(text, labels, threshold, signal) {
        if (text.includes('SLOW')) {
          await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
        }
        return entities
          .filter((e) => text.includes(e.text) && labels.includes(e.label) && (e.score ?? 0.9) >= threshold)
          .map((e) => ({ text: e.text, label: e.label, start: text.indexOf(e.text), end: text.indexOf(e.text) + e.text.length, score: e.score ?? 0.9 }));
      },
      release: async () => {},
    };
  };
}

/**
 * Starts a server. adapters: the content of adapters.json (an object, or a string for a broken file); env: extra
 * environment for readConfig; loadModel: replaces the detection model (default: one that finds nothing).
 */
export async function startServer({ adapters = {}, env = {}, loadModel = fakeModel(), config: overrides = {} } = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-test-'));
  const adaptersFile = path.join(dataDir, 'adapters.json');
  fs.writeFileSync(adaptersFile, typeof adapters === 'string' ? adapters : JSON.stringify(adapters));
  const config = { ...readConfig({ PORT: '0', PSEUDONYMIZER_DATA_DIR: dataDir, ...env }), adaptersFile, ...overrides };
  const app = createApp(config, { loadModel });
  const port = await app.listen();
  const origin = `http://localhost:${port}`;
  return {
    port,
    origin,
    dataDir,
    config,
    request: (options) => request(port, options),
    // As the page sends it; a header set to undefined is left out.
    api: (method, urlPath, body, headers = {}) => request(port, {
      method, path: urlPath, body: body === undefined ? undefined : JSON.stringify(body),
      headers: Object.fromEntries(Object.entries({ Origin: origin, 'Content-Type': 'application/json', ...headers }).filter(([, v]) => v !== undefined)),
    }),
    async close() {
      await app.close();
      fs.rmSync(dataDir, { recursive: true, force: true, maxRetries: 10 });
    },
  };
}

// Not fetch: fetch normalises ".." in paths and doesn't allow setting the Host header.
export function request(port, { method = 'GET', path: urlPath = '/', headers = {}, body, signal } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: urlPath, headers: { Host: `localhost:${port}`, ...headers }, signal }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, body: data, json: () => JSON.parse(data) });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}
