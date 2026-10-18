import crypto from 'node:crypto';
import { DOCUMENT_FORMATS, MAX_JOBS, MAX_PDF_BYTES, MAX_TEXT_BYTES, MAX_WAITING_BYTES } from './config.js';
import { extractPdf, isPdf, PDF_NOT_AVAILABLE } from './documents.js';
import { ACCELERATOR } from './gliner.js';
import { BodyTooLargeError, readBytes, rejectUnlessFromApp, rejectUnlessFromAppOrigin, send } from './http.js';

// The steps of a pipeline: { label, run(input, { formulas, accelerator, signal }) -> output }. The first step gets the uploaded
// bytes; the last one returns { text, document? } as the importers in public/js/import/ do, document holding the
// facts about a PDF. Each step deletes its own temporary files. A new tool (Word, OCR of images) is one more step.
const READ_TEXT = {
  label: 'Reading the text',
  // As the browser reads a text file: UTF-8, a byte order mark dropped, broken characters replaced.
  run: async (bytes) => ({ text: new TextDecoder().decode(bytes) }),
};
const EXTRACT_PDF = {
  label: 'Reading text, tables and images',
  async run(bytes, { formulas, accelerator, signal }) {
    const { markdown, ...document } = await extractPdf(bytes, { formulas, accelerator }, signal);
    return { text: markdown, document };
  },
};

// One pipeline per format: the type the page uploads it with (one an HTML form can't send, see
// rejectUnlessFromApp), the size limit, a check of the bytes (an error message or null) and the steps.
const PIPELINES = {
  text: { contentType: 'application/octet-stream', maxBytes: MAX_TEXT_BYTES, check: () => null, steps: [READ_TEXT] },
  pdf: {
    contentType: 'application/pdf',
    maxBytes: MAX_PDF_BYTES,
    check: (bytes) => (isPdf(bytes) ? null : 'This file is not a PDF.'),
    unavailable: DOCUMENT_FORMATS.includes('pdf') ? null : PDF_NOT_AVAILABLE,
    steps: [EXTRACT_PDF],
  },
};

// Jobs in the order they were added; in memory only, so they are gone when the app closes.
// state: 'waiting' -> 'running' -> 'ready' or 'failed'. input (the uploaded bytes) is held only while waiting,
// result ({ text, document? }) only once ready. A cancelled job is removed, so it has no state of its own here.
const jobs = [];
let running = null;

const MiB = 1024 * 1024;
const waitingBytes = () => jobs.reduce((sum, job) => sum + (job.input?.length ?? 0), 0);

/** What the page sees of a job: its state and step, never its text. */
function describe(job) {
  const steps = PIPELINES[job.format].steps;
  return {
    id: job.id,
    format: job.format,
    formulas: job.formulas,
    state: job.state,
    step: job.state === 'running'
      ? { number: job.stepIndex + 1, of: steps.length, label: steps[job.stepIndex].label, seconds: Math.floor((Date.now() - job.stepStartedAt) / 1000) }
      : null,
    error: job.error,
  };
}

/** Runs the first waiting job, then the next: one at a time, as the steps use all CPU cores. Never throws. */
async function runNext() {
  if (running) return;
  const job = jobs.find((j) => j.state === 'waiting');
  if (!job) return;
  running = job;
  job.state = 'running';
  job.cancel = new AbortController();
  let value = job.input;
  job.input = null;
  try {
    for (const [index, step] of PIPELINES[job.format].steps.entries()) {
      job.stepIndex = index;
      job.stepStartedAt = Date.now();
      value = await step.run(value, { formulas: job.formulas, accelerator: job.accelerator, signal: job.cancel.signal });
    }
    job.result = value;
    job.state = 'ready';
  } catch (e) {
    job.state = 'failed';
    job.error = e.message;
  } finally {
    running = null;
  }
  void runNext(); // the next job runs in the background; each job records its own failure
}

export async function addJob(req, res) {
  const params = new URL(req.url, 'http://x').searchParams;
  const format = params.get('format');
  const pipeline = Object.hasOwn(PIPELINES, format) ? PIPELINES[format] : null;
  if (!pipeline) return send(res, 400, { error: `Unknown format, expected one of ${Object.keys(PIPELINES).join(', ')}.` });
  if (rejectUnlessFromApp(req, res, pipeline.contentType)) return;
  if (pipeline.unavailable) return send(res, 501, { error: pipeline.unavailable });
  if (jobs.length >= MAX_JOBS) return send(res, 429, { error: `There are already ${MAX_JOBS} documents in the list. Remove some first.` });
  let bytes;
  try {
    bytes = await readBytes(req, pipeline.maxBytes);
  } catch (e) {
    if (e instanceof BodyTooLargeError) return send(res, 413, { error: `The file is ${e.message}. Split it into smaller parts.` });
    return send(res, 400, { error: e.message });
  }
  const problem = pipeline.check(bytes);
  if (problem) return send(res, 415, { error: problem });
  if (waitingBytes() + bytes.length > MAX_WAITING_BYTES) {
    return send(res, 413, { error: `More than ${MAX_WAITING_BYTES / MiB} MB of documents are waiting. Add this one when some are done.` });
  }
  const accelerator = params.get('accelerator') || 'auto';
  if (!ACCELERATOR.test(accelerator)) return send(res, 400, { error: 'Invalid hardware choice.' });
  const job = { id: crypto.randomUUID(), format, formulas: format === 'pdf' && params.get('formulas') === '1', accelerator, state: 'waiting', input: bytes, result: null, error: null };
  jobs.push(job);
  void runNext(); // runs in the background; the page follows it with GET /api/jobs
  send(res, 201, describe(job));
}

export const listJobs = (req, res) => send(res, 200, jobs.map(describe));

export function getJob(req, res, id) {
  const job = jobs.find((j) => j.id === id);
  if (!job) return send(res, 404, { error: 'This document is no longer in the list.' });
  send(res, 200, { ...describe(job), result: job.result });
}

/** Cancels the job if it is waiting or running (its process is stopped and its files deleted) and forgets it. */
export function removeJob(req, res, id) {
  if (rejectUnlessFromAppOrigin(req, res)) return;
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) return send(res, 404, { error: 'This document is no longer in the list.' });
  const [job] = jobs.splice(index, 1);
  job.cancel?.abort();
  job.input = null;
  job.result = null;
  send(res, 200, { id });
}
