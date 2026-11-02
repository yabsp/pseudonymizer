import { spawn } from 'node:child_process';
import { GLINER_MODELS, HELPER_COMMAND } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';
import { stopProcessTree } from './processes.js';

// Hugging Face model ids: "owner/name", each part letters, digits, "_", "." or "-" (e.g. "urchade/gliner_multi_pii-v1").
const MODEL_ID = /^[\w.-]+\/[\w.-]+$/;
const LANGUAGES = ['auto', 'de', 'fr', 'en'];
// The hardware choices of python/accelerators.py: "auto", PyTorch on cpu, cuda, xpu or mps, or ONNX Runtime on
// cpu, cuda, directml or coreml ("torch-cuda", "onnx-directml").
export const ACCELERATOR = /^(?:auto|torch-(?:cpu|cuda|xpu|mps)|onnx-(?:cpu|cuda|directml|coreml))$/;

// The helper reads one text at a time and can only be stopped mid-text by ending it, so it gets one request at a time:
// a request that is still waiting can be dropped without touching the helper and its loaded model.
// helper === null: not running, started by the next request. running === null: no request with the helper.
// A request is { id, message, resolve, reject }.
let helper = null;
let running = null;
let nextId = 1;
const waiting = [];

function startHelper() {
  const child = spawn(HELPER_COMMAND.command, HELPER_COMMAND.args, { cwd: HELPER_COMMAND.cwd, env: HELPER_COMMAND.env });
  const state = { child };
  let unreadOutput = '';
  let recentErrors = '';

  const stopped = (error) => {
    if (helper !== state) return; // already replaced: stopped by a cancel, or reported by 'error' before 'close'
    helper = null;
    const request = running;
    running = null;
    request?.reject(error);
    startNext();
  };
  const answer = (line) => {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return; // the helper writes only answers to stdout; anything else is not ours to handle
    }
    if (helper !== state || msg.id !== running?.id) return;
    const request = running;
    running = null;
    if (msg.error) request.reject(new Error(msg.error));
    else request.resolve(msg);
    startNext();
  };

  child.stdout.on('data', (data) => {
    const lines = (unreadOutput + data).split('\n');
    unreadOutput = lines.pop();
    lines.forEach(answer);
  });
  child.stderr.on('data', (data) => (recentErrors = (recentErrors + data).slice(-4000)));
  child.stdin.on('error', () => {}); // reported by the 'error' and 'close' handlers below
  child.on('error', (e) => stopped(new Error(`Could not start the detection helper ("${HELPER_COMMAND.command}"): ${e.message}. See docs/setup.md, section "Detection with GLiNER".`)));
  child.on('close', (code) => stopped(new Error(`The GLiNER helper stopped (exit code ${code}). ${recentErrors.trim().split('\n').slice(-3).join(' ')}`)));
  return state;
}

function startNext() {
  if (running || !waiting.length) return;
  running = waiting.shift();
  helper ??= startHelper();
  helper.child.stdin.write(JSON.stringify({ id: running.id, ...running.message }) + '\n');
}

/** Drops a waiting request. A running one ends the helper, which stops its work; the next request starts a new one. */
function cancel(request) {
  const index = waiting.indexOf(request);
  if (index !== -1) {
    waiting.splice(index, 1);
  } else if (running === request) {
    const { child } = helper;
    helper = null;
    running = null;
    stopProcessTree(child);
  } else {
    return; // answered already
  }
  request.reject(new Error('cancelled'));
  startNext();
}

function ask(message, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('cancelled'));
    const request = { id: nextId++, message, resolve, reject };
    signal?.addEventListener('abort', () => cancel(request), { once: true });
    waiting.push(request);
    startNext();
  });
}

async function detect({ text = '', labels = [], threshold = 0.4, model, accelerator = 'auto' }, engine, language, signal) {
  const { entities, language: used, runtime } = await ask({ text, labels, threshold, model, engine, language, accelerator }, signal);
  return { entities, language: used, runtime };
}

async function handleDetection(req, res, engine) {
  if (rejectUnlessFromApp(req, res)) return;
  const cancelOnDisconnect = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) cancelOnDisconnect.abort();
  });
  let params;
  try {
    params = JSON.parse(await readBody(req));
  } catch (e) {
    return send(res, 400, { error: e.message });
  }
  if (!MODEL_ID.test(params.model || '')) return send(res, 400, { error: 'Invalid GLiNER model name, expected e.g. "urchade/gliner_multi_pii-v1".' });
  if (GLINER_MODELS && !GLINER_MODELS.includes(params.model)) {
    return send(res, 400, { error: `"${params.model}" is not on this computer, and this app works offline. Available: ${GLINER_MODELS.join(', ') || 'none'}.` });
  }
  if (!ACCELERATOR.test(params.accelerator ?? 'auto')) return send(res, 400, { error: 'Invalid hardware choice.' });
  const language = params.language ?? 'auto';
  if (engine === 'presidio' && !LANGUAGES.includes(language)) return send(res, 400, { error: `Invalid language, expected one of ${LANGUAGES.join(', ')}.` });
  try {
    send(res, 200, await detect(params, engine, language, cancelOnDisconnect.signal));
  } catch (e) {
    if (!cancelOnDisconnect.signal.aborted) send(res, 502, { error: e.message });
  }
}

/** This machine and the hardware detection can run on (python/accelerators.py); starts the helper if needed. */
export async function handleHardware(req, res) {
  if (rejectUnlessFromApp(req, res)) return;
  try {
    const { system, backends } = await ask({ probe: true });
    send(res, 200, { system, backends });
  } catch (e) {
    send(res, 502, { error: e.message });
  }
}

export const handleGliner = (req, res) => handleDetection(req, res, 'gliner');
export const handlePresidio = (req, res) => handleDetection(req, res, 'presidio');
