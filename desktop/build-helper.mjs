// Builds the detection helper (python/gliner_helper.py with PyTorch and GLiNER, and Docling for PDFs, which it runs
// with --extract-document) into one folder with an executable, build/helper/detection-helper, using PyInstaller
// from .venv, or from the Python in HELPER_PYTHON (e.g. an environment with PyTorch's CUDA build for the GPU
// variant). Presidio comes with spaCy and the German, French and English models (MIT, LGPL-LR); the Italian one is
// for non-commercial use only and is never shipped.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
// PyInstaller is run as a module of .venv's Python, not through its launcher (Scripts\pyinstaller.exe), which
// keeps the path of the folder the venv was created in and breaks when the venv is moved.
const VENV_PYTHON = process.env.HELPER_PYTHON || path.join(ROOT, '.venv', IS_WINDOWS ? 'Scripts/python.exe' : 'bin/python');
// The spaCy models Presidio loads (python/presidio_detection.py), installed as packages in the environment.
const SPACY_MODELS = ['de_core_news_lg', 'fr_core_news_lg', 'en_core_web_lg'];
// Packages that read their own version or data files at import time, so PyInstaller must copy their metadata.
const WITH_METADATA = ['torch', 'transformers', 'tokenizers', 'huggingface-hub', 'safetensors', 'tqdm', 'regex', 'requests',
  'packaging', 'filelock', 'numpy', 'pyyaml', 'sentencepiece', 'gliner', 'docling', 'docling-core', 'docling-ibm-models',
  'docling-parse', 'rapidocr', 'pydantic', 'pluggy', 'presidio-analyzer', 'spacy', 'spacy-legacy', 'spacy-loggers', 'thinc',
  'tldextract', ...SPACY_MODELS];
// Packages with data files (configurations, fonts, parser resources) or plugins found at run time.
const COLLECT_ALL = ['gliner', 'docling', 'docling_core', 'docling_ibm_models', 'docling_parse', 'rapidocr', 'latex2mathml',
  'presidio_analyzer', 'spacy', 'spacy_legacy', 'spacy_loggers', 'thinc', 'phonenumbers', 'tldextract', ...SPACY_MODELS];
const LEFT_OUT = ['it_core_news_lg', 'it_core_news_md', 'it_core_news_sm', 'tkinter', 'matplotlib', 'IPython', 'pytest'];

if (!fs.existsSync(VENV_PYTHON)) throw new Error(`There is no Python at ${VENV_PYTHON}. Set up .venv as docs/setup.md says.`);
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

// PyTorch's XPU build (Intel GPUs) reaches the GPU through SYCL's adapters, which its loader opens by name at run
// time, so PyInstaller can't see them either; without them the helper finds no Intel GPU. Linux only for now: the
// XPU build on Windows names them differently and hasn't been built yet. Environments without them get nothing.
function syclAdapters() {
  if (IS_WINDOWS) return [];
  const found = spawnSync(VENV_PYTHON, ['-c', 'import sys; print(sys.prefix)'], { encoding: 'utf8' });
  const folder = path.join(found.stdout.trim(), 'lib');
  // The names the loader opens: libur_adapter_level_zero.so.0, libur_adapter_level_zero_v2.so.0, libur_adapter_opencl.so.0
  const ADAPTER = /^libur_adapter_\w+\.so\.0$/;
  if (!found.stdout.trim() || !fs.existsSync(folder)) return [];
  return fs.readdirSync(folder).filter((name) => ADAPTER.test(name))
    .flatMap((name) => ['--add-binary', `${path.join(folder, name)}${path.delimiter}.`]);
}

const args = [
  '-m', 'PyInstaller', '--noconfirm', '--onedir', '--console', '--name', 'detection-helper',
  '--distpath', path.join(ROOT, 'build', 'helper'),
  '--workpath', path.join(ROOT, 'build', 'pyinstaller'),
  '--specpath', path.join(ROOT, 'build', 'pyinstaller'),
  ...COLLECT_ALL.flatMap((name) => ['--collect-all', name]),
  // Imported only when started with --extract-document, from the python folder next to the helper.
  '--paths', path.join(ROOT, 'python'), '--hidden-import', 'document_extraction', '--hidden-import', 'accelerators',
  '--hidden-import', 'presidio_detection',
  ...WITH_METADATA.flatMap((name) => ['--copy-metadata', name]),
  ...LEFT_OUT.flatMap((name) => ['--exclude-module', name]),
  ...torchvisionLibraries(),
  ...syclAdapters(),
  path.join(ROOT, 'python', 'gliner_helper.py'),
];
const result = spawnSync(VENV_PYTHON, args, { stdio: 'inherit', cwd: ROOT });
if (result.status !== 0) process.exit(result.status ?? 1);
