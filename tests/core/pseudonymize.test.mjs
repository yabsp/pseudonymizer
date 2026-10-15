import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
import { addEntry, pseudonymize, restore } from '../helpers/core.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

const entry = (original, placeholder) => ({ original, placeholder });

describe('replacing values with placeholders', () => {
  it('replaces every occurrence', () => {
    const mapping = [entry('Ammann', '[[PERSON_1]]')];
    assert.equal(pseudonymize(mapping, 'Ammann, Ammann and Ammann.'), '[[PERSON_1]], [[PERSON_1]] and [[PERSON_1]].');
  });

  it('prefers the longest value where values overlap', () => {
    const mapping = [
      entry('Ammann', '[[PERSON_1]]'),
      entry('Reto Ammann', '[[PERSON_2]]'),
      entry('Simone Ammann-Keller', '[[PERSON_3]]'),
    ];
    assert.equal(
      pseudonymize(mapping, 'Reto Ammann and his daughter Simone Ammann-Keller. Herr Ammann agreed.'),
      '[[PERSON_2]] and his daughter [[PERSON_3]]. Herr [[PERSON_1]] agreed.',
    );
  });

  it('never replaces text inside a placeholder it just inserted', () => {
    const mapping = [entry('John', '[[PERSON_1]]'), entry('PERSON', '[[COMPANY_1]]'), entry('ID_1', '[[ID_1]]')];
    assert.equal(pseudonymize(mapping, 'John works at PERSON, badge ID_1'), '[[PERSON_1]] works at [[COMPANY_1]], badge [[ID_1]]');
  });

  it('treats regex and replacement syntax in values literally', () => {
    const values = ['Kx9!vR2#pQ', 'a.b*c+d?', '(Zurich) [HQ]', 'C:\\Users\\rammann', 'Pa$$w0rd$&$1', '^start$', 'x|y', '{2,3}'];
    const mapping = values.map((v, i) => entry(v, `[[SECRET_${i + 1}]]`));
    const text = values.join(' / ');
    const pseudo = pseudonymize(mapping, text);
    assert.equal(pseudo, mapping.map((m) => m.placeholder).join(' / '));
    assert.equal(restore(mapping, pseudo).text, text);
  });

  it('handles values next to punctuation and inside other words the same way', () => {
    const mapping = [entry('Falcon', '[[PROJECT_1]]')];
    assert.equal(pseudonymize(mapping, '"Falcon", (Falcon) Falcon-2 FalconDB'), '"[[PROJECT_1]]", ([[PROJECT_1]]) [[PROJECT_1]]-2 [[PROJECT_1]]DB');
  });

  it('never breaks other words that merely contain a short value (regression: "w[[PERSON_1]]tige")', () => {
    const mapping = [entry('ich', '[[PERSON_1]]'), entry('Sie', '[[PERSON_2]]'), entry('mir', '[[PERSON_3]]'), entry('Ann', '[[PERSON_4]]')];
    const text = 'wichtige gleichzeitig möglicherweise Abgleich beruflichen sicherzustellen Siebert Sieben Kasimir Anna Annual Hannah';
    assert.equal(pseudonymize(mapping, text), text);
    assert.equal(pseudonymize(mapping, 'bin ich, Sie und mir.'), 'bin [[PERSON_1]], [[PERSON_2]] und [[PERSON_3]].');
  });

  it('still replaces short values as words, in camelCase and in the genitive', () => {
    const mapping = [entry('Ann', '[[PERSON_1]]'), entry('Acme', '[[COMPANY_1]]'), entry('Zoë', '[[PERSON_2]]')];
    assert.equal(
      pseudonymize(mapping, 'Ann, (Ann) Ann\'s Anns Buch myAnn AnnSmith AcmeBillingService MyAcme Acme-Bank Zoës Hund Zoëlla'),
      '[[PERSON_1]], ([[PERSON_1]]) [[PERSON_1]]\'s [[PERSON_1]]s Buch my[[PERSON_1]] [[PERSON_1]]Smith [[COMPANY_1]]BillingService My[[COMPANY_1]] [[COMPANY_1]]-Bank [[PERSON_2]]s Hund Zoëlla',
    );
  });

  it('replaces longer values anywhere, so inflected names and identifiers stay hidden', () => {
    const mapping = [entry('Ammann', '[[PERSON_1]]'), entry('Pedrazzini', '[[PERSON_2]]')];
    assert.equal(pseudonymize(mapping, 'Herrn Ammanns Tochter, AmmannService, la famiglia Pedrazzinis'), 'Herrn [[PERSON_1]]s Tochter, [[PERSON_1]]Service, la famiglia [[PERSON_2]]s');
  });

  it('also replaces a short value glued to a replaced value, as in text extracted from PDFs', () => {
    const mapping = [entry('C/18342/2026', '[[ID_1]]'), entry('Anna', '[[PERSON_1]]'), entry('Kx9vR2pQ', '[[SECRET_1]]'), entry('ich', '[[X_1]]')];
    assert.equal(pseudonymize(mapping, 'Fall C/18342/2026Anna-Akte; Kx9vR2pQich'), 'Fall [[ID_1]][[PERSON_1]]-Akte; [[SECRET_1]][[X_1]]');
    // a short value glued to ordinary text stays, like any short value inside a word
    assert.equal(pseudonymize(mapping, 'Jahr2026Anna wichtig'), 'Jahr2026Anna wichtig');
  });

  it('lets a longer value win where it overlaps a short one', () => {
    const mapping = [entry('Ann', '[[PERSON_1]]'), entry('Ann Meier-Rossi', '[[PERSON_2]]')];
    assert.equal(pseudonymize(mapping, 'Ann Meier-Rossi und Ann'), '[[PERSON_2]] und [[PERSON_1]]');
  });

  it('refuses text containing the private-use characters it uses internally, every time', () => {
    const mapping = [entry('Ann', '[[PERSON_1]]')];
    for (let i = 0; i < 3; i++) assert.throws(() => pseudonymize(mapping, 'Ann \u{F0001}'), /private-use characters/);
    assert.equal(pseudonymize(mapping, 'Ann'), '[[PERSON_1]]');
  });

  it('treats short values that start or end with punctuation literally', () => {
    const mapping = [entry('C/1', '[[ID_1]]'), entry('(A)', '[[ID_2]]')];
    assert.equal(pseudonymize(mapping, 'Fall C/1, nicht C/12; Variante (A) und B(A)'), 'Fall [[ID_1]], nicht C/12; Variante [[ID_2]] und B[[ID_2]]');
  });

  it('ignores entries whose value was cleared in the table', () => {
    const mapping = [entry('', '[[PERSON_1]]'), entry('Bachmann', '[[PERSON_2]]')];
    assert.equal(pseudonymize(mapping, 'Frau Bachmann'), 'Frau [[PERSON_2]]');
  });

  it('returns the text unchanged with an empty mapping', () => {
    assert.equal(pseudonymize([], 'Reto Ammann'), 'Reto Ammann');
  });

  it('hides every listed value in realistic documents, given a complete mapping', () => {
    for (const doc of DOCUMENTS) {
      const mapping = doc.mustHide.reduce((m, value) => addEntry(m, value, 'SECRET', doc.text), []);
      assert.equal(mapping.length, doc.mustHide.length, `${doc.id}: every value is in the text`);
      const pseudo = pseudonymize(mapping, doc.text);
      for (const value of doc.mustHide) assert.ok(!pseudo.includes(value), `${doc.id}: "${value}" is still visible`);
    }
  });

  it('KNOWN GAP: entries that are only whitespace are ignored', knownGap('a table cell edited to spaces replaces every space in the text'), () => {
    const mapping = [entry(' ', '[[PERSON_1]]')];
    assert.equal(pseudonymize(mapping, 'Reto Ammann'), 'Reto Ammann');
  });

  it('KNOWN LEAK: other capitalisations of a value are hidden too', knownGap('replacement is case-sensitive; signature blocks and headers often use upper case'), () => {
    const mapping = [entry('Reto Ammann', '[[PERSON_1]]')];
    const pseudo = pseudonymize(mapping, 'Reto Ammann\nREF: RETO AMMANN / reto ammann');
    assert.ok(!/reto ammann/i.test(pseudo), pseudo);
  });

  it('KNOWN LEAK: a value broken across a line or with extra spaces is hidden', knownGap('wrapped text from emails and PDFs splits names across lines'), () => {
    const mapping = [entry('Simone Ammann-Keller', '[[PERSON_1]]')];
    const pseudo = pseudonymize(mapping, 'begleitet von Simone\nAmmann-Keller und Simone  Ammann-Keller');
    assert.ok(!pseudo.includes('Ammann-Keller'), pseudo);
  });

  it('KNOWN LEAK: a value is hidden regardless of Unicode normalization', knownGap('NFD text from PDFs or macOS does not match an NFC value'), () => {
    const mapping = [entry('Müller', '[[PERSON_1]]')];
    const pseudo = pseudonymize(mapping, 'Frau Müller'.normalize('NFD'));
    assert.ok(!pseudo.normalize('NFC').includes('Müller'), pseudo);
  });
});
