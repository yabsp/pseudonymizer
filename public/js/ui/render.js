import { PLACEHOLDER } from '../core/mapping.js';
import { h } from './dom.js';

const IS_PLACEHOLDER = new RegExp(`^${PLACEHOLDER.source}$`);
const SPLIT_AT_PLACEHOLDERS = new RegExp(`(${PLACEHOLDER.source})`);
// The category of a placeholder: the letters, digits and "_" between "[[" and the last "_<number>]]"
// ("PERSON" in "[[PERSON_12]]", "E_MAIL" in "[[E_MAIL_1]]").
const PLACEHOLDER_CATEGORY = /^\[\[([A-Z0-9_]+?)_\d+\]\]$/;

const KIND_NAMES = {
  PERSON: ['person', 'people'],
  COMPANY: ['organisation', 'organisations'],
  ADDRESS: ['address', 'addresses'],
  EMAIL: ['email', 'emails'],
  PHONE: ['phone number', 'phone numbers'],
  ID: ['ID', 'IDs'],
  DATE: ['date', 'dates'],
  TIMESTAMP: ['timestamp', 'timestamps'],
  CARD: ['card number', 'card numbers'],
  SECRET: ['secret', 'secrets'],
  IP: ['IP address', 'IP addresses'],
  URL: ['link', 'links'],
};

export const categoryOf = (placeholder) => placeholder.match(PLACEHOLDER_CATEGORY)?.[1] ?? 'OTHER';

function describeKind(category, count) {
  const [one, many] = KIND_NAMES[category] ?? [category.toLowerCase().replaceAll('_', ' '), category.toLowerCase().replaceAll('_', ' ')];
  return `${count} ${count === 1 ? one : many}`;
}

/** Chips like "3 people", "2 IDs": one per kind, counting placeholders, not every spelling of a value. */
export function renderSummary(list, mapping) {
  const placeholders = [...new Set(mapping.filter((m) => m.original).map((m) => m.placeholder))];
  const counts = new Map();
  for (const placeholder of placeholders) counts.set(categoryOf(placeholder), (counts.get(categoryOf(placeholder)) ?? 0) + 1);
  list.replaceChildren(...[...counts].sort((a, b) => b[1] - a[1]).map(([category, count]) => h('li', { className: 'chip' }, describeKind(category, count))));
  if (!counts.size) list.replaceChildren(h('li', { className: 'chip empty-chip' }, 'Nothing found to hide. Add values under "Edit values" if needed.'));
}

export function renderMappingTable(body, mapping, { onEdit, onRemove }) {
  if (!mapping.length) {
    body.replaceChildren(h('tr', { className: 'empty' }, h('td', { colSpan: 3 }, 'No values yet. Add them below.')));
    return;
  }
  body.replaceChildren(...mapping.map((m, i) => {
    const input = h('input', { value: m.original, 'aria-label': 'Original value for ' + m.placeholder, onchange: () => onEdit(i, input.value) });
    const remove = h('button', { type: 'button', className: 'ghost', 'aria-label': 'Remove ' + m.placeholder, onclick: () => onRemove(i) }, '×');
    return h('tr', {}, h('td', {}, input), h('td', { className: 'ph' }, h('span', {}, m.placeholder)), h('td', { className: 'del' }, remove));
  }));
}

const SNIPPET_CHARACTERS = 220;
const SNIPPET_LINES = 3;

/** The start of the text (a few lines), placeholders highlighted, so step 3 shows what part 1 is. */
export function renderSnippet(out, text) {
  const lines = text.trim().split('\n').slice(0, SNIPPET_LINES).join('\n');
  let start = lines.slice(0, SNIPPET_CHARACTERS);
  // never cut a placeholder in half: extend to its closing "]]"
  const open = start.lastIndexOf('[[');
  if (open > start.lastIndexOf(']]')) {
    const close = lines.indexOf(']]', open);
    start = close < 0 ? lines.slice(0, open) : lines.slice(0, close + 2);
  }
  const isCut = start.length < text.trim().length;
  out.replaceChildren(...start.split(SPLIT_AT_PLACEHOLDERS).filter(Boolean).map((part) => (IS_PLACEHOLDER.test(part)
    ? h('mark', {}, part)
    : document.createTextNode(part))), isCut ? ' …' : '');
}

/** Placeholders become buttons, so a click (or Enter) shows what they stand for. */
export function renderPreview(out, text, onSelect) {
  out.replaceChildren(...text.split(SPLIT_AT_PLACEHOLDERS).filter(Boolean).map((part) => (IS_PLACEHOLDER.test(part)
    ? h('button', { type: 'button', className: 'ph-mark', 'data-category': categoryOf(part), onclick: () => onSelect(part) }, part)
    : document.createTextNode(part))));
}
