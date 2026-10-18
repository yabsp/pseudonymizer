// Plain text files are read as UTF-8 in the browser; nothing is uploaded.
const MAX_TEXT_BYTES = 5 * 1024 * 1024;

export const TEXT_IMPORTER = {
  label: 'Text',
  // For the Documents tab: the format and upload type of POST /api/jobs (server/jobs.js), and the size limit.
  job: { format: 'text', contentType: 'application/octet-stream', maxBytes: MAX_TEXT_BYTES },
  extensions: ['txt', 'md', 'csv', 'tsv', 'json', 'log', 'xml', 'html', 'eml'],
  async read(file) {
    if (file.size > MAX_TEXT_BYTES) throw new Error(`"${file.name}" is larger than 5 MB. Split it into smaller parts.`);
    return { text: await file.text() };
  },
};
