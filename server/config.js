import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

const MiB = 1024 * 1024;

function readPort(value) {
  const port = Number(value ?? 8091);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`PORT must be a whole number from 0 to 65535, not "${value}".`);
  return port;
}

function readThreads(value) {
  if (value === undefined || value === '') return 0;
  const threads = Number(value);
  if (!Number.isInteger(threads) || threads < 1 || threads > 256) throw new Error(`PSEUDONYMIZER_THREADS must be a whole number from 1 to 256, not "${value}".`);
  return threads;
}

// PSEUDONYMIZER_DEVICE: "auto", "cpu", or one accelerator (server/gliner.js) with an optional number of the
// graphics adapter after ":", such as "dml:1". Group 1 the name, group 2 the number.
const DEVICE_SETTING = /^(auto|cpu|dml|cuda|webgpu|coreml)(?::(\d{1,2}))?$/;

/** Where the detection model runs: { name } or { name, deviceId }; empty means "auto". */
function readDevice(value) {
  if (!value) return { name: 'auto' };
  const match = DEVICE_SETTING.exec(value);
  if (!match || (match[2] !== undefined && ['auto', 'cpu'].includes(match[1]))) {
    throw new Error(`PSEUDONYMIZER_DEVICE must be auto, cpu, dml, cuda, webgpu or coreml (an accelerator may have a number, such as dml:1), not "${value}".`);
  }
  return match[2] === undefined ? { name: match[1] } : { name: match[1], deviceId: Number(match[2]) };
}

function readFolder(name, value, fallback) {
  if (!value) return fallback;
  if (!path.isAbsolute(value)) throw new Error(`${name} must be an absolute path, not "${value}".`);
  return value;
}

/**
 * Everything the server can be told from outside, read and checked in this one place. env is process.env, or a
 * test's own values. The data folder holds what the user changes (settings.json, prompts/); the program's own files
 * are never written.
 */
export function readConfig(env = process.env) {
  const dataDir = readFolder('PSEUDONYMIZER_DATA_DIR', env.PSEUDONYMIZER_DATA_DIR, ROOT);
  const nodeModules = path.join(ROOT, 'node_modules');
  return {
    port: readPort(env.PORT),
    dataDir,
    publicDir: path.join(ROOT, 'public'),
    promptsDir: path.join(ROOT, 'prompts'),
    userPromptsDir: path.join(dataDir, 'prompts'),
    settingsFile: path.join(dataDir, 'settings.json'),
    adaptersFile: path.join(ROOT, 'config', 'adapters.json'),
    modelDir: readFolder('PSEUDONYMIZER_MODEL_DIR', env.PSEUDONYMIZER_MODEL_DIR, path.join(ROOT, 'models', 'gliner')),
    // 0: ONNX Runtime decides (one thread per processor core).
    threads: readThreads(env.PSEUDONYMIZER_THREADS),
    device: readDevice(env.PSEUDONYMIZER_DEVICE),
    // Third-party browser code, served from the installed packages under /vendor/<name>/, never from a CDN.
    vendorDirs: {
      pdfjs: path.join(nodeModules, 'pdfjs-dist'),
      tesseract: path.join(nodeModules, 'tesseract.js', 'dist'),
      'tesseract-core': path.join(nodeModules, 'tesseract.js-core'),
      tessdata: path.join(nodeModules, '@tesseract.js-data'),
    },
    maxJsonBytes: 8 * MiB,
    maxTextChars: 2_000_000,
    cliTimeoutMs: 10 * 60 * 1000,
  };
}
