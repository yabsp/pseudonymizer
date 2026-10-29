// Builds the desktop app for Linux (AppImage) or Windows (ZIP): the app and models, with the helper built from a
// Python environment with a GPU build of PyTorch, which also runs on the processor when the computer lacks that GPU.
// The environment is HELPER_PYTHON, or .venv when it is not set (docs/setup.md, "Build the desktop app"):
// - CUDA build (NVIDIA): Pseudonymizer-<version>-x86_64.AppImage or ...-win-x64.zip, the one that is passed on;
// - XPU build (Intel Arc and Core Ultra graphics): the same name ending in -XPU, for your own computer only, as
//   Intel's GPU libraries in it may not be passed on as they are (agents/todo.md).
// Run on the system it is for: npm run dist:linux, or on Windows npm run dist:win.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Per system: its name, where an environment keeps its Python, electron-builder's target and the file's name per PyTorch
// build (electron-builder fills in the ${...} macros).
const TARGETS = {
  linux: {
    name: 'Linux',
    system: 'linux',
    python: ['bin', 'python'],
    builder: ['--linux', 'AppImage'],
    nameOption: '-c.linux.artifactName',
    names: { cuda: '${productName}-${version}-${arch}.${ext}', xpu: '${productName}-${version}-${arch}-XPU.${ext}' },
  },
  win: {
    name: 'Windows',
    system: 'win32',
    python: ['Scripts', 'python.exe'],
    builder: ['--win', 'zip'],
    nameOption: '-c.win.artifactName',
    names: { cuda: '${productName}-${version}-win-${arch}.${ext}', xpu: '${productName}-${version}-win-${arch}-XPU.${ext}' },
  },
};

const target = TARGETS[process.argv[2]];
if (!target) throw new Error('Usage: node desktop/dist.mjs linux|win (npm run dist:linux or npm run dist:win).');
if (process.platform !== target.system) throw new Error(`Build the ${target.name} app on ${target.name}: the helper is built for the system it runs on.`);
const HELPER_PYTHON = process.env.HELPER_PYTHON || path.join(ROOT, '.venv', ...target.python);

// "cuda" or "xpu" when PyTorch was built for that GPU (torch.version.cuda or torch.version.xpu is set), else "".
const check = spawnSync(HELPER_PYTHON, ['-c', 'import torch; v = torch.version; print("cuda" if v.cuda else "xpu" if getattr(v, "xpu", None) else "")'], { encoding: 'utf8' });
const build = check.stdout?.trim();
if (!target.names[build]) {
  throw new Error(`The PyTorch at ${HELPER_PYTHON} is neither PyTorch's CUDA build nor its XPU build. Set HELPER_PYTHON to the Python of an environment with one of them, e.g. one made by "npm run setup -- --torch cuda --venv .venv-cuda" (docs/setup.md).`);
}
console.log(`Building with PyTorch's ${build.toUpperCase()} build from ${HELPER_PYTHON}`);

// No shell, so the ${...} macros reach electron-builder as written.
for (const args of [
  ['desktop/build-helper.mjs'],
  ['desktop/build-models.mjs'],
  ['node_modules/electron-builder/cli.js', ...target.builder, `${target.nameOption}=${target.names[build]}`, '--publish', 'never'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: ROOT, env: { ...process.env, HELPER_PYTHON } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
