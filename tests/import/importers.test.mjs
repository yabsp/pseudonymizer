import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { acceptedExtensions, importDocument } from '../../public/js/import/index.js';

const fileOf = (name, content, type = 'text/plain') => new File([content], name, { type });

describe('opening documents', () => {
  it('reads text files as UTF-8 and says where the text came from', async () => {
    const { text, document, source } = await importDocument(fileOf('Brief Müller.TXT', 'Sehr geehrte Frau Keller, Hans Muster'));
    assert.equal(text, 'Sehr geehrte Frau Keller, Hans Muster');
    assert.equal(document, null);
    assert.deepEqual(source, { name: 'Brief Müller.TXT', format: 'Text' });
  });

  it('offers every registered format in the file picker', () => {
    const accepted = acceptedExtensions().split(',');
    for (const ext of ['.txt', '.csv', '.md', '.pdf']) assert.ok(accepted.includes(ext), ext);
  });

  it('reads every file in the page: nothing is uploaded (regression guard)', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
    await importDocument(fileOf('notes.md', '# Notes'));
    await assert.rejects(importDocument(fileOf('Akte.pdf', new Uint8Array(50 * 1024 * 1024 + 1), 'application/pdf')), /larger than 50 MB/);
    await assert.rejects(importDocument(fileOf('Brief.pdf', 'This is a letter, not a PDF', 'application/pdf')), /"Brief.pdf" is not a PDF/);
    assert.equal(fetch.mock.callCount(), 0);
  });

  it('names the supported formats for anything else', async () => {
    await assert.rejects(importDocument(fileOf('Vertrag.docx', 'PK')), /"Vertrag.docx" can't be opened here \(supported: Text, PDF\)/);
    await assert.rejects(importDocument(fileOf('ohne-endung', 'x')), /can't be opened here/);
  });

  it('refuses text files over 5 MB instead of freezing the page', async () => {
    await assert.rejects(importDocument(fileOf('export.csv', 'a'.repeat(5 * 1024 * 1024 + 1))), /larger than 5 MB/);
  });
});
