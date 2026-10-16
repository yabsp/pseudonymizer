import assert from 'node:assert/strict';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { after, before, describe, it } from 'node:test';
import { FIXTURES, GLINER_HELPER as HELPER } from '../helpers/server.mjs';
import { CSV_EXPORT, CSV_PEOPLE } from '../fixtures/documents.mjs';

const MODEL = 'urchade/gliner_multi_pii-v1';

function startHelper(entities, env = {}) {
  const child = spawn('python3', [HELPER], {
    env: { ...process.env, PYTHONPATH: path.join(FIXTURES, 'fake_gliner'), FAKE_GLINER_ENTITIES: JSON.stringify(entities), ...env },
  });
  const answers = [];
  const waiting = [];
  readline.createInterface({ input: child.stdout }).on('line', (line) => (waiting.length ? waiting.shift()(line) : answers.push(line)));
  const nextAnswer = () => new Promise((resolve) => (answers.length ? resolve(answers.shift()) : waiting.push(resolve)));
  return {
    async send(request) {
      child.stdin.write((typeof request === 'string' ? request : JSON.stringify(request)) + '\n');
      return JSON.parse(await nextAnswer());
    },
    close: () => { child.stdin.end(); return new Promise((resolve) => child.once('exit', resolve)); },
  };
}

// Names around the edges of the helper's windows: 150 words each, a new one every 110 words.
const NAMES = { 3: 'Reto Ammann', 109: 'Corinne Bachmann', 148: 'Simone Keller', 150: 'Lukas Steiner', 219: 'Nadia Haddad', 330: 'Marco Rossi', 1998: 'Laura Bianchi' };
function longDocument() {
  const words = [];
  for (let i = 0; i < 2000; i++) words.push(NAMES[i] ?? `wort${i}`);
  return words.join(' ');
}
const codePoints = (s, start, end) => [...s].slice(start, end).join('');

describe('GLiNER helper', () => {
  let helper;
  const entities = Object.fromEntries(Object.values(NAMES).map((n) => [n, ['person', 0.9]]));
  entities['Müller-Lüdenscheidt'] = ['person', 0.9];
  entities['Carla Imhof'] = ['person', 0.9];
  before(() => { helper = startHelper(entities, { FAKE_GLINER_MAX_WORDS: '200' }); });
  after(() => helper.close());

  it('loads the model on an empty text and answers with no values', async () => {
    assert.deepEqual(await helper.send({ id: 1, text: '', labels: ['person'], model: MODEL }), { id: 1, entities: [] });
  });

  it('finds every name in a long document exactly once, including at window edges', async () => {
    const text = longDocument();
    const answer = await helper.send({ id: 2, text, labels: ['person'], threshold: 0.4, model: MODEL });
    assert.deepEqual(answer.entities.map((e) => e.text), Object.values(NAMES));
    for (const e of answer.entities) assert.equal(codePoints(text, e.start, e.end), e.text);
  });

  it('returns correct values after emoji and accented characters', async () => {
    const text = '🍀🙂 Café: Frau Müller-Lüdenscheidt 👩‍⚕️ und Reto Ammann.';
    const answer = await helper.send({ id: 3, text, labels: ['person'], model: MODEL });
    assert.deepEqual(answer.entities.map((e) => e.text), ['Müller-Lüdenscheidt', 'Reto Ammann']);
    for (const e of answer.entities) assert.equal(codePoints(text, e.start, e.end), e.text);
  });

  it('finds names joined by underscores in file names, with offsets into the original text (regression: "Severance_Agreement_Carla_Imhof.pdf")', async () => {
    const text = '02.04_Severance_Agreement_Carla_Imhof_signed.pdf, sent by Reto Ammann to Carla Imhof';
    const answer = await helper.send({ id: 8, text, labels: ['person'], model: MODEL });
    assert.deepEqual(answer.entities.map((e) => e.text), ['Carla_Imhof', 'Reto Ammann', 'Carla Imhof']);
    for (const e of answer.entities) assert.equal(codePoints(text, e.start, e.end), e.text);
  });

  it('answers a broken request with an error and keeps serving', async () => {
    const broken = await helper.send('{"id": 4, "text": ');
    assert.equal(broken.id, null);
    assert.match(broken.error, /JSONDecodeError/);
    const missing = await helper.send({ id: 5, text: 'x', labels: ['person'], model: 'missing/model' });
    assert.equal(missing.id, 5);
    assert.match(missing.error, /not a valid model identifier/);
    const fine = await helper.send({ id: 6, text: 'Reto Ammann', labels: ['person'], model: MODEL });
    assert.deepEqual(fine.entities.map((e) => e.text), ['Reto Ammann']);
  });

  it('keeps stdout for answers only, even when libraries print', async () => {
    // The fake model prints while loading; a second model forces another load.
    const answer = await helper.send({ id: 7, text: 'Reto Ammann', labels: ['person'], model: 'other/model' });
    assert.equal(answer.id, 7);
  });
});

describe('GLiNER helper with dense text', () => {
  it('reads every row of a 100-row CSV export, not just the first ~20', async () => {
    const helper = startHelper(Object.fromEntries(CSV_PEOPLE.map((name) => [name, ['person', 0.9]])));
    try {
      const answer = await helper.send({ id: 1, text: CSV_EXPORT, labels: ['person'], model: MODEL });
      assert.equal(answer.error, undefined, answer.error);
      const found = new Set(answer.entities.map((e) => e.text));
      const missing = CSV_PEOPLE.filter((name) => !found.has(name));
      assert.deepEqual(missing, [], `${missing.length} of ${CSV_PEOPLE.length} people not found, first: ${missing[0]}`);
    } finally {
      await helper.close();
    }
  });

  it('answers with an error instead of a partial result when the model cuts the text', async () => {
    // A model that reads fewer words than the helper's window cuts every window.
    const helper = startHelper({ 'James,Smith': ['person', 0.9] }, { FAKE_GLINER_MAX_WORDS: '50' });
    try {
      const answer = await helper.send({ id: 1, text: CSV_EXPORT, labels: ['person'], model: MODEL });
      assert.equal(answer.entities, undefined);
      assert.match(answer.error, /could not read the whole text.*nothing was detected/);
    } finally {
      await helper.close();
    }
  });
});

describe('Presidio in the helper', () => {
  const GERMAN = 'Die Klientin Nadine Gerber wurde von Dr. Pascal Imhof zugewiesen und ist sehr müde.';
  const presidio = (helper, request) => helper.send({ labels: ['person'], model: MODEL, engine: 'presidio', ...request });
  const withPresidio = (presidioEntities, env = {}) => startHelper({ 'Nadine Gerber': ['person', 0.9] }, { FAKE_PRESIDIO_ENTITIES: JSON.stringify(presidioEntities), ...env });

  it('adds Presidio\'s values to GLiNER\'s, each marked with its source', async () => {
    const helper = withPresidio({ 'Pascal Imhof': ['PERSON', 0.85] });
    try {
      const answer = await presidio(helper, { id: 1, text: GERMAN });
      assert.equal(answer.language, 'de');
      assert.deepEqual(answer.entities.map((e) => [e.text, e.label, e.source]), [['Nadine Gerber', 'person', 'gliner'], ['Pascal Imhof', 'PERSON', 'presidio']]);
      const glinerOnly = await helper.send({ id: 2, text: GERMAN, labels: ['person'], model: MODEL });
      assert.deepEqual(glinerOnly.entities.map((e) => e.text), ['Nadine Gerber']);
      assert.equal(glinerOnly.language, undefined);
    } finally {
      await helper.close();
    }
  });

  it('recognizes German, French, Italian and English, and uses English without any hint', async () => {
    const helper = withPresidio({});
    try {
      const texts = {
        de: GERMAN,
        fr: 'Merci de m\'envoyer votre certificat médical pour le dossier.',
        it: 'Le invio il signor Matteo per una valutazione della dispnea.',
        en: 'Please call me before Thursday, the board is waiting for your answer.',
        none: 'id,name\n1,Hans Muster\n2,Maria Keller',
      };
      for (const [expected, text] of Object.entries(texts)) {
        const answer = await presidio(helper, { id: 1, text, language: 'auto' });
        assert.equal(answer.language, expected === 'none' ? 'en' : expected, text);
      }
      assert.equal((await presidio(helper, { id: 2, text: GERMAN, language: 'fr' })).language, 'fr');
    } finally {
      await helper.close();
    }
  });

  it('splits values at line breaks and drops pieces that start or end inside a word', async () => {
    const text = 'An: Thierry Baud\nObjet: Ihr Fall\nKontakt: lukas.steiner@example.com';
    const helper = withPresidio({ 'Thierry Baud\nObjet': ['PERSON', 0.85], 'lukas.st': ['PERSON', 0.85] });
    try {
      const answer = await presidio(helper, { id: 1, text });
      const found = answer.entities.filter((e) => e.source === 'presidio');
      assert.deepEqual(found.map((e) => e.text), ['Thierry Baud', 'Objet']);
      for (const e of found) assert.equal(codePoints(text, e.start, e.end), e.text);
    } finally {
      await helper.close();
    }
  });

  it('never uses Presidio\'s e-mail and URL recognizers (the e-mail one downloads a domain list)', async () => {
    const helper = withPresidio({ 'lukas.steiner@example.com': ['EMAIL_ADDRESS', 1.0], 'example.com': ['URL', 0.5], 'Lukas Steiner': ['PERSON', 0.85] });
    try {
      const answer = await presidio(helper, { id: 1, text: 'Bitte an Lukas Steiner, lukas.steiner@example.com, der Bericht.' });
      assert.deepEqual(answer.entities.filter((e) => e.source === 'presidio').map((e) => e.label), ['PERSON']);
    } finally {
      await helper.close();
    }
  });

  it('reports a missing language model instead of downloading it, and still serves other languages', async () => {
    const helper = withPresidio({}, { FAKE_SPACY_MISSING: 'it_core_news_lg' });
    try {
      const answer = await presidio(helper, { id: 1, text: 'Le invio il signor Matteo per una valutazione.' });
      assert.equal(answer.entities, undefined);
      assert.match(answer.error, /spaCy model for Italian \(it_core_news_lg\) is not installed.*README/);
      assert.equal((await presidio(helper, { id: 2, text: GERMAN })).language, 'de');
    } finally {
      await helper.close();
    }
  });

  it('rejects an unknown engine or language', async () => {
    const helper = withPresidio({});
    try {
      assert.match((await presidio(helper, { id: 1, text: GERMAN, engine: 'cloud' })).error, /unknown engine "cloud"/);
      assert.match((await presidio(helper, { id: 2, text: GERMAN, language: 'es' })).error, /unsupported language "es"/);
    } finally {
      await helper.close();
    }
  });

  it('only loads GLiNER for an empty text', async () => {
    const helper = withPresidio({}, { FAKE_SPACY_MISSING: 'de_core_news_lg,fr_core_news_lg,it_core_news_lg,en_core_web_lg' });
    try {
      assert.deepEqual(await presidio(helper, { id: 1, text: '' }), { id: 1, entities: [] });
    } finally {
      await helper.close();
    }
  });
});
