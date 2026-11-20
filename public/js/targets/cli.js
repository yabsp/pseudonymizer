import { callServer } from '../server-api.js';

/** Sends the prompt through an AI tool installed on this computer (config/adapters.json); resolves to its answer. */
export async function callCli({ prompt, system, model, cliAdapter }, signal) {
  if (!cliAdapter) throw new Error('No AI tool is chosen. Choose one in Settings.');
  const { text } = await callServer('api/cli/' + encodeURIComponent(cliAdapter), { method: 'POST', body: { prompt, system, model }, signal });
  return text;
}
