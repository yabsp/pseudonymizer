// Builds the detection helper (python/gliner_helper.py with PyTorch and GLiNER) into one folder with an executable,
// build/helper/detection-helper, using PyInstaller from .venv. Presidio and spaCy are left out of the desktop app.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
const PYINSTALLER = path.join(ROOT, '.venv', IS_WINDOWS ? 'Scripts/pyinstaller.exe' : 'bin/pyinstaller');
// Packages that read their own version or data files at import time, so PyInstaller must copy their metadata.
const WITH_METADATA = ['torch', 'transformers', 'tokenizers', 'huggingface-hub', 'safetensors', 'tqdm', 'regex', 'requests',
  'packaging', 'filelock', 'numpy', 'pyyaml', 'sentencepiece', 'gliner'];
const LEFT_OUT = ['presidio_analyzer', 'spacy', 'thinc', 'tkinter', 'matplotlib', 'IPython', 'pytest'];

if (!fs.existsSync(PYINSTALLER)) throw new Error(`PyInstaller is not installed in .venv (${PYINSTALLER}). Run: .venv/bin/pip install pyinstaller`);

const args = [
  '--noconfirm', '--onedir', '--console', '--name', 'detection-helper',
  '--distpath', path.join(ROOT, 'build', 'helper'),
  '--workpath', path.join(ROOT, 'build', 'pyinstaller'),
  '--specpath', path.join(ROOT, 'build', 'pyinstaller'),
  '--collect-all', 'gliner',
  ...WITH_METADATA.flatMap((name) => ['--copy-metadata', name]),
  ...LEFT_OUT.flatMap((name) => ['--exclude-module', name]),
  path.join(ROOT, 'python', 'gliner_helper.py'),
];
const result = spawnSync(PYINSTALLER, args, { stdio: 'inherit', cwd: ROOT });
if (result.status !== 0) process.exit(result.status ?? 1);
