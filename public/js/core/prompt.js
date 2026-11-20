import { normalizeText, valuePattern } from './mapping.js';

// Introduces a document (from a PDF), so the model can tell it apart from the question that follows. The file
// name is left out on purpose: it often contains a name ("Befund_Hans_Muster.pdf").
const DOCUMENT_INTRO = 'Attached document, read from a PDF as text. Table rows are written as "cell | cell". Images and pages that could not be read are marked and were not sent.';

/** With isDocument, the pseudonymized text is sent as an attached document between <document> markers. */
export function buildPrompt(pseudoText, extraText, { isDocument = false } = {}) {
  const text = pseudoText.trim();
  const body = isDocument && text ? `${DOCUMENT_INTRO}\n<document>\n${text}\n</document>` : text;
  return [body, extraText.trim()].filter(Boolean).join('\n\n');
}

/**
 * Why the text must not leave the machine yet, or null if it may: 'notDetected', 'textChanged' (detection ran on
 * another text, so new values would stay visible), or the problem detection left: 'listLoaded' (a saved list
 * replaced the values found). textAtLastDetection === null: not detected yet.
 */
export function whySendIsBlocked({ textAtLastDetection, currentText, detectionProblem }) {
  if (textAtLastDetection === null) return 'notDetected';
  if (textAtLastDetection !== currentText) return 'textChanged';
  return detectionProblem;
}

/** The mapped values found in text that is sent unchanged, so the user can be warned about them. */
export function findMappedValues(mapping, original) {
  const text = normalizeText(original);
  return mapping.filter((m) => m.original && m.original.trim() && new RegExp(valuePattern(m.original), 'u').test(text)).map((m) => m.original);
}
