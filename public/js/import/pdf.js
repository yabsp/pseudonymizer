// Planned (AGENTS.md, section 4): extract the text locally with a vendored pdf.js, loaded only here and only when
// a PDF is opened; scanned pages need local OCR. The original PDF is never sent; only text goes on to detection.
export const PDF_IMPORTER = {
  label: 'PDF',
  extensions: ['pdf'],
  async read(file) {
    throw new Error(`Opening PDFs is not available yet. Copy the text out of "${file.name}" and paste it instead.`);
  },
};
