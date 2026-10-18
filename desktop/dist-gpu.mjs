// Builds the Windows installer of the GPU variant: the same app and models, with the helper built from a Python
// environment that has PyTorch's CUDA build (HELPER_PYTHON), so detection and PDFs can use an NVIDIA GPU.
// Run on Windows: HELPER_PYTHON=<that environment's python.exe> npm run dist:win:gpu
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.HELPER_PYTHON) throw new Error('Set HELPER_PYTHON to the python.exe of an environment with PyTorch\'s CUDA build.');
const check = spawnSync(process.env.HELPER_PYTHON, ['-c', 'import torch; print(torch.version.cuda or "")'], { encoding: 'utf8' });
if (!check.stdout?.trim()) throw new Error(`The PyTorch at ${process.env.HELPER_PYTHON} has no CUDA support, so the result would not use a GPU.`);

// No shell: electron-builder fills in ${productName} and the other macros itself.
for (const args of [
  ['desktop/build-helper.mjs'],
  ['desktop/build-models.mjs'],
  ['node_modules/electron-builder/cli.js', '--win', 'nsis', '-c.win.artifactName=${productName}-Setup-${version}-GPU.${ext}'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: ROOT });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
