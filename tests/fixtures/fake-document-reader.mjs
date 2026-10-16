#!/usr/bin/env node
// Stands in for Python running python/document_extraction.py: argv is [script, file, --formulas?]. Writes the path of
// the file it was given to FAKE_DOC_LOG, so tests can check it is deleted afterwards. A PDF containing "SLOW" makes
// it wait (to test cancelling), "FAIL" makes it answer with an error, "CRASH" makes it exit without an answer.
import fs from 'node:fs';

const [, , , file, flag] = process.argv;
if (process.env.FAKE_DOC_LOG) fs.appendFileSync(process.env.FAKE_DOC_LOG, file + '\n');
const content = fs.readFileSync(file, 'latin1');
if (content.includes('CRASH')) process.exit(3);
if (content.includes('SLOW')) await new Promise((resolve) => setTimeout(resolve, 60_000));
if (content.includes('FAIL')) {
  console.log(JSON.stringify({ error: 'RuntimeError: broken PDF' }));
} else {
  const formulasConverted = flag === '--formulas';
  console.log('a library printing to stdout');
  console.log(JSON.stringify({
    markdown: `## Befund\n\nPatient Hans Muster\n\n${formulasConverted ? '$$E = mc^2$$' : '[Formula 1, page 1: not converted]'}\n`,
    pages: 1, images: 0, formulas: 1, formulasConverted, tables: 0,
  }));
}
