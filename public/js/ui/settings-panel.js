import { $, setStatus } from './dom.js';
import { keepSavedAccelerator, limitToAvailableDetectors, loadOllamaModels, showDetectorFields, updateModelAlert, warmUpGliner } from './detector-settings.js';
import { applySavedSettings, readSavedSettings, scheduleSave } from './settings-store.js';
import { loadAdapters, selectModel, showModelChoices, updateTargetName } from './target-settings.js';

/**
 * Shows the saved settings with the fields of the saved detector; resolves to the saved settings. The hardware
 * check and loading the model come after (startDetection), so the page doesn't wait for them.
 */
export async function loadSettings() {
  await loadAdapters();
  const saved = await readSavedSettings();
  applySavedSettings(saved);
  keepSavedAccelerator(saved.accelerator);
  showModelChoices();
  showDetectorFields();
  updateTargetName();
  await limitToAvailableDetectors();
  showDetectorFields();
  await loadOllamaModels(saved.ollamaModel || '');
  return saved;
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
  $('accelerator').addEventListener('change', () => {
    setStatus('hardwareStatus', '');
    void warmUpGliner(); // background work: loads and checks the model on the chosen hardware
  });
  $('ollamaUrl').addEventListener('change', () => void loadOllamaModels());
  $('ollamaModel').addEventListener('change', updateModelAlert);
  $('reloadOllamaBtn').addEventListener('click', () => void loadOllamaModels());
}
