import { parseWordList } from '../core/common-words.js';
import { addDetected, addEntry, normalizeText } from '../core/mapping.js';
import { detectWithPatterns } from '../core/patterns.js';

/**
 * Adds the sensitive values in text to mapping: the detector's (null for patterns only), then the patterns if
 * turned on. Resolves to { mapping, failed, parts, note, usedModel }; throws if the detector fails.
 */
export async function findSensitiveValues(original, mapping, { detector, settings, prompts, signal, progress = () => {} }) {
  // The detectors read the text in the form the core compares in, so a name with a combining umlaut is found too.
  const text = normalizeText(original);
  const { entities, failed, parts, note = '' } = detector
    ? await detector.run(text, { settings, prompts, signal, progress })
    : { entities: [], failed: 0, parts: 0 };
  // Patterns first: for a value both find, the pattern's category is the reliable one (an IPv6 address is IP, not URL).
  let found = mapping;
  if (settings.useRegex) for (const e of detectWithPatterns(text)) found = addEntry(found, e.text, e.category, text);
  found = addDetected(found, entities, text, parseWordList(prompts.notSensitive).words);
  return { mapping: found, failed, parts, note, usedModel: detector !== null };
}
