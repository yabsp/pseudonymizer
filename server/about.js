import { APP_KIND, AVAILABLE_DETECTORS, DOCUMENT_FORMATS } from './config.js';
import { send } from './http.js';

export function getAbout(req, res) {
  send(res, 200, { app: APP_KIND, detectors: AVAILABLE_DETECTORS, documents: DOCUMENT_FORMATS });
}
