import { parseWordList } from '../core/common-words.js';
import { parseGlinerLabels } from '../detection/gliner-labels.js';
import { callServer } from '../server-api.js';
import { $, setStatus } from './dom.js';

const PROMPT_FILES = [
  { name: 'gliner-labels', ext: 'txt', field: 'glinerLabels' },
  { name: 'not-sensitive', ext: 'txt', field: 'notSensitive' },
  { name: 'rules', ext: 'md', field: 'rules' },
  { name: 'detection', ext: 'md', field: 'detectionPrompt' },
  { name: 'system', ext: 'md', field: 'systemPrompt' },
];
let missingFilesError = null;
// The text of each prompt as loaded or last saved, by name, so Save writes only what the user changed.
const loaded = new Map();

/** prompts/<name>.<ext> if the user created it, otherwise the shipped prompts/<name>.default.<ext>. */
async function readPromptFile({ name, ext }) {
  for (const file of [`prompts/${name}.${ext}`, `prompts/${name}.default.${ext}`]) {
    const res = await fetch(file, { cache: 'no-store' }).catch(() => null);
    if (res?.ok) return { file, text: await res.text() };
  }
  throw new Error(`Missing prompt file: prompts/${name}.${ext} or prompts/${name}.default.${ext}`);
}

// Broken labels block GLiNER detection, since it would miss values. A broken word-list line is only
// skipped: that can only make more values hidden, never fewer.
function checkLists() {
  const labels = parseGlinerLabels($('glinerLabels').value);
  const words = parseWordList($('notSensitive').value);
  const problems = [
    ...labels.errors.map((e) => 'GLiNER labels: ' + e),
    ...words.errors.map((e) => `Words never sensitive: ${e} (skipped)`),
  ];
  $('promptsAlert').hidden = !missingFilesError && !problems.length;
  if (missingFilesError) return;
  if (problems.length) setStatus('promptStatus', problems.join('; '), true);
  else setStatus('promptStatus', `Prompt files loaded. GLiNER looks for ${Object.keys(labels.labels).length} labels; ${words.words.size} words are never sensitive on their own.`);
}

export async function loadPrompts() {
  missingFilesError = null;
  const errors = [];
  for (const prompt of PROMPT_FILES) {
    try {
      const { file, text } = await readPromptFile(prompt);
      $(prompt.field).value = text;
      loaded.set(prompt.name, $(prompt.field).value); // as the text box holds it: its line ends are always LF
      $('src-' + prompt.name).textContent = `(${file})`;
    } catch (e) {
      $(prompt.field).value = '';
      $('src-' + prompt.name).textContent = '(missing)';
      errors.push(e.message);
    }
  }
  if (errors.length) {
    missingFilesError = new Error(errors.join(' | '));
    setStatus('promptStatus', missingFilesError.message, true);
  }
  checkLists();
}

/** The prompts as edited in the tab; throws if a prompt file is missing, which blocks detection and sending. */
export function getPrompts() {
  if (missingFilesError) throw missingFilesError;
  return {
    system: $('systemPrompt').value,
    detection: $('detectionPrompt').value,
    rules: $('rules').value,
    glinerLabels: $('glinerLabels').value,
    notSensitive: $('notSensitive').value,
  };
}

/** Saves every prompt the user changed from what was loaded as prompts/<name>.<ext> (never the .default files). */
async function savePrompts() {
  if (missingFilesError) return setStatus('promptStatus', 'Some prompt files are missing, so nothing was saved. ' + missingFilesError.message, true);
  if (loaded.size < PROMPT_FILES.length) return setStatus('promptStatus', 'The prompt files are still loading. Try again in a moment.', true);
  const changed = PROMPT_FILES.filter((prompt) => $(prompt.field).value !== loaded.get(prompt.name));
  if (!changed.length) return setStatus('promptStatus', 'Nothing changed since the files were loaded.');
  try {
    for (const prompt of changed) {
      const { file } = await callServer(`api/prompts/${prompt.name}.${prompt.ext}`, { method: 'PUT', body: { text: $(prompt.field).value } });
      loaded.set(prompt.name, $(prompt.field).value);
      $('src-' + prompt.name).textContent = `(${file})`;
    }
    setStatus('promptStatus', `Saved ${changed.map((p) => `${p.name}.${p.ext}`).join(', ')}.`);
  } catch (e) {
    setStatus('promptStatus', 'Could not save: ' + e.message, true);
  }
}

export function initPromptsPanel() {
  $('savePrompts').addEventListener('click', () => void savePrompts());
  $('reloadPrompts').addEventListener('click', () => void loadPrompts());
  $('glinerLabels').addEventListener('input', checkLists);
  $('notSensitive').addEventListener('input', checkLists);
}
