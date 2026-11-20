// The synthetic documents for measuring detection: the fixtures of tests/fixtures/documents.mjs and the documents
// of tests/fixtures/corpus/ (one file each: HTML parts, the values to hide with their category, the terms that must
// stay readable). Everything in them is invented. Also how a result is measured against them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DOCUMENTS } from '../fixtures/documents.mjs';

const CORPUS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'corpus');

const ENTITIES = { '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&amp;': '&' };
// The HTML entities the documents use.
const ENTITY = /&(?:nbsp|lt|gt|amp);/g;
// A formula: <tex>...</tex> inline, <tex display>...</tex> as a block; group 1 "display", group 2 the LaTeX.
const FORMULA = /<tex(\s+display)?>([\s\S]*?)<\/tex>/g;
const TABLE = /<table[^>]*>([\s\S]*?)<\/table>/g;
const ROW = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
const CELL = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g;
const PREFORMATTED = /<pre[^>]*>([\s\S]*?)<\/pre>/g;
const LINE_BREAK_TAG = /<br\s*\/?>/g;
const ANY_TAG = /<[^>]+>/g;
// Stands for a line break that must stay while the source's own line breaks become spaces.
const KEPT_BREAK = '\u0001';

/** A document part as the text a user would paste: headings with "#", table rows as "| a | b |", paragraphs. */
function htmlToText(html) {
  let s = html.replaceAll('\r', '');
  s = s.replace(FORMULA, (_m, display, tex) => (display ? `\n\n$$${tex.trim()}$$\n\n` : `$${tex.trim()}$`));
  s = s.replace(TABLE, (_m, body) => {
    const rows = [...body.matchAll(ROW)].map((row) => [...row[1].matchAll(CELL)]
      .map((cell) => cell[1].replace(LINE_BREAK_TAG, ' ').replace(ANY_TAG, '').replace(/\s+/g, ' ').trim()));
    if (!rows.length) return '';
    const lines = rows.map((cells) => `| ${cells.join(' | ')} |`);
    lines.splice(1, 0, `|${rows[0].map(() => '---').join('|')}|`);
    return `\n\n${lines.join(KEPT_BREAK)}\n\n`;
  });
  s = s.replace(PREFORMATTED, (_m, body) => `\n\n${body.replaceAll('\n', KEPT_BREAK)}\n\n`);
  s = s.replace(LINE_BREAK_TAG, KEPT_BREAK);
  s = s.replace(/<h1[^>]*>/g, '\n\n# ').replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n\n### ');
  s = s.replace(/<li[^>]*>/g, '\n\n- ');
  s = s.replace(/<\/(?:p|h1|h2|h3|div|ul|ol|li)>/g, '\n\n').replace(/<(?:p|div|ul|ol)[^>]*>/g, '\n\n');
  s = s.replace(ANY_TAG, '').replace(ENTITY, (entity) => ENTITIES[entity]);
  const blocks = s.split(/\n{2,}/).map((block) => block.replace(/\s*\n\s*/g, ' ').replace(/[ \t]+/g, ' ').trim()).filter(Boolean);
  return blocks.join('\n\n').replace(new RegExp(` ?${KEPT_BREAK} ?`, 'g'), '\n') + '\n';
}

/** Every document as { id, set, language, text, values: [{ text, category }], keep: [text] }. */
export async function loadDocuments() {
  const fixtures = DOCUMENTS.map((d) => ({
    id: d.id, set: 'fixture', language: d.language, text: d.text, values: d.mustHide.map((text) => ({ text, category: 'UNKNOWN' })), keep: d.mustKeep ?? [],
  }));
  const corpus = [];
  for (const file of fs.readdirSync(CORPUS_DIR).filter((f) => f.endsWith('.mjs')).sort()) {
    const doc = (await import(pathToFileURL(path.join(CORPUS_DIR, file)))).default;
    const text = [doc.header, ...doc.parts.map((part) => htmlToText(part.html)), doc.footer].filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n');
    corpus.push({ id: doc.id, set: 'corpus', language: doc.language, text, values: doc.values, keep: doc.keep ?? [] });
  }
  return [...fixtures, ...corpus];
}

// Compared in Unicode NFC, any whitespace (line breaks too) as one space, in any case; a hyphen with spaces after
// it between letters or digits counts as the plain hyphen ("TA- 2601178" is "TA-2601178").
const WRAPPED_HYPHEN = /(?<=[\p{L}\p{N}])- +(?=[\p{L}\p{N}])/gu;
const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').replace(WRAPPED_HYPHEN, '-').toLowerCase();
// A part of a person's name: split at spaces, "-", "'", "." and ",", kept when it starts with a capital and has 3
// or more letters ("Ammann", "Keller" in "Ammann-Keller"; not "von", "H.").
const NAME_SEPARATORS = /[\s\-'’.,]+/u;
const STARTS_WITH_CAPITAL = /^\p{Lu}/u;
const LETTERS = /\p{L}/gu;
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;

/**
 * What a pseudonymized text still shows of a document: leaks (values, or for people parts of their names, that
 * are still readable) and overRedacted (terms of keep that are not readable any more). commonWords: titles and
 * the like are no name parts.
 */
export function measure(doc, pseudo, commonWords) {
  const shown = normalize(pseudo);
  const namePartsOf = (value) => value.normalize('NFC').split(NAME_SEPARATORS)
    .filter((part) => STARTS_WITH_CAPITAL.test(part) && (part.match(LETTERS) || []).length >= 3 && !commonWords.has(part.toLowerCase()));
  // A name part counts where it stands as a word, also with a genitive "s", not inside another word ("Lea" in "please").
  const isShownAsWord = (part) => new RegExp(`(?<![\\p{L}\\p{N}])${normalize(part).replace(REGEX_SYNTAX, '\\$&')}s?(?![\\p{L}\\p{N}])`, 'u').test(shown);
  const leaks = new Set();
  for (const value of doc.values) {
    if (shown.includes(normalize(value.text))) leaks.add(value.text);
    else if (value.category === 'PERSON') for (const part of namePartsOf(value.text)) if (isShownAsWord(part)) leaks.add(part);
  }
  return { leaks: [...leaks], overRedacted: doc.keep.filter((term) => !shown.includes(normalize(term))) };
}
