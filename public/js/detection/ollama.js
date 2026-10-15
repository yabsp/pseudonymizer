import { chunkText } from '../core/chunking.js';

// One or more "/" at the end of a URL.
const TRAILING_SLASHES = /\/+$/;
// "embed" anywhere in a model name, any case: embedding models, which can't detect anything.
const EMBEDDING_MODEL = /embed/i;
const LIST_TIMEOUT_MS = 5000;

const apiUrl = (ollamaUrl, path) => ollamaUrl.replace(TRAILING_SLASHES, '') + path;

export async function listOllamaModels(ollamaUrl) {
  const res = await fetch(apiUrl(ollamaUrl, '/api/tags'), { signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
  const { models } = await res.json();
  return models.map((m) => m.name).filter((name) => !EMBEDDING_MODEL.test(name));
}

/** The entities found in one chunk, or null if the model's output was unusable. */
async function detectChunk(chunk, { ollamaUrl, ollamaModel }, instructions, signal) {
  const res = await fetch(apiUrl(ollamaUrl, '/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      format: 'json',
      options: { temperature: 0 },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: chunk },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  try {
    const { entities } = JSON.parse(data.message.content);
    return Array.isArray(entities) ? entities : null;
  } catch {
    return null; // counted as a failed part, which the user is warned about
  }
}

export async function detectWithOllama(text, settings, prompts, { signal, progress }) {
  const instructions = prompts.detection + '\n\n# Rules\n' + prompts.rules;
  const chunks = chunkText(text);
  const entities = [];
  let failed = 0;
  for (const [i, chunk] of chunks.entries()) {
    progress(`${settings.ollamaModel}, part ${i + 1} of ${chunks.length}. This can take a minute.`);
    const found = await detectChunk(chunk, settings, instructions, signal);
    if (found) entities.push(...found);
    else failed++;
  }
  return { entities, failed, parts: chunks.length };
}
