import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createCli } from './cli.js';
import { readConfig, VERSION } from './config.js';
import { createDetection, detectRoutes } from './detect.js';
import { HttpError, isAllowedHost, send } from './http.js';
import { settingsRoutes } from './settings.js';
import { serveStatic } from './static.js';

// The name of a language package of the text recognition: lower-case letters and "_" ("deu", "chi_sim").
const LANGUAGE_CODE = /^[a-z_]+$/;

/** The languages scanned pages can be read in: the installed language packages (@tesseract.js-data/<code>). */
function ocrLanguages(config) {
  const { tesseract, tessdata } = config.vendorDirs;
  if (!fs.existsSync(path.join(tesseract, 'worker.min.js')) || !fs.existsSync(tessdata)) return [];
  return fs.readdirSync(tessdata)
    .filter((code) => LANGUAGE_CODE.test(code) && fs.existsSync(path.join(tessdata, code, '4.0.0_best_int', `${code}.traineddata.gz`)))
    .sort();
}

/**
 * The local server: the page, its settings, detection and the AI tools. Nothing starts until listen(). overrides
 * replace parts in tests: { loadModel }.
 */
export function createApp(config = readConfig(), overrides = {}) {
  const app = { config, port: null };
  const detection = createDetection(config, overrides.loadModel);
  const cli = createCli(app);
  const aboutRoute = {
    method: 'GET',
    path: '/api/about',
    handler: (req, res) => send(res, 200, { version: VERSION, adapters: cli.listAdapters(), ocrLanguages: ocrLanguages(config) }),
  };
  // Every route of the API; a path is a string, or a regex whose groups are passed to the handler.
  const routes = [aboutRoute, ...settingsRoutes(app), ...detectRoutes(app, detection), ...cli.routes];

  function findRoute(method, pathname) {
    for (const route of routes) {
      if (route.method !== method) continue;
      if (route.path === pathname) return { route, params: [] };
      const match = route.path instanceof RegExp && pathname.match(route.path);
      if (match) return { route, params: match.slice(1) };
    }
    return null;
  }

  async function handleRequest(req, res) {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname.startsWith('/api/')) {
      if (!isAllowedHost(req, app.port)) throw new HttpError(403, 'Host not allowed.');
      const found = findRoute(req.method, pathname);
      if (found) return found.route.handler(req, res, ...found.params);
      throw new HttpError(routes.some((r) => r.path === pathname || (r.path instanceof RegExp && r.path.test(pathname))) ? 405 : 404, 'There is no such API route.');
    }
    if (req.method === 'GET') return serveStatic(config, req, res);
    throw new HttpError(405, 'Method not allowed.');
  }

  // One failing request must not stop the server. An expected problem is answered with its message; anything else
  // without details (they could contain content), and nothing is logged.
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((e) => {
      if (res.headersSent) return res.destroy();
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      send(res, 500, { error: 'The request failed.' });
    });
  });

  return {
    server,
    /** Resolves to the port once requests are accepted; port 0 in the configuration picks a free one. */
    listen: () => new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(config.port, '127.0.0.1', () => {
        app.port = server.address().port;
        resolve(app.port);
      });
    }),
    /** Stops everything: running AI tools, open connections, the loaded model. */
    async close() {
      cli.stopAll();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await detection.close();
    },
    /** For process 'exit', where nothing asynchronous runs any more. */
    stopNow: () => cli.stopAll(),
  };
}
