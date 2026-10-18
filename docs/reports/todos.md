# Report: todos swarm (branch feat/todos)

Scope: docs/todo.md items 1 (document pipeline) and 2 (notifications), Windows robustness, and the other open
items that need no product decision. Branch `feat/todos`, based on `fix/windows-utf8`; nothing pushed or merged.

## Commits
| Commit | What |
|---|---|
| 12fc368 | Windows: CLIs looked up on PATH/PATHEXT, `.exe` started without a shell, cancel and timeout end the whole process tree (`taskkill /T /F`, argument array), "CLI not installed" message works on Windows |
| 7ecbead | Windows: `settings.json` written to a temp file and renamed (fixes the known "existing readable file stays readable" bug), access list limited to the current user with `icacls`; tests and `npm run check` find the venv Python like `server/config.js`; `test:strict`, `test:model`, `check` as node scripts (`scripts/`); document tests run on Windows with a Python fake |
| 83f40b2 | Server job list `server/jobs.js`: `POST/GET/DELETE /api/jobs`, pipeline registry per format, one job at a time, in memory only |
| 248673c, 5d6fe88 | Documents tab (`ui/documents.js`), detection as a step in the page (`detection/find-values.js`, shared with step 1), open into the normal review, notifications (`ui/notifications.js`), desktop allows only the notification permission, ADR 0005 |
| bfe9d77 | Prompts tab "Save": overrides written to `prompts/` in the data folder (desktop app files are read-only), served before the shipped ones; `PUT /api/prompts/<file>` |
| e85e0c0, 74e0e15, last | PyInstaller through the venv's Python and torchvision's operator libraries bundled (Windows helper works); keyboard focus kept while the Documents list updates; this report |

## What was implemented
- **Documents tab** (item 1): add or drop several text or PDF files; each is a job on the local server with a
  pipeline of steps per format (`PIPELINES` in `server/jobs.js`: text is read as UTF-8, PDF goes through
  `extractPdf` in `server/documents.js`, which calls `python/document_extraction.py` with its current answer
  shape, unchanged). One job runs at a time, the list stays in input order whatever finishes first. States:
  waiting, running (step label and seconds), ready, failed (with the reason); Cancel/Remove per job (a second
  click for a running or ready one) stops the process tree and deletes the temp folder; a waiting PDF is never
  written to disk. After conversion the page finds the values with the detector chosen in Settings, so the
  job ends at "Ready to review, N values to hide"; Open puts it into step 1 with its values in step 2. Sending
  stays manual. Jobs, bytes and results live in memory only; file names stay in the page.
  Limits: 50 documents, 500 MB waiting, 5 MB per text file, 50 MB per PDF.
- **Notifications** (item 2): opt-in checkbox in Settings (saved as `notify`), Notification API in the
  browser, native notifications in the desktop app (`desktop/main.js` grants only `notifications`, only for
  the local page; `setAppUserModelId` on Windows). Shown only when the window is not in front. Texts:
  "Document 2 of 5 is ready to review.", "... could not be converted.", "Sensitive values found. Check them
  before sending." No file names, text or values.
- **Windows robustness** (item 3): see the first two commits. Settings mode 0600 test is platform-aware and
  checks the access list on Windows (`tests/helpers/file-access.mjs`).
- **Other open items**: prompt changes in the installed desktop app are kept now (Save in the Prompts tab).
  The Windows desktop build was made to work and tested up to the unpacked app (see below).

## API added (all documented in README)
- `POST /api/jobs?format=pdf|text[&formulas=1]` (body: the file) -> `201 { id, format, formulas, state, step, error }`
- `GET /api/jobs` -> list in that shape, no text; `GET /api/jobs/<id>` adds `result: { text, document? } | null`
- `DELETE /api/jobs/<id>` -> cancel and forget (Origin checked)
- `PUT /api/prompts/<file>` (`{ text }`, allowlisted names) -> `{ file }`

## Verified
- `npm run check` and `npm test` on Windows: 245 tests, 232 pass, 0 fail, 13 TODO (known gaps). Before the
  Windows fixes, 3 tests failed on Windows.
- New tests: `tests/server/jobs.test.mjs` (order, one at a time, cancel running and waiting, temp folders
  deleted, failures and crashes, limits, origin checks), `tests/import/jobs.test.mjs` (no file name in the
  upload, size and format checks), `tests/server/prompts.test.mjs` (project and data folder, allowlist,
  private file).
- In a real browser (Electron 44 driving the page served on port 8104, scripts in the scratch folder): an
  11-page synthetic PDF and two text files dropped together, a .docx refused with a message; all three ended
  "ready to review", notifications fired once each with "Document N of 3 ...", Open showed the PDF card and
  step 2 with 98 values; a non-PDF refused; cancelling a running PDF took two clicks, the next one started,
  no extraction process was left. Light and dark theme screenshots checked. Prompt Save: nothing saved before
  loading or without changes, only the changed file after an edit, and served after reload.
- Desktop permission handlers (copied from `desktop/main.js` into a test Electron app): notifications granted,
  geolocation and microphone denied.

## Not verified
- A native notification actually appearing on screen (the page logic was checked with a stubbed Notification;
  the permission was checked in Electron, not the toast itself).
- The full desktop app (`npm run desktop`) with the Documents tab; the server code it runs is the same.
- Notification permission flow in Firefox/Safari.
- The NSIS installer (see below).

## Windows installer
- `npm run build:helper` failed on this machine: it ran `Scripts\pyinstaller.exe`, a launcher that breaks when
  the venv is moved. It now runs `python -m PyInstaller`.
- The built helper could not load GLiNER ("Could not import module 'ModernBertModel'", caused by "operator
  torchvision::nms does not exist"): torchvision, installed for Docling, loads its operator libraries
  (`_C_stable.pyd`, `image_stable.pyd`) with `torch.ops.load_library`, which PyInstaller does not see.
  `build-helper.mjs` now adds them with `--add-binary`. Found with a small PyInstaller test program.
- After the fix: helper (810 MB) and models (1.1 GB) built; the server with the bundled helper and model
  offline found "Dr. Hans Muster" (about 25 s for the first request, model loading). `electron-builder --win
  dir` (signing and exe editing off, Electron from the local cache, no download) produced `win-unpacked`;
  the packaged app started, `/api/about` answered `desktop`, GLiNER detection and a Documents job worked.
  Its data folder was redirected with `--user-data-dir` to the scratch folder (nothing written to C:).
- Not run: the NSIS installer step (electron-builder downloads its NSIS and winCodeSign tools from GitHub,
  which was not approved here) and installing it. `build/` and `dist/` were deleted afterwards.

## Merge-conflict risks
- `tune/detection`: textual conflicts in `public/js/ui/workflow.js`, `README.md`, `package.json` (checked with
  `git merge-tree`). workflow.js: tune/detection normalizes the text before detection (`normalizeText`) and
  keeps the original in `textAtLastDetection`. On merge, keep this branch's `detect()` and move their
  normalization into `findSensitiveValues` in `public/js/detection/find-values.js` (run detector and patterns
  on `normalizeText(text)`); `showFound` already stores the original text. package.json: keep this branch's
  node-script `test:strict`/`test:model`/`check` and add their `eval:corpus`. README: both sides added lines.
- `perf/pdf-speed`, `alt/detection`: no conflicts. If pdf-speed changes the answer shape of
  `document_extraction.py`, `server/documents.js` `isResult` and the PDF pipeline in `server/jobs.js` follow it.

## Known limitations and follow-ups (in docs/todo.md)
- Progress inside a step ("page 12 of 40") needs the document reader to report pages as it goes.
- Detection of a converted document runs in the page while the server converts the next one (both share the CPU).
- Results don't survive a restart (needs a decision on encrypted storage).

## Options for the skipped decisions
- **Desktop app speed (preload, tray, Linux package, threads).** (a) Load the model at start with a visible
  "preparing" state: cheap, no downside beyond memory, recommended first. (b) Keep it in the tray after the
  window closes: instant restarts, but a resident 1 to 2 GB process and a tray icon users must know to quit;
  opt-in setting. (c) Ship `.deb`/`.tar.gz` next to the AppImage: twice as fast model loading, one more
  artifact. (d) Thread count: measure per CPU and set `torch.set_num_threads` to physical cores or 4, a
  one-line change once measured.
- **PDF documents in the desktop app.** (a) Bundle Docling and models (+1.3 GB, one installer). (b) A separate
  "documents" download or variant. (c) Download models on first use from Hugging Face after explicit consent
  (breaks the offline promise during setup). The helper build already includes `document_extraction.py`
  (`--extract-document`), so (a) is mostly packaging work.
- **Italian spaCy model (CC BY-NC-SA).** (a) Keep it and tell commercial users (risky). (b) Drop Italian
  from Presidio and rely on GLiNER plus patterns for Italian. (c) Replace it with a model whose licence allows commercial
  use (check the model card first; the multilingual spaCy models are weaker), after measuring with
  `npm run test:model`.
- **Code signing.** (a) Unsigned: SmartScreen warns, users click "Run anyway". (b) A standard code signing
  certificate (yearly fee): warnings fade as the app gains reputation. (c) A signing service or EV certificate
  for a verified company: fewer warnings from the start, more paperwork. Signing can be added to electron-builder's `win` config without code changes.
