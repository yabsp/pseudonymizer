import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addJob, readJobResult } from '../../public/js/import/jobs.js';

const fileOf = (name, content, type = 'text/plain') => new File([content], name, { type });

describe('adding documents to the Documents list', () => {
  it('uploads only the bytes, with the format and type the server expects, never the file name', async (t) => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      requests.push({ url, options });
      return Response.json({ id: '1', state: 'waiting' }, { status: 201 });
    });
    const pdf = fileOf('Befund Hans Muster.pdf', '%PDF-1.7', 'application/pdf');
    await addJob(pdf, { formulas: true, accelerator: 'torch-cuda' });
    await addJob(fileOf('Brief Keller.md', '# Brief'), { formulas: true });
    assert.deepEqual(requests.map((r) => [r.url, r.options.method, r.options.headers['Content-Type']]), [
      ['api/jobs?format=pdf&accelerator=torch-cuda&formulas=1', 'POST', 'application/pdf'],
      ['api/jobs?format=text', 'POST', 'application/octet-stream'],
    ]);
    assert.equal(requests[0].options.body, pdf);
    assert.ok(!requests.some((r) => r.url.includes('Muster') || r.url.includes('Keller')));
  });

  it('refuses unknown formats and files over the limit before uploading', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
    await assert.rejects(addJob(fileOf('Vertrag.docx', 'x')), /can't be opened here/);
    await assert.rejects(addJob(fileOf('gross.txt', new Uint8Array(5 * 1024 * 1024 + 1))), /larger than 5 MB/);
    assert.equal(fetch.mock.callCount(), 0);
  });

  it('returns a ready result in the shape of an opened document, and refuses a missing one', async (t) => {
    const answers = [
      { result: { text: '## Befund', document: { pages: 1, images: 0, formulas: 0, formulasConverted: false, tables: 0 } } },
      { result: null },
    ];
    t.mock.method(globalThis, 'fetch', async () => Response.json(answers.shift()));
    const pdf = fileOf('Befund.pdf', '%PDF-1.7', 'application/pdf');
    assert.deepEqual(await readJobResult('1', pdf), {
      text: '## Befund',
      document: { pages: 1, images: 0, formulas: 0, formulasConverted: false, tables: 0 },
      source: { name: 'Befund.pdf', format: 'PDF' },
    });
    await assert.rejects(readJobResult('1', pdf), /not available/);
  });
});
