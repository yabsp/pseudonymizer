# Architecture

Pseudonymizer is a local web app: a browser page, a small Node server on the same machine, and local
helper processes. Nothing confidential leaves the machine; only the pseudonymized prompt is passed to an
AI tool the user has installed and logged in to.

```
 Browser (public/)                         Local server (server/, 127.0.0.1 only)
 ┌───────────────────────────────┐  HTTP   ┌──────────────────────────────────┐
 │ ui/       tabs, settings,     │ ──────▶ │ index.js   route table           │
 │           workflow (4 steps)  │         │ static.js  public/ and prompts/  │
 │ core/     mapping, replace,   │         │ settings.js settings.json        │
 │           restore, patterns   │         │ gliner.js ─┐                     │
 │ detection/ GLiNER, Presidio,  │
 │           Ollama              │
 │ import/   text, PDF           │         │ cli.js ────┼─┐                   │
 │ targets/  CLI                 │         └────────────┼─┼───────────────────┘
 └──────────────┬────────────────┘                      │ │ stdin/stdout
                │ HTTP (only for the Ollama detector)   │ ▼
                ▼                                       │ claude / codex / gemini,
         Ollama (local)                                 │ each run in a fresh empty folder
                                                        ▼
                                    python/gliner_helper.py (long-lived, model loaded once)
                                    + python/presidio_detection.py (spaCy model per language)
```

## Flow
0. **Open.** Text is pasted, or a file is opened or dropped; `import/index.js` picks the importer for its
   format and only the extracted text goes on. The file itself is never sent.
1. **Detect.** The selected detector finds sensitive values in the text: GLiNER through the server and
   the Python helper, GLiNER plus Presidio (spaCy's name finder and Presidio's recognizers, in the same
   helper), or a chat model in Ollama. Fixed patterns (emails, URLs and connection strings, IP and MAC addresses,
   AHV numbers, BIC/SWIFT codes, IBANs, postal accounts, company numbers, Italian tax codes, card numbers (also
   masked) and their last digits, security codes and expiry dates, access keys and tokens, passwords after their
   name, usernames, IDs after a label, reference and court case numbers, passport numbers, Swiss license plates,
   dates and timestamps, street addresses, postal code and town, names after a label, an academic title, "Fam."
   or a word for a relative, phone numbers) are added first, so their category wins. Values that don't literally
   appear in the text (in any case), consist only of words that are never sensitive (`prompts/not-sensitive*.txt`),
   or are diagnosis codes or Roman numerals are dropped; a value across lines becomes one value per line. Parts of
   found names used on their own ("Hi Sarah", "Frau Gerber" after "Nadine Gerber-Kunz"), short forms in brackets
   and the same values in capitals or title case ("RETO AMMANN") share the placeholder of the full value.
2. **Review.** The highlighted preview shows exactly what will be sent; clicking a placeholder shows its
   original value and can keep it visible. The full mapping table (value -> placeholder such as
   `[[PERSON_1]]`) is behind "Edit values".
3. **Replace.** `core/mapping.js` replaces the values in code, not with a model, so it is deterministic.
4. **Send.** The server runs the selected CLI with the pseudonymized prompt on stdin.
5. **Restore.** The answer's placeholders are replaced with the original values in the browser.

## Layers
- **Core** (`public/js/core/`): pure functions, no DOM, network or storage. This is the privacy-critical
  part and the most heavily tested one.
- **Detection and targets** (`public/js/detection/`, `public/js/targets/`): talk to the server or Ollama.
  Detectors are registered in `DETECTORS`; adding one is one file and one entry.
- **UI** (`public/js/ui/`): one module per part of the page, each with an `init…` function that
  `main.js` calls. Workflow state lives in `ui/workflow.js`; settings live in the form fields. Elements are
  built with `h()` from `ui/dom.js`, which only ever sets text. No framework and no build step
  (`docs/adr/0002-frontend-without-framework.md`).
- **Importers** (`public/js/import/`): one file per document format, registered in `IMPORTERS`, each
  `read(file, options) -> { text, document? }`. Text files fill the text box; a PDF becomes a document
  (`state.document` in `ui/workflow.js`) that is sent as an attachment inside the message or saved as Markdown.
- **PDF extraction** (`server/documents.js`, `python/document_extraction.py`): the page uploads the PDF to
  `POST /api/extract/pdf`; the server writes it to a private temporary folder, starts one Docling process per
  file (killed on cancel or after 30 minutes) and deletes the folder afterwards. Docling returns Markdown with
  tables, numbered image, formula and page markers, and formulas as LaTeX when asked (`?formulas=1`).
- **Theme**: CSS tokens in `style.css`; `js/theme-boot.js` applies a chosen theme before the first paint,
  `ui/theme.js` switches between System, Light and Dark.
- **Server** (`server/`): Node built-ins only. Configuration in `config.js`, routes in `index.js`,
  one module per feature (`gliner.js` serves `POST /api/detect/gliner` and `POST /api/detect/presidio`,
  which also takes `language`: `auto`, `de`, `fr`, `it` or `en`). Every API request must come from the app itself (Host, Origin and
  Content-Type checks in `http.js`).
- **Python helper** (`python/gliner_helper.py`): reads one JSON request per line on stdin, writes one JSON
  answer per line on stdout, matched by `id`:
  `{"id", "text", "labels", "threshold", "model", "engine", "language"}` ->
  `{"id", "entities": [{"text", "label", "start", "end", "score", "source"}], "language"}` or `{"id", "error"}`.
  GLiNER reads the text in windows of 150 words; windows with underscores inside words ("Vertrag_Mueller.pdf")
  are read a second time with spaces instead, so names in file names are found.
  `engine` is `gliner` (default) or `presidio`, which adds Presidio's values (`source: "presidio"`, `label` a
  Presidio type such as `PERSON`) and the `language` used (`auto` is guessed from frequent words). An empty
  text only loads GLiNER. `python/presidio_detection.py` is the only file that uses Presidio: it loads a
  spaCy model per language on first use, never downloads one, and removes Presidio's e-mail and URL
  recognizers (the e-mail one fetches a domain list from the internet).

## Desktop app
`desktop/main.js` is the Electron main process. It asks the login shell for the search path (so the CLIs are
found when the app is started from the desktop), sets the server's environment (data folder, bundled helper,
offline model folder), imports the unchanged `server/index.js` and waits for `listening`, then opens a window on
`http://127.0.0.1:<port>` (port 47291, or a free one). The window has no Node access, can't navigate away or
open new windows, gets no permissions, and every request that doesn't go to this machine is cancelled.
The installer carries the app code in `app.asar`, the helper built by PyInstaller in `resources/helper` and
the model in `resources/models`. See `docs/adr/0003-desktop-app-electron.md`.

## Hardware
`python/accelerators.py` probes the machine (operating system, processor, memory, graphics adapters through
`/sys`/`lspci`, PowerShell, `system_profiler` or `nvidia-smi`) and the back ends the installed packages offer:
PyTorch on CPU, CUDA, XPU or MPS, and ONNX Runtime with CPU, CUDA, DirectML or CoreML. "auto" takes the first
usable GPU. Before a back end other than PyTorch on the CPU is used, it runs a synthetic test text and must find
the same values as the CPU; if not, the CPU is used and the answer's `runtime.notice` says why. The setting
`accelerator` travels with every detection request and PDF extraction (Docling gets the matching device).

## Configuration as data
- `config/adapters.json`: the CLIs, their arguments, how the prompt is passed, login hints and models.
- `prompts/`: instructions, GLiNER labels and the never-sensitive word list; `<name>.<ext>` overrides
  `<name>.default.<ext>`.
- `settings.json`: the user's choices, written by the server with mode 0600.

## Not enabled yet
- Direct API providers (Anthropic, OpenAI-compatible, Gemini) are parked in `parked/api-targets/` until
  they are tested.
- PDF import in the desktop app (Docling is not bundled yet).
