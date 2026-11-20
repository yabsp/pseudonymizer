import { parseWordList } from './core/common-words.js';
import { categoryForLabel, parseLabels } from './core/labels.js';
import { addDetected, addEntry, normalizeText } from './core/mapping.js';
import { detectWithPatterns } from './core/patterns.js';
import { callServer } from './server-api.js';

export const DEFAULT_THRESHOLD = 0.4;

/**
 * Loads the detection model on the local server, so the first text doesn't wait for it. Resolves to { name, device }:
 * the model's name and what it runs on ("the processor", "the graphics card (DirectML)" ...).
 */
export async function warmUpModel() {
  const { model, device } = await callServer('api/detect', { method: 'POST', body: { text: '', labels: [] } });
  return { name: model, device };
}

/** The labels of the Settings tab as { label: CATEGORY }; throws if a line is wrong, as values would be missed. */
function readLabels(prompts) {
  const { labels, errors } = parseLabels(prompts.labels);
  if (errors.length) throw new Error('the labels under Settings > Advanced need fixing: ' + errors.join('; '));
  return labels;
}

/**
 * Adds the sensitive values in a text to mapping: what the fixed patterns find, then what the local model finds
 * (not with patternsOnly). Resolves to { mapping, usedModel, model } (model: { name, device } as warmUpModel gives
 * it, or null); throws if the model can't be asked, so nothing is ever sent after a detection that only half ran.
 */
export async function findSensitiveValues(original, mapping, { settings, prompts, signal, patternsOnly = false }) {
  // Patterns, model and replacement all read the text in the same form, so a name written with a combining
  // umlaut is found and replaced too.
  const text = normalizeText(original);
  let entities = [];
  let model = null;
  if (!patternsOnly) {
    const labels = readLabels(prompts);
    const answer = await callServer('api/detect', {
      method: 'POST',
      signal,
      body: { text, labels: Object.keys(labels), threshold: Number(settings.threshold) || DEFAULT_THRESHOLD },
    });
    model = { name: answer.model, device: answer.device };
    entities = answer.entities.map((e) => ({ text: e.text, category: categoryForLabel(labels, e.label) }));
  }
  // Patterns first: for a value both find, the pattern's category is the reliable one.
  let found = mapping;
  for (const e of detectWithPatterns(text)) found = addEntry(found, e.text, e.category, text);
  found = addDetected(found, entities, text, parseWordList(prompts.notSensitive).words);
  return { mapping: found, usedModel: !patternsOnly, model };
}
