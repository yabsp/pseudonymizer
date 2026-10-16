// Starts the desktop app from the project folder ("npm run desktop"), using .venv and the Hugging Face cache.
// Terminals inside VS Code (itself an Electron app) set ELECTRON_RUN_AS_NODE, which would make Electron run as
// plain Node and exit without a window, so it is removed here.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ELECTRON = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(ELECTRON, [ROOT], { env, stdio: 'inherit', shell: process.platform === 'win32' });
child.on('error', (e) => {
  console.error(`Could not start Electron (${e.message}). Run "npm install" first.`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
