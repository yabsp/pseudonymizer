export async function callServer(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(path, {
    method,
    signal,
    cache: 'no-store',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const isServerMissing = res.status === 404 || res.status === 405;
  const data = await res.json().catch(() => ({
    error: isServerMissing ? 'Start the app with "npm start".' : `Server returned ${res.status}`,
  }));
  if (!res.ok) throw new Error(data.error);
  return data;
}
