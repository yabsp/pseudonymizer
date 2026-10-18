// The documents a detection benchmark runs on: the fixture documents of the test suite and the shared
// evaluation corpus (CORPUS_DIR, default pseudonymizer-corpus next to the project or next to the folder of
// its git worktrees), all in one shape: { id, language, text, values: [{ text, category }], keep: [text], source }.
import fs from 'node:fs';
import path from 'node:path';
import { DOCUMENTS } from '../fixtures/documents.mjs';
import { ROOT } from '../helpers/server.mjs';

const CORPUS_PLACES = [path.resolve(ROOT, '..', 'pseudonymizer-corpus'), path.resolve(ROOT, '..', '..', 'pseudonymizer-corpus')];
export const CORPUS_DIR = process.env.CORPUS_DIR || CORPUS_PLACES.find((d) => fs.existsSync(d)) || CORPUS_PLACES[0];

function fixtureDocuments() {
  return DOCUMENTS.map((doc) => ({
    id: doc.id,
    language: doc.language,
    text: doc.text,
    values: doc.mustHide.map((text) => ({ text, category: null })),
    keep: doc.mustKeep || [],
    source: 'fixture',
  }));
}

function corpusText(id, truth) {
  const candidates = [path.join(CORPUS_DIR, 'text', `${id}.txt`), path.join(CORPUS_DIR, 'extracted', `${id}.md`)];
  const file = candidates.find((f) => fs.existsSync(f));
  return file ? fs.readFileSync(file, 'utf8') : null;
}

function corpusDocuments() {
  const truthDir = path.join(CORPUS_DIR, 'truth');
  if (!fs.existsSync(truthDir)) return [];
  return fs.readdirSync(truthDir).filter((f) => f.endsWith('.json')).sort().flatMap((file) => {
    const truth = JSON.parse(fs.readFileSync(path.join(truthDir, file), 'utf8'));
    const text = corpusText(truth.id, truth);
    if (text === null) return [];
    return [{ id: truth.id, language: truth.language, text, values: truth.values, keep: truth.keep || [], source: truth.source }];
  });
}

/** which: "fixtures", "corpus" or "all". */
export function loadDocuments(which = 'all') {
  return [
    ...(which === 'corpus' ? [] : fixtureDocuments()),
    ...(which === 'fixtures' ? [] : corpusDocuments()),
  ];
}
