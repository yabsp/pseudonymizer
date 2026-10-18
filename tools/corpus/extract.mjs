// Runs the app's PDF extraction on the corpus PDFs and writes extracted/<id>.md (and <id>.formulas.md with
// formula conversion for documents whose truth lists formulas), plus the wall time of each run.
// Usage: node tools/corpus/extract.mjs --out <corpus folder> [--extractor <document_extraction.py>]
//        [--python <python>] [--formulas | --only-formulas] [--suffix <text>] [--timings <file.json>] [id ...]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const VENV_PYTHON = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const FLAGS = ['--formulas', '--only-formulas'];
const OPTIONS = ['--out', '--extractor', '--python', '--suffix', '--timings'];
const TIMEOUT_MS = 60 * 60 * 1000;

function parseArgs(argv) {
  const options = { ids: [] };
  for (let i = 0; i < argv.length; i++) {
    if (FLAGS.includes(argv[i])) options[argv[i].slice(2)] = true;
    else if (OPTIONS.includes(argv[i])) options[argv[i].slice(2)] = argv[++i];
    else options.ids.push(argv[i]);
  }
  if (!options.out) throw new Error('usage: extract.mjs --out <corpus folder> [options] [id ...]');
  return options;
}

function extractOne(python, extractor, file, formulas) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(python, [extractor, file, ...(formulas ? ['--formulas'] : [])], { cwd: ROOT });
    let out = '';
    let errors = '';
    const timer = setTimeout(() => child.kill(), TIMEOUT_MS);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (errors = (errors + d).slice(-4000)));
    child.on('close', (code) => {
      clearTimeout(timer);
      const seconds = (Date.now() - started) / 1000;
      try {
        resolve({ seconds, answer: JSON.parse(out.trim().split('\n').pop()) });
      } catch {
        resolve({ seconds, answer: { error: `exit code ${code}: ${errors.trim().split('\n').slice(-3).join(' ')}` } });
      }
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const python = options.python ?? (fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3');
  const extractor = path.resolve(options.extractor ?? path.join(ROOT, 'python', 'document_extraction.py'));
  const corpus = path.resolve(options.out);
  const suffix = options.suffix ?? '';
  const ids = options.ids.length ? options.ids
    : fs.readdirSync(path.join(corpus, 'pdf')).filter((f) => f.endsWith('.pdf')).map((f) => f.slice(0, -4)).sort();
  fs.mkdirSync(path.join(corpus, 'extracted'), { recursive: true });
  const timings = [];
  for (const id of ids) {
    const truth = JSON.parse(fs.readFileSync(path.join(corpus, 'truth', `${id}.json`), 'utf8'));
    const runs = [];
    if (!options['only-formulas']) runs.push(false);
    if ((options.formulas || options['only-formulas']) && truth.formulas.length) runs.push(true);
    for (const formulas of runs) {
      const { seconds, answer } = await extractOne(python, extractor, path.join(corpus, 'pdf', `${id}.pdf`), formulas);
      const name = `${id}${formulas ? '.formulas' : ''}${suffix}.md`;
      if (answer.error) {
        console.log(`${name}: FAILED after ${seconds.toFixed(1)} s: ${answer.error}`);
      } else {
        fs.writeFileSync(path.join(corpus, 'extracted', name), answer.markdown);
        console.log(`${name}: ${seconds.toFixed(1)} s, ${answer.pages} pages, ${answer.tables} tables, ${answer.images} images, ${answer.formulas} formulas`);
      }
      const { markdown: _markdown, ...facts } = answer;
      timings.push({ id, formulas, seconds, ...facts });
      if (options.timings) fs.writeFileSync(options.timings, JSON.stringify(timings, null, 2) + '\n');
    }
  }
}

await main();
