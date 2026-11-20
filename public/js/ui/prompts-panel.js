import { parseWordList } from '../core/common-words.js';
import { parseLabels } from '../core/labels.js';
import { callServer } from '../server-api.js';
import { $, setStatus } from './dom.js';
import { flagSettingsProblem } from './settings-panel.js';

// The texts under Settings > Advanced, each a file in prompts/: <name>.<ext> if the user saved one, otherwise the
// shipped <name>.default.<ext>.
const PROMPT_FILES = [
  { name: 'gliner-labels', ext: 'txt', field: 'labels' },
  { name: 'not-sensitive', ext: 'txt', field: 'notSensitive' },
  { name: 'system', ext: 'md', field: 'systemPrompt' },
];
// loadError === null: every file is loaded; otherwise what is missing, which blocks detection and sending.
let loadError = new Error('The app is still loading its texts. Try again in a moment.');
// The text of each file as loaded or last saved, by name, so Save writes only what the user changed.
const loaded = new Map();

// Wrong labels block detection, since values would be missed. A wrong line in the word list is only skipped:
// that can only hide more, never less.
function checkLists() {
  const labels = parseLabels($('labels').value);
  const words = parseWordList($('notSensitive').value);
  const problems = [...labels.errors.map((e) => 'Labels: ' + e), ...words.errors.map((e) => `Words never sensitive: ${e} (skipped)`)];
  flagSettingsProblem('prompts', loadError !== null || labels.errors.length > 0);
  if (loadError) return;
  if (problems.length) setStatus('promptStatus', problems.join('; '), true);
  else setStatus('promptStatus', `The detection model looks for ${Object.keys(labels.labels).length} labels; ${words.words.size} words are never sensitive on their own.`);
}

export async function loadPrompts() {
  try {
    const files = await callServer('api/prompts');
    for (const prompt of PROMPT_FILES) {
      const { file, text } = files.find((f) => f.name === `${prompt.name}.${prompt.ext}`);
      $(prompt.field).value = text;
      loaded.set(prompt.name, $(prompt.field).value); // as the text box holds it: its line ends are always LF
      $('src-' + prompt.name).textContent = `(${file})`;
    }
    loadError = null;
  } catch (e) {
    loadError = new Error('The texts under Settings > Advanced could not be loaded: ' + e.message);
    setStatus('promptStatus', loadError.message, true);
  }
  checkLists();
}

/** The texts as they stand in Settings; throws while they are loading or if a file is missing. */
export function getPrompts() {
  if (loadError) throw loadError;
  return { system: $('systemPrompt').value, labels: $('labels').value, notSensitive: $('notSensitive').value };
}

/** Saves every text the user changed as prompts/<name>.<ext> (never the .default files). */
async function savePrompts() {
  if (loadError) return setStatus('promptStatus', 'Nothing was saved. ' + loadError.message, true);
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
  $('labels').addEventListener('input', checkLists);
  $('notSensitive').addEventListener('input', checkLists);
}
