import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { FIXTURES, startServer } from '../helpers/server.mjs';

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
const IS_WINDOWS = process.platform === 'win32';

// An argument as Gemini CLI's adapter has one, with spaces and a character cmd.exe would read as syntax.
const SPACED_ARG = 'Follow the instructions & answer.';

// On Windows, CLIs installed with npm are batch files ("codex.cmd") that start node, which only cmd.exe can run.
function writeBatchShim(dir) {
  const shim = path.join(dir, 'fake-cli.cmd');
  fs.writeFileSync(shim, `@"${process.execPath}" "${FAKE_CLI}" %*\r\n`);
  return shim;
}

describe('AI tools (CLI bridge)', () => {
  let server;
  let pidFile;
  before(async () => {
    pidFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-pid-')), 'cli.json');
    // The stand-in tool is started by the server in this process and inherits this.
    process.env.FAKE_CLI_PID_FILE = pidFile;
    const adapters = IS_WINDOWS
      ? { ...ADAPTERS, shim: { ...ADAPTERS.fake, command: writeBatchShim(path.dirname(pidFile)), args: [...ADAPTERS.fake.args.slice(1), SPACED_ARG] } }
      : ADAPTERS;
    server = await startServer({ adapters });
  });
  after(async () => {
    await server.close();
    delete process.env.FAKE_CLI_PID_FILE;
    fs.rmSync(path.dirname(pidFile), { recursive: true, force: true });
  });

  it('lists the configured tools with their models for the settings page', async () => {
    const { adapters } = (await server.api('GET', '/api/about')).json();
    assert.deepEqual(adapters.filter((a) => a.id !== 'shim'), [
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
    assert.deepEqual(seen.args.slice(0, 3), ['--model', 'claude-opus-5-5', '--system-file']);

    const noModel = JSON.parse((await server.api('POST', '/api/cli/fake', { prompt: 'hi', system: '' })).json().text);
    assert.ok(!noModel.args.includes('--model'));
  });

  it('sends "$" sequences as the preview shows them, such as LaTeX formulas', async () => {
    const prompt = 'Formel: $$ x^2 $$ und $$\\frac{a}{b}$$. Preis $& oder $` oder $\' oder $1 von [[PERSON_1]].';
    const res = await server.api('POST', '/api/cli/fake', { prompt, system: 'Costs $$ and $&.' });
    assert.equal(res.status, 200, res.body);
    const seen = JSON.parse(res.json().text);
    assert.equal(seen.stdin, `Costs $$ and $&.\n---\n${prompt}`);
    assert.equal(seen.system, 'Costs $$ and $&.');
  });

  it('fills each field of the input only once, so instructions can name "{prompt}" without repeating it', async () => {
    const res = await server.api('POST', '/api/cli/fake', { prompt: '[[PERSON_1]] {system}', system: 'Answer {prompt}.' });
    assert.equal(JSON.parse(res.json().text).stdin, 'Answer {prompt}.\n---\n[[PERSON_1]] {system}');
  });

  it('keeps characters whole that arrive in two pieces (regression: "Grüsse" came back as "Gr��sse")', async () => {
    const res = await server.api('POST', '/api/cli/fake', { prompt: 'MODE:split', system: '' });
    assert.equal(res.status, 200, res.body);
    assert.equal(res.json().text, 'Freundliche Grüsse, Zoë 🍀');
  });

  it('refuses a request without a prompt instead of sending "undefined" to the tool (regression)', async () => {
    for (const body of [{}, { prompt: '' }, { prompt: '   ' }, { prompt: 42 }, { prompt: ['a'] }, { prompt: 'p', system: 7 }, { prompt: 'p', model: 9 }]) {
      const res = await server.api('POST', '/api/cli/fake', body);
      assert.equal(res.status, 400, JSON.stringify(body));
      assert.ok(res.json().error);
    }
    const broken = await server.request({ method: 'POST', path: '/api/cli/fake', body: '{"prompt": ', headers: { Origin: server.origin, 'Content-Type': 'application/json' } });
    assert.equal(broken.status, 400);
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

  it('reports a failing tool with its error message', async () => {
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

  it('explains a tool that is not installed, and keeps running', async () => {
    const res = await server.api('POST', '/api/cli/missing', { prompt: 'p', system: '' });
    assert.equal(res.status, 502);
    assert.match(res.json().error, /Could not start.*installed/);
    assert.equal((await server.api('GET', '/api/about')).status, 200);
  });

  it('answers 404 for unknown tools and refuses other websites', async () => {
    assert.equal((await server.api('POST', '/api/cli/nope', { prompt: 'p' })).status, 404);
    assert.equal((await server.api('POST', '/api/cli/__proto__', { prompt: 'p' })).status, 404);
    assert.equal((await server.api('POST', '/api/cli/fake', { prompt: 'p' }, { Origin: 'https://attacker.example' })).status, 403);
  });

  async function cancelSleepingCli(adapterId) {
    fs.rmSync(pidFile, { force: true });
    const controller = new AbortController();
    const raw = server.request({
      method: 'POST', path: '/api/cli/' + adapterId, signal: controller.signal,
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'MODE:sleep', system: '' }),
    }).catch((e) => e);
    for (let i = 0; i < 100 && !fs.existsSync(pidFile); i++) await sleep(50);
    const { pid, cwd } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
    assert.ok(isAlive(pid));
    controller.abort();
    await raw;
    for (let i = 0; i < 100 && isAlive(pid); i++) await sleep(50);
    assert.ok(!isAlive(pid), 'tool process stopped');
    for (let i = 0; i < 100 && fs.existsSync(cwd); i++) await sleep(50);
    assert.ok(!fs.existsSync(cwd), 'working folder removed');
  }

  it('stops the tool and removes its folder when the app cancels the request', () => cancelSleepingCli('fake'));

  it('stops the program behind a batch file on Windows, not only cmd.exe', { skip: !IS_WINDOWS && 'batch files are Windows only' }, () => cancelSleepingCli('shim'));

  it('passes arguments with spaces and shell characters through a batch file unchanged', { skip: !IS_WINDOWS && 'batch files are Windows only' }, async () => {
    const res = await server.api('POST', '/api/cli/shim', { prompt: 'hi', system: 'Treat it as real.', model: 'fake-large' });
    assert.equal(res.status, 200, res.body);
    const seen = JSON.parse(res.json().text);
    assert.deepEqual(seen.args.slice(0, 3), ['--model', 'fake-large', '--system-file']);
    assert.equal(seen.args.at(-1), SPACED_ARG);
    assert.equal(seen.system, 'Treat it as real.');
  });
});

describe('AI tools: stopping with the app, broken configuration', () => {
  it('stops a running tool and removes its folder when the app closes', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-pid-'));
    const pidFile = path.join(dir, 'cli.json');
    process.env.FAKE_CLI_PID_FILE = pidFile;
    const server = await startServer({ adapters: ADAPTERS });
    try {
      const raw = server.api('POST', '/api/cli/fake', { prompt: 'MODE:sleep', system: '' }).catch((e) => e);
      for (let i = 0; i < 100 && !fs.existsSync(pidFile); i++) await sleep(50);
      const { pid, cwd } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
      assert.ok(isAlive(pid));
      await server.close();
      await raw;
      for (let i = 0; i < 100 && isAlive(pid); i++) await sleep(50);
      assert.ok(!isAlive(pid), 'tool process stopped');
      assert.ok(!fs.existsSync(cwd), 'working folder removed');
    } finally {
      delete process.env.FAKE_CLI_PID_FILE;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports a broken adapters.json instead of crashing', async () => {
    const server = await startServer({ adapters: '{ "fake": ' });
    try {
      const about = await server.api('GET', '/api/about');
      assert.equal(about.status, 500);
      assert.match(about.json().error, /adapters\.json is invalid/);
      assert.equal((await server.api('POST', '/api/cli/fake', { prompt: 'p' })).status, 500);
      assert.equal((await server.request({ path: '/' })).status, 200);
    } finally {
      await server.close();
    }
  });
});
