# Engineering Instructions for AI Coding Agents

**Pseudonymizer** is a local web app (and Electron desktop app) that lets consultants, lawyers and doctors use external AI models without disclosing confidential data: it detects sensitive values on the user's machine, replaces them with placeholders such as `[[PERSON_1]]`, sends only the pseudonymized prompt to a model the user chose, and restores the original values in the answer. PDFs are converted locally to Markdown and go through the same steps.

Priorities, in this order: **confidentiality** (a leak cannot be undone), **reliability** (predictable, fails visibly, recovers cleanly), **extensibility** (new detectors, targets and document types without rewrites). When something is not covered here, choose what serves these best. Write boring, explicit code consistent with what exists.

When instructions conflict: the user's explicit task instructions, then confidentiality and security (never traded for convenience or speed), then existing codebase conventions (match them locally, mention discrepancies instead of refactoring unasked), then this file, then general practice.

## Project facts

- Node >= 22, Node built-ins only; **zero runtime npm dependencies**. devDependencies are only the desktop build tools (Electron 44, electron-builder), pinned exactly, never imported by `server/` or `public/`.
- Python 3.12 in `.venv` (pip there only, pinned in `python/requirements.txt`) for the local helpers: GLiNER, Presidio with spaCy, Docling.
- Commands: `npm start` (http://localhost:8091, `PORT=...`), `npm run check`, `npm test` (fakes, ~1 s), `npm run test:strict` (known gaps fail), `npm run test:model` (real models, needs `.venv`), `npm run desktop`, `npm run dist:linux` / `dist:win`. Setup: `docs/setup.md`; other scripts are in `package.json`. No linter or formatter: match the surrounding style.
- Layout: `public/` (browser, plain ES modules, no framework or build step; `js/core/` privacy core, `js/detection/`, `js/import/`, `js/targets/`, `js/ui/`), `server/`, `python/`, `desktop/`, `config/adapters.json` (CLI targets), `prompts/` (`<name>.<ext>` overrides `<name>.default.<ext>`), `tests/`, `docs/adr/`, `parked/` (API targets, not served). Documentation: `README.md` (for people using the app), `docs/setup.md` (installing from source), `agents/` (for agents and developers: `README.md` index, `architecture.md`, `reference.md` for API, env, protocols, licences and measurements, `testing.md`, `todo.md`). Read `agents/architecture.md` for the details.
- Targets are local CLIs only (Claude Code, Codex, Gemini CLI). Storage is `settings.json` (mode 0600) plus a localStorage copy, no database.

If a fact here is outdated, trust the code and fix this file in the same change.

## Workflow

1. **Read before you write**: the files you change and the closest existing feature. Reuse existing helpers (`$`, `setStatus`, `h` in `ui/dom.js`; `whileBusy`; `callServer`; `core/`; `send`, `readBody`, `rejectUnlessFromApp` in `server/http.js`).
2. Ask only if the ambiguity affects what leaves the machine, the placeholder format, stored files or the server API; otherwise pick the conventional option and state the assumption.
3. Keep changes scoped and minimal; no unrelated reformatting or speculative abstractions. Tests alongside the code.
4. Before finishing: `npm run check`, `npm test` (plus `test:model` when detection changed), then exercise the flow in the running app with **synthetic data**; for detection, compare before and after on the same text. Never claim what you did not verify. Clean up (settings restored, servers stopped, temp files deleted).
5. Finish with a short summary: what and why, assumptions, what is unverified, follow-ups.

Never: weaken a privacy safeguard (ask instead); add an npm dependency, build step, CDN script or hosted service without asking; delete code you don't understand; use real client, patient or case data anywhere; invent APIs, packages, model names or CLI flags (check installed versions or official docs).

## Confidentiality invariants (non-negotiable)

Users are bound by professional secrecy (e.g. Art. 321 Swiss Criminal Code) and handle health data.

1. The original text, original document and mapping table never leave the machine. Only the pseudonymized prompt (plus text explicitly marked "sent as written") goes to the target.
2. Detection, OCR and document parsing run locally. A hosted service would have to be opt-in, off by default and clearly labelled as sending the original.
3. **Fail closed.** Failed, cancelled, unusable or stale detection is shown to the user and blocks sending; never fall back to a weaker detector silently.
4. Prefer recall over precision: a missed name is a leak.
5. The user always reviews the highlighted preview of exactly what will be sent; never send automatically.
6. Replacement and restore are deterministic code, not a model: longest value first, placeholders never re-replaced, unknown placeholders reported.
7. Model output is untrusted: detected values must literally appear in the input (`addEntry`); answers are shown with `textContent`.
8. No telemetry or external requests from the page except to the configured detector and target. Third-party browser code is vendored, never from a CDN.
9. Leave no copies: temp files are deleted after use; nothing confidential in logs, `settings.json` or localStorage.
10. No secrets in the app; the CLIs keep their own logins.

PDFs: uploaded only to the local server (`POST /api/extract/pdf`), extracted by `python/document_extraction.py` in a killable process in a private temp folder that is always deleted; Docling with remote services and plugins off, models only from the local artifacts path, nothing downloaded at run time. Never send the original PDF bytes or file name. Images become `[Image N, page P: not sent]`, unconverted formulas `[Formula N, page P: not converted]`.

## Architecture rules

- `public/js/core/` stays pure: data in, data out, mapping passed as a parameter; no DOM, `fetch` or storage.
- One I/O path per kind: detectors via `DETECTORS`, targets via `callCli`, server via `callServer`, processes via `server/`. Long calls run in `whileBusy` and honour its `AbortSignal`, and cancelling stops server-side work; short calls have timeouts.
- Extend through registries (`DETECTORS`, `ROUTES` in `server/index.js`, `IMPORTERS`, `config/adapters.json`), not `if` chains. Wrap third-party libraries behind one project-owned file.
- UI modules each have an `init…` called from `main.js`; workflow state is the `state` object in `ui/workflow.js`; settings are read with `readSettings()`. Functions and composition over classes.
- Server env vars are read and validated only in `server/config.js` (and set by `desktop/main.js`); document new ones in `agents/reference.md` (and `docs/setup.md` if users set them). New settings go into `SETTING_FIELDS` and the Settings tab.

## Validation and errors

- Validate by hand where data enters: requests (origin, `Content-Type`, JSON shape, allowlist patterns for anything reaching a command line or path), model and helper output, files, localStorage (may be missing or old), process exit codes. Never trust "our own" side.
- Expected problems: a plain-language `setStatus(id, message, true)` with what to do. Operational failures: show, allow retry or cancel, restart helpers next time. Bugs: throw.
- Server errors are `{ "error": "message" }` with 400/403/404/415/502. API changes are additive; keep client and server in sync and document endpoints in `agents/reference.md`.
- No swallowed errors (an empty `catch` needs a comment), no floating promises, child processes always have a timeout or cancel path.

## Security (non-negotiable)

Listen on `127.0.0.1` only; check `Host` on every `/api/` request and `Origin` plus `Content-Type` on state-changing ones; no CORS headers. Never pass user input to a shell: argument arrays, allowlisted arguments. Static serving only from `public/` and `prompts/`, no hidden files. A malformed request never stops the server. `innerHTML` only to clear or insert a static literal. Log nothing but the startup line, never content. Multi-user or network use needs a new security review: stop and ask.

## Tests

`node:test` with `node:assert/strict`, files `tests/**/*.test.mjs`: core in `tests/core/` (via `tests/helpers/core.mjs`), server in `tests/server/` (`startServer()` with fakes), helper protocol in `tests/helper/`, importers in `tests/import/`, detection quality in `tests/model/` and `tests/fixtures/documents.mjs`. UI is verified by hand.
- Every behavior change has tests; every bug fix a regression test, especially for leaks and wrong restores.
- Missing correct behavior is a normal test with `knownGap('reason')`; remove it when fixed; never use it to hide a regression. `knownMisses` and `knownChanges` in `tests/model/detection-eval.test.mjs` are updated only from an actual run.
- Synthetic data only (made-up names, `example.com`, `192.0.2.x`, fake IDs), multilingual (de, fr, it, en) with domain IDs (AHV, IBAN, case numbers, birth dates, addresses). Deterministic (`createRandom(seed)`), no real models or hosted services in the default suite, never touch the user's `settings.json`, servers or CLIs.

## Dependencies and offline

Any dependency or download needs the user's approval (name, source, size); check that the licence allows commercial use and that it runs locally, and state alternatives considered. The desktop app stays offline: bundled models with `HF_HUB_OFFLINE=1`, `desktop/main.js` blocks non-local requests; check new Electron features for background downloads. Prefer platform APIs.

Hardware acceleration goes through `python/accelerators.py` only. A back end other than PyTorch on the CPU is used only after it found the same values as the CPU on the test text (`verify`); otherwise the CPU is used and the user is told (`runtime.notice`). ONNX Runtime always gets an explicit list of local providers, never the defaults (they include `AzureExecutionProvider`), and runs with `ORT_DISABLE_TELEMETRY=1`, set in `python/accelerators.py` before anything imports it (it reports to Microsoft on import otherwise). Check every new Python package for network calls with strace (`agents/testing.md`). New back ends need the same check and an entry in the allowlist `ACCELERATOR` in `server/gliner.js`.

## Style

- Files `kebab-case.js`, tests `kebab-case.test.mjs`, Python `snake_case.py`; `camelCase` functions (verb first) and DOM ids; `SCREAMING_SNAKE_CASE` constants and regexes; named exports only. Browser imports are relative with `.js`; server imports use `node:`.
- Model variant state explicitly (`detectedFor === null`), handle every case. Static data as `const`; user-editable lists in `prompts/` with a parser that reports by line. No piecemeal JSDoc types or `@ts-check`.
- Early returns, short functions, self-documenting names. Comments only for non-obvious reasons or data shapes; **every regex is named and has a comment** explaining its parts. No dividers, commented-out code, stray TODOs or debug output.
- UI: plain language for non-technical users, every async action shows its state, later steps locked until earlier ones are done, advanced options in `<details class="more">`, no `alert`/`confirm` (second click confirms), accessible (labels, keyboard, ARIA only when needed), light and dark CSS tokens, usable at phone width.
- Use `-` or `,` instead of em or en dashes in UI text, docs and comments.

## Documentation

Update in the same change, keeping the audiences apart:
- `README.md` is for people using the app: a short, plain-language note for a new user-visible feature or limitation, no technical detail.
- `docs/setup.md`: new setup steps or optional installs.
- `agents/reference.md`: new API routes, env vars, protocols, data locations, models and licences, measurements, detector labels and prompt behavior (plus `prompts/README.md` if relevant). `agents/testing.md`: new test setups and pitfalls.
- New project facts: this file and `agents/architecture.md`. Planned work and open decisions: `agents/todo.md`, removing items when done.
- Significant decisions (build step, TypeScript, npm dependency, hosted service, new process or storage location) get an ADR in `docs/adr/`.
