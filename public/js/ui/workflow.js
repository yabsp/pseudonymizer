import { addEntry, parseMapping, pseudonymize, restore } from '../core/mapping.js';
import { buildPrompt, findMappedValues, whySendIsBlocked } from '../core/prompt.js';
import { findSensitiveValues } from '../detection.js';
import { acceptedExtensions, importDocument } from '../import/index.js';
import { callCli } from '../targets/cli.js';
import { isAbort, whileBusy } from './busy.js';
import { $, setStatus } from './dom.js';
import { downloadFile, downloadJson } from './files.js';
import { getPrompts } from './prompts-panel.js';
import { renderMappingTable, renderPreview, renderSnippet, renderSummary } from './render.js';
import { activeOcrLanguages, markModelReady } from './settings-panel.js';
import { readSettings } from './settings-store.js';
import { showTab } from './tabs.js';

// textAtLastDetection === null: not detected yet, so steps 2 and 3 stay hidden and Send is locked.
// detectionProblem === null: the values belong to the text as detected; 'listLoaded': a saved list replaced them,
// which locks sending until detection runs again (whySendIsBlocked).
// source === null: the text was typed or pasted; otherwise { name, format } of the opened file.
// document === null: the text box is the text; otherwise a PDF sent as an attachment: { text, pages, images,
// scannedPages, recognizedPages, unreadPages }.
// selected === null: no placeholder chosen in the preview; otherwise the placeholder shown in valueInfo.
const state = {
  mapping: [],
  pseudoText: '',
  textAtLastDetection: null,
  detectionProblem: null,
  source: null,
  document: null,
  selected: null,
};

const CONFIRM_CLEAR_MS = 4000;

const sourceText = () => state.document?.text ?? $('input').value;
const currentPrompt = () => buildPrompt(state.pseudoText, $('extraPrompt').value, { isDocument: state.document !== null });

async function detect({ patternsOnly = false } = {}) {
  const text = sourceText();
  if (!text.trim()) return setStatus('detectStatus', 'Paste some text or open a document first.', true);
  $('modelNotice').hidden = true;
  try {
    const options = { settings: readSettings(), prompts: getPrompts(), patternsOnly };
    const found = patternsOnly
      ? await findSensitiveValues(text, state.mapping, options)
      : await whileBusy('Finding sensitive values', (signal, progress) => {
        progress('On this computer. Longer documents take a little longer.');
        return findSensitiveValues(text, state.mapping, { ...options, signal });
      });
    if (found.usedModel) markModelReady(found.model);
    showFound(found);
  } catch (e) {
    if (isAbort(e)) return setStatus('detectStatus', 'Cancelled. Nothing was changed.');
    // Never silently with less protection: the user sees why and decides.
    $('modelNoticeText').textContent = e.message;
    $('modelNotice').hidden = false;
    setStatus('detectStatus', '');
  }
}

/** Shows the result of findSensitiveValues in step 2, for the text now in step 1. */
function showFound({ mapping, usedModel }) {
  state.mapping = mapping;
  state.textAtLastDetection = sourceText();
  state.detectionProblem = null;
  showValue(null);
  refresh();
  $('reviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setStatus('detectStatus', `${mapping.length} values to hide${usedModel ? '' : ' (found without the detection model: names and companies are missing)'}. Check them in step 2.`, !usedModel);
}

function warnAboutMappedValuesInExtraText() {
  const leaks = findMappedValues(state.mapping, $('extraPrompt').value).map((v) => `"${v}"`);
  setStatus('extraStatus', leaks.length
    ? `This part is sent as written, but it contains values that are hidden in your text: ${leaks.join(', ')}. Remove them here, or move this part into your text in step 1.`
    : '', leaks.length > 0);
}

const SEND_HINTS = {
  notDetected: 'Run detection in step 1 first.',
  textChanged: 'Your text changed since detection, so new values would not be hidden. Press "Find sensitive values" again in step 1 before sending.',
  listLoaded: 'A saved list replaced the values found. Press "Find sensitive values" again in step 1 before sending, so values missing from the list are found too.',
};

const whyBlocked = () => whySendIsBlocked({ textAtLastDetection: state.textAtLastDetection, currentText: sourceText(), detectionProblem: state.detectionProblem });

/** Everything that takes the text out of the app: Send, Copy message and Save as file. */
function updateSendState() {
  const blocked = whyBlocked();
  for (const button of [$('sendBtn'), $('saveFileBtn'), document.querySelector('[data-copy="prompt"]')]) button.disabled = blocked !== null;
  if (blocked) return setStatus('sendStatus', SEND_HINTS[blocked], blocked !== 'notDetected');
  const isShowingHint = Object.values(SEND_HINTS).includes($('sendStatus').textContent);
  if (isShowingHint) setStatus('sendStatus', '');
}

/** Checked again on every click, as the text may have changed in a way that didn't update the buttons. */
function isBlocked() {
  updateSendState();
  return whyBlocked() !== null;
}

async function send() {
  if (isBlocked()) return;
  const prompt = currentPrompt();
  if (!prompt) return setStatus('sendStatus', 'Nothing to send yet.', true);
  try {
    const system = getPrompts().system;
    $('response').value = await whileBusy('Waiting for ' + $('targetName').textContent, (signal, progress) => {
      progress('Only the message shown in step 3 was sent.');
      const { cliAdapter, model } = readSettings();
      return callCli({ prompt, system, cliAdapter, model: model.trim() }, signal);
    });
    setStatus('sendStatus', 'Answer received.');
    reassemble();
    updateSteps();
    $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    setStatus('sendStatus', isAbort(e) ? 'Cancelled.' : 'Sending failed: ' + e.message, !isAbort(e));
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
  if (state.source) $('sourceInfo').textContent = `Opened from ${state.source.name}. Only its text is read; the file itself is never sent.`;
}

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

function showDocument() {
  const doc = state.document;
  $('input').hidden = doc !== null;
  $('documentCard').hidden = doc === null;
  $('partOneTitle').textContent = doc ? 'Your document, with the highlighted values replaced' : 'Your text, with the highlighted values replaced';
  if (!doc) return;
  const facts = [plural(doc.pages, 'page', 'pages'), doc.images && `${plural(doc.images, 'image', 'images')}, not sent`,
    doc.recognizedPages && `${plural(doc.recognizedPages, 'scanned page', 'scanned pages')} read from the picture`];
  $('documentName').textContent = state.source.name;
  $('documentFacts').textContent = facts.filter(Boolean).join(' · ');
  const unread = doc.unreadPages.length;
  $('documentNotice').hidden = !unread;
  if (unread) {
    $('documentNotice').textContent = `${unread === 1 ? 'Page' : 'Pages'} ${doc.unreadPages.join(', ')} ${unread === 1 ? 'is a scanned image' : 'are scanned images'} and could not be read, so ${unread === 1 ? 'its' : 'their'} text is missing from what is sent.`
      + ' Turn on reading scanned pages in Settings and open the file again.';
  }
  $('documentText').textContent = doc.text;
}

/** An answer belongs to the text it was asked about: restored with another text's values it would get wrong names. */
function clearAnswer() {
  $('response').value = '';
  $('final').textContent = '';
  setStatus('reassembleStatus', '');
  setStatus('sendStatus', '');
  delete $('answerCard').dataset.opened;
}

function removeDocument() {
  state.document = null;
  state.source = null;
  clearAnswer();
  showDocument();
  showSource();
  setStatus('detectStatus', 'Document removed.');
  refresh();
}

function saveAsFile() {
  if (isBlocked()) return;
  // A neutral file name: the original one often contains a name ("Befund_Hans_Muster.pdf").
  downloadFile(state.document ? 'pseudonymized-document' : 'pseudonymized-text', 'txt', state.pseudoText, 'text/plain');
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

function putIntoStepOne({ text, document, source }) {
  clearAnswer();
  state.source = source;
  if (document) {
    state.document = { text, ...document };
  } else {
    state.document = null;
    $('input').value = text;
  }
  showDocument();
  showSource();
}

async function openDocument(file) {
  try {
    const imported = await whileBusy('Opening ' + file.name, (signal, progress) => importDocument(file, { signal, progress, ocrLanguages: activeOcrLanguages() }));
    putIntoStepOne(imported);
    setStatus('detectStatus', state.textAtLastDetection === null || !state.mapping.length
      ? 'Document opened. Find the sensitive values next.'
      : 'Document opened. Find the sensitive values again, so values in the new text are found too.');
    refresh();
  } catch (e) {
    setStatus('detectStatus', isAbort(e) ? 'Opening cancelled. Nothing was changed.' : e.message, !isAbort(e));
  }
}

/**
 * Opens a document from the Documents tab in step 1: imported as importDocument returns it, found as
 * findSensitiveValues returns it for that text (with a fresh mapping). The values of the previous text are replaced
 * and step 2 shows the new ones; sending stays the user's step.
 */
export function openConverted(imported, found) {
  showTab('work');
  putIntoStepOne(imported);
  showFound(found);
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
    state.detectionProblem = 'listLoaded';
    setStatus('valuesStatus', `Loaded ${state.mapping.length} values from ${file.name}. You can restore an answer with them now; to send, find the sensitive values again in step 1.`);
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
  $('retryDetectBtn').addEventListener('click', () => void detect());
  $('patternsOnlyBtn').addEventListener('click', () => void detect({ patternsOnly: true }));
  $('input').addEventListener('input', () => {
    updatePreview();
    updateSendState();
  });

  $('removeDocumentBtn').addEventListener('click', removeDocument);
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
    if (btn.dataset.copy === 'prompt' && isBlocked()) return;
    const label = btn.textContent;
    const source = btn.dataset.copy === 'prompt' ? currentPrompt() : $('final').textContent;
    navigator.clipboard.writeText(source).then(() => {
      btn.textContent = 'Copied';
      setTimeout(() => (btn.textContent = label), 1200);
    }, () => setStatus(btn.dataset.copy === 'prompt' ? 'sendStatus' : 'reassembleStatus', 'Could not copy to the clipboard.', true));
  }));
}
