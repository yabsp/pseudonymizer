// One word: letters, digits, apostrophes and hyphens only ("o'neill", "jean-luc"), any script (u flag).
const WORD = /^[\p{L}\p{N}'-]+$/u;
// A comment: "#" and everything after it on the line.
const COMMENT = /#.*/;
// What separates the words of a value: one or more spaces or punctuation marks between words (",", ";", ":",
// "!", "?", brackets, quotes, "/"). Hyphens, "_", "@" and "." stay inside a word, so "E-Mail" is one word, as it
// is written in the list, and so are user names and addresses such as "bw_dataroom_admin" or "admin@example.com".
const WORD_SEPARATORS = /[\s,;:!?()[\]{}"«»“”‘’\/]+/u;
// Full stops at the start or end of a word, so "Dr." is the listed "dr".
const EDGE_DOTS = /^\.+|\.+$/g;
// Any digit, in any script.
const DIGIT = /\p{N}/u;

export function parseWordList(text) {
  const words = new Set();
  const errors = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(COMMENT, '').trim();
    if (!line) return;
    if (!WORD.test(line)) return errors.push(`line ${i + 1}: one word per line, found "${line}"`);
    words.add(line.toLowerCase());
  });
  return { words, errors };
}

/**
 * True for values like "Ich bitte Sie" or "meiner Person": at least one common word, and every other
 * word lower-case without digits. A value with a name, a number or no common word at all is kept.
 */
export function isOnlyCommonWords(value, commonWords) {
  const words = value.split(WORD_SEPARATORS).map((w) => w.replace(EDGE_DOTS, '')).filter(Boolean);
  const others = words.filter((w) => !commonWords.has(w.toLowerCase()));
  if (others.length === words.length) return false;
  return others.every((w) => w === w.toLowerCase() && !DIGIT.test(w));
}
