// Writes small PDFs for tests: text placed at coordinates, optionally a picture over the whole page (a "scan").
// pages: [{ texts: [{ x, y, size?, text }], scan? }], x and y in points from the bottom left corner as PDF has it.

const PAGE = { width: 595, height: 842 }; // A4

// Characters outside ASCII and the PDF string delimiters, written as octal escapes of their Latin-1 code.
const NEEDS_ESCAPE = /[^\x20-\x7e]|[()\\]/g;
const pdfString = (text) => `(${text.replace(NEEDS_ESCAPE, (c) => '\\' + c.charCodeAt(0).toString(8).padStart(3, '0'))})`;

function contentOf({ texts = [], scan = false }) {
  const commands = [];
  if (scan) commands.push(`q ${PAGE.width} 0 0 ${PAGE.height} 0 0 cm /Im1 Do Q`);
  for (const { x, y, size = 11, text } of texts) commands.push(`BT /F1 ${size} Tf ${x} ${y} Td ${pdfString(text)} Tj ET`);
  return commands.join('\n');
}

/** The bytes of a PDF with these pages, set in Helvetica. */
export function makePdf(pages) {
  const objects = [];
  const add = (body) => objects.push(body) && objects.length;
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  // A grey 1x1 picture, stretched over the page where a page is a "scan".
  const image = add('<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\n\x80\nendstream');
  const pagesId = objects.length + 1 + pages.length * 2;
  const pageIds = pages.map((page) => {
    const stream = contentOf(page);
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Contents ${content} 0 R /Resources << /Font << /F1 ${font} 0 R >> /XObject << /Im1 ${image} 0 R >> >> >>`);
  });
  add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  const catalog = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Uint8Array.from(pdf, (c) => c.charCodeAt(0));
}
