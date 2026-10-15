import { postJson, requireModel } from './post-json.js';

/** Google Gemini generateContent API. */
export async function callGemini({ prompt, system, baseUrl, model, apiKey }, signal) {
  const data = await postJson(`${baseUrl}/models/${encodeURIComponent(requireModel(model))}:generateContent`, { 'x-goog-api-key': apiKey }, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  }, signal);
  return data.candidates[0].content.parts.map((p) => p.text || '').join('');
}
