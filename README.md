# Pseudonymizer

Replaces sensitive values locally, sends only the pseudonymized text to a model of your choice, and restores the original values in the answer. Made for consultants, lawyers and doctors who want to use AI models without disclosing confidential data.

## Run
```
npm start                 # Node 22+, no npm install needed (no dependencies)
```
Open http://localhost:8091 (change with `PORT=9000 npm start`). For the default detector, install GLiNER once (see "Detection with GLiNER" below).

## Desktop app
Pseudonymizer also runs as a desktop app that brings everything with it: the page, the local server, the detection helper with PyTorch and GLiNER, and the model. No Python, Node or download is needed, and nothing is fetched from the internet.

**Using it**
- **Linux:** download `Pseudonymizer-<version>-x86_64.AppImage`, make it executable (`chmod +x`, or Properties > "Allow executing") and start it.
- **Windows:** run `Pseudonymizer-Setup-<version>.exe`. It installs for the current user; without a code signature Windows shows a SmartScreen warning ("More info" > "Run anyway").
- The AI tools are the same as above: Claude Code, Codex or Gemini CLI installed and logged in on this computer. The app looks for them where a terminal would.
- Settings are kept in `~/.config/pseudonymizer/` (Linux) or `%APPDATA%\pseudonymizer\` (Windows).
- Not in the desktop app yet: the Presidio detector, and keeping changed prompt files (changes in the Prompts tab last until the app is closed).
- The window only loads from this computer (the app and a local Ollama); every other request, such as Chromium's spell-check dictionaries, is blocked.

**Building it** (needs the development setup: Node, `.venv` with GLiNER, the model downloaded once by running detection)
```
npm install                          # Electron and electron-builder (build tools only)
.venv/bin/pip install pyinstaller    # Windows: .venv\Scripts\pip install pyinstaller
npm run desktop                      # try the desktop app from the project folder
npm run dist:linux                   # dist/Pseudonymizer-<version>-x86_64.AppImage (about 1.4 GB)
npm run dist:win                     # on Windows: dist/Pseudonymizer-Setup-<version>.exe
```
`dist:*` builds the detection helper with PyInstaller (`build/helper`), copies the model from the Hugging Face cache (`build/models`) and packs the app. PyInstaller can't build for another system, so build each system's version on that system. The Windows build is prepared but has not been built or tested yet.

The server reads three more environment variables, which the desktop app sets: `PSEUDONYMIZER_DATA_DIR` (absolute folder for `settings.json`, default the project folder), `DETECTION_HELPER` (path of the bundled helper program, used instead of Python and the script) and `PSEUDONYMIZER_APP` (`server` or `desktop`; the desktop app offers no Presidio). `GET /api/about` returns `{ "app", "detectors" }`.

## Using the app
The top bar has three tabs:
- **Pseudonymize**: paste your text (or open or drop a text file) and find the sensitive values. Then step 2 shows exactly what will be sent, with the hidden parts highlighted: click one to see the original or to keep it visible, and open "Edit values" for the full list. Step 3 sends it, step 4 shows the answer with the original values restored.
- **Settings**: the detection model (GLiNER, GLiNER + Presidio, or Ollama) and the target model; rarely needed options are under "Advanced". Changes are saved automatically. A red dot means the detection model isn't ready.
- **Prompts**: the prompt files, see below.

The button at the top right switches between the system's light or dark mode, Light and Dark; the choice is kept in this browser. Files: text formats (.txt, .md, .csv, .json, .eml and similar, up to 5 MB) open into the text box; PDFs (up to 50 MB) open as a document, see "Opening PDF documents".

While a model is working, the page is blocked with a progress window. **Cancel** (or Escape) stops the request; for CLIs, the server also stops the CLI process. Sending is only possible after detection has run. Pressing Detect without a detection model explains what is missing and offers to continue with patterns only. The model's answer is shown with the original values restored; the raw answer (with placeholders) is behind "Show model answer before restoring", where you can also paste an answer from any chat.

## Settings
Settings are saved to `settings.json` in the project folder (readable by your user only) and also kept in the browser. On start, the app reads `settings.json`; if the server can't be reached it falls back to the browser copy. The file is never served to the browser and is in `.gitignore`.

## Detection
Three local detectors, chosen under Settings > Detection model. All run on this machine; the original text is never sent anywhere. Patterns for emails, URLs, IP addresses and phone numbers can be added to any of them.

| | GLiNER (default) | GLiNER + Presidio | Ollama LLM |
|---|---|---|---|
| Speed | under 1 s for a letter, about 15 s for a 100-row CSV export (model loads once, ~5 s) | about the same, plus 2-3 s the first time a language is used | about 1-2 min on a laptop, depending on model |
| Finds | the labels in `prompts/gliner-labels.default.txt` (or your `gliner-labels.txt`) | the same, plus names, places and organisations found by spaCy, and phone, card and bank numbers | whatever `prompts/rules.md` describes |
| Needs | Python with the `gliner` package | the same, plus Presidio and a spaCy model per language (about 2.2 GB) | Ollama with a chat model |

On the 13 test documents, GLiNER + Presidio left 2 of 232 values visible instead of 7, but also lists more words that aren't sensitive (such as "Versicherten-Nr"), so there is more to review. See `docs/adr/0001-presidio-as-optional-detector.md`.

### Detection with GLiNER
GLiNER is a small model that marks names, companies, emails, IBANs, passwords and similar in text. It runs in `python/gliner_helper.py`, which the server starts on first use and keeps running. The default model `urchade/gliner_multi_pii-v1` (Apache-2.0) understands English, German, French, Italian, Spanish and Portuguese. Install once, into `.venv` in the project folder (about 1.2 GB):
```
python3 -m venv .venv
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r python/requirements.txt
```
The model itself (1.1 GB) is downloaded from Hugging Face the first time it is used and cached in `~/.cache/huggingface`. The server uses `.venv`'s Python automatically; set `GLINER_PYTHON=/path/to/python` to use another one.

Settings: **Sensitivity** trades misses against false hits (Balanced is a good start).

Detectors sometimes report pronouns, titles, greetings or generic words as values ("ich", "Sie", "Sehr geehrte Damen und Herren", "Avocate", "Tribunal des baux", "Vater", "Cordialement"). Values made only of such words are ignored; the list is `prompts/not-sensitive.default.txt` and can be extended like the labels.

What GLiNER looks for is a plain text file, one `label = CATEGORY` per line, e.g. `date of birth = DATE`. The shipped list is `prompts/gliner-labels.default.txt`; to change it, copy it to `prompts/gliner-labels.txt` and edit the copy. The labels are also shown and can be tried out in the Prompts tab.

### Detection with Presidio
[Presidio](https://github.com/data-privacy-stack/presidio) (MIT) adds spaCy's name finder and Presidio's recognizers to GLiNER, in the same Python helper. Install GLiNER first (above), then:
```
.venv/bin/pip install -r python/requirements.txt
.venv/bin/python -m spacy download de_core_news_lg    # German, MIT, ~600 MB
.venv/bin/python -m spacy download fr_core_news_lg    # French, LGPL-LR, ~600 MB
.venv/bin/python -m spacy download it_core_news_lg    # Italian, CC BY-NC-SA 3.0: non-commercial use only
.venv/bin/python -m spacy download en_core_web_lg     # English, MIT, ~430 MB
```
Install only the languages you need; a text in a language whose model is missing fails with a message instead of being detected with less protection. The app never downloads models by itself. Under Settings, **Language of your texts** is recognized automatically by default (the result says which language was used); set it if your texts mix languages. Each loaded language needs about 0.7 GB of memory on top of GLiNER's 2.8 GB.

Presidio's e-mail and URL recognizers are switched off: the e-mail one downloads a domain list from the internet, and the app's patterns and GLiNER find both. Plain dates and nationalities found by Presidio are ignored, as with GLiNER.

### Opening PDF documents
Open or drop a PDF in step 1. It is read on this machine with [Docling](https://github.com/docling-project/docling) (MIT) and shown as a document card instead of filling the text box: pages, tables, images and formulas, and the extracted text behind "Show extracted text". Detection and review work as for pasted text. In step 3 the pseudonymized document is sent inside the message, between `<document>` markers, followed by your question; nothing goes through the clipboard. "Save as file" saves it as Markdown (`pseudonymized-document-<date>.md`) for uploading to any chat yourself; paste the answer under "Already have an answer" to restore the names.

What is extracted and what is not:
- Headings, paragraphs and lists as Markdown, tables as Markdown tables, page breaks as `--- Page 2 ---`.
- Scanned pages and text inside images are read with local OCR (RapidOCR, multilingual PP-OCRv6 model) and pseudonymized like all other text.
- Images are never sent: each is replaced by `[Image 1, page 2: not sent]`. The PDF itself, its metadata, comments, form fields and attachments are never sent either.
- Formulas are marked as `[Formula 1, page 2: not converted]` at first. "Convert formulas" turns them into LaTeX (`$$\frac{m}{h^{2}}$$`); this takes about a minute per formula on a CPU.
- The file name is not sent and not used for saved files, as it often contains a name.

Speed on a laptop CPU: a few seconds per page with a text layer, about 10 seconds per scanned page, plus about a minute per formula when converting. Install once, into `.venv`:
```
.venv/bin/pip install "torchvision==0.29.1" --index-url https://download.pytorch.org/whl/cpu   # must match the CPU build of torch
.venv/bin/pip install -r python/requirements.txt                                               # adds docling
.venv/bin/docling-tools models download layout tableformer code_formula rapidocr --rapidocr-backend-lang torch:de
```
The models (about 1.1 GB, in `~/.cache/docling/models`; set `DOCLING_ARTIFACTS_PATH` for another folder) are used offline afterwards: layout model (Apache-2.0), table and formula models (CDLA-Permissive-2.0), RapidOCR (Apache-2.0). Install torchvision before docling: the version docling would pick from PyPI does not work with the CPU build of torch and breaks GLiNER.

`POST /api/extract/pdf` (body: the PDF, `Content-Type: application/pdf`, `?formulas=1` to convert formulas) returns `{ "markdown", "pages", "images", "formulas", "formulasConverted", "tables" }`.

### Detection with Ollama
```
ollama pull qwen2.5:7b        # or llama3.1:8b, mistral, ...
```
Pick the model under Settings; the list shows the models installed in Ollama (use "Reload list" after pulling a new one). Ollama accepts requests from `http://localhost:*` by default. If the model returns unusable output, the app says so after detection instead of silently using patterns only.

## Target models
The pseudonymized prompt is sent through an AI tool installed on this machine and logged in with your own subscription. Each tool is an entry in `config/adapters.json` with its arguments, how the prompt is passed, a login hint shown on errors and the models offered in Settings ("Other model…" accepts any name).

| Tool | Setup | Status (checked 2026-10-06) |
|---|---|---|
| Claude Code | install Claude Code, run `claude` once and log in | tested end to end |
| OpenAI Codex CLI | `npm install -g @openai/codex`, run `codex login` | starts correctly, answers need your login (not tested with a login yet) |
| Gemini CLI | `npm install -g @google/gemini-cli`, start the app with `GEMINI_API_KEY=... npm start` | Google no longer accepts personal Google logins in Gemini CLI; works only with a Gemini API key (not tested) |

The server starts the tool in an empty temporary folder, sends the pseudonymized text on stdin and returns its answer. All three run without tools or file access: Claude Code with all tools disabled, Codex in its read-only sandbox, Gemini CLI in plan (read-only) mode. Claude Code (`--no-session-persistence`) and Codex (`--ephemeral`) keep no history of the request; Gemini CLI keeps a local chat history in `~/.gemini` (it only ever sees the pseudonymized prompt).

To add another tool, add an entry to `config/adapters.json`:
- `{prompt}`, `{system}` - pseudonymized text and target-model instructions
- `{systemFile}` - path to a temp file holding the instructions
- `{modelArgs}` - replaced by `modelArgs` when a model is set, otherwise removed

Usage counts against your plan's limits. Only use the tools as installed, logged in with your own account. Direct API access (Anthropic, OpenAI-compatible, Gemini with an API key in the app) is implemented but parked in `parked/api-targets/` until it is tested.

## Prompt files
See `prompts/README.md`. `prompts/<name>.md` is always preferred over `prompts/<name>.default.md`; if neither exists the app shows an error and won't detect or send.

## How it works
1. A local detector (plus optional patterns for emails, URLs of any scheme including connection strings such as `postgresql://user:password@host`, IPv4/IPv6 and MAC addresses, AHV numbers, BIC/SWIFT codes, IBANs, Swiss postal accounts (30-123456-6), Swiss company numbers (CHE-123.456.789), Italian tax codes, card numbers (also without a valid checksum after "card number", and masked as 4111\*\*\*\*1111), their last four digits after "ending in", security codes and expiry dates, access keys and tokens of well-known services (AWS, GitHub, GitLab, Slack, Stripe, OpenAI, Anthropic, Google, JSON Web Tokens, "Bearer ..."), passwords, keys and tokens after their name ("password: ...", "DB_PASSWORD=...", "das Passwort ist ..."), usernames after "Skype:" or "Username:", after "user=" or "owner=" in logs and in home folder paths (C:\Users\name), IDs after a label such as "ID:", "Nr.", "réf.", "N°", "VIN:", "S/N", "Patient-ID" or "Group #", reference codes such as "INC-20419", "P-104233" or "4471-ZRH", court case numbers ("ZK 26 318", "4A_123/2026", "HG250117-O", "VB.2026.00321", "2026/TI/4471"), passport and ID card numbers such as "X1234567", Swiss license plates ("ZH 123456", "SO 77 312"), dates written with "/" or as 2026-10-14, timestamps such as 2026-10-14T08:14:00Z (with the time), street addresses in American, German, Swiss, French and Italian notation, postal code and town on a line of their own ("1752 Villars-sur-Glâne"), names after a label ("Name:", "Prénom :", "Patient:"), after an academic title ("Dr. med. Laurin Hofer", "lic. iur. ..."), after "Fam." or "famille", and of relatives ("Ihre Tochter Lea (7)", "his brother Vincent"), and phone numbers; lab reference ranges, years and calendar weeks are not taken for phone numbers) lists sensitive values. Where a pattern and the detector find the same value, the pattern's category is used. Values that don't literally appear in the input (in any case) are discarded, and so are diagnosis codes ("M54.5") and Roman numerals ("II"). A value that spans several lines becomes one value per line. When a person is found, a first or last name used on its own elsewhere ("Hi Sarah"), one name of a double name ("Frau Gerber" after "Nadine Gerber-Kunz"), or first and last name without the middle name, gets the same placeholder, and so does a short form in brackets ("Universitätsspital Zürich (USZ)" and later "USZ"). The same goes for any value written in capitals or in title case elsewhere ("RETO AMMANN" in a letterhead, "Berset-Rapin" after "BERSET-RAPIN"). GLiNER reads names joined by underscores in file names ("Vertrag_Mueller_Brandenberger.pdf") by reading those parts of the text a second time with spaces.
2. You review and edit the table. The code (not a model) does the replacement, so it is deterministic. Values of 5 or more characters are replaced anywhere, also inside longer words ("Ammanns", "AcmeBillingService"); shorter values only where they stand as a word, so "ich" never breaks "wichtige".
3. Placeholders look like `[[PERSON_1]]`. On restore, `[PERSON_1]` and `PERSON_1` are also accepted.
4. Optionally add more text in step 3 that is sent as written, after the pseudonymized text. Use it for the part of the prompt that needs no pseudonymization, such as your question. The app warns if it contains a value from the mapping table.
5. Export the table as JSON if you want to restore an answer later.

## Project layout
```
public/            what the browser loads: index.html, style.css, js/ (core, detection, targets, ui)
server/            local server: routes, static files, settings, CLI bridge, GLiNER bridge
python/            GLiNER helper and its requirements
config/            CLI adapters
prompts/           prompt files, GLiNER labels, never-sensitive words
tests/             automated tests, see below
docs/              architecture.md (how it fits together), adr/ (decisions)
parked/            code that is not enabled yet
```
See `docs/architecture.md` for how the parts work together and `AGENTS.md` for the engineering rules (confidentiality first).

## Tests
```
npm test             # fast suite: privacy core, server, GLiNER helper (with fakes, no model, about 1 s)
npm run test:strict  # same, but known gaps fail instead of being reported as TODO
npm run test:model   # real GLiNER and GLiNER + Presidio on realistic synthetic documents (needs .venv, about 2 min)
npm run check        # syntax check of all JavaScript and the Python helper
```
The tests use 13 synthetic documents of the app's users (among them a German discharge letter and therapy note, a French court letter, an English due-diligence memo, an Italian referral and a CSV export). Known gaps, such as leaks the code doesn't prevent yet, are written as tests marked `KNOWN GAP` / `KNOWN LEAK` / `KNOWN BUG`: they run and are listed as TODO, so the suite stays green as a regression guard while the gaps stay visible. Server tests run a temporary copy of the project, so they never touch your `settings.json`.

## Security notes
- The mapping table stays in the browser. Settings go into `settings.json` and localStorage; no API keys are stored.
- The server listens on 127.0.0.1 only, serves only `public/` and `prompts/`, rejects CLI, detection and settings requests from any origin other than the app itself, and only answers API requests addressed to `localhost` or `127.0.0.1`.
- Text added in step 3 "sent as written" is not pseudonymized.
- Pseudonymization is only as good as detection. Always check the highlighted preview before sending; `npm test` lists the known gaps.

## Stubs / open decisions
Planned work with first designs is in `docs/todo.md` (document pipeline, notifications, GPU acceleration).
- PDF import in the desktop app (Docling and its models are not bundled yet). Word documents would be one more importer.
- Multi-turn chat with the same mapping, currently one request per run.
- Streaming answers.
