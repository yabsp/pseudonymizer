import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildPrompt, findMappedValues, whySendIsBlocked } from '../helpers/core.mjs';

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

  it('sends a document between markers, without its file name, before the question', () => {
    const prompt = buildPrompt('## Befund\n[[PERSON_1]] was admitted.\n', 'Summarise it.', { isDocument: true });
    assert.match(prompt, /^Attached document, read from a PDF as text\. [^\n]+\n<document>\n## Befund\n\[\[PERSON_1\]\] was admitted\.\n<\/document>\n\nSummarise it\.$/);
    assert.doesNotMatch(prompt, /\.pdf/);
    assert.equal(buildPrompt('', 'Question only', { isDocument: true }), 'Question only');
  });

  it('leaves out empty parts', () => {
    assert.equal(buildPrompt('[[PERSON_1]] was admitted.', '   \n'), '[[PERSON_1]] was admitted.');
    assert.equal(buildPrompt('  ', 'Question only'), 'Question only');
    assert.equal(buildPrompt('', ''), '');
  });
});

describe('when the text may be sent', () => {
  const TEXT = 'Herr Reto Ammann wurde behandelt.';
  const blocked = (textAtLastDetection, currentText, detectionProblem = null) => whySendIsBlocked({ textAtLastDetection, currentText, detectionProblem });

  it('only after detection ran on exactly this text and finished', () => {
    assert.equal(blocked(TEXT, TEXT), null);
  });

  it('not before detection', () => {
    assert.equal(blocked(null, TEXT), 'notDetected');
    assert.equal(blocked(null, ''), 'notDetected');
  });

  it('not after the text or the document changed, whatever was found before', () => {
    assert.equal(blocked(TEXT, `${TEXT} Frau Nadine Gerber auch.`), 'textChanged');
    assert.equal(blocked(TEXT, 'Ein anderes Dokument von Frau Nadine Gerber.'), 'textChanged');
    assert.equal(blocked(TEXT, `${TEXT} `), 'textChanged');
    assert.equal(blocked(TEXT, ''), 'textChanged');
  });

  it('not when a saved list replaced the values found', () => {
    assert.equal(blocked(TEXT, TEXT, 'listLoaded'), 'listLoaded');
  });

  it('asks for detection on the new text first when both apply', () => {
    assert.equal(blocked(TEXT, 'Ein anderer Text.', 'listLoaded'), 'textChanged');
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

  it('also warns about other capitalisations', () => {
    assert.deepEqual(findMappedValues(MAPPING, 'Re: RETO AMMANN'), ['Reto Ammann']);
  });
});
