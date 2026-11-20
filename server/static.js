import fs from 'node:fs';
import path from 'node:path';
import { send } from './http.js';

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown',
  '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

// What the page may do, enforced by the browser: load code, styles and data only from this server, and talk to
// nothing else. 'wasm-unsafe-eval' lets the PDF reader and the text recognition compile their WebAssembly;
// blob: and data: are pictures and fonts the PDF reader builds in the page itself.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'", "script-src 'self' 'wasm-unsafe-eval'", "worker-src 'self' blob:", "style-src 'self'",
  "img-src 'self' data: blob:", "font-src 'self' data: blob:", "connect-src 'self' data: blob:", "object-src 'none'", "base-uri 'none'",
  "form-action 'none'", "frame-ancestors 'none'",
].join('; ');
const PAGE_HEADERS = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

// A language file as the text recognition asks for it: "<code>.traineddata.gz", the code (lower-case letters and
// "_", e.g. "deu") in group 1.
const LANGUAGE_FILE = /^([a-z_]+)\.traineddata\.gz$/;

const isInside = (dir, file) => file.startsWith(dir + path.sep);
const isHidden = (dir, file) => path.relative(dir, file).split(path.sep).some((part) => part.startsWith('.'));

/**
 * The folder and file a path asks for: /vendor/<name>/<file> from an installed package, everything else from
 * public/. Throws URIError for a malformed escape such as "%E0%A4%A".
 */
function resolveFile(config, pathname) {
  const urlPath = decodeURIComponent(pathname);
  const [, first, second, ...rest] = urlPath.split('/');
  if (first === 'vendor') {
    const dir = Object.hasOwn(config.vendorDirs, second ?? '') ? config.vendorDirs[second] : null;
    if (!dir) return null;
    // The text recognition asks for every language in one folder; each comes in a package of its own.
    const language = second === 'tessdata' && rest.length === 1 ? LANGUAGE_FILE.exec(rest[0])?.[1] : null;
    const inside = language ? `${language}/4.0.0_best_int/${language}.traineddata.gz` : rest.join('/');
    return { dir, file: path.resolve(dir, './' + inside) };
  }
  return { dir: config.publicDir, file: path.resolve(config.publicDir, '.' + (urlPath === '/' ? '/index.html' : urlPath)) };
}

export function serveStatic(config, req, res) {
  let found;
  try {
    found = resolveFile(config, new URL(req.url, 'http://x').pathname);
  } catch (e) {
    if (e instanceof URIError) return send(res, 400, 'Malformed URL', 'text/plain');
    throw e;
  }
  if (!found) return send(res, 404, 'Not found', 'text/plain');
  const { dir, file } = found;
  if (!isInside(dir, file)) return send(res, 403, 'Forbidden', 'text/plain');
  if (isHidden(dir, file)) return send(res, 404, 'Not found', 'text/plain');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, data, TYPES[path.extname(file)] || 'application/octet-stream', PAGE_HEADERS);
  });
}
