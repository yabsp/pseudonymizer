import { findSensitiveValues } from '../detection.js';
import { acceptedExtensions, findImporter, importDocument } from '../import/index.js';
import { isAbort } from './busy.js';
import { $, h, setStatus } from './dom.js';
import { getPrompts } from './prompts-panel.js';
import { activeOcrLanguages, markModelReady } from './settings-panel.js';
import { readSettings } from './settings-store.js';
import { openConverted } from './workflow.js';

const CONFIRM_REMOVE_MS = 4000;

// The documents in the list, in the order they were added. Everything stays in this page's memory and is gone when
// the page is closed: the file, the text read from it (imported, as importDocument returns it) and the values
// found in it (found, as findSensitiveValues returns it).
// state: 'waiting' -> 'reading' -> 'detecting' -> 'ready', or 'failed' (with error). detail: what the reader is
// doing right now ("Reading page 3 of 12").
const entries = [];
// isWorking: one document at a time is read and checked, as that already uses the whole processor.
let isWorking = false;

function describeState(entry) {
  if (entry.state === 'waiting') return 'Waiting';
  if (entry.state === 'reading') return entry.detail || 'Reading the file on this computer';
  if (entry.state === 'detecting') return 'Finding sensitive values';
  if (entry.state === 'failed') return 'Not ready: ' + entry.error;
  const unread = entry.imported.document?.unreadPages.length ?? 0;
  return `Ready to check, ${entry.found.mapping.length} values to hide.${unread ? ` ${unread} scanned ${unread === 1 ? 'page was' : 'pages were'} not read.` : ''}${entry.opened ? ' Opened.' : ''}`;
}

function renderRow(entry) {
  if (!entry.row) {
    const number = h('span', { className: 'num' });
    const name = h('p', { className: 'document-row-name' }, entry.file.name);
    const state = h('p', { className: 'document-row-state' });
    const open = h('button', { type: 'button', className: 'small', onclick: () => openEntry(entry) }, 'Open');
    const remove = h('button', { type: 'button', className: 'ghost small danger', onclick: () => removeEntry(entry) });
    const li = h('li', { className: 'document-row' }, number, h('div', { className: 'document-row-text' }, name, state), h('div', { className: 'document-row-actions' }, open, remove));
    entry.row = { li, number, state, open, remove, confirmTimer: null };
  }
  const { li, number, state, open, remove, confirmTimer } = entry.row;
  li.dataset.state = entry.state;
  number.textContent = entries.indexOf(entry) + 1;
  state.textContent = describeState(entry);
  state.classList.toggle('error', entry.state === 'failed');
  open.hidden = entry.state !== 'ready';
  if (!confirmTimer) remove.textContent = entry.state === 'reading' || entry.state === 'detecting' ? 'Cancel' : 'Remove';
  return li;
}

function render() {
  const rows = entries.map(renderRow);
  // Rows are kept and updated, not rebuilt, and the list is only touched when a row was added or removed: a
  // button taken out of the page loses the keyboard focus.
  const list = $('documentList');
  const unchanged = list.children.length === rows.length && rows.every((row, i) => list.children[i] === row);
  if (!unchanged) list.replaceChildren(...rows);
  const waiting = entries.filter((entry) => entry.state !== 'ready' && entry.state !== 'failed').length;
  $('documentsCount').hidden = !entries.length;
  $('documentsCount').textContent = waiting ? `${entries.length - waiting}/${entries.length}` : String(entries.length);
}

/** Reads one document and finds its values, as step 1 would; records its own failure. */
async function work(entry) {
  entry.abort = new AbortController();
  const { signal } = entry.abort;
  try {
    entry.state = 'reading';
    render();
    const progress = (detail) => {
      entry.detail = detail;
      render();
    };
    entry.imported = await importDocument(entry.file, { signal, progress, ocrLanguages: activeOcrLanguages() });
    entry.state = 'detecting';
    render();
    entry.found = await findSensitiveValues(entry.imported.text, [], { settings: readSettings(), prompts: getPrompts(), signal });
    markModelReady(entry.found.model);
    entry.state = 'ready';
  } catch (e) {
    if (isAbort(e) || !entries.includes(entry)) return; // removed meanwhile; nothing to show
    entry.state = 'failed';
    entry.error = e.message;
  } finally {
    entry.abort = null;
  }
}

/** Works through the waiting documents in list order. Never throws. */
async function workThroughList() {
  if (isWorking) return;
  isWorking = true;
  try {
    for (let next = entries.find((e) => e.state === 'waiting'); next; next = entries.find((e) => e.state === 'waiting')) {
      await work(next);
      render();
    }
  } finally {
    isWorking = false;
  }
}

function addFiles(files) {
  const problems = [];
  for (const file of files) {
    try {
      findImporter(file);
      entries.push({ file, state: 'waiting', detail: '', error: null, imported: null, found: null, opened: false, abort: null, row: null });
    } catch (e) {
      problems.push(e.message);
    }
  }
  setStatus('documentsStatus', problems.length ? 'Not added: ' + problems.join(' ') : '', problems.length > 0);
  render();
  void workThroughList();
}

function openEntry(entry) {
  entry.opened = true;
  render();
  openConverted(entry.imported, entry.found);
}

/** Removing a document that is being read or is ready but was never opened loses work, so it takes a second click. */
function removeEntry(entry) {
  const losesWork = entry.state === 'reading' || entry.state === 'detecting' || (entry.state === 'ready' && !entry.opened);
  if (losesWork && !entry.row.confirmTimer) {
    entry.row.remove.textContent = entry.state === 'ready' ? 'Click again to remove' : 'Click again to cancel';
    entry.row.confirmTimer = setTimeout(() => {
      entry.row.confirmTimer = null;
      render();
    }, CONFIRM_REMOVE_MS);
    return;
  }
  clearTimeout(entry.row.confirmTimer);
  const hadFocus = entry.row.li.contains(document.activeElement);
  entries.splice(entries.indexOf(entry), 1);
  entry.abort?.abort();
  render();
  if (hadFocus) $('addDocumentsBtn').focus();
}

function initDropZone() {
  const zone = $('documentsDropZone');
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
    addFiles([...e.dataTransfer.files]);
  });
}

export function initDocuments() {
  $('documentFiles').accept = acceptedExtensions();
  $('addDocumentsBtn').addEventListener('click', () => $('documentFiles').click());
  $('documentFiles').addEventListener('change', (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    addFiles(files);
  });
  initDropZone();
}
