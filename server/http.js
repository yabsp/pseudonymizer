import { ALLOWED_HOSTS, ALLOWED_ORIGINS } from './config.js';

// Types whose content is text, so the character set is named; images such as PNG are bytes.
const TEXT_TYPE = /^text\/|json$|\+xml$/;

export function send(res, status, body, type = 'application/json') {
  const contentType = TEXT_TYPE.test(type) ? type + '; charset=utf-8' : type;
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

export async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body;
}

export class BodyTooLargeError extends Error {}

/** The raw request body; stops reading and throws BodyTooLargeError past maxBytes, so a huge upload can't fill memory. */
export async function readBytes(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new BodyTooLargeError(`larger than ${Math.round(maxBytes / 1024 / 1024)} MB`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// The Host header check stops DNS rebinding: another site's domain pointed at 127.0.0.1.
export const isAllowedHost = (req) => ALLOWED_HOSTS.includes(req.headers.host);

/**
 * For requests without a body that change something (DELETE). Browsers send Origin with them, and other sites
 * can't send a DELETE at all without CORS. Sends the error and returns true if rejected.
 */
export function rejectUnlessFromAppOrigin(req, res) {
  if (ALLOWED_ORIGINS.includes(req.headers.origin)) return false;
  send(res, 403, { error: 'Origin not allowed.' });
  return true;
}

/**
 * For requests that change something or start a process. Sends the error and returns true if rejected.
 * The type must be one a plain HTML form can't send (JSON, PDF), so other sites can't post here without CORS.
 */
export function rejectUnlessFromApp(req, res, type = 'application/json') {
  if (rejectUnlessFromAppOrigin(req, res)) return true;
  if (!(req.headers['content-type'] || '').startsWith(type)) {
    send(res, 415, { error: type === 'application/json' ? 'JSON expected.' : `${type} expected.` });
    return true;
  }
  return false;
}
