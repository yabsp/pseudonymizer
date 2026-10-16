import { callServer } from '../server-api.js';
import { $, setStatus } from './dom.js';

const SETTING_FIELDS = ['detector', 'glinerModel', 'glinerThreshold', 'presidioLanguage', 'accelerator', 'ollamaUrl', 'ollamaModel', 'cliAdapter', 'model'];
const BROWSER_COPY_KEY = 'pseudo-settings';
const SAVE_DELAY_MS = 400;

export function readSettings() {
  const settings = Object.fromEntries(SETTING_FIELDS.map((field) => [field, $(field).value]));
  return { ...settings, useRegex: $('useRegex').checked };
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

export function applySavedSettings(saved) {
  for (const field of SETTING_FIELDS) if (saved[field] !== undefined) $(field).value = saved[field];
  $('useRegex').checked = saved.useRegex !== false;
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
    setStatus('settingsStatus', `Saved in this browser only, not to a file (${e.message}). Start the app with "npm start" to save to settings.json.`, true);
  }
}

let saveTimer;
export function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSettings, SAVE_DELAY_MS);
}
