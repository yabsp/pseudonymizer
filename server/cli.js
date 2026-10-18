import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ADAPTERS_FILE, CLI_TIMEOUT_MS } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';
import { startCommand, stopProcessTree } from './processes.js';

// Model names as the CLIs accept them:
//   ^(?!-)       must not start with "-", so a model name can never become a command-line option
//   [\w.:\/-]+$  only letters, digits, "_", ".", ":", "/" and "-" (e.g. "claude-opus-5-5", "gpt-6.1-sol")
const MODEL_NAME = /^(?!-)[\w.:\/-]+$/;

// A stack-trace line such as "    at setupUser (file.js:311:5)": optional spaces, then "at" and a space.
const STACK_FRAME = /^\s*at\s/;
const ERROR_LINES_SHOWN = 2;
const ERROR_CHARS_SHOWN = 600;

const loadAdapters = () => JSON.parse(fs.readFileSync(ADAPTERS_FILE, 'utf8'));

/** The last distinct lines of a CLI's error output, without stack traces, short enough to show. */
function summarizeErrors(stderr) {
  const lines = stderr.split('\n').map((line) => line.trim()).filter((line) => line && !STACK_FRAME.test(line));
  const lastDistinct = [...new Set(lines.reverse())].slice(0, ERROR_LINES_SHOWN).reverse();
  return lastDistinct.join(' ').slice(-ERROR_CHARS_SHOWN) || 'No output.';
}

const isModelList = (models) => Array.isArray(models) && models.every((m) => typeof m?.id === 'string' && typeof m?.label === 'string');

function buildArgs(adapter, model, systemFile) {
  const fill = (arg) => arg.replaceAll('{model}', model).replaceAll('{systemFile}', systemFile);
  return adapter.args.flatMap((arg) => {
    if (arg !== '{modelArgs}') return [fill(arg)];
    return model ? (adapter.modelArgs || []).map(fill) : [];
  });
}

function runAdapter(adapter, { prompt, system = '', model = '' }, signal) {
  return new Promise((resolve, reject) => {
    if (model && !MODEL_NAME.test(model)) return reject(new Error('Invalid model name.'));

    // An empty working directory per run, so the CLI never sees project files.
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-'));
    const systemFile = path.join(workDir, 'system.md');
    fs.writeFileSync(systemFile, system);

    const args = buildArgs(adapter, model, systemFile);
    const input = (adapter.stdin || '{prompt}').replaceAll('{system}', system).replaceAll('{prompt}', prompt);
    const notStarted = (e) => new Error(`Could not start "${adapter.command}": ${e.message}. Is it installed and on PATH?`);
    let child;
    try {
      child = startCommand(adapter.command, args, { cwd: workDir });
    } catch (e) {
      fs.rmSync(workDir, { recursive: true, force: true });
      return reject(notStarted(e));
    }

    let out = '', err = '';
    const timer = setTimeout(() => stopProcessTree(child), CLI_TIMEOUT_MS);
    signal.addEventListener('abort', () => stopProcessTree(child), { once: true });
    const cleanUp = () => {
      clearTimeout(timer);
      fs.rmSync(workDir, { recursive: true, force: true });
    };
    const hint = adapter.loginHint ? ` ${adapter.loginHint}` : '';

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.stdin.on('error', () => {}); // a CLI that exits before reading its input is reported by 'error' or 'close' below
    child.on('error', (e) => {
      cleanUp();
      reject(notStarted(e));
    });
    child.on('close', (code) => {
      cleanUp();
      if (code === 0 && out.trim()) return resolve(out.trim());
      reject(new Error(`"${adapter.command}" exited with code ${code}. ${summarizeErrors(err)}${hint}`));
    });
    child.stdin.end(input);
  });
}

export function listAdapters(req, res) {
  try {
    const adapters = Object.entries(loadAdapters()).map(([id, a]) => ({
      id,
      label: a.label || id,
      models: isModelList(a.models) ? a.models : [],
    }));
    send(res, 200, adapters);
  } catch (e) {
    send(res, 500, { error: 'adapters.json is invalid: ' + e.message });
  }
}

export async function handleCli(req, res, name) {
  if (rejectUnlessFromApp(req, res)) return;

  let adapter;
  try {
    adapter = loadAdapters()[name];
  } catch (e) {
    return send(res, 500, { error: 'adapters.json is invalid: ' + e.message });
  }
  if (!adapter) return send(res, 404, { error: `No adapter named "${name}" in adapters.json.` });

  const body = await readBody(req);
  const cancelOnDisconnect = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) cancelOnDisconnect.abort();
  });
  try {
    const text = await runAdapter(adapter, JSON.parse(body), cancelOnDisconnect.signal);
    send(res, 200, { text });
  } catch (e) {
    send(res, 502, { error: e.message });
  }
}
