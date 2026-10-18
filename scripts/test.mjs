// "npm test" variants that need an environment variable, set here so they work the same on every system:
//   --strict  known gaps fail instead of being reported as TODO (STRICT_KNOWN_GAPS=1)
//   --model   the real GLiNER on the realistic documents (RUN_MODEL_TESTS=1)
import { spawn } from 'node:child_process';

const MODES = {
  '--strict': { env: { STRICT_KNOWN_GAPS: '1' }, files: ['tests/**/*.test.mjs'] },
  '--model': { env: { RUN_MODEL_TESTS: '1' }, files: ['tests/model/detection-eval.test.mjs'] },
};

const mode = MODES[process.argv[2]];
if (!mode) {
  console.error(`Expected one of ${Object.keys(MODES).join(', ')}.`);
  process.exit(2);
}
const child = spawn(process.execPath, ['--test', ...mode.files], { stdio: 'inherit', env: { ...process.env, ...mode.env } });
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
