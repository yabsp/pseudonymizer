import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { HttpError, readJson, requireFromApp, send } from './http.js';
import { startCommand, stopProcessTree, stopProcessTreeNow } from './processes.js';

// Model names as the CLIs accept them:
//   ^(?!-)       must not start with "-", so a model name can never become a command-line option
//   [\w.:\/-]+$  only letters, digits, "_", ".", ":", "/" and "-" (e.g. "claude-opus-5-5", "gpt-6.1-sol")
const MODEL_NAME = /^(?!-)[\w.:\/-]+$/;
// A stack-trace line such as "    at setupUser (file.js:311:5)": optional spaces, then "at" and a space.
const STACK_FRAME = /^\s*at\s/;
// The fields of an adapter's input template: "{system}" or "{prompt}", the name in group 1.
const INPUT_FIELD = /\{(system|prompt)\}/g;
const ERROR_LINES_SHOWN = 2;
const ERROR_CHARS_SHOWN = 600;
const DELETE_RETRIES = 5;

/** The last distinct lines of a CLI's error output, without stack traces, short enough to show. */
function summarizeErrors(stderr) {
  const lines = stderr.split('\n').map((line) => line.trim()).filter((line) => line && !STACK_FRAME.test(line));
  const lastDistinct = [...new Set(lines.reverse())].slice(0, ERROR_LINES_SHOWN).reverse();
  return lastDistinct.join(' ').slice(-ERROR_CHARS_SHOWN) || 'No output.';
}

const isModelList = (models) => Array.isArray(models) && models.every((m) => typeof m?.id === 'string' && typeof m?.label === 'string');

function buildArgs(adapter, model, systemFile) {
  // Replacer functions, as "$" has a special meaning in a replacement string; a folder name may contain "$$".
  const fill = (arg) => arg.replaceAll('{model}', () => model).replaceAll('{systemFile}', () => systemFile);
  return adapter.args.flatMap((arg) => {
    if (arg !== '{modelArgs}') return [fill(arg)];
    return model ? (adapter.modelArgs || []).map(fill) : [];
  });
}

/** The AI tools of config/adapters.json and how the page reaches them: GET /api/adapters and POST /api/cli/<id>. */
export function createCli(app) {
  const { config } = app;
  // The work folder of every CLI that is running, by its process, so all can be stopped when the app ends.
  const running = new Map();

  function loadAdapters() {
    try {
      return JSON.parse(fs.readFileSync(config.adaptersFile, 'utf8'));
    } catch (e) {
      throw new HttpError(500, 'adapters.json is invalid: ' + e.message);
    }
  }

  // Never throws: a folder Windows still holds open is left to the system's own clean-up of the temporary folder.
  const deleteFolder = (folder) => fs.rmSync(folder, { recursive: true, force: true, maxRetries: DELETE_RETRIES });

  function runAdapter(adapter, { prompt, system, model }, signal) {
    return new Promise((resolve, reject) => {
      // An empty working directory per run, so the CLI never sees project files. It holds only the instructions
      // for the model, never the prompt, which goes through stdin.
      const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-'));
      const systemFile = path.join(workDir, 'system.md');
      const args = buildArgs(adapter, model, systemFile);
      // A replacer function, so "$$" (a formula in LaTeX) or "$&" in the prompt reach the CLI as the preview shows them.
      const input = (adapter.stdin || '{prompt}').replace(INPUT_FIELD, (_, field) => (field === 'system' ? system : prompt));
      const notStarted = (e) => new Error(`Could not start "${adapter.command}": ${e.message}. Is it installed and on PATH?`);
      let child;
      try {
        fs.writeFileSync(systemFile, system);
        child = startCommand(adapter.command, args, { cwd: workDir });
      } catch (e) {
        deleteFolder(workDir);
        return reject(notStarted(e));
      }
      running.set(child, workDir);

      let out = '';
      let err = '';
      const timer = setTimeout(() => stopProcessTree(child), config.cliTimeoutMs);
      signal.addEventListener('abort', () => stopProcessTree(child), { once: true });
      const cleanUp = () => {
        clearTimeout(timer);
        running.delete(child);
        deleteFolder(workDir);
      };
      const hint = adapter.loginHint ? ` ${adapter.loginHint}` : '';

      // As text, so a character split across two pieces of output ("ü" is two bytes) is put together again.
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
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

  function readRequest({ prompt, system = '', model = '' }) {
    if (typeof prompt !== 'string' || !prompt.trim()) throw new HttpError(400, '"prompt" must be a text that is not empty.');
    if (typeof system !== 'string') throw new HttpError(400, '"system" must be a text.');
    if (typeof model !== 'string' || (model && !MODEL_NAME.test(model))) throw new HttpError(400, 'Invalid model name.');
    return { prompt, system, model };
  }

  return {
    listAdapters: () => Object.entries(loadAdapters()).map(([id, a]) => ({ id, label: a.label || id, models: isModelList(a.models) ? a.models : [] })),
    /** Synchronous, for when the app ends: no AI tool keeps running, no work folder stays. */
    stopAll() {
      for (const [child, workDir] of running) {
        stopProcessTreeNow(child);
        deleteFolder(workDir);
      }
      running.clear();
    },
    routes: [
      {
        // /api/cli/<adapter id>, the id made of letters, digits, "_" or "-"
        method: 'POST',
        path: /^\/api\/cli\/([\w-]+)$/,
        async handler(req, res, name) {
          requireFromApp(req, app.port);
          const adapters = loadAdapters();
          const adapter = Object.hasOwn(adapters, name) ? adapters[name] : null;
          if (!adapter) throw new HttpError(404, `No adapter named "${name}" in adapters.json.`);
          const request = readRequest(await readJson(req, config.maxJsonBytes));
          const cancelOnDisconnect = new AbortController();
          res.on('close', () => {
            if (!res.writableFinished) cancelOnDisconnect.abort();
          });
          try {
            send(res, 200, { text: await runAdapter(adapter, request, cancelOnDisconnect.signal) });
          } catch (e) {
            if (!cancelOnDisconnect.signal.aborted) throw new HttpError(502, e.message);
          }
        },
      },
    ],
  };
}
