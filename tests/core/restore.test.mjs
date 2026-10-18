import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { restore } from '../helpers/core.mjs';

const MAPPING = [
  { original: 'Reto Ammann', placeholder: '[[PERSON_1]]' },
  { original: 'Corinne Bachmann', placeholder: '[[PERSON_2]]' },
  { original: 'Klinik Seeblick AG', placeholder: '[[COMPANY_1]]' },
];
const PEOPLE = Array.from({ length: 12 }, (_, i) => ({ original: `Person ${i + 1}`, placeholder: `[[PERSON_${i + 1}]]` }));

describe('restoring original values in the answer', () => {
  it('restores the exact placeholders', () => {
    const { text, unresolved } = restore(MAPPING, 'Dear [[PERSON_2]], [[PERSON_1]] was discharged from [[COMPANY_1]].');
    assert.equal(text, 'Dear Corinne Bachmann, Reto Ammann was discharged from Klinik Seeblick AG.');
    assert.deepEqual(unresolved, []);
  });

  it('accepts the forms models produce when they drop brackets', () => {
    const { text } = restore(MAPPING, '[PERSON_1], PERSON_1. (PERSON_1) "PERSON_1"');
    assert.equal(text, 'Reto Ammann, Reto Ammann. (Reto Ammann) "Reto Ammann"');
  });

  it('works inside Markdown, possessives and lists', () => {
    const answer = '**[[PERSON_1]]**\n- [[PERSON_2]]\'s referral\n- _[[COMPANY_1]]_\n> [[PERSON_1]]: ok\n`[[PERSON_2]]`';
    assert.equal(restore(MAPPING, answer).text, '**Reto Ammann**\n- Corinne Bachmann\'s referral\n- _Klinik Seeblick AG_\n> Reto Ammann: ok\n`Corinne Bachmann`');
  });

  it('keeps PERSON_1 and PERSON_11 apart in every form', () => {
    const { text } = restore(PEOPLE, '[[PERSON_1]] [[PERSON_11]] [PERSON_1] [PERSON_11] PERSON_1 PERSON_11 PERSON_12');
    assert.equal(text, 'Person 1 Person 11 Person 1 Person 11 Person 1 Person 11 Person 12');
  });

  it('does not touch tokens that only contain a placeholder name', () => {
    const { text } = restore(MAPPING, 'SUPERPERSON_1 PERSON_1X MYPERSON_1');
    assert.equal(text, 'SUPERPERSON_1 PERSON_1X MYPERSON_1');
  });

  it('restores values containing replacement syntax literally', () => {
    const mapping = [{ original: 'Pa$$w0rd$&$1', placeholder: '[[SECRET_1]]' }];
    assert.equal(restore(mapping, 'Password: [[SECRET_1]]').text, 'Password: Pa$$w0rd$&$1');
  });

  it('reports unknown placeholders and keeps them visible', () => {
    const { text, unresolved } = restore(MAPPING, 'Ask [[PERSON_9]] and [[PERSON_9]] about [[ADDRESS_1]].');
    assert.equal(text, 'Ask [[PERSON_9]] and [[PERSON_9]] about [[ADDRESS_1]].');
    assert.deepEqual(unresolved, ['[[PERSON_9]]', '[[ADDRESS_1]]']);
  });

  it('unknown placeholders are reported in every form', () => {
    const { unresolved } = restore(MAPPING, 'Ask [PERSON_9] or PERSON_10.');
    assert.deepEqual(unresolved, ['[PERSON_9]', 'PERSON_10']);
  });

  it('placeholders are reported even when the mapping is empty', () => {
    const { unresolved } = restore([], 'Dear [[PERSON_1]]');
    assert.deepEqual(unresolved, ['[[PERSON_1]]']);
  });

  it('placeholders in another case are restored', () => {
    const { text } = restore(MAPPING, 'Dear [[person_2]]');
    assert.equal(text, 'Dear Corinne Bachmann');
  });
});
