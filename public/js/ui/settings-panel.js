import { $ } from './dom.js';
import { loadOllamaModels, showDetectorFields, updateModelAlert, warmUpGliner } from './detector-settings.js';
import { applySavedSettings, readSavedSettings, scheduleSave } from './settings-store.js';
import { loadAdapters, selectModel, showModelChoices, updateTargetName } from './target-settings.js';

export async function loadSettings() {
  await loadAdapters();
  const saved = await readSavedSettings();
  applySavedSettings(saved);
  showModelChoices();
  showDetectorFields();
  await loadOllamaModels(saved.ollamaModel || '');
  updateTargetName();
}

function switchCli() {
  $('model').value = ''; // model names differ per CLI
  showModelChoices();
}

export function initSettingsPanel() {
  $('panel-settings').addEventListener('change', () => {
    updateTargetName();
    scheduleSave();
  });
  $('cliAdapter').addEventListener('change', switchCli);
  $('modelSelect').addEventListener('change', selectModel);
  $('detector').addEventListener('change', () => {
    showDetectorFields();
    void warmUpGliner();
  });
  $('glinerModel').addEventListener('change', () => void warmUpGliner());
  $('ollamaUrl').addEventListener('change', () => void loadOllamaModels());
  $('ollamaModel').addEventListener('change', updateModelAlert);
  $('reloadOllamaBtn').addEventListener('click', () => void loadOllamaModels());
}
