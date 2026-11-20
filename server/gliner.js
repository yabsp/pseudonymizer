// The only place that runs the detection model: GLiNER (a span model that finds what the labels describe) on
// ONNX Runtime, on this machine. Nothing here talks to a network.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

// A word as GLiNER counts it (u flag): letters, digits or "_", possibly joined by "-" or "_" ("2021-03-15",
// "Jean-Luc"), or any other single character that is no whitespace (",", ".", "@"), so "a,b@c.d" is 7 words.
const WORD = /[\p{L}\p{N}_]+(?:[-_][\p{L}\p{N}_]+)*|\S/gu;
// An underscore between two letters or digits: "Carla_Imhof", "Kaelin_Erich_2026".
const UNDERSCORE_IN_WORD = /(?<=[\p{L}\p{N}])_(?=[\p{L}\p{N}])/gu;

// GLiNER reads at most 384 words at once; 150-word windows still find every name in dense table rows (200 did
// not). A window ends at a line break if there is one in its second half, as no value runs across lines; inside
// a longer line the next window starts 40 words back, more than the longest value (12 words).
export const WINDOW_WORDS = 150;
const MIN_WINDOW_WORDS = 75;
const OVERLAP_WORDS = 40;
// Spans are found once down to this score and kept; a request's threshold then only picks from them. As the best
// score wins, that gives the same spans as searching with the threshold itself.
const KEPT_SCORE = 0.2;
const MAX_CACHED_WINDOWS = 4000;
const MAX_CACHED_WORDS = 200_000;

// The accelerators ONNX Runtime for Node can use; the processor is the reference and the fallback. An explicit
// list: ONNX Runtime also has a provider that hands the work to a cloud service, and it must never be picked. Core ML
// uses the Neural Engine (the NPU of Apple chips) and the graphics.
const ACCELERATORS = {
  dml: { name: 'dml', label: 'the graphics card (DirectML)' },
  cuda: { name: 'cuda', label: 'the NVIDIA graphics card (CUDA)' },
  coreml: { name: 'coreml', label: 'the Neural Engine and graphics (Core ML)' },
  webgpu: { name: 'webgpu', label: 'the graphics card (WebGPU)' },
};
// The ones tried without being asked for, per system. Not WebGPU: it was slower than the processor where it was
// measured (Windows, Linux in WSL), and probing it takes long enough to hold up the start and the end of the app.
const AUTOMATIC = { win32: ['dml'], linux: ['cuda'], darwin: ['coreml'] };
const PROCESSOR = { name: 'cpu', label: 'the processor' };
// A window like the ones the app reads, with the kinds of values it looks for in four languages (made up). An
// accelerator must find the same in it as the processor before it is used.
const CHECK_TEXT = `Austrittsbericht vom 12.03.2026. Patientin Maria Keller, geboren am 14.02.1961, wohnt an der Rebgasse 21 in
4058 Basel, Telefon 061 555 12 34, E-Mail maria.keller@example.com. Hausarzt: Dr. med. Peter Brunner, Praxis am
Bahnhof, Bahnhofplatz 3, 8910 Affoltern am Albis.
Monsieur Thierry Baud, né le 3 avril 1975, travaille chez Horlogerie Fleurier SA et habite rue des Moulins 12,
2000 Neuchâtel.
La signora Giulia Ferrari, nata il 21.09.1982, lavora presso Banca Ticinese SA a Lugano, telefono +41 91 555 66 77.
Mr. James O'Connor, date of birth 7 June 1990, works for Northwind Consulting Ltd in Zurich, james.oconnor@example.com.`;
const CHECK_LABELS = ['person', 'organization', 'address', 'date of birth', 'phone number', 'email address', 'city'];
// The most any span's probability may differ from the processor's. Measured with DirectML and WebGPU: 1.5e-5.
const CHECK_TOLERANCE = 0.02;
// The first run of a session includes one-time work (on a graphics card: compiling); the fastest later run counts.
const CHECK_RUNS = 3;
// On an accelerator, inputs are filled up to a multiple of this many tokens (see shapedInputs).
const TOKEN_STEP = 128;

/** The words of a text with their positions: [{ start, end }]. */
export function splitWords(text) {
  return [...text.matchAll(WORD)].map((m) => ({ start: m.index, end: m.index + m[0].length }));
}

/** The windows over the words of text as [from, to) pairs of word indexes. */
export function planWindows(text, words) {
  const windows = [];
  let from = 0;
  while (from < words.length) {
    const to = Math.min(words.length, from + WINDOW_WORDS);
    if (to === words.length) {
      windows.push([from, to]);
      break;
    }
    let cut = to;
    while (cut > from + MIN_WINDOW_WORDS && !text.slice(words[cut - 1].end, words[cut].start).includes('\n')) cut--;
    const endsAtLineBreak = cut > from + MIN_WINDOW_WORDS;
    windows.push([from, endsAtLineBreak ? cut : to]);
    from = endsAtLineBreak ? cut : to - OVERLAP_WORDS;
  }
  return windows;
}

/**
 * The spans a window's scores name, as GLiNER decodes flat entities: every span of up to maxWidth words whose
 * score for a label is above the threshold, best score first, dropping what overlaps a span already kept.
 * logits: one value per (start word, width, label). Returns [{ from, to, label, score }], word indexes inclusive.
 */
export function decodeSpans(logits, wordCount, maxWidth, labelCount, threshold) {
  const minLogit = Math.log(threshold / (1 - threshold));
  const candidates = [];
  for (let from = 0; from < wordCount; from++) {
    for (let width = 0; width < maxWidth && from + width < wordCount; width++) {
      const base = (from * maxWidth + width) * labelCount;
      for (let label = 0; label < labelCount; label++) {
        const logit = logits[base + label];
        if (logit > minLogit) candidates.push({ from, to: from + width, label, score: 1 / (1 + Math.exp(-logit)) });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const kept = [];
  for (const candidate of candidates) {
    if (!kept.some((k) => candidate.from <= k.to && k.from <= candidate.to)) kept.push(candidate);
  }
  return kept;
}

/**
 * The accelerators to try for a device setting (server/config.js): { name: 'auto' } this system's, as far as this
 * build of ONNX Runtime has them (supported: its listSupportedBackends(), where "bundled: false" means the library
 * comes separately, such as CUDA's on Linux; isInstalled(name) says whether it is there); { name: 'cpu' } none; any
 * other name that one accelerator, on the graphics adapter deviceId if given. Returns [{ name, label, deviceId? }].
 */
export function acceleratorsFor(device, supported, platform = process.platform, isInstalled = () => false) {
  if (device.name === 'cpu') return [];
  if (device.name === 'auto') {
    const names = new Set(supported.filter((backend) => backend.bundled || isInstalled(backend.name)).map((backend) => backend.name));
    return (AUTOMATIC[platform] ?? []).filter((name) => names.has(name)).map((name) => ACCELERATORS[name]);
  }
  return [{ ...ACCELERATORS[device.name], ...(device.deviceId === undefined ? {} : { deviceId: device.deviceId }) }];
}

/** The largest difference between two lists of probabilities; Infinity if they can't be compared. */
export function largestDifference(a, b) {
  if (a.length !== b.length) return Infinity;
  let largest = 0;
  for (let i = 0; i < a.length; i++) {
    const difference = Math.abs(a[i] - b[i]);
    if (!(difference <= largest)) largest = Number.isNaN(difference) ? Infinity : difference;
  }
  return largest;
}

/**
 * Chooses where the model runs. The processor's result on the check window is the reference: an accelerator is
 * used only if no probability differs by more than CHECK_TOLERANCE and, unless it was asked for by name
 * (mustBeFaster false), it reads the window faster. Wrong results from a faulty driver would hide fewer values, so
 * anything doubtful runs on the processor. open(accelerator, or null for the processor) resolves to a session,
 * check(session, accelerator or null) to { probabilities, ms }. Resolves to { session, device: { name, label, checked? } }, checked
 * being { difference, ms, processorMs } of the check for an accelerator.
 */
export async function pickDevice(accelerators, { open, check, mustBeFaster }) {
  const processor = await open(null);
  if (!accelerators.length) return { session: processor, device: PROCESSOR };
  const reference = await check(processor, null);
  await processor.release(); // only one copy of the model in memory at a time
  const problems = [];
  for (const accelerator of accelerators) {
    let session = null;
    try {
      session = await open(accelerator);
      const result = await check(session, accelerator);
      const difference = largestDifference(reference.probabilities, result.probabilities);
      if (!(difference <= CHECK_TOLERANCE)) {
        problems.push(`${accelerator.label} gave other results`);
      } else if (mustBeFaster && result.ms >= reference.ms) {
        problems.push(`${accelerator.label} was not faster`);
      } else {
        const checked = { difference, ms: Math.round(result.ms), processorMs: Math.round(reference.ms) };
        return { session, device: { name: accelerator.name, label: accelerator.label, checked } };
      }
    } catch (e) {
      problems.push(`${accelerator.label} could not be used: ${String(e.message).split('\n')[0].slice(0, 160)}`);
    }
    await session?.release();
  }
  return { session: await open(null), device: { name: PROCESSOR.name, label: `${PROCESSOR.label} (${problems.join('; ')})` } };
}

function sessionOptions(accelerator, threads) {
  const options = { graphOptimizationLevel: 'all', logSeverityLevel: 3, ...(threads ? { intraOpNumThreads: threads } : {}) };
  if (!accelerator) return { ...options, executionProviders: ['cpu'] };
  const provider = { name: accelerator.name, ...(accelerator.deviceId === undefined ? {} : { deviceId: accelerator.deviceId }) };
  // DirectML can't use ONNX Runtime's memory patterns or parallel execution (its documentation says so).
  const forDirectMl = accelerator.name === 'dml' ? { enableMemPattern: false, executionMode: 'sequential' } : {};
  // What the accelerator can't run stays on the processor.
  return { ...options, ...forDirectMl, executionProviders: [provider, 'cpu'] };
}

function readModelFiles(modelDir) {
  const read = (name) => JSON.parse(fs.readFileSync(path.join(modelDir, name), 'utf8'));
  try {
    const manifest = read('model.json');
    if (typeof manifest.file !== 'string' || path.basename(manifest.file) !== manifest.file) throw new Error('model.json names no model file');
    const file = path.join(modelDir, manifest.file);
    if (!fs.existsSync(file)) throw new Error(`${manifest.file} is missing`);
    return { name: String(manifest.name ?? manifest.file), file, tokenizer: read('tokenizer.json'), tokenizerConfig: read('tokenizer_config.json'), gliner: read('gliner_config.json') };
  } catch (e) {
    throw new Error(`The detection model is not installed (${e.code === 'ENOENT' ? 'files are missing in ' + modelDir : e.message}). Run "npm run setup".`);
  }
}

/**
 * Loads the model in modelDir (model.json, the ONNX file it names, tokenizer.json, tokenizer_config.json,
 * gliner_config.json) on the device chosen by pickDevice. Resolves to { name, device: { name, label },
 * detect(text, labels, threshold, signal), release() }.
 */
export async function loadGliner(modelDir, { threads = 0, device = { name: 'auto' } } = {}) {
  const files = readModelFiles(modelDir);
  // As shipped, ONNX Runtime sends usage reports to Microsoft and keeps a file about them in the user's folder.
  // This turns both off, but only when set before the library loads (measured: docs/reference.md, "Checking for
  // network calls"; tests/server/detect.test.mjs guards the order).
  process.env.ORT_DISABLE_TELEMETRY = '1';
  let ort;
  let Tokenizer;
  try {
    ort = await import('onnxruntime-node');
    ({ Tokenizer } = await import('@huggingface/tokenizers'));
  } catch (e) {
    throw new Error(`The detection packages are not installed (${e.code ?? e.message}). Run "npm run setup".`);
  }
  const tokenizer = new Tokenizer(files.tokenizer, files.tokenizerConfig);
  const maxWidth = files.gliner.max_width;

  const idsOf = (text, withSpecial = false) => tokenizer.encode(text, { add_special_tokens: withSpecial }).ids.map(BigInt);
  // The tokens the tokenizer puts around a text ([CLS] ... [SEP]), found by comparing a text with and without them.
  const [plain, framed] = [idsOf('a'), idsOf('a', true)];
  const at = framed.indexOf(plain[0]);
  const [prefix, suffix] = [framed.slice(0, at), framed.slice(at + plain.length)];
  const [entToken] = idsOf(files.gliner.ent_token);
  const [sepToken] = idsOf(files.gliner.sep_token);
  const unknownToken = BigInt(tokenizer.token_to_id(files.tokenizerConfig.unk_token ?? '[UNK]') ?? 3);

  const tokenCache = new Map();
  /** The tokens of one word; a word the tokenizer drops entirely counts as unknown, so words and tokens stay aligned. */
  function tokensOf(word) {
    let tokens = tokenCache.get(word);
    if (!tokens) {
      tokens = idsOf(word);
      if (!tokens.length) tokens = [unknownToken];
      if (tokenCache.size < MAX_CACHED_WORDS) tokenCache.set(word, tokens);
    }
    return tokens;
  }

  const promptFor = (labels) => labels.flatMap((label) => [entToken, ...tokensOf(label)]).concat(sepToken);

  /** One window as the model reads it: its tokens after the prompt, and for each token the word it starts or 0. */
  function rowOf(text, words, prompt) {
    const ids = [...prefix, ...prompt];
    const wordOfToken = new Array(ids.length).fill(0n);
    words.forEach((word, index) => {
      tokensOf(text.slice(word.start, word.end)).forEach((token, t) => {
        ids.push(token);
        wordOfToken.push(t === 0 ? BigInt(index + 1) : 0n);
      });
    });
    for (const token of suffix) {
      ids.push(token);
      wordOfToken.push(0n);
    }
    return { ids, wordOfToken, count: words.length };
  }

  /** The model's inputs for rows read together, each filled up to tokenSlots tokens and wordSlots words. */
  function inputsFor(rows, tokenSlots, wordSlots) {
    const ids = new BigInt64Array(rows.length * tokenSlots);
    const attention = new BigInt64Array(rows.length * tokenSlots);
    const wordsMask = new BigInt64Array(rows.length * tokenSlots);
    const spans = new BigInt64Array(rows.length * wordSlots * maxWidth * 2);
    const spanMask = new Uint8Array(rows.length * wordSlots * maxWidth);
    rows.forEach((row, r) => {
      row.ids.forEach((id, t) => {
        ids[r * tokenSlots + t] = id;
        attention[r * tokenSlots + t] = 1n;
        wordsMask[r * tokenSlots + t] = row.wordOfToken[t];
      });
      for (let from = 0; from < row.count; from++) {
        for (let width = 0; width < maxWidth && from + width < row.count; width++) {
          const span = (r * wordSlots + from) * maxWidth + width;
          spans[span * 2] = BigInt(from);
          spans[span * 2 + 1] = BigInt(from + width);
          spanMask[span] = 1;
        }
      }
    });
    const lengths = BigInt64Array.from(rows.map((row) => BigInt(row.count)));
    return {
      input_ids: new ort.Tensor('int64', ids, [rows.length, tokenSlots]),
      attention_mask: new ort.Tensor('int64', attention, [rows.length, tokenSlots]),
      words_mask: new ort.Tensor('int64', wordsMask, [rows.length, tokenSlots]),
      text_lengths: new ort.Tensor('int64', lengths, [rows.length, 1]),
      span_idx: new ort.Tensor('int64', spans, [rows.length, wordSlots * maxWidth, 2]),
      span_mask: new ort.Tensor('bool', spanMask, [rows.length, wordSlots * maxWidth]),
    };
  }

  // On the processor a window is read as it is. An accelerator pays more for an input of a new size than for the
  // whole reading, and every window has another size, so there each one gets the same shape: it is read together
  // with a filler of WINDOW_WORDS words (the model's recurrent layer stops at each row's own length, so the window
  // reads exactly as alone; the filler's results are not looked at), and the tokens are filled up to a multiple of
  // TOKEN_STEP, masked out.
  const fillerText = 'a '.repeat(WINDOW_WORDS);
  const fillerWords = splitWords(fillerText);
  function shapedInputs(row, prompt, onAccelerator) {
    if (!onAccelerator) return inputsFor([row], row.ids.length, row.count);
    const filler = rowOf(fillerText, fillerWords, prompt);
    const tokenSlots = Math.ceil(Math.max(row.ids.length, filler.ids.length) / TOKEN_STEP) * TOKEN_STEP;
    return inputsFor([row, filler], tokenSlots, WINDOW_WORDS);
  }

  /** The model's scores for the first row read: one value per (first word, width, label). */
  async function scoresOf(session, inputs) {
    const { logits } = await session.run(inputs, ['logits']);
    return logits.data;
  }

  // Two check windows of different lengths, read in turn as real windows would be.
  const checkPrompt = promptFor(CHECK_LABELS);
  const checkRows = [WINDOW_WORDS, Math.round(WINDOW_WORDS * 0.6)].map((n) => rowOf(CHECK_TEXT, splitWords(CHECK_TEXT).slice(0, n), checkPrompt));
  /** The check windows' probabilities for every span that fits in them, and the fastest later round in ms. */
  async function check(session, accelerator) {
    const inputs = checkRows.map((row) => shapedInputs(row, checkPrompt, accelerator !== null));
    let ms = Infinity;
    let rounds;
    for (let round = 0; round < CHECK_RUNS; round++) {
      const started = performance.now();
      rounds = [];
      for (const input of inputs) rounds.push(await scoresOf(session, input));
      if (round > 0) ms = Math.min(ms, performance.now() - started);
    }
    const probabilities = [];
    checkRows.forEach((row, i) => {
      for (let from = 0; from < row.count; from++) {
        for (let width = 0; width < maxWidth && from + width < row.count; width++) {
          const base = (from * maxWidth + width) * CHECK_LABELS.length;
          for (let label = 0; label < CHECK_LABELS.length; label++) probabilities.push(1 / (1 + Math.exp(-rounds[i][base + label])));
        }
      }
    });
    return { probabilities, ms };
  }

  // A provider ONNX Runtime does not ship is installed next to its own library ("npm run setup" does that for CUDA).
  const libraries = path.join(path.dirname(createRequire(import.meta.url).resolve('onnxruntime-node')), '..', 'bin', 'napi-v6', process.platform, process.arch);
  const isInstalled = (name) => fs.existsSync(path.join(libraries, `libonnxruntime_providers_${name}.so`));
  const accelerators = acceleratorsFor(device, ort.listSupportedBackends(), process.platform, isInstalled);
  const open = (accelerator) => ort.InferenceSession.create(files.file, sessionOptions(accelerator, threads));
  const { session, device: chosen } = await pickDevice(accelerators, { open, check, mustBeFaster: device.name === 'auto' });
  const onAccelerator = chosen.name !== PROCESSOR.name;

  /** The best non-overlapping spans of one window of words, down to minScore. */
  async function readWindow(text, words, prompt, labelCount, minScore) {
    const scores = await scoresOf(session, shapedInputs(rowOf(text, words, prompt), prompt, onAccelerator));
    return decodeSpans(scores, words.length, maxWidth, labelCount, minScore);
  }

  // What each window read so far gave, by a hash of the labels and the window's text (the text itself is not
  // kept). Finding the values again after a small change of the text then only reads the windows that changed.
  // In memory only, oldest forgotten first.
  const windowCache = new Map();
  async function spansOf(text, words, prompt, labels, minScore) {
    const windowText = text.slice(words[0].start, words.at(-1).end);
    const key = crypto.createHash('sha256').update(JSON.stringify([labels, minScore, windowText])).digest('base64');
    let spans = windowCache.get(key);
    if (spans) windowCache.delete(key); // put back below as the newest
    else spans = await readWindow(text, words, prompt, labels.length, minScore);
    windowCache.set(key, spans);
    if (windowCache.size > MAX_CACHED_WINDOWS) windowCache.delete(windowCache.keys().next().value);
    return spans;
  }

  /**
   * The values in text that the labels describe: [{ text, label, start, end, score }] in reading order. An aborted
   * signal stops between two windows with an AbortError.
   */
  async function detect(text, labels, threshold, signal) {
    if (!labels.length || !text.trim()) return [];
    const prompt = promptFor(labels);
    // The text as it is, and where words are joined by underscores ("Vertrag_Mueller.pdf", one word to the model,
    // which then never finds the name in it) a second time with spaces instead. A space replaces each underscore,
    // so the positions stay the same.
    const readings = [];
    const words = splitWords(text);
    for (const [from, to] of planWindows(text, words)) readings.push({ source: text, words: words.slice(from, to) });
    const spaced = text.replace(UNDERSCORE_IN_WORD, ' ');
    if (spaced !== text) {
      const spacedWords = splitWords(spaced);
      for (const [from, to] of planWindows(spaced, spacedWords)) {
        const [start, end] = [spacedWords[from].start, spacedWords[to - 1].end];
        if (spaced.slice(start, end) !== text.slice(start, end)) readings.push({ source: spaced, words: spacedWords.slice(from, to) });
      }
    }
    const minScore = Math.min(threshold, KEPT_SCORE);
    const best = new Map();
    for (const { source, words: windowWords } of readings) {
      signal?.throwIfAborted();
      for (const span of await spansOf(source, windowWords, prompt, labels, minScore)) {
        if (span.score < threshold) continue;
        const [start, end] = [windowWords[span.from].start, windowWords[span.to].end];
        const key = `${start}:${end}`;
        if (!best.has(key) || span.score > best.get(key).score) {
          best.set(key, { text: text.slice(start, end), label: labels[span.label], start, end, score: Math.round(span.score * 1000) / 1000 });
        }
      }
    }
    return [...best.values()].sort((a, b) => a.start - b.start);
  }

  return { name: files.name, device: chosen, detect, release: () => session.release() };
}
