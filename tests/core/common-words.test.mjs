import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { addDetected, COMMON_WORDS, DEFAULT_COMMON_WORDS_FILE, isOnlyCommonWords, parseWordList, pseudonymize, restore } from '../helpers/core.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

// What GLiNER reported as values in a German first-person letter (measured, scores 0.49 to 0.93).
const MISTAKEN = ['ich', 'Ich', 'Sie', 'mir', 'Mein', 'meines', 'meiner Person', 'Ich bitte Sie', 'ich Sie', 'neue Adresse', 'Arbeitgeber'];

describe('words that are never sensitive on their own', () => {
  it('ships a list without errors covering pronouns and titles in all four languages', () => {
    const { words, errors } = parseWordList(fs.readFileSync(DEFAULT_COMMON_WORDS_FILE, 'utf8'));
    assert.deepEqual(errors, []);
    for (const word of ['ich', 'sie', 'mein', 'herr', 'frau', 'je', 'vous', 'monsieur', 'madame', 'io', 'lei', 'signora', 'i', 'you', 'mr', 'mrs']) {
      assert.ok(words.has(word), word);
    }
  });

  it('drops what detectors mistake for people in first-person letters', () => {
    for (const value of [...MISTAKEN, 'Madame', 'vous', 'la signora', 'Lei', 'you', 'Herr']) {
      assert.ok(isOnlyCommonWords(value, COMMON_WORDS), value);
    }
  });

  it('keeps every real value, also with a title or a lower-case word', () => {
    const real = [
      'Lukas Meier', 'Frau Bachmann', 'Herr Reto Ammann', 'Dr. med. Corinne Bachmann', 'Monsieur Perret',
      'la signora Giulia Pedrazzini', 'Mr. Smith', 'olivia.johnson', 'Emma,Brown', 'jdoe', 'Aare Bank AG',
      'Kramgasse 12, 3011 Bern', 'Patient 4711', 'Klient Nr. 88', '756.1234.5678.97',
    ];
    for (const value of real) assert.ok(!isOnlyCommonWords(value, COMMON_WORDS), value);
  });

  it('keeps every value in the realistic documents', () => {
    for (const doc of DOCUMENTS) {
      for (const value of doc.mustHide) assert.ok(!isOnlyCommonWords(value, COMMON_WORDS), `${doc.id}: ${value}`);
    }
  });

  it('reads one word per line, ignores case and comments, and names bad lines', () => {
    const { words, errors } = parseWordList('# pronouns\nIch\n  SIE  # polite\n\nO\'Neill\nzwei Wörter\nJean-Luc\n');
    assert.deepEqual([...words], ['ich', 'sie', 'o\'neill', 'jean-luc']);
    assert.deepEqual(errors, ['line 6: one word per line, found "zwei Wörter"']);
  });
});

describe('parts of found names and short forms', () => {
  const detect = (text, values) => addDetected([], values.map(([value, category]) => ({ text: value, category })), text, COMMON_WORDS);

  it('hides a first or last name used alone, with the placeholder of the full name (regression: "Hi Sarah")', () => {
    const text = 'To: Sarah Johnson\nHi Sarah, Mr. David Chen called. Mr. Chen agreed. Frau Bachmann and Dr. med. Corinne Bachmann. Sarahs Hund.';
    const mapping = detect(text, [['Sarah Johnson', 'PERSON'], ['Mr. David Chen', 'PERSON'], ['Dr. med. Corinne Bachmann', 'PERSON']]);
    assert.equal(pseudonymize(mapping, text), 'To: [[PERSON_1]]\nHi [[PERSON_1]], [[PERSON_2]] called. Mr. [[PERSON_2]] agreed. Frau [[PERSON_3]] and [[PERSON_3]]. [[PERSON_1]]s Hund.');
  });

  it('adds only parts that would otherwise stay visible, and never titles', () => {
    const text = 'Mr. David Chen called; later Mr. Chen wrote.';
    const added = detect(text, [['Mr. David Chen', 'PERSON']]).slice(1).map((m) => m.original);
    assert.deepEqual(added, ['Chen']);
  });

  it('gives the full value back when the answer uses the shared placeholder', () => {
    const text = 'Hi Sarah, from Sarah Johnson';
    const mapping = detect(text, [['Sarah Johnson', 'PERSON']]);
    assert.equal(restore(mapping, 'Dear [[PERSON_1]]').text, 'Dear Sarah Johnson');
  });

  it('gives a shorter form of a person found separately the same placeholder ("Mr. Chen", "Jessica")', () => {
    const text = 'Mr. David Chen and Jessica Moreno. Later Mr. Chen called Jessica.';
    const mapping = detect(text, [['Mr. David Chen', 'PERSON'], ['Jessica Moreno', 'PERSON'], ['Mr. Chen', 'PERSON'], ['Jessica', 'PERSON']]);
    assert.equal(pseudonymize(mapping, text), '[[PERSON_1]] and [[PERSON_2]]. Later [[PERSON_1]] called [[PERSON_2]].');
  });

  it('gives a name the placeholder of its longer form, whichever the detector lists first (regression: two placeholders for one person)', () => {
    const text = 'Re: New Hire Profile - Jonathan Reyes\nFull Legal Name: Jonathan Andrew Reyes\nMaria Reyes (Spouse)';
    const mapping = detect(text, [['Jonathan Reyes', 'PERSON'], ['Jonathan Andrew Reyes', 'PERSON'], ['Maria Reyes', 'PERSON']]);
    assert.equal(pseudonymize(mapping, text), 'Re: New Hire Profile - [[PERSON_1]]\nFull Legal Name: [[PERSON_1]]\n[[PERSON_2]] (Spouse)');
  });

  it('replaces first and last name used together as one placeholder (regression: "[[PERSON_5]] [[PERSON_5]]")', () => {
    const text = 'Re: Jonathan Reyes. Full Legal Name: Jonathan Andrew Reyes. Jonathan called.';
    const mapping = detect(text, [['Jonathan Andrew Reyes', 'PERSON']]);
    const pseudo = pseudonymize(mapping, text);
    assert.equal(pseudo, 'Re: [[PERSON_1]]. Full Legal Name: [[PERSON_1]]. [[PERSON_1]] called.');
    assert.equal(restore(mapping, 'Dear [[PERSON_1]]').text, 'Dear Jonathan Andrew Reyes');
  });

  it('keeps people with the same surname apart', () => {
    const text = 'David Chen and Linda Chen. Mr. Chen called.';
    const mapping = detect(text, [['David Chen', 'PERSON'], ['Linda Chen', 'PERSON'], ['Mr. Chen', 'PERSON']]);
    assert.equal(mapping.find((m) => m.original === 'Mr. Chen').placeholder, '[[PERSON_3]]');
  });

  it('still hides a part shared by two people, under a placeholder of its own', () => {
    const text = 'David Chen and Linda Chen. Later Chen called.';
    const mapping = detect(text, [['David Chen', 'PERSON'], ['Linda Chen', 'PERSON']]);
    assert.equal(pseudonymize(mapping, text), '[[PERSON_1]] and [[PERSON_2]]. Later [[PERSON_3]] called.');
  });

  it('hides a short form in brackets where it is used alone', () => {
    const text = 'eingeliefert ins Universitätsspital Zürich (USZ). Beilage: Arztzeugnis USZ.';
    const mapping = detect(text, [['Universitätsspital Zürich (USZ)', 'COMPANY']]);
    assert.equal(pseudonymize(mapping, text), 'eingeliefert ins [[COMPANY_1]]. Beilage: Arztzeugnis [[COMPANY_1]].');
  });

  it('does not split names of companies, or lower-case user names', () => {
    const text = 'Muster Engineering AG, Engineering team; david.chen wrote, Chen too.';
    const mapping = detect(text, [['Muster Engineering AG', 'COMPANY'], ['david.chen', 'PERSON']]);
    assert.deepEqual(mapping.map((m) => m.original), ['Muster Engineering AG', 'david.chen']);
  });
});

describe('roles and job titles', () => {
  it('are dropped on their own (regression: "Agent:" became a person, "admin" broke "administered")', () => {
    for (const value of ['Agent', 'admin', 'Network Engineer', 'Customer', 'Support Manager', 'Re', 'CVV', 'Security & Network']) assert.ok(isOnlyCommonWords(value, COMMON_WORDS), value);
    const text = 'Agent: Marcus Webb. The admin administered it. Daniel Okafor, Network Engineer, IT Security & Network Breach Log.';
    const detected = [['Agent', 'PERSON'], ['Marcus Webb', 'PERSON'], ['admin', 'PERSON'], ['Daniel Okafor', 'PERSON'], ['Network Engineer', 'PERSON']];
    const mapping = addDetected([], detected.map(([value, category]) => ({ text: value, category })), text, COMMON_WORDS);
    assert.equal(pseudonymize(mapping, text), 'Agent: [[PERSON_1]]. The admin administered it. [[PERSON_2]], Network Engineer, IT Security & Network Breach Log.');
  });

  it('do not hide user names and addresses that contain them (regression: "bw_dataroom_admin")', () => {
    for (const value of ['bw_dataroom_admin', 'admin@example.com', 'network.admin', 'agent007']) assert.ok(!isOnlyCommonWords(value, COMMON_WORDS), value);
  });
});

describe('hyphenated words', () => {
  it('match as written in the list (regression: "E-Mail" was split into "E" and "Mail")', () => {
    for (const value of ['E-Mail', 'e-mail', 'E-MAIL', 'per E-Mail']) assert.ok(isOnlyCommonWords(value, COMMON_WORDS), value);
  });

  it('keep hyphenated names and values with a name', () => {
    for (const value of ['Meier-Rossi', 'Jean-Luc Perret', 'Simone Ammann-Keller', 'Arztzeugnis USB']) {
      assert.ok(!isOnlyCommonWords(value, COMMON_WORDS), value);
    }
  });
});

describe('adding detected values', () => {
  it('skips the mistaken ones, so the letter stays readable', () => {
    const text = 'möchte ich Sie über wichtige Dinge informieren. Ich bitte Sie, mir zu schreiben. Mein Name: Lukas Meier.';
    const detected = [...MISTAKEN, 'Lukas Meier'].map((value) => ({ text: value, category: 'PERSON' })).filter((e) => text.includes(e.text));
    const mapping = addDetected([], detected, text, COMMON_WORDS);
    assert.deepEqual(mapping, [{ original: 'Lukas Meier', placeholder: '[[PERSON_1]]' }]);
    assert.equal(pseudonymize(mapping, text), 'möchte ich Sie über wichtige Dinge informieren. Ich bitte Sie, mir zu schreiben. Mein Name: [[PERSON_1]].');
  });

  it('still checks that values appear in the text', () => {
    assert.deepEqual(addDetected([], [{ text: 'Reto Ammann', category: 'PERSON' }], 'Lukas Meier', COMMON_WORDS), []);
  });
});
