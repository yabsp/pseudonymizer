# Engineering Instructions for AI Coding Agents

You are working on **Pseudonymizer**, a local web app that lets consultants, lawyers and doctors use external AI models without disclosing confidential data. It detects sensitive values in a text on the user's machine, replaces them with placeholders such as `[[PERSON_1]]`, sends only the pseudonymized prompt to a model the user chose, and restores the original values in the answer. Planned next: importing PDF documents, pseudonymizing them locally and uploading only the pseudonymized version.

Three qualities matter above all, in this order:

1. **Confidentiality**: original values never leave the user's machine unless the user explicitly sends them. A leak cannot be undone.
2. **Reliability**: the code behaves predictably, fails visibly and recovers cleanly. When detection is uncertain or broken, the user must see it.
3. **Extensibility**: new detectors, target models and document types can be added without rewriting existing ones.

When a situation is not covered here, decide based on which option better serves these goals, in that order. Write code a careful senior engineer would approve: boring, explicit and consistent with what already exists.

---

## 0. Project Facts

```yaml
runtime:
  node: ">= 22"                  # server and browser code use only built-in APIs
  python: "3.12, in .venv"       # only for the detection helper (GLiNER, Presidio)
  electron: "44, desktop app only" # desktop/main.js runs the unchanged server in Electron
package_manager:
  javascript: none at runtime    # zero runtime dependencies by design; devDependencies are build tools only
                                 # (electron, electron-builder, pinned exactly) for the desktop app
  python: pip inside .venv       # never install into the system Python; versions in python/requirements.txt
commands:
  run:         npm start                # http://localhost:8091, change with PORT=...
  desktop:     npm run desktop          # the desktop app from the project folder (needs npm install)
  dist:        npm run dist:linux       # AppImage in dist/; dist:win on Windows (helper via PyInstaller, model bundled)
  setup:       see README, section "Detection with GLiNER"
  check:       npm run check            # syntax of every JS file and the Python helper
  test:        npm test                 # fast suite with fakes, about 1 s
  test_strict: npm run test:strict      # known gaps fail instead of TODO
  test_model:  npm run test:model       # real GLiNER and GLiNER + Presidio on realistic documents, needs .venv
  lint / format / typecheck: none configured; match the surrounding style by hand
stack:
  frontend:  plain HTML, CSS and JavaScript as native ES modules (public/), no framework, no build step
  backend:   server/, ES modules, Node built-ins only (http, fs, child_process)
  detection: GLiNER (python/gliner_helper.py, JSON lines over stdio), optionally plus Presidio with spaCy
             (python/presidio_detection.py, same helper), Ollama (HTTP), regex patterns
  documents: PDF to Markdown with Docling (python/document_extraction.py, one process per file), not yet in the desktop app
  targets:   local CLIs only (Claude Code, Codex, Gemini CLI) via config/adapters.json; API targets parked in parked/
  storage:   settings.json (mode 0600) plus a localStorage copy; no database
  prompts:   prompts/<name>.md overrides prompts/<name>.default.md
  tests:     node:test, tests/**/*.test.mjs
```

If a fact here is outdated, trust the code and update this file in the same change.

---

## 1. Priority Order

When instructions conflict, follow this order:

1. Explicit instructions from the user in the current task.
2. Confidentiality and security (Sections 3 and 10). Never trade these away for convenience or speed.
3. Existing conventions in the codebase. Consistency with surrounding code beats this document's preferences; if existing code contradicts these rules, match it locally and mention the discrepancy in your summary rather than refactoring it unasked.
4. The rules in this document.
5. General best practices from your training.

---

## 2. Workflow for Every Task

### Before writing code
1. **Read before you write.** Open the files you'll change and the closest existing feature. Reuse its patterns for structure, naming, error messages and UI.
2. **Search for existing helpers** before creating new ones: `$`, `setStatus` and `h` (`ui/dom.js`, `h` builds elements with text only, never HTML), `whileBusy` (`ui/busy.js`), `callServer` (`server-api.js`), the core functions in `core/`, and on the server `send`, `readBody`, `rejectUnlessFromApp` (`server/http.js`).
3. **Clarify only when it matters.** Ask if the ambiguity changes what data leaves the machine, the placeholder format, stored files or the server API. For minor ambiguities, pick the most conventional option, proceed and state the assumption in your summary.

### While writing code
4. **Keep the change scoped.** Modify only what the task requires. Don't reformat, rename or "clean up" unrelated code.
5. **Make the smallest design that works** while keeping the extension points in Section 4. No abstraction layers or options for hypothetical needs.
6. **Write or update tests alongside the code** where a test setup exists (Section 8).

### Before finishing
7. Run `npm run check` and `npm test` (and `npm run test:model` when detection changed). Then verify the changed flow for real: start `npm start` (use `PORT=...` if 8091 is taken) and exercise it with **synthetic data**. For detection changes, compare results before and after on the same sample text.
8. **Never claim something works if you did not verify it.** If you couldn't run a check (no browser, model not installed, CLI not logged in), say so explicitly.
9. Don't leave test artifacts behind: restore `settings.json` if a test changed it, stop servers you started, delete temporary files.
10. Finish with a short summary: what changed and why, assumptions, anything not verified, and recommended follow-ups.

### Never
- Weaken a privacy safeguard (Section 3) to make something work or faster. Stop and ask instead.
- Add an npm dependency, a build step, a CDN script or a hosted service without asking first (Section 15).
- Delete or rewrite code you don't understand. Ask or leave it.
- Use real client, patient or case data anywhere: code, tests, fixtures, examples, screenshots, commit messages.
- Invent APIs, package names, model names or CLI flags. Check the installed version (`.venv/lib/...`, `claude --help`, Ollama's `/api/tags`) or official docs first.

---

## 3. Confidentiality Invariants (Non-Negotiable)

Users are bound by professional secrecy (lawyers and doctors, e.g. Art. 321 of the Swiss Criminal Code) or contractual confidentiality (consultants), and health data is a special category of personal data under Swiss and EU data protection law. Design every feature so a user can rely on these rules:

1. **The original text, the original document and the mapping table never leave the machine.** Only the pseudonymized prompt (plus text the user explicitly added as "sent as written") goes to the target model.
2. **Detection runs locally.** Never add a hosted detection, OCR or document-parsing service. If a user asks for one, it must be opt-in, clearly labelled in the UI as sending the original text to a third party, and off by default.
3. **Fail closed.** If detection fails, is cancelled, returns unusable output or is stale, the user must see it, and sending must not silently proceed with less protection. Never fall back to a weaker detector without telling the user.
4. **Prefer recall over precision.** A false hit costs a moment of review; a missed name is a leak. Defaults should lean toward finding more.
5. **The user reviews before sending.** The highlighted preview of exactly what will be sent is always visible after detection and is the mandatory review step; every hidden value can be inspected from it, and the full value table is one click away ("Edit values"). Never send automatically after detection.
6. **Replacement and restore are done by code, not by a model.** They must stay deterministic: longest value first, placeholders never re-replaced, unknown placeholders reported.
7. **Model output is untrusted data.** Detected values must literally appear in the input (`addEntry` enforces this); answers are displayed with `textContent`, never as HTML.
8. **No telemetry, no analytics, no external requests from the page** except to the detector and target model the user configured. Ship third-party browser code vendored in the repo, never from a CDN.
9. **Leave no copies behind.** Temporary files (CLI working directories, extracted document text) are deleted after use; nothing confidential is written to logs, `settings.json` or localStorage.
10. **No secrets in the app.** The CLIs keep their own logins; the app stores no API keys or tokens. If API targets come back, keys must be opt-in to store, and the UI must say where.

---

## 4. Architecture

### Current layout
```
public/                   # Served to the browser (the only static root, plus prompts/)
  index.html, style.css   #   three tabs: Pseudonymize, Settings, Prompts; colors are CSS tokens for light and dark
  js/theme-boot.js        #   classic script in <head>: applies the chosen theme before the page is drawn
  js/main.js              #   starts the app: init the UI modules, load settings and prompts
  js/core/                #   privacy core, pure: mapping.js (addEntry, addDetected incl. name parts and short
                          #   forms, pseudonymize, restore, parseMapping), common-words.js (prompts/not-sensitive*.txt), patterns.js,
                          #   chunking.js, prompt.js (buildPrompt, findMappedValues)
  js/detection/           #   gliner.js, gliner-labels.js (reads prompts/gliner-labels*.txt), presidio.js, ollama.js;
                          #   index.js registers them in DETECTORS
  js/import/              #   document importers: index.js (IMPORTERS registry, importDocument), text.js, pdf.js
  js/targets/             #   cli.js: sends the prompt through the server to a CLI
  js/ui/                  #   dom, tabs, theme, busy overlay, settings (store, detector, target, panel),
                          #   prompts panel, render, files, workflow (the four steps and their state)
  js/server-api.js        #   calls to the local server
server/                   # index.js (route table, listen), config.js (env and paths), http.js,
                          # static.js, settings.js, cli.js (CLI bridge), gliner.js (GLiNER bridge),
                          # documents.js (PDF extraction), about.js
python/                   # gliner_helper.py (long-lived, JSON lines over stdio), presidio_detection.py (the only
                          # file that uses Presidio and spaCy), document_extraction.py (the only file that uses
                          # Docling; one process per PDF), requirements.txt
desktop/                  # main.js (Electron: search path, data folder, bundled helper and model, lock-down),
                          # run-dev.mjs, build-helper.mjs (PyInstaller), build-models.mjs, icons/
config/adapters.json      # CLI adapters (command, args, stdin template)
prompts/                  # Prompt files and GLiNER labels; <name>.<ext> overrides <name>.default.<ext>
tests/                    # core/, server/, helper/, model/, fixtures/, helpers/ (Section 8)
docs/architecture.md      # How the parts fit together (keep it up to date)
docs/adr/                 # Architecture decisions
docs/todo.md              # Planned work and open decisions (keep it current)
parked/                   # Code not enabled yet (API targets), not served
```

### Rules
- **Keep the privacy core pure.** Everything in `public/js/core/` takes data and returns data (the mapping is a parameter, never global). No DOM access, `fetch` or storage there; that keeps it testable and easy to audit.
- **I/O goes through one place per kind:** detectors through `DETECTORS`, the target model through `callCli`, the local server through `callServer`, local processes through `server/`. Long-running calls run inside `whileBusy` and accept its `AbortSignal`.
- **Add variants through the registries**, not `if` chains: a new detector is a file in `detection/` plus an entry in `DETECTORS`; a new API route is an entry in `ROUTES` in `server/index.js`. CLIs are data-driven: arguments, login hint and model list are an entry in `config/adapters.json`, never special cases in code. Document importers (PDF) get the same treatment: one registry, one file per format.
- **Wrap third-party code** (pdf.js, GLiNER, Presidio, model APIs) behind one project-owned function or file. The rest of the code never calls the library directly.
- **UI modules own their part of the page:** each has an `init…` function that wires its controls; `main.js` only calls them. Workflow state lives in the `state` object in `ui/workflow.js`; settings are read from the form with `readSettings()`.
- **Prefer functions and composition** over classes, matching the existing code.

### PDF documents
- The page uploads a PDF only to the local server (`POST /api/extract/pdf`, `public/js/import/pdf.js`); `server/documents.js` writes it to a private temporary folder, runs `python/document_extraction.py` (Docling, the only file that uses it) in a separate process that is killed on cancel or timeout, and deletes the folder in every case.
- Extraction is local only: `enable_remote_services` and external plugins stay off, models come from `~/.cache/docling/models` (or `DOCLING_ARTIFACTS_PATH`), and nothing is downloaded at run time. Scanned pages and text in images are read with local OCR (RapidOCR); never a cloud OCR service.
- The result is Markdown (headings, tables, formulas as LaTeX when the user asks for conversion) and goes through the same detection, review and replacement steps as pasted text. No separate shortcut path.
- **Never send or upload the original PDF bytes.** Only the pseudonymized Markdown goes on, inside the message (`buildPrompt(..., { isDocument: true })`) or as a file the user saves. Images are replaced by `[Image N, page P: not sent]`, unconverted formulas by `[Formula N, page P: not converted]`; metadata, annotations, form fields and attachments are not part of the Markdown. Text Docling reads anywhere (also hidden layers or text in images) is in the Markdown, so it is detected and shown in the review like everything else.
- The original file name is never sent or used for saved files; it often contains a name.
- Show the user what will be sent before it is sent, as with text prompts.

---

## 5. JavaScript Conventions

The project is plain JavaScript without TypeScript or a build step. Keep it that way unless the user decides otherwise (that would be an ADR, Section 17).

- Browser code: native ES modules with relative imports including the `.js` extension; `const`/`let`, arrow functions for small helpers, `async`/`await`, the `$` helper for `getElementById`.
- Server code: ES modules (`import ... from 'node:fs'`), Node built-ins only.
- Tests: `.test.mjs` files using `node:test` and `node:assert/strict`.
- Python helper: standard library plus the packages in `.venv`; answers only on stdout, everything else on stderr.
- Model variant state explicitly (e.g. `detectedFor === null` means "not detected yet") instead of loose flags, and handle every case.
- Static data as `const` objects or arrays (`PATTERNS`, `DETECTORS`). Lists users should read or extend live in files under `prompts/` instead (e.g. the GLiNER labels), with a parser in code that reports problems by line.
- Don't introduce JSDoc type annotations or `// @ts-check` piecemeal; if type checking is wanted, propose it as one change.

---

## 6. Runtime Validation

There is no schema library (zero dependencies), so validate by hand, close to where data enters, and reject anything unexpected with a clear message.

Trust boundaries that always need validation:
- **Requests to the server:** origin and `Content-Type` (`rejectUnlessFromApp`), JSON parsing, the shape and type of every field used, and an allowlist pattern for anything that ends up in a command line or file path (see the model-name checks).
- **Model output:** Ollama JSON, GLiNER entities and target-model answers. Check types and treat values as plain text.
- **Files:** `settings.json`, imported mapping files (`parseMapping`), loaded text files and, later, PDFs (size limits, type checks, parse errors).
- **Browser storage and settings:** localStorage may be missing, empty or from an older version.
- **External processes:** CLI exit codes and output, the GLiNER helper's answers.

Never trust a value just because it came from "our own" helper or server; each side validates what it receives.

---

## 7. Error Handling

| Kind | Example | How to handle |
|---|---|---|
| Expected | no text entered, no detection model, Ollama not running, CLI not installed | Clear message via `setStatus(id, message, true)` with what to do next |
| Operational | timeout, helper crashed, model returned garbage | Show it, let the user retry or cancel; restart helpers on the next request |
| Bug | impossible state, broken invariant | Throw; don't hide it behind a default value |

Rules:
- User-facing messages say what happened and what to do, in plain language, without stack traces.
- Server errors use the existing shape `{ "error": "message" }` with a fitting status code (400 invalid input, 403 origin/host, 404, 415, 502 when a model, CLI or helper fails). Evolve it additively.
- **Never swallow errors.** An empty `catch` is only allowed with a comment explaining why losing the error is correct (e.g. a best-effort localStorage write when the file save reports separately).
- Never leave a promise floating: `await` it, return it, or mark deliberate background work with a comment (as `warmUpGliner()` does).
- Long model calls must be cancellable through the `whileBusy` signal; cancelling must also stop server-side work (see `handleCli` in `server/cli.js`). Short calls (settings, model lists) should have a timeout (`AbortSignal.timeout(ms)`, as `listOllamaModels` does).
- Child processes always have a timeout or a cancel path and clean up their temporary files.

---

## 8. Testing

Tests use Node's built-in runner (`node:test`), no framework:

| What you changed | Where the test goes |
|---|---|
| Privacy core (`public/js/core/`) | `tests/core/`, importing through `tests/helpers/core.mjs` |
| Server routes, static files, settings, CLI or GLiNER bridge | `tests/server/`, using `startServer()` from `tests/helpers/server.mjs`, which runs a temporary copy of the project with fakes (`tests/fixtures/fake-cli.mjs`, `tests/fixtures/fake_gliner/`) |
| Python helper protocol | `tests/helper/` |
| Detection quality | `tests/model/` (real GLiNER, opt-in) and the documents in `tests/fixtures/documents.mjs` (which includes `generated-documents.mjs`) |
| Document importers (`public/js/import/`) | `tests/import/` (Node has `File`, so importers run without a browser) |
| UI | not automated yet; verify in the browser (Section 2, step 7) |

Rules:
- Every behavior change ships with tests; every bug fix gets a regression test that fails without the fix, especially for leaks (a value that stayed visible) and wrong restores.
- **Known gaps:** correct behavior the code doesn't have yet is written as a normal test with `knownGap('reason')` from `tests/helpers/known-gaps.mjs`. It is reported as TODO; `npm run test:strict` makes it fail. When you fix a gap, remove the `knownGap(...)` so the test guards the fix. Never mark a test as a known gap to hide a regression.
- In `tests/model/detection-eval.test.mjs`, `knownMisses` and `knownChanges` per detector are a measured baseline; update them only from an actual run and say so in your summary.
- **Synthetic data only.** Use made-up names (e.g. "Hans Muster", "Maria Keller"), `example.com` addresses, documentation IP ranges (`192.0.2.x`, `198.51.100.x`) and obviously fake IDs. Never paste real client or patient data into tests, fixtures or bug reports.
- Test behavior that matters to users: "this value is no longer in the prompt", "the answer is restored", "detection failure is reported".
- Tests must be deterministic (use `createRandom(seed)` from `tests/helpers/random.mjs` for generated cases) and the default suite must not call real models or hosted services.
- Tests never touch the user's `settings.json`, running servers or real CLIs.
- Include multilingual samples (German, French, Italian, English) and domain identifiers: AHV numbers, patient and case numbers, dates of birth, IBANs, addresses.

---

## 9. Configuration & Secrets

- User settings live in `settings.json` (written by `server/settings.js` with mode 0600) and a localStorage copy. Add a new setting to `SETTING_FIELDS` in `ui/settings-store.js` and to the Settings tab; settings save automatically.
- Server configuration comes from environment variables, read and validated once in `server/config.js` (`PORT`, `GLINER_PYTHON`, `PSEUDONYMIZER_DATA_DIR`, `DETECTION_HELPER`, `PSEUDONYMIZER_APP`); the server refuses to start with invalid values. Never read `process.env` elsewhere, except in `desktop/main.js`, which sets these variables before it starts the server. Document new ones in the README in the same change.
- `settings.json` and `.venv/` are never committed (see `.gitignore`). `settings.json` is never served as a static file.
- Never put secrets in prompts, `config/adapters.json`, the README or examples.

---

## 10. Security (Non-Negotiable)

The app is single-user and local. Keep it that way:

- The server listens on `127.0.0.1` only. Every `/api/` request checks the `Host` header (DNS rebinding); every state-changing or process-starting request checks `Origin` and `Content-Type`.
- Never pass user input to a shell. Spawn processes with an argument array; validate anything that becomes an argument (model names) against an allowlist pattern.
- Static serving is limited to `public/` and `prompts/` and never serves hidden files. Nothing confidential or server-side goes into those folders.
- A single malformed request must never stop the server; handle request parsing errors per request.
- Use `textContent` for anything that comes from users, files or models. `innerHTML` is only allowed for clearing an element or inserting a static string literal written in the code.
- No CORS headers on the local API. If a feature seems to need them, stop and ask.
- Never log text, prompts, answers, mappings, settings or API keys. The server logs only its startup line and, if ever needed, metadata without content.
- If the app is ever meant to run for several users or on a network, that needs authentication and a new security review first. Stop and ask.

---

## 11. Server API

- Routes are the `ROUTES` table in `server/index.js`; handlers live in the module of their feature (`server/cli.js`, `server/gliner.js`, `server/settings.js`) and stay thin.
- Request and response shapes are plain JSON; keep client and server in sync in the same change and document new endpoints in the README.
- Use correct methods and status codes (GET reads, PUT replaces settings, POST runs detection or a model).
- Evolve the API additively: add fields, don't rename or remove them. Flag any breaking change in your summary.

---

## 12. Frontend

- Workflow state lives in the `state` object in `ui/workflow.js` (`mapping`, `pseudoText`, `detectedFor`); settings live in the form fields and are read with `readSettings()`. Derive values (e.g. `currentPrompt()`) instead of storing copies, and replace the mapping instead of mutating it.
- Every async action shows its state: the busy overlay for model work, status lines for results and errors, explicit empty states (`data-empty`).
- Steps that depend on earlier ones stay locked until those are done (e.g. Send stays disabled until detection has run).
- The UI is for non-technical professionals: plain language, short hints, no jargon in messages, sensible defaults.
- Accessibility: semantic HTML, labels for every control, keyboard access (tabs support arrow keys, Escape cancels), ARIA only where semantics are not enough.
- Respect light and dark mode through the CSS custom properties in `style.css`: tokens on `:root`, dark ones under `prefers-color-scheme` (unless `data-theme="light"`) and under `[data-theme="dark"]`. The theme choice (System, Light, Dark) lives in localStorage only (`ui/theme.js`). Keep layouts usable at phone width.
- Keep the page simple: show what most users need, put the rest behind `<details class="more">` ("Advanced", "Edit values"), and reveal later steps only once earlier ones are done.
- No browser dialogs (`alert`, `confirm`); report in a status line and confirm destructive actions with a second click.
- Text style: use `-` or `,` instead of em or en dashes, in UI text, docs and comments.

---

## 13. Logging & Observability

- The server uses `console.log` only for the startup line. Don't add request logging that could contain content.
- The GLiNER helper's stderr is kept in memory only to explain crashes; don't persist it.
- Measure performance with synthetic samples when changing detection, and report timings in your summary.

---

## 14. Performance

- Detection speed matters (users wait in front of the overlay), but never at the cost of recall or locality.
- Never block the Node event loop with heavy work; models run in separate processes (Ollama, the GLiNER helper, CLIs).
- Keep heavy models loaded once and warmed up in the background, as GLiNER is.
- Load large browser libraries (e.g. pdf.js) lazily, only when the feature is used.

---

## 15. Dependencies

- Zero runtime npm dependencies is a deliberate property: easy to audit, and `npm start` needs no `npm install`. The only devDependencies are the desktop build tools (Electron, electron-builder), pinned exactly and never imported by `server/` or `public/`. Adding any dependency needs the user's approval.
- The desktop app must stay offline: models are bundled and loaded with `HF_HUB_OFFLINE=1`, and `desktop/main.js` blocks every request from the window that doesn't go to this machine. Check new Electron or Chromium features for background downloads (the spell checker fetched dictionaries from Google until it was switched off).
- Prefer platform APIs (`fetch`, `URL`, `AbortController`, `crypto.randomUUID`, `Intl`, Node built-ins).
- Browser libraries are vendored into the repo with their version and licence noted, never loaded from a CDN.
- Python packages go into `.venv` only, pinned in `python/requirements.txt`.
- Before adding a model or library, check its licence (users may be commercial) and that it runs locally. State in your summary what you added, why, its licence and the alternatives considered.
- Downloads (packages, models) need the user's approval, with name, source and size.

---

## 16. Code Style

| Thing | Convention |
|---|---|
| Files | `kebab-case.js`, tests `kebab-case.test.mjs`, `snake_case.py` for Python |
| Modules | one responsibility each, named after it; no header comment needed |
| Functions / variables | `camelCase`; functions start with a verb (`detectWithGliner`, `renderMappingTable`) |
| Constants | `SCREAMING_SNAKE_CASE` for static data, registries and regexes (`PATTERNS`, `DETECTORS`, `MODEL_NAME`) |
| DOM ids | `camelCase` (`detectBtn`, `glinerStatus`) |
| Exports | named exports only |

- Prefer early returns over deep nesting; keep functions short and single-purpose.
- **Code documents itself:** clear names, small named helpers and named constants instead of comments. Rewrite unclear code rather than explaining it.
- **Comments only where the code can't say it:** a non-obvious reason, a counter-intuitive decision, a protocol or data shape. No comment on a short function with a clear name and no surprising logic, and no comment that repeats the code.
- **Every regex gets a comment** that explains each non-trivial part (e.g. what `\S+`, `\b`, a lookbehind or a character class matches), with an example where it helps. Give regexes a name (`const MODEL_NAME = /.../`).
- No section-divider comments, commented-out code, stray TODOs or debugging output.

---

## 17. Documentation Duties

Update docs in the same change that makes them outdated:
- New setting, command, environment variable or setup step: `README.md`.
- New detector labels or prompt behavior: `README.md` and, if relevant, `prompts/README.md`.
- New project fact (runtime, command, structure): Section 0 and 4 of this file, and `docs/architecture.md`.
- Significant decisions (adding a build step, TypeScript, an npm dependency, a hosted service, a new process or storage location): propose an ADR in `docs/adr/` and mention it in your summary.

---

## 18. Final Self-Check

Before reporting the task as done, confirm each of these:

- [ ] The change does what was asked, and nothing unrelated.
- [ ] No original value, document or mapping can reach anything other than this machine without the user explicitly sending it.
- [ ] Failures are visible to the user; nothing silently falls back to weaker protection.
- [ ] It follows existing patterns in the surrounding code.
- [ ] Data from outside (requests, files, model output, storage) is validated.
- [ ] Errors are handled, not swallowed; no floating promises; long calls are cancellable, short calls have timeouts.
- [ ] No content or secrets in logs; `innerHTML` only for static strings.
- [ ] Verified with synthetic data in the running app; `check` passes; tests pass where they exist.
- [ ] Test artifacts are cleaned up (settings restored, servers stopped).
- [ ] README and this file are updated where needed.
- [ ] Your summary lists assumptions, unverified parts and suggested follow-ups.
