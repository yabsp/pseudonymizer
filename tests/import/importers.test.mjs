import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { acceptedExtensions, importDocument } from '../../public/js/import/index.js';

const fileOf = (name, content, type = 'text/plain') => new File([content], name, { type });

describe('opening documents', () => {
  it('reads text files as UTF-8 and says where the text came from', async () => {
    const { text, source } = await importDocument(fileOf('Brief Müller.TXT', 'Sehr geehrte Frau Keller, Hans Muster'));
    assert.equal(text, 'Sehr geehrte Frau Keller, Hans Muster');
    assert.deepEqual(source, { name: 'Brief Müller.TXT', format: 'Text' });
  });

  it('offers every registered format in the file picker', () => {
    const accepted = acceptedExtensions().split(',');
    for (const ext of ['.txt', '.csv', '.md', '.pdf']) assert.ok(accepted.includes(ext), ext);
  });

  it('sends a PDF only to the local server and returns its Markdown as a document', async (t) => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      requests.push({ url, options });
      return Response.json({ markdown: '## Befund\n[Image 1, page 1: not sent]\n', pages: 1, images: 1, formulas: 0, formulasConverted: false, tables: 0 });
    });
    const pdf = fileOf('Austrittsbericht.pdf', '%PDF-1.7', 'application/pdf');
    const { text, document, source } = await importDocument(pdf);
    assert.equal(text, '## Befund\n[Image 1, page 1: not sent]\n');
    assert.deepEqual(document, { pages: 1, images: 1, formulas: 0, formulasConverted: false, tables: 0 });
    assert.deepEqual(source, { name: 'Austrittsbericht.pdf', format: 'PDF' });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'api/extract/pdf?accelerator=auto');
    assert.equal(requests[0].options.headers['Content-Type'], 'application/pdf');
    assert.equal(requests[0].options.body, pdf);
    await importDocument(pdf, { formulas: true, accelerator: 'torch-cuda' });
    assert.equal(requests[1].url, 'api/extract/pdf?accelerator=torch-cuda&formulas=1');
  });

  it('refuses PDFs over 50 MB without uploading them', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
    await assert.rejects(importDocument(fileOf('Akte.pdf', new Uint8Array(50 * 1024 * 1024 + 1), 'application/pdf')), /larger than 50 MB/);
    assert.equal(fetch.mock.callCount(), 0);
  });

  it('reports what the server says when extraction fails', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'The document reader stopped (exit code 1).' }, { status: 502 }));
    await assert.rejects(importDocument(fileOf('Akte.pdf', '%PDF-1.7', 'application/pdf')), /document reader stopped/);
  });

  it('names the supported formats for anything else', async () => {
    await assert.rejects(importDocument(fileOf('Vertrag.docx', 'PK')), /"Vertrag.docx" can't be opened here \(supported: Text, PDF\)/);
    await assert.rejects(importDocument(fileOf('ohne-endung', 'x')), /can't be opened here/);
  });

  it('refuses text files over 5 MB instead of freezing the page', async () => {
    await assert.rejects(importDocument(fileOf('export.csv', 'a'.repeat(5 * 1024 * 1024 + 1))), /larger than 5 MB/);
  });
});
