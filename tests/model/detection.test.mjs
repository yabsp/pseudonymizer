// The real detection model on realistic synthetic documents, through the same steps as the app. Only with
// RUN_MODEL_TESTS=1 ("npm run test:model"): it needs the installed model and takes several minutes.
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { readConfig } from '../../server/config.js';
import { loadGliner } from '../../server/gliner.js';
import { loadDocuments, measure } from '../helpers/corpus.mjs';
import { addDetected, addEntry, categoryForLabel, COMMON_WORDS, detectWithPatterns, LABELS, normalizeText, pseudonymize } from '../helpers/core.mjs';

const SKIP = !process.env.RUN_MODEL_TESTS && 'set RUN_MODEL_TESTS=1 (npm run test:model) to run the real model';
const THRESHOLD = 0.4; // "Balanced", the app's default

// A measured baseline, not a goal: what is still visible, and what is hidden although it should stay readable, over
// all documents (2850 values, 538 terms to keep). Change these only from an actual run, and say so in the commit.
// 2026-11-11, 8-bit model, 73 documents: see docs/reference.md, "Measurements".
const KNOWN = { leaks: 19, overRedacted: 20 };

// the same steps as public/js/detection.js
function pseudonymizeAsTheApp(text, entities) {
  const source = normalizeText(text);
  let mapping = [];
  for (const e of detectWithPatterns(source)) mapping = addEntry(mapping, e.text, e.category, source);
  mapping = addDetected(mapping, entities.map((e) => ({ text: e.text, category: categoryForLabel(LABELS, e.label) })), source, COMMON_WORDS);
  return pseudonymize(mapping, source);
}

describe('real detection on realistic documents', { skip: SKIP }, () => {
  let model;
  const results = [];
  let totalMs = 0;

  before(async () => {
    model = await loadGliner(readConfig().modelDir, { threads: readConfig().threads });
    assert.equal(process.env.ORT_DISABLE_TELEMETRY, '1', 'the library was loaded with its usage reports turned off');
    for (const doc of await loadDocuments()) {
      const started = Date.now();
      const entities = await model.detect(normalizeText(doc.text), Object.keys(LABELS), THRESHOLD);
      const ms = Date.now() - started;
      totalMs += ms;
      results.push({ doc, ms, ...measure(doc, pseudonymizeAsTheApp(doc.text, entities), COMMON_WORDS) });
    }
  }, { timeout: 3_600_000 });
  after(() => model?.release());

  it('leaves no more values visible than the measured baseline', (t) => {
    const leaking = results.filter((r) => r.leaks.length);
    for (const r of leaking) t.diagnostic(`${r.doc.id}: visible: ${r.leaks.join(' | ')}`);
    const total = results.reduce((n, r) => n + r.leaks.length, 0);
    t.diagnostic(`${total} of ${results.reduce((n, r) => n + r.doc.values.length, 0)} values visible in ${leaking.length} of ${results.length} documents (baseline ${KNOWN.leaks})`);
    assert.ok(total <= KNOWN.leaks, `${total} values are visible, the baseline is ${KNOWN.leaks}`);
  });

  it('hides no more of the text that should stay readable than the measured baseline', (t) => {
    for (const r of results.filter((x) => x.overRedacted.length)) t.diagnostic(`${r.doc.id}: changed: ${r.overRedacted.join(' | ')}`);
    const total = results.reduce((n, r) => n + r.overRedacted.length, 0);
    t.diagnostic(`${total} of ${results.reduce((n, r) => n + r.doc.keep.length, 0)} terms changed (baseline ${KNOWN.overRedacted})`);
    assert.ok(total <= KNOWN.overRedacted, `${total} terms were changed, the baseline is ${KNOWN.overRedacted}`);
  });

  it('timing', (t) => {
    const chars = results.reduce((n, r) => n + r.doc.text.length, 0);
    t.diagnostic(`${model.name}: ${Math.round(totalMs / 1000)} s for ${chars} characters, ${Math.round(totalMs / chars * 1000)} ms per 1000 characters`);
  });
});
