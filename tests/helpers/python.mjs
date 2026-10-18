import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IS_WINDOWS = process.platform === 'win32';
const VENV_PYTHON = path.join(ROOT, '.venv', IS_WINDOWS ? 'Scripts/python.exe' : 'bin/python');

/**
 * The Python that tests and "npm run check" start, found as server/config.js finds it: GLINER_PYTHON, else the
 * project's .venv, else the system's. On Windows that is "python", as "python3" is often only the Microsoft
 * Store's stand-in that opens the store.
 */
export const PYTHON = process.env.GLINER_PYTHON || (fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : (IS_WINDOWS ? 'python' : 'python3'));
