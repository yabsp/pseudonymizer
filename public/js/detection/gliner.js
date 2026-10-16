import { callServer } from '../server-api.js';
import { categoryForLabel } from './gliner-labels.js';

export const DEFAULT_GLINER_MODEL = 'urchade/gliner_multi_pii-v1';

/**
 * runtime: where detection ran ({ id, label, verified?, notice? }, see python/accelerators.py). The plain text,
 * so the user sees it: "Runs on CPU (PyTorch)." or the notice why a GPU is not used.
 */
export function describeRuntime(runtime) {
  if (!runtime) return '';
  if (runtime.notice) return runtime.notice;
  return `Runs on ${runtime.label}${runtime.verified ? ', results checked against PyTorch on the CPU' : ''}.`;
}

/** An empty text only loads the model, so the first real detection doesn't wait for it. Resolves to { entities, runtime }. */
export async function detectWithGliner(text, labels, { glinerModel, glinerThreshold, accelerator }, signal) {
  const { entities, runtime } = await callServer('api/detect/gliner', {
    method: 'POST',
    signal,
    body: {
      text,
      labels: Object.keys(labels),
      threshold: Number(glinerThreshold) || 0.4,
      model: glinerModel.trim() || DEFAULT_GLINER_MODEL,
      accelerator: accelerator || 'auto',
    },
  });
  return { entities: entities.map((e) => ({ text: e.text, category: categoryForLabel(labels, e.label) })), runtime };
}
