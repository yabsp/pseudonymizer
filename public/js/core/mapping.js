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

// Characters that PDFs and editors put inside words without showing them: soft hyphen, zero-width space, word
// joiner and byte order mark. "Am­mann" reads as "Ammann" to everyone, so it must be hidden as "Ammann".
const INVISIBLE = /[­​⁠﻿]/g;

/**
 * The form in which the app reads every text and value: Unicode NFC, so "Müller" written with a combining
 * umlaut (from PDFs or macOS) is the same as "Müller" typed, and without invisible characters.
 */
export const normalizeText = (text) => text.normalize('NFC').replace(INVISIBLE, '');

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

// One or more whitespace characters, any of them, also line breaks.
const WHITESPACE_RUNS = /\s+/gu;
const HAS_WHITESPACE = /\s/u;

/** One character in either case ("[mM]"), if it has exactly one other case form. */
function anyCase(char) {
  const [lower, upper] = [char.toLowerCase(), char.toUpperCase()];
  if (lower === upper || [...lower].length !== 1 || [...upper].length !== 1) return escapeRegex(char);
  return `[${lower}${upper}]`;
}

// A hyphen and the whitespace after it; the hyphen's pattern allows that whitespace anyway, so a value written
// "TA- 2601178" (wrapped in a PDF table cell) also matches "TA-2601178" elsewhere.
const HYPHEN_AND_SPACES = /-\s+/gu;

/** The value's characters: spaces as any whitespace, a hyphen with an optional line break after it ("Ammann-\nKeller"). */
function charactersPattern(value, ignoreCase) {
  const charPattern = (char) => (char === '-' ? '-\\s*' : ignoreCase ? anyCase(char) : escapeRegex(char));
  return value.replace(HYPHEN_AND_SPACES, '-').split(WHITESPACE_RUNS).map((word) => [...word].map(charPattern).join('')).join('\\s+');
}

/**
 * Regex source (u flag) that matches the value where it should be replaced. A value of several words matches in
 * any case and across line breaks ("RETO AMMANN", "Reto\nAmmann" for "Reto Ammann"): written that way, it is still
 * the name. A single word keeps its case, as the name "Weiss" is also the word "weiss"; its capitals and title
 * case are added as related values (addDetected).
 */
export function valuePattern(original) {
  const value = normalizeText(original).trim();
  const escaped = charactersPattern(value, HAS_WHITESPACE.test(value));
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
  let value = normalizeText(original || '').trim();
  if (value.length < 2) return mapping;
  const source = sourceText === undefined ? undefined : normalizeText(sourceText);
  if (source !== undefined && !source.includes(value)) {
    const inText = source.match(new RegExp(escapeRegex(value), 'iu'));
    if (!inText) return mapping;
    value = inText[0];
  }
  if (mapping.some((m) => m.original === value)) return mapping;

  const name = (category || 'OTHER').toUpperCase().replace(NOT_PLACEHOLDER_CHARS, '_') || 'OTHER';
  // A placeholder that is already in the text (an earlier answer pasted back) is skipped, so restoring keeps it.
  const isTaken = (placeholder) => mapping.some((m) => m.placeholder === placeholder) || !!source?.includes(placeholder);
  let n = 1;
  while (isTaken(`[[${name}_${n}]]`)) n++;
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

// German umlauts and "ß" as they are written without them ("Lüthi" as "Luethi" in an e-mail or a file name).
const UMLAUT_SPELLINGS = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss' };
const UMLAUTS = /[äöüÄÖÜß]/g;
// Accents and other combining marks, once a text is split into letters and marks (NFD).
const COMBINING_MARKS = /\p{M}/gu;

/** The value written without umlauts and accents, as keyboards and systems without them do ("Luethi", "Luthi", "Gerard" for "Gérard"). */
function spellingVariants(value) {
  const variants = [value.replace(UMLAUTS, (char) => UMLAUT_SPELLINGS[char]), value.normalize('NFD').replace(COMBINING_MARKS, '').normalize('NFC')];
  return [...new Set(variants)].filter((variant) => variant !== value);
}

// The small words inside names that keep their lower case in initials ("JvdM" for "Jan van der Merwe").
const NAME_PARTICLES = new Set(['van', 'von', 'der', 'den', 'de', 'du', 'des', 'di', 'da', 'del', 'della', 'dalla', 'le', 'la', 'zu', 'zur', 'vom']);
const firstLetter = (word) => [...word][0];

/**
 * The initials of a person, as minutes, file names and signatures write them: of the whole name and of each
 * combination of two or more of its parts, without dots ("CB", "RMA"), with dots ("C.B.", "A.S.-M.") and
 * with dots and spaces ("C. B."), and with the lower-case small words of the name ("JvdM").
 */
function initialsOf(entry, commonWords) {
  const parts = wholeNamePartsOf(entry.original, commonWords);
  if (parts.length < 2) return [];
  const forms = partCombinations(parts).flatMap((combination) => {
    const letters = combination.split(' ').map((part) => part.split('-').filter(Boolean).map(firstLetter));
    const dotted = letters.map((names) => names.map((letter) => letter + '.').join('-'));
    return [letters.flat().join(''), dotted.join(''), dotted.join(' ')];
  });
  const words = entry.original.split(WHITESPACE_RUNS).filter((word) => NAME_PARTICLES.has(word) || parts.includes(word));
  if (words.some((word) => NAME_PARTICLES.has(word))) forms.push(words.map(firstLetter).join(''));
  return [...new Set(forms)].filter((form) => !commonWords.has(form.replaceAll('.', '').toLowerCase()) && !ROMAN_NUMERAL.test(form.replaceAll('.', '')));
}

// A Swiss, German, French or Italian postal code and town inside an address ("8706 Meilen" in "Seestrasse 3,
// 8706 Meilen", "CH-6900 Lugano"): not right after a letter or digit, optionally a country letter and "-",
// 4 or 5 digits, a space, then the town (group 1): words starting with a capital, up to "," or the end.
const POSTAL_CODE_AND_TOWN = /(?<![\p{L}\p{N}])(?:[A-Z]{1,2}-)?\d{4,5} (\p{Lu}[\p{L}'.\/ -]*\p{L})(?=\s*(?:,|$))/gu;
const ADDRESS_PLACEHOLDER_NAME = /^(?:ADDRESS|LOCATION)_\d+$/;

/** The town of an address, which documents also name alone ("Meilen" after "Seestrasse 3, 8706 Meilen"). */
function townsOf(entry, commonWords) {
  if (!ADDRESS_PLACEHOLDER_NAME.test(nameOf(entry.placeholder))) return [];
  return [...entry.original.matchAll(POSTAL_CODE_AND_TOWN)].map((m) => m[1]).filter((town) => !isOnlyCommonWords(town, commonWords) && !commonWords.has(town.toLowerCase()));
}

/**
 * The values to hide along with an entry, each with how it is placed: "same" shares the placeholder of the
 * entry (or of the one person whose name it is a part of, see addRelatedValues), "initials" the placeholder of
 * the person they stand for, "own" gets a placeholder of its own (a town is not the whole address).
 */
function relatedValues(entry, commonWords) {
  const shortForms = [...entry.original.matchAll(SHORT_FORM_IN_BRACKETS)].map((m) => m[1]);
  const combinations = isPersonEntry(entry)
    ? [...new Set(nameVariants(wholeNamePartsOf(entry.original, commonWords), commonWords).flatMap(partCombinations))].sort((a, b) => b.length - a.length)
    : [];
  const parts = isPersonEntry(entry) ? namePartsOf(entry.original, commonWords) : [];
  // Combinations first, so "Jonathan Reyes" becomes one placeholder, not "[[PERSON_1]] [[PERSON_1]]".
  const values = [...combinations, ...parts, ...shortForms];
  // Each value as written and without umlauts and accents; a spelling variant counts as the person of the value
  // it comes from ("Luethi" is the "Lüthi" of the mapping).
  const spelled = [entry.original, ...values].flatMap((value) => [{ value, basis: value }, ...spellingVariants(value).map((variant) => ({ value: variant, basis: value }))]);
  const withCases = spelled.flatMap(({ value, basis }) => [{ value, basis }, ...caseVariants(value).map((variant) => ({ value: variant, basis: value === basis ? variant : basis }))]);
  const related = [
    ...withCases.map(({ value, basis }) => ({ value, basis, placement: 'same' })),
    ...(isPersonEntry(entry) ? initialsOf(entry, commonWords) : []).map((value) => ({ value, placement: 'initials' })),
    ...townsOf(entry, commonWords).flatMap((town) => [town, ...spellingVariants(town), ...caseVariants(town)]).map((value) => ({ value, placement: 'own' })),
  ];
  return related.filter(({ value }, i) => value !== entry.original && related.findIndex((other) => other.value === value) === i);
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
  const entries = mapping.filter((m) => m.original);
  // Initials that two people share ("MK" for Maria Keller and Markus Kunz) get a placeholder of their own.
  const initialsOwners = new Map();
  for (const entry of entries.filter(isPersonEntry)) {
    for (const initials of initialsOf(entry, commonWords)) initialsOwners.set(initials, new Set([...(initialsOwners.get(initials) ?? []), entry.placeholder]));
  }
  let result = mapping;
  for (const entry of entries) {
    for (const { value, basis, placement } of relatedValues(entry, commonWords)) {
      if (isMapped(value, result) || !new RegExp(valuePattern(value), 'u').test(stillVisible)) continue;
      let placeholder = null;
      if (placement === 'initials') placeholder = initialsOwners.get(value).size === 1 ? entry.placeholder : null;
      else if (placement === 'same') placeholder = placeholderOfSamePerson(mapping, basis, commonWords) ?? (isPersonEntry(entry) ? null : entry.placeholder);
      // A part shared by two people ("Chen" with David and Linda Chen) is hidden under a placeholder of its own.
      const category = placement === 'own' ? categoryOfName(nameOf(entry.placeholder)) : 'PERSON';
      result = placeholder ? [...result, { original: value, placeholder }] : addEntry(result, value, category, sourceText);
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
export function addDetected(mapping, detected, text, commonWords) {
  const sourceText = normalizeText(text);
  const entities = splitAtLineBreaks(detected.map((entity) => ({ ...entity, text: normalizeText(entity.text) })));
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
export function pseudonymize(mapping, original) {
  const text = normalizeText(original);
  const entries = mapping.filter((m) => m.original && m.original.trim()).sort((a, b) => b.original.length - a.original.length);
  if (!entries.length) return text;
  if (MARKER.test(text)) throw new Error('The text contains private-use characters (U+F0000 and above) that the app uses internally; remove them first.');

  const withMarkers = entries.map((entry, i) => ({ entry, marker: String.fromCodePoint(MARKER_BASE + i) }));
  const isShort = ({ entry }) => [...entry.original].length < SHORT_VALUE_LENGTH;
  const replaceWithMarkers = (input, list) => {
    if (!list.length) return input;
    // One group per value, so a match in another case or across lines still tells which value it is.
    const anyValue = new RegExp(list.map(({ entry }) => `(${valuePattern(entry.original)})`).join('|'), 'gu');
    return input.replace(anyValue, (...groups) => list[groups.slice(1, list.length + 1).findIndex((group) => group !== undefined)].marker);
  };
  const longReplaced = replaceWithMarkers(text, withMarkers.filter((e) => !isShort(e)));
  const allReplaced = replaceWithMarkers(longReplaced, withMarkers.filter(isShort));
  return allReplaced.replace(ALL_MARKERS, (marker) => entries[marker.codePointAt(0) - MARKER_BASE].placeholder);
}

/** Also accepts placeholders that lost their brackets; reports the ones it doesn't know as unresolved. */
// Anything in an answer that looks like a placeholder, known or not: a category of letters, digits and "_" and
// "_<number>", in any case, either in 1 or 2 square brackets ("[[PERSON_9]]", "[person_9]") or bare and in
// capitals ("PERSON_9", group 1 is its category), not inside a longer word (\b).
const PLACEHOLDER_LIKE = /\[{1,2}[A-Za-z][A-Za-z0-9_]*_\d+\]{1,2}|\b([A-Z][A-Z0-9_]*?)_\d+\b/g;
// The name inside a placeholder-like token: without its brackets, in capitals.
const BRACKETS = /[[\]]/g;
// The number at the end of a placeholder name: "_" and digits ("_9" in "PERSON_9").
const NUMBER_SUFFIX = /_\d+$/;
const categoryOfName = (name) => name.replace(NUMBER_SUFFIX, '');

/**
 * Also accepts placeholders that lost their brackets or their capitals; reports the ones it doesn't know as
 * unresolved: in brackets always, bare ("PERSON_9") when the mapping uses its category.
 */
export function restore(mapping, text) {
  // A placeholder can stand for a full value and its parts; the answer gets the one listed first.
  const originalOf = new Map();
  for (const m of mapping) if (!originalOf.has(nameOf(m.placeholder))) originalOf.set(nameOf(m.placeholder), m.original);
  const categories = new Set([...originalOf.keys()].map(categoryOfName));
  const unresolved = [...new Set([...text.matchAll(PLACEHOLDER_LIKE)]
    .filter(([token, bareCategory]) => !originalOf.has(token.replace(BRACKETS, '').toUpperCase()) && (!bareCategory || categories.has(bareCategory)))
    .map(([token]) => token))];
  if (!originalOf.size) return { text, unresolved };
  const names = [...originalOf.keys()].sort((a, b) => b.length - a.length).map(escapeRegex);
  // A known placeholder name in any case with 0 to 2 brackets on each side ("[[PERSON_1]]", "[PERSON_1]",
  // "PERSON_1", "[[person_1]]"); \b so that PERSON_1 never matches inside PERSON_11 or MYPERSON_1.
  const anyPlaceholder = new RegExp(`\\[{0,2}\\b(${names.join('|')})\\b\\]{0,2}`, 'gi');
  return { text: text.replace(anyPlaceholder, (_, name) => originalOf.get(name.toUpperCase())), unresolved };
}

// A whole placeholder as the app writes it, nothing before or after it.
const WHOLE_PLACEHOLDER = new RegExp(`^${PLACEHOLDER.source}$`);

export function parseMapping(data) {
  const isEntry = (m) => typeof m?.original === 'string' && m.original.trim() && typeof m.placeholder === 'string' && WHOLE_PLACEHOLDER.test(m.placeholder);
  if (!Array.isArray(data) || !data.every(isEntry)) throw new Error('unexpected format');
  return data;
}
