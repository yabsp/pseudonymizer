// Compares extracted Markdown against the truth and, optionally, against another extraction of the same PDFs.
// Per document: truth values and keep entries present in the Markdown (a value that is in the PDF but not in the
// Markdown is not reviewed, but also not sent), formula accuracy (normalized LaTeX similarity to truth formulas),
// and for two extractions the words that disappeared or appeared.
// Usage: node tools/corpus/compare.mjs --corpus <folder> --a <suffix or folder> [--b <suffix or folder>] [--formulas] [--json out.json] [id ...]
//   A suffix such as "" or ".gpu" means extracted/<id>[.formulas]<suffix>.md in the corpus.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? false : (args.splice(i, 1), true); };
const corpus = path.resolve(option('--corpus') ?? '.');
const a = option('--a') ?? '';
const b = option('--b');
const jsonOut = option('--json');
const formulas = flag('--formulas');
const ids = args.length ? args : fs.readdirSync(path.join(corpus, 'truth')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();

const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
// Words of letters or digits, e.g. "Müller", "756", "2026"; punctuation and table bars are ignored.
const WORD = /[\p{L}\p{N}]+/gu;
// $$...$$ display formulas and $...$ inline formulas in Docling's Markdown.
const LATEX = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

function read(source, id) {
  const name = `${id}${formulas ? '.formulas' : ''}`;
  const file = fs.existsSync(source) && fs.statSync(source).isDirectory()
    ? path.join(source, `${name}.md`) : path.join(corpus, 'extracted', `${name}${source}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

/** LaTeX reduced to its tokens, so spacing, \left/\right, \mathrm and braces around single tokens don't count. */
function canonicalLatex(tex) {
  return tex.replace(/\\(left|right|big|Big|bigg|Bigg)\b/g, '').replace(/\\(mathrm|text|operatorname|mathit)\s*\{([^{}]*)\}/g, '$2')
    .replace(/\\[,;:! ]|~/g, '').replace(/\{(\\?[A-Za-z0-9])\}/g, '$1').replace(/\s+/g, '').replace(/\\dfrac|\\tfrac/g, '\\frac');
}

function similarity(x, y) {
  if (!x.length && !y.length) return 1;
  let previous = Array.from({ length: y.length + 1 }, (_v, i) => i);
  for (let i = 1; i <= x.length; i++) {
    const current = [i];
    for (let j = 1; j <= y.length; j++) current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    previous = current;
  }
  return 1 - previous[y.length] / Math.max(x.length, y.length);
}

/** Each truth formula paired with its most similar extracted formula (each extracted one used once). */
function formulaScore(truth, markdown) {
  const found = [...markdown.matchAll(LATEX)].map((m) => canonicalLatex(m[1] ?? m[2]));
  const free = new Set(found.keys());
  const scores = truth.map((t) => {
    const target = canonicalLatex(t);
    let best = 0;
    let bestIndex = -1;
    for (const i of free) {
      const s = similarity(target, found[i]);
      if (s > best) { best = s; bestIndex = i; }
    }
    if (bestIndex >= 0) free.delete(bestIndex);
    return best;
  });
  return { extracted: found.length, mean: scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : null,
    exact: scores.filter((s) => s === 1).length, above90: scores.filter((s) => s >= 0.9).length };
}

function words(markdown) {
  const counts = new Map();
  for (const w of normalize(markdown).match(WORD) ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
  return counts;
}

function wordDiff(x, y) {
  const wx = words(x);
  const wy = words(y);
  const lost = [];
  const gained = [];
  for (const [w, n] of wx) if ((wy.get(w) ?? 0) < n) lost.push(`${w}${n - (wy.get(w) ?? 0) > 1 ? `x${n - (wy.get(w) ?? 0)}` : ''}`);
  for (const [w, n] of wy) if ((wx.get(w) ?? 0) < n) gained.push(`${w}${n - (wx.get(w) ?? 0) > 1 ? `x${n - (wx.get(w) ?? 0)}` : ''}`);
  return { lost, gained };
}

const rows = [];
for (const id of ids) {
  const truth = JSON.parse(fs.readFileSync(path.join(corpus, 'truth', `${id}.json`), 'utf8'));
  if (truth.source && truth.source !== 'pdf') continue;
  if (formulas && !truth.formulas.length) continue;
  const mdA = read(a, id);
  if (mdA === null) continue;
  const text = normalize(mdA);
  const missingValues = truth.values.filter((v) => !text.includes(normalize(v.text))).map((v) => v.text);
  const missingKeep = truth.keep.filter((k) => !text.includes(normalize(k)));
  const row = { id, chars: mdA.length, values: truth.values.length, missingValues, missingKeep };
  if (truth.formulas.length) row.formulas = formulaScore(truth.formulas, mdA);
  if (b !== undefined) {
    const mdB = read(b, id);
    if (mdB !== null) {
      const textB = normalize(mdB);
      row.b = { chars: mdB.length, missingValues: truth.values.filter((v) => !textB.includes(normalize(v.text))).map((v) => v.text), ...wordDiff(mdA, mdB) };
      if (truth.formulas.length) row.b.formulas = formulaScore(truth.formulas, mdB);
    }
  }
  rows.push(row);
}

for (const r of rows) {
  const f = r.formulas ? ` formulas ${r.formulas.extracted}/${(r.formulas.mean ?? 0).toFixed(2)}` : '';
  let line = `${r.id}: ${r.chars} chars, values not in Markdown ${r.missingValues.length}/${r.values}, keep missing ${r.missingKeep.length}${f}`;
  if (r.b) {
    const fb = r.b.formulas ? ` formulas ${r.b.formulas.extracted}/${(r.b.formulas.mean ?? 0).toFixed(2)}` : '';
    line += ` | B: ${r.b.chars} chars, values not in Markdown ${r.b.missingValues.length}${fb}, words lost ${r.b.lost.length}, gained ${r.b.gained.length}`;
  }
  console.log(line);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 1) + '\n');
