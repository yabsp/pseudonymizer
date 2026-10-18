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
// Prompt files the user changed (prompts/<name>.<ext>): next to settings.json, so the desktop app can save them.
export const USER_PROMPTS_DIR = path.join(dataDir, 'prompts');
export const GLINER_HELPER = path.join(ROOT, 'python', 'gliner_helper.py');
export const DOCUMENT_EXTRACTOR = path.join(ROOT, 'python', 'document_extraction.py');

const venvPython = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
// Without .venv, the system's Python: "python" on Windows, where "python3" is often only the Microsoft Store's stand-in.
const systemPython = process.platform === 'win32' ? 'python' : 'python3';
export const GLINER_PYTHON = process.env.GLINER_PYTHON || (fs.existsSync(venvPython) ? venvPython : systemPython);

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
// The Documents list (server/jobs.js): text files as the browser's text importer allows, at most this many
// documents in the list, and at most this much uploaded and not yet converted, held in memory.
export const MAX_TEXT_BYTES = 5 * 1024 * 1024;
export const MAX_JOBS = 50;
export const MAX_WAITING_BYTES = 500 * 1024 * 1024;

// "desktop" when started by the desktop app (desktop/main.js), which ships GLiNER but not Presidio.
const appKind = process.env.PSEUDONYMIZER_APP || 'server';
if (!['server', 'desktop'].includes(appKind)) throw new Error(`PSEUDONYMIZER_APP must be "server" or "desktop", not "${appKind}".`);
export const APP_KIND = appKind;
export const AVAILABLE_DETECTORS = appKind === 'desktop' ? ['gliner', 'ollama'] : ['gliner', 'presidio', 'ollama'];
// The desktop app's helper doesn't contain Docling yet, so it can't open PDFs.
export const DOCUMENT_FORMATS = appKind === 'desktop' ? [] : ['pdf'];

export const CLI_TIMEOUT_MS = 10 * 60 * 1000;
// Where commands are looked up on Windows, as cmd.exe would: the folders on PATH, each name with the extensions
// in PATHEXT. Read once at start; the desktop app sets PATH before it starts the server.
export const COMMAND_SEARCH_PATH = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
export const WINDOWS_COMMAND_EXTENSIONS = (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean);
// Windows' own tools (taskkill, whoami, icacls) are started from here, not looked up on PATH, where e.g. Git for
// Windows puts a different whoami first.
export const WINDOWS_TOOLS_DIR = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32');

export const ALLOWED_HOSTS = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
export const ALLOWED_ORIGINS = ALLOWED_HOSTS.map((host) => 'http://' + host);
