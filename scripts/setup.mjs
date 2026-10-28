// "npm run setup": installs everything the app needs into the project folder, so nothing is installed elsewhere:
// - a Python environment (.venv, or --venv .venv-<name>) with PyTorch (--torch cpu, cuda or xpu), the packages
//   in python/requirements.txt, PyInstaller and the German, French and English spaCy models;
// - the models in models/: GLiNER (models/huggingface) and Docling's (models/docling), which the server and the
//   desktop build use from there;
// - Electron and electron-builder in node_modules, if it is missing.
// Downloads are cached in .cache/. Steps that are done already are skipped, so it can be run again after a failure.
// Needs Python 3.12 (on Windows the "py" launcher or "python") and Node; docs/setup.md, "Quick setup".
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
const CACHE_DIR = path.join(ROOT, '.cache');
const MODELS_DIR = path.join(ROOT, 'models');
const HF_HOME = path.join(MODELS_DIR, 'huggingface');
const DOCLING_DIR = path.join(MODELS_DIR, 'docling');

// The versions the app is tested with; .github/workflows/desktop.yml builds with this script too.
const TORCH = ['torch==2.14.1', 'torchvision==0.29.1'];
const TORCH_INDEX = {
  cpu: 'https://download.pytorch.org/whl/cpu',
  cuda: 'https://download.pytorch.org/whl/cu130',
  xpu: 'https://download.pytorch.org/whl/xpu',
};
const PYINSTALLER = 'pyinstaller==6.22.3';
// The spaCy models Presidio loads (python/presidio_detection.py); never the Italian one, which is for
// non-commercial use only.
const SPACY_MODELS = ['de_core_news_lg', 'fr_core_news_lg', 'en_core_web_lg'];
// GLiNER and the tokenizer of the model it is built on, as desktop/build-models.mjs ships them.
const GLINER_MODEL = 'urchade/gliner_multi_pii-v1';
const HF_MODELS = [GLINER_MODEL, 'microsoft/mdeberta-v3-base'];
// Docling's models (layout, tables, formulas, OCR) and the folders docling-tools puts them in.
const DOCLING_MODELS = ['layout', 'tableformer', 'code_formula', 'rapidocr'];
const DOCLING_FOLDERS = ['docling-project--docling-layout-heron', 'docling-project--docling-models', 'docling-project--CodeFormulaV2', 'RapidOcr'];
// A Python environment in the project folder: ".venv", or ".venv-" and letters, digits, "_" or "-" (".venv-cuda").
const VENV_NAME = /^\.venv(?:-[\w-]+)?$/;
// "3.12" as Python prints sys.version_info[:2] joined with a dot.
const PYTHON_VERSION = '3.12';

const { values: options } = parseArgs({
  options: {
    torch: { type: 'string', default: 'cpu' },
    venv: { type: 'string', default: '.venv' },
  },
});
if (!TORCH_INDEX[options.torch]) fail(`--torch must be cpu, cuda or xpu, not "${options.torch}".`);
if (!VENV_NAME.test(options.venv)) fail(`--venv must be .venv or .venv-<name> (e.g. .venv-cuda), not "${options.venv}".`);
if (options.torch !== 'cpu' && process.platform === 'darwin') fail('On macOS, use --torch cpu; PyTorch uses Apple silicon without a special build.');

const VENV_DIR = path.join(ROOT, options.venv);
const VENV_PYTHON = path.join(VENV_DIR, IS_WINDOWS ? 'Scripts/python.exe' : 'bin/python');
// Every download goes to .cache/ and models/ in the project, never to the caches in the home folder.
const ENV = {
  ...process.env,
  PIP_CACHE_DIR: path.join(CACHE_DIR, 'pip'),
  npm_config_cache: path.join(CACHE_DIR, 'npm'),
  electron_config_cache: path.join(CACHE_DIR, 'electron'),
  HF_HOME,
  HF_HUB_DISABLE_TELEMETRY: '1',
  PIP_DISABLE_PIP_VERSION_CHECK: '1',
};

function fail(message) {
  console.error(`\nSetup stopped: ${message}`);
  process.exit(1);
}

function run(command, args, what) {
  const result = spawnSync(command, args, { cwd: ROOT, env: ENV, stdio: 'inherit' });
  if (result.error) fail(`could not start "${command}" (${what}): ${result.error.message}`);
  if (result.status !== 0) fail(`${what} failed (exit code ${result.status}). Fix the problem above, then run "npm run setup" again.`);
}

const succeeds = (command, args) => spawnSync(command, args, { cwd: ROOT, env: ENV, encoding: 'utf8' });
const step = (title) => console.log(`\n== ${title}`);

/** The command that starts Python 3.12: the Windows launcher "py -3.12", "python3.12" or "python"/"python3". */
function findPython() {
  const candidates = IS_WINDOWS ? [['py', ['-3.12']], ['python', []]] : [['python3.12', []], ['python3', []]];
  for (const [command, args] of candidates) {
    const result = succeeds(command, [...args, '-c', 'import sys; print("%d.%d" % sys.version_info[:2])']);
    if (result.status === 0 && result.stdout.trim() === PYTHON_VERSION) return [command, args];
  }
  return fail(`Python ${PYTHON_VERSION} was not found. Install it from python.org${IS_WINDOWS ? ' (with the "py" launcher)' : ''}, then run "npm run setup" again.`);
}

function setUpPython() {
  step(`Python environment ${options.venv}`);
  if (fs.existsSync(VENV_PYTHON)) {
    const version = succeeds(VENV_PYTHON, ['-c', 'import sys; print("%d.%d" % sys.version_info[:2])']).stdout?.trim();
    if (version !== PYTHON_VERSION) fail(`${options.venv} has Python ${version || '(not working)'}, not ${PYTHON_VERSION}. Delete the folder and run "npm run setup" again.`);
    console.log('already there');
  } else {
    const [command, args] = findPython();
    run(command, [...args, '-m', 'venv', VENV_DIR], 'creating the Python environment');
  }

  step(`PyTorch (${options.torch} build)`);
  // A different build of PyTorch already installed would stay, as pip sees the same version number.
  const installed = succeeds(VENV_PYTHON, ['-c', 'import torch; v = torch.version; print("cuda" if v.cuda else "xpu" if getattr(v, "xpu", None) else "cpu")']);
  if (installed.status === 0 && installed.stdout.trim() !== options.torch) {
    fail(`${options.venv} has PyTorch's ${installed.stdout.trim()} build. Use another --venv for the ${options.torch} build (e.g. --venv .venv-${options.torch}).`);
  }
  run(VENV_PYTHON, ['-m', 'pip', 'install', ...TORCH, '--index-url', TORCH_INDEX[options.torch]], 'installing PyTorch');

  step('Packages from python/requirements.txt and PyInstaller');
  run(VENV_PYTHON, ['-m', 'pip', 'install', '-r', path.join(ROOT, 'python', 'requirements.txt'), PYINSTALLER], 'installing the Python packages');

  step('spaCy models for Presidio');
  for (const model of SPACY_MODELS) {
    const isInstalled = succeeds(VENV_PYTHON, ['-c', `import spacy.util, sys; sys.exit(0 if spacy.util.is_package("${model}") else 1)`]).status === 0;
    if (isInstalled) console.log(model, 'already there');
    else run(VENV_PYTHON, ['-m', 'spacy', 'download', model], `downloading ${model}`);
  }
}

const hfFolder = (id) => path.join(HF_HOME, 'hub', 'models--' + id.replace('/', '--'), 'refs', 'main');

function setUpModels() {
  step('GLiNER model (models/huggingface)');
  if (HF_MODELS.every((id) => fs.existsSync(hfFolder(id)))) console.log('already there');
  else run(VENV_PYTHON, ['-c', `from gliner import GLiNER; GLiNER.from_pretrained("${GLINER_MODEL}")`], 'downloading the GLiNER model');

  step('Docling models (models/docling)');
  if (DOCLING_FOLDERS.every((name) => fs.existsSync(path.join(DOCLING_DIR, name)))) console.log('already there');
  else run(VENV_PYTHON, ['-m', 'docling.cli.tools', 'models', 'download', ...DOCLING_MODELS, '--rapidocr-backend-lang', 'torch:de', '--output-dir', DOCLING_DIR], 'downloading the Docling models');
}

function setUpNode() {
  step('Electron and electron-builder (node_modules)');
  if (fs.existsSync(path.join(ROOT, 'node_modules', 'electron-builder'))) return console.log('already there');
  // npm's own program, as "npm run" sets it; "npm" itself is a batch file on Windows.
  if (!process.env.npm_execpath) fail('start the setup with "npm run setup", so npm can be found.');
  run(process.execPath, [process.env.npm_execpath, 'ci', '--no-audit', '--no-fund'], 'installing the npm packages');
}

setUpPython();
setUpModels();
setUpNode();
console.log(`\nDone. ${options.venv === '.venv'
  ? 'Start the app with "npm start".'
  : `Build the desktop app with HELPER_PYTHON=${path.relative(ROOT, VENV_PYTHON)} (docs/setup.md, "Build the desktop app").`}`);
