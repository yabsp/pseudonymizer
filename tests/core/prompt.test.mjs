import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
import { buildPrompt, findMappedValues } from '../helpers/core.mjs';

const MAPPING = [
  { original: 'Reto Ammann', placeholder: '[[PERSON_1]]' },
  { original: 'Klinik Seeblick', placeholder: '[[COMPANY_1]]' },
  { original: '756.1234.5678.97', placeholder: '[[ID_1]]' },
];

describe('the prompt that is sent', () => {
  it('adds the text "sent as written" after the pseudonymized text, unchanged', () => {
    const extra = 'Summarise for the GP. Keep [[PERSON_1]] as is.';
    assert.equal(buildPrompt('[[PERSON_1]] was admitted.\n', `  ${extra}\n`), `[[PERSON_1]] was admitted.\n\n${extra}`);
  });

  it('leaves out empty parts', () => {
    assert.equal(buildPrompt('[[PERSON_1]] was admitted.', '   \n'), '[[PERSON_1]] was admitted.');
    assert.equal(buildPrompt('  ', 'Question only'), 'Question only');
    assert.equal(buildPrompt('', ''), '');
  });
});

describe('warning about mapped values in text sent as written', () => {
  it('names every mapped value it contains', () => {
    assert.deepEqual(findMappedValues(MAPPING, 'Write to Reto Ammann about his stay at Klinik Seeblick.'), ['Reto Ammann', 'Klinik Seeblick']);
  });

  it('does not warn about short values inside other words', () => {
    const mapping = [...MAPPING, { original: 'Kim', placeholder: '[[PERSON_2]]' }];
    assert.deepEqual(findMappedValues(mapping, 'Bitte mit Kimberly-Clark und dem Kimono-Laden klären.'), []);
    assert.deepEqual(findMappedValues(mapping, 'Frag Kim.'), ['Kim']);
  });

  it('stays quiet when only placeholders are used', () => {
    assert.deepEqual(findMappedValues(MAPPING, 'Write to [[PERSON_1]] about [[COMPANY_1]].'), []);
  });

  it('KNOWN LEAK: also warns about other capitalisations', knownGap('the check is case-sensitive, so "RETO AMMANN" is sent without a warning'), () => {
    assert.deepEqual(findMappedValues(MAPPING, 'Re: RETO AMMANN'), ['Reto Ammann']);
  });
});
