# Technical reference

Facts an agent needs and the code doesn't state in one place. Rules are in [AGENTS.md](../AGENTS.md), the overall
design in [architecture.md](architecture.md). If something here contradicts the code, the code wins; fix this file.

## Server API
All routes are in `ROUTES` (`server/index.js`). Every `/api/` request needs an allowed `Host`; POST and PUT also
need the app's `Origin` and the listed `Content-Type` (`rejectUnlessFromApp`). Errors are `{ "error": "..." }`.

| Route | Body / query | Answer |
|---|---|---|
| `GET /api/about` | | `{ app: "server" or "desktop", detectors: [...], documents: ["pdf"] or [] }` |
| `GET /api/settings`, `PUT /api/settings` | settings object (JSON) | settings; PUT answers `{ file }` |
| `GET /api/adapters` | | `[{ id, label, models: [{ id, label }] }]` |
| `POST /api/detect/gliner` | `{ text, labels, threshold, model, accelerator? }` | `{ entities: [{ text, label, start, end, score, source }], runtime }` |
| `POST /api/detect/presidio` | the same plus `language` (`auto`, `de`, `fr`, `it`, `en`) | the same plus `language` used |
| `POST /api/extract/pdf` | the PDF (`application/pdf`, max 50 MB); `?formulas=1`, `?accelerator=` | `{ markdown, pages, images, formulas, formulasConverted, tables, device, deviceNote? }` |
| `POST /api/jobs?format=pdf\|text` | the file (`application/pdf`, or `application/octet-stream` for text); `&formulas=1`, `&accelerator=` | `201 { id, format, formulas, state, step, error }`; at most 50 documents and 500 MB waiting (429, 413) |
| `GET /api/jobs` | | the list in that shape, never text; `state` `waiting`, `running`, `ready`, `failed`; `step` `{ number, of, label, seconds }` |
| `POST /api/jobs/<id>/move` | `{ position }`, 1 is first | the list in its new order; waiting documents are converted in list order |
| `GET /api/jobs/<id>`, `DELETE /api/jobs/<id>` | | GET adds `result: { text, document? }` once ready; DELETE cancels (process stopped, temp files deleted) and forgets |
| `PUT /api/prompts/<file>` | `{ text }`; file one of `gliner-labels.txt`, `not-sensitive.txt`, `rules.md`, `detection.md`, `system.md` | `{ file }`; written as `prompts/<name>.<ext>` (user only), desktop: `prompts/` in the data folder |
| `POST /api/hardware` | `{}` | `{ system, backends }` (see Hardware) |
| `POST /api/cli/<adapter>` | `{ prompt, system, model }` | `{ text }` |

`device` is Docling's device (`cpu`, `cuda`, `xpu`, `mps`); `deviceNote` says when the chosen hardware is one Docling
can't use (e.g. DirectML), so the processor read the document. Jobs live in memory only, one runs at a time
(`server/jobs.js`, ADR 0005). `runtime` is `{ id, label, verified?, notice? }`: where detection ran; `notice` explains a fallback to the CPU.
`accelerator` values: `auto`, `torch-cpu`, `torch-cuda`, `torch-xpu`, `torch-mps`, `onnx-cpu`, `onnx-cuda`,
`onnx-directml`, `onnx-coreml` (allowlist `ACCELERATOR` in `server/gliner.js`). A PDF route is answered with 501
in the desktop app.

## Environment variables
Read and validated in `server/config.js` only (except `desktop/main.js`, which sets them).

| Variable | Meaning |
|---|---|
| `PORT` | server port, default 8091 |
| `GLINER_PYTHON` | Python for the helpers, default `.venv`'s |
| `PSEUDONYMIZER_DATA_DIR` | absolute folder for `settings.json`, default the project folder |
| `DETECTION_HELPER` | bundled helper program (PyInstaller) used instead of Python and the scripts; `--extract-document` for PDFs |
| `PSEUDONYMIZER_APP` | `server` or `desktop`; the desktop app offers no Presidio and no PDFs yet |
| `DOCLING_ARTIFACTS_PATH` | Docling models, default `~/.cache/docling/models` (read by `python/document_extraction.py`) |
| `PSEUDONYMIZER_CACHE` | exported ONNX models, default `~/.cache/pseudonymizer` or `%LOCALAPPDATA%\pseudonymizer` |
| `GEMINI_API_KEY` | passed through to Gemini CLI; never stored by the app |

## Python helpers
- `python/gliner_helper.py`: long-lived, JSON lines on stdin and stdout, matched by `id`. Requests:
  `{ id, text, labels, threshold, model, engine: "gliner" | "presidio", language, accelerator }` or
  `{ id, probe: true }`. Answers `{ id, entities, language?, runtime }`, `{ id, system, backends }` or
  `{ id, error }`. An empty text only loads the model. Texts are read in windows of 150 GLiNER words with an
  overlap of 40 (GLiNER reads at most 384 words and silently cuts the rest; the helper fails instead of
  returning a partial result). Windows with `_` inside words are read a second time with spaces.
- `python/presidio_detection.py`: one spaCy model per language, loaded on first use, never downloaded (Presidio
  would download missing ones). Recognizers for `EMAIL_ADDRESS` and `URL` are removed (the e-mail one fetches a
  domain list through tldextract; the URL one cuts e-mail addresses apart). Spans are split at line breaks and
  pieces starting or ending inside a word are dropped. `DATE_TIME` and `NRP` are ignored in the browser.
- `python/document_extraction.py <file> [--accelerator ID] [--formulas]`: one process per PDF, one JSON object on
  stdout. Docling with `enable_remote_services=False`, OCR with RapidOCR (torch backend, `lang=['de']`, which
  selects the multilingual PP-OCRv6 model; the Latin model dropped umlauts), formulas through CodeFormulaV2 only
  with `--formulas`. Markers: `[Image N, page P: not sent]`, `[Formula N, page P: not converted]`,
  `--- Page N ---`.
- `python/accelerators.py`: hardware probe (OS, CPU, threads, memory, GPUs via `/sys`/`lspci`, PowerShell
  `Win32_VideoController`, `system_profiler`, `nvidia-smi`), back ends, loading, and `verify` against PyTorch on
  the CPU on `CANARY_TEXT`. `auto` order: torch-cuda, onnx-cuda, torch-xpu, onnx-directml, torch-mps,
  onnx-coreml, torch-cpu.

## Detection details
- Patterns (`public/js/core/patterns.js`) run first; their category wins for a value both find. Each pattern's
  comment explains it. They cover e-mail, URLs of any scheme (with connection strings), IPv4/IPv6, MAC, AHV, BIC,
  IBAN (checksum), Swiss postal accounts, CHE numbers, Italian tax codes, cards (Luhn, or after a card word,
  masked forms, last four digits after "ending in"), security codes, expiry dates, tokens of known services,
  passwords after their name, usernames, IDs after a label, reference and court case numbers, passport and ID
  numbers, Swiss licence plates, dates and timestamps, street addresses (US, DE/CH, FR/IT), postal code and town,
  names after labels, titles, "Fam." and words for relatives, phone numbers (not lab ranges, years, weeks), and
  Swiss towns named alone (`public/js/core/swiss-places.js`, 4011 names from the swisstopo locality register, free
  geodata with source named; names under 4 letters and common words left out; a town right after a court word stays
  readable unless it also appears elsewhere).
- `addDetected` (`public/js/core/mapping.js`) drops values made only of never-sensitive words
  (`prompts/not-sensitive*.txt`), diagnosis codes and Roman numerals, splits values across lines, links shorter
  forms of a person to the longer one (whatever the detector's order), adds name parts, double-name parts, part
  combinations, short forms in brackets, initials, the town of an address, spellings without umlauts and capital
  or title-case variants with the same placeholder. Titles ("Herr", "Dr.") are context, not part of a name.
- `pseudonymize`: longest value first, two passes through private-use markers (U+F0000 and up); values under 5
  characters only match as whole words (camelCase and a genitive "s" count as word edges).
- `restore`: accepts `[[X_1]]`, `[X_1]` and `X_1`; reports unknown placeholders; a placeholder shared by a name
  and its parts restores to the first (full) value.
- GLiNER labels: `prompts/gliner-labels*.txt`, one `label = CATEGORY` per line.

## AI tools (targets)
`config/adapters.json`: per tool `command`, `args` (`{model}`, `{systemFile}`, `{modelArgs}`), `stdin` template
(`{prompt}`, `{system}`), `loginHint`, `models`. Each run gets an empty temporary folder that is deleted
afterwards. Claude Code runs with all tools disabled and `--no-session-persistence`; Codex in its read-only
sandbox with `--ephemeral`; Gemini CLI with `--skip-trust --approval-mode plan` (keeps a local history in
`~/.gemini`). On Windows the server starts CLIs through the shell with quoted arguments (npm installs `.cmd`
shims). Status 2026-10-06: Claude Code tested end to end; Codex and Gemini start correctly but were not tested
with a login. API targets are parked in `parked/api-targets/`.

## Data locations
| What | Where |
|---|---|
| settings | `settings.json` in the project folder (mode 0600; on Windows its access list is set to the user with `icacls`), desktop: `~/.config/pseudonymizer/` or `%APPDATA%\pseudonymizer\`; a copy in localStorage |
| theme | localStorage `pseudo-theme` |
| GLiNER and tokenizer | `~/.cache/huggingface/hub` (desktop: bundled in `resources/models`, `HF_HUB_OFFLINE=1`) |
| Docling models | `~/.cache/docling/models` |
| ONNX export | `~/.cache/pseudonymizer/onnx/<model>` |
| PDFs during extraction | a private `pseudo-doc-*` temp folder, deleted afterwards |
| CLI runs | a `pseudo-*` temp folder, deleted afterwards |

## Desktop app
`desktop/main.js` (Electron 44): asks the login shell for `PATH` (desktop launchers lack `~/.local/bin` and nvm),
sets the server's environment, imports `server/index.js`, waits for `listening`, then opens
`http://127.0.0.1:47291` (or a free port). Lock-down: no Node in the window, sandbox, no navigation away, no new
windows, no permissions, spell checker off (it downloaded dictionaries from Google), every request not to
localhost or 127.0.0.1 cancelled. Build: `desktop/build-helper.mjs` (PyInstaller, `--onedir`, Presidio and spaCy
excluded, about 855 MB), `desktop/build-models.mjs` (copies the Hugging Face cache with links resolved, 1.1 GB),
electron-builder (`package.json` `build`; only `prompts/*.default.*` are packed). Terminals inside VS Code set
`ELECTRON_RUN_AS_NODE`, which makes Electron exit silently; `npm run desktop` removes it.

## Models and licences
| Component | Licence | Notes |
|---|---|---|
| GLiNER `urchade/gliner_multi_pii-v1` | Apache-2.0 | 1.1 GB; tokenizer of `microsoft/mdeberta-v3-base` (MIT) |
| Presidio | MIT | spaCy models: de, en MIT; fr LGPL-LR; it CC BY-NC-SA 3.0 (non-commercial, to be removed) |
| Docling | MIT | layout Apache-2.0; tables and CodeFormulaV2 CDLA-Permissive-2.0; RapidOCR Apache-2.0 |
| ONNX Runtime, onnx | MIT, Apache-2.0 | ONNX Runtime also lists `AzureExecutionProvider` (cloud): never used |
| PyInstaller | GPL with an exception allowing commercial distribution | build only |
| Electron, electron-builder | MIT | build only |

Rejected: PyMuPDF, Marker, MinerU (AGPL or GPL), Nougat (non-commercial weights), pdf.js for extraction (loses
tables and formulas), OpenVINO (can't compile GLiNER's LSTM with dynamic shapes; `import openvino` loads Intel's
telemetry module).

## Measurements (Intel Core Ultra 7 155H, CPU, noisy laptop)
- GLiNER: model load 5 to 7 s (AppImage 14 s, because it decompresses); a 5,000-character letter 5 to 8 s; a
  100-row CSV 9 to 21 s. Batching windows was slower; naive int8 quantization broke the model; 4 threads were
  about 25% faster than 16 (hybrid cores); ONNX Runtime on the CPU was no faster than PyTorch.
- Docling: 2 pages with a scanned page 16 to 25 s; about 70 to 90 s per formula with `--formulas`.
- Presidio adds 0.1 to 0.5 s per text once its language model is loaded (2 to 3 s for the first text per language).
