import { parseWordList } from '../core/common-words.js';
import { addDetected, addEntry, parseMapping, pseudonymize, restore } from '../core/mapping.js';
import { detectWithPatterns } from '../core/patterns.js';
import { buildPrompt, findMappedValues } from '../core/prompt.js';
import { DETECTORS } from '../detection/index.js';
import { callCli } from '../targets/cli.js';
import { isAbort, whileBusy } from './busy.js';
import { markDetectorReady } from './detector-settings.js';
import { acceptedExtensions, importDocument } from '../import/index.js';
import { $, setStatus } from './dom.js';
import { downloadFile, downloadJson } from './files.js';
import { getPrompts } from './prompts-panel.js';
import { renderMappingTable, renderPreview, renderSnippet, renderSummary } from './render.js';
import { readSettings } from './settings-store.js';
import { showTab } from './tabs.js';

// textAtLastDetection === null: not detected yet, so steps 2 and 3 stay hidden and Send is locked.
// source === null: the text was typed or pasted; otherwise { name, format } of the opened file.
// document === null: the text box is the text; otherwise a PDF sent as an attachment, { file, markdown, pages,
// images, formulas, formulasConverted, tables }; file stays in this page only, for converting formulas later.
// selected === null: no placeholder chosen in the preview; otherwise the placeholder shown in valueInfo.
const state = {
  mapping: [],
  pseudoText: '',
  textAtLastDetection: null,
  source: null,
  document: null,
  selected: null,
};

const sourceText = () => state.document?.markdown ?? $('input').value;

const CONFIRM_CLEAR_MS = 4000;

const currentPrompt = () => buildPrompt(state.pseudoText, $('extraPrompt').value, { isDocument: state.document !== null });

function showNoModelNotice() {
  const patterns = $('useRegex').checked;
  $('noModelText').textContent = patterns
    ? 'Without a local model, only emails, URLs, IP addresses, phone numbers, IDs and street addresses are found. Names, companies and secrets are not.'
    : 'Choose a local model in Settings, or turn on pattern detection there.';
  $('patternsOnlyBtn').hidden = !patterns;
  $('noModelNotice').hidden = false;
  setStatus('detectStatus', '');
}

async function detect(patternsOnly = false) {
  const text = sourceText();
  if (!text.trim()) return setStatus('detectStatus', 'Paste some text or open a document first.', true);
  const settings = readSettings();
  const detector = DETECTORS[settings.detector];
  if (!detector) return setStatus('detectStatus', 'Choose a detector under Settings > Detection.', true);
  const useModel = !patternsOnly && detector.isConfigured(settings);
  if (!useModel && !patternsOnly) return showNoModelNotice();
  $('noModelNotice').hidden = true;

  try {
    const prompts = getPrompts();
    const { entities, failed, parts, note = '' } = useModel
      ? await whileBusy('Detecting sensitive values', (signal, progress) => detector.run(text, { settings, prompts, signal, progress }))
      : { entities: [], failed: 0, parts: 0 };
    if (useModel) markDetectorReady(settings.detector);
    // Patterns first: for a value both find, the pattern's category is the reliable one (an IPv6 address is IP, not URL).
    let mapping = state.mapping;
    if (settings.useRegex) for (const e of detectWithPatterns(text)) mapping = addEntry(mapping, e.text, e.category, text);
    state.mapping = addDetected(mapping, entities, text, parseWordList(prompts.notSensitive).words);
    state.textAtLastDetection = text;
    showValue(null);
    refresh();
    $('reviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (failed) {
      setStatus('detectStatus', `The local model returned unusable output for ${failed} of ${parts} part(s), so values are probably missing. Check step 2 carefully or try another model.`, true);
    } else {
      setStatus('detectStatus', `${state.mapping.length} values to hide${useModel ? '' : ' (patterns only)'}. Check them in step 2. ${note}`.trim());
    }
  } catch (e) {
    setStatus('detectStatus', isAbort(e)
      ? 'Detection cancelled. Nothing was changed.'
      : 'Detection failed: ' + e.message + detector.failureHint, !isAbort(e));
  }
}

function warnAboutMappedValuesInExtraText() {
  const leaks = findMappedValues(state.mapping, $('extraPrompt').value).map((v) => `"${v}"`);
  setStatus('extraStatus', leaks.length
    ? `This part is sent as written, but it contains values that are hidden in your text: ${leaks.join(', ')}. Remove them here, or move this part into your text in step 1.`
    : '', leaks.length > 0);
}

const SEND_HINTS = {
  notDetected: 'Run detection in step 1 first.',
  textChanged: 'Your text changed since detection. Run it again to catch new values.',
};

function updateSendState() {
  const hasDetected = state.textAtLastDetection !== null;
  $('sendBtn').disabled = !hasDetected;
  if (!hasDetected) return setStatus('sendStatus', SEND_HINTS.notDetected);
  if (state.textAtLastDetection !== sourceText()) return setStatus('sendStatus', SEND_HINTS.textChanged, true);
  const isShowingHint = Object.values(SEND_HINTS).includes($('sendStatus').textContent);
  if (isShowingHint) setStatus('sendStatus', '');
}

async function send() {
  const prompt = currentPrompt();
  if (!prompt) return setStatus('sendStatus', 'Nothing to send yet.', true);
  try {
    $('response').value = await whileBusy('Waiting for ' + $('targetName').textContent, (signal, progress) => {
      progress('Only the prompt shown in step 3 was sent.');
      const { cliAdapter, model } = readSettings();
      return callCli({ prompt, system: getPrompts().system, cliAdapter, model: model.trim() }, signal);
    });
    setStatus('sendStatus', 'Answer received.');
    reassemble();
    updateSteps();
    $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    setStatus('sendStatus', isAbort(e) ? 'Cancelled.' : 'Request failed: ' + e.message, !isAbort(e));
  }
  updateSendState();
}

function reassemble() {
  const { text, unresolved } = restore(state.mapping, $('response').value);
  $('final').textContent = text;
  setStatus('reassembleStatus', unresolved.length
    ? `Unknown placeholders left in the answer: ${unresolved.join(', ')}`
    : '', unresolved.length > 0);
}

function showValue(placeholder) {
  const entry = state.mapping.find((m) => m.placeholder === placeholder);
  state.selected = entry ? placeholder : null;
  $('valueInfo').hidden = !entry;
  if (!entry) return;
  $('valueInfoPlaceholder').textContent = placeholder;
  $('valueInfoOriginal').textContent = entry.original;
  $('keepVisibleBtn').focus();
}

function keepSelectedVisible() {
  state.mapping = state.mapping.filter((m) => m.placeholder !== state.selected);
  showValue(null);
  refresh();
}

function updatePreview() {
  state.pseudoText = pseudonymize(state.mapping, sourceText());
  renderPreview($('pseudo'), state.pseudoText, showValue);
  renderSnippet($('messageText'), state.pseudoText);
}

function updateSteps() {
  const hasDetected = state.textAtLastDetection !== null;
  $('reviewCard').hidden = !hasDetected;
  $('sendCard').hidden = !hasDetected;
  $('answerCard').hidden = !$('response').value && $('answerCard').dataset.opened !== 'true';
}

function showSource() {
  $('sourceInfo').hidden = !state.source || state.document !== null;
  if (state.source) $('sourceInfo').textContent = `Opened from ${state.source.name}. Only text is read; the file itself is never sent.`;
}

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

function showDocument() {
  const doc = state.document;
  $('input').hidden = doc !== null;
  $('documentCard').hidden = doc === null;
  $('partOneTitle').textContent = doc ? 'Your document, with the highlighted values replaced' : 'Your text, with the highlighted values replaced';
  if (!doc) return;
  const facts = [plural(doc.pages, 'page', 'pages'), doc.tables && plural(doc.tables, 'table', 'tables'),
    doc.images && `${plural(doc.images, 'image', 'images')}, not sent`,
    doc.formulas && (doc.formulasConverted ? `${plural(doc.formulas, 'formula', 'formulas')} as LaTeX` : `${plural(doc.formulas, 'formula', 'formulas')}, not converted`)];
  $('documentName').textContent = state.source.name;
  $('documentFacts').textContent = facts.filter(Boolean).join(' · ');
  const hasUnconverted = doc.formulas > 0 && !doc.formulasConverted;
  $('formulaNotice').hidden = !hasUnconverted;
  if (hasUnconverted) $('formulaText').textContent = `${plural(doc.formulas, 'formula is', 'formulas are')} marked but not sent. Converting them to LaTeX takes about a minute each.`;
  $('documentText').textContent = doc.markdown;
}

function removeDocument() {
  state.document = null;
  state.source = null;
  showDocument();
  showSource();
  setStatus('detectStatus', 'Document removed.');
  refresh();
}

function saveAsFile() {
  if (state.textAtLastDetection === null) return setStatus('sendStatus', SEND_HINTS.notDetected, true);
  // A neutral file name: the original one often contains a name ("Befund_Hans_Muster.pdf").
  downloadFile(state.document ? 'pseudonymized-document' : 'pseudonymized-text', 'md', state.pseudoText, 'text/markdown');
  setStatus('sendStatus', 'Saved part 1 to your download folder. After uploading it to a chat, paste the answer under "Already have an answer" to restore the names.');
}

export function refresh() {
  renderMappingTable($('mapBody'), state.mapping, {
    onEdit: (i, value) => {
      state.mapping = state.mapping.map((m, j) => (j === i ? { ...m, original: value } : m));
      refresh();
    },
    onRemove: (i) => {
      state.mapping = state.mapping.filter((_, j) => j !== i);
      refresh();
    },
  });
  $('valueCount').textContent = state.mapping.length;
  renderSummary($('summary'), state.mapping);
  updatePreview();
  warnAboutMappedValuesInExtraText();
  updateSendState();
  updateSteps();
}

async function openDocument(file, { formulas = false } = {}) {
  const title = formulas ? 'Converting formulas' : 'Opening ' + file.name;
  try {
    const { text, document, source } = await whileBusy(title, (signal, progress) => importDocument(file, { signal, progress, formulas }));
    state.source = source;
    if (document) {
      state.document = { file, markdown: text, ...document };
    } else {
      state.document = null;
      $('input').value = text;
    }
    showDocument();
    showSource();
    const done = formulas ? 'Formulas converted.' : 'Document opened.';
    setStatus('detectStatus', state.textAtLastDetection === null || !state.mapping.length
      ? `${done} Find the sensitive values next.`
      : `${done} Find the sensitive values again, so values in the new text are found too.`);
    refresh();
  } catch (e) {
    const cancelled = formulas ? 'Converting cancelled. Nothing was changed.' : 'Opening cancelled. Nothing was changed.';
    setStatus('detectStatus', isAbort(e) ? cancelled : e.message, !isAbort(e));
  }
}

function initDropZone() {
  const zone = $('dropZone');
  const hasFiles = (e) => [...e.dataTransfer.types].includes('Files');
  zone.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    zone.classList.add('dragging');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    zone.classList.remove('dragging');
    const [file] = e.dataTransfer.files;
    if (file) void openDocument(file);
  });
}

let clearTimer = null;

function clearValues() {
  if (!clearTimer) {
    $('clearBtn').textContent = 'Click again to remove all';
    clearTimer = setTimeout(() => {
      $('clearBtn').textContent = 'Remove all';
      clearTimer = null;
    }, CONFIRM_CLEAR_MS);
    return;
  }
  clearTimeout(clearTimer);
  clearTimer = null;
  $('clearBtn').textContent = 'Remove all';
  state.mapping = [];
  setStatus('valuesStatus', 'All values removed. Nothing is hidden now; add values or find them again in step 1.', true);
  refresh();
}

async function importValues(file) {
  try {
    state.mapping = parseMapping(JSON.parse(await file.text()));
    state.textAtLastDetection = sourceText();
    setStatus('valuesStatus', `Loaded ${state.mapping.length} values from ${file.name}.`);
    refresh();
  } catch (err) {
    setStatus('valuesStatus', `Could not load the list from ${file.name}: ${err.message}`, true);
  }
}

function openAnswerCard() {
  $('answerCard').dataset.opened = 'true';
  $('rawDetails').open = true;
  updateSteps();
  $('response').focus();
}

export function initWorkflow() {
  $('inputFile').accept = acceptedExtensions();
  $('loadFileBtn').addEventListener('click', () => $('inputFile').click());
  $('inputFile').addEventListener('change', (e) => {
    const [file] = e.target.files;
    e.target.value = '';
    if (file) void openDocument(file);
  });
  initDropZone();
  $('detectBtn').addEventListener('click', () => void detect());
  $('patternsOnlyBtn').addEventListener('click', () => void detect(true));
  $('chooseModelBtn').addEventListener('click', () => {
    $('noModelNotice').hidden = true;
    showTab('settings');
    $('detector').focus();
  });
  $('input').addEventListener('input', () => {
    updatePreview();
    updateSendState();
  });

  $('removeDocumentBtn').addEventListener('click', removeDocument);
  $('convertFormulasBtn').addEventListener('click', () => void openDocument(state.document.file, { formulas: true }));
  $('saveFileBtn').addEventListener('click', saveAsFile);
  $('keepVisibleBtn').addEventListener('click', keepSelectedVisible);
  $('closeValueInfoBtn').addEventListener('click', () => showValue(null));
  $('exportBtn').addEventListener('click', () => downloadJson('mapping', state.mapping));
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => {
    const [file] = e.target.files;
    e.target.value = '';
    if (file) void importValues(file);
  });
  $('clearBtn').addEventListener('click', clearValues);
  $('addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const value = $('newOriginal').value;
    const before = state.mapping;
    state.mapping = addEntry(state.mapping, value, $('newCategory').value || 'OTHER');
    setStatus('valuesStatus', state.mapping === before ? `"${value.trim()}" was not added: it is empty, too short or already in the list.` : '', state.mapping === before);
    $('newOriginal').value = '';
    refresh();
  });

  $('extraPrompt').addEventListener('input', warnAboutMappedValuesInExtraText);
  $('sendBtn').addEventListener('click', () => void send());
  $('pasteAnswerBtn').addEventListener('click', openAnswerCard);
  $('reassembleBtn').addEventListener('click', reassemble);
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => {
    const label = btn.textContent;
    const source = btn.dataset.copy === 'prompt' ? currentPrompt() : $('final').textContent;
    navigator.clipboard.writeText(source).then(() => {
      btn.textContent = 'Copied';
      setTimeout(() => (btn.textContent = label), 1200);
    }, () => setStatus(btn.dataset.copy === 'prompt' ? 'sendStatus' : 'reassembleStatus', 'Could not copy to the clipboard.', true));
  }));
}
