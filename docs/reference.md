# Technical reference

Facts a developer or an agent needs and the code doesn't state in one place. Setting up and building is in
[BUILDING.md](../BUILDING.md). If something here contradicts the code, the code wins; fix this file.

## Architecture
A page, a small Node server on the same machine, and the AI tools the user installed. The desktop app is the same
server inside Electron, with the page in its window. Nothing confidential leaves the machine; only the
pseudonymized prompt is passed to an AI tool.

```
 Page (public/)                              Local server (server/, 127.0.0.1 only)
 ┌────────────────────────────────┐  HTTP   ┌─────────────────────────────────────────┐
 │ ui/        steps 1 to 4, list  │ ──────▶ │ index.js    createApp: routes, about    │
 │            of documents,       │         │ static.js   public/, /vendor/ packages  │
 │            settings            │         │ settings.js settings.json, prompts/     │
 │ core/      patterns, mapping,  │         │ detect.js   one text at a time, cancel  │
 │            replace, restore    │         │ gliner.js   the model on ONNX Runtime   │
 │ import/    text, PDF (pdf.js), │         │ cli.js ──▶ claude / codex / gemini,     │
 │            scanned pages       │         │             each in a fresh empty folder│
 │ detection.js, targets/cli.js   │         └─────────────────────────────────────────┘
 └────────────────────────────────┘
```

1. **Open.** Text is pasted, or a file is opened or dropped; `import/index.js` picks the importer. Files are read in
   the page: text as UTF-8, PDFs with pdf.js. Nothing is uploaded, not even to the local server.
2. **Detect.** `detection.js` sends the text to `POST /api/detect` (the model), runs the fixed patterns
   (`core/patterns.js`) and builds the mapping (`core/mapping.js`: value -> placeholder such as `[[PERSON_1]]`).
3. **Review.** The highlighted preview shows exactly what will be sent. Send, Copy message and Save as file are
   locked (`whySendIsBlocked` in `core/prompt.js`) unless detection finished on exactly the current text.
4. **Send.** The server runs the selected CLI with the pseudonymized prompt on stdin.
5. **Restore.** The answer's placeholders are replaced with the original values in the page.

**Desktop app** (`desktop/main.js`, Electron): starts the server in its main process on 127.0.0.1 (port 47291, so
the page's origin and what it remembers stay the same between runs; another free port if that one is taken) and
shows the page in a window. The window can't reach anything but that server: every other request is cancelled in
Electron's network layer (on top of the page's Content-Security-Policy), navigation away and new windows are
refused, the spell checker (which downloads dictionaries from Google) is off, and the only permission granted is
writing to the clipboard. In the built app Electron's fuses switch off running it as plain Node
(`ELECTRON_RUN_AS_NODE`), `NODE_OPTIONS` and `--inspect`, and it only starts from its own unchanged archive.
Closing the window ends the app: running AI tools are stopped and the model is released. One instance at a time.
On macOS and Linux the login shell's `PATH` is read once, so AI tools in `~/.local/bin` or nvm's folder are found
when the app is started from the desktop.

**Server alone** (`server/start.js`, `npm run server`): the same server on port 8091, for a browser on this computer,
for tests and for machines without a screen.

## Server API
Every `/api/` request needs an allowed `Host`; requests that change something or start work also need the app's
`Origin` and `Content-Type: application/json` (`requireFromApp`). Bodies are limited to 8 MB. Errors are
`{ "error": "..." }` with 400, 403, 404, 405, 413, 415, 500 or 502.

| Route | Body | Answer |
|---|---|---|
| `GET /api/about` | | `{ version, adapters: [{ id, label, models: [{ id, label }] }], ocrLanguages: ["deu", ...] }` |
| `GET /api/settings`, `PUT /api/settings` | a JSON object | the settings; PUT answers `{ file }` |
| `GET /api/prompts` | | `[{ name, file, text }]` for `gliner-labels.txt`, `not-sensitive.txt`, `system.md`: the user's file if there is one, else the default |
| `PUT /api/prompts/<name>` | `{ text }` | `{ file }`; written as `prompts/<name>` in the data folder |
| `POST /api/detect` | `{ text, labels: [..], threshold }` (threshold 0 to 1, default 0.4; at most 2 million characters, 100 labels) | `{ entities: [{ text, label, start, end, score }], model, device, ms }` (`device`: where the model runs, such as "the graphics card (DirectML)"); an empty text only loads the model; 502 with the reason if the model can't be used |
| `POST /api/cli/<adapter>` | `{ prompt, system?, model? }` | `{ text }`; 502 with the tool's last error lines |

Static files: `public/`, and `/vendor/<name>/...` from the installed packages (`vendorDirs` in `server/config.js`:
`pdfjs`, `tesseract`, `tesseract-core`, `tessdata`; `/vendor/tessdata/<code>.traineddata.gz` is the language file
of `@tesseract.js-data/<code>`). Pages are sent with a Content-Security-Policy that allows only the own server
(`connect-src 'self'`), so the page can't send anything elsewhere whatever code runs in it.

## Environment variables
Read and checked in `server/config.js` only.

| Variable | Meaning |
|---|---|
| `PORT` | port of `npm run server`, default 8091 (a free one is taken if it is in use and `PORT` is not set); the desktop app chooses its own |
| `PSEUDONYMIZER_DATA_DIR` | absolute folder for `settings.json` and the user's `prompts/`. Default: the project folder; in the installed desktop app the system's app data folder (`%APPDATA%\Pseudonymizer`, `~/.config/Pseudonymizer`, `~/Library/Application Support/Pseudonymizer`), which also holds its window's browser data |
| `PSEUDONYMIZER_MODEL_DIR` | absolute folder of the detection model. Default `models/gliner`; in the desktop app its `resources/models/gliner` |
| `PSEUDONYMIZER_DEVICE` | where the model runs: `auto` (default: the fastest accelerator that gives the processor's results, see "Hardware"), `cpu`, or one accelerator by name, `dml`, `cuda`, `webgpu`, `coreml`, optionally with the number of the graphics adapter (`dml:1`) |
| `PSEUDONYMIZER_THREADS` | processor threads for detection, default one per core |
| `GEMINI_API_KEY` | passed through to Gemini CLI; never stored by the app |

## Hardware
`server/gliner.js` runs the model with an accelerator ONNX Runtime for Node 1.31.1 has for the system, else on the
processor:

| System | Accelerator | Hardware | Comes with | Automatic |
|---|---|---|---|---|
| Windows (x64, arm64) | DirectML (`dml`) | any graphics card with DirectX 12: NVIDIA, AMD, Intel, also built into the processor | the npm package | yes |
| Linux x64 | CUDA (`cuda`) | NVIDIA graphics cards | `npm run setup`, if CUDA 12 and cuDNN 9 are installed | yes, when installed |
| macOS (Apple chips) | Core ML (`coreml`) | the Neural Engine (the chip's NPU) and its graphics | the npm package | yes |
| Windows, Linux | WebGPU (`webgpu`) | graphics cards with Direct3D 12 or Vulkan | the npm package | no: slower than the processor where measured, and probing it held up start and end of the app by up to 50 s in WSL |

Before an accelerator is used, the processor and the accelerator each read two check windows (`CHECK_TEXT`, made
up, in four languages, two lengths): the accelerator is kept only if no span's probability differs by more than 0.02
and, in `auto`, it read them faster. Otherwise the model runs on the processor, and the reason shows in Settings
("the processor (the graphics card (DirectML) gave other results)"). A faulty driver can't make detection miss
values unnoticed. The check costs a few seconds once per start, only on machines with an accelerator (Windows with
the full model: 4 to 8 s from start to "ready", against 2.5 s on the processor alone). Quitting while the model is
still loading waits for it, at most 10 s, as loading can't be interrupted.

On an accelerator every window is read with the same input shape: together with a filler of 150 words in a batch of
two, its tokens filled up to a multiple of 128 and masked. DirectML pays more for an input of a new shape than for
the whole reading, and every window has another length. The model's recurrent layer takes each row's length from
`text_lengths`, so the window reads exactly as alone (measured: the same 441 values in 12 documents, largest
probability difference 0.000013).

NPUs: ONNX Runtime for Node reaches the Neural Engine of Apple chips (Core ML). The NPUs of Windows and Linux PCs
(Intel AI Boost, AMD Ryzen AI, Qualcomm Hexagon) need providers (OpenVINO, Vitis AI, QNN) that its npm package
doesn't include, and its DirectML provider only takes a graphics adapter's number. `npm run setup` lists such an NPU
when the system reports one; detection then runs on the graphics card or the processor.

## Detection model
GLiNER multi PII v1 (`urchade/gliner_multi_pii-v1`, Apache-2.0; tokenizer of `microsoft/mdeberta-v3-base`, MIT),
as ONNX, run by `server/gliner.js` with `onnxruntime-node` (on an accelerator or the processor, see "Hardware") and
`@huggingface/tokenizers`. `npm run setup` downloads the files into `models/gliner` and checks each against the
SHA-256 in `scripts/setup.mjs`; `model.json` there names the model file in use.

| | Full (default from 8 GB of memory) | Small (default below 8 GB, or `--model small`) |
|---|---|---|
| Source | `onnx-community/gliner_multi_pii-v1`, revision `2e0397a7`, `onnx/model.onnx` | `blinzl/gliner_multi_pii-v1-q8w`, revision `5698ced6`, `onnx/model_q8w.onnx` + `.onnx_data` |
| Download | 1157 MB | 395 MB |
| Memory of the server while detecting | about 1.6 GB | about 0.6 GB |
| Loading | 2.4 s | 1.5 s |
| Speed (i9-9900K, 8 cores) | 572 ms per 1000 characters | 974 ms per 1000 characters |
| Result on the 73 test documents (0.4) | 19 values visible, 20 terms changed | the same |

The small file is a third party's conversion, so it was checked instead of trusted: `scripts/verify-small-model.py`
compares it with the official file tensor by tensor (same 4958 nodes in the same order; only 81 MatMul nodes became
MatMulNBits and the token embeddings GatherBlockQuantized; the 137 other tensors are identical; every 8-bit weight
is within one quantization step of the official one, 99.995 % within half a step; it names no data file but its
own). The quantized file `model_int8.onnx` of the official repository must not be used: it finds nothing.

How a text is read (`server/gliner.js`): words as GLiNER counts them; windows of at most 150 words that end at a
line break where there is one in the window's second half (no value runs across lines), otherwise 40 words of
overlap; windows with underscores inside words are read a second time with spaces instead ("Vertrag_Mueller.pdf");
spans are decoded as GLiNER does (best score first, no overlaps). Each window's spans are kept in memory by a hash
of labels and window text (the text itself is not kept), so detecting again after an edit only reads the windows
that changed. One text is read at a time; a cancelled request stops at the next window.

## Detection details
- Patterns (`public/js/core/patterns.js`) run first; their category wins for a value both find. Each pattern's
  comment explains it: e-mail, URLs, IP and MAC addresses, AHV, BIC, IBAN (checksum), postal accounts, company
  numbers, cards, tokens of known services, passwords after their name, user and account names, IDs after a label,
  reference and court case numbers, dates of birth, street addresses, postal code and town, names after labels and
  titles, phone numbers, Swiss towns named alone (`swiss-places.js`, 4011 names from the swisstopo locality
  register), and the cells of table columns whose header names what they hold ("Name", "Geburtsdatum", "IBAN").
- `addDetected` (`public/js/core/mapping.js`) drops values made only of never-sensitive words, diagnosis codes,
  Roman numerals and references to laws (`isLegalReference`), and values that can't be what the model calls them
  (`hasShapeOf`: an e-mail address without "@", a secret with spaces, an ID without a digit). A model value that is
  mostly a pattern's value keeps the pattern's category. Shorter forms of a person share the placeholder of the
  longer one; name parts, initials, spellings without umlauts and capital or title-case variants are added.
- `pseudonymize`: longest value first; values under 5 characters and single lower-case words only match as whole
  words.
- `restore`: accepts `[[X_1]]`, `[X_1]` and `X_1`; reports unknown placeholders.

## PDFs
`import/pdf.js` loads pdf.js from `/vendor/pdfjs/`, `import/pdf-reader.js` reads each page's pieces of text with
their positions and where images are drawn, `import/pdf-layout.js` (pure) rebuilds text from the positions: lines,
paragraphs (a line is joined to the next if the next word would not have fit), table rows as `cell | cell` with
wrapped cells put together, two columns of running text one after the other, larger text as `#`/`##` headings,
`[Image N, page P: not sent]` where an image stands, `--- Page N ---` between pages. A hyphen at a wrapped line end
is removed only if the document writes the word without it elsewhere. A page with next to no text and an image over
most of it is a scan: `import/ocr.js` renders it at 200 dpi and reads it with tesseract.js in the page (languages:
the installed `@tesseract.js-data` packages), or it is marked `[Page N is a scanned image: its text was not read]`
and the user is told. Limits: formulas come out as plain text; reading order of unusual layouts can be wrong; the
review step shows the text that will be sent.

## AI tools (targets)
`config/adapters.json`: per tool `command`, `args` (`{model}`, `{systemFile}`, `{modelArgs}`), `stdin` template
(`{prompt}`, `{system}`), `loginHint`, `models`. Each run gets an empty temporary folder that holds only the
instructions file and is deleted afterwards; the prompt goes through stdin. Claude Code runs with all tools disabled
and `--no-session-persistence`; Codex in its read-only sandbox with `--ephemeral`; Gemini CLI with `--skip-trust
--approval-mode plan` (it keeps a local history in `~/.gemini`). On Windows, `.cmd` shims are started through
cmd.exe with quoted arguments, and stopping ends the whole process tree (`taskkill /T /F`).

## Data locations
| What | Where |
|---|---|
| settings | `settings.json` in the data folder (mode 0600); a copy in localStorage |
| the user's texts (labels, word list, instructions) | `prompts/` in the data folder |
| detection model | `models/gliner`; in the desktop app its `resources/models/gliner` |
| the desktop window's browser data (cache, what the page remembers) | the installed app: its data folder; from the project folder: `.cache/desktop` |
| caches of setup and build | `.cache/` (BUILDING.md, "Everything stays in the project folder") |
| an AI tool's run | a temporary folder `pseudo-<random>` with the instructions only, deleted after the run |

## Licences
| Component | Licence |
|---|---|
| GLiNER multi PII v1, its tokenizer | Apache-2.0, MIT |
| onnxruntime-node (ONNX Runtime) | MIT |
| @huggingface/tokenizers | Apache-2.0 |
| pdfjs-dist (pdf.js) | Apache-2.0 |
| tesseract.js, tesseract.js-core, @tesseract.js-data | Apache-2.0, Apache-2.0, MIT (language data of Tesseract: Apache-2.0) |
| Swiss place names (`public/js/core/swiss-places.js`) | swisstopo free geodata, "Open use. Must provide the source." (credit in Settings) |
| Electron (in the desktop app) | MIT; Chromium's and its parts' licences, `LICENSE.electron.txt` and `LICENSES.chromium.html` in the app folder |
| electron-builder (builds the app, not part of it) | MIT |

## Measurements (Intel Core i9-9900K, 8 cores, 32 GB, Windows 11, 2026-11-10 and 11)
The test documents: 29 fixtures and 44 documents of `tests/fixtures/corpus/` (law, medicine, banking, HR, IT,
insurance, tax, real estate, science; de, fr, it, en): 2850 values to hide, 538 terms that must stay readable,
508,000 characters. `npm run test:model` measures the current state against them.

| Version, sensitivity | Values still visible | Terms hidden that should stay | Time for all documents |
|---|---|---|---|
| 0.1: GLiNER + Presidio (PyTorch), 0.3 | 17 | 138 | |
| 0.1: GLiNER (PyTorch), 0.4 | 19 | 40 | 456 s |
| 0.2: full model, 0.3 | 19 | 26 | |
| 0.2: full model, 0.4 (default) | 19 | 20 | 291 s |
| 0.2: full model, 0.4, on the graphics card (DirectML, NVIDIA RTX 2070) | 19 | 20 | 110 s |
| 0.2: full model, 0.5 | 22 | 18 | |
| 0.2: small model, 0.4 | 19 | 20 | 495 s |

- The 19 visible values: artefacts of the test data ("UND" between two first names, "Agno" inside "compagno") and
  values with no hint of what they are (a seat or room number, a storage bucket's name, a code standing alone).
- The same model on ONNX Runtime gives exactly the detections of PyTorch (6876 values in common, none above 0.3 on
  one side only) and is only a little faster per window (230 to 290 ms against about 320 ms); the gain comes from
  fewer windows and from not reading a text twice.
- PDFs: the 44 corpus documents printed to PDF (about 290 pages) are read in 2.4 s; 3 of 2354 values come out
  differently from how they are written. Detection on that text: 31 values visible, 19 terms hidden, against 26 and
  19 for the same documents as plain text.
- Scanned pages: 2 pages (rotated, greyed) in 5.5 s including loading the four languages.
- Graphics card (12 documents, 441 values, the same on every device): processor 462 ms per 1000 characters;
  DirectML 176 ms with the fixed input shape, 597 ms without it (each new shape costs more than the reading);
  WebGPU 436 ms without the fixed shape, 977 ms with it.
- Tests: `npm test` 256 tests in 2.3 s (Windows), 1.5 s (Linux in WSL, where the 2 tests of Windows batch files
  are skipped).
- Sizes: `node_modules` 510 MB (ONNX Runtime ships every system's programs: 294 MB; electron-builder 90 MB),
  Electron 350 MB. The Windows app unpacked 1.6 GB (model 1.1 GB, app and packages 130 MB), its installer 1.0 GB
  and built in 3 minutes; the Linux AppImage 1.1 GB.
- Linux (Ubuntu 24.04 in WSL 2): tests, server, real detection (same values and scores, 19 visible and 20 changed
  in 285 s) and the built app work.
- One real message through Claude Code 2.1.317 (`haiku`) came back with its placeholders in 2.5 s.

## Checking for network calls
`npm run check:network` starts the app's server in a process of its own, runs a real detection, waits 40 seconds,
ends it cleanly and records every connection of that process and the processes it starts: on Windows by listing
their TCP connections several times a second (PowerShell, no administrator rights), on Linux with
`strace -f -e trace=connect` (strace must be installed). With `-- --app <program>` it does the same with a built
desktop app, all of Electron's processes included. It first tests itself with a connection to the reserved address
192.0.2.1, which it must see. Run it after adding or updating a package and before passing on a built app; a result
other than "contacted nothing outside this computer" stops the work. Listing connections can miss one that opens and
closes between two looks; strace can't.

Why this matters, measured on 2026-11-11 with onnxruntime-node 1.31.1: **as shipped, ONNX Runtime reports usage to
Microsoft**, on Windows and on Linux. A process that only loads a model connects to
`mobile.events.data.microsoft.com` (port 443) and writes `Microsoft/DeveloperTools/.onnxruntime/onnxruntime.db`
into the user's folder (`%LOCALAPPDATA%`, `~/.cache`) and `.ses` into the temp folder. With
`ORT_DISABLE_TELEMETRY=1` in the environment before the library is loaded, the same process makes no connection
and writes no file (Linux: no `connect()` call at all; Windows: no outside connection in 1300 looks, where the
control run showed one). `server/gliner.js` sets it right before loading the library, the only place that loads
it; `tests/server/detect.test.mjs` fails if another file loads the library or the order changes, and
`npm run test:model` checks the variable after loading. What such a report contains was not examined.

Results on 2026-11-11: the server and the built desktop app contacted nothing outside this computer, on Windows
with DirectML in use and on Linux. One thing the Linux trace shows and the check lists separately: Chromium
"connects" a UDP socket to `2001:4860:4860::8888` (Google's DNS) to learn whether IPv6 is reachable. Connecting a
UDP socket sends nothing; the trace with every send call (`-yy`) showed no data on it, and the socket was reused for
the app's own server. The Windows check lists TCP connections only, so it would not show this either way. The page's Content-Security-Policy and Electron's request filter stop the
browser side; the end-to-end run in the app saw no request to another origin, and the window stayed on its page
when the page tried to leave it.

## Pitfalls
Setup and build: BUILDING.md, "When something goes wrong". Inside the app:
- Seen twice on Windows during development: a Node process that had loaded ONNX Runtime with its usage reports on
  and whose output went into a pipe hung at exit and stayed as an unkillable process (1.5 GB of memory) until the
  next restart. Not seen with the reports off (12 runs).
- tesseract.js logs `failed to load ./ita.special-words` to the console: the Italian language file has no such
  part; the page is read all the same.
- On Linux, trying an accelerator can print warnings of its own (Dawn for WebGPU) to the terminal; they carry no
  content.
- `npm run setup` skips the packages when `node_modules/.package-lock.json` is newer than `package-lock.json`.

## Open points
- NPUs of Windows and Linux PCs are not used (see Hardware); CUDA on Linux and Core ML on macOS are built in but
  were not tried on such hardware.
- The apps are not signed: Windows and macOS warn before the first start (BUILDING.md, "Signing"). The installer
  itself was built but not run here, as installing writes outside the project folder.
- macOS: building and running the app were not tried.
- Reusable value lists across documents of one case (the list can be saved and loaded, but only to restore answers).
- Formulas in PDFs are plain text; other formats than text and PDF are not read.
- The small model depends on one person's repository; the file is pinned by SHA-256, so it can't change unnoticed,
  but it can disappear. It can be rebuilt from the official file (MatMulNBits and GatherBlockQuantized, 8 bits,
  blocks of 32) and checked with `scripts/verify-small-model.py`.
