import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { FAKE_DOCUMENT_READER, startServer } from '../helpers/server.mjs';

const pdf = (text) => Buffer.from(`%PDF-1.7\n${text}\n%%EOF\n`, 'latin1');
const LETTER = 'Sehr geehrte Frau Keller\n\nIhre AHV-Nr. 756.1234.5678.97 ist notiert.\nGrüsse, Hans Muster\n';
const TYPES = { pdf: 'application/pdf', text: 'application/octet-stream' };

describe('document jobs', () => {
  let server;
  let log;
  const add = (format, body, { query = '', headers = {} } = {}) => server.request({
    method: 'POST', path: `/api/jobs?format=${format}${query}`, body,
    headers: { Origin: server.origin, 'Content-Type': TYPES[format] ?? 'application/octet-stream', ...headers },
  });
  const list = async () => (await server.request({ path: '/api/jobs' })).json();
  const get = (id) => server.request({ path: '/api/jobs/' + id });
  const remove = (id, headers = { Origin: server.origin }) => server.request({ method: 'DELETE', path: '/api/jobs/' + id, headers });
  const usedFiles = () => fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
  async function waitFor(id, states) {
    for (let i = 0; i < 200; i++) {
      const job = (await list()).find((j) => j.id === id);
      if (states.includes(job?.state)) return job;
      await sleep(50);
    }
    throw new Error(`job ${id} did not reach ${states}`);
  }
  async function removeAll() {
    for (const job of await list()) await remove(job.id);
  }

  before(async () => {
    log = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-joblog-')), 'files.txt');
    fs.writeFileSync(log, '');
    server = await startServer({ env: { FAKE_DOC_LOG: log }, files: FAKE_DOCUMENT_READER });
  });
  after(async () => {
    await server.close();
    fs.rmSync(path.dirname(log), { recursive: true, force: true });
  });

  it('reads a text file and returns its text only on request, never in the list', async () => {
    const added = await add('text', Buffer.from('﻿' + LETTER, 'utf8'));
    assert.equal(added.status, 201, added.body);
    const { id } = added.json();
    assert.match(id, /^[\da-f-]{36}$/);
    const ready = await waitFor(id, ['ready']);
    assert.deepEqual(ready, { id, format: 'text', formulas: false, state: 'ready', step: null, error: null });
    assert.ok(!JSON.stringify(await list()).includes('Muster'), 'the list carries no text');
    const result = (await get(id)).json().result;
    assert.deepEqual(result, { text: LETTER });
    await removeAll();
  });

  it('converts a PDF and returns the Markdown with the facts about the document', async () => {
    const { id } = (await add('pdf', pdf('Hans Muster'), { query: '&formulas=1' })).json();
    await waitFor(id, ['ready']);
    const job = (await get(id)).json();
    assert.equal(job.formulas, true);
    assert.deepEqual(job.result, {
      text: '## Befund\n\nPatient Hans Muster\n\n$$E = mc^2$$\n',
      document: { pages: 1, images: 0, formulas: 1, formulasConverted: true, tables: 0, device: 'chosen auto' },
    });
    const [file] = usedFiles().slice(-1);
    assert.ok(!fs.existsSync(path.dirname(file)), 'temporary folder deleted after the step');
    await removeAll();
  });

  it('runs one job at a time and lists them in the order they were added', async () => {
    const slow = (await add('pdf', pdf('SLOW'))).json();
    const text = (await add('text', Buffer.from(LETTER))).json();
    const second = (await add('pdf', pdf('second'))).json();
    const running = await waitFor(slow.id, ['running']);
    assert.deepEqual({ ...running.step, seconds: 0 }, { number: 1, of: 1, label: 'Reading text, tables and images', seconds: 0 });
    await sleep(300);
    assert.deepEqual((await list()).map((j) => [j.id, j.state]), [[slow.id, 'running'], [text.id, 'waiting'], [second.id, 'waiting']]);

    for (let i = 0; i < 50 && !usedFiles().some((f) => f.length && fs.existsSync(f)); i++) await sleep(100);
    const [slowFile] = usedFiles().slice(-1);
    assert.equal((await remove(slow.id)).status, 200);
    assert.deepEqual((await list()).map((j) => j.id), [text.id, second.id], 'the cancelled job is forgotten');
    await waitFor(second.id, ['ready']);
    assert.equal((await list()).find((j) => j.id === text.id).state, 'ready');
    assert.ok(!fs.existsSync(slowFile), 'the cancelled job left no copy');
    assert.equal((await get(slow.id)).status, 404);
    await removeAll();
  });

  it('cancels a waiting job without running it', async () => {
    const readsBefore = usedFiles().length;
    const slow = (await add('pdf', pdf('SLOW'))).json();
    const waiting = (await add('pdf', pdf('never read'))).json();
    for (let i = 0; i < 100 && usedFiles().length === readsBefore; i++) await sleep(50);
    assert.equal(usedFiles().length, readsBefore + 1, 'the slow one started');
    assert.equal((await remove(waiting.id)).status, 200);
    await remove(slow.id);
    await sleep(500);
    assert.equal(usedFiles().length, readsBefore + 1, 'the waiting PDF was never written to disk');
    assert.deepEqual(await list(), []);
  });

  it('reports failing and crashing conversions with the reason, and keeps going', async () => {
    const failed = (await add('pdf', pdf('FAIL'))).json();
    const crashed = (await add('pdf', pdf('CRASH'))).json();
    const fine = (await add('pdf', pdf('fine'))).json();
    await waitFor(fine.id, ['ready']);
    const states = await list();
    assert.deepEqual(states.find((j) => j.id === failed.id).state, 'failed');
    assert.match(states.find((j) => j.id === failed.id).error, /broken PDF/);
    assert.match(states.find((j) => j.id === crashed.id).error, /document reader stopped \(exit code 3\)/);
    assert.equal((await get(failed.id)).json().result, null);
    await removeAll();
  });

  it('refuses unknown formats, wrong types, files that are not PDFs and requests from other sites', async () => {
    assert.equal((await add('word', Buffer.from('x'))).status, 400);
    assert.equal((await add('pdf', pdf('x'), { query: '&accelerator=' + encodeURIComponent('cuda --formulas') })).status, 400);
    assert.equal((await add('pdf', Buffer.from('<html>'))).status, 415);
    assert.equal((await add('pdf', pdf('x'), { headers: { 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await add('text', Buffer.from('x'), { headers: { 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await add('text', Buffer.from('x'), { headers: { Origin: 'https://attacker.example' } })).status, 403);
    const job = (await add('text', Buffer.from('x'))).json();
    assert.equal((await remove(job.id, { Origin: 'https://attacker.example' })).status, 403);
    assert.equal((await remove(job.id, {})).status, 403);
    assert.equal((await remove('00000000-0000-0000-0000-000000000000')).status, 404);
    assert.equal((await get('00000000-0000-0000-0000-000000000000')).status, 404);
    await removeAll();
    assert.ok(server.isRunning());
  });

  it('refuses text files over 5 MB without keeping them', async () => {
    const res = await add('text', Buffer.alloc(5 * 1024 * 1024 + 1, 'a')).catch((e) => ({ status: 'closed', error: e }));
    assert.ok(res.status === 413 || res.status === 'closed', String(res.status));
    assert.deepEqual(await list(), []);
    assert.ok(server.isRunning());
  });

  it('keeps at most 50 documents in the list', async () => {
    for (let i = 0; i < 50; i++) assert.equal((await add('text', Buffer.from(`Dokument ${i}`))).status, 201);
    const full = await add('text', Buffer.from('one too many'));
    assert.equal(full.status, 429);
    assert.match(full.json().error, /50 documents/);
    await removeAll();
  });
});
