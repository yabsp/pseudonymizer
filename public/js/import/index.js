import { PDF_IMPORTER } from './pdf.js';
import { TEXT_IMPORTER } from './text.js';

// One importer per document format: { label, extensions, read(file, options) -> { text, document? } }, with options
// { signal, progress } and format-specific ones (formulas for PDF). document (optional) holds facts about a
// document that is sent as an attachment: { pages, images, formulas, formulasConverted, tables }.
// A new format (e.g. Word) is one file and one entry here.
export const IMPORTERS = [TEXT_IMPORTER, PDF_IMPORTER];

// The extension of a file name: the characters after the last ".", e.g. "pdf" in "Bericht.v2.PDF".
const EXTENSION = /\.([^.]+)$/;

const extensionOf = (name) => (name.match(EXTENSION)?.[1] || '').toLowerCase();

/** For the file picker's accept attribute, e.g. ".txt,.md,.pdf". */
export const acceptedExtensions = () => IMPORTERS.flatMap((i) => i.extensions).map((ext) => '.' + ext).join(',');

/** The document's text and where it came from; throws a message for the user if the format can't be read. */
export async function importDocument(file, options = {}) {
  const importer = IMPORTERS.find((i) => i.extensions.includes(extensionOf(file.name)));
  if (!importer) {
    const known = IMPORTERS.map((i) => i.label).join(', ');
    throw new Error(`"${file.name}" can't be opened here (supported: ${known}). Copy its text and paste it instead.`);
  }
  const { text, document = null } = await importer.read(file, options);
  return { text, document, source: { name: file.name, format: importer.label } };
}
