/** POSTs JSON to a model provider's API and returns the parsed answer, or throws with the start of its error. */
export async function postJson(url, headers, body, signal) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

/** The model name, or an error telling the user to set one. */
export function requireModel(model) {
  if (!model) throw new Error('Set a target model name in Settings.');
  return model;
}
