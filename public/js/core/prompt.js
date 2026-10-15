import { valuePattern } from './mapping.js';

export function buildPrompt(pseudoText, extraText) {
  return [pseudoText.trim(), extraText.trim()].filter(Boolean).join('\n\n');
}

/** The mapped values found in text that is sent unchanged, so the user can be warned about them. */
export function findMappedValues(mapping, text) {
  return mapping.filter((m) => m.original && new RegExp(valuePattern(m.original), 'u').test(text)).map((m) => m.original);
}
