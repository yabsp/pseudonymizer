import { warmUpModel } from '../detection.js';
import { callServer } from '../server-api.js';
import { $, setStatus } from './dom.js';
import { applySavedSettings, readSavedSettings, scheduleSave } from './settings-store.js';

const OTHER_MODEL = '__other';
const ABOUT_TIMEOUT_MS = 5000;
// A label's trailing explanation in brackets, e.g. " (Claude Pro/Max login)": the spaces before it, an opening
// bracket, anything, a closing bracket, at the very end of the label.
const LABEL_EXPLANATION = /\s*\(.*\)$/;

// What the server offers: the AI tools of config/adapters.json and the languages scanned pages can be read in.
let adapters = [];
let ocrLanguages = [];
// What needs attention in Settings right now, by a name for each problem ("model", "prompts").
const problems = new Set();

const selectedAdapter = () => adapters.find((a) => a.id === $('cliAdapter').value);

/** The languages for reading scanned pages, or [] if that is turned off or not installed. */
export const activeOcrLanguages = () => ($('ocr').checked ? ocrLanguages : []);

/** The red dot on the Settings tab: shown while something there needs attention. */
export function flagSettingsProblem(name, isProblem) {
  if (isProblem) problems.add(name);
  else problems.delete(name);
  $('settingsAlert').hidden = problems.size === 0;
}

/** The dropdown only fills the text field #model, which holds the model that is used. */
function showModelChoices() {
  const models = selectedAdapter()?.models ?? [];
  const model = $('model').value.trim();
  const isListed = models.some((m) => m.id === model);
  $('modelSelect').replaceChildren(...models.map((m) => new Option(m.label, m.id)), new Option('Other model…', OTHER_MODEL));
  $('modelSelect').value = isListed ? model : OTHER_MODEL;
  $('modelSelectLabel').hidden = !models.length;
  $('modelInputLabel').hidden = isListed;
}

function selectModel() {
  const isOther = $('modelSelect').value === OTHER_MODEL;
  if (!isOther) $('model').value = $('modelSelect').value;
  $('modelInputLabel').hidden = !isOther;
  if (isOther) $('model').focus();
}

function updateTargetName() {
  const tool = (selectedAdapter()?.label || 'the AI tool').replace(LABEL_EXPLANATION, '');
  const model = $('model').value.trim();
  for (const el of document.querySelectorAll('.target-name')) el.textContent = model ? `${tool} (${model})` : tool;
}

/** Shows what the server offers and the saved settings. The model is loaded afterwards (startDetection). */
export async function loadSettings() {
  try {
    const about = await callServer('api/about', { signal: AbortSignal.timeout(ABOUT_TIMEOUT_MS) });
    ({ adapters, ocrLanguages } = about);
    $('appVersion').textContent = about.version;
    $('cliAdapter').replaceChildren(...adapters.map((a) => new Option(a.label, a.id)));
  } catch (e) {
    $('cliAdapter').replaceChildren(new Option('Not available: start the app with "npm start"', ''));
    setStatus('settingsStatus', `The app's server did not answer (${e.message}). Start it with "npm start" and reload this page.`, true);
  }
  $('ocrField').hidden = !ocrLanguages.length;
  applySavedSettings(await readSavedSettings());
  showModelChoices();
  updateTargetName();
}

/** Loads the detection model in the background and says so on the main page; the page is usable meanwhile. */
export async function startDetection() {
  setStatus('modelStatus', 'Loading the detection model…');
  setStatus('startupStatus', 'Getting detection ready: loading the model…');
  try {
    markModelReady(await warmUpModel());
  } catch (e) {
    setStatus('modelStatus', 'Detection is not ready: ' + e.message, true);
    setStatus('startupStatus', 'Detection is not ready. See Settings.', true);
    flagSettingsProblem('model', true);
  }
}

/** After the model answered (model: { name, device } from detection.js): what runs where, the notices gone. */
export function markModelReady({ name, device }) {
  setStatus('modelStatus', `Detection model ready: ${name}, on ${device}. It runs on this computer.`);
  setStatus('startupStatus', '');
  flagSettingsProblem('model', false);
}

export function initSettingsPanel() {
  $('panel-settings').addEventListener('change', (e) => {
    if (e.target.closest('#advancedDetails')) return; // the texts there are saved with their own button
    updateTargetName();
    scheduleSave();
  });
  $('cliAdapter').addEventListener('change', () => {
    $('model').value = ''; // model names differ per tool
    showModelChoices();
  });
  $('modelSelect').addEventListener('change', selectModel);
}
