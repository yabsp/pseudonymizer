import { callServer } from '../server-api.js';

export async function callCli({ prompt, system, model, cliAdapter }, signal) {
  if (!cliAdapter) throw new Error('No CLI available. Start the app with "npm start".');
  const { text } = await callServer('api/cli/' + encodeURIComponent(cliAdapter), { method: 'POST', body: { prompt, system, model }, signal });
  return text;
}

export const listCliAdapters = () => callServer('api/adapters');
