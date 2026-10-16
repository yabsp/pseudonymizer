import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DOCUMENT_COMMAND, DOCUMENT_FORMATS, DOCUMENT_TIMEOUT_MS, MAX_PDF_BYTES } from './config.js';
import { BodyTooLargeError, readBytes, rejectUnlessFromApp, send } from './http.js';

// Every PDF file starts with "%PDF-".
const PDF_SIGNATURE = '%PDF-';
const RESULT_COUNTS = ['pages', 'images', 'formulas', 'tables'];

const isResult = (r) => r && typeof r.markdown === 'string' && typeof r.formulasConverted === 'boolean'
  && RESULT_COUNTS.every((key) => Number.isInteger(r[key]) && r[key] >= 0);

/**
 * Extracts the PDF in a separate process. The file is written to a private temporary folder that is deleted
 * afterwards in every case; nothing of it is kept or logged.
 */
function extractPdf(bytes, { formulas }, signal) {
  return new Promise((resolve, reject) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-doc-'));
    const file = path.join(dir, 'document.pdf');
    fs.writeFileSync(file, bytes, { mode: 0o600 });
    const args = [...DOCUMENT_COMMAND.args, file, ...(formulas ? ['--formulas'] : [])];
    const child = spawn(DOCUMENT_COMMAND.command, args, { cwd: DOCUMENT_COMMAND.cwd });
    let out = '';
    let recentErrors = '';
    const timer = setTimeout(() => child.kill(), DOCUMENT_TIMEOUT_MS);
    signal.addEventListener('abort', () => child.kill(), { once: true });
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
      resolve(answer);
    });
  });
}

export async function handleExtractPdf(req, res) {
  if (rejectUnlessFromApp(req, res, 'application/pdf')) return;
  if (!DOCUMENT_FORMATS.includes('pdf')) {
    return send(res, 501, { error: 'Opening PDFs is not part of the desktop app yet. Copy the text out of the PDF and paste it instead.' });
  }
  let bytes;
  try {
    bytes = await readBytes(req, MAX_PDF_BYTES);
  } catch (e) {
    if (e instanceof BodyTooLargeError) return send(res, 413, { error: `The PDF is ${e.message}. Split it into smaller parts.` });
    return send(res, 400, { error: e.message });
  }
  if (bytes.subarray(0, PDF_SIGNATURE.length).toString('latin1') !== PDF_SIGNATURE) {
    return send(res, 415, { error: 'This file is not a PDF.' });
  }
  const formulas = new URL(req.url, 'http://x').searchParams.get('formulas') === '1';
  const cancelOnDisconnect = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) cancelOnDisconnect.abort();
  });
  try {
    send(res, 200, await extractPdf(bytes, { formulas }, cancelOnDisconnect.signal));
  } catch (e) {
    if (!cancelOnDisconnect.signal.aborted) send(res, 502, { error: e.message });
  }
}
