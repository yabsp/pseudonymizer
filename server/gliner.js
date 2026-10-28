import { spawn } from 'node:child_process';
import { GLINER_MODELS, HELPER_COMMAND } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';

// Hugging Face model ids: "owner/name", each part letters, digits, "_", "." or "-" (e.g. "urchade/gliner_multi_pii-v1").
const MODEL_ID = /^[\w.-]+\/[\w.-]+$/;
const LANGUAGES = ['auto', 'de', 'fr', 'en'];
// The hardware choices of python/accelerators.py: "auto", PyTorch on cpu, cuda, xpu or mps, or ONNX Runtime on
// cpu, cuda, directml or coreml ("torch-cuda", "onnx-directml").
export const ACCELERATOR = /^(?:auto|torch-(?:cpu|cuda|xpu|mps)|onnx-(?:cpu|cuda|directml|coreml))$/;

let helper = null;

function startHelper() {
  const child = spawn(HELPER_COMMAND.command, HELPER_COMMAND.args, { cwd: HELPER_COMMAND.cwd, env: HELPER_COMMAND.env });
  const state = { child, pending: new Map(), nextId: 1 };
  let unreadOutput = '';
  let recentErrors = '';

  const failAll = (error) => {
    for (const request of state.pending.values()) request.reject(error);
    state.pending.clear();
    if (helper === state) helper = null;
  };
  const answer = (line) => {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return; // the helper writes only answers to stdout; anything else is not ours to handle
    }
    const request = state.pending.get(msg.id);
    if (!request) return;
    state.pending.delete(msg.id);
    if (msg.error) request.reject(new Error(msg.error));
    else request.resolve(msg);
  };

  child.stdout.on('data', (data) => {
    const lines = (unreadOutput + data).split('\n');
    unreadOutput = lines.pop();
    lines.forEach(answer);
  });
  child.stderr.on('data', (data) => (recentErrors = (recentErrors + data).slice(-4000)));
  child.stdin.on('error', () => {}); // reported by the 'error' and 'close' handlers below
  child.on('error', (e) => failAll(new Error(`Could not start the detection helper ("${HELPER_COMMAND.command}"): ${e.message}. See docs/setup.md, section "Detection with GLiNER".`)));
  child.on('close', (code) => failAll(new Error(`The GLiNER helper stopped (exit code ${code}). ${recentErrors.trim().split('\n').slice(-3).join(' ')}`)));
  return state;
}

function ask(request) {
  helper ??= startHelper();
  const { child, pending } = helper;
  const id = helper.nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ id, ...request }) + '\n');
  });
}

async function detect({ text = '', labels = [], threshold = 0.4, model, accelerator = 'auto' }, engine, language) {
  const { entities, language: used, runtime } = await ask({ text, labels, threshold, model, engine, language, accelerator });
  return { entities, language: used, runtime };
}

async function handleDetection(req, res, engine) {
  if (rejectUnlessFromApp(req, res)) return;
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
    send(res, 200, await detect(params, engine, language));
  } catch (e) {
    send(res, 502, { error: e.message });
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
