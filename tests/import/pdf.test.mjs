import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { layoutDocument } from '../../public/js/import/pdf-layout.js';
import { readPage } from '../../public/js/import/pdf-reader.js';
import { detectWithPatterns } from '../helpers/core.mjs';
import { makePdf } from '../helpers/pdf.mjs';
import { ROOT } from '../helpers/server.mjs';

const SIZE = 10;
// A piece of text as pdf.js reports it; about half the font size per character, as in common fonts.
const piece = (x, y, text, size = SIZE) => ({ text, x, y, width: text.length * size * 0.5, size });
const page = (items, extra = {}) => ({ width: 595, height: 842, items, images: [], isScan: false, ...extra });
const textOf = (...pages) => layoutDocument(pages).text;
// A line that fills the text width of 480 points from x = 50 (96 characters).
const FULL = 'Die Beklagte beantragte mit Klageantwort die vollumfängliche Abweisung der Klage und macht dazu';

describe('text from the positions on a PDF page', () => {
  it('joins the lines of a paragraph that were wrapped, and keeps the line breaks that were meant', () => {
    const text = textOf(page([
      piece(50, 100, 'Klinik Seeblick AG, Innere Medizin'),
      piece(50, 114, 'Seestrasse 101, 8800 Thalwil'),
      piece(50, 160, FULL),
      piece(50, 174, 'geltend, der Kläger habe die Ausführung verzögert.'),
      piece(50, 220, 'Freundliche Grüsse'),
    ]));
    assert.equal(text, `Klinik Seeblick AG, Innere Medizin\nSeestrasse 101, 8800 Thalwil\n\n${FULL} geltend, der Kläger habe die Ausführung verzögert.\n\nFreundliche Grüsse\n`);
  });

  it('puts pieces of one line together: words that touch, words with a gap, in reading order', () => {
    const text = textOf(page([piece(130, 100, 'Ammann'), piece(50, 100, 'Herr'), piece(75, 100, 'Reto'), piece(95, 100, ' '), piece(160, 100, 's'), piece(100.5, 100, 'Franz')]));
    assert.equal(text, 'Herr Reto Franz Ammanns\n');
  });

  it('marks larger text as a heading', () => {
    const text = textOf(page([piece(50, 80, 'Austrittsbericht', 17), piece(50, 120, 'Diagnosen', 13), piece(50, 150, FULL), piece(50, 164, FULL.slice(0, 40))]));
    assert.equal(text, `# Austrittsbericht\n\n## Diagnosen\n\n${FULL} ${FULL.slice(0, 40)}\n`);
  });

  it('writes the rows of a table as cells, and puts a cell that wraps back together', () => {
    const rows = [
      [piece(50, 300, 'Name'), piece(170, 300, 'Adresse'), piece(360, 300, 'Beweisthema')],
      [piece(50, 320, 'Erika Brunner-'), piece(170, 320, 'Rebbergstrasse 14, 8472'), piece(360, 320, 'Vertragsverhandlungen,')],
      [piece(50, 333, 'Zollinger'), piece(170, 333, 'Seuzach'), piece(360, 333, 'Planänderungen')],
      [piece(50, 353, 'Luca Fontana'), piece(170, 353, 'Bachtelweg 3, 8404 Winterthur'), piece(360, 353, 'Ersatzvornahme, Kosten')],
    ];
    const text = textOf(page([piece(50, 270, '2. Als Zeugen werden vorgeladen:'), ...rows.flat(), piece(50, 400, 'Der Kläger hat persönlich zu erscheinen.')]));
    assert.equal(text, [
      '2. Als Zeugen werden vorgeladen:', '',
      'Name | Adresse | Beweisthema',
      'Erika Brunner-Zollinger | Rebbergstrasse 14, 8472 Seuzach | Vertragsverhandlungen, Planänderungen',
      'Luca Fontana | Bachtelweg 3, 8404 Winterthur | Ersatzvornahme, Kosten', '',
      'Der Kläger hat persönlich zu erscheinen.', '',
    ].join('\n'));
    // What the layout is for: values in a labelled column are found as such.
    assert.ok(detectWithPatterns(text).some((e) => e.text === 'Erika Brunner-Zollinger' && e.category === 'PERSON'));
  });

  it('keeps a form laid out in two columns as label and value', () => {
    const text = textOf(page([
      piece(50, 100, 'Kläger'), piece(150, 100, 'Markus Brunner, geb. 21.07.1974'),
      piece(50, 117, 'Beklagte'), piece(150, 117, 'Holzbau Glattfelder GmbH'),
    ]));
    assert.equal(text, 'Kläger | Markus Brunner, geb. 21.07.1974\nBeklagte | Holzbau Glattfelder GmbH\n');
  });

  it('leaves a list as a list, not as a table of markers and texts', () => {
    const text = textOf(page([piece(50, 100, '1.'), piece(75, 100, 'Die Parteien werden vorgeladen.'), piece(50, 114, '2.'), piece(75, 114, 'Als Zeugen werden vorgeladen.')]));
    assert.equal(text, '1. Die Parteien werden vorgeladen.\n2. Als Zeugen werden vorgeladen.\n');
  });

  it('reads two columns of running text one after the other', () => {
    // Lines as a typesetter breaks them: as many words as fit into 42 characters.
    const wrap = (paragraph) => paragraph.split(' ').reduce((lines, word) => {
      if (lines.length && (lines.at(-1) + ' ' + word).length <= 42) lines[lines.length - 1] += ' ' + word;
      else lines.push(word);
      return lines;
    }, []);
    const first = 'Im ersten Abschnitt wird die Ausgangslage des Verfahrens dargestellt und der Gang der Untersuchung in groben Zügen so beschrieben, dass die folgenden Teile verständlich sind und sich gut einordnen lassen.';
    const second = 'Der zweite Abschnitt enthält danach die rechtliche Würdigung der Feststellungen und die Schlüsse, die das Gericht daraus für den Entscheid gezogen hat, sowie die Verteilung der Kosten unter den Parteien.';
    const [left, right] = [wrap(first), wrap(second)];
    assert.ok(left.length >= 5 && right.length >= 5);
    const items = [...left.map((line, i) => piece(50, 100 + i * 13, line)), ...right.map((line, i) => piece(310, 100 + i * 13, line))];
    assert.equal(textOf(page(items)), `${first}\n\n${second}\n`);
  });

  it('separates the parts of a line that stand far apart, such as place and date at the right', () => {
    assert.equal(textOf(page([piece(50, 100, 'Étude Favre & Rochat'), piece(400, 100, 'Genève, le 3 octobre 2026')])), 'Étude Favre & Rochat | Genève, le 3 octobre 2026\n');
  });

  it('splits a line whose columns are written with runs of spaces', () => {
    const text = textOf(page([piece(50, 100, 'Name          Geburtsdatum'), piece(50, 114, 'Hans Muster   14.02.1961')]));
    assert.equal(text, 'Name | Geburtsdatum\nHans Muster | 14.02.1961\n');
  });
});

describe('hyphens at the end of a wrapped line', () => {
  const wrapped = (first, second, more = []) => textOf(page([piece(50, 100, FULL.slice(0, 96 - first.length - 1) + ' ' + first), piece(50, 114, second), ...more]));

  it('keeps the hyphen of a double name, a code or an address', () => {
    assert.match(wrapped('Frau Erika Brunner-', 'Zollinger wohnt dort.'), /Erika Brunner-Zollinger wohnt/);
    assert.match(wrapped('Charge ATV-K2604-', '118 wurde geprüft.'), /ATV-K2604-118 wurde/);
    assert.match(wrapped('an s.luethi@bank-', 'talwiesen.example gesendet.'), /s\.luethi@bank-talwiesen\.example gesendet/);
    assert.match(wrapped('im Bucket brunnmatt-', 'archive gespeichert.'), /brunnmatt-archive gespeichert/);
  });

  it('removes it only if the document writes the word without it elsewhere', () => {
    assert.match(wrapped('die erbrachten Planungs-', 'leistungen zu verrechnen.', [piece(50, 160, 'Die Planungsleistungen sind unbestritten.')]), /erbrachten Planungsleistungen zu verrechnen/);
    assert.match(wrapped('der Anwalt Dr. Wegmül-', 'ler erschien nicht.', [piece(50, 160, 'Dr. Wegmüller ist entschuldigt.')]), /Dr\. Wegmüller erschien/);
    assert.match(wrapped('die erbrachten Planungs-', 'leistungen zu verrechnen.'), /Planungs-leistungen/);
  });

  it('keeps the space before a conjunction ("Ein- und Ausgang")', () => {
    assert.match(wrapped('beim Ein-', 'und Ausgang des Gebäudes.'), /Ein- und Ausgang/);
  });
});

describe('pages, images and scanned pages', () => {
  it('numbers the pages after the first and marks every image where it stands, without tiny ones', () => {
    const first = page([piece(50, 100, 'Befund vom 3. Oktober'), piece(50, 400, 'Beurteilung folgt.')], { images: [{ x: 50, y: 150, width: 300, height: 200 }, { x: 50, y: 90, width: 4, height: 4 }] });
    const second = page([piece(50, 100, 'Zweite Seite')], { images: [{ x: 50, y: 300, width: 100, height: 100 }] });
    const result = layoutDocument([first, second]);
    assert.equal(result.text, 'Befund vom 3. Oktober\n\n[Image 1, page 1: not sent]\n\nBeurteilung folgt.\n\n--- Page 2 ---\n\nZweite Seite\n\n[Image 2, page 2: not sent]\n');
    assert.deepEqual([result.pages, result.images, result.scannedPages, result.unreadPages], [2, 2, 0, []]);
  });

  it('says so when a scanned page was not read, and uses its recognized text when there is one', () => {
    const scan = page([], { images: [{ x: 0, y: 0, width: 595, height: 842 }], isScan: true });
    const unread = layoutDocument([page([piece(50, 100, 'Seite eins')]), scan]);
    assert.equal(unread.text, 'Seite eins\n\n--- Page 2 ---\n\n[Page 2 is a scanned image: its text was not read]\n');
    assert.deepEqual([unread.scannedPages, unread.unreadPages], [1, [2]]);
    const read = layoutDocument([page([piece(50, 100, 'Seite eins')]), scan], [undefined, 'Patient: Hans Muster\ngeb. 14.02.1961\n']);
    assert.equal(read.text, 'Seite eins\n\n--- Page 2 ---\n\nPatient: Hans Muster\ngeb. 14.02.1961\n');
    assert.deepEqual(read.unreadPages, []);
  });

  it('gives an empty document an empty text', () => {
    assert.equal(layoutDocument([page([])]).text, '\n');
  });
});

const PDFJS = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs');

describe('reading a PDF file with pdf.js', { skip: !fs.existsSync(PDFJS) && 'run "npm run setup" first' }, () => {
  async function read(pages) {
    const pdfjs = await import(new URL('file://' + PDFJS.replaceAll('\\', '/').replace(/^(?!\/)/, '/')).href);
    const loading = pdfjs.getDocument({ data: makePdf(pages), isEvalSupported: false, verbosity: 0 });
    const pdf = await loading.promise;
    const read = [];
    for (let n = 1; n <= pdf.numPages; n++) read.push(await readPage(pdfjs, await pdf.getPage(n)));
    await loading.destroy();
    return read;
  }

  it('gives the text with positions from the top of the page, umlauts included', async () => {
    const [first] = await read([{ texts: [{ x: 72, y: 770, size: 12, text: 'Patient: Hans Müller' }, { x: 72, y: 750, text: 'AHV-Nr.: 756.1234.5678.97' }] }]);
    assert.deepEqual([Math.round(first.width), Math.round(first.height), first.isScan], [595, 842, false]);
    assert.deepEqual(first.items.map((i) => [i.text, Math.round(i.x), Math.round(i.y), Math.round(i.size)]), [['Patient: Hans Müller', 72, 72, 12], ['AHV-Nr.: 756.1234.5678.97', 72, 92, 11]]);
    assert.equal(layoutDocument([first]).text, 'Patient: Hans Müller\nAHV-Nr.: 756.1234.5678.97\n');
  });

  it('recognizes a page that is only a picture as a scan, and finds where a picture stands', async () => {
    const [scan, mixed] = await read([{ scan: true }, { scan: true, texts: [{ x: 72, y: 700, text: 'Ein Brief mit Briefkopf als Bild und danach genug Text für eine Seite.' }] }]);
    assert.equal(scan.isScan, true);
    assert.deepEqual(scan.images.map((i) => [Math.round(i.x), Math.round(i.y), Math.round(i.width), Math.round(i.height)]), [[0, 0, 595, 842]]);
    assert.equal(mixed.isScan, false);
    const result = layoutDocument([scan, mixed]);
    assert.match(result.text, /^\[Page 1 is a scanned image: its text was not read\]\n\n--- Page 2 ---\n/);
    assert.deepEqual(result.unreadPages, [1]);
  });
});
