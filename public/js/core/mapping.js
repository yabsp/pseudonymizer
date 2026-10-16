import { isOnlyCommonWords } from './common-words.js';
import { isDiagnosisCode } from './patterns.js';

// A placeholder as the app writes it: "[[", upper-case letters, digits or "_", "]]" (e.g. [[PERSON_1]]).
export const PLACEHOLDER = /\[\[[A-Z0-9_]+\]\]/;

// Every character with a special meaning in a regex, so a value can be escaped and matched literally.
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;
// In a category name, every run of characters other than A-Z and 0-9; it becomes "_" ("e-mail" -> "E_MAIL").
const NOT_PLACEHOLDER_CHARS = /[^A-Z0-9]+/g;

const escapeRegex = (s) => s.replace(REGEX_SYNTAX, '\\$&');
const nameOf = (placeholder) => placeholder.slice(2, -2);

// Short values only match as a whole word, so "ich" never matches inside "wichtige". Longer values match
// anywhere, so a name stays hidden in "Ammanns" or "AcmeBillingService".
const SHORT_VALUE_LENGTH = 5;

// Word boundaries for short values (u flag; \p{L} letter, \p{Lu} upper-case, \p{Ll} lower-case,
// \p{Lt} title-case, \p{Lo} letter without case, \p{N} digit):
// not right after a letter or digit
const NOT_AFTER_LETTER_OR_DIGIT = '(?<![\\p{L}\\p{N}])';
// not right after an upper-case or caseless letter or a digit; after a lower-case letter is a word
// start in camelCase ("myAnn")
const NOT_AFTER_UPPER_OR_DIGIT = '(?<![\\p{Lu}\\p{Lt}\\p{Lo}\\p{N}])';
// not right before a letter or digit
const NOT_BEFORE_LETTER_OR_DIGIT = '(?![\\p{L}\\p{N}])';
// not right before a lower-case letter or digit, except an "s" that ends the word (genitive "Anns");
// before an upper-case letter is a word end in camelCase ("AnnSmith")
const NOT_BEFORE_LOWER_OR_DIGIT = '(?!(?!s(?![\\p{L}\\p{N}]))[\\p{Ll}\\p{N}])';
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const UPPER_CASE = /\p{Lu}/u;
const LOWER_CASE = /\p{Ll}/u;

/** Regex source (u flag) that matches the value where it should be replaced. */
export function valuePattern(value) {
  const escaped = escapeRegex(value);
  const chars = [...value];
  if (chars.length >= SHORT_VALUE_LENGTH) return escaped;
  const [first, last] = [chars[0], chars.at(-1)];
  let before = '';
  if (LETTER_OR_DIGIT.test(first)) before = UPPER_CASE.test(first) ? NOT_AFTER_UPPER_OR_DIGIT : NOT_AFTER_LETTER_OR_DIGIT;
  let after = '';
  if (LETTER_OR_DIGIT.test(last)) after = LOWER_CASE.test(last) ? NOT_BEFORE_LOWER_OR_DIGIT : NOT_BEFORE_LETTER_OR_DIGIT;
  return before + escaped + after;
}

/**
 * Returns a new mapping; the same one if the value is too short, already mapped, or not in sourceText. A value
 * found in sourceText only in another case ("reto ammann") is added as the text writes it.
 */
export function addEntry(mapping, original, category, sourceText) {
  let value = (original || '').trim();
  if (value.length < 2) return mapping;
  if (sourceText !== undefined && !sourceText.includes(value)) {
    const inText = sourceText.match(new RegExp(escapeRegex(value), 'iu'));
    if (!inText) return mapping;
    value = inText[0];
  }
  if (mapping.some((m) => m.original === value)) return mapping;

  const name = (category || 'OTHER').toUpperCase().replace(NOT_PLACEHOLDER_CHARS, '_') || 'OTHER';
  let n = 1;
  while (mapping.some((m) => m.placeholder === `[[${name}_${n}]]`)) n++;
  return [...mapping, { original: value, placeholder: `[[${name}_${n}]]` }];
}

// A part of a person's name: a capital letter, then letters, apostrophes or hyphens ("Sarah", "O'Brien",
// "Ammann-Keller"). Titles such as "Mr" or "Dr" also match and are skipped as common words.
const NAME_PART = /\p{Lu}[\p{L}'-]+/gu;
// A short form in brackets: "(", a capital letter and 1 to 5 more capitals or digits, ")" ("(USZ)", "(B2B)").
const SHORT_FORM_IN_BRACKETS = /\((\p{Lu}[\p{Lu}\p{N}]{1,5})\)/gu;
// The placeholder name of a person: "PERSON_" and a number.
const PERSON_PLACEHOLDER_NAME = /^PERSON_\d+$/;
const ALL_PLACEHOLDERS = new RegExp(PLACEHOLDER.source, 'g');

// One name of a double name: a capital letter, then letters or apostrophes ("Gerber" and "Kunz" in
// "Gerber-Kunz", "Hans" and "Peter" in "Hans-Peter").
const SINGLE_NAME = /\p{Lu}[\p{L}']+/gu;

const isPersonEntry = (entry) => PERSON_PLACEHOLDER_NAME.test(nameOf(entry.placeholder));
const isNotCommon = (commonWords) => (part) => !commonWords.has(part.toLowerCase());
const wholeNamePartsOf = (value, commonWords) => (value.match(NAME_PART) || []).filter(isNotCommon(commonWords));
const namesOfDoubleName = (part, commonWords) => (part.includes('-') ? (part.match(SINGLE_NAME) || []).filter(isNotCommon(commonWords)) : []);

/** The parts of a name, and the single names of a double name ("Nadine Gerber-Kunz" -> "Nadine", "Gerber-Kunz", "Gerber", "Kunz"). */
function namePartsOf(value, commonWords) {
  const whole = wholeNamePartsOf(value, commonWords);
  return [...new Set([...whole, ...whole.flatMap((part) => namesOfDoubleName(part, commonWords))])];
}

/** The name as written, and with one double name shortened to each of its names ("Nadine Gerber" for "Nadine Gerber-Kunz"). */
function nameVariants(parts, commonWords) {
  return [parts, ...parts.flatMap((part, i) => namesOfDoubleName(part, commonWords).map((single) => parts.with(i, single)))];
}

const MAX_NAME_PARTS_TO_COMBINE = 5;

/** The parts in their order, two or more of them joined by spaces, longest first ("Jonathan Andrew Reyes" -> "Jonathan Reyes", ...). */
function partCombinations(parts) {
  if (parts.length > MAX_NAME_PARTS_TO_COMBINE) return [];
  const combinations = [];
  for (let mask = 1; mask < 1 << parts.length; mask++) {
    const chosen = parts.filter((_, i) => mask & (1 << i));
    if (chosen.length >= 2) combinations.push(chosen.join(' '));
  }
  return combinations.sort((a, b) => b.length - a.length);
}

// A lower-case letter at the start or after a space, "-" or "'"; it becomes a capital in the title-case form
// ("berset-rapin" -> "Berset-Rapin", "o'brien" -> "O'Brien").
const WORD_START = /(^|[\s'-])(\p{Ll})/gu;
const titleCase = (value) => value.toLowerCase().replace(WORD_START, (_, before, letter) => before + letter.toUpperCase());

/**
 * The value in capitals ("RETO AMMANN" in a letterhead, "MKELLER" in a device name) and, if it is not short,
 * in title case ("Berset-Rapin" in a letter whose header writes "BERSET-RAPIN"). Never in lower case, which
 * would hide "keller" in "Weinkeller" or the Italian "mia" for "Mia".
 */
function caseVariants(value) {
  const variants = [...value].length < SHORT_VALUE_LENGTH ? [value.toUpperCase()] : [value.toUpperCase(), titleCase(value)];
  return variants.filter((variant) => variant !== value);
}

function relatedValues(entry, commonWords) {
  const shortForms = [...entry.original.matchAll(SHORT_FORM_IN_BRACKETS)].map((m) => m[1]);
  const combinations = isPersonEntry(entry)
    ? [...new Set(nameVariants(wholeNamePartsOf(entry.original, commonWords), commonWords).flatMap(partCombinations))].sort((a, b) => b.length - a.length)
    : [];
  const parts = isPersonEntry(entry) ? namePartsOf(entry.original, commonWords) : [];
  // Combinations first, so "Jonathan Reyes" becomes one placeholder, not "[[PERSON_1]] [[PERSON_1]]".
  const values = [...combinations, ...parts, ...shortForms];
  return [...new Set([...values, ...[entry.original, ...values].flatMap(caseVariants)])].filter((value) => value !== entry.original);
}

const lowerCase = (words) => words.map((word) => word.toLowerCase());

/** The placeholder of the one person already mapped whose name contains all parts of this name, in any case ("Mr. Chen", "CHEN"). */
function placeholderOfSamePerson(mapping, name, commonWords) {
  const parts = lowerCase(namePartsOf(name, commonWords));
  if (!parts.length) return null;
  const candidates = new Set(mapping
    .filter((m) => m.original && isPersonEntry(m) && parts.every((part) => lowerCase(namePartsOf(m.original, commonWords)).includes(part)))
    .map((m) => m.placeholder));
  return candidates.size === 1 ? [...candidates][0] : null;
}

/**
 * Hides a name's parts ("Hi Sarah" after "Sarah Johnson"), short forms ("USZ" after "Universitätsspital
 * Zürich (USZ)") and values in capitals or title case ("RETO AMMANN") where they would otherwise stay visible.
 * They share the placeholder of the full value, so the model sees the same person, and the answer gets the
 * full value back.
 */
function addRelatedValues(mapping, sourceText, commonWords) {
  const stillVisible = pseudonymize(mapping, sourceText).replace(ALL_PLACEHOLDERS, ' ');
  const isMapped = (value, list) => list.some((m) => m.original === value);
  let result = mapping;
  for (const entry of mapping.filter((m) => m.original)) {
    for (const value of relatedValues(entry, commonWords)) {
      if (isMapped(value, result) || !new RegExp(valuePattern(value), 'u').test(stillVisible)) continue;
      const placeholder = placeholderOfSamePerson(mapping, value, commonWords) ?? (isPersonEntry(entry) ? null : entry.placeholder);
      // A part shared by two people ("Chen" with David and Linda Chen) is hidden under a placeholder of its own.
      result = placeholder ? [...result, { original: value, placeholder }] : addEntry(result, value, 'PERSON', sourceText);
    }
  }
  return result;
}

// A Roman numeral from I to XXXIX, as in "NYHA II", "grade III" or "phase IV": up to three X, then IX, IV or
// an optional V and up to three I; the lookahead (?=.) makes sure it is not empty.
const ROMAN_NUMERAL = /^(?=.)X{0,3}(?:IX|IV|V?I{0,3})$/;

function addDetectedValue(mapping, { text, category }, sourceText, commonWords) {
  const value = text.trim();
  if (isOnlyCommonWords(text, commonWords) || isDiagnosisCode(value) || ROMAN_NUMERAL.test(value)) return mapping;
  const samePerson = category === 'PERSON' && sourceText.includes(value) && !mapping.some((m) => m.original === value)
    ? placeholderOfSamePerson(mapping, value, commonWords)
    : null;
  if (samePerson) return [...mapping, { original: value, placeholder: samePerson }];
  return addEntry(mapping, text, category, sourceText);
}

const containsParts = (name, parts, commonWords) => {
  const nameParts = namePartsOf(name, commonWords);
  return parts.every((part) => nameParts.includes(part));
};

/**
 * The longest detected name of the same person ("Jonathan Andrew Reyes" for "Jonathan Reyes"), or null if
 * there is none or the longer names belong to different people ("David Chen" and "Linda Chen" for "Chen").
 */
function longerFormOf(entity, entities, commonWords) {
  const parts = namePartsOf(entity.text, commonWords);
  if (entity.category !== 'PERSON' || !parts.length) return null;
  const longer = entities
    .filter((e) => e.category === 'PERSON' && namePartsOf(e.text, commonWords).length > parts.length && containsParts(e.text, parts, commonWords))
    .map((e) => e.text);
  if (!longer.length) return null;
  const longest = longer.reduce((a, b) => (namePartsOf(b, commonWords).length > namePartsOf(a, commonWords).length ? b : a));
  const isOnePerson = longer.every((name) => containsParts(longest, namePartsOf(name, commonWords), commonWords));
  return isOnePerson ? longest : null;
}

// A line break with any spaces around it. Detectors sometimes return one value across lines ("Cabinet de la
// Place, 1450 Sainte-Croix\n\nCher Confrère"); each line is a value of its own, also where it stands alone.
const LINE_BREAK = /\s*\n\s*/;
const splitAtLineBreaks = (entities) => entities.flatMap((entity) => entity.text.split(LINE_BREAK).map((text) => ({ ...entity, text })));

/**
 * Values made only of common words, diagnosis codes and Roman numerals are dropped; values across lines are
 * split into lines; a shorter form of a person ("Mr. Chen", "Jonathan Reyes" next to "Jonathan Andrew Reyes")
 * shares the placeholder of the longer one, whichever the detector lists first.
 */
export function addDetected(mapping, detected, sourceText, commonWords) {
  const entities = splitAtLineBreaks(detected);
  const withDetected = entities.reduce((m, entity) => {
    const longer = longerFormOf(entity, entities, commonWords);
    const withLonger = longer ? addDetectedValue(m, { text: longer, category: 'PERSON' }, sourceText, commonWords) : m;
    return addDetectedValue(withLonger, entity, sourceText, commonWords);
  }, mapping);
  return addRelatedValues(withDetected, sourceText, commonWords);
}

// Values are first replaced by markers, one private-use character each (from U+F0000), and only then
// by their placeholders. A marker is not a letter, so it is a word boundary for the short values
// replaced after the long ones ("2026Anna" with "2026" replaced), and no value can match inside it.
const MARKER_BASE = 0xF0000;
// One character of the private-use plane U+F0000 to U+FFFFD.
const MARKER = /[\u{F0000}-\u{FFFFD}]/u;
const ALL_MARKERS = new RegExp(MARKER.source, 'gu');

/** Longest values first ("John Smith" before "John"); inserted placeholders are never replaced again. */
export function pseudonymize(mapping, text) {
  const entries = mapping.filter((m) => m.original).sort((a, b) => b.original.length - a.original.length);
  if (!entries.length) return text;
  if (MARKER.test(text)) throw new Error('The text contains private-use characters (U+F0000 and above) that the app uses internally; remove them first.');

  const withMarkers = entries.map((entry, i) => ({ entry, marker: String.fromCodePoint(MARKER_BASE + i) }));
  const isShort = ({ entry }) => [...entry.original].length < SHORT_VALUE_LENGTH;
  const replaceWithMarkers = (input, list) => {
    if (!list.length) return input;
    const markerOf = new Map(list.map(({ entry, marker }) => [entry.original, marker]));
    const anyValue = new RegExp(list.map(({ entry }) => valuePattern(entry.original)).join('|'), 'gu');
    return input.replace(anyValue, (match) => markerOf.get(match));
  };
  const longReplaced = replaceWithMarkers(text, withMarkers.filter((e) => !isShort(e)));
  const allReplaced = replaceWithMarkers(longReplaced, withMarkers.filter(isShort));
  return allReplaced.replace(ALL_MARKERS, (marker) => entries[marker.codePointAt(0) - MARKER_BASE].placeholder);
}

/** Also accepts placeholders that lost their brackets; reports the ones it doesn't know as unresolved. */
export function restore(mapping, text) {
  if (!mapping.length) return { text, unresolved: [] };
  // A placeholder can stand for a full value and its parts; the answer gets the one listed first.
  const originalOf = new Map();
  for (const m of mapping) if (!originalOf.has(nameOf(m.placeholder))) originalOf.set(nameOf(m.placeholder), m.original);
  const names = [...originalOf.keys()].sort((a, b) => b.length - a.length).map(escapeRegex);
  // A known placeholder name with 0 to 2 brackets on each side ("[[PERSON_1]]", "[PERSON_1]",
  // "PERSON_1"); \b so that PERSON_1 never matches inside PERSON_11 or MYPERSON_1.
  const anyPlaceholder = new RegExp(`\\[{0,2}\\b(${names.join('|')})\\b\\]{0,2}`, 'g');
  const restored = text.replace(anyPlaceholder, (_, name) => originalOf.get(name));
  const unresolved = [...new Set(restored.match(new RegExp(PLACEHOLDER.source, 'g')) || [])];
  return { text: restored, unresolved };
}

export function parseMapping(data) {
  if (!Array.isArray(data) || !data.every((m) => m.original && m.placeholder)) throw new Error('unexpected format');
  return data;
}
