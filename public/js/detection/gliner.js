import { callServer } from '../server-api.js';
import { categoryForLabel } from './gliner-labels.js';

export const DEFAULT_GLINER_MODEL = 'urchade/gliner_multi_pii-v1';

/** An empty text only loads the model, so the first real detection doesn't wait for it. */
export async function detectWithGliner(text, labels, { glinerModel, glinerThreshold }, signal) {
  const { entities } = await callServer('api/detect/gliner', {
    method: 'POST',
    signal,
    body: {
      text,
      labels: Object.keys(labels),
      threshold: Number(glinerThreshold) || 0.4,
      model: glinerModel.trim() || DEFAULT_GLINER_MODEL,
    },
  });
  return entities.map((e) => ({ text: e.text, category: categoryForLabel(labels, e.label) }));
}
