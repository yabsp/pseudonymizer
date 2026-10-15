// Any character that is not a digit, removed before the checksum.
const NOT_A_DIGIT = /\D/g;

// The Luhn checksum that every payment card number passes, so other long numbers aren't taken for cards.
function passesLuhn(candidate) {
  const digits = candidate.replace(NOT_A_DIGIT, '');
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
    sum += digit;
  }
  return sum % 10 === 0;
}

// An IBAN's letters, each counted as two digits for the checksum ("A" = 10, "Z" = 35).
const IBAN_LETTER = /[A-Z]/g;
// Any space, removed before the checksum.
const SPACES = / /g;

// The ISO 13616 checksum: with the first four characters moved to the end and letters as numbers, the IBAN
// leaves remainder 1 when divided by 97. Computed piece by piece, as the number is too long for a double.
function passesIbanChecksum(candidate) {
  const compact = candidate.replace(SPACES, '');
  const digits = (compact.slice(4) + compact.slice(0, 4)).replace(IBAN_LETTER, (letter) => String(letter.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}

// Exactly a year-month-day date ("2026-10-14").
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isNotIsoDate = (candidate) => !ISO_DATE.test(candidate);

const NINE_DIGITS = 9;
const hasNineDigits = (candidate) => candidate.replace(NOT_A_DIGIT, '').length >= NINE_DIGITS;

// Each pattern finds values of one category; isValid (optional) confirms a match. Patterns listed earlier
// win when two find the same text, so the more specific ones come first.
export const PATTERNS = [
  // EMAIL: a local part of letters, digits, "_", ".", "+" or "-", then "@", a domain label of letters,
  // digits, "_" or "-", and one or more ".label" parts ("anna.meier@example.co.uk").
  { category: 'EMAIL', re: /[\w.+-]+@[\w-]+(\.[\w-]+)+/g },
  // URL: "http://" or "https://", then everything up to whitespace, a quote, "<", ">" or ")".
  { category: 'URL', re: /https?:\/\/[^\s"'<>)]+/g },
  // IP: four groups of 1 to 3 digits separated by dots, not inside a longer number (\b at both ends).
  { category: 'IP', re: /\b\d{1,3}(\.\d{1,3}){3}\b/g },
  // IPv6: groups of 1 to 4 hex digits separated by ":", either all 8 groups ("2001:0db8:…:7334") or shortened
  // with "::" and at least one group ("fe80::1c2b:3aff", "::1"). Not inside a word or a longer colon
  // sequence ((?<![\w:]) and (?![\w:])), so times like "17:45:30" and code like "std::string" stay.
  { category: 'IP', re: /(?<![\w:])(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6}::(?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6})?|::[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6})(?![\w:])/g },
  // MAC address: 6 pairs of hex digits, all separated by ":" or all by "-" (\1 repeats the first separator):
  // "00:1A:2B:3C:4D:5E", "00-1A-2B-3C-4D-5E".
  { category: 'MAC', re: /\b[0-9A-Fa-f]{2}([:-])[0-9A-Fa-f]{2}(?:\1[0-9A-Fa-f]{2}){4}\b/g },
  // AHV: Swiss social security number "756" + 4 + 4 + 2 digits, each group optionally preceded by a dot
  // or a space ("756.1234.5678.97", "756 1234 5678 97", "7561234567897"). Before CARD and PHONE, which
  // would otherwise claim the spaced forms.
  { category: 'ID', re: /\b756[. ]?\d{4}[. ]?\d{4}[. ]?\d{2}\b/g },
  // BIC/SWIFT code, only right after "BIC" or "SWIFT", optionally followed by "Code" / "-Code", and up to
  // 15 characters such as ": " or "/" (lookbehind (?<=...), so other upper-case words are never caught):
  // 4 letters for the bank, 2 for the country, 2 letters or digits for the place, optionally 3 for the
  // branch ("ZKBKCHZZ80A", "UBSWCHZH", "SWIFT-Code: POFICHBEXXX").
  { category: 'ID', re: /(?<=\b(?:BIC|SWIFT)(?:[- ]?Code)?\b[^\n\p{L}\p{N}]{0,15})[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/gu },
  // CARD: 13 to 19 digits, each optionally preceded by one space or "-" ("4111 1111 1111 1111"), not inside a
  // longer number (\b); only kept if it passes the Luhn checksum. Before PHONE, which would claim it.
  { category: 'CARD', re: /\b\d(?:[ -]?\d){12,18}\b/g, isValid: passesLuhn },
  // CARD without the checksum, when a word for a card stands before it on the same line: "card", "Karte"
  // (also "Kreditkarte"), "carte" or "carta", then up to 30 characters that are no digit or line break ("card
  // number I used was "), then the same 13 to 19 digits as above. Test and made-up numbers often fail the checksum.
  { category: 'CARD', re: /(?<=(?:\bcard|kart[ea]|\bcarte|\bcarta)\b[^\n\d]{0,30})\b\d(?:[ -]?\d){12,18}\b/giu },
  // The last digits of a card or account: 4 digits right after "ending in", "ends in", "ending with",
  // "last 4", "last four (digits)", "endend auf/mit", "Endziffern", "se terminant par", "terminant par" or
  // "che termina con", and up to 6 characters such as ": " (lookbehind); not part of a longer number.
  { category: 'CARD', re: /(?<=\b(?:ending in|ends in|ending with|last (?:4|four)(?: digits)?|endend (?:auf|mit)|Endziffern|se terminant par|terminant par|che termina con)[^\n\p{L}\p{N}]{0,6})\d{4}\b/giu },
  // Card security code: 3 or 4 digits, only right after "CVV", "CVC", "CSC", "CID" (optionally with a "2"),
  // "security code", "Sicherheitscode" or "Prüfnummer", and up to 15 characters such as ": " (lookbehind).
  { category: 'SECRET', re: /(?<=\b(?:CVV2?|CVC2?|CSC|CID|security code|Sicherheitscode|Kartenprüfnummer|Prüfnummer)[^\n\p{L}\p{N}]{0,15})\d{3,4}\b/giu },
  // Username: only right after a messenger or account name and ":" ("Skype: Mike_Aber_Tech",
  // "Username: dchen_88"), then an optional "@" and at least 3 letters, digits, "_", "." or "-".
  { category: 'USERNAME', re: /(?<=\b(?:Skype|Teams|Slack|Telegram|Signal|Threema|WhatsApp|Discord|GitHub|GitLab|Twitter|Instagram|LinkedIn|Username|User name|User ID|Benutzername|Login|Handle)[ \t]*:[ \t]*)@?[\w.-]{3,}/giu },
  // TIMESTAMP: an ISO date, "T" or a space, hours and minutes, optionally seconds with a fraction, and an
  // optional time zone "Z" or "+02:00" ("2026-10-14T08:14:00Z", "2026-10-14 08:14"); not followed by more
  // digits or ":". Before DATE, so the time is replaced with the date.
  { category: 'TIMESTAMP', re: /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?(?![\d:])/g },
  // DATE: day, month and year separated by "/" ("03/22/1990", "1/4/26"), or year-month-day ("2026-10-14",
  // but not when a time follows, which TIMESTAMP takes); \b so that they are not part of a longer number.
  // Before PHONE, which would otherwise claim them. Dates with dots ("02.09.2026") are left alone, as before.
  { category: 'DATE', re: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}(?![\d-]|[T ]\d{2}:)/g },
  // Card expiry date: month "/" year with 2 or 4 digits ("12/28", "03/2029"), only right after "exp",
  // "expiry", "expiration", "expires", "valid until", "gültig bis", "Ablaufdatum", "échéance" or "scadenza"
  // and up to 6 characters such as ": " (lookbehind); not followed by another "/" or digit, so a full date
  // is left to DATE.
  { category: 'DATE', re: /(?<=\b(?:exp|expiry|expiration|expires|valid until|gültig bis|Ablaufdatum|Ablauf|échéance|scadenza)\b[^\n\p{L}\p{N}]{0,6})\d{1,2}\/(?:\d{4}|\d{2})(?![\/\d])/giu },
  // An ID right after a word that announces one, in German, French, Italian or English: "ID", "No", "Nr",
  // "Number", "Nummer" (also at the end of a word, "Seriennummer"), "Ref", "Dossier", "Ticket", "Case",
  // "Incident", "Claim", "Code", "Group", "Member", "Policy", "VIN", "DL", "License", "Account", "Identifier",
  // "NPI" and others,
  // or "#". Then up to 6 characters that are no letter or digit (": ", " # ", "."), optionally "is", "ist",
  // "est", "è" or "lautet" and a space ("code is REF-1"). The ID itself: letters or digits, possibly joined
  // by ".", "/" or "-" ("4471", "2026/LT/0457", "123.456.789-0", "XYZ123456789"), with at least one digit
  // (lookahead (?=...)), so "Ticket: open" stays. A full stop or comma after it is not part of it.
  { category: 'ID', re: /(?<=(?:\b(?:ID|No|Nr|Nº|n°|Number|Numéro|Numero|Nummer|Ref|Réf|Referenz|Référence|Riferimento|Dossier|Aktenzeichen|Ticket|Case|Incident|Claim|Code|Group|Member|Policy|Police|Polizza|VIN|DL|License|Licence|Permis|Account|Konto|Identifier|NPI)|\p{Ll}(?:nummer|nr))\b[^\n\p{L}\p{N}]{0,6}(?:(?:is|ist|est|è|lautet)[ \t]+)?|#[ \t]*)(?=[\p{L}\p{N}./-]*\p{N})[\p{L}\p{N}]+(?:[./-][\p{L}\p{N}]+)*/giu },
  // A reference code: 2 or more capital letters, optionally more parts of capitals or digits, then a "-" and
  // a part of at least 4 digits, then optionally more such parts ("INC-20419", "CONF-2026-X8891",
  // "HC-2026-001942", "REF-99482-XYZ"); \b at both ends. Short codes such as "ICD-10" stay.
  { category: 'ID', re: /\b[A-Z]{2,}(?:-[A-Z0-9]+)*-\d{4,}(?:-[A-Z0-9]+)*\b/g },
  // IBAN: 2 capital letters for the country, 2 check digits, then 3 to 7 groups of 4 capitals or digits,
  // each optionally after one space, and an optional last group of 1 to 3 ("CH93 0076 2011 6238 5295 7",
  // "DE89370400440532013000"); only kept if the checksum is right.
  { category: 'ID', re: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, isValid: passesIbanChecksum },
  // US street address: a house number, 1 to 4 words starting with a capital or digit ("West 4th"), a street
  // type ("Avenue", "St", "Drive"...), an optional ".", and optionally ", Suite 200" or ", Apt 3B"
  // ("492 West 4th Avenue, Suite 200", "1847 Maple Grove Drive, Apt 3B").
  { category: 'ADDRESS', re: /\b\d{1,6}(?: [A-Z0-9][\w'.-]*){1,4} (?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Parkway|Pkwy|Terrace|Circle)\b\.?(?:, (?:Suite|Ste|Apt|Apartment|Unit|Floor|Fl)\.? ?[\w-]+)?/g },
  // US city, state and ZIP code: 1 to 3 capitalized words, ", ", 2 capitals and 5 digits, optionally "-" and
  // 4 more ("New York, NY 10012", "Portland, OR 97205-1234").
  { category: 'ADDRESS', re: /\b[A-Z][a-z]+(?: [A-Z][a-z]+){0,2}, [A-Z]{2} \d{5}(?:-\d{4})?\b/g },
  // German or Swiss street: a word starting with a capital and ending in "strasse", "straße", "gasse",
  // "weg", "platz" or "allee", a space and a house number with an optional letter ("Rebgasse 21",
  // "Lindenhofweg 3", "Technikumstrasse 88a").
  { category: 'ADDRESS', re: /\b\p{Lu}[\p{L}-]*(?:strasse|straße|gasse|weg|platz|allee) \d{1,4}[a-z]?\b/gu },
  // French or Italian street: "Rue", "Avenue", "Chemin", "Route", "Place", "Boulevard", "Quai", "Via",
  // "Viale", "Piazza", "Corso" or "Vicolo", 1 to 4 words (letters, "'" or "-"), and a house number
  // ("Rue du Rhône 42", "Place Pury 4", "Via ai Grotti 9").
  { category: 'ADDRESS', re: /\b(?:Rue|Avenue|Chemin|Route|Place|Boulevard|Quai|Via|Viale|Piazza|Corso|Vicolo)(?: [\p{L}'-]+){1,4} \d{1,4}[a-z]?\b/gu },
  // PHONE, not right after a letter, digit, "+", "(", ".", "/" or "-" (lookbehind), so it never starts
  // inside another number. An optional prefix: a country code ("+41 ", "+1-") with an optional "(0)", or an
  // area code in brackets ("(503) "). Then a digit, at least 6 characters that are digits, spaces, "/" or
  // "-", and a final digit ("+41 (0)44 555 01 23", "079 555 01 23", "044/555 01 23", "(503) 555-0142"),
  // not directly followed by a letter, digit or ":", and never a year-month-day date ("2026-10-14 08:14").
  { category: 'PHONE', re: /(?<![\p{L}\p{N}+(.\/-])(?:\+\d{1,3}[ -]?(?:\(0\)[ -]?)?|\(\d{2,4}\)[ -]?)?\d[\d \/-]{6,}\d(?![\p{L}\p{N}:])/gu, isValid: isNotIsoDate },
  // PHONE with dots: 3 to 5 groups of 2 to 4 digits separated by "." ("415.555.8822", "044.555.22.33"),
  // not inside a longer number or word; kept only with at least 9 digits, so dates ("02.09.2026") stay.
  { category: 'PHONE', re: /(?<![\p{L}\p{N}.])\+?\d{2,4}(?:\.\d{2,4}){2,4}(?![\p{L}\p{N}]|\.\d)/gu, isValid: hasNineDigits },
];

export function detectWithPatterns(text) {
  const found = PATTERNS.flatMap(({ category, re, isValid }) => [...text.matchAll(re)]
    .map((m) => m[0])
    .filter((value) => !isValid || isValid(value))
    .map((value) => ({ text: value, category })));
  return found.filter((e, i) => found.findIndex((other) => other.text === e.text) === i);
}
