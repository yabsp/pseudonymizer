// Stands in for claude/codex/gemini. MODE:fail, MODE:noisy, MODE:silent and MODE:sleep in the prompt trigger
// those behaviours; otherwise it answers with what it received, as JSON.
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
} else {
  process.stdout.write(JSON.stringify({
    cwd: process.cwd(),
    filesInCwd: fs.readdirSync(process.cwd()),
    args,
    stdin,
    system: systemFile && fs.existsSync(systemFile) ? fs.readFileSync(systemFile, 'utf8') : null,
  }));
}
