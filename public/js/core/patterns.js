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
// Two numbers of up to 5 digits with " - " or " / " between them: a range of reference values ("135 - 145")
// or a week of a year ("KW 46 / 2026").
const NUMBER_RANGE = /^\d{1,5} [-\/] \d{1,5}$/;
// Two years from 1900 to 2099 joined by "-" or "/", as in a plan or a period ("2025-2028", "2019/2020").
const YEAR_RANGE = /^(?:19|20)\d{2}[-\/](?:19|20)\d{2}$/;
const isPhoneNumber = (candidate) => isNotIsoDate(candidate) && !NUMBER_RANGE.test(candidate) && !YEAR_RANGE.test(candidate);

// Letters before a case number with spaces are capitals ("ZK 26 318"); "for 2026" in "claim for 2026" is no ID.
const CAPITALS_BEFORE_SPACE = /^\p{Lu}{1,4} /u;
// An ICD-10 diagnosis code, optionally after "ICD-10" or "ICD" and an optional ":" and space: a capital letter
// (not U), 2 digits, optionally "." and 1 to 4 more ("M54.5", "F41.1", "ICD-10 F00.1"). Diagnoses don't
// identify anyone, and the question is often about them.
const DIAGNOSIS_CODE = /^(?:ICD(?:-10)?:? ?)?[A-TV-Z]\d{2}(?:\.\d{1,4})?$/;
export const isDiagnosisCode = (value) => DIAGNOSIS_CODE.test(value);
const isIdAfterLabel = (candidate) => (!candidate.includes(' ') || CAPITALS_BEFORE_SPACE.test(candidate)) && !isDiagnosisCode(candidate);

// A password-like value: a character that is not a letter, or a capital after the first character ("kL9#",
// "Kaelin2026!", "MySecret"); ordinary words ("wrong", "Falsch") have neither.
const PASSWORD_LIKE = /[^\p{L}]|.\p{Lu}/u;
const looksLikePassword = (candidate) => PASSWORD_LIKE.test(candidate);

// A title or form of address, optionally with a full stop ("Herr", "Dr.", "Mme").
const TITLE = /^(?:Herr|Herrn|Frau|Mr|Mrs|Ms|Miss|Dr|Prof|Monsieur|Madame|Mme|Mlle|Me|Signor|Signora|Sig|Avv|Dott)\.?$/;
// Two letters in a row, so an initial ("H.") is not a name on its own.
const TWO_LETTERS = /\p{L}{2}/u;
const isMoreThanTitles = (candidate) => candidate.split(' ').some((word) => !TITLE.test(word) && TWO_LETTERS.test(word));

const NINE_DIGITS = 9;
const hasNineDigits = (candidate) => candidate.replace(NOT_A_DIGIT, '').length >= NINE_DIGITS;

// Each pattern finds values of one category; isValid (optional) confirms a match. Patterns listed earlier
// win when two find the same text, so the more specific ones come first.
export const PATTERNS = [
  // EMAIL: a local part of letters, digits, "_", ".", "+" or "-", then "@", a domain label of letters,
  // digits, "_" or "-", and one or more ".label" parts ("anna.meier@example.co.uk").
  { category: 'EMAIL', re: /[\w.+-]+@[\w-]+(\.[\w-]+)+/g },
  // URL: a scheme ("https", "ftp", "postgresql", "mongodb+srv": a letter, then letters, digits, "+", "." or
  // "-") and "://", then everything up to whitespace, a quote, "<", ">" or ")", but not ending in ".", ",",
  // ";", ":", "!" or "?", which end the sentence. Connection strings such as
  // "postgresql://user:password@host:5432/db" are hidden as a whole, with the password in them.
  { category: 'URL', re: /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s"'<>)]*[^\s"'<>).,;:!?]/g },
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
  // A masked card number: 4 to 6 digits, one or more groups of 4 or more "*", "x", "X" or "•" (each optionally
  // after a space or "-"), and 4 digits ("4111********1111", "411111xxxxxx1111", "4111 **** **** 1111");
  // \b at both ends.
  { category: 'CARD', re: /\b\d{4,6}(?:[ -]?[*xX•]{4,})+[ -]?\d{4}\b/g },
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
  // Username as the name of a home folder in a file path: right after "C:\Users\" (any drive letter),
  // "/home/" or "/Users/" (lookbehind), everything up to the next "\", "/", whitespace or quote
  // ("C:\Users\mkeller\Documents", "/home/anna.meier/.ssh").
  { category: 'USERNAME', re: /(?<=\b[A-Za-z]:\\Users\\|\/home\/|\/Users\/)[^\\\/\s"']+/g },
  // Username in a log line or URL: right after "user=", "owner=", "uid=", "login=", "username=", "author=",
  // "assignee=" or "account=" (lookbehind; \b, so "superuser=" is not one), then at least 3 letters, digits,
  // "_", "." or "-" ("user=kschneider", "?owner=petra.vogel").
  { category: 'USERNAME', re: /(?<=\b(?:user|username|owner|uid|login|author|assignee|account)=)[\w.-]{3,}/giu },
  // Access keys and tokens in the formats of well-known services, wherever they stand: Stripe ("sk_live_",
  // "pk_test_", "rk_live_" and 10 or more letters or digits), OpenAI and Anthropic ("sk-", optionally "proj-"
  // or "ant-", then 16 or more letters, digits, "_" or "-"), GitHub ("ghp_", "gho_", "ghu_", "ghs_", "ghr_" or
  // "github_pat_" and 20 or more), GitLab ("glpat-" and 20 or more), Slack ("xoxb-", "xoxp-"... and 10 or
  // more), AWS access key IDs ("AKIA" or "ASIA" and 16 capitals or digits), Google API keys ("AIza" and 35)
  // and JSON Web Tokens ("eyJ" and three parts of 10 or more joined by "."); \b at the start.
  { category: 'SECRET', re: /\b(?:[spr]k_(?:live|test)_[A-Za-z0-9]{10,}|sk-(?:proj-|ant-)?[\w-]{16,}|gh[opusr]_[A-Za-z0-9]{20,}|github_pat_\w{20,}|glpat-[\w-]{20,}|xox[abpors]-[\w-]{10,}|A(?:KIA|SIA)[0-9A-Z]{16}|AIza[\w-]{35}|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,})/g },
  // A token after "Bearer " in an HTTP header: 16 or more letters, digits, "-", ".", "_", "~", "+" or "/",
  // optionally ending in "=" ("Authorization: Bearer 9f8e7d6c5b4a3928...").
  { category: 'SECRET', re: /(?<=\bBearer )[\w.~+\/-]{16,}=*/g },
  // A password, key or token after its name and ":" or "=", as in config files, logs and code
  // ("password: kL9#vB2!mQ", "DB_PASSWORD=x", "aws_secret_access_key: wJalr...", "sid=9f8e...", JSON
  // "\"token\": \"abc\""). The name: one of the words below, optionally with more of the name before or after
  // it joined by "_", "." or "-" ("smtp.password", "secret_access_key"), but not inside a longer word
  // ((?<![\w.-]) at its start), so "Secretary:" stays. Then an optional quote, ":" or "=" with optional spaces
  // and quote. The value: 4 or more characters that are no space, quote, "<", ">", ",", ";" or "&".
  { category: 'SECRET', re: /(?<=(?<![\w.-])(?:[\w.-]*[_.-])?(?:password|passwd|passwort|kennwort|pwd|passphrase|mot de passe|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|sid|session[_-]?id)(?:[_.-][\w.-]*)?["']?[ \t]*[:=][ \t]*["']?)[^\s"'<>,;&]{4,}/giu },
  // A password named in a sentence: "password", "Passwort", "Kennwort" or "mot de passe", a space, "is",
  // "ist", "lautet", "est" or "è", a space, then the password up to the next space, without a full stop,
  // comma, ";" or ":" at its end ("das Passwort ist Kaelin2026!"). Only kept if it has a digit, a sign or a
  // capital after its first letter, so "the password is wrong" stays.
  { category: 'SECRET', re: /(?<=\b(?:password|passwort|kennwort|mot de passe)[ \t]+(?:is|ist|lautet|est|è)[ \t]+)[^\s"'<>]*[^\s"'<>.,;:]/giu, isValid: looksLikePassword },
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
  // An ID right after a word that announces one (lookbehind), in German, French, Italian or English:
  // - a word: "ID", "No", "Nr", "Number", "Nummer" (also at the end of a word, "Seriennummer"), "Ref",
  //   "Dossier", "Akte", "Ticket", "Case", "Incident", "Claim", "Code", "Group", "Member", "Policy", "VIN",
  //   "DL" (not after "/", so the unit "g/dL" stays), "License", "Account", "Identifier", "NPI", "Patient",
  //   "paziente" and others, or "_id", "_no", "_nr" or "_number" at the end of a key in code
  //   ("client_id=88213"); then up to 6 characters that are no letter or digit (": ", " # ", "."), and
  //   optionally "is", "ist", "est", "è" or "lautet" and a space ("code is REF-1");
  // - or "#", "N.", "N°" or "Nº" and optional spaces ("Fattura N. 2026/0458", "permis B n° 1234567").
  // The ID itself, either
  // - 1 to 4 letters and groups of 2 or more digits after single spaces, as courts write case numbers
  //   ("ZK 26 318"; kept only if the letters are capitals), but not a label itself ((?!...), so
  //   "Patient-ID 7781" gives "7781"), and not followed by ".", "/" or "-" and a digit (so "N° AVS
  //   756.9012.3456.78" is left to the AHV number), or
  // - letters or digits, possibly joined by ".", "/", "_" or "-" ("4471", "2026/LT/0457", "123.456.789-0",
  //   "4A_123/2026"), with at least one digit (lookahead (?=...)), so "Ticket: open" stays.
  // A full stop or comma after it is not part of it. Diagnosis codes ('code="M54.5"') stay, see isIdAfterLabel.
  { category: 'ID', re: /(?<=(?:\b(?:ID|No|Nr|Number|Numéro|Numero|Nummer|Ref|Réf|Referenz|Référence|Riferimento|Dossier|Akte|Aktenzeichen|Ticket|Case|Incident|Claim|Code|Group|Member|Policy|Police|Polizza|VIN|(?<!\/)DL|License|Licence|Permis|Account|Konto|Identifier|NPI|MRN|PID|S\/N|SN|Serial|Patient|Patientin|patiente|paziente)|_(?:ID|No|Nr|Number)|\p{Ll}(?:nummer|nr))\b[^\n\p{L}\p{N}]{0,6}(?:(?:is|ist|est|è|lautet)[ \t]+)?|(?:#|\bN[.°º])[ \t]*)(?:(?!(?:ID|No|Nr)\b)\p{L}{1,4}(?: \p{N}{2,})+(?![\p{L}\p{N}]|[.\/-]\p{N})|(?=[\p{L}\p{N}./_-]*\p{N})[\p{L}\p{N}]+(?:[./_-][\p{L}\p{N}]+)*)/giu, isValid: isIdAfterLabel },
  // A reference code: 1 or more capital letters, optionally more parts of capitals or digits, then a "-" and
  // a part of at least 4 digits, then optionally more such parts ("INC-20419", "CONF-2026-X8891",
  // "HC-2026-001942", "REF-99482-XYZ", patient numbers such as "P-104233"); not right after a letter, digit,
  // "_" or "-" ((?<![\w-]), so never a part of a longer code) and \b at the end. Short codes such as "ICD-10" stay.
  { category: 'ID', re: /(?<![\w-])[A-Z]+(?:-[A-Z0-9]+)*-\d{4,}(?:-[A-Z0-9]+)*\b/g },
  // The same the other way round: 3 or more digits, optionally more parts, then a "-" and a part of 2 or more
  // capital letters, then optionally more parts ("4471-ZRH", "2026-ZH-0193"), with the same boundaries.
  { category: 'ID', re: /(?<![\w-])\d{3,}(?:-[A-Z0-9]+)*-[A-Z]{2,}(?:-[A-Z0-9]+)*\b/g },
  // A Swiss Federal Supreme Court case number without a label: a digit, a capital letter, "_", 1 to 5 digits,
  // "/" and a 4-digit year ("4A_123/2026", "6B_1234/2025").
  { category: 'ID', re: /\b\d[A-Z]_\d{1,5}\/\d{4}\b/g },
  // Italian tax code (codice fiscale): 6 letters for the name, 2 digits for the year of birth, a letter for
  // the month (A-E, H, L, M, P, R-T), 2 digits for the day, a letter and 3 digits for the place of birth and a
  // check letter ("RSSMRA85T10A562S"); \b at both ends.
  { category: 'ID', re: /\b[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]\b/g },
  // Swiss company number (UID, also for VAT): "CHE", "-" or a space, and 3 groups of 3 digits separated by "."
  // ("CHE-123.456.789"), optionally followed by " MWST", " TVA" or " IVA", which stays.
  { category: 'ID', re: /\bCHE[- ]\d{3}\.\d{3}\.\d{3}\b/g },
  // IBAN: 2 capital letters for the country, 2 check digits, then 3 to 7 groups of 4 capitals or digits,
  // each optionally after one space, and an optional last group of 1 to 3 ("CH93 0076 2011 6238 5295 7",
  // "DE89370400440532013000"); only kept if the checksum is right.
  { category: 'ID', re: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, isValid: passesIbanChecksum },
  // A code of 1 to 4 capital letters directly followed by 5 or more digits, optionally 1 to 3 more capitals,
  // and optionally "-" and a suffix of capitals or digits, as courts, passports and ID cards use
  // ("HG250117-O", "X1234567", "E4821937", "PID0081234", the Italian "CA12345BC"); not inside a word or
  // number, but "_" counts as a separator ("Claim_HG230045.pdf"), so "ISO9001" (4 digits) and "COVID19" stay.
  { category: 'ID', re: /(?<![\p{L}\p{N}])[A-Z]{1,4}\d{5,}[A-Z]{0,3}(?:-[A-Z0-9]+)?(?![\p{L}\p{N}])/gu },
  // A case or report number of a number, "/", 1 to 4 capitals for the court or canton, "/" and a number
  // ("2026/TI/4471", "2026/LT/0457"), or the other way round ("C/18342/2026"); \b at both ends.
  { category: 'ID', re: /\b(?:\d{2,4}\/[A-Z]{1,4}\/\d{2,6}|[A-Z]{1,4}\/\d{2,6}\/\d{2,4})\b/g },
  // Swiss postal account: 2 digits, "-", 4 to 6 digits, "-" and a check digit ("30-123456-6", "CCP 17-1234-8");
  // not inside a longer number or code ((?<![\w-]) and (?![\w-])).
  { category: 'ID', re: /(?<![\w-])\d{2}-\d{4,6}-\d(?![\w-])/g },
  // A court case number with the year between full stops: 1 to 4 capitals or 1 to 3 digits, ".", a year
  // from 1900 to 2099, ".", and 1 to 6 digits ("VB.2026.00321", "WBE.2026.144", "12.2026.45"); \b at both ends.
  { category: 'ID', re: /\b(?:[A-Z]{1,4}|\d{1,3})\.(?:19|20)\d{2}\.\d{1,6}\b/g },
  // Swiss license plate: a canton's abbreviation (all but "AI", which is mostly "artificial intelligence"),
  // a space or "-", then 2 to 6 digits, possibly as groups of up to 3 and 3 after a space or "'" ("ZH 123456",
  // "SO 77 312", "LU 145 872", "BE-12345"); not right after a letter, digit, "_" or "-" ((?<![\w-]), so
  // "2026-ZH-0193" is left to the reference codes), and not followed by a digit or a decimal part.
  { category: 'ID', re: /(?<![\w-])(?:AG|AR|BE|BL|BS|FR|GE|GL|GR|JU|LU|NE|NW|OW|SG|SH|SO|SZ|TG|TI|UR|VD|VS|ZG|ZH)[ -](?:\d{1,3}[ ']?\d{3}|\d{2,3})(?![.,]?\d)/g },
  // A family name after "Fam.", "famille" or "famiglia" (lookbehind): a capital, then letters, "'" or "-"
  // ("Fam. Oppliger", "famille Rochat-Favre"). Not after "Familie", as German nouns are capitalized too
  // ("der Familie Zeit geben").
  { category: 'PERSON', re: /(?<=(?:\bFam\.|\b[Ff]amille|\b[Ff]amiglia)[ \t]+)\p{Lu}[\p{L}'-]+/gu },
  // A relative's first name (and surname) right after a word for the relative, in English, French or Italian
  // (lookbehind; "his brother Vincent", "sa fille Nathalie", "mia sorella Federica"; "son" only after "his",
  // "her" and the like, as the French "son Conseil" means "its council"): a capital and lower-case letters,
  // optionally "-" and another such part ("Gian-Reto"), optionally a space and a surname.
  { category: 'PERSON', re: /(?<=\b(?:[Ww]ife|[Hh]usband|[Ss]pouse|(?:[Hh]is|[Hh]er|[Tt]heir|[Mm]y|[Yy]our|[Oo]ur) son|[Dd]aughter|[Bb]rother|[Ss]ister|[Mm]other|[Ff]ather|[Gg]randson|[Gg]randdaughter|[Nn]ephew|[Nn]iece|[Ff]iancée?|épouse|époux|mari|fils|fille|frère|sœur|soeur|mère|père|neveu|nièce|conjointe?|compagne|compagnon|moglie|marito|figlio|figlia|fratello|sorella|madre|padre|compagna|compagno)[ \t]+)\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)?(?: \p{Lu}[\p{L}'-]+)?/gu },
  // The same in German, where nouns are capitalized too ("der Mutter Bescheid geben"): a first name and a
  // surname ("Schwester Monika Schaller-Huber", "Tochter Elin Hänni").
  { category: 'PERSON', re: /(?<=\b(?:Ehefrau|Ehemann|Gattin|Gatte|Tochter|Sohn|Bruder|Schwester|Mutter|Vater|Partnerin|Lebenspartnerin|Lebenspartner|Enkelin|Enkel|Neffe|Nichte|Stieftochter|Stiefsohn)[ \t]+)\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)? \p{Lu}[\p{L}'-]+/gu },
  // A German first name alone only when "(", ",", ";", ":", ".", the end of the line (m flag) or "und"
  // follows (lookahead), as in "Ihre Tochter Lea (7)", "Ehefrau Claudia (Buchhaltung)", "Sohn Noah und", and
  // not after "dem" or "der", where a noun is more likely ("gibt dem Sohn Bescheid, wenn").
  { category: 'PERSON', re: /(?<=(?<!\b(?:dem|der) )\b(?:Ehefrau|Ehemann|Gattin|Gatte|Tochter|Sohn|Bruder|Schwester|Mutter|Vater|Partnerin|Lebenspartnerin|Lebenspartner|Enkelin|Enkel|Neffe|Nichte|Stieftochter|Stiefsohn)[ \t]+)\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)?(?=[ \t]*(?:[(,;:.]|$)|[ \t]+und\b)/gmu },
  // A first name and surname after an academic title, as Swiss letters and signatures write them
  // (lookbehind): "Prof.", "Dr." or "Dr", "PD", "lic.", "dipl.", "MLaw", "BLaw", "MSc" or "BSc", followed by
  // any number of further parts such as "med.", "dent.", "iur.", "phil.", "h.c." ("Dr. med. dent. Laurin
  // Hofer", "lic. phil. Rebekka Hauser", "Prof. Dr. Ueli Baumann-Sommer"). The name: a capital and
  // lower-case letters, optionally "-" and another such part, then a space and a word starting with a
  // capital (letters, "'" or "-"); a single word after the title ("Dr. Steiner") is left to the detector.
  { category: 'PERSON', re: /(?<=\b(?:Prof\.|Dr\.?|PD|lic\.|dipl\.|MLaw|BLaw|MSc|BSc)(?:[ \t]+(?:Dr\.|med\.|dent\.|iur\.|phil\.|oec\.|rer\.|nat\.|pol\.|pract\.|vet\.|univ\.|h\.c\.|Ing\.|sc\.|techn\.))*[ \t]+)\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)? \p{Lu}[\p{L}'-]+/gu },
  // A person's name right after a label for one and ":" on the same line (lookbehind), as in forms and
  // records: "Name", "Vorname", "Preferred name", "Nom", "Prénom", "Cognome", "Patient", "Pat.", "Klientin",
  // "Mandant" and others (capitalized, or lower-case in code: "name:"). The name: up to 6 words starting with
  // a capital (letters, "'", "." or "-"; "ADEYEMI-CLARKE", "H."), with name particles ("von", "van der",
  // "de la", "di") and academic titles ("med.", "lic.") between them, separated by single spaces ("Seun",
  // "Herr Reto Ammann", "Ursula von Gunten"). Kept only if one word is more than a title (isMoreThanTitles).
  { category: 'PERSON', re: /(?<=\b(?:[Nn]ame|Full [Nn]ame|Full Legal Name|Preferred [Nn]ame|First [Nn]ame|Last [Nn]ame|Given [Nn]ame|Surname|Vorname|Nachname|Familienname|Rufname|Geburtsname|Nom|Prénom|Nom de famille|Nome|Cognome|Patient|Patientin|Patiente|Paziente|Pat\.|Klient|Klientin|Mandant|Mandantin)[ \t]*:[ \t]*)(?:(?:von|van|der|den|de|di|da|del|della|du|dos|zu|la|le|med\.|iur\.|phil\.|oec\.|lic\.|dipl\.) )*\p{Lu}[\p{L}'.-]*(?: (?:(?:von|van|der|den|de|di|da|del|della|du|dos|zu|la|le|med\.|iur\.|phil\.|oec\.|lic\.|dipl\.) )*\p{Lu}[\p{L}'.-]*){0,5}/gu, isValid: isMoreThanTitles },
  // US street address: a house number, 1 to 4 words starting with a capital or digit ("West 4th"), a street
  // type ("Avenue", "St", "Drive"...), an optional ".", and optionally ", Suite 200" or ", Apt 3B"
  // ("492 West 4th Avenue, Suite 200", "1847 Maple Grove Drive, Apt 3B").
  { category: 'ADDRESS', re: /\b\d{1,6}(?: [A-Z0-9][\w'.-]*){1,4} (?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Parkway|Pkwy|Terrace|Circle)\b\.?(?:, (?:Suite|Ste|Apt|Apartment|Unit|Floor|Fl)\.? ?[\w-]+)?/g },
  // US city, state and ZIP code: 1 to 3 capitalized words, ", ", 2 capitals and 5 digits, optionally "-" and
  // 4 more ("New York, NY 10012", "Portland, OR 97205-1234").
  { category: 'ADDRESS', re: /\b[A-Z][a-z]+(?: [A-Z][a-z]+){0,2}, [A-Z]{2} \d{5}(?:-\d{4})?\b/g },
  // Postal code and town at the start of a line (after optional spaces, m flag) or after ", ": 4 or 5 digits,
  // optionally after "CH-", "D-", "F-", "I-" or "A-", a space, and the town: words starting with a capital
  // (letters, "'" or "-", and a "." only before a space, as in "St. Gallen"), possibly joined by "am", "bei",
  // "b.", "sur", "de", "la", "di" and similar ("8800 Thalwil", "1752 Villars-sur-Glâne", "9001 St. Gallen",
  // "2300 La Chaux-de-Fonds", "3294 Büren an der Aare"). Only when the end of the line, ",", ";", ")" or "."
  // follows (lookahead), so "2014 Mandant seit" stays.
  { category: 'ADDRESS', re: /(?<=^[ \t]*|, )(?:(?:CH|D|F|I|A)-)?\d{4,5} \p{Lu}[\p{L}'-]*(?:\.(?= ))?(?: (?:(?:am|an|im|bei|b\.|ob|der|sur|sous|de|des|la|le|les|en|di|al|del) )*\p{Lu}[\p{L}'-]*(?:\.(?= ))?)*(?=[ \t]*(?:$|[,;).]))/gmu },
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
  // area code in brackets ("(503) "). Then a digit, at least 6 characters that are digits, "/", "-" or single
  // spaces (a space not followed by another, (?! ), so table columns "25    96.00" are not joined), and a
  // final digit ("+41 (0)44 555 01 23", "079 555 01 23", "044/555 01 23", "(503) 555-0142"), not directly
  // followed by a letter, digit, ":" or a decimal part (".4" in the build number "20261012.4"), and never a
  // year-month-day date ("2026-10-14 08:14"), a range of reference values in a lab report ("15 - 150") or of
  // years ("2025-2028").
  { category: 'PHONE', re: /(?<![\p{L}\p{N}+(.\/-])(?:\+\d{1,3}[ -]?(?:\(0\)[ -]?)?|\(\d{2,4}\)[ -]?)?\d(?:[\d\/-]| (?! )){6,}\d(?![\p{L}\p{N}:]|\.\d)/gu, isValid: isPhoneNumber },
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
