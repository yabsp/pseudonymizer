import { loadGliner } from './gliner.js';
import { HttpError, readJson, requireFromApp, send } from './http.js';

const MAX_LABELS = 100;
const MAX_LABEL_CHARS = 100;
const DEFAULT_THRESHOLD = 0.4;

const isLabelList = (labels) => Array.isArray(labels) && labels.length <= MAX_LABELS
  && labels.every((label) => typeof label === 'string' && label.trim() && label.length <= MAX_LABEL_CHARS);

/**
 * The detection model, loaded when it is first needed and kept. It reads one text at a time, as one text already
 * uses every processor core or the whole graphics card; the others wait. loadModel is loadGliner, or a stand-in in
 * tests.
 */
export function createDetection(config, loadModel = loadGliner) {
  // model === null: not loaded, the next request loads it; otherwise the promise of the loaded model.
  let model = null;
  let last = Promise.resolve();

  function getModel() {
    model ??= loadModel(config.modelDir, { threads: config.threads, device: config.device }).catch((e) => {
      model = null; // not kept, so installing the model and trying again works without a restart
      throw e;
    });
    return model;
  }

  /** Runs task after everything asked before; a task whose request was cancelled meanwhile never starts. */
  function inTurn(task, signal) {
    const run = last.then(() => {
      signal.throwIfAborted();
      return task();
    });
    last = run.catch(() => {}); // the next one runs whatever happened to this one, which reports its own failure
    return run;
  }

  return {
    /** An empty text only loads the model, so the first real detection doesn't wait for it. */
    detect: ({ text, labels, threshold }, signal) => inTurn(async () => {
      const loaded = await getModel();
      const started = Date.now();
      const entities = await loaded.detect(text, labels, threshold, signal);
      return { entities, model: loaded.name, device: loaded.device.label, ms: Date.now() - started };
    }, signal),
    /** Lets the text being read come to its next stop (its request was cancelled by then), then frees the model. */
    async close() {
      await last;
      const loaded = await model?.catch(() => null);
      model = null;
      await loaded?.release();
    },
  };
}

function readRequest(config, { text = '', labels = [], threshold = DEFAULT_THRESHOLD }) {
  if (typeof text !== 'string') throw new HttpError(400, '"text" must be a text.');
  if (text.length > config.maxTextChars) throw new HttpError(413, `The text is longer than ${config.maxTextChars.toLocaleString('en')} characters. Split it into smaller parts.`);
  if (!isLabelList(labels)) throw new HttpError(400, `"labels" must be a list of up to ${MAX_LABELS} short texts.`);
  if (typeof threshold !== 'number' || !(threshold > 0 && threshold < 1)) throw new HttpError(400, '"threshold" must be a number between 0 and 1.');
  return { text, labels, threshold };
}

export function detectRoutes(app, detection) {
  return [{
    method: 'POST',
    path: '/api/detect',
    async handler(req, res) {
      requireFromApp(req, app.port);
      const request = readRequest(app.config, await readJson(req, app.config.maxJsonBytes));
      const cancelOnDisconnect = new AbortController();
      res.on('close', () => {
        if (!res.writableFinished) cancelOnDisconnect.abort();
      });
      try {
        send(res, 200, await detection.detect(request, cancelOnDisconnect.signal));
      } catch (e) {
        // The reason is the model's or the setup's ("not installed"), never the text.
        if (!cancelOnDisconnect.signal.aborted) throw new HttpError(502, e.message);
      }
    },
  }];
}
