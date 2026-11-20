// "npm run check": the syntax of every JavaScript file of the app, the same on every system.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOLDERS = ['desktop', 'server', 'public/js', 'scripts', 'tests'];

const files = [...FOLDERS.flatMap((folder) => fs.readdirSync(path.join(ROOT, folder), { recursive: true })
  .filter((name) => ['.js', '.mjs'].includes(path.extname(name)))
  .map((name) => path.join(ROOT, folder, name)))];
let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed++;
}
console.log(`${files.length} files checked${failed ? `, ${failed} with errors` : ''}.`);
process.exit(failed ? 1 : 0);
