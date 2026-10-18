// Checks the document sources in documents/: shape, values and keep entries that appear in the text, name
// variants that are missing from values, and data that looks real. Exits with 1 if a document has errors.
// Usage: node tools/corpus/check.mjs [id ...]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DOCUMENTS_DIR = path.join(HERE, 'documents');
const ID = /^(?<domain>[a-z]+)-(?<language>de|fr|it|en)-\d{2}$/;
export const CATEGORIES = ['PERSON', 'ADDRESS', 'DATE', 'AHV', 'ID', 'IBAN', 'ACCOUNT', 'CARD', 'EMAIL', 'PHONE',
  'COMPANY', 'URL', 'IP', 'HOST', 'MAC', 'USERNAME', 'SECRET', 'PLATE'];
// <tex>...</tex> or <tex display>...</tex>, content captured lazily up to the closing tag.
export const TEX = /<tex(\s+display)?>([\s\S]*?)<\/tex>/g;
// Any HTML tag, e.g. <td class="x"> or </p>.
const TAG = /<[^>]+>/g;
// Named and numeric character references such as &amp; or &#x00E4;.
const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi;
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };
// A word of letters (any script), with inner apostrophes or hyphens kept out: "Müller", "D'Amico" gives "Amico".
const WORD = /\p{L}{3,}/gu;
// E-mail addresses; the domain must be an example domain.
const EMAIL = /[\w.+-]+@([\w-]+\.)+[\w-]+/g;
// A host with "example" as one of its labels: example.com, praxis.example, mail.example.ch.
const EXAMPLE_DOMAIN = /(^|\.)example(\.|$)/i;
// IPv4 addresses; allowed are the documentation and private ranges.
const IPV4 = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g;
const SAFE_IP = /^(192\.0\.2|198\.51\.100|203\.0\.113|10|127|192\.168|172\.(1[6-9]|2\d|3[01]))\./;

export async function loadDocuments(ids = []) {
  const files = fs.readdirSync(DOCUMENTS_DIR).filter((f) => f.endsWith('.mjs')).sort();
  const wanted = ids.length ? files.filter((f) => ids.includes(f.replace(/\.mjs$/, ''))) : files;
  const documents = [];
  for (const file of wanted) {
    const { default: doc } = await import(pathToFileURL(path.join(DOCUMENTS_DIR, file)).href + `?t=${Date.now()}`);
    documents.push({ file, doc });
  }
  return documents;
}

const decode = (text) => text.replace(ENTITY, (m, code) => {
  if (code[0] === '#') return String.fromCodePoint(code[1] === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  return NAMED[code.toLowerCase()] ?? m;
});

export const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').trim();

/** The visible text of a document (without formulas), as a reader would see it. */
export function plainText(doc) {
  const bodies = doc.parts.map((p) => p.html.replace(TEX, ' ').replace(/<(br|\/p|\/div|\/tr|\/li|\/h\d)\b[^>]*>/gi, '\n').replace(/<\/t[dh]>/gi, ' '));
  return decode([doc.header ?? '', doc.footer ?? '', ...bodies].join('\n').replace(TAG, ''));
}

export function formulasOf(doc) {
  return doc.parts.flatMap((p) => [...p.html.matchAll(TEX)].map((m) => m[2].trim()));
}

export function layoutOf(doc) {
  const html = doc.parts.map((p) => p.html).join('\n');
  const layout = [];
  if (doc.parts.some((p) => !p.scan)) layout.push('born-digital');
  if (/<table\b/i.test(html)) layout.push('table');
  if (doc.parts.some((p) => p.scan)) layout.push('scanned-page');
  if (formulasOf(doc).length) layout.push('formula');
  if (doc.parts.some((p) => p.columns === 2)) layout.push('two-column');
  if (doc.header || doc.footer) layout.push('header-footer');
  if (/class="[^"]*\bas-image\b/.test(html)) layout.push('text-in-image');
  return layout;
}

export function checkDocument(file, doc) {
  const errors = [];
  const warnings = [];
  const id = file.replace(/\.mjs$/, '');
  const match = ID.exec(doc?.id ?? '');
  if (doc?.id !== id) errors.push(`id "${doc?.id}" must equal the file name "${id}"`);
  if (!match) return { errors: [...errors, 'id must look like <domain>-<language>-<nn>'], warnings };
  if (match.groups.domain !== doc.domain) errors.push(`domain "${doc.domain}" does not match the id`);
  if (match.groups.language !== doc.language) errors.push(`language "${doc.language}" does not match the id`);
  if (typeof doc.title !== 'string' || !doc.title) errors.push('title missing');
  if (!Array.isArray(doc.parts) || !doc.parts.length || doc.parts.some((p) => typeof p.html !== 'string')) {
    return { errors: [...errors, 'parts must be a non-empty list of { html }'], warnings };
  }
  const text = normalize(plainText(doc));
  const lower = text.toLowerCase();
  const seen = new Set();
  for (const v of doc.values ?? []) {
    if (typeof v.text !== 'string' || !CATEGORIES.includes(v.category)) { errors.push(`bad value ${JSON.stringify(v)}`); continue; }
    if (seen.has(v.text)) warnings.push(`value listed twice: "${v.text}"`);
    seen.add(v.text);
    if (!text.includes(normalize(v.text))) errors.push(`value not in the text (exactly): "${v.text}"`);
  }
  if (!(doc.values ?? []).length) errors.push('no values');
  for (const k of doc.keep ?? []) {
    if (!lower.includes(normalize(k).toLowerCase())) errors.push(`keep entry not in the text: "${k}"`);
    if ((doc.values ?? []).some((v) => normalize(k).toLowerCase().includes(normalize(v.text).toLowerCase()) && v.text.length > 3)) {
      warnings.push(`keep entry contains a value: "${k}"`);
    }
  }
  const valueTexts = (doc.values ?? []).map((v) => normalize(v.text));
  const nameWords = new Set((doc.values ?? []).filter((v) => v.category === 'PERSON').flatMap((v) => v.text.match(WORD) ?? []));
  for (const word of nameWords) {
    const occurrences = new Set(text.match(new RegExp(`(?<!\\p{L})${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'giu')) ?? []);
    for (const form of occurrences) {
      if (!valueTexts.some((t) => t.includes(form))) warnings.push(`name written as "${form}" is in no values entry`);
    }
  }
  for (const [address] of text.matchAll(EMAIL)) {
    if (!EXAMPLE_DOMAIN.test(address.split('@')[1])) errors.push(`e-mail outside example domains: ${address}`);
  }
  for (const [ip] of text.matchAll(IPV4)) {
    if (ip.split('.').every((n) => Number(n) <= 255) && !SAFE_IP.test(ip)) warnings.push(`IP outside documentation ranges: ${ip}`);
  }
  if ((doc.keep ?? []).length < 3) warnings.push('fewer than 3 keep entries');
  return { errors, warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const documents = await loadDocuments(process.argv.slice(2));
  let failed = 0;
  for (const { file, doc } of documents) {
    const { errors, warnings } = checkDocument(file, doc);
    if (errors.length) failed++;
    const status = errors.length ? 'FAIL' : 'ok  ';
    console.log(`${status} ${file} (${(doc.values ?? []).length} values, ${(doc.keep ?? []).length} keep, ${formulasOf(doc).length} formulas, ${layoutOf(doc).join(', ')})`);
    for (const e of errors) console.log(`     error: ${e}`);
    for (const w of warnings) console.log(`     warning: ${w}`);
  }
  console.log(`${documents.length} documents, ${failed} with errors`);
  process.exitCode = failed ? 1 : 0;
}
