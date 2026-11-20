// "npm run check:network": shows that Pseudonymizer contacts nothing outside this computer. It runs one real
// detection with made-up text, waits (libraries send usage reports with a delay), and records every network
// connection meanwhile:
// - Windows: the TCP connections of the process and all processes it started, listed several times a second
//   (PowerShell, no administrator rights);
// - Linux: every connect() call of the process and all processes it started, traced with strace (must be installed).
// First the watching itself is tested: a process that opens a connection to a reserved address must be seen.
//
//   npm run check:network                                  the server, as "npm run server" runs it
//   npm run check:network -- --app <program> [arguments]  a built desktop app, for example
//                                                          dist/win-unpacked/Pseudonymizer.exe
//
// Run it after adding or updating a package and before passing on a built app. Why it exists: ONNX Runtime as
// shipped reports usage to Microsoft; server/gliner.js turns that off (docs/reference.md, "Checking for network calls").
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SELF = fileURLToPath(import.meta.url);
const WORK = path.join(ROOT, '.cache', `check-network-${process.pid}`);
const WAIT_SECONDS = 40;
// The watcher on Windows needs a few seconds to start; what it watches waits that long before it starts working.
const START_DELAY_MS = process.platform === 'win32' ? 8000 : 0;
const TEXT = 'Patientin Maria Keller, geboren am 14.02.1961, wohnt an der Rebgasse 21 in Basel. Monsieur Thierry Baud travaille chez Horlogerie Fleurier SA.';
const LABELS = ['person', 'organization', 'address', 'date of birth'];
// An address reserved for documentation (TEST-NET-1): it belongs to nobody, so nothing answers there.
const PROBE_ADDRESS = '192.0.2.1';
const PROBE_SECONDS = 6;

// An address in a traced call's arguments: group 1 an IPv4 address (inet_addr("192.0.2.1")), group 2 an IPv6
// address (inet_pton(AF_INET6, "2001:db8::1", ...)).
const TRACED_ADDRESS = /inet_addr\("([^"]+)"\)|inet_pton\(AF_INET6, "([^"]+)"/;
// The other end strace -yy shows for a connected socket, as in <UDP:[10.0.0.2:5000->192.0.2.1:53]>: group 1 the
// address without its port, an IPv6 address without its brackets.
const SOCKET_REMOTE = /<(?:TCP|UDP)(?:v6)?:\[[^\]]*->\[?([^\]]*?)\]?:\d+\]>/;
// The socket of a call is a UDP one, as strace -yy shows it: connect(23<UDPv6:[16467]>, ...).
const ON_UDP_SOCKET = /^\d+\s+\w+\(\d+<UDP/;
// The line the server and the desktop app print when they are ready; group 1 the address.
const RUNNING_AT = /running at (http:\/\/\S+)/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isThisComputer = (address) => address.startsWith('127.') || address === '::1' || address.startsWith('::ffff:127.');
const ended = (child) => new Promise((resolve) => child.on('exit', (code) => resolve(code)));

/** Asks the server at origin to detect the made-up text, as the page does. */
async function detectAt(origin) {
  const res = await fetch(`${origin}/api/detect`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ text: TEXT, labels: LABELS, threshold: 0.4 }) });
  const found = await res.json();
  if (!res.ok) throw new Error(found.error);
  console.log(`  detection ran (${found.model}, on ${found.device}): ${found.entities.map((e) => e.text).join(' | ')}`);
}

/** The watched server: one detection, a pause, a clean end. */
async function runServer(dataDir) {
  await sleep(START_DELAY_MS);
  const { readConfig } = await import('../server/config.js');
  const { createApp } = await import('../server/index.js');
  const app = createApp(readConfig({ ...process.env, PORT: '0', PSEUDONYMIZER_DATA_DIR: dataDir }));
  await detectAt(`http://localhost:${await app.listen()}`);
  await sleep(WAIT_SECONDS * 1000);
  await app.close();
  await sleep(5000);
}

/** The process for testing the watcher: tries to connect to the reserved address for a few seconds. */
async function runProbe() {
  await sleep(START_DELAY_MS);
  const socket = net.connect(9, PROBE_ADDRESS);
  socket.on('error', () => {});
  await sleep(PROBE_SECONDS * 1000);
  socket.destroy();
}

/** While the desktop app runs: waits for it, lets it detect once, waits, then ends it with stop(). */
async function driveApp(output, stop) {
  let match = null;
  for (let i = 0; i < 600 && !match; i++) {
    match = RUNNING_AT.exec(output());
    if (!match) await sleep(100);
  }
  if (!match) throw new Error(`the app did not start: ${output().slice(0, 300)}`);
  await sleep(START_DELAY_MS);
  await detectAt(match[1]);
  await sleep(WAIT_SECONDS * 1000);
  stop();
}

// Every look: the process and all processes it started (refreshed every 10th look), and their TCP connections.
const WATCH_ON_WINDOWS = `
$seen = @{}; $looks = 0; $tree = @(PID_HERE)
while (Get-Process -Id PID_HERE -ErrorAction SilentlyContinue) {
  if ($looks % 10 -eq 0) {
    $all = Get-CimInstance Win32_Process -Property ProcessId, ParentProcessId
    $tree = @(PID_HERE); $grew = $true
    while ($grew) { $grew = $false; foreach ($p in $all) { if ($tree -contains $p.ParentProcessId -and $tree -notcontains $p.ProcessId) { $tree += $p.ProcessId; $grew = $true } } }
  }
  $looks++
  foreach ($c in (Get-NetTCPConnection -OwningProcess $tree -ErrorAction SilentlyContinue)) {
    if ($c.RemoteAddress -notin @('0.0.0.0', '::')) { $seen["$($c.RemoteAddress)"] = 1 }
  }
}
"looks $looks" | Out-File -Encoding utf8 -LiteralPath 'FILE_HERE'
$seen.Keys | Out-File -Append -Encoding utf8 -LiteralPath 'FILE_HERE'
`;

/**
 * Runs command with args while recording the connections of it and everything it starts. drive(output, stop), if
 * given, runs meanwhile (output() is what the process printed so far; stop() ends it). Resolves to { addresses, how }.
 */
async function watch(command, args, { env = process.env, drive = null } = {}) {
  const record = path.join(WORK, 'connections.txt');
  fs.rmSync(record, { force: true });
  let output = '';
  const collect = (child) => {
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
  };
  if (process.platform === 'win32') {
    const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    collect(child);
    const script = WATCH_ON_WINDOWS.replaceAll('PID_HERE', String(child.pid)).replaceAll('FILE_HERE', record.replaceAll("'", "''"));
    const watcher = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { stdio: 'ignore' });
    const driving = drive ? drive(() => output, () => child.kill()) : Promise.resolve();
    const [code] = await Promise.all([ended(child), ended(watcher), driving]);
    printDetection(output);
    if ((!drive && code !== 0) || !fs.existsSync(record)) throw new Error(`the watched process or the watcher did not run to the end. ${output.slice(-300)}`);
    const [looks, ...addresses] = fs.readFileSync(record, 'utf8').replace('﻿', '').split(/\r?\n/).filter(Boolean);
    return { addresses, how: `${looks.replace('looks ', '')} looks at its connections` };
  }
  if (process.platform !== 'linux') throw new Error('this check works on Windows and Linux only.');
  if (spawnSync('strace', ['-V'], { stdio: 'ignore' }).status !== 0) throw new Error('strace is needed for this check on Linux (for example "sudo apt install strace").');
  const tracer = spawn('strace', ['-f', '-qq', '-yy', '-e', 'trace=connect,sendto,sendmsg,sendmmsg', '-o', record, command, ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  collect(tracer);
  // Ends the traced program (the tracer's child), not the tracer, which would let it run on untraced.
  const stop = () => {
    const children = fs.readFileSync(`/proc/${tracer.pid}/task/${tracer.pid}/children`, 'utf8').trim().split(/\s+/).filter(Boolean);
    for (const pid of children) process.kill(Number(pid), 'SIGTERM');
  };
  const [code] = await Promise.all([ended(tracer), drive ? drive(() => output, stop) : Promise.resolve()]);
  printDetection(output);
  if (!drive && code !== 0) throw new Error(`the watched process did not run to the end. ${output.slice(-300)}`);
  return readTrace(fs.readFileSync(record, 'utf8'));
}

/**
 * What a trace shows: addresses that were connected to over TCP or sent data to, and addresses a UDP socket was only
 * connected to (routeChecks). Connecting a UDP socket sends nothing; Chromium does it to learn whether IPv6 is
 * reachable (it "connects" to Google's DNS address 2001:4860:4860::8888 without ever sending to it).
 */
function readTrace(trace) {
  const addresses = new Set();
  const routeChecks = new Set();
  let calls = 0;
  for (const line of trace.split('\n')) {
    const match = TRACED_ADDRESS.exec(line);
    const address = match ? match[1] ?? match[2] : (line.includes(' send') ? SOCKET_REMOTE.exec(line)?.[1] : undefined);
    if (!address) continue;
    calls++;
    if (line.includes(' connect(') && ON_UDP_SOCKET.test(line)) routeChecks.add(address);
    else addresses.add(address);
  }
  return { addresses: [...addresses], routeChecks: [...routeChecks], how: `network calls traced: ${calls}` };
}

const printDetection = (output) => output.split('\n').filter((line) => line.includes('detection ran')).forEach((line) => console.log(line));

const { values: options, positionals } = parseArgs({ options: { app: { type: 'string' }, server: { type: 'string' }, probe: { type: 'boolean' } }, allowPositionals: true });
if (options.server) {
  await runServer(options.server);
} else if (options.probe) {
  await runProbe();
} else {
  fs.mkdirSync(path.join(WORK, 'data'), { recursive: true });
  const what = options.app ? 'the desktop app' : 'the server';
  let failed = true;
  try {
    const probe = await watch(process.execPath, [SELF, '--probe']);
    if (!probe.addresses.includes(PROBE_ADDRESS)) throw new Error(`the watcher did not see a test connection to ${PROBE_ADDRESS}, so it would not see others either.`);
    console.log(`The watcher works: it saw a test connection to ${PROBE_ADDRESS} (a reserved address that belongs to nobody).`);
    console.log(`Watching ${what} for about ${WAIT_SECONDS + 15} seconds.`);
    const dataDir = path.join(WORK, 'data');
    const { addresses, routeChecks = [], how } = options.app
      ? await watch(path.resolve(options.app), positionals, { env: { ...process.env, PSEUDONYMIZER_DATA_DIR: dataDir }, drive: driveApp })
      : await watch(process.execPath, [SELF, '--server', dataDir]);
    const outside = addresses.filter((address) => !isThisComputer(address));
    failed = outside.length > 0;
    const checked = routeChecks.filter((address) => !isThisComputer(address));
    if (checked.length) console.log(`  route checks only, nothing sent: a UDP socket was connected to ${checked.join(', ')} (Chromium tests whether the address is reachable)`);
    console.log(failed
      ? `\nNOT OK: ${what} contacted ${outside.join(', ')}. Find out which part does that before using it with real data.`
      : `\nOK: ${what} contacted nothing outside this computer (${how}).`);
  } catch (e) {
    console.error(`\nThe check could not run: ${e.message}`);
  } finally {
    await sleep(1000); // the app's last processes let go of the data folder
    fs.rmSync(WORK, { recursive: true, force: true });
  }
  process.exitCode = failed ? 1 : 0;
}
