import { describeRuntime, detectWithGliner } from './gliner.js';
import { parseGlinerLabels } from './gliner-labels.js';
import { detectWithOllama } from './ollama.js';
import { detectWithPresidio, LANGUAGE_NAMES } from './presidio.js';

function readGlinerLabels(prompts) {
  const { labels, errors } = parseGlinerLabels(prompts.glinerLabels);
  if (errors.length) throw new Error('the GLiNER labels need fixing in the Prompts tab: ' + errors.join('; '));
  return labels;
}

// run() resolves to { entities: [{ text, category }], failed, parts, note? }; failed counts the parts whose
// model output was unusable, so the user can be warned that values are probably missing; note is shown
// with the result.
export const DETECTORS = {
  gliner: {
    isConfigured: () => true,
    async run(text, { settings, prompts, signal, progress }) {
      const labels = readGlinerLabels(prompts);
      progress('GLiNER, on this machine.');
      const { entities, runtime } = await detectWithGliner(text, labels, settings, signal);
      return { entities, failed: 0, parts: 1, note: describeRuntime(runtime) };
    },
    failureHint: '',
  },
  presidio: {
    isConfigured: () => true,
    async run(text, { settings, prompts, signal, progress }) {
      const labels = readGlinerLabels(prompts);
      progress('GLiNER and Presidio, on this machine.');
      const { entities, language, runtime } = await detectWithPresidio(text, labels, settings, signal);
      const how = settings.presidioLanguage === 'auto' ? 'recognized automatically' : 'as set in Settings';
      return { entities, failed: 0, parts: 1, note: `Language: ${LANGUAGE_NAMES[language]}, ${how}. ${describeRuntime(runtime)}`.trim() };
    },
    failureHint: '',
  },
  ollama: {
    isConfigured: (settings) => !!settings.ollamaModel,
    run: (text, { settings, prompts, signal, progress }) => detectWithOllama(text, settings, prompts, { signal, progress }),
    failureHint: ' (Is Ollama running and the model pulled?)',
  },
};
