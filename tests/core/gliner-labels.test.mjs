import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { categoryForLabel, DEFAULT_LABELS_FILE, GLINER_LABELS, parseGlinerLabels } from '../helpers/core.mjs';

describe('the GLiNER labels file', () => {
  it('ships without errors, with every label mapped to a known category', () => {
    const { labels, errors } = parseGlinerLabels(fs.readFileSync(DEFAULT_LABELS_FILE, 'utf8'));
    assert.deepEqual(errors, []);
    const categories = new Set(['PERSON', 'COMPANY', 'PROJECT', 'EMAIL', 'PHONE', 'ADDRESS', 'IP', 'HOST', 'URL', 'SECRET', 'ID', 'DATE']);
    for (const [label, category] of Object.entries(labels)) assert.ok(categories.has(category), `${label} -> ${category}`);
  });

  it('covers what consultants, lawyers and doctors need to hide', () => {
    for (const label of ['person', 'organization', 'email address', 'phone number', 'address', 'iban', 'password', 'api key']) {
      assert.ok(Object.hasOwn(GLINER_LABELS, label), label);
    }
  });

  it('covers identifiers from medical and legal documents', () => {
    for (const label of ['date of birth', 'social security number', 'passport number', 'license plate', 'case number', 'medical record number', 'serial number', 'ticket number']) {
      assert.ok(Object.hasOwn(GLINER_LABELS, label), label);
    }
  });
});

describe('reading a labels file', () => {
  it('reads entries in file order and skips comments and blank lines', () => {
    const text = '# People\nperson = PERSON\n\n   \n  # indented comment\ndate of birth = ID   # added for doctors\n';
    assert.deepEqual(parseGlinerLabels(text), { labels: { 'person': 'PERSON', 'date of birth': 'ID' }, errors: [] });
    assert.deepEqual(Object.keys(parseGlinerLabels('b = X\na = Y\n').labels), ['b', 'a']);
  });

  it('normalises spacing and case the way users type it', () => {
    const { labels, errors } = parseGlinerLabels('  Case   Number=case_no\r\nPatient Name =   person\t\n');
    assert.deepEqual(errors, []);
    assert.deepEqual(labels, { 'case number': 'CASE_NO', 'patient name': 'PERSON' });
  });

  it('keeps labels with accents and other languages', () => {
    const { labels } = parseGlinerLabels('numéro AVS = ID\nnome del paziente = PERSON\nGeburtsdatum = ID');
    assert.deepEqual(Object.keys(labels), ['numéro avs', 'nome del paziente', 'geburtsdatum']);
  });

  it('names the line of every problem', () => {
    const text = [
      'person = PERSON',       // 1 fine
      'just a label',          // 2 no "="
      ' = PERSON',             // 3 empty label
      'phone = ',              // 4 empty category
      'iban = 2FA',            // 5 category must start with a letter
      'email = E-MAIL',        // 6 dash not allowed
      'Person = COMPANY',      // 7 duplicate (case-insensitive)
    ].join('\n');
    const { labels, errors } = parseGlinerLabels(text);
    assert.deepEqual(labels, { person: 'PERSON' });
    assert.deepEqual(errors.map((e) => e.match(/^line (\d+)/)[1]), ['2', '3', '4', '5', '6', '7']);
    assert.match(errors.at(-1), /"person" is listed twice/);
  });

  it('refuses a file without any label', () => {
    assert.deepEqual(parseGlinerLabels('# only comments\n\n').errors, ['no labels defined']);
    assert.deepEqual(parseGlinerLabels('').errors, ['no labels defined']);
  });

  it('treats JavaScript property names as ordinary labels', () => {
    const { labels, errors } = parseGlinerLabels('constructor = PERSON\n__proto__ = ID\ntostring = SECRET');
    assert.deepEqual(errors, []);
    assert.deepEqual(Object.keys(labels), ['constructor', '__proto__', 'tostring']);
    assert.equal(categoryForLabel(labels, '__proto__'), 'ID');
  });
});

describe('category of a reported label', () => {
  it('uses the file, and OTHER for anything else', () => {
    assert.equal(categoryForLabel(GLINER_LABELS, 'iban'), 'ID');
    assert.equal(categoryForLabel(GLINER_LABELS, 'shoe size'), 'OTHER');
    assert.equal(categoryForLabel(GLINER_LABELS, 'toString'), 'OTHER');
    assert.equal(categoryForLabel(GLINER_LABELS, 'hasOwnProperty'), 'OTHER');
  });
});
