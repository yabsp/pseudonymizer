import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const port = Number(process.env.PORT || 8091);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`PORT must be a whole number between 1 and 65535, not "${process.env.PORT}".`);
}
export const PORT = port;

export const PUBLIC_DIR = path.join(ROOT, 'public');
export const PROMPTS_DIR = path.join(ROOT, 'prompts');
export const ADAPTERS_FILE = path.join(ROOT, 'config', 'adapters.json');
export const SETTINGS_FILE = path.join(ROOT, 'settings.json');
export const GLINER_HELPER = path.join(ROOT, 'python', 'gliner_helper.py');

const venvPython = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
export const GLINER_PYTHON = process.env.GLINER_PYTHON || (fs.existsSync(venvPython) ? venvPython : 'python3');

export const CLI_TIMEOUT_MS = 10 * 60 * 1000;

export const ALLOWED_HOSTS = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
export const ALLOWED_ORIGINS = ALLOWED_HOSTS.map((host) => 'http://' + host);
