import { DEFAULT_GLINER_MODEL, describeRuntime, detectWithGliner } from '../detection/gliner.js';
import { listOllamaModels } from '../detection/ollama.js';
import { callServer } from '../server-api.js';
import { $, h, setStatus } from './dom.js';
import { readSettings, scheduleSave } from './settings-store.js';

let isGlinerBroken = false;
// appKind === null: not known yet (or an older server); otherwise "server" or "desktop", from api/about.
let appKind = null;
// The back ends api/hardware reported as usable, in the order "auto" tries them; [] until it answered.
let usableBackends = [];

// Presidio runs in the GLiNER helper together with GLiNER, so both share its readiness.
const usesGliner = (detector) => detector === 'gliner' || detector === 'presidio';

/** The red dot on the Settings tab: shown while the selected detector can't run. */
export function updateModelAlert() {
  const isReady = usesGliner($('detector').value) ? !isGlinerBroken : !!$('ollamaModel').value;
  $('settingsAlert').hidden = isReady;
}

const ABOUT_TIMEOUT_MS = 3000;

/**
 * Removes detectors this app doesn't have. A saved choice that is gone switches to GLiNER, and the user is told,
 * so nothing silently runs with a different detector.
 */
export async function limitToAvailableDetectors() {
  let available;
  let glinerModels;
  try {
    ({ detectors: available, app: appKind, glinerModels } = await callServer('api/about', { signal: AbortSignal.timeout(ABOUT_TIMEOUT_MS) }));
  } catch {
    return; // an older or unreachable server: keep every option, detection reports its own errors
  }
  limitToInstalledModels(glinerModels);
  const select = $('detector');
  const saved = select.options[select.selectedIndex]?.text;
  for (const option of [...select.options]) if (!available.includes(option.value)) option.remove();
  if (select.value) return;
  select.value = 'gliner';
  setStatus('detectStatus', `"${saved}" is not available in this app, so GLiNER is used. You can change this under Settings.`, true);
  scheduleSave();
}

/**
 * Offline (always in the desktop app) only the GLiNER models on this computer can be loaded: the field offers
 * those, can't be edited when there is only one, and a saved model that isn't there switches to one that is, and
 * the user is told. models null (or missing, an older server): any model, downloaded on first use.
 */
function limitToInstalledModels(models) {
  if (!Array.isArray(models)) return;
  const input = $('glinerModel');
  $('glinerModelList').replaceChildren(...models.map((name) => new Option(name, name)));
  input.readOnly = models.length === 1;
  const saved = input.value.trim() || DEFAULT_GLINER_MODEL;
  if (models.includes(saved)) {
    input.value = saved;
    return;
  }
  if (!models.length) {
    setStatus('glinerModelStatus', 'No GLiNER model is on this computer, and this app works offline.', true);
    return;
  }
  input.value = models.includes(DEFAULT_GLINER_MODEL) ? DEFAULT_GLINER_MODEL : models[0];
  setStatus('glinerModelStatus', `"${saved}" is not on this computer, and this app works offline, so "${input.value}" is used.`, true);
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
  usableBackends = renderHardware(report);
  select.replaceChildren(new Option('Automatic (recommended)', 'auto'), ...usableBackends.map((b) => new Option(b.label, b.id)));
  const isUsable = [...select.options].some((o) => o.value === saved);
  select.value = isUsable ? saved : 'auto';
  if (!isUsable && saved) {
    setStatus('hardwareStatus', `The saved hardware choice is not usable on this computer, so it is set to Automatic.`, true);
    scheduleSave();
  }
}

/**
 * Keeps the saved hardware choice selected while the hardware is being checked; the list only has "Automatic"
 * until then, and saving another setting meanwhile would otherwise overwrite the choice with it.
 */
export function keepSavedAccelerator(saved) {
  const select = $('accelerator');
  if (!saved || [...select.options].some((o) => o.value === saved)) return;
  select.append(new Option('Your saved choice (checking the hardware…)', saved));
  select.value = saved;
}

export function markDetectorReady(detector) {
  if (usesGliner(detector) && isGlinerBroken) setGlinerReady(null);
}

// "auto" never picks ONNX Runtime on the CPU (python/accelerators.py, AUTO_ORDER).
const isAutoCandidate = (backend) => backend.id !== 'onnx-cpu';

/** The label of the GPU detection is about to be checked on, or null for the CPU or when that is not known yet. */
function expectedGpu() {
  const choice = $('accelerator').value;
  const backend = choice === 'auto' ? usableBackends.find(isAutoCandidate) : usableBackends.find((b) => b.id === choice);
  return backend && !backend.id.endsWith('-cpu') ? backend.label : null;
}

/** What the model is doing while it loads; the download only happens outside the desktop app, which ships it. */
function describeLoading() {
  const gpu = expectedGpu();
  const steps = gpu ? `Loading the model and checking it on the ${gpu} against the CPU…` : 'Loading the model…';
  return appKind === 'desktop' ? steps : `${steps} If it is not on this computer yet, it is downloaded once (about 1.2 GB).`;
}

/** The line on the main page while detection gets ready; empty once it is. */
const showStartup = (message, isError = false) => setStatus('startupStatus', message, isError);

/** Loads the model in the background, so the first detection doesn't wait for it. */
export async function warmUpGliner() {
  if (!usesGliner($('detector').value)) return showStartup('');
  setStatus('glinerStatus', describeLoading());
  showStartup('Getting detection ready: loading the model…');
  try {
    const { runtime } = await detectWithGliner('', {}, readSettings());
    setGlinerReady(runtime);
    showStartup(runtime?.notice ?? '', Boolean(runtime?.notice));
  } catch (e) {
    isGlinerBroken = true;
    setStatus('glinerStatus', 'GLiNER is not ready: ' + e.message, true);
    showStartup('Detection is not ready. See Settings > Detection.', true);
    updateModelAlert();
  }
}

/**
 * At startup: checks the hardware, then loads the model on it. The page is usable meanwhile; a detection started
 * now waits for the model in the helper. savedAccelerator is the saved choice, which needs the hardware list.
 */
export async function startDetection(savedAccelerator) {
  if (usesGliner($('detector').value)) {
    setStatus('glinerStatus', 'Checking the hardware…');
    showStartup('Getting detection ready: checking the hardware…');
  }
  await loadHardware(savedAccelerator);
  await warmUpGliner();
}
