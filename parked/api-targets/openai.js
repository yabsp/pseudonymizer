import { postJson, requireModel } from './post-json.js';

/** Any OpenAI-compatible chat completions API (ChatGPT, Ollama, LM Studio, OpenRouter, ...). */
export async function callOpenAiCompatible({ prompt, system, baseUrl, model, apiKey }, signal) {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const data = await postJson(`${baseUrl}/chat/completions`, headers, {
    model: requireModel(model),
    messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
  }, signal);
  return data.choices[0].message.content;
}
