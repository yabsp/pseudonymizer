import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DOCUMENT_COMMAND, DOCUMENT_FORMATS, DOCUMENT_TIMEOUT_MS, MAX_PDF_BYTES } from './config.js';
import { ACCELERATOR } from './gliner.js';
import { BodyTooLargeError, readBytes, rejectUnlessFromApp, send } from './http.js';
import { stopProcessTree } from './processes.js';

// Every PDF file starts with "%PDF-".
const PDF_SIGNATURE = '%PDF-';
export const PDF_NOT_AVAILABLE = 'Opening PDFs is not available in this app. Copy the text out of the PDF and paste it instead.';
const RESULT_COUNTS = ['pages', 'images', 'formulas', 'tables'];

export const isPdf = (bytes) => bytes.subarray(0, PDF_SIGNATURE.length).toString('latin1') === PDF_SIGNATURE;

const isResult = (r) => r && typeof r.markdown === 'string' && typeof r.formulasConverted === 'boolean' && typeof r.device === 'string'
  && RESULT_COUNTS.every((key) => Number.isInteger(r[key]) && r[key] >= 0)
  && (r.deviceNote === undefined || typeof r.deviceNote === 'string');
// Only these fields go to the page; anything else the reader prints is dropped.
const pickResult = ({ markdown, pages, images, formulas, formulasConverted, tables, device, deviceNote }) => ({
  markdown, pages, images, formulas, formulasConverted, tables, device, ...(deviceNote === undefined ? {} : { deviceNote }),
});

/**
 * Extracts the PDF in a separate process. The file is written to a private temporary folder that is deleted
 * afterwards in every case; nothing of it is kept or logged.
 */
export function extractPdf(bytes, { formulas, accelerator }, signal) {
  return new Promise((resolve, reject) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-doc-'));
    const file = path.join(dir, 'document.pdf');
    fs.writeFileSync(file, bytes, { mode: 0o600 });
    const args = [...DOCUMENT_COMMAND.args, file, '--accelerator', accelerator, ...(formulas ? ['--formulas'] : [])];
    const child = spawn(DOCUMENT_COMMAND.command, args, { cwd: DOCUMENT_COMMAND.cwd });
    let out = '';
    let recentErrors = '';
    const timer = setTimeout(() => stopProcessTree(child), DOCUMENT_TIMEOUT_MS);
    signal.addEventListener('abort', () => stopProcessTree(child), { once: true });
    const cleanUp = () => {
      clearTimeout(timer);
      fs.rmSync(dir, { recursive: true, force: true });
    };
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (recentErrors = (recentErrors + d).slice(-2000)));
    child.on('error', (e) => {
      cleanUp();
      reject(new Error(`Could not start the document reader ("${DOCUMENT_COMMAND.command}"): ${e.message}.`));
    });
    child.on('close', (code) => {
      cleanUp();
      if (signal.aborted) return reject(new Error('cancelled'));
      let answer;
      try {
        answer = JSON.parse(out.trim().split('\n').pop());
      } catch {
        return reject(new Error(`The document reader stopped (exit code ${code}). ${recentErrors.trim().split('\n').slice(-2).join(' ')}`));
      }
      if (answer.error) return reject(new Error(answer.error));
      if (!isResult(answer)) return reject(new Error('The document reader returned an unexpected answer.'));
      resolve(pickResult(answer));
    });
  });
}

export async function handleExtractPdf(req, res) {
  if (rejectUnlessFromApp(req, res, 'application/pdf')) return;
  if (!DOCUMENT_FORMATS.includes('pdf')) {
    return send(res, 501, { error: PDF_NOT_AVAILABLE });
  }
  let bytes;
  try {
    bytes = await readBytes(req, MAX_PDF_BYTES);
  } catch (e) {
    if (e instanceof BodyTooLargeError) return send(res, 413, { error: `The PDF is ${e.message}. Split it into smaller parts.` });
    return send(res, 400, { error: e.message });
  }
  if (!isPdf(bytes)) {
    return send(res, 415, { error: 'This file is not a PDF.' });
  }
  const query = new URL(req.url, 'http://x').searchParams;
  const formulas = query.get('formulas') === '1';
  const accelerator = query.get('accelerator') || 'auto';
  if (!ACCELERATOR.test(accelerator)) return send(res, 400, { error: 'Invalid hardware choice.' });
  const cancelOnDisconnect = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) cancelOnDisconnect.abort();
  });
  try {
    send(res, 200, await extractPdf(bytes, { formulas, accelerator }, cancelOnDisconnect.signal));
  } catch (e) {
    if (!cancelOnDisconnect.signal.aborted) send(res, 502, { error: e.message });
  }
}
