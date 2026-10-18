import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addEntry, pseudonymize, restore } from '../helpers/core.mjs';
import { createRandom } from '../helpers/random.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

// Awkward on purpose: overlapping values, punctuation, regex and replacement syntax, brackets, accents, emoji.
const SENSITIVE = [
  'Ann', 'Anna', 'Anna Meier', 'Anna Meier-Rossi', 'Meier', 'Rossi', 'Müller', 'Zoë Lefèvre', 'Jean-Luc',
  'O\'Brien', 'Kx9!vR2#pQ', 'Pa$$w0rd$&$1', 'a.b*c', '(HQ)', '[draft]', 'C/18342/2026', '+41 79 555 01 23',
  'anna.meier@example.com', 'db-prod-03.example.internal', '10.42.7.15', 'Café Zürich 🍀', '756.1234.5678.97',
];
const FILLER = [
  ' ', ', ', '. ', '\n', '\n\n', ' und ', ' et ', ' and ', '"', '(', ')', '[', ']', '**', '_', '-', '\'s',
  'Dr. med. ', 'Herr ', 'Mme ', 'Patient', 'Diagnose', 'claims', '2026', '🙂', '\t',
];

function randomDocument(random) {
  let text = '';
  const length = 5 + random.int(40);
  for (let i = 0; i < length; i++) text += random.next() < 0.45 ? random.pick(SENSITIVE) : random.pick(FILLER);
  return text;
}

describe('pseudonymize then restore', () => {
  it('gives back exactly the original realistic documents', () => {
    for (const doc of DOCUMENTS) {
      const mapping = doc.mustHide.reduce((m, value, i) => addEntry(m, value, i % 2 ? 'PERSON' : 'ID', doc.text), []);
      const result = restore(mapping, pseudonymize(mapping, doc.text));
      assert.equal(result.text, doc.text, doc.id);
      assert.deepEqual(result.unresolved, [], doc.id);
    }
  });

  it('gives back exactly 2000 random documents with awkward values', () => {
    const random = createRandom(20261005);
    for (let run = 0; run < 2000; run++) {
      const text = randomDocument(random);
      const mapping = SENSITIVE.filter(() => random.next() < 0.6).reduce((m, value) => addEntry(m, value, random.pick(['PERSON', 'ID', 'SECRET']), text), []);
      const pseudo = pseudonymize(mapping, text);
      const back = restore(mapping, pseudo);
      assert.equal(back.text, text, `run ${run}: ${JSON.stringify(text)}`);
      assert.deepEqual(back.unresolved, [], `run ${run}`);
    }
  });

  it('never leaves a mapped value visible in 2000 random documents', () => {
    const random = createRandom(42);
    for (let run = 0; run < 2000; run++) {
      const text = randomDocument(random);
      const mapping = SENSITIVE.filter(() => random.next() < 0.6).reduce((m, value) => addEntry(m, value, 'PERSON', text), []);
      const pseudo = pseudonymize(mapping, text);
      // A value inside a longer replaced value is gone with it. Short values (under 5 characters) only
      // count where they stand as a word: not preceded (?<!...) or followed (?!...) by a letter or digit
      // (\p{L}, \p{N}); the value itself is escaped, so regex syntax in it is matched literally.
      for (const { original } of mapping) {
        const longer = mapping.filter((m) => m.original.length > original.length && m.original.includes(original));
        if (longer.length) continue;
        const visible = [...original].length >= 5
          ? pseudo.includes(original)
          : new RegExp(`(?<![\\p{L}\\p{N}])${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u').test(pseudo);
        assert.ok(!visible, `run ${run}: "${original}" visible in ${JSON.stringify(pseudo)}`);
      }
    }
  });

  it('text that already contains placeholder-like tokens survives a round trip', () => {
    const text = 'Old answer mentioned [[PERSON_1]]; today we discuss Reto Ammann.';
    const mapping = addEntry([], 'Reto Ammann', 'PERSON', text);
    assert.equal(restore(mapping, pseudonymize(mapping, text)).text, text);
  });
});
