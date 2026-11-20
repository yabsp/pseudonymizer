import { recognizePages } from './ocr.js';
import { layoutDocument } from './pdf-layout.js';
import { readPage } from './pdf-reader.js';

const MAX_PDF_BYTES = 50 * 1024 * 1024;
// pdf.js as the local server serves it from the installed package; nothing is loaded from the internet.
const PDFJS_FOLDER = new URL('../../vendor/pdfjs/', import.meta.url).href;
// Every PDF file starts with "%PDF-".
const PDF_SIGNATURE = '%PDF-';

let pdfjsLoading = null;

/** The PDF reader, loaded the first time a PDF is opened. */
function loadPdfjs() {
  pdfjsLoading ??= import(PDFJS_FOLDER + 'build/pdf.min.mjs').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_FOLDER + 'build/pdf.worker.min.mjs';
    return pdfjs;
  }).catch((e) => {
    pdfjsLoading = null;
    throw new Error(`The PDF reader could not be loaded (${e.message}). Run "npm run setup".`);
  });
  return pdfjsLoading;
}

/**
 * The PDF is read in this page: it is not uploaded anywhere, not even to the local server. What comes out is
 * text (paragraphs, table rows as "cell | cell", headings) with a marker for every image; the PDF itself, its
 * images and its hidden details never leave the page. Scanned pages are read from their picture if text
 * recognition is installed and turned on (ocrLanguages), otherwise marked as not read.
 */
export const PDF_IMPORTER = {
  label: 'PDF',
  extensions: ['pdf'],
  async read(file, { signal, progress = () => {}, ocrLanguages = [] } = {}) {
    if (file.size > MAX_PDF_BYTES) throw new Error(`"${file.name}" is larger than 50 MB. Split it into smaller parts.`);
    const data = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder('latin1').decode(data.subarray(0, PDF_SIGNATURE.length)) !== PDF_SIGNATURE) throw new Error(`"${file.name}" is not a PDF.`);
    const pdfjs = await loadPdfjs();
    const loading = pdfjs.getDocument({
      data,
      isEvalSupported: false,
      cMapUrl: PDFJS_FOLDER + 'cmaps/',
      standardFontDataUrl: PDFJS_FOLDER + 'standard_fonts/',
      wasmUrl: PDFJS_FOLDER + 'wasm/',
    });
    try {
      let pdf;
      try {
        pdf = await loading.promise;
      } catch (e) {
        throw new Error(e.name === 'PasswordException' ? `"${file.name}" is protected by a password. Save a copy without it first.` : `"${file.name}" could not be read as a PDF (${e.message}).`);
      }
      const pdfPages = [];
      const pages = [];
      for (let number = 1; number <= pdf.numPages; number++) {
        signal?.throwIfAborted();
        progress(`Reading page ${number} of ${pdf.numPages} on this computer.`);
        pdfPages.push(await pdf.getPage(number));
        pages.push(await readPage(pdfjs, pdfPages.at(-1)));
      }
      const scans = pages.flatMap((page, i) => (page.isScan ? [i] : []));
      const recognized = scans.length && ocrLanguages.length
        ? await recognizePages(scans.map((i) => ({ index: i, page: pdfPages[i] })), { languages: ocrLanguages, signal, progress })
        : [];
      const { text, ...facts } = layoutDocument(pages, recognized);
      return { text, document: { ...facts, recognizedPages: recognized.filter((t) => typeof t === 'string').length } };
    } finally {
      await loading.destroy();
    }
  },
};
