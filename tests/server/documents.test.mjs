import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { FAKE_DOCUMENT_READER, request, startServer } from '../helpers/server.mjs';

const pdf = (text) => Buffer.from(`%PDF-1.7\n${text}\n%%EOF\n`, 'latin1');

describe('PDF extraction endpoint', () => {
  let server;
  let log;
  const upload = (body, { query = '', headers = {} } = {}) => server.request({
    method: 'POST', path: '/api/extract/pdf' + query, body,
    headers: { Origin: server.origin, 'Content-Type': 'application/pdf', ...headers },
  });
  const usedFiles = () => fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
  before(async () => {
    log = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-doclog-')), 'files.txt');
    fs.writeFileSync(log, '');
    server = await startServer({ env: { FAKE_DOC_LOG: log }, files: FAKE_DOCUMENT_READER });
  });
  after(async () => {
    await server.close();
    fs.rmSync(path.dirname(log), { recursive: true, force: true });
  });

  it('returns the document as Markdown and deletes the temporary copy', async () => {
    const res = await upload(pdf('Hans Muster'));
    assert.equal(res.status, 200, res.body);
    assert.deepEqual(res.json(), {
      markdown: '## Befund\n\nPatient Hans Muster\n\n[Formula 1, page 1: not converted]\n', pages: 1, images: 0, formulas: 1, formulasConverted: false, tables: 0, device: 'chosen auto',
    });
    const [file] = usedFiles().slice(-1);
    assert.ok(!fs.existsSync(file) && !fs.existsSync(path.dirname(file)), 'temporary folder deleted');
  });

  it('passes the hardware choice to the reader, and refuses unknown ones', async () => {
    assert.equal((await upload(pdf('x'), { query: '?accelerator=torch-cuda' })).json().device, 'chosen torch-cuda');
    for (const choice of ['cuda', 'torch-cuda;rm', '--formulas', 'onnx-azure']) {
      assert.equal((await upload(pdf('x'), { query: '?accelerator=' + encodeURIComponent(choice) })).status, 400, choice);
    }
  });

  it('converts formulas only when asked', async () => {
    const res = await upload(pdf('x'), { query: '?formulas=1' });
    assert.equal(res.json().formulasConverted, true);
    assert.match(res.json().markdown, /\$\$E = mc\^2\$\$/);
  });

  it('refuses anything that is not a PDF from this app', async () => {
    assert.equal((await upload(Buffer.from('<html>'))).status, 415);
    assert.equal((await upload(pdf('x'), { headers: { 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await upload(pdf('x'), { headers: { Origin: 'https://attacker.example' } })).status, 403);
  });

  it('refuses PDFs over 50 MB without starting the reader', async () => {
    const before = usedFiles().length;
    const res = await upload(Buffer.concat([pdf(''), Buffer.alloc(50 * 1024 * 1024)])).catch((e) => ({ status: 'closed', error: e }));
    assert.ok(res.status === 413 || res.status === 'closed', String(res.status));
    assert.equal(usedFiles().length, before);
    assert.ok(server.isRunning());
  });

  it('reports a failing or crashing reader, and keeps working', async () => {
    const failed = await upload(pdf('FAIL'));
    assert.equal(failed.status, 502);
    assert.match(failed.json().error, /broken PDF/);
    const crashed = await upload(pdf('CRASH'));
    assert.equal(crashed.status, 502);
    assert.match(crashed.json().error, /document reader stopped \(exit code 3\)/);
    assert.equal((await upload(pdf('fine'))).status, 200);
  });

  it('stops the reader and deletes the copy when the page cancels', async () => {
    const cancel = new AbortController();
    const pending = request(server.port, {
      method: 'POST', path: '/api/extract/pdf', body: pdf('SLOW'), signal: cancel.signal,
      headers: { Origin: server.origin, 'Content-Type': 'application/pdf' },
    }).catch(() => 'cancelled');
    for (let i = 0; i < 50 && !usedFiles().some((f) => fs.existsSync(f)); i++) await new Promise((r) => setTimeout(r, 100));
    const [file] = usedFiles().slice(-1);
    assert.ok(fs.existsSync(file), 'the reader started');
    cancel.abort();
    assert.equal(await pending, 'cancelled');
    for (let i = 0; i < 50 && fs.existsSync(file); i++) await new Promise((r) => setTimeout(r, 100));
    assert.ok(!fs.existsSync(file), 'temporary copy deleted after cancelling');
  });
});

describe('model folders of the helpers', () => {
  const PDF_ASKING_FOR_FOLDERS = pdf('ENV');
  const foldersSeen = async (server) => {
    const res = await server.request({
      method: 'POST', path: '/api/extract/pdf', body: PDF_ASKING_FOR_FOLDERS,
      headers: { Origin: server.origin, 'Content-Type': 'application/pdf' },
    });
    assert.equal(res.status, 200, res.body);
    return res.json().markdown.split('\n');
  };
  // As "npm run setup" leaves them in the project folder.
  const PROJECT_MODELS = { 'models/huggingface/hub/.keep': '', 'models/docling/.keep': '', ...FAKE_DOCUMENT_READER };

  it('uses the models in the project folder when no other folder is set', async () => {
    const server = await startServer({ env: { HF_HOME: '', DOCLING_ARTIFACTS_PATH: '' }, files: PROJECT_MODELS });
    try {
      const [hfHome, docling] = await foldersSeen(server);
      assert.ok(hfHome.endsWith(path.join('models', 'huggingface')), hfHome);
      assert.ok(docling.endsWith(path.join('models', 'docling')), docling);
    } finally {
      await server.close();
    }
  });

  it('keeps folders that are set, and the libraries\' own without a models folder', async () => {
    const set = await startServer({ env: { HF_HOME: '/srv/hf', DOCLING_ARTIFACTS_PATH: '/srv/docling' }, files: PROJECT_MODELS });
    try {
      assert.deepEqual(await foldersSeen(set), ['/srv/hf', '/srv/docling']);
    } finally {
      await set.close();
    }
    const none = await startServer({ env: { HF_HOME: '', DOCLING_ARTIFACTS_PATH: '' }, files: FAKE_DOCUMENT_READER });
    try {
      assert.deepEqual(await foldersSeen(none), ['', '']);
    } finally {
      await none.close();
    }
  });
});
