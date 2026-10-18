import { callServer } from '../server-api.js';
import { findImporter } from './index.js';

// Reading the list is a short call; the conversion itself runs on the server, outside these requests.
const LIST_TIMEOUT_MS = 10000;
const MiB = 1024 * 1024;

/**
 * Uploads the file to the local server's Documents list (server/jobs.js), which converts it on this machine.
 * Only the bytes go there, not the file name. Resolves to the job as GET /api/jobs lists it.
 */
export async function addJob(file, { formulas = false, accelerator = 'auto' } = {}) {
  const importer = findImporter(file);
  const { format, contentType, maxBytes } = importer.job;
  if (file.size > maxBytes) throw new Error(`"${file.name}" is larger than ${maxBytes / MiB} MB. Split it into smaller parts.`);
  const pdfOptions = format === 'pdf' ? { accelerator, ...(formulas ? { formulas: '1' } : {}) } : {};
  const query = '?' + new URLSearchParams({ format, ...pdfOptions });
  return callServer('api/jobs' + query, { method: 'POST', body: file, contentType });
}

/** Moves a document to a position in the list (1 is first); waiting documents are converted in list order. */
export function moveJob(id, position) {
  return callServer(`api/jobs/${id}/move`, { method: 'POST', body: { position }, signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
}

/** The jobs in the order they were added: { id, format, formulas, state, step, error }, never their text. */
export const listJobs = () => callServer('api/jobs', { signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });

/** A ready job's result in the shape importDocument returns, with file the job was made from. */
export async function readJobResult(id, file) {
  const { result } = await callServer('api/jobs/' + id, { signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
  if (!result || typeof result.text !== 'string') throw new Error('The converted document is not available. Add the file again.');
  return { text: result.text, document: result.document ?? null, source: { name: file.name, format: findImporter(file).label } };
}

/** Cancels the job on the server (its process is stopped, its files deleted) and removes it from the list. */
export const removeJob = (id) => callServer('api/jobs/' + id, { method: 'DELETE', signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
