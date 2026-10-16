#!/usr/bin/env node
// Stands in for Python running python/document_extraction.py: argv is [script, file, --accelerator, id, --formulas?].
// Writes the path of
// the file it was given to FAKE_DOC_LOG, so tests can check it is deleted afterwards. A PDF containing "SLOW" makes
// it wait (to test cancelling), "FAIL" makes it answer with an error, "CRASH" makes it exit without an answer.
import fs from 'node:fs';

const [, , , file, ...options] = process.argv;
if (process.env.FAKE_DOC_LOG) fs.appendFileSync(process.env.FAKE_DOC_LOG, file + '\n');
const content = fs.readFileSync(file, 'latin1');
if (content.includes('CRASH')) process.exit(3);
if (content.includes('SLOW')) await new Promise((resolve) => setTimeout(resolve, 60_000));
if (content.includes('FAIL')) {
  console.log(JSON.stringify({ error: 'RuntimeError: broken PDF' }));
} else {
  const formulasConverted = options.includes('--formulas');
  console.log('a library printing to stdout');
  console.log(JSON.stringify({
    markdown: `## Befund\n\nPatient Hans Muster\n\n${formulasConverted ? '$$E = mc^2$$' : '[Formula 1, page 1: not converted]'}\n`,
    // device: the real reader reports Docling's device; this one echoes the hardware choice it was given
    pages: 1, images: 0, formulas: 1, formulasConverted, tables: 0, device: `chosen ${options[options.indexOf('--accelerator') + 1]}`, extra: 'dropped',
  }));
}
