import { detectWithGliner } from '../detection/gliner.js';
import { listOllamaModels } from '../detection/ollama.js';
import { $, setStatus } from './dom.js';
import { readSettings } from './settings-store.js';

let isGlinerBroken = false;

// Presidio runs in the GLiNER helper together with GLiNER, so both share its readiness.
const usesGliner = (detector) => detector === 'gliner' || detector === 'presidio';

/** The red dot on the Settings tab: shown while the selected detector can't run. */
export function updateModelAlert() {
  const isReady = usesGliner($('detector').value) ? !isGlinerBroken : !!$('ollamaModel').value;
  $('settingsAlert').hidden = isReady;
}

export function showDetectorFields() {
  const detector = $('detector').value;
  document.querySelectorAll('[data-detector]').forEach((el) => (el.hidden = !el.dataset.detector.split(' ').includes(detector)));
  updateModelAlert();
}

/** Keeps a saved model that Ollama doesn't list, marked as such, instead of silently dropping it. */
export async function loadOllamaModels(selected = $('ollamaModel').value) {
  let names = [];
  try {
    names = await listOllamaModels($('ollamaUrl').value);
    setStatus('ollamaStatus', names.length ? '' : 'No models installed in Ollama. Install one with e.g. "ollama pull qwen2.5:7b".', !names.length);
  } catch {
    setStatus('ollamaStatus', 'Ollama is not reachable at this URL. Is it running?', true);
  }
  const current = names.find((n) => n.toLowerCase() === (selected || '').toLowerCase()) || selected;
  const select = $('ollamaModel');
  select.innerHTML = '';
  select.append(new Option('Choose a model', ''));
  for (const n of names) select.append(new Option(n, n));
  if (current && !names.includes(current)) select.append(new Option(current + ' (not found in Ollama)', current));
  select.value = current || '';
  updateModelAlert();
}

function setGlinerReady() {
  isGlinerBroken = false;
  setStatus('glinerStatus', 'Model loaded and ready.');
  updateModelAlert();
}

export function markDetectorReady(detector) {
  if (usesGliner(detector) && isGlinerBroken) setGlinerReady();
}

/** Loads the model in the background, so the first detection doesn't wait for it. */
export async function warmUpGliner() {
  if (!usesGliner($('detector').value)) return;
  setStatus('glinerStatus', 'Loading the model… (the first time, it is downloaded once, about 1.2 GB)');
  try {
    await detectWithGliner('', {}, readSettings());
    setGlinerReady();
  } catch (e) {
    isGlinerBroken = true;
    setStatus('glinerStatus', 'GLiNER is not ready: ' + e.message, true);
    updateModelAlert();
  }
}
