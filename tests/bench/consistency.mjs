// Benchmark-only prototype (alt/detection): tune/detection builds these rules into core/mapping.js.
// Values that follow from values already found in the same document, wherever they stand on their own:
// the initials of a person ("CB", "C.B.", "RMA", "UvG"), the town of an address ("Meilen" after "8706 Meilen")
// and a name written without umlauts or accents ("Luethi" for "Lüthi", "Huerlimann", "Chevalley").

// A run of 2 to 4 initials: a capital, optionally followed by "." and a space or "-", or a lower-case particle
// letter between capitals ("UvG"). Not inside a word. Examples: "CB", "C.B.", "C. B.", "A.S.-M.", "RMA", "UvG".
const INITIALS = /(?<![\p{L}\p{N}])(?:\p{Lu}(?:\.\s?|-|\.-)?(?:\p{Ll}(?:\.\s?)?)?){2,4}(?![\p{L}\p{N}])/gu;
// A name part for initials: a capital letter then letters or apostrophes, or a lower-case particle ("von",
// "de", "di", "van"), each between spaces or hyphens.
const NAME_WORD = /[\p{L}']+/gu;
const PARTICLES = new Set(['von', 'van', 'de', 'di', 'da', 'del', 'della', 'dalla', 'du', 'le', 'la', 'der', 'den', 'zu']);
// Titles and salutations before a name, which are not part of its initials.
const TITLES = new Set(['dr', 'med', 'prof', 'herr', 'frau', 'mr', 'mrs', 'ms', 'mme', 'm', 'me', 'sig', 'sig.ra', 'dott', 'dott.ssa', 'dr.ssa', 'avv', 'lic', 'iur', 'phil', 'dipl', 'ing', 'monsieur', 'madame', 'signor', 'signora']);
// A Swiss, German, French or Italian postal code (4 or 5 digits) and the town after it, up to a comma, a
// line end or "/": "8706 Meilen", "6979 Brè sopra Lugano", "1218 Le Grand-Saconnex".
const POSTAL_CODE_AND_TOWN = /(?<!\d)\d{4,5}\s+(\p{Lu}[\p{L}'.-]*(?:\s+[\p{L}'.-]+){0,3})/u;
const LETTER = /\p{L}/u;
const UPPER = /\p{Lu}/gu;

const REPLACEMENTS = [
  [/ü/g, 'ue'], [/ö/g, 'oe'], [/ä/g, 'ae'], [/Ü/g, 'Ue'], [/Ö/g, 'Oe'], [/Ä/g, 'Ae'], [/ß/g, 'ss'],
];
// Every combining mark (accents after NFD): "é" becomes "e" + mark, so removing marks gives "e".
const COMBINING_MARK = /\p{M}/gu;
const stripAccents = (text) => text.normalize('NFD').replace(COMBINING_MARK, '').normalize('NFC');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function nameWords(name) {
  return (name.match(NAME_WORD) || []).filter((w) => !TITLES.has(w.toLowerCase().replace(/\.$/, '')));
}

/** The initials of a name, particles in lower case: "Ulrich von Gunten" -> "UvG", "Renata Moresi-Antognini" -> "RMA". */
function initialsOf(name) {
  const words = nameWords(name);
  if (words.length < 2) return null;
  return words.map((w) => (PARTICLES.has(w.toLowerCase()) ? w[0].toLowerCase() : w[0].toUpperCase())).join('');
}

const lettersOf = (initials) => [...initials].filter((c) => LETTER.test(c)).join('');

function findInitials(text, people) {
  const signatures = new Set(people.map(initialsOf).filter((s) => s && (s.match(UPPER) || []).length >= 2));
  if (!signatures.size) return [];
  const upperSignatures = new Set([...signatures].map((s) => s.toUpperCase()));
  return [...text.matchAll(INITIALS)].map((m) => m[0].trim()).filter((candidate) => {
    const letters = lettersOf(candidate);
    if ((letters.match(UPPER) || []).length < 2) return false;
    return signatures.has(letters) || upperSignatures.has(letters);
  });
}

function findTowns(text, addresses) {
  const towns = addresses.flatMap((a) => {
    const m = a.match(POSTAL_CODE_AND_TOWN);
    if (!m) return [];
    const town = m[1].trim();
    const first = town.split(/\s+/)[0];
    return first.length >= 3 && first !== town ? [town, first] : [town];
  });
  return towns.filter((town) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(town)}(?![\\p{L}\\p{N}])`, 'u').test(text));
}

function findSpellings(text, people) {
  const words = [...new Set(people.flatMap(nameWords).filter((w) => w.length >= 3))];
  const spellings = words.flatMap((w) => {
    const plain = REPLACEMENTS.reduce((s, [re, to]) => s.replace(re, to), w);
    return [plain, stripAccents(w), stripAccents(plain)].filter((s) => s !== w);
  });
  return [...new Set(spellings)].filter((s) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(s)}`, 'u').test(text));
}

/** detected: [{ text, category }] -> extra [{ text, category }] that appear in text and follow from them. */
export function findConsistentValues(text, detected) {
  const people = detected.filter((e) => e.category === 'PERSON').map((e) => e.text);
  const addresses = detected.filter((e) => e.category === 'ADDRESS').map((e) => e.text);
  return [
    ...findInitials(text, people).map((value) => ({ text: value, category: 'PERSON' })),
    ...findSpellings(text, people).map((value) => ({ text: value, category: 'PERSON' })),
    ...findTowns(text, addresses).map((value) => ({ text: value, category: 'ADDRESS' })),
  ];
}
