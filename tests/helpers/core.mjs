// Tests reach the core only through this file, so the core can move without touching the tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseWordList } from '../../public/js/core/common-words.js';
import { parseGlinerLabels } from '../../public/js/detection/gliner-labels.js';

export { addDetected, addEntry, parseMapping, pseudonymize, restore, valuePattern } from '../../public/js/core/mapping.js';
export { isOnlyCommonWords, parseWordList } from '../../public/js/core/common-words.js';
export { chunkText } from '../../public/js/core/chunking.js';
export { detectWithPatterns } from '../../public/js/core/patterns.js';
export { buildPrompt, findMappedValues } from '../../public/js/core/prompt.js';
export { categoryForLabel, parseGlinerLabels } from '../../public/js/detection/gliner-labels.js';
export { categorizePresidioEntities } from '../../public/js/detection/presidio.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DEFAULT_LABELS_FILE = path.join(ROOT, 'prompts', 'gliner-labels.default.txt');

export const GLINER_LABELS = parseGlinerLabels(fs.readFileSync(DEFAULT_LABELS_FILE, 'utf8')).labels;

export const DEFAULT_COMMON_WORDS_FILE = path.join(ROOT, 'prompts', 'not-sensitive.default.txt');

export const COMMON_WORDS = parseWordList(fs.readFileSync(DEFAULT_COMMON_WORDS_FILE, 'utf8')).words;
