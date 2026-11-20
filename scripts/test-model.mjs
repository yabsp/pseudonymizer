// "npm run test:model": the real detection model on the synthetic documents (several minutes). The variable is
// set here, so the command is the same on every system.
import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['--test', 'tests/model/detection.test.mjs'], { stdio: 'inherit', env: { ...process.env, RUN_MODEL_TESTS: '1' } });
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
