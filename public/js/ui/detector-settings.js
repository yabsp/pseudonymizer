import { describeRuntime, detectWithGliner } from '../detection/gliner.js';
import { listOllamaModels } from '../detection/ollama.js';
import { callServer } from '../server-api.js';
import { $, h, setStatus } from './dom.js';
import { readSettings, scheduleSave } from './settings-store.js';

let isGlinerBroken = false;

// Presidio runs in the GLiNER helper together with GLiNER, so both share its readiness.
const usesGliner = (detector) => detector === 'gliner' || detector === 'presidio';

/** The red dot on the Settings tab: shown while the selected detector can't run. */
export function updateModelAlert() {
  const isReady = usesGliner($('detector').value) ? !isGlinerBroken : !!$('ollamaModel').value;
  $('settingsAlert').hidden = isReady;
}

const ABOUT_TIMEOUT_MS = 3000;

/**
 * Removes detectors this app doesn't have (the desktop app ships without Presidio). A saved choice that is gone
 * switches to GLiNER, and the user is told, so nothing silently runs with a different detector.
 */
export async function limitToAvailableDetectors() {
  let available;
  try {
    ({ detectors: available } = await callServer('api/about', { signal: AbortSignal.timeout(ABOUT_TIMEOUT_MS) }));
  } catch {
    return; // an older or unreachable server: keep every option, detection reports its own errors
  }
  const select = $('detector');
  const saved = select.options[select.selectedIndex]?.text;
  for (const option of [...select.options]) if (!available.includes(option.value)) option.remove();
  if (select.value) return;
  select.value = 'gliner';
  setStatus('detectStatus', `"${saved}" is not available in this app, so GLiNER is used. You can change this under Settings.`, true);
  scheduleSave();
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

function setGlinerReady(runtime) {
  isGlinerBroken = false;
  // A GPU that failed its check is reported, not hidden: the detection is still correct, but slower than chosen.
  setStatus('glinerStatus', `Model loaded and ready. ${describeRuntime(runtime)}`.trim(), Boolean(runtime?.notice));
  updateModelAlert();
}

// The hardware check imports PyTorch and may start the helper, which takes a few seconds the first time.
const HARDWARE_TIMEOUT_MS = 30000;

function describeSystem({ os, architecture, cpu, threads, memoryGb, gpus }) {
  const memory = memoryGb ? `, ${memoryGb} GB memory` : '';
  return [`${os} (${architecture}), ${cpu}, ${threads} threads${memory}`, gpus.length ? `Graphics and accelerators: ${gpus.join('; ')}` : 'No graphics adapters found.'];
}

function renderHardware({ system, backends }) {
  const usable = backends.filter((b) => b.available);
  const list = backends.map((b) => h('li', { className: b.available ? 'usable' : 'unusable' },
    h('strong', {}, b.label), b.available ? `: usable${b.device ? `, ${b.device}` : ''}` : `: ${b.reason}${b.hint ? ` ${b.hint}` : ''}`));
  $('hardwareInfo').replaceChildren(...describeSystem(system).map((line) => h('p', {}, line)), h('ul', { className: 'hardware-list' }, ...list));
  return usable;
}

/**
 * Fills the hardware choice with what this machine can use. A saved choice that is no longer usable (another
 * computer, a different PyTorch) becomes "Automatic", and the user is told.
 */
export async function loadHardware(saved = $('accelerator').value) {
  let report;
  try {
    report = await callServer('api/hardware', { method: 'POST', body: {}, signal: AbortSignal.timeout(HARDWARE_TIMEOUT_MS) });
  } catch (e) {
    $('hardwareInfo').replaceChildren(h('p', {}, `The hardware could not be checked (${e.message}). Detection uses the automatic choice.`));
    return;
  }
  const select = $('accelerator');
  select.replaceChildren(new Option('Automatic (recommended)', 'auto'), ...renderHardware(report).map((b) => new Option(b.label, b.id)));
  const isUsable = [...select.options].some((o) => o.value === saved);
  select.value = isUsable ? saved : 'auto';
  if (!isUsable && saved) {
    setStatus('hardwareStatus', `The saved hardware choice is not usable on this computer, so it is set to Automatic.`, true);
    scheduleSave();
  }
}

export function markDetectorReady(detector) {
  if (usesGliner(detector) && isGlinerBroken) setGlinerReady(null);
}

/** Loads the model in the background, so the first detection doesn't wait for it. */
export async function warmUpGliner() {
  if (!usesGliner($('detector').value)) return;
  setStatus('glinerStatus', 'Loading the model… (the first time, it is downloaded once, about 1.2 GB)');
  try {
    const { runtime } = await detectWithGliner('', {}, readSettings());
    setGlinerReady(runtime);
  } catch (e) {
    isGlinerBroken = true;
    setStatus('glinerStatus', 'GLiNER is not ready: ' + e.message, true);
    updateModelAlert();
  }
}
