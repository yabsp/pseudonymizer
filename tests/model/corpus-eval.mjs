// Measures detection on a corpus of synthetic documents with ground truth, through the same steps as the app
// (patterns, addEntry, addDetected, pseudonymize) and the real GLiNER helper, spoken to as the server does (JSON
// lines over stdio, without the HTTP timeout that a loaded machine can exceed). Opt-in and
// slow the first time; detector output is cached per text, labels, model, threshold and helper version, so a
// change to the privacy core or the patterns re-runs in seconds.
//
//   npm run eval:corpus -- --corpus ../pseudonymizer-corpus [--thresholds 0.3,0.4,0.5] [--tag name]
//                          [--only id1,id2] [--show-held-out] [--no-cache]
//                          [--compare tag]   (lists leaks and over-redactions that changed since that run)
//
// The corpus layout and the metrics are described in the corpus README: text/<id>.txt or extracted/<id>.md,
// truth/<id>.json with values (must be hidden) and keep (must stay readable). Writes
// reports/tune-detection-eval[-tag].json and .md into the corpus.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { addDetected, addEntry, categorizePresidioEntities, COMMON_WORDS, detectWithPatterns, GLINER_LABELS, normalizeText, pseudonymize } from '../helpers/core.mjs';
import { GLINER_HELPER, ROOT } from '../helpers/server.mjs';

const MODEL = 'urchade/gliner_multi_pii-v1';
const DEFAULT_THRESHOLD = '0.4';
const PYTHON = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const HELPER_FILES = ['python/gliner_helper.py', 'python/presidio_detection.py'];
// One request runs GLiNER and Presidio; the GLiNER detector's result is the part marked source "gliner",
// which is exactly what /api/detect/gliner returns for the same text.
const DETECTORS = ['gliner', 'presidio'];
// About a quarter of the documents, chosen by a hash of the id, is a held-out set: it is not looked at while
// tuning, only its totals are reported, so the results show whether a change generalizes.
const isHeldOut = (id) => crypto.createHash('sha256').update(id).digest()[0] % 4 === 0;

const { values: args } = parseArgs({
  options: {
    corpus: { type: 'string' },
    thresholds: { type: 'string', default: '0.3,0.4,0.5' },
    tag: { type: 'string', default: '' },
    only: { type: 'string', default: '' },
    cache: { type: 'string', default: path.join(os.tmpdir(), 'pseudonymizer-eval-cache') },
    'no-cache': { type: 'boolean', default: false },
    'show-held-out': { type: 'boolean', default: false },
    compare: { type: 'string' },
  },
});
if (!args.corpus) throw new Error('--corpus <folder> is required (see the corpus README)');
const CORPUS = path.resolve(args.corpus);
const THRESHOLDS = args.thresholds.split(',').map((t) => t.trim());

// Comparison as the corpus README defines it: Unicode NFC, any whitespace (line breaks too) as one space, any case.
const WHITESPACE = /\s+/g;
// A Windows line end, read as a plain line break like the app's text box does.
const CRLF = /\r\n/g;
// Also a hyphen with spaces after it between letters or digits, as PDF extraction writes a value wrapped in a
// table cell ("TA- 2601178" is "TA-2601178"), so such a value still counts as leaked where it stays visible.
const WRAPPED_HYPHEN = /(?<=[\p{L}\p{N}])- +(?=[\p{L}\p{N}])/gu;
const normalize = (text) => text.normalize('NFC').replace(WHITESPACE, ' ').replace(WRAPPED_HYPHEN, '-').toLowerCase();
// A part of a person's name as the metrics count it: split at spaces, "-", "'", "." and ",", kept when it
// starts with a capital and has 3 or more letters ("Ammann", "Keller" in "Ammann-Keller"; not "von", "H.").
const NAME_SEPARATORS = /[\s\-'’.,]+/u;
const STARTS_WITH_CAPITAL = /^\p{Lu}/u;
const LETTER = /\p{L}/gu;
// Titles, forms of address and other words of the never-sensitive list ("Signora", "Herrn", "Prof", "UND" in
// "ZIMMERLI THOMAS UND SANDRA") are not parts of a name: seeing them reveals nobody. This is stricter than
// counting them, and differs from the corpus README, which counts every capitalised word.
const namePartsOf = (value) => value.normalize('NFC').split(NAME_SEPARATORS)
  .filter((part) => STARTS_WITH_CAPITAL.test(part) && (part.match(LETTER) || []).length >= 3 && !COMMON_WORDS.has(part.toLowerCase()));
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;
// A name part counts as visible where it stands as a word, also with a genitive "s" ("Ammanns"), but not inside
// another word ("Lea" in "please").
const partPattern = (part) => new RegExp(`(?<![\\p{L}\\p{N}])${normalize(part).replace(REGEX_SYNTAX, '\\$&')}s?(?![\\p{L}\\p{N}])`, 'u');

function readCorpus() {
  const only = new Set(args.only.split(',').filter(Boolean));
  return fs.readdirSync(path.join(CORPUS, 'truth')).filter((f) => f.endsWith('.json')).sort().flatMap((file) => {
    const truth = JSON.parse(fs.readFileSync(path.join(CORPUS, 'truth', file), 'utf8'));
    const id = path.basename(file, '.json');
    if (only.size && !only.has(id)) return [];
    const source = [path.join(CORPUS, 'text', id + '.txt'), path.join(CORPUS, 'extracted', id + '.md')].find((f) => fs.existsSync(f));
    if (!source) return [];
    return [{ id, truth, text: fs.readFileSync(source, 'utf8').replace(CRLF, '\n'), heldOut: isHeldOut(id) }];
  });
}

const helperVersion = crypto.createHash('sha256').update(HELPER_FILES.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n')).digest('hex');
const labels = Object.keys(GLINER_LABELS);

function cacheFile(text, threshold) {
  const key = crypto.createHash('sha256').update(JSON.stringify({ helperVersion, MODEL, threshold, labels, text })).digest('hex');
  return path.join(args.cache, key + '.json');
}

/** The GLiNER helper as server/gliner.js starts it: one request per line on stdin, one answer per line on stdout. */
function startHelper() {
  const child = spawn(PYTHON, [GLINER_HELPER], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });
  const pending = new Map();
  let nextId = 1;
  let unread = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    const lines = (unread + data).split('\n');
    unread = lines.pop();
    for (const line of lines.filter(Boolean)) {
      const answer = JSON.parse(line);
      pending.get(answer.id)?.(answer);
      pending.delete(answer.id);
    }
  });
  child.on('close', (code) => {
    for (const settle of pending.values()) settle({ error: `the helper stopped (exit code ${code})` });
    pending.clear();
  });
  return {
    ask: (request) => new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      child.stdin.write(JSON.stringify({ id, ...request }) + '\n');
    }),
    close: () => child.stdin.end(),
  };
}

/** { entities, language, ms, presidioError? } from the cache or the helper. */
async function detectRaw(getHelper, text, threshold) {
  const file = cacheFile(text, threshold);
  if (!args['no-cache'] && fs.existsSync(file)) {
    try {
      return { ...JSON.parse(fs.readFileSync(file, 'utf8')), cached: true };
    } catch {
      // a cache file cut short by an interrupted run: detect again and overwrite it
    }
  }
  const helper = await getHelper();
  const request = { text, labels, threshold: Number(threshold), model: MODEL, language: 'auto' };
  const started = Date.now();
  let answer = await helper.ask({ ...request, engine: 'presidio' });
  let result;
  if (!answer.error) {
    result = { entities: answer.entities, language: answer.language, ms: Date.now() - started };
  } else {
    // Presidio refuses a language without a spaCy model (Italian); GLiNER alone still runs.
    const presidioError = answer.error;
    answer = await helper.ask({ ...request, engine: 'gliner' });
    if (answer.error) throw new Error(`GLiNER failed: ${answer.error}`);
    result = { entities: answer.entities, presidioError, ms: Date.now() - started };
  }
  fs.mkdirSync(args.cache, { recursive: true });
  // written to a temporary name first, so an interrupted run never leaves half a file behind
  fs.writeFileSync(file + '.tmp', JSON.stringify(result));
  fs.renameSync(file + '.tmp', file);
  return { ...result, cached: false };
}

// the same steps as ui/workflow.js, with the default settings (patterns on)
function pseudonymizeAsTheApp(text, entities) {
  let mapping = [];
  for (const e of detectWithPatterns(text)) mapping = addEntry(mapping, e.text, e.category, text);
  mapping = addDetected(mapping, entities, text, COMMON_WORDS);
  return { mapping, pseudo: pseudonymize(mapping, text) };
}

function measure(doc, mapping, pseudo) {
  const shown = normalize(pseudo);
  const mapped = mapping.map((m) => normalize(m.original));
  const values = doc.truth.values.map((v) => ({ ...v, norm: normalize(v.text) }));
  const leaks = [];
  for (const value of values) {
    const visible = shown.includes(value.norm) ? [value.text]
      : value.category === 'PERSON' ? namePartsOf(value.text).filter((part) => partPattern(part).test(shown)) : [];
    for (const text of visible) {
      // "replace" when the mapping has the value but it is still in the text (case, line break, Unicode form)
      const how = mapped.some((m) => m === normalize(text) || m.includes(normalize(text))) ? 'replace' : 'detect';
      leaks.push({ text, of: value.text, category: value.category, how });
    }
  }
  const uniqueLeaks = leaks.filter((l, i) => leaks.findIndex((o) => normalize(o.text) === normalize(l.text)) === i);
  const overRedacted = (doc.truth.keep || []).filter((k) => !shown.includes(normalize(k)));
  const falseHits = mapping.filter((m) => !values.some((v) => v.norm.includes(normalize(m.original)))).map((m) => m.original);
  return { leaks: uniqueLeaks, overRedacted, falseHits };
}

const sum = (list, f) => list.reduce((n, x) => n + f(x), 0);

function totals(rows) {
  return {
    documents: rows.length,
    values: sum(rows, (r) => r.values),
    leaks: sum(rows, (r) => r.leaks.length),
    leakDocuments: rows.filter((r) => r.leaks.length).length,
    keep: sum(rows, (r) => r.keep),
    overRedacted: sum(rows, (r) => r.overRedacted.length),
    falseHits: sum(rows, (r) => r.falseHits.length),
    mapped: sum(rows, (r) => r.mapped),
    failed: rows.filter((r) => r.error).length,
  };
}

async function main() {
  const docs = readCorpus();
  if (!docs.length) throw new Error(`no documents with truth in ${CORPUS}`);
  let helper = null;
  let loadMs = null;
  const getHelper = async () => {
    if (helper) return helper;
    helper = startHelper();
    const started = Date.now();
    const answer = await helper.ask({ text: '', labels, threshold: 0.4, model: MODEL });
    if (answer.error) throw new Error('GLiNER did not start: ' + answer.error);
    loadMs = Date.now() - started;
    return helper;
  };

  const results = [];
  try {
    for (const doc of docs) {
      for (const threshold of THRESHOLDS) {
        const raw = await detectRaw(getHelper, normalizeText(doc.text), threshold);
        console.error(`${doc.id} ${threshold}: ${raw.cached ? 'cached' : raw.ms + ' ms'}${raw.presidioError ? ` (Presidio: ${raw.presidioError})` : ''}`);
        for (const detector of DETECTORS) {
          const base = { id: doc.id, detector, threshold, heldOut: doc.heldOut, values: doc.truth.values.length, keep: (doc.truth.keep || []).length };
          if (detector === 'presidio' && raw.presidioError) {
            results.push({ ...base, error: raw.presidioError, leaks: [], overRedacted: [], falseHits: [], mapped: 0 });
            continue;
          }
          const entities = raw.entities.filter((e) => detector === 'presidio' || e.source !== 'presidio');
          const started = performance.now();
          const { mapping, pseudo } = pseudonymizeAsTheApp(doc.text, categorizePresidioEntities(entities, GLINER_LABELS));
          const coreMs = performance.now() - started;
          results.push({ ...base, ...measure(doc, mapping, pseudo), mapped: mapping.length, language: raw.language,
            detectMs: raw.cached ? null : raw.ms, cachedMs: raw.ms, coreMs: Math.round(coreMs), chars: doc.text.length, pages: doc.truth.pages ?? null });
        }
      }
    }
  } finally {
    helper?.close();
  }
  writeReports(docs, results, loadMs);
}

function writeReports(docs, results, loadMs) {
  const configs = DETECTORS.flatMap((detector) => THRESHOLDS.map((threshold) => ({ detector, threshold })));
  const summary = configs.map(({ detector, threshold }) => {
    const rows = results.filter((r) => r.detector === detector && r.threshold === threshold);
    return { detector, threshold, dev: totals(rows.filter((r) => !r.heldOut)), heldOut: totals(rows.filter((r) => r.heldOut)), all: totals(rows) };
  });
  const name = 'tune-detection-eval' + (args.tag ? '-' + args.tag : '');
  const out = path.join(CORPUS, 'reports');
  fs.mkdirSync(out, { recursive: true });
  const timing = results.filter((r) => r.detector === 'gliner' && r.threshold === DEFAULT_THRESHOLD);
  const json = { date: new Date().toISOString(), model: MODEL, labels: labels.length, modelLoadMs: loadMs, documents: docs.map((d) => ({ id: d.id, heldOut: d.heldOut })), summary, results };
  fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify(json, null, 1));

  const showDoc = (r) => !r.heldOut || args['show-held-out'];
  const lines = [`# Detection on the corpus${args.tag ? ` (${args.tag})` : ''}`, '', `${json.date}, ${docs.length} documents (${docs.filter((d) => d.heldOut).length} held out), ${MODEL}, ${labels.length} labels, patterns on.`,
    `Model load ${loadMs === null ? 'not measured (all cached)' : loadMs + ' ms'}; detection ${timing.some((r) => r.detectMs !== null) ? 'per document below' : 'from cache, times of the run that filled it'}.`, '',
    '| Detector | Threshold | Set | Docs | Values | Leaks | Docs with leaks | Keep | Over-redacted | Entries | False hits | Failed |', '|---|---|---|---|---|---|---|---|---|---|---|---|'];
  for (const s of summary) for (const set of ['dev', 'heldOut']) {
    const t = s[set];
    lines.push(`| ${s.detector} | ${s.threshold} | ${set} | ${t.documents} | ${t.values} | ${t.leaks} | ${t.leakDocuments} | ${t.keep} | ${t.overRedacted} | ${t.mapped} | ${t.falseHits} | ${t.failed} |`);
  }
  for (const { detector, threshold } of configs) {
    lines.push('', `## ${detector}, threshold ${threshold}`, '');
    for (const r of results.filter((x) => x.detector === detector && x.threshold === threshold && showDoc(x))) {
      if (r.error) { lines.push(`- ${r.id}: failed: ${r.error}`); continue; }
      const parts = [`${r.values - new Set(r.leaks.map((l) => l.of)).size}/${r.values} values hidden`, `${r.mapped} entries`, `${r.cachedMs} ms`];
      lines.push(`- ${r.id}${r.language ? ` [${r.language}]` : ''}: ${parts.join(', ')}`);
      if (r.leaks.length) lines.push(`  - leaks: ${r.leaks.map((l) => `${l.text}${l.text !== l.of ? ` (of ${l.of})` : ''} [${l.category}, ${l.how}]`).join(' | ')}`);
      if (r.overRedacted.length) lines.push(`  - over-redacted: ${r.overRedacted.join(' | ')}`);
      if (r.falseHits.length) lines.push(`  - false hits: ${r.falseHits.join(' | ')}`);
    }
  }
  fs.writeFileSync(path.join(out, name + '.md'), lines.join('\n') + '\n');
  for (const s of summary) console.log(`${s.detector} ${s.threshold}: dev leaks ${s.dev.leaks}/${s.dev.values}, over-redacted ${s.dev.overRedacted}/${s.dev.keep}, false hits ${s.dev.falseHits}; held-out leaks ${s.heldOut.leaks}/${s.heldOut.values}, over ${s.heldOut.overRedacted}, false ${s.heldOut.falseHits}`);
  console.log(`written ${path.join(out, name + '.md')}`);
  if (args.compare !== undefined) compareWith(path.join(out, 'tune-detection-eval' + (args.compare ? '-' + args.compare : '') + '.json'), results, showDoc);
}

/** Prints what changed per detector and threshold since an earlier run: leaks and over-redactions, new and gone. */
function compareWith(file, results, showDoc) {
  const before = JSON.parse(fs.readFileSync(file, 'utf8')).results;
  const keyOf = (r) => `${r.detector} ${r.threshold} ${r.id}`;
  const old = new Map(before.map((r) => [keyOf(r), r]));
  const items = (r, field) => new Set((r?.[field] || []).map((x) => (typeof x === 'string' ? x : x.text)));
  for (const r of results.filter(showDoc)) {
    const was = old.get(keyOf(r));
    for (const field of ['leaks', 'overRedacted']) {
      const [now, then] = [items(r, field), items(was, field)];
      const added = [...now].filter((x) => !then.has(x));
      const gone = [...then].filter((x) => !now.has(x));
      if (added.length || gone.length) console.log(`${keyOf(r)} ${field}: ${added.length ? '+ ' + added.join(' | ') : ''}${added.length && gone.length ? '  ' : ''}${gone.length ? '- ' + gone.join(' | ') : ''}`);
    }
  }
}

await main();
