import fs from 'node:fs';
import path from 'node:path';
import { USER_PROMPTS_DIR } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';
import { writePrivately } from './settings.js';

// The prompt files the Prompts tab edits (public/js/ui/prompts-panel.js); the shipped defaults are never written.
const PROMPT_FILES = ['gliner-labels.txt', 'not-sensitive.txt', 'rules.md', 'detection.md', 'system.md'];
const MAX_PROMPT_CHARS = 1024 * 1024;

/** Saves the Prompts tab's text as prompts/<file> in the data folder, readable by the user only. */
export async function savePrompt(req, res, file) {
  if (rejectUnlessFromApp(req, res)) return;
  if (!PROMPT_FILES.includes(file)) return send(res, 404, { error: `Unknown prompt file, expected one of ${PROMPT_FILES.join(', ')}.` });
  let text;
  try {
    ({ text } = JSON.parse(await readBody(req)));
    if (typeof text !== 'string') throw new Error('"text" must be a string.');
    if (text.length > MAX_PROMPT_CHARS) throw new Error('The prompt is longer than 1 million characters.');
  } catch (e) {
    return send(res, 400, { error: e.message });
  }
  try {
    fs.mkdirSync(USER_PROMPTS_DIR, { recursive: true });
    await writePrivately(path.join(USER_PROMPTS_DIR, file), text);
    send(res, 200, { file: 'prompts/' + file });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}
