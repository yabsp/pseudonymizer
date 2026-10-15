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

// The Host header check stops DNS rebinding: another site's domain pointed at 127.0.0.1.
export const isAllowedHost = (req) => ALLOWED_HOSTS.includes(req.headers.host);

/** For requests that change something or start a process. Sends the error and returns true if rejected. */
export function rejectUnlessFromApp(req, res) {
  if (!ALLOWED_ORIGINS.includes(req.headers.origin)) {
    send(res, 403, { error: 'Origin not allowed.' });
    return true;
  }
  if (!(req.headers['content-type'] || '').startsWith('application/json')) {
    send(res, 415, { error: 'JSON expected.' });
    return true;
  }
  return false;
}
