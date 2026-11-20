// Types whose content is text, so the character set is named; images such as PNG are bytes.
const TEXT_TYPE = /^text\/|json$|\+xml$/;

/** An expected problem with a request: answered as { "error": message } with this status. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, body, type = 'application/json', headers = {}) {
  const contentType = TEXT_TYPE.test(type) ? type + '; charset=utf-8' : type;
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

/** The request body as bytes; stops reading past maxBytes, so a huge upload can't fill the memory. */
async function readBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, `The request is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** The request body as a JSON object; anything else is a 400. */
export async function readJson(req, maxBytes) {
  const bytes = await readBody(req, maxBytes);
  let data;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new HttpError(400, 'The request is not valid JSON.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'The request must be a JSON object.');
  return data;
}

const hostsOf = (port) => [`localhost:${port}`, `127.0.0.1:${port}`];

/** The Host header check stops DNS rebinding: another site's domain pointed at 127.0.0.1. */
export const isAllowedHost = (req, port) => hostsOf(port).includes(req.headers.host);

/**
 * For requests that change something or start work: they must come from the app's own page (Origin) and carry
 * JSON, a type a plain HTML form on another site can't send. Throws the HttpError to answer with.
 */
export function requireFromApp(req, port) {
  const origins = hostsOf(port).map((host) => 'http://' + host);
  if (!origins.includes(req.headers.origin)) throw new HttpError(403, 'Origin not allowed.');
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'JSON expected.');
}
