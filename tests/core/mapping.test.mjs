import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
import { addEntry, parseMapping } from '../helpers/core.mjs';

const SOURCE = 'Patient Reto Ammann (reto.ammann@example.com) was seen by Dr. Corinne Bachmann.';

describe('adding detected values to the mapping', () => {
  it('numbers placeholders per category', () => {
    let mapping = [];
    mapping = addEntry(mapping, 'Reto Ammann', 'person', SOURCE);
    mapping = addEntry(mapping, 'reto.ammann@example.com', 'EMAIL', SOURCE);
    mapping = addEntry(mapping, 'Corinne Bachmann', 'Person', SOURCE);
    assert.deepEqual(mapping, [
      { original: 'Reto Ammann', placeholder: '[[PERSON_1]]' },
      { original: 'reto.ammann@example.com', placeholder: '[[EMAIL_1]]' },
      { original: 'Corinne Bachmann', placeholder: '[[PERSON_2]]' },
    ]);
  });

  it('ignores values a model invented, even near-misses of real ones', () => {
    let mapping = [];
    for (const invented of ['Reto Amann', 'Corine Bachmann', 'Dr. Steiner', 'reto.ammann@example.ch']) {
      mapping = addEntry(mapping, invented, 'PERSON', SOURCE);
    }
    assert.deepEqual(mapping, []);
  });

  it('trims surrounding whitespace and skips values shorter than two characters', () => {
    let mapping = addEntry([], '  Reto Ammann \n', 'PERSON', SOURCE);
    mapping = addEntry(mapping, 'R', 'PERSON', SOURCE);
    mapping = addEntry(mapping, '   ', 'PERSON', SOURCE);
    mapping = addEntry(mapping, '', 'PERSON', SOURCE);
    mapping = addEntry(mapping, undefined, 'PERSON', SOURCE);
    assert.deepEqual(mapping, [{ original: 'Reto Ammann', placeholder: '[[PERSON_1]]' }]);
  });

  it('adds each value only once, whichever detector reports it', () => {
    let mapping = addEntry([], 'reto.ammann@example.com', 'email address', SOURCE);
    mapping = addEntry(mapping, 'reto.ammann@example.com', 'EMAIL', SOURCE);
    assert.equal(mapping.length, 1);
  });

  it('turns any category text into a safe placeholder name', () => {
    let mapping = addEntry([], 'Reto Ammann', 'e-mail / phone', SOURCE);
    mapping = addEntry(mapping, 'Corinne Bachmann', '', SOURCE);
    mapping = addEntry(mapping, 'reto.ammann@example.com', undefined, SOURCE);
    for (const { placeholder } of mapping) assert.match(placeholder, /^\[\[[A-Z0-9_]+_\d+\]\]$/);
    assert.equal(mapping[0].placeholder, '[[E_MAIL_PHONE_1]]');
    assert.equal(mapping[1].placeholder, '[[OTHER_1]]');
  });

  it('skips numbers already used by imported or edited entries', () => {
    const existing = [{ original: 'Bachmann', placeholder: '[[PERSON_1]]' }, { original: 'X', placeholder: '[[PERSON_3]]' }];
    const mapping = addEntry(existing, 'Reto Ammann', 'PERSON', SOURCE);
    assert.equal(mapping.at(-1).placeholder, '[[PERSON_2]]');
    assert.equal(new Set(mapping.map((m) => m.placeholder)).size, mapping.length);
  });

  it('accepts values typed in by hand without checking the source', () => {
    const mapping = addEntry([], 'Project Falcon', 'PROJECT');
    assert.deepEqual(mapping, [{ original: 'Project Falcon', placeholder: '[[PROJECT_1]]' }]);
  });

  it('KNOWN GAP: a detected value that differs only in case still hides the text', knownGap('addEntry drops values whose case differs from the text, so the real occurrence stays visible'), () => {
    const mapping = addEntry([], 'reto ammann', 'PERSON', SOURCE);
    assert.equal(mapping.length, 1);
    assert.equal(mapping[0].original, 'Reto Ammann');
  });

  it('KNOWN GAP: a value in another Unicode normalization form is still recognised', knownGap('text copied from PDFs or macOS is often NFD; "Müller" (NFC) is then not found'), () => {
    const nfdText = 'Termin mit Frau Müller'.normalize('NFD');
    const mapping = addEntry([], 'Müller', 'PERSON', nfdText);
    assert.equal(mapping.length, 1);
  });
});

describe('importing an exported mapping file', () => {
  it('accepts what the app exports', () => {
    const exported = [{ original: 'Reto Ammann', placeholder: '[[PERSON_1]]' }, { original: '756.1234.5678.97', placeholder: '[[ID_1]]' }];
    assert.deepEqual(parseMapping(JSON.parse(JSON.stringify(exported))), exported);
  });

  it('rejects files that are not a mapping', () => {
    for (const data of [{}, null, 'text', [{ original: 'x' }], [{ placeholder: '[[X_1]]' }], [{ original: '', placeholder: '[[X_1]]' }]]) {
      assert.throws(() => parseMapping(data), /unexpected format/, JSON.stringify(data));
    }
  });

  it('KNOWN GAP: rejects placeholders the app would not write', knownGap('a placeholder without brackets is accepted; its value is then never restored and not reported'), () => {
    assert.throws(() => parseMapping([{ original: 'Reto Ammann', placeholder: 'PERSON_1' }]));
  });
});
