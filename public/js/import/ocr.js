// The only place that uses Tesseract: reads the text of scanned PDF pages from their picture, in this page.
// Program and language files come from the local server (the installed packages); nothing is loaded from the
// internet, and no picture or text leaves the page.

const VENDOR = new URL('../../vendor/', import.meta.url).href;
// 200 dots per inch, what text recognition is tuned for; a PDF page is measured in points of 1/72 inch.
const SCALE = 200 / 72;
const MAX_PIXELS = 4200;
// Tesseract's own neural network only (its engine mode 1), which the language files are made for.
const ENGINE_NEURAL_ONLY = 1;

async function renderPage(page) {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(SCALE, MAX_PIXELS / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, viewport }).promise;
  return canvas;
}

/**
 * scans: [{ index, page }] with pdf.js pages. Resolves to a list with the recognized text at each index (other
 * places stay empty). languages: codes such as "deu", "fra", "ita", "eng"; more languages take longer.
 */
export async function recognizePages(scans, { languages, signal, progress = () => {} }) {
  let Tesseract;
  try {
    Tesseract = await import(VENDOR + 'tesseract/tesseract.esm.min.js');
  } catch (e) {
    throw new Error(`Text recognition could not be loaded (${e.message}). Run "npm run setup".`);
  }
  const createWorker = Tesseract.createWorker ?? Tesseract.default.createWorker;
  progress('Getting text recognition ready for the scanned pages.');
  const worker = await createWorker(languages, ENGINE_NEURAL_ONLY, {
    workerPath: VENDOR + 'tesseract/worker.min.js',
    corePath: VENDOR + 'tesseract-core/',
    langPath: VENDOR + 'tessdata',
    workerBlobURL: false,
    cacheMethod: 'none',
  });
  const stop = () => void worker.terminate();
  signal?.addEventListener('abort', stop, { once: true });
  const recognized = [];
  try {
    for (const [n, { index, page }] of scans.entries()) {
      signal?.throwIfAborted();
      progress(`Reading scanned page ${n + 1} of ${scans.length} from its picture. This takes a few seconds per page.`);
      const canvas = await renderPage(page);
      const result = await worker.recognize(canvas);
      // The picture is not needed any more; its memory is given back right away.
      canvas.width = 0;
      canvas.height = 0;
      recognized[index] = result.data.text;
    }
  } catch (e) {
    signal?.throwIfAborted(); // a cancelled recognition ends as a cancellation, not as the worker's error
    throw e;
  } finally {
    signal?.removeEventListener('abort', stop);
    await worker.terminate();
  }
  return recognized;
}
