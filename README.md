# Pseudonymizer

Replaces sensitive values locally, sends only the pseudonymized text to a model of your choice, and restores the original values in the answer. Made for consultants, lawyers and doctors who want to use AI models without disclosing confidential data.

## Run
```
npm start                 # Node 22+, no npm install needed (no dependencies)
```
Open http://localhost:8091 (change with `PORT=9000 npm start`). For the default detector, install GLiNER once (see "Detection with GLiNER" below).

## Using the app
The top bar has three tabs:
- **Pseudonymize**: paste your text (or open or drop a text file) and find the sensitive values. Then step 2 shows exactly what will be sent, with the hidden parts highlighted: click one to see the original or to keep it visible, and open "Edit values" for the full list. Step 3 sends it, step 4 shows the answer with the original values restored.
- **Settings**: the detection model (GLiNER, GLiNER + Presidio, or Ollama) and the target model; rarely needed options are under "Advanced". Changes are saved automatically. A red dot means the detection model isn't ready.
- **Prompts**: the prompt files, see below.

The button at the top right switches between the system's light or dark mode, Light and Dark; the choice is kept in this browser. Files: text formats (.txt, .md, .csv, .json, .eml and similar, up to 5 MB) open directly; PDF import is planned, and opening a PDF says so.

While a model is working, the page is blocked with a progress window. **Cancel** (or Escape) stops the request; for CLIs, the server also stops the CLI process. Sending is only possible after detection has run. Pressing Detect without a detection model explains what is missing and offers to continue with patterns only. The model's answer is shown with the original values restored; the raw answer (with placeholders) is behind "Show model answer before restoring", where you can also paste an answer from any chat.

## Settings
Settings are saved to `settings.json` in the project folder (readable by your user only) and also kept in the browser. On start, the app reads `settings.json`; if the server can't be reached it falls back to the browser copy. The file is never served to the browser and is in `.gitignore`.

## Detection
Three local detectors, chosen under Settings > Detection model. All run on this machine; the original text is never sent anywhere. Patterns for emails, URLs, IP addresses and phone numbers can be added to any of them.

| | GLiNER (default) | GLiNER + Presidio | Ollama LLM |
|---|---|---|---|
| Speed | under 1 s for a letter, about 15 s for a 100-row CSV export (model loads once, ~5 s) | about the same, plus 2-3 s the first time a language is used | about 1-2 min on a laptop |
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

Detectors sometimes report pronouns, titles or greetings as values ("ich", "Sie", "Sehr geehrte Damen und Herren"). Values made only of such words are ignored; the list is `prompts/not-sensitive.default.txt` and can be extended like the labels.

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
1. A local detector (plus optional patterns for emails, URLs, IPv4/IPv6 and MAC addresses, AHV numbers, BIC/SWIFT codes, IBANs, card numbers (also without a valid checksum after "card number"), their last four digits after "ending in", security codes and expiry dates, usernames after "Skype:" or "Username:", IDs after a label such as "ID:", "Nr.", "réf.", "VIN:" or "Group #", reference codes such as "INC-20419", dates written with "/" or as 2026-10-14, timestamps such as 2026-10-14T08:14:00Z (with the time), street addresses in American, German, Swiss, French and Italian notation, and phone numbers) lists sensitive values. Where a pattern and the detector find the same value, the pattern's category is used. Values that don't literally appear in the input are discarded. When a person is found, a first or last name used on its own elsewhere ("Hi Sarah"), or first and last name without the middle name, gets the same placeholder, and so does a short form in brackets ("Universitätsspital Zürich (USZ)" and later "USZ").
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
- PDF import: `public/js/import/pdf.js` is registered and waiting for a local text extractor (pdf.js, vendored); see AGENTS.md for the rules. Word documents would be one more importer.
- Multi-turn chat with the same mapping, currently one request per run.
- Streaming answers.
