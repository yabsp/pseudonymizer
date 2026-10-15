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

  it('explains that PDFs are not supported yet, without reading them', async () => {
    await assert.rejects(importDocument(fileOf('Austrittsbericht.pdf', '%PDF-1.7', 'application/pdf')), /PDFs is not available yet.*paste it instead/);
  });

  it('names the supported formats for anything else', async () => {
    await assert.rejects(importDocument(fileOf('Vertrag.docx', 'PK')), /"Vertrag.docx" can't be opened here \(supported: Text, PDF\)/);
    await assert.rejects(importDocument(fileOf('ohne-endung', 'x')), /can't be opened here/);
  });

  it('refuses text files over 5 MB instead of freezing the page', async () => {
    await assert.rejects(importDocument(fileOf('export.csv', 'a'.repeat(5 * 1024 * 1024 + 1))), /larger than 5 MB/);
  });
});
