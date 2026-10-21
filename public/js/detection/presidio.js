import { callServer } from '../server-api.js';
import { DEFAULT_GLINER_MODEL } from './gliner.js';
import { categoryForLabel } from './gliner-labels.js';

export const LANGUAGE_NAMES = { de: 'German', fr: 'French', en: 'English' };

// Presidio's entity types; a type not listed here still becomes a value to hide, as OTHER. Plain dates and
// nationalities are ignored, as with GLiNER, whose labels only ask for dates of birth: replacing every date
// would remove the timeline a doctor's or lawyer's question is about.
const PRESIDIO_CATEGORIES = {
  PERSON: 'PERSON',
  ORGANIZATION: 'COMPANY',
  LOCATION: 'ADDRESS',
  PHONE_NUMBER: 'PHONE',
  EMAIL: 'EMAIL',
  IBAN_CODE: 'ID',
  CREDIT_CARD: 'CARD',
  CRYPTO: 'ID',
  IP_ADDRESS: 'IP',
  MAC_ADDRESS: 'MAC',
  MEDICAL_LICENSE: 'ID',
  DATE_TIME: null,
  NRP: null,
};

function categoryOf(entity, labels) {
  if (entity.source !== 'presidio') return categoryForLabel(labels, entity.label);
  return Object.hasOwn(PRESIDIO_CATEGORIES, entity.label) ? PRESIDIO_CATEGORIES[entity.label] : 'OTHER';
}

/** The server's answer as { text, category }, without the ignored types. */
export function categorizePresidioEntities(entities, labels) {
  return entities
    .map((e) => ({ text: e.text, category: categoryOf(e, labels) }))
    .filter((e) => e.category !== null);
}

/** GLiNER and Presidio together; language is "auto" or one of LANGUAGE_NAMES, and the one used is returned. */
export async function detectWithPresidio(text, labels, { glinerModel, glinerThreshold, presidioLanguage, accelerator }, signal) {
  const { entities, language, runtime } = await callServer('api/detect/presidio', {
    method: 'POST',
    signal,
    body: {
      text,
      labels: Object.keys(labels),
      threshold: Number(glinerThreshold) || 0.4,
      model: glinerModel.trim() || DEFAULT_GLINER_MODEL,
      language: presidioLanguage || 'auto',
      accelerator: accelerator || 'auto',
    },
  });
  return { entities: categorizePresidioEntities(entities, labels), language, runtime };
}
