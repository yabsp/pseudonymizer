/** body is sent as JSON; with contentType, it is sent as it is (a File for an upload). */
export async function callServer(path, { method = 'GET', body, signal, contentType } = {}) {
  const res = await fetch(path, {
    method,
    signal,
    cache: 'no-store',
    headers: body === undefined ? {} : { 'Content-Type': contentType || 'application/json' },
    body: body === undefined || contentType ? body : JSON.stringify(body),
  });
  const isServerMissing = res.status === 404 || res.status === 405;
  const data = await res.json().catch(() => ({
    error: isServerMissing ? 'Start the app with "npm start".' : `Server returned ${res.status}`,
  }));
  if (!res.ok) throw new Error(data.error);
  return data;
}
