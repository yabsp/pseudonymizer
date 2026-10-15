import { postJson, requireModel } from './post-json.js';

/** Anthropic Messages API, called directly from the browser with the user's key. */
export async function callAnthropic({ prompt, system, baseUrl, model, apiKey }, signal) {
  const data = await postJson(`${baseUrl}/v1/messages`, {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }, { model: requireModel(model), max_tokens: 8192, system, messages: [{ role: 'user', content: prompt }] }, signal);
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}
