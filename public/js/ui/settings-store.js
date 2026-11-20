import { callServer } from '../server-api.js';
import { $, setStatus } from './dom.js';

// The settings that are form fields with a value; "ocr" is a checkbox next to them.
const SETTING_FIELDS = ['threshold', 'cliAdapter', 'model'];
const BROWSER_COPY_KEY = 'pseudo-settings';
const SAVE_DELAY_MS = 400;

export function readSettings() {
  const settings = Object.fromEntries(SETTING_FIELDS.map((field) => [field, $(field).value]));
  return { ...settings, ocr: $('ocr').checked };
}

/** settings.json through the server; the browser copy only when the server can't be reached. */
export async function readSavedSettings() {
  try {
    return await callServer('api/settings');
  } catch {
    // fall back to the browser copy below
  }
  try {
    return JSON.parse(localStorage.getItem(BROWSER_COPY_KEY) || '{}');
  } catch {
    return {}; // storage blocked or damaged: start with the defaults
  }
}

/** Shows saved settings in the form. A sensitivity saved by an earlier version ("glinerThreshold") still counts. */
export function applySavedSettings(saved) {
  const values = { ...saved, threshold: saved.threshold ?? saved.glinerThreshold };
  for (const field of SETTING_FIELDS) {
    if (typeof values[field] !== 'string') continue;
    $(field).value = values[field];
    // A select keeps its default when the saved value is not one of its choices.
    if ($(field).tagName === 'SELECT' && $(field).value !== values[field]) $(field).selectedIndex = [...$(field).options].findIndex((o) => o.defaultSelected);
  }
  $('ocr').checked = saved.ocr !== false;
}

async function saveSettings() {
  const settings = readSettings();
  try {
    localStorage.setItem(BROWSER_COPY_KEY, JSON.stringify(settings));
  } catch {
    // only a fallback copy; whether the file was saved is reported below
  }
  try {
    const { file } = await callServer('api/settings', { method: 'PUT', body: settings });
    setStatus('settingsStatus', `Saved to ${file}.`);
  } catch (e) {
    setStatus('settingsStatus', `Saved in this browser only, not to a file (${e.message}).`, true);
  }
}

let saveTimer;
export function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void saveSettings(), SAVE_DELAY_MS);
}
