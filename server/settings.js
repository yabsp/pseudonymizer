import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { HttpError, readJson, requireFromApp, send } from './http.js';

// The texts the Settings tab edits, each a file in prompts/: <name>.<ext> is the user's own version (in the data
// folder), <name>.default.<ext> the shipped one, which is never written.
const PROMPT_FILES = ['gliner-labels.txt', 'not-sensitive.txt', 'system.md'];
const MAX_PROMPT_CHARS = 1024 * 1024;

/**
 * Written to a new file next to it (readable by the user only, where the system has file modes), then renamed over
 * the old one. If anything fails, the old file stays as it was.
 */
function writePrivately(file, content) {
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(temporary, content, { mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}

function readSettings(file) {
  let data;
  try {
    data = fs.readFileSync(file, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw new HttpError(500, `settings.json could not be read (${e.code}).`);
  }
  try {
    return JSON.parse(data);
  } catch {
    throw new HttpError(500, 'settings.json is not valid JSON. Fix or delete the file.');
  }
}

const defaultNameOf = (file) => file.replace('.', '.default.');

/** One text for the Settings tab: the user's own file if there is one, otherwise the shipped default. */
function readPrompt(config, file) {
  const candidates = [path.join(config.userPromptsDir, file), path.join(config.promptsDir, defaultNameOf(file))];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return { name: file, file: 'prompts/' + path.basename(candidate), text: fs.readFileSync(candidate, 'utf8') };
  }
  throw new HttpError(500, `Missing file: prompts/${file} or prompts/${defaultNameOf(file)}.`);
}

export function settingsRoutes(app) {
  const { config } = app;
  return [
    { method: 'GET', path: '/api/settings', handler: (req, res) => send(res, 200, readSettings(config.settingsFile)) },
    {
      method: 'PUT',
      path: '/api/settings',
      async handler(req, res) {
        requireFromApp(req, app.port);
        const settings = await readJson(req, config.maxJsonBytes);
        writePrivately(config.settingsFile, JSON.stringify(settings, null, 2) + '\n');
        send(res, 200, { file: path.basename(config.settingsFile) });
      },
    },
    { method: 'GET', path: '/api/prompts', handler: (req, res) => send(res, 200, PROMPT_FILES.map((file) => readPrompt(config, file))) },
    {
      // /api/prompts/<file>, a file name such as "system.md", checked against the list above
      method: 'PUT',
      path: /^\/api\/prompts\/([\w.-]+)$/,
      async handler(req, res, file) {
        requireFromApp(req, app.port);
        if (!PROMPT_FILES.includes(file)) throw new HttpError(404, `Unknown file, expected one of ${PROMPT_FILES.join(', ')}.`);
        const { text } = await readJson(req, config.maxJsonBytes);
        if (typeof text !== 'string') throw new HttpError(400, '"text" must be a string.');
        if (text.length > MAX_PROMPT_CHARS) throw new HttpError(400, 'The text is longer than 1 million characters.');
        writePrivately(path.join(config.userPromptsDir, file), text);
        send(res, 200, { file: 'prompts/' + file });
      },
    },
  ];
}
