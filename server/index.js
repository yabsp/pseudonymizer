import http from 'node:http';
import { getAbout } from './about.js';
import { handleCli, listAdapters } from './cli.js';
import { PORT } from './config.js';
import { handleExtractPdf } from './documents.js';
import { handleGliner, handleHardware, handlePresidio } from './gliner.js';
import { isAllowedHost, send } from './http.js';
import { addJob, getJob, listJobs, moveJob, removeJob } from './jobs.js';
import { savePrompt } from './prompts.js';
import { getSettings, saveSettings } from './settings.js';
import { serveStatic } from './static.js';

const ROUTES = [
  { method: 'GET', path: '/api/about', handler: getAbout },
  { method: 'GET', path: '/api/settings', handler: getSettings },
  { method: 'PUT', path: '/api/settings', handler: saveSettings },
  { method: 'GET', path: '/api/adapters', handler: listAdapters },
  { method: 'POST', path: '/api/detect/gliner', handler: handleGliner },
  { method: 'POST', path: '/api/detect/presidio', handler: handlePresidio },
  { method: 'POST', path: '/api/extract/pdf', handler: handleExtractPdf },
  { method: 'POST', path: '/api/jobs', handler: addJob },
  { method: 'GET', path: '/api/jobs', handler: listJobs },
  // /api/jobs/<job id>, the id a UUID made of hex digits and "-"; the id is passed to the handler
  { method: 'GET', path: /^\/api\/jobs\/([\da-f-]+)$/, handler: getJob },
  { method: 'DELETE', path: /^\/api\/jobs\/([\da-f-]+)$/, handler: removeJob },
  // /api/jobs/<job id>/move, the id as above
  { method: 'POST', path: /^\/api\/jobs\/([\da-f-]+)\/move$/, handler: moveJob },
  // /api/prompts/<file>, a file name such as "rules.md"; savePrompt checks it against its list
  { method: 'PUT', path: /^\/api\/prompts\/([\w.-]+)$/, handler: savePrompt },
  { method: 'POST', path: '/api/hardware', handler: handleHardware },
  // /api/cli/<adapter id>, the id made of letters, digits, "_" or "-"; the id is passed to the handler
  { method: 'POST', path: /^\/api\/cli\/([\w-]+)$/, handler: handleCli },
];

function findRoute(method, pathname) {
  for (const route of ROUTES) {
    if (route.method !== method) continue;
    if (route.path === pathname) return { route, params: [] };
    const match = route.path instanceof RegExp && pathname.match(route.path);
    if (match) return { route, params: match.slice(1) };
  }
  return null;
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  if (pathname.startsWith('/api/') && !isAllowedHost(req)) return send(res, 403, { error: 'Host not allowed.' });
  const found = findRoute(req.method, pathname);
  if (found) return found.route.handler(req, res, ...found.params);
  if (req.method === 'GET') return serveStatic(req, res);
  send(res, 405, { error: 'Method not allowed.' });
});

/** Resolves once the server accepts requests; the desktop app waits for it before opening its window. */
export const listening = new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Pseudonymizer running at http://localhost:${PORT}`);
    resolve(PORT);
  });
});
