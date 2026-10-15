import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { ADAPTERS_FILE, FIXTURES, startServer } from '../helpers/server.mjs';

const FAKE_CLI = path.join(FIXTURES, 'fake-cli.mjs');
const ADAPTERS = {
  fake: {
    label: 'Fake CLI (test login)',
    command: process.execPath,
    args: [FAKE_CLI, '{modelArgs}', '--system-file', '{systemFile}'],
    modelArgs: ['--model', '{model}'],
    stdin: '{system}\n---\n{prompt}',
    loginHint: 'Run "fake login" once.',
    models: [{ id: '', label: 'Default' }, { id: 'fake-large', label: 'Fake Large' }],
  },
  missing: { label: 'Not installed', command: '/nonexistent/pseudo-test-cli', args: [], models: 'not a list' },
};
const isAlive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };

describe('CLI bridge', () => {
  let server;
  let pidFile;
  before(async () => {
    pidFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-pid-')), 'cli.json');
    server = await startServer({ adapters: ADAPTERS, env: { FAKE_CLI_PID_FILE: pidFile } });
  });
  after(() => server.close());

  it('lists the configured adapters with their models for the settings page', async () => {
    const res = await server.api('GET', '/api/adapters');
    assert.deepEqual(res.json(), [
      { id: 'fake', label: 'Fake CLI (test login)', models: [{ id: '', label: 'Default' }, { id: 'fake-large', label: 'Fake Large' }] },
      { id: 'missing', label: 'Not installed', models: [] },
    ]);
  });

  it('passes prompt and instructions unchanged, without a shell, and adds the model only when set', async () => {
    const prompt = 'Patient [[PERSON_1]] says: "it\'s fine" `$(id)` $HOME; rm -rf ~ && echo pwned\nZweite Zeile: Grüsse 🍀 {prompt} {system}';
    const system = 'Treat [[X_1]] as real values.\nKeep the brackets.';
    const res = await server.api('POST', '/api/cli/fake', { prompt, system, model: 'claude-opus-5-5' });
    assert.equal(res.status, 200, res.body);
    const seen = JSON.parse(res.json().text);
    assert.equal(seen.stdin, `${system}\n---\n${prompt}`);
    assert.equal(seen.system, system);
    assert.deepEqual(seen.args.slice(0, 3), [ '--model', 'claude-opus-5-5', '--system-file']);

    const noModel = JSON.parse((await server.api('POST', '/api/cli/fake', { prompt: 'hi', system: '' })).json().text);
    assert.ok(!noModel.args.includes('--model'));
  });

  it('runs every request in a fresh, empty folder that is deleted afterwards', async () => {
    const first = JSON.parse((await server.api('POST', '/api/cli/fake', { prompt: 'a', system: 's' })).json().text);
    const second = JSON.parse((await server.api('POST', '/api/cli/fake', { prompt: 'b', system: 's' })).json().text);
    assert.notEqual(first.cwd, second.cwd);
    assert.deepEqual(first.filesInCwd, ['system.md']);
    assert.ok(!fs.existsSync(first.cwd) && !fs.existsSync(second.cwd));
  });

  it('rejects model names that could become shell syntax', async () => {
    for (const model of ['opus; rm -rf ~', '$(id)', '`id`', 'a b', 'x|y', 'm\nnext']) {
      const res = await server.api('POST', '/api/cli/fake', { prompt: 'p', system: 's', model });
      assert.notEqual(res.status, 200, model);
      assert.match(res.json().error, /Invalid model name/, model);
    }
  });

  it('rejects model names that look like command-line options', async () => {
    for (const model of ['--dangerously-skip-permissions', '-x', '--model=evil']) {
      const res = await server.api('POST', '/api/cli/fake', { prompt: 'p', system: 's', model });
      assert.match(res.json().error, /Invalid model name/, model);
    }
    const ok = await server.api('POST', '/api/cli/fake', { prompt: 'p', system: 's', model: 'gpt-6.1-sol' });
    assert.equal(ok.status, 200);
  });

  it('reports a failing CLI with its error message', async () => {
    const res = await server.api('POST', '/api/cli/fake', { prompt: 'MODE:fail', system: '' });
    assert.equal(res.status, 502);
    assert.match(res.json().error, /exited with code 3.*usage limit reached/s);
    assert.match(res.json().error, /Run "fake login" once\.$/);
  });

  it('shows only the last distinct error lines, without stack traces', async () => {
    const res = await server.api('POST', '/api/cli/fake', { prompt: 'MODE:noisy', system: '' });
    assert.equal(res.json().error, '"' + process.execPath + '" exited with code 1. ERROR: unexpected status 401 Unauthorized: Missing bearer authentication IneligibleTierError: plan not supported Run "fake login" once.');
  });

  it('treats an empty answer as a failure', async () => {
    const res = await server.api('POST', '/api/cli/fake', { prompt: 'MODE:silent', system: '' });
    assert.equal(res.status, 502);
    assert.match(res.json().error, /No output/);
  });

  it('explains a CLI that is not installed, and keeps running', async () => {
    const res = await server.api('POST', '/api/cli/missing', { prompt: 'p', system: '' });
    assert.equal(res.status, 502);
    assert.match(res.json().error, /Could not start.*installed/);
    assert.ok(server.isRunning());
  });

  it('answers 404 for unknown adapters and refuses other websites', async () => {
    assert.equal((await server.api('POST', '/api/cli/nope', { prompt: 'p' })).status, 404);
    assert.equal((await server.api('POST', '/api/cli/fake', { prompt: 'p' }, { Origin: 'https://attacker.example' })).status, 403);
  });

  it('stops the CLI and removes its folder when the app cancels the request', async () => {
    const controller = new AbortController();
    const raw = server.request({
      method: 'POST', path: '/api/cli/fake', signal: controller.signal,
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'MODE:sleep', system: '' }),
    }).catch((e) => e);
    for (let i = 0; i < 100 && !fs.existsSync(pidFile); i++) await sleep(50);
    const { pid, cwd } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
    assert.ok(isAlive(pid));
    controller.abort();
    await raw;
    for (let i = 0; i < 100 && isAlive(pid); i++) await sleep(50);
    assert.ok(!isAlive(pid), 'CLI process stopped');
    for (let i = 0; i < 100 && fs.existsSync(cwd); i++) await sleep(50);
    assert.ok(!fs.existsSync(cwd), 'working folder removed');
  });
});

describe('CLI bridge with a broken adapters.json', () => {
  it('reports the broken file instead of crashing', async () => {
    const server = await startServer({ files: { [ADAPTERS_FILE]: '{ "fake": ' } });
    try {
      const list = await server.api('GET', '/api/adapters');
      assert.equal(list.status, 500);
      assert.match(list.json().error, /adapters\.json is invalid/);
      assert.equal((await server.api('POST', '/api/cli/fake', { prompt: 'p' })).status, 500);
      assert.ok(server.isRunning());
    } finally {
      await server.close();
    }
  });
});
