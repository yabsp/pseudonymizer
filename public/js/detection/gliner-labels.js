// A category: an upper-case letter, then upper-case letters, digits or "_" ("PERSON", "CASE_NO").
const CATEGORY = /^[A-Z][A-Z0-9_]*$/;
// A comment: "#" and everything after it on the line.
const COMMENT = /#.*/;
// One or more whitespace characters, collapsed to a single space in labels.
const WHITESPACE = /\s+/g;

/** Lines like "date of birth = DATE". Returns { labels: { label: CATEGORY }, errors } in file order. */
export function parseGlinerLabels(text) {
  const labels = {};
  const errors = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(COMMENT, '').trim();
    if (!line) return;
    const where = `line ${i + 1}`;
    const eq = line.indexOf('=');
    if (eq < 0) return errors.push(`${where}: expected "label = CATEGORY", found "${line}"`);
    const label = line.slice(0, eq).trim().replace(WHITESPACE, ' ').toLowerCase();
    const category = line.slice(eq + 1).trim().toUpperCase();
    if (!label) return errors.push(`${where}: the label before "=" is empty`);
    if (!CATEGORY.test(category)) return errors.push(`${where}: "${category}" is not a valid category (letters, digits and _, starting with a letter)`);
    if (Object.hasOwn(labels, label)) return errors.push(`${where}: "${label}" is listed twice`);
    // defineProperty, because plain assignment would turn the label "__proto__" into a prototype change
    Object.defineProperty(labels, label, { value: category, enumerable: true, writable: true, configurable: true });
  });
  if (!errors.length && !Object.keys(labels).length) errors.push('no labels defined');
  return { labels, errors };
}

export function categoryForLabel(labels, label) {
  return Object.hasOwn(labels, label) ? labels[label] : 'OTHER';
}
