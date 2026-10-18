// Builds pdf/<id>.pdf and truth/<id>.json of the corpus from documents/<id>.mjs.
// Usage: node tools/corpus/build.mjs --out <corpus folder> [id ...]   (see README.md for ELECTRON and CORPUS_PYTHON)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEX, checkDocument, formulasOf, layoutOf, loadDocuments } from './check.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PYTHON = process.env.CORPUS_PYTHON || 'python3';
const BASE_CSS = fs.readFileSync(path.join(HERE, 'base.css'), 'utf8');

function electronPath() {
  if (process.env.ELECTRON) return process.env.ELECTRON;
  return createRequire(path.join(ROOT, 'package.json'))('electron');
}

function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed (${result.status}): ${result.stderr || result.error}`);
  return result.stdout;
}

function texToMathml(documents) {
  const items = documents.flatMap(({ doc }) => doc.parts.flatMap((p) => [...p.html.matchAll(TEX)].map((m) => ({ tex: m[2].trim(), display: Boolean(m[1]) }))));
  const results = JSON.parse(run(PYTHON, [path.join(HERE, 'tex.py')], JSON.stringify(items)));
  const failed = results.map((r, i) => r.error && `${items[i].tex}: ${r.error}`).filter(Boolean);
  if (failed.length) throw new Error(`LaTeX that latex2mathml can't read:\n${failed.join('\n')}`);
  return new Map(items.map((item, i) => [`${item.display}|${item.tex}`, results[i]]));
}

function partBody(part, mathml) {
  const html = part.html.replace(TEX, (_m, display, tex) => mathml.get(`${Boolean(display)}|${tex.trim()}`));
  return part.columns === 2 ? `<div class="columns">${html}</div>` : html;
}

function page(doc, bodies) {
  return `<!doctype html><html lang="${doc.language}"><head><meta charset="utf-8"><title>${doc.title}</title>
<style>${BASE_CSS}\n${doc.css ?? ''}</style></head><body>${bodies.join('\n<div class="page-break"></div>\n')}</body></html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  if (outIndex < 0 || !args[outIndex + 1]) throw new Error('usage: build.mjs --out <corpus folder> [id ...]');
  const out = path.resolve(args[outIndex + 1]);
  const ids = args.filter((_a, i) => i !== outIndex && i !== outIndex + 1);
  const documents = (await loadDocuments(ids)).filter(({ file, doc }) => {
    const { errors } = checkDocument(file, doc);
    if (errors.length) console.error(`skipped ${file}: ${errors.join('; ')}`);
    return !errors.length;
  });
  const mathml = texToMathml(documents);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'pseudo-corpus-'));
  try {
    const renderJobs = [];
    const scanJobs = [];
    for (const [n, { doc }] of documents.entries()) {
      const bodies = doc.parts.map((part) => partBody(part, mathml));
      const whole = { html: path.join(work, `${doc.id}.html`), pdf: path.join(work, `${doc.id}.pdf`), header: doc.header, footer: doc.footer };
      fs.writeFileSync(whole.html, page(doc, bodies));
      renderJobs.push(whole);
      const parts = bodies.map((body, i) => {
        const job = { html: path.join(work, `${doc.id}.part${i}.html`), pdf: path.join(work, `${doc.id}.part${i}.pdf`), header: doc.header, footer: doc.footer };
        fs.writeFileSync(job.html, page(doc, [body]));
        renderJobs.push(job);
        return { pdf: job.pdf, scan: doc.parts[i].scan ?? null };
      });
      scanJobs.push({ pdf: whole.pdf, out: path.join(out, 'pdf', `${doc.id}.pdf`), seed: n + 1, parts });
    }
    const renderJob = path.join(work, 'render.json');
    fs.writeFileSync(renderJob, JSON.stringify(renderJobs));
    run(electronPath(), [path.join(HERE, 'render.cjs'), renderJob]);
    fs.mkdirSync(path.join(out, 'pdf'), { recursive: true });
    fs.mkdirSync(path.join(out, 'truth'), { recursive: true });
    const scanJob = path.join(work, 'scan.json');
    fs.writeFileSync(scanJob, JSON.stringify(scanJobs));
    const pageCounts = JSON.parse(run(PYTHON, [path.join(HERE, 'scan.py'), scanJob]));
    for (const [i, { doc }] of documents.entries()) {
      const truth = {
        id: doc.id, domain: doc.domain, language: doc.language, title: doc.title, source: 'pdf',
        layout: layoutOf(doc), pages: pageCounts[i], values: doc.values, keep: doc.keep ?? [], formulas: formulasOf(doc),
      };
      fs.writeFileSync(path.join(out, 'truth', `${doc.id}.json`), JSON.stringify(truth, null, 2) + '\n');
      console.log(`${doc.id}: ${pageCounts[i]} pages, ${truth.values.length} values, ${truth.formulas.length} formulas`);
    }
  } finally {
    if (!process.env.CORPUS_KEEP_WORK) fs.rmSync(work, { recursive: true, force: true });
    else console.log(`work folder kept: ${work}`);
  }
}

await main();
