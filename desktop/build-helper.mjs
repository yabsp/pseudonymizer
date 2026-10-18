// Builds the detection helper (python/gliner_helper.py with PyTorch and GLiNER) into one folder with an executable,
// build/helper/detection-helper, using PyInstaller from .venv. Presidio and spaCy are left out of the desktop app.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
// PyInstaller is run as a module of .venv's Python, not through its launcher (Scripts\pyinstaller.exe), which
// keeps the path of the folder the venv was created in and breaks when the venv is moved.
const VENV_PYTHON = path.join(ROOT, '.venv', IS_WINDOWS ? 'Scripts/python.exe' : 'bin/python');
// Packages that read their own version or data files at import time, so PyInstaller must copy their metadata.
const WITH_METADATA = ['torch', 'transformers', 'tokenizers', 'huggingface-hub', 'safetensors', 'tqdm', 'regex', 'requests',
  'packaging', 'filelock', 'numpy', 'pyyaml', 'sentencepiece', 'gliner'];
const LEFT_OUT = ['presidio_analyzer', 'spacy', 'thinc', 'tkinter', 'matplotlib', 'IPython', 'pytest'];

if (!fs.existsSync(VENV_PYTHON)) throw new Error(`There is no Python in .venv (${VENV_PYTHON}). Set it up as the README says.`);
const check = spawnSync(VENV_PYTHON, ['-m', 'PyInstaller', '--version'], { stdio: 'ignore' });
if (check.status !== 0) throw new Error('PyInstaller is not installed in .venv. Run: .venv/bin/python -m pip install pyinstaller');

// torchvision (installed for Docling) loads its operators from library files with torch.ops.load_library, which
// PyInstaller can't see. Without them, transformers can't import the model classes GLiNER uses.
function torchvisionLibraries() {
  const found = spawnSync(VENV_PYTHON, ['-c', 'import importlib.util as u; s = u.find_spec("torchvision"); print(s.submodule_search_locations[0] if s else "")'], { encoding: 'utf8' });
  const folder = found.stdout.trim();
  if (!folder) return [];
  // The operator libraries: _C_stable.pyd and image_stable.pyd on Windows, .so files elsewhere.
  const LIBRARY = /\.(pyd|so)$/;
  return fs.readdirSync(folder).filter((name) => LIBRARY.test(name))
    .flatMap((name) => ['--add-binary', `${path.join(folder, name)}${path.delimiter}torchvision`]);
}

const args = [
  '-m', 'PyInstaller', '--noconfirm', '--onedir', '--console', '--name', 'detection-helper',
  '--distpath', path.join(ROOT, 'build', 'helper'),
  '--workpath', path.join(ROOT, 'build', 'pyinstaller'),
  '--specpath', path.join(ROOT, 'build', 'pyinstaller'),
  '--collect-all', 'gliner',
  ...WITH_METADATA.flatMap((name) => ['--copy-metadata', name]),
  ...LEFT_OUT.flatMap((name) => ['--exclude-module', name]),
  ...torchvisionLibraries(),
  path.join(ROOT, 'python', 'gliner_helper.py'),
];
const result = spawnSync(VENV_PYTHON, args, { stdio: 'inherit', cwd: ROOT });
if (result.status !== 0) process.exit(result.status ?? 1);
