import fs from 'node:fs';
import path from 'node:path';
import { PROMPTS_DIR, PUBLIC_DIR, USER_PROMPTS_DIR } from './config.js';
import { send } from './http.js';

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown', '.json': 'application/json', '.txt': 'text/plain',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

const isInside = (dir, file) => file.startsWith(dir + path.sep);
const isHidden = (dir, file) => path.relative(dir, file).split(path.sep).some((part) => part.startsWith('.'));

function resolveFile(pathname) {
  const [dir, rest] = pathname.startsWith('/prompts/') ? [PROMPTS_DIR, pathname.slice('/prompts'.length)] : [PUBLIC_DIR, pathname];
  const urlPath = decodeURIComponent(rest);
  return { dir, file: path.resolve(dir, '.' + (urlPath === '/' ? '/index.html' : urlPath)) };
}

/** A prompt file the user saved (in the data folder) wins over the shipped one of the same name. */
function userPromptFile(dir, file) {
  if (dir !== PROMPTS_DIR || USER_PROMPTS_DIR === PROMPTS_DIR) return null;
  const userFile = path.join(USER_PROMPTS_DIR, path.relative(PROMPTS_DIR, file));
  return fs.existsSync(userFile) ? userFile : null;
}

export function serveStatic(req, res) {
  const { dir, file } = resolveFile(new URL(req.url, 'http://x').pathname);
  if (!isInside(dir, file)) return send(res, 403, 'Forbidden', 'text/plain');
  if (isHidden(dir, file)) return send(res, 404, 'Not found', 'text/plain');
  const served = userPromptFile(dir, file) ?? file;
  fs.readFile(served, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, data, TYPES[path.extname(served)] || 'application/octet-stream');
  });
}
