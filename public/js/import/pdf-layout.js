// Rebuilds readable text from the pieces a PDF page places at coordinates: lines, paragraphs, table rows
// ("cell | cell"), two columns of text, headings, and a marker where an image is. Pure: positions in, text out.
//
// A page is { width, height, items: [{ text, x, y, width, size }], images: [{ x, y, width, height }] }: x is the
// left edge, y the baseline (for an image the top) measured from the top of the page, size the font height, all
// in PDF points (1/72 inch).

// Three or more spaces inside one piece of text: columns written with spaces ("Name      Vorname").
const SPACE_RUN = /\s{3,}/;
const WHITESPACE = /\s+/g;
// A list marker that starts a line: a bullet or dash, or up to 3 digits or one letter followed by "." or ")"
// ("-", "•", "1.", "12)", "a)"), alone or before a space.
const LIST_MARKER = /^(?:[-–—•·▪■□◦*]|\d{1,3}[.)]|\p{L}[.)])(?:\s|$)/u;
// A line that ends in a word or code wrapped at a hyphen: a letter or digit, then "-" ("Planungs-", "ATV-K2604-").
const ENDS_WITH_HYPHEN = /[\p{L}\p{N}]-$/u;
// A line that starts with a conjunction, before which a hyphen ends a shortened word ("Ein- und Ausgang",
// "import- et export"), so the space stays.
const STARTS_WITH_CONJUNCTION = /^(?:und|oder|bis|sowie|bzw|et|ou|e|o|ed|and|or|to)(?![\p{L}\p{N}])/iu;
const FIRST_WORD = /^\S+/;

// All distances are relative to the font size of the text they are about.
const SAME_LINE = 0.3; // baselines this close are one line
const JOINED = 0.12; // pieces this close are one word
const CELL_GAP = 0.6; // a gap this wide can separate two cells, if other lines have it at the same place
const SURE_CELL_GAP = 1.5; // a gap this wide separates two cells on its own
const NEAR_LINES = 2.2; // baselines this close belong to the same table or column
const PARAGRAPH_LEADING = 1.7; // baselines this close can be one paragraph
const WRAPPED_CELL_LEADING = 1.46; // baselines this close can be one table cell that wraps
// The room a table leaves between the text of a cell and the next column is taken to be within these.
const MIN_COLUMN_SPACING = 0.3;
const MAX_COLUMN_SPACING = 1.2;
const HEADING_SIZE = 1.15;
const TITLE_SIZE = 1.5;
const MAX_HEADING_CHARS = 120;
// Two columns of running text: at least this many lines each, most of them filling their column.
const MIN_COLUMN_LINES = 5;
const COLUMN_FILL = 0.6;
const MIN_WORDS_PER_COLUMN_LINE = 4;
const MIN_IMAGE_POINTS = 24;

const clean = (text) => text.replace(WHITESPACE, ' ').trim();
const median = (numbers) => [...numbers].sort((a, b) => a - b)[Math.floor(numbers.length / 2)] ?? 0;

/** Pieces with text; a piece that holds several columns separated by runs of spaces becomes one piece per column. */
function prepareItems(items) {
  return items.flatMap((item) => {
    if (!item.text.trim() || !(item.size > 0)) return [];
    if (!SPACE_RUN.test(item.text.trim())) return [{ ...item, text: clean(item.text), right: item.x + item.width }];
    const perChar = item.width / item.text.length;
    const parts = [];
    let offset = 0;
    for (const part of item.text.split(/(\s{3,})/)) {
      if (part.trim()) parts.push({ ...item, text: clean(part), x: item.x + offset * perChar, right: item.x + (offset + part.length) * perChar });
      offset += part.length;
    }
    return parts;
  });
}

/** Lines from top to bottom: { y, size, segments: [{ x, right, text }] }; a segment is text without a wide gap in it. */
function toLines(items) {
  const lines = [];
  for (const item of [...items].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const line = lines.findLast((l) => Math.abs(l.y - item.y) <= SAME_LINE * Math.min(l.size, item.size));
    if (line) line.items.push(item);
    else lines.push({ y: item.y, size: item.size, items: [item] });
  }
  return lines.map(({ y, items: lineItems }) => {
    const sorted = lineItems.sort((a, b) => a.x - b.x);
    // The size of most of the line's text, so a footnote mark doesn't decide it.
    const size = median(sorted.flatMap((item) => Array(Math.max(1, item.text.length)).fill(item.size)));
    const segments = [];
    for (const item of sorted) {
      const last = segments.at(-1);
      const gap = last ? item.x - last.right : Infinity;
      if (gap >= CELL_GAP * size) segments.push({ x: item.x, right: item.right, text: item.text });
      else {
        last.text += (gap > JOINED * size ? ' ' : '') + item.text;
        last.right = Math.max(last.right, item.right);
      }
    }
    return { y, size, segments };
  }).sort((a, b) => a.y - b.y);
}

const lineText = (line) => line.segments.map((s) => s.text).join(' ');
const lineRight = (line) => line.segments.at(-1).right;
const lineLeft = (line) => line.segments[0].x;

/** The intervals of a line without text, from the left edge of all text to the right edge. */
function freeIntervals(line, extent) {
  const free = [];
  let from = extent.left;
  for (const segment of line.segments) {
    if (segment.x > from) free.push([from, segment.x]);
    from = Math.max(from, segment.right);
  }
  if (extent.right > from) free.push([from, extent.right]);
  return free;
}

function intersect(a, b, minWidth) {
  const result = [];
  for (const [a0, a1] of a) {
    for (const [b0, b1] of b) {
      const [from, to] = [Math.max(a0, b0), Math.min(a1, b1)];
      if (to - from >= minWidth) result.push([from, to]);
    }
  }
  return result;
}

/** The gaps that have text on both sides somewhere in the lines: what separates columns, not the margins. */
function innerGaps(gaps, lines) {
  const left = Math.min(...lines.map(lineLeft));
  const right = Math.max(...lines.map(lineRight));
  return gaps.filter(([from, to]) => from > left && to < right);
}

/**
 * Groups of lines that follow each other closely and share gaps at the same places: tables and columns. Returns
 * the lines in blocks: { lines, gaps } with gaps [] for ordinary lines.
 */
function findBlocks(lines, extent) {
  const blocks = [];
  let current = null;
  const close = () => {
    if (!current) return;
    const gaps = current.lines.length > 1 ? innerGaps(current.gaps, current.lines) : [];
    // A table has several rows with more than one cell; text set in two columns may have none (its lines need not
    // be level). Lines that only share a gap by chance (a date at the right above an address at the left) are neither.
    const rowsWithCells = gaps.length ? current.lines.filter((line) => cellsOf(line, gaps).filter(Boolean).length > 1).length : 0;
    const hasColumns = gaps.length > 0 && (rowsWithCells > 1 || isTwoColumnText(current.lines, gaps));
    const last = blocks.at(-1);
    // Ordinary lines that follow each other stay one block, so their paragraphs can be put together.
    if (!hasColumns && last && !last.gaps.length) last.lines.push(...current.lines);
    else blocks.push({ lines: current.lines, gaps: hasColumns ? gaps : [] });
    current = null;
  };
  for (const line of lines) {
    const free = freeIntervals(line, extent);
    if (current) {
      const previous = current.lines.at(-1);
      const isNear = line.y - previous.y <= NEAR_LINES * Math.max(line.size, previous.size);
      // A table starts at its first row with cells: a sentence above it would hide the gaps it reaches over.
      const startsTable = line.segments.length > 1 && current.lines.every((l) => l.segments.length === 1);
      const shared = isNear && !startsTable ? intersect(current.gaps, free, CELL_GAP * line.size) : [];
      if (innerGaps(shared, [...current.lines, line]).length) {
        current.gaps = shared;
        current.lines.push(line);
        continue;
      }
      close();
    }
    current = { lines: [line], gaps: free };
  }
  close();
  return blocks;
}

/** The cells of a line: its segments joined between the gaps; cells[i] is '' where a column is empty. */
function cellsOf(line, gaps) {
  const cells = Array.from({ length: gaps.length + 1 }, () => []);
  for (const segment of line.segments) {
    const middle = (segment.x + segment.right) / 2;
    const column = gaps.filter(([from, to]) => middle > (from + to) / 2).length;
    cells[column].push(segment);
  }
  return cells.map((segments) => (segments.length
    ? { text: segments.map((s) => s.text).join(' '), x: segments[0].x, right: segments.at(-1).right }
    : null));
}

/** True if the first word of next did not fit behind previous within rightEdge, so the line was wrapped there. */
function isWrapped(previous, next, rightEdge, size) {
  const firstWord = next.text.match(FIRST_WORD)?.[0] ?? '';
  const wordWidth = (next.right - next.x) * (firstWord.length / Math.max(1, next.text.length));
  return previous.right + 0.25 * size + wordWidth > rightEdge;
}

// Marks where a line that ended in "-" was joined to the next one, until the whole document shows what kind of
// hyphen it was (resolveHyphens). A private-use character, which no document text contains.
const HYPHEN_BREAK = '';
// A word of letters, "-", the mark, and a word that starts in lower case: "Planungs-" + "leistungen" (hyphenated
// by the typesetter) or "brunnmatt-" + "archive" (a name with a hyphen, wrapped behind it). Not inside a longer
// token such as an e-mail address or a number, whose hyphens are always real.
const AMBIGUOUS_HYPHEN = /(?<![\p{L}\p{N}@._/-])(\p{L}+)-(\p{Ll}\p{L}*)(?![\p{L}\p{N}@_/-]|\.\p{L})/gu;
const ALL_HYPHEN_BREAKS = //g;
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;

/** Joins a wrapped line to the text before it; after a hyphen without a space, marked for resolveHyphens. */
function appendWrapped(text, next) {
  return ENDS_WITH_HYPHEN.test(text) && !STARTS_WITH_CONJUNCTION.test(next) ? text + HYPHEN_BREAK + next : text + ' ' + next;
}

/**
 * Decides every hyphen at a wrapped line end: it goes only if the document writes the word without it somewhere
 * else and never with it ("Wegmül-ler" next to "Wegmüller"). Otherwise it stays, as browsers and most word
 * processors only wrap at hyphens that belong to the word ("Brunner-Zollinger", "bank-talwiesen.example").
 */
function resolveHyphens(text) {
  const plain = text.replace(ALL_HYPHEN_BREAKS, '');
  const hasWord = (word) => new RegExp(`(?<![\\p{L}\\p{N}-])${word.replace(REGEX_SYNTAX, '\\$&')}(?![\\p{L}\\p{N}-])`, 'u').test(plain);
  return text.replace(AMBIGUOUS_HYPHEN, (match, first, second) => {
    const joined = first + second;
    const hyphenated = `${first}-${second}`;
    // The wrapped place itself reads as the hyphenated form in plain, so that form must be there a second time.
    const hyphenatedElsewhere = plain.split(hyphenated).length > 2;
    return hasWord(joined) && !hyphenatedElsewhere ? joined : hyphenated;
  }).replace(ALL_HYPHEN_BREAKS, '');
}

/**
 * Lines as paragraphs: a line that was wrapped is joined to the one before; other line breaks stay. A wrapped
 * line comes near rightEdge, the right margin of the text these lines belong to.
 */
function renderLines(lines, bodySize, rightEdge) {
  const out = [];
  let previous = null;
  lines.forEach((line) => {
    const text = lineText(line);
    const isNear = previous && line.y - previous.y <= PARAGRAPH_LEADING * Math.max(line.size, previous.size) && Math.abs(line.size - previous.size) < 0.1 * line.size;
    const here = { x: lineLeft(line), right: lineRight(line), text };
    const continues = isNear && !LIST_MARKER.test(text) && isWrapped(previous.box, here, rightEdge, line.size);
    if (continues) out[out.length - 1] = appendWrapped(out.at(-1), text);
    else {
      if (previous && !isNear) out.push('');
      const isHeading = line.size >= HEADING_SIZE * bodySize && text.length <= MAX_HEADING_CHARS;
      out.push(isHeading ? `${line.size >= TITLE_SIZE * bodySize ? '#' : '##'} ${text}` : text);
    }
    previous = { y: line.y, size: line.size, box: here };
  });
  return out;
}

/**
 * Rows as "cell | cell"; a row whose cells only continue the wrapped cells of the row above is joined to it. A
 * cell was wrapped if its next word did not fit into its column: up to the next column minus the room the table
 * leaves between columns (its narrowest gap shows that), or up to the right margin (pageRight) in the last
 * column. A line that starts with a list marker is never a continuation.
 */
function renderTable(lines, gaps, pageRight) {
  const rows = [];
  let previous = null;
  const narrowestGap = Math.min(...gaps.map(([from, to]) => to - from));
  for (const line of lines) {
    const cells = cellsOf(line, gaps);
    const spacing = Math.min(Math.max(narrowestGap, MIN_COLUMN_SPACING * line.size), MAX_COLUMN_SPACING * line.size);
    const columnEnd = (i) => (i < gaps.length ? gaps[i][1] - spacing : pageRight);
    const isTight = previous && line.y - previous.line.y <= WRAPPED_CELL_LEADING * Math.max(line.size, previous.line.size);
    const startsItem = LIST_MARKER.test((cells.find(Boolean)?.text ?? '') + ' ');
    const continues = isTight && !startsItem && cells.some((cell, i) => cell && previous.cells[i] && isWrapped(previous.cells[i], cell, columnEnd(i), line.size));
    if (continues) {
      const row = rows.at(-1);
      cells.forEach((cell, i) => {
        if (cell) row[i] = row[i] ? appendWrapped(row[i], cell.text) : cell.text;
      });
      previous = { line, cells: cells.map((cell, i) => cell ?? previous.cells[i]) };
    } else {
      rows.push(cells.map((cell) => cell?.text ?? ''));
      previous = { line, cells };
    }
  }
  // A line with one cell before the first or after the last real row is not part of the table.
  const isRow = (row) => row.filter(Boolean).length > 1;
  const [first, last] = [rows.findIndex(isRow), rows.findLastIndex(isRow)];
  const texts = rows.map((row, i) => {
    if (i < first || i > last) return row.find(Boolean) ?? '';
    // A list: the marker and its text are one line, not two cells.
    if (row.length === 2 && LIST_MARKER.test(row[0] + ' ') && row[0].length <= 4) return `${row[0]} ${row[1]}`.trim();
    return row.join(' | ').trim();
  });
  return [...texts.slice(0, first), '', ...texts.slice(first, last + 1), '', ...texts.slice(last + 1)];
}

/** True for two columns of running text, which are read one after the other instead of row by row. */
function isTwoColumnText(lines, gaps) {
  if (gaps.length !== 1) return false;
  const columns = [[], []];
  for (const line of lines) cellsOf(line, gaps).forEach((cell, i) => cell && columns[i].push(cell));
  return columns.every((cells) => {
    if (cells.length < MIN_COLUMN_LINES) return false;
    const width = Math.max(...cells.map((c) => c.right)) - Math.min(...cells.map((c) => c.x));
    const filled = cells.filter((c) => c.right - c.x >= COLUMN_FILL * width).length;
    const words = cells.reduce((n, c) => n + c.text.split(' ').length, 0);
    return filled >= cells.length / 2 && words / cells.length >= MIN_WORDS_PER_COLUMN_LINE;
  });
}

/** The lines of one column of a two-column block, as lines of their own. */
function columnLines(lines, gaps, column) {
  return lines.flatMap((line) => {
    const cell = cellsOf(line, gaps)[column];
    return cell ? [{ y: line.y, size: line.size, segments: [cell] }] : [];
  });
}

const MIN_LINES_FOR_MARGIN = 3;

/** pageRight: the right edge of all text on the page, the margin for a block too short to show its own. */
function renderBlock({ lines, gaps }, bodySize, pageRight) {
  const rightOf = (blockLines) => (blockLines.length >= MIN_LINES_FOR_MARGIN ? Math.max(...blockLines.map(lineRight)) : pageRight);
  if (!gaps.length) {
    // Wide gaps in a line of its own still separate cells.
    return renderLines(lines.map((line) => ({ ...line, segments: mergeSegments(line) })), bodySize, rightOf(lines));
  }
  if (isTwoColumnText(lines, gaps)) {
    const columns = [columnLines(lines, gaps, 0), columnLines(lines, gaps, 1)];
    return columns.flatMap((column) => [...renderLines(column, bodySize, Math.max(...column.map(lineRight))), '']);
  }
  return renderTable(lines, gaps, pageRight);
}

/** The segments of an ordinary line as one text: " | " at gaps wide enough to be cells on their own, a space at the others. */
function mergeSegments(line) {
  let text = '';
  let right = null;
  for (const segment of line.segments) {
    if (right !== null) text += segment.x - right >= SURE_CELL_GAP * line.size ? ' | ' : ' ';
    text += segment.text;
    right = segment.right;
  }
  return [{ x: lineLeft(line), right: lineRight(line), text }];
}

/** The font size most of the text has, by characters. */
function bodySizeOf(pages) {
  const chars = new Map();
  for (const page of pages) {
    for (const item of page.items) {
      const size = Math.round(item.size * 2) / 2;
      chars.set(size, (chars.get(size) ?? 0) + item.text.length);
    }
  }
  return [...chars].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 10;
}

const isRealImage = (image) => image.width >= MIN_IMAGE_POINTS && image.height >= MIN_IMAGE_POINTS;

/**
 * The text of one page. imageMarker(image) gives the line that stands for an image; images smaller than a
 * thumbnail (rules, bullets, backgrounds of a few points) are left out.
 */
function layoutPage(page, { bodySize = bodySizeOf([page]), imageMarker = () => null } = {}) {
  const lines = toLines(prepareItems(page.items));
  const out = [];
  const extent = { left: Math.min(...lines.map(lineLeft)), right: Math.max(...lines.map(lineRight)) };
  // The right margin: as wide as the left one, unless text reaches further. A page with only a few short lines
  // has no line that shows it.
  const pageRight = Math.max(extent.right, page.width - extent.left);
  const renderLinesBetween = (group) => {
    let lastY = null;
    for (const block of findBlocks(group, extent)) {
      const first = block.lines[0];
      if (lastY !== null && (block.gaps.length || first.y - lastY > PARAGRAPH_LEADING * first.size)) out.push('');
      out.push(...renderBlock(block, bodySize, pageRight));
      if (block.gaps.length) out.push('');
      lastY = block.lines.at(-1).y;
    }
  };
  // Each image stands between the lines above and below its middle, so its marker does too.
  let rest = lines;
  for (const image of page.images.filter(isRealImage).sort((a, b) => a.y - b.y)) {
    const middle = image.y + image.height / 2;
    const above = rest.filter((line) => line.y <= middle);
    rest = rest.filter((line) => line.y > middle);
    if (above.length) renderLinesBetween(above);
    const marker = imageMarker(image);
    if (marker) out.push('', marker, '');
  }
  if (rest.length) renderLinesBetween(rest);
  // No more than one empty line in a row, none at the start or end.
  return out.filter((line, i) => line !== '' || (i > 0 && out[i - 1] !== '')).join('\n').trim();
}

/**
 * The text of a whole document, as it is sent after pseudonymizing: pages separated by "--- Page N ---", every
 * image as "[Image N, page P: not sent]". recognized[i] (optional) is the text of page i + 1 read from its picture
 * (a scanned page); a scanned page without it gets a marker that says its text is missing.
 * Returns { text, pages, images, scannedPages, unreadPages }.
 */
export function layoutDocument(pages, recognized = []) {
  const bodySize = bodySizeOf(pages);
  let images = 0;
  const unreadPages = [];
  const texts = pages.map((page, i) => {
    const number = i + 1;
    if (page.isScan && typeof recognized[i] === 'string') return recognized[i].trim();
    if (page.isScan) {
      unreadPages.push(number);
      return `[Page ${number} is a scanned image: its text was not read]`;
    }
    return layoutPage(page, { bodySize, imageMarker: () => `[Image ${++images}, page ${number}: not sent]` });
  });
  const text = texts.map((pageText, i) => (i ? `--- Page ${i + 1} ---\n\n` : '') + pageText).join('\n\n').trim();
  return { text: resolveHyphens(text) + '\n', pages: pages.length, images, scannedPages: pages.filter((p) => p.isScan).length, unreadPages };
}
