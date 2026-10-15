import { listCliAdapters } from '../targets/cli.js';
import { $ } from './dom.js';

const OTHER_MODEL = '__other';

// A label's trailing explanation in brackets, e.g. " (Claude Pro/Max login)":
//   \s*   the spaces before it
//   \(.*\) an opening bracket, anything, a closing bracket
//   $     at the very end of the label
const LABEL_EXPLANATION = /\s*\(.*\)$/;

let adapters = [];

const selectedAdapter = () => adapters.find((a) => a.id === $('cliAdapter').value);

export async function loadAdapters() {
  const select = $('cliAdapter');
  try {
    adapters = await listCliAdapters();
    select.innerHTML = '';
    for (const a of adapters) select.append(new Option(a.label, a.id));
  } catch {
    adapters = [];
    select.innerHTML = '<option value="">Start the app with "npm start" to use CLIs</option>';
  }
}

/** The dropdown only fills the text field #model, which holds the model that is used. */
export function showModelChoices() {
  const models = selectedAdapter()?.models ?? [];
  const model = $('model').value.trim();
  const isListed = models.some((m) => m.id === model);
  const select = $('modelSelect');
  select.innerHTML = '';
  for (const m of models) select.append(new Option(m.label, m.id));
  select.append(new Option('Other model…', OTHER_MODEL));
  select.value = isListed ? model : OTHER_MODEL;
  $('modelSelectLabel').hidden = !models.length;
  $('modelInputLabel').hidden = isListed;
}

export function selectModel() {
  const value = $('modelSelect').value;
  const isOther = value === OTHER_MODEL;
  if (!isOther) $('model').value = value;
  $('modelInputLabel').hidden = !isOther;
  if (isOther) $('model').focus();
}

export function updateTargetName() {
  const cli = (selectedAdapter()?.label || 'CLI').replace(LABEL_EXPLANATION, '');
  const model = $('model').value.trim();
  for (const el of document.querySelectorAll('.target-name')) el.textContent = model ? `${cli} (${model})` : cli;
}
