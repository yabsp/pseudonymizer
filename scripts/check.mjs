// "npm run check": the syntax of every JavaScript file and of the Python helpers, the same on every system.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PYTHON } from '../tests/helpers/python.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JAVASCRIPT_FOLDERS = ['server', 'desktop', 'public/js', 'scripts'];
const PYTHON_FOLDER = 'python';

const filesIn = (folder, extensions) => fs.readdirSync(path.join(ROOT, folder), { recursive: true })
  .filter((name) => extensions.includes(path.extname(name)))
  .map((name) => path.join(ROOT, folder, name));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.error) throw new Error(`Could not start "${command}": ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const file of JAVASCRIPT_FOLDERS.flatMap((folder) => filesIn(folder, ['.js', '.mjs']))) run(process.execPath, ['--check', file]);
run(PYTHON, ['-m', 'py_compile', ...filesIn(PYTHON_FOLDER, ['.py'])]);
