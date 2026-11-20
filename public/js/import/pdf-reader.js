// Reads one page of a PDF with pdf.js into what pdf-layout.js takes: the pieces of text with their positions, and
// where the images are. Nothing is drawn and no DOM is used, so it also runs in tests. pdfjs is the library (the
// browser build in the page, the legacy build in Node).

const IDENTITY = [1, 0, 0, 1, 0, 0];
// A scanned page is a picture of a page: an image over most of it and next to no text.
const SCAN_IMAGE_SHARE = 0.5;
const SCAN_MAX_CHARS = 40;

/** The box of an image drawn with the matrix m (PDF draws every image into the unit square), y from the top. */
function boxOf(m) {
  const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]]);
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

/** Where the page draws images, found by following the drawing commands and the matrix in force at each. */
async function readImages(pdfjs, page, viewport) {
  const { OPS, Util } = pdfjs;
  const imageCommands = [OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageXObjectRepeat, OPS.paintImageMaskXObject];
  const { fnArray, argsArray } = await page.getOperatorList();
  const saved = [];
  const images = [];
  let matrix = IDENTITY;
  fnArray.forEach((command, i) => {
    if (command === OPS.save) saved.push(matrix);
    else if (command === OPS.restore) matrix = saved.pop() ?? matrix;
    else if (command === OPS.transform) matrix = Util.transform(matrix, argsArray[i]);
    else if (command === OPS.paintFormXObjectBegin) {
      saved.push(matrix);
      if (Array.isArray(argsArray[i]?.[0])) matrix = Util.transform(matrix, argsArray[i][0]);
    } else if (command === OPS.paintFormXObjectEnd) matrix = saved.pop() ?? matrix;
    else if (imageCommands.includes(command)) images.push(boxOf(Util.transform(viewport.transform, matrix)));
  });
  return images;
}

/**
 * Resolves to { width, height, items: [{ text, x, y, width, size }], images: [{ x, y, width, height }], isScan }
 * in points, y measured from the top of the page as it is shown (a rotated page is read upright).
 */
export async function readPage(pdfjs, page) {
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items = [];
  for (const item of content.items) {
    if (typeof item.str !== 'string' || !item.str) continue;
    const [a, b, c, d, x, y] = pdfjs.Util.transform(viewport.transform, item.transform);
    // Text written sideways (a stamp in the margin) is kept as a line of its own at its place, not measured as a line.
    const isSideways = Math.abs(b) > Math.abs(a);
    items.push({ text: item.str, x, y, width: isSideways ? 0 : item.width, size: Math.hypot(c, d) || item.height || 1 });
  }
  const images = await readImages(pdfjs, page, viewport);
  const chars = items.reduce((n, item) => n + item.text.trim().length, 0);
  const pageArea = viewport.width * viewport.height;
  const isScan = chars <= SCAN_MAX_CHARS && images.some((image) => image.width * image.height >= SCAN_IMAGE_SHARE * pageArea);
  return { width: viewport.width, height: viewport.height, items, images, isScan };
}
