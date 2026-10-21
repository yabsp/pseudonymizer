import { callServer } from '../server-api.js';

// The server's limit (MAX_PDF_BYTES in server/config.js), checked here first so a large file isn't uploaded in vain.
const MAX_PDF_BYTES = 50 * 1024 * 1024;

/**
 * The PDF goes to the local server only, which extracts it with Docling on this machine. What comes back is
 * Markdown (headings, tables, formulas as LaTeX if converted) with a marker for every image; the PDF itself is
 * never sent on. With formulas, they are converted too, which takes about 10 to 20 seconds each on the processor, a few seconds on an Intel iGPU and under a second on an NVIDIA GPU.
 */
export const PDF_IMPORTER = {
  label: 'PDF',
  job: { format: 'pdf', contentType: 'application/pdf', maxBytes: MAX_PDF_BYTES },
  extensions: ['pdf'],
  async read(file, { signal, progress = () => {}, formulas = false, accelerator = 'auto' } = {}) {
    if (file.size > MAX_PDF_BYTES) throw new Error(`"${file.name}" is larger than 50 MB. Split it into smaller parts.`);
    progress(formulas
      ? 'Converting formulas on this machine. This takes about 10 to 20 seconds per formula, less with a graphics card.'
      : 'Reading text, tables and images on this machine. Scanned pages take longer.');
    const query = new URLSearchParams({ accelerator, ...(formulas ? { formulas: '1' } : {}) });
    const result = await callServer(`api/extract/pdf?${query}`, {
      method: 'POST', body: file, contentType: 'application/pdf', signal,
    });
    const { markdown, ...facts } = result;
    return { text: markdown, document: facts };
  },
};
