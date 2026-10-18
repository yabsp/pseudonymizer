import { findSensitiveValues } from '../detection/find-values.js';
import { DETECTORS } from '../detection/index.js';
import { fingerprintOf } from '../import/fingerprint.js';
import { acceptedExtensions } from '../import/index.js';
import { addJob, listJobs, moveJob, readJobResult, removeJob } from '../import/jobs.js';
import { isAbort } from './busy.js';
import { markDetectorReady } from './detector-settings.js';
import { $, h, setStatus } from './dom.js';
import { notify } from './notifications.js';
import { getPrompts } from './prompts-panel.js';
import { readSettings } from './settings-store.js';
import { openConverted } from './workflow.js';

const POLL_MS = 1000;
const CONFIRM_REMOVE_MS = 4000;

// The documents in the list, by job id, in the order they were added (a Map keeps it). Each entry:
// { file, fingerprint, detect, job, imported, found, detection, opened, row }. job is the server's view (GET /api/jobs);
// the server converts, then this page finds the values. imported (the converted text, as importDocument returns
// it) and found (findSensitiveValues' result) stay in this page's memory only, until the entry is removed.
// detection: null (not started), 'waiting', 'running', 'done' or { error }; detect === false skips it.
const entries = new Map();
let pollTimer = null;
let detecting = false;

const position = (id) => [...entries.keys()].indexOf(id) + 1;
// The same bytes, converted at least as far: a copy converted without formulas doesn't stand in for one with them.
const isSameWork = (entry, fingerprint, formulas) => entry.fingerprint === fingerprint && entry.job.state !== 'failed'
  && (entry.job.formulas || !formulas);
const isConverting = (entry) => entry.job.state === 'waiting' || entry.job.state === 'running';

/** What the row says about the document; the file name is shown in this page only, never sent. */
function describeState(entry) {
  const { job, detection } = entry;
  if (job.state === 'waiting') return 'Waiting';
  if (job.state === 'running') {
    const { number, of, label, seconds } = job.step;
    return `${label}${of > 1 ? ` (step ${number} of ${of})` : ''}, ${seconds} s`;
  }
  if (job.state === 'failed') return 'Could not be converted: ' + job.error;
  if (!entry.detect) return 'Converted. Open it to find the sensitive values.';
  if (detection === 'running') return 'Finding sensitive values';
  if (detection === 'done') {
    const { mapping, failed } = entry.found;
    const warning = failed ? ' Some parts gave unusable results, check carefully.' : '';
    return `Ready to review, ${mapping.length} values to hide.${warning}${entry.opened ? ' Opened.' : ''}`;
  }
  if (detection?.error) return `Converted, but finding the values failed: ${detection.error} Open it and find them again.`;
  return 'Waiting to find sensitive values';
}

const isFinished = (entry) => entry.job.state === 'failed'
  || (entry.job.state === 'ready' && (!entry.detect || entry.detection === 'done' || entry.detection?.error !== undefined));

function finishedMessage(entry, id) {
  const which = `Document ${position(id)} of ${entries.size}`;
  if (entry.job.state === 'failed') return `${which} could not be converted.`;
  if (entry.detection === 'done') return `${which} is ready to review.`;
  if (entry.detection?.error) return `${which} is converted, but finding the values failed.`;
  return `${which} is converted.`;
}

function renderRow(id, entry) {
  if (!entry.row) {
    const number = h('span', { className: 'num' });
    const name = h('p', { className: 'job-name' }, entry.file.name);
    const state = h('p', { className: 'job-state' });
    const open = h('button', { type: 'button', className: 'small', onclick: () => void openEntry(id) }, 'Open');
    const remove = h('button', { type: 'button', className: 'ghost small danger', onclick: () => void removeEntry(id) });
    const up = h('button', { type: 'button', className: 'ghost small', 'aria-label': 'Move up', title: 'Move up', onclick: () => void moveEntry(id, -1) }, '↑');
    const down = h('button', { type: 'button', className: 'ghost small', 'aria-label': 'Move down', title: 'Move down', onclick: () => void moveEntry(id, 1) }, '↓');
    const li = h('li', { className: 'job' }, number, h('div', { className: 'job-text' }, name, state), h('div', { className: 'job-actions' }, up, down, open, remove));
    entry.row = { li, number, state, open, remove, up, down, confirmTimer: null };
  }
  const { li, number, state, open, remove, up, down, confirmTimer } = entry.row;
  li.dataset.state = entry.job.state;
  number.textContent = position(id);
  up.disabled = position(id) === 1;
  down.disabled = position(id) === entries.size;
  state.textContent = describeState(entry);
  state.classList.toggle('error', entry.job.state === 'failed' || entry.detection?.error !== undefined);
  open.hidden = entry.job.state !== 'ready' || entry.detection === 'running' || (entry.detect && entry.detection === 'waiting');
  if (!confirmTimer) remove.textContent = isConverting(entry) ? 'Cancel' : 'Remove';
  return li;
}

function render() {
  const rows = [...entries].map(([id, entry]) => renderRow(id, entry));
  // Rows are kept and updated, not rebuilt, and the list is only touched when a row was added or removed: a
  // button taken out of the page loses the keyboard focus.
  const list = $('jobList');
  const unchanged = list.children.length === rows.length && rows.every((row, i) => list.children[i] === row);
  if (!unchanged) list.replaceChildren(...rows);
}

function forgetEntry(id) {
  const entry = entries.get(id);
  if (!entry) return;
  entry.abort?.abort();
  clearTimeout(entry.row?.confirmTimer);
  entries.delete(id);
}

async function poll() {
  pollTimer = null;
  const known = [...entries.keys()]; // a file added while the list is read is not in it yet
  let jobs;
  try {
    jobs = await listJobs();
  } catch (e) {
    return setStatus('documentsStatus', `The list could not be updated: ${e.message}. Add a file to try again.`, true);
  }
  const byId = new Map(jobs.map((job) => [job.id, job]));
  const lost = known.filter((id) => entries.has(id) && !byId.has(id));
  for (const id of lost) forgetEntry(id);
  putInOrder(jobs.map((job) => job.id));
  if (lost.length) setStatus('documentsStatus', 'The app was restarted, so the documents it was converting are gone. Add the files again.', true);
  for (const [id, entry] of entries) {
    if (!byId.has(id)) continue;
    const wasFinished = isFinished(entry);
    entry.job = byId.get(id);
    if (entry.job.state === 'ready' && entry.detect && entry.detection === null) entry.detection = 'waiting';
    if (!wasFinished && isFinished(entry)) notify(finishedMessage(entry, id));
  }
  render();
  void runDetections(); // in the background, one document at a time; each records its own failure
  if ([...entries.values()].some(isConverting)) pollTimer = setTimeout(() => void poll(), POLL_MS);
}

function startPolling() {
  if (pollTimer === null) pollTimer = setTimeout(() => void poll(), 0);
}

/** Finds the values in each converted document in turn, as Find sensitive values would in step 1. Never throws. */
async function runDetections() {
  if (detecting) return;
  detecting = true;
  try {
    for (let next = waitingForDetection(); next; next = waitingForDetection()) await detectEntry(...next);
  } finally {
    detecting = false;
  }
}

const waitingForDetection = () => [...entries].find(([, entry]) => entry.detection === 'waiting');

async function detectEntry(id, entry) {
  entry.detection = 'running';
  entry.abort = new AbortController();
  render();
  try {
    const settings = readSettings();
    const detector = DETECTORS[settings.detector];
    if (!detector?.isConfigured(settings)) throw new Error('No detection model is chosen in Settings.');
    entry.imported = await readJobResult(id, entry.file);
    entry.found = await findSensitiveValues(entry.imported.text, [], { detector, settings, prompts: getPrompts(), signal: entry.abort.signal });
    markDetectorReady(settings.detector);
    entry.detection = 'done';
  } catch (e) {
    if (isAbort(e) || !entries.has(id)) return; // removed meanwhile; nothing to show
    entry.detection = { error: e.message + (DETECTORS[readSettings().detector]?.failureHint ?? '') };
  }
  entry.abort = null;
  if (!entries.has(id)) return;
  notify(finishedMessage(entry, id));
  render();
}

/** Reorders the entries as the server lists the jobs; ids the server doesn't know (yet) keep their place at the end. */
function putInOrder(ids) {
  const ordered = ids.filter((id) => entries.has(id)).map((id) => [id, entries.get(id)]);
  const rest = [...entries].filter(([id]) => !ids.includes(id));
  entries.clear();
  for (const [id, entry] of [...ordered, ...rest]) entries.set(id, entry);
}

/** Moves a document one place up (-1) or down (1); a waiting one is then converted in its new place. */
async function moveEntry(id, by) {
  const to = position(id) + by;
  if (!entries.has(id) || to < 1 || to > entries.size) return;
  const ids = [...entries.keys()].filter((other) => other !== id);
  ids.splice(to - 1, 0, id);
  putInOrder(ids);
  render();
  entries.get(id).row[by < 0 ? 'up' : 'down'].focus();
  try {
    await moveJob(id, to);
  } catch (e) {
    setStatus('documentsStatus', `The document could not be moved: ${e.message}`, true);
  }
  startPolling(); // shows the server's order, also after a failed move
}

async function addFiles(files) {
  const problems = [];
  const skipped = [];
  for (const file of files) {
    try {
      const formulas = $('jobFormulas').checked;
      const fingerprint = await fingerprintOf(file);
      const sameId = [...entries].find(([, entry]) => isSameWork(entry, fingerprint, formulas))?.[0];
      if (sameId) {
        skipped.push(`"${file.name}" is already in the list as document ${position(sameId)}.`);
        continue;
      }
      const job = await addJob(file, { formulas, accelerator: readSettings().accelerator || 'auto' });
      entries.set(job.id, { file, fingerprint, detect: $('jobDetect').checked, job, imported: null, found: null, detection: null, opened: false, row: null, abort: null });
    } catch (e) {
      problems.push(e.message.includes(file.name) ? e.message : `${file.name}: ${e.message}`);
    }
  }
  const notes = [...(problems.length ? ['Not added: ' + problems.join(' ')] : []), ...skipped];
  setStatus('documentsStatus', notes.join(' '), problems.length > 0);
  render();
  startPolling();
}

/**
 * The converted text (and the values found, if detection is done) of a document in the list with the same bytes,
 * for step 1, so the same file isn't converted twice; null if there is none ready.
 */
export async function convertedCopy(fingerprint, formulas) {
  const found = [...entries].find(([, entry]) => isSameWork(entry, fingerprint, formulas) && entry.job.state === 'ready');
  if (!found) return null;
  const [id, entry] = found;
  entry.imported ??= await readJobResult(id, entry.file);
  entry.opened = true;
  render();
  return { imported: entry.imported, found: entry.detection === 'done' ? entry.found : null };
}

async function openEntry(id) {
  const entry = entries.get(id);
  if (!entry) return;
  try {
    entry.imported ??= await readJobResult(id, entry.file);
    entry.opened = true;
    render();
    openConverted(entry.imported, entry.file, entry.detection === 'done' ? entry.found : null, entry.fingerprint);
  } catch (e) {
    setStatus('documentsStatus', `Document ${position(id)} could not be opened: ${e.message}`, true);
  }
}

/** Removing a running conversion or a ready document loses work, so it takes a second click. */
async function removeEntry(id) {
  const entry = entries.get(id);
  if (!entry) return;
  const losesWork = entry.job.state === 'running' || (entry.job.state === 'ready' && !entry.opened);
  if (losesWork && !entry.row.confirmTimer) {
    entry.row.remove.textContent = isConverting(entry) ? 'Click again to cancel' : 'Click again to remove';
    entry.row.confirmTimer = setTimeout(() => {
      entry.row.confirmTimer = null;
      render();
    }, CONFIRM_REMOVE_MS);
    return;
  }
  const hadFocus = entry.row.li.contains(document.activeElement);
  forgetEntry(id);
  render();
  if (hadFocus) $('addDocumentsBtn').focus();
  try {
    await removeJob(id);
  } catch (e) {
    setStatus('documentsStatus', `The server could not remove the document: ${e.message}`, true);
  }
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
    void addFiles([...e.dataTransfer.files]);
  });
}

export function initDocuments() {
  $('documentFiles').accept = acceptedExtensions();
  $('addDocumentsBtn').addEventListener('click', () => $('documentFiles').click());
  $('documentFiles').addEventListener('change', (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    void addFiles(files);
  });
  initDropZone();
}
