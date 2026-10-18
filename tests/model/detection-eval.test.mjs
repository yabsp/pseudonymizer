// The real detectors (GLiNER, GLiNER + Presidio) on the realistic documents, as the app uses them. Only with
// RUN_MODEL_TESTS=1 (slow).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
import { addDetected, addEntry, categorizePresidioEntities, COMMON_WORDS, detectWithPatterns, GLINER_LABELS, pseudonymize } from '../helpers/core.mjs';
import { ROOT, startServer } from '../helpers/server.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

const PYTHON = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const SKIP = !process.env.RUN_MODEL_TESTS ? 'set RUN_MODEL_TESTS=1 to run the real model'
  : !fs.existsSync(PYTHON) ? 'GLiNER is not installed in .venv (see docs/setup.md)' : false;
const MODEL = 'urchade/gliner_multi_pii-v1';
const THRESHOLD = 0.4; // "Balanced", the app's default
// DETECTION_ACCELERATOR=onnx-cpu (or torch-cuda, onnx-directml, ...) runs the same baseline on other hardware, which
// must find the same values; default "auto".
const ACCELERATOR = process.env.DETECTION_ACCELERATOR || 'auto';

// Measured baselines per detector, reported as TODO: values still visible, and mustKeep text that was changed.
const DETECTORS = {
  gliner: {
    path: '/api/detect/gliner',
    // 2026-10-15: 25 labels, 150-word windows, name parts and short forms, patterns for IDs after a label,
    // reference codes, IBANs, dates and addresses; 14 documents
    // 2026-10-16: measured again with the 15 generated documents (29 in all); "Gerber" and "Lea" are now hidden
    // (single names of double names, names of relatives), windows with underscores are read twice
    // 2026-10-18: measured again (tune/detection, with the Swiss town list); "Peter" and "Ruth" are now hidden
    knownMisses: {
      'r5-it-ticket-mixed': ['Scheidung_Wenger_Rosa'],
    },
    knownChanges: {
      'r9-dataroom-index-en': ['D&O insurance'],
    },
  },
  presidio: {
    path: '/api/detect/presidio',
    // 2026-10-15: GLiNER as above plus Presidio 2.2.364 with the large spaCy models, language recognized automatically
    // 2026-10-16: measured again with the 15 generated documents (29 in all)
    knownMisses: {
      'r5-it-ticket-mixed': ['Scheidung_Wenger_Rosa'],
    },
    knownChanges: {
      'escalation-email-en': ['Honda Civic'],
      'trustee-notes-de-ch': ['Vorbezüge'],
      'r1-auth-log-en': ['auth-service', 'api-gw'],
      'r1-lab-report-it': ['Emoglobina', 'Ferritina'],
      'r2-invoice-it': ['Pagamento entro 30 giorni', 'Assistenza legale'],
      'r6-lab-results-de': ['Kreatinin', 'Thrombozyten'],
      'r9-dataroom-index-en': ['D&O insurance'],
    },
  },
};

// the same steps as ui/workflow.js
function pseudonymizeAsTheApp(doc, entities) {
  let mapping = [];
  for (const e of detectWithPatterns(doc.text)) mapping = addEntry(mapping, e.text, e.category, doc.text);
  return pseudonymize(addDetected(mapping, entities, doc.text, COMMON_WORDS), doc.text);
}

for (const [detector, { path: apiPath, knownMisses, knownChanges }] of Object.entries(DETECTORS)) {
  describe(`real ${detector} detection on realistic documents`, { skip: SKIP }, () => {
    let server;
    const results = new Map();

    before(async () => {
      server = await startServer({ env: { GLINER_PYTHON: PYTHON } });
      for (const doc of DOCUMENTS) {
        const started = Date.now();
        const res = await server.api('POST', apiPath, { text: doc.text, labels: Object.keys(GLINER_LABELS), threshold: THRESHOLD, model: MODEL, language: 'auto', accelerator: ACCELERATOR });
        assert.equal(res.status, 200, res.body);
        const { entities, language } = res.json();
        const pseudo = pseudonymizeAsTheApp(doc, categorizePresidioEntities(entities, GLINER_LABELS));
        results.set(doc.id, {
          pseudo,
          language,
          ms: Date.now() - started,
          leaked: doc.mustHide.filter((v) => pseudo.includes(v)),
          changed: (doc.mustKeep || []).filter((v) => !pseudo.includes(v)),
        });
      }
    }, { timeout: 600_000 });
    after(() => server?.close());

    for (const doc of DOCUMENTS) {
      describe(doc.id, () => {
        for (const value of doc.mustHide) {
          const options = knownMisses[doc.id]?.includes(value) ? knownGap(`missed by ${detector} + patterns at Balanced sensitivity`) : {};
          it(`hides "${value}"`, options, () => {
            assert.ok(!results.get(doc.id).pseudo.includes(value), `"${value}" is visible`);
          });
        }
        for (const text of doc.mustKeep || []) {
          const options = knownChanges[doc.id]?.includes(text) ? knownGap(`changed by ${detector}, a false hit`) : {};
          it(`keeps "${text}" unchanged`, options, () => {
            assert.ok(results.get(doc.id).pseudo.includes(text), `"${text}" was changed`);
          });
        }
      });
    }

    it('summary', (t) => {
      for (const doc of DOCUMENTS) {
        const { leaked, changed, ms, language } = results.get(doc.id);
        t.diagnostic(`${doc.id}${language ? ` [${language}]` : ''}: ${doc.mustHide.length - leaked.length}/${doc.mustHide.length} hidden in ${ms} ms${leaked.length ? '; visible: ' + leaked.join(' | ') : ''}${changed.length ? '; wrongly changed: ' + changed.join(' | ') : ''}`);
      }
    });
  });
}
