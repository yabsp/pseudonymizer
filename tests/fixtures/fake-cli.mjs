// Stands in for claude/codex/gemini. MODE:fail, MODE:noisy, MODE:silent, MODE:sleep and MODE:split in the prompt
// trigger those behaviours; otherwise it answers with what it received, as JSON.
import fs from 'node:fs';

const stdin = fs.readFileSync(0, 'utf8');
const args = process.argv.slice(2);
const systemFile = args[args.indexOf('--system-file') + 1];

if (stdin.includes('MODE:fail')) {
  process.stderr.write('Error: usage limit reached for this plan\n');
  process.exit(3);
}
if (stdin.includes('MODE:noisy')) {
  const retry = 'ERROR: unexpected status 401 Unauthorized: Missing bearer authentication\n';
  process.stderr.write('Reconnecting... 1/5\n' + retry.repeat(5) + 'IneligibleTierError: plan not supported\n    at setupUser (file.js:311:5)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n');
  process.exit(1);
}
if (stdin.includes('MODE:silent')) process.exit(0);
if (stdin.includes('MODE:sleep')) {
  fs.writeFileSync(process.env.FAKE_CLI_PID_FILE, JSON.stringify({ pid: process.pid, cwd: process.cwd() }));
  setTimeout(() => {}, 60_000);
} else if (stdin.includes('MODE:split')) {
  // An answer whose pieces end in the middle of a character: "ü" and "ë" are 2 bytes, the clover 4.
  const bytes = Buffer.from('Freundliche Grüsse, Zoë 🍀');
  const cuts = [bytes.indexOf(0xc3) + 1, bytes.lastIndexOf(0xc3) + 1, bytes.length - 2];
  const pieces = [bytes.subarray(0, cuts[0]), bytes.subarray(cuts[0], cuts[1]), bytes.subarray(cuts[1], cuts[2]), bytes.subarray(cuts[2])];
  for (const piece of pieces) {
    fs.writeSync(1, piece);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60); // long enough for the server to read each piece alone
  }
} else {
  process.stdout.write(JSON.stringify({
    cwd: process.cwd(),
    filesInCwd: fs.readdirSync(process.cwd()),
    args,
    stdin,
    system: systemFile && fs.existsSync(systemFile) ? fs.readFileSync(systemFile, 'utf8') : null,
  }));
}
