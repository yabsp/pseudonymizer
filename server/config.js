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
// The desktop app keeps settings in the user's app data folder, as its program folder is read-only.
const dataDir = process.env.PSEUDONYMIZER_DATA_DIR || ROOT;
if (!path.isAbsolute(dataDir)) throw new Error(`PSEUDONYMIZER_DATA_DIR must be an absolute path, not "${dataDir}".`);
export const SETTINGS_FILE = path.join(dataDir, 'settings.json');
export const GLINER_HELPER = path.join(ROOT, 'python', 'gliner_helper.py');
export const DOCUMENT_EXTRACTOR = path.join(ROOT, 'python', 'document_extraction.py');

const venvPython = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
export const GLINER_PYTHON = process.env.GLINER_PYTHON || (fs.existsSync(venvPython) ? venvPython : 'python3');

// The desktop app ships the helper as one program (PyInstaller), started without Python or a script argument.
const bundledHelper = process.env.DETECTION_HELPER;
if (bundledHelper && !fs.existsSync(bundledHelper)) throw new Error(`DETECTION_HELPER points to "${bundledHelper}", which does not exist.`);
// cwd: the bundled helper runs in its own folder, since the desktop app's ROOT is inside an archive (app.asar).
export const HELPER_COMMAND = bundledHelper
  ? { command: bundledHelper, args: [], cwd: path.dirname(bundledHelper) }
  : { command: GLINER_PYTHON, args: [GLINER_HELPER], cwd: ROOT };
// The same bundled program extracts documents when started with --extract-document.
export const DOCUMENT_COMMAND = bundledHelper
  ? { command: bundledHelper, args: ['--extract-document'], cwd: path.dirname(bundledHelper) }
  : { command: GLINER_PYTHON, args: [DOCUMENT_EXTRACTOR], cwd: ROOT };
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const DOCUMENT_TIMEOUT_MS = 30 * 60 * 1000;

// "desktop" when started by the desktop app (desktop/main.js), which ships GLiNER but not Presidio.
const appKind = process.env.PSEUDONYMIZER_APP || 'server';
if (!['server', 'desktop'].includes(appKind)) throw new Error(`PSEUDONYMIZER_APP must be "server" or "desktop", not "${appKind}".`);
export const APP_KIND = appKind;
export const AVAILABLE_DETECTORS = appKind === 'desktop' ? ['gliner', 'ollama'] : ['gliner', 'presidio', 'ollama'];
// The desktop app's helper doesn't contain Docling yet, so it can't open PDFs.
export const DOCUMENT_FORMATS = appKind === 'desktop' ? [] : ['pdf'];

export const CLI_TIMEOUT_MS = 10 * 60 * 1000;

export const ALLOWED_HOSTS = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
export const ALLOWED_ORIGINS = ALLOWED_HOSTS.map((host) => 'http://' + host);
