// "npm run setup": puts everything the app needs into the project folder, and nothing anywhere else:
// - the npm packages (node_modules), exactly the versions of package-lock.json, without running their scripts;
// - Electron's program, for the desktop app ("npm start", "npm run build");
// - the detection model (models/gliner), each file checked against the SHA-256 written down here;
// - on Linux with an NVIDIA graphics card and CUDA installed, ONNX Runtime's CUDA libraries.
// At the end it loads the model once and says where detection runs (graphics card, Neural Engine or processor).
// Downloads are cached in .cache/. Steps that are done already are skipped, so it can be run again after a failure.
//
//   npm run setup                     the model that suits this computer's memory (below 8 GB: the small one)
//   npm run setup -- --model full     the full model (1.2 GB download, about 1.6 GB of memory while the app runs)
//   npm run setup -- --model small    the same model with 8-bit weights (395 MB, about 0.6 GB of memory, slower)
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_DIR = path.join(ROOT, 'models', 'gliner');
const CACHE = path.join(ROOT, '.cache');
const MIN_NODE = [22, 13];
// Below this much memory the small model is installed: the full one needs about 1.6 GB while the app runs.
const FULL_MODEL_MIN_MEMORY = 8 * 1024 ** 3;
// What ONNX Runtime's CUDA libraries need on Linux (CUDA 12 and cuDNN 9), as the system's library list names them.
const CUDA_LIBRARIES = ['libcudart.so.12', 'libcublasLt.so.12', 'libcudnn.so.9'];
const CUDA_PROVIDER = path.join(ROOT, 'node_modules', 'onnxruntime-node', 'bin', 'napi-v6', 'linux', 'x64', 'libonnxruntime_providers_cuda.so');

// GLiNER multi PII v1 (urchade/gliner_multi_pii-v1, Apache-2.0) as ONNX files on Hugging Face, each pinned to a
// revision and a SHA-256, so what is installed is exactly what was measured (docs/reference.md).
// - OFFICIAL: the conversion published by Hugging Face's onnx-community, full precision.
// - SMALL: the same model with its weights stored in 8 bits, published by a third party (blinzl). Checked against
//   the OFFICIAL file tensor by tensor (scripts/verify-small-model.py; docs/reference.md, "Detection model").
const OFFICIAL = 'https://huggingface.co/onnx-community/gliner_multi_pii-v1/resolve/2e0397a7e8a250d76c37122232b3cbde42c8d629/';
const SMALL = 'https://huggingface.co/blinzl/gliner_multi_pii-v1-q8w/resolve/5698ced67406d94ab35c047bac2b81676b1a01c3/';
const TOKENIZER_FILES = [
  { name: 'tokenizer.json', url: OFFICIAL + 'tokenizer.json', bytes: 16331948, sha256: '914bd3c8fb7b525af9e23b60d0ec7b1248ddb2b99014efd9c02ebeb022f8cab7' },
  { name: 'tokenizer_config.json', url: OFFICIAL + 'tokenizer_config.json', bytes: 1806, sha256: '78f866883daf7ee2bc400200a155cdbe9116ed0a6ed597ff573ea2c9862a89a6' },
  { name: 'gliner_config.json', url: OFFICIAL + 'gliner_config.json', bytes: 732, sha256: '69e141f7fe1864e0d81ab0e542c68387d588db62393bcd93b471d54dcf0f5c16' },
];
const MODELS = {
  small: {
    name: 'GLiNER multi PII v1 (8-bit weights)',
    file: 'model_q8w.onnx',
    files: [
      { name: 'model_q8w.onnx', url: SMALL + 'onnx/model_q8w.onnx', bytes: 1366882, sha256: '44f585d75056da592e5d1f56219653aea3afa05da1d54805d79f53551e062072' },
      { name: 'model_q8w.onnx_data', url: SMALL + 'onnx/model_q8w.onnx_data', bytes: 393742264, sha256: '4efe2f617e9694e83ada50ebb027b59f55394323de8315987a924176fb3fe1aa' },
    ],
  },
  full: {
    name: 'GLiNER multi PII v1 (full precision)',
    file: 'model.onnx',
    files: [{ name: 'model.onnx', url: OFFICIAL + 'onnx/model.onnx', bytes: 1157129714, sha256: '7704865e414f24591da6aee08716a25677855bc8a84af81396d90e40df1e68d2' }],
  },
};

const { values: options } = parseArgs({ options: { model: { type: 'string', default: 'auto' } } });

function fail(message) {
  console.error(`\nSetup stopped: ${message}`);
  process.exit(1);
}

const step = (title) => console.log(`\n== ${title}`);
// Sizes as the documentation gives them: 1 MB is a million bytes.
const sizeText = (bytes) => (bytes < 1e6 ? `${Math.ceil(bytes / 1000)} kB` : `${Math.round(bytes / 1e6)} MB`);

/** What a command printed, or '' if it is not there. Its exit code is ignored: a query that finds nothing fails. */
function outputOf(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] });
  return (result.stdout ?? '').trim();
}

function sha256Of(file) {
  const hash = crypto.createHash('sha256');
  const handle = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(4 * 1024 * 1024);
  try {
    for (let read = fs.readSync(handle, buffer); read > 0; read = fs.readSync(handle, buffer)) hash.update(buffer.subarray(0, read));
  } finally {
    fs.closeSync(handle);
  }
  return hash.digest('hex');
}

function installPackages() {
  step('npm packages (node_modules)');
  const lock = path.join(ROOT, 'package-lock.json');
  const installed = path.join(ROOT, 'node_modules', '.package-lock.json');
  // npm writes its own copy of the lock file when it is done; newer than package-lock.json means up to date.
  if (fs.existsSync(installed) && fs.statSync(installed).mtimeMs >= fs.statSync(lock).mtimeMs) return console.log('already there');
  // npm's own program, as "npm run" sets it; "npm" itself is a batch file on Windows.
  if (!process.env.npm_execpath) fail('start the setup with "npm run setup", so npm can be found.');
  const env = { ...process.env, npm_config_cache: path.join(CACHE, 'npm') };
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'ci'], { cwd: ROOT, env, stdio: 'inherit' });
  if (result.status !== 0) fail(`installing the npm packages failed (exit code ${result.status}). Fix the problem above, then run "npm run setup" again.`);
}

/** Electron's install script, which "npm ci" does not run (.npmrc): downloads Electron, checks it, unpacks it. */
function installElectron() {
  step('Electron (the desktop app\'s window)');
  const env = { ...process.env, electron_config_cache: path.join(CACHE, 'electron') };
  const result = spawnSync(process.execPath, [path.join(ROOT, 'node_modules', 'electron', 'install.js')], { cwd: ROOT, env, stdio: 'inherit' });
  if (result.status !== 0) fail('Electron could not be installed. Check the internet connection, then run "npm run setup" again.');
  console.log(`Electron ${fs.readFileSync(path.join(ROOT, 'node_modules', 'electron', 'dist', 'version'), 'utf8').trim()} is there`);
}

/** Downloads one file next to its place, checks it, and only then moves it there. */
async function download({ name, url, bytes, sha256 }) {
  const file = path.join(MODEL_DIR, name);
  if (fs.existsSync(file)) {
    if (fs.statSync(file).size === bytes && sha256Of(file) === sha256) return console.log(`${name}: already there`);
    // Damaged or from another version: not the tested file, so it must not stay in use if the download fails.
    fs.rmSync(file);
  }
  console.log(`${name}: downloading ${sizeText(bytes)} from ${new URL(url).host}`);
  const partial = file + '.part';
  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (e) {
    fail(`${name} could not be downloaded (${e.cause?.code ?? e.message}). Check the internet connection, then run "npm run setup" again.`);
  }
  if (!res.ok) fail(`${name} could not be downloaded: the server answered ${res.status}.`);
  let received = 0;
  let shown = 0;
  const progress = async function* (source) {
    for await (const chunk of source) {
      received += chunk.length;
      if (bytes > 50e6 && received - shown >= bytes / 10) {
        shown = received;
        console.log(`  ${Math.round(received / bytes * 100)} %`);
      }
      yield chunk;
    }
  };
  await pipeline(Readable.fromWeb(res.body), progress, fs.createWriteStream(partial));
  const actual = sha256Of(partial);
  if (actual !== sha256) {
    fs.rmSync(partial, { force: true });
    fail(`${name} is not the file this version was tested with (SHA-256 ${actual}, expected ${sha256}). It was deleted; nothing was installed from it.`);
  }
  fs.renameSync(partial, file);
}

function chooseModel() {
  if (options.model !== 'auto') return options.model;
  const memory = os.totalmem();
  const choice = memory >= FULL_MODEL_MIN_MEMORY ? 'full' : 'small';
  console.log(`This computer has ${Math.round(memory / 1024 ** 3)} GB of memory, so the ${choice} model is installed (choose with --model full or --model small).`);
  return choice;
}

async function installModel(choice) {
  const model = MODELS[choice];
  step(`Detection model: ${model.name} (models/gliner)`);
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  for (const file of [...TOKENIZER_FILES, ...model.files]) await download(file);
  fs.writeFileSync(path.join(MODEL_DIR, 'model.json'), JSON.stringify({ name: model.name, file: model.file }, null, 2) + '\n');
}

/** The graphics cards and AI accelerators (NPUs) the system reports, for the report only: [{ kind, name }]. */
function findHardware() {
  if (process.platform === 'win32') {
    const query = 'Get-CimInstance Win32_VideoController | ForEach-Object { "gpu|" + $_.Name };'
      + ' Get-PnpDevice -Class ComputeAccelerator -PresentOnly -ErrorAction SilentlyContinue | ForEach-Object { "npu|" + $_.FriendlyName }';
    return outputOf('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', query]).split(/\r?\n/).filter(Boolean)
      .map((line) => ({ kind: line.split('|')[0], name: line.slice(4).trim() }));
  }
  if (process.platform === 'darwin') {
    const chip = outputOf('sysctl', ['-n', 'machdep.cpu.brand_string']);
    return chip.startsWith('Apple') ? [{ kind: 'gpu', name: `${chip} graphics` }, { kind: 'npu', name: `${chip} Neural Engine` }] : [];
  }
  const nvidia = outputOf('nvidia-smi', ['-L']).split('\n').filter(Boolean).map((line) => ({ kind: 'gpu', name: line.replace(/ \(UUID.*$/, '') }));
  // Linux lists NPUs (Intel, AMD) in its accelerator class.
  const npus = fs.existsSync('/sys/class/accel') ? fs.readdirSync('/sys/class/accel').map((name) => ({ kind: 'npu', name: `/sys/class/accel/${name}` })) : [];
  return [...nvidia, ...npus];
}

/** On Linux with an NVIDIA card: ONNX Runtime's CUDA libraries, if the CUDA and cuDNN they need are installed. */
function installCuda(hardware) {
  if (process.platform !== 'linux' || process.arch !== 'x64' || !hardware.some((h) => h.name.includes('NVIDIA'))) return;
  step('CUDA for the NVIDIA graphics card');
  if (fs.existsSync(CUDA_PROVIDER)) return console.log('already there');
  const libraries = outputOf('ldconfig', ['-p']);
  const missing = CUDA_LIBRARIES.filter((library) => !libraries.includes(library));
  if (missing.length) {
    return console.log(`Not installed: CUDA 12 and cuDNN 9 are needed (missing: ${missing.join(', ')}). Install them, then run "npm run setup" again; until then the processor is used.`);
  }
  // ONNX Runtime's own install script, which "npm ci" does not run: downloads its CUDA libraries from NuGet.
  const env = { ...process.env, ONNXRUNTIME_NODE_INSTALL: 'cuda12', TMPDIR: path.join(CACHE, 'tmp') };
  fs.mkdirSync(env.TMPDIR, { recursive: true });
  const result = spawnSync(process.execPath, [path.join(ROOT, 'node_modules', 'onnxruntime-node', 'script', 'install.js')], { env, stdio: 'inherit' });
  console.log(result.status === 0 ? 'installed' : 'The download failed; the processor is used. Run "npm run setup" again to retry.');
}

/** Loads the model as the app does and reports where it runs. */
async function reportDevice(hardware) {
  step('Where detection runs');
  for (const { kind, name } of hardware) console.log(`${kind === 'npu' ? 'AI accelerator (NPU)' : 'Graphics card'}: ${name}`);
  const { readConfig } = await import(pathToFileURL(path.join(ROOT, 'server', 'config.js')));
  const { loadGliner } = await import(pathToFileURL(path.join(ROOT, 'server', 'gliner.js')));
  const config = readConfig();
  console.log('Loading the model and comparing every accelerator with the processor (takes a few seconds)...');
  const model = await loadGliner(config.modelDir, { threads: config.threads, device: config.device });
  const { label, checked } = model.device;
  const speed = checked ? `, ${(checked.processorMs / checked.ms).toFixed(1)} times as fast as the processor in the check` : '';
  console.log(`Detection runs on ${label}${speed}.`);
  await model.release();
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < MIN_NODE[0] || (major === MIN_NODE[0] && minor < MIN_NODE[1])) fail(`Node.js ${MIN_NODE.join('.')} or newer is needed, this is ${process.versions.node}.`);
if (options.model !== 'auto' && !Object.hasOwn(MODELS, options.model)) fail(`--model must be auto, ${Object.keys(MODELS).join(' or ')}, not "${options.model}".`);

installPackages();
installElectron();
await installModel(chooseModel());
const hardware = findHardware();
installCuda(hardware);
await reportDevice(hardware);
console.log('\nDone. Start the app with "npm start", or build it for this computer with "npm run build" (BUILDING.md).');
