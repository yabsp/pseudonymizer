// Scores detector output with the shared corpus metrics, through the same steps as ui/workflow.js
// (patterns, addDetected, pseudonymize). Usage:
//   node tests/bench/score.mjs [--docs fixtures|corpus|all] [--details] <entities.jsonl> [more.jsonl ...]
// Each file has one line per document: { id, ms, entities: [{ text, category } or { text, label, source }] }.
// Several files are combined (union of their entities), so ensembles are scored without running them again.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { addDetected, addEntry, categorizePresidioEntities, COMMON_WORDS, detectWithPatterns, GLINER_LABELS, pseudonymize } from '../helpers/core.mjs';
import { loadDocuments } from './corpus.mjs';
import { findConsistentValues } from './consistency.mjs';

const OPTIONS = { consistency: process.argv.includes('--consistency') };

// The metrics as tests/model/corpus-eval.mjs (branch tune/detection) measures them, so results compare:
// Unicode NFC, any whitespace (line breaks too) as one space, any case.
const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').toLowerCase();
// A part of a person's name: split at spaces, "-", "'", "." and ",", kept when it starts with a capital and has
// 3 or more letters ("Ammann", "Keller" in "Ammann-Keller"; not "von", "H.").
const NAME_SEPARATORS = /[\s\-'’.,]+/u;
const STARTS_WITH_CAPITAL = /^\p{Lu}/u;
const LETTER = /\p{L}/gu;
const namePartsOf = (value) => value.normalize('NFC').split(NAME_SEPARATORS)
  .filter((part) => STARTS_WITH_CAPITAL.test(part) && (part.match(LETTER) || []).length >= 3);
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;
// A name part counts as visible where it stands as a word, also with a genitive "s" ("Ammanns"), not inside
// another word ("Lea" in "please").
const partPattern = (part) => new RegExp(`(?<![\\p{L}\\p{N}])${normalize(part).replace(REGEX_SYNTAX, '\\$&')}s?(?![\\p{L}\\p{N}])`, 'u');

export function pseudonymizeAsTheApp(text, entities) {
  let mapping = [];
  for (const e of detectWithPatterns(text)) mapping = addEntry(mapping, e.text, e.category, text);
  const extra = OPTIONS.consistency ? findConsistentValues(text, [...detectWithPatterns(text), ...entities]) : [];
  mapping = addDetected(mapping, [...entities, ...extra], text, COMMON_WORDS);
  return { mapping, pseudo: pseudonymize(mapping, text) };
}

function categorized(entities) {
  return entities.flatMap((e) => {
    if (e.category !== undefined) return e.category === null ? [] : [{ text: e.text, category: e.category }];
    return categorizePresidioEntities([e], GLINER_LABELS);
  });
}

export function scoreDocument(doc, entities) {
  const { mapping, pseudo } = pseudonymizeAsTheApp(doc.text, categorized(entities));
  const shown = normalize(pseudo);
  const leaks = new Set();
  for (const v of doc.values) {
    if (shown.includes(normalize(v.text))) leaks.add(v.text);
    else if (v.category === 'PERSON') for (const part of namePartsOf(v.text)) if (partPattern(part).test(shown)) leaks.add(part);
  }
  const overRedacted = doc.keep.filter((k) => !shown.includes(normalize(k)));
  const values = doc.values.map((v) => normalize(v.text));
  // As the corpus README defines them: mapping entries that are not part of any value ("Herr Reto Ammann" is one).
  const falseHits = mapping.filter((m) => !values.some((v) => v.includes(normalize(m.original)))).map((m) => m.original);
  // Stricter: entries that neither are part of a value nor contain one, i.e. text hidden for nothing.
  const unrelated = falseHits.filter((original) => !values.some((v) => normalize(original).includes(v)));
  return { leaks: [...leaks], overRedacted, falseHits, unrelated, mappingSize: mapping.length, pseudo };
}

function readEntityFiles(files) {
  const byId = new Map();
  for (const file of files) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const { id, ms = 0, entities, error } = JSON.parse(line);
      const prev = byId.get(id) || { ms: 0, entities: [], errors: [] };
      byId.set(id, { ms: prev.ms + ms, entities: [...prev.entities, ...(entities || [])], errors: error ? [...prev.errors, error] : prev.errors });
    }
  }
  return byId;
}

function main() {
  const args = process.argv.slice(2);
  const option = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args.splice(i, 2)[1]; };
  const flag = (name) => { const i = args.indexOf(name); return i >= 0 && !!args.splice(i, 1); };
  const which = option('--docs', 'all');
  const details = flag('--details');
  flag('--consistency');
  const json = flag('--json');
  const dumpPseudo = option('--dump-pseudo', null);
  const only = option('--only', null);
  const files = args;
  const byId = readEntityFiles(files);
  const docs = loadDocuments(which).filter((d) => byId.has(d.id) && (!only || new RegExp(only).test(d.id)));
  const rows = docs.map((doc) => ({ id: doc.id, source: doc.source, values: doc.values.length, keep: doc.keep.length, ...byId.get(doc.id), ...scoreDocument(doc, byId.get(doc.id).entities) }));
  const sum = (key) => rows.reduce((n, r) => n + (Array.isArray(r[key]) ? r[key].length : r[key]), 0);
  const corpusRows = rows.filter((r) => r.source !== 'fixture');
  const totals = { docs: rows.length, values: sum('values'), leaks: sum('leaks'), keep: sum('keep'), overRedacted: sum('overRedacted'), falseHits: sum('falseHits'), errors: sum('errors'), ms: sum('ms'), corpusFalseHits: corpusRows.reduce((n, r) => n + r.falseHits.length, 0), unrelated: sum('unrelated'), corpusUnrelated: corpusRows.reduce((n, r) => n + r.unrelated.length, 0) };
  // the pseudonymized texts, for a second detection pass over what would be sent
  if (dumpPseudo) fs.writeFileSync(dumpPseudo, rows.map((r) => JSON.stringify({ id: r.id, text: r.pseudo })).join('\n') + '\n');
  if (json) { console.log(JSON.stringify({ files, totals, rows: rows.map(({ entities, pseudo, ...r }) => r) })); return; }
  if (details) {
    for (const r of rows) {
      const parts = [`${r.id}: ${r.leaks.length} leaks, ${r.overRedacted.length}/${r.keep} over-redacted, ${r.falseHits.length} false hits, ${r.ms} ms`];
      if (r.errors.length) parts.push(`  ERRORS: ${r.errors.join(' | ')}`);
      if (r.leaks.length) parts.push(`  leaks: ${r.leaks.join(' | ')}`);
      if (r.overRedacted.length) parts.push(`  over-redacted: ${r.overRedacted.join(' | ')}`);
      if (r.unrelated.length) parts.push(`  unrelated hits: ${r.unrelated.join(' | ')}`);
      console.log(parts.join('\n'));
    }
  }
  console.log(`${files.map((f) => f.split(/[\\/]/).pop()).join(' + ')}: ${totals.docs} docs, leaks ${totals.leaks}/${totals.values}, over-redacted ${totals.overRedacted}/${totals.keep}, false hits ${totals.falseHits} (corpus ${totals.corpusFalseHits}), unrelated ${totals.unrelated} (corpus ${totals.corpusUnrelated}), errors ${totals.errors}, ${(totals.ms / 1000).toFixed(1)} s`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
