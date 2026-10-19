# Testing

How to test changes, what the suites cover, and pitfalls of this environment. The rules for tests are in
[AGENTS.md](../AGENTS.md), section 8.

## Commands
```
npm run check        # syntax of all JavaScript and Python files
npm test             # fast suite with stand-ins, a few seconds
npm run test:strict  # known gaps fail instead of being reported as TODO
npm run test:model   # real GLiNER and GLiNER + Presidio on all documents, a few minutes, needs .venv
DETECTION_ACCELERATOR=onnx-cpu npm run test:model   # the same baseline on other hardware; must give the same results
npm run eval:corpus -- --corpus <folder>   # leaks, over-redaction and false hits on a corpus with ground truth
```
`eval:corpus` runs the real detectors (GLiNER, GLiNER + Presidio, three sensitivities) and the app's own steps over
every document of a corpus folder (`text/<id>.txt` or `extracted/<id>.md`, with `truth/<id>.json` listing the
values to hide and the text to keep) and writes a summary to its `reports/` folder. Detector output is cached in
the temp folder, so changes to patterns and the core re-run in seconds; about a quarter of the documents is held
out and only reported in totals. Synthetic documents only. The npm scripts run through `scripts/test.mjs` and
`scripts/check.mjs`, so they work the same on Linux, macOS and Windows and find `.venv`'s Python as the server does.

## What is where
| Folder | Covers |
|---|---|
| `tests/core/` | privacy core: patterns, mapping, replacement, restore, prompt; through `tests/helpers/core.mjs` |
| `tests/server/` | routes, static files, settings, CLI bridge, GLiNER bridge, PDF route, desktop options; `startServer()` runs a temporary copy of the project |
| `tests/helper/` | Python helper protocol, Presidio wrapper, hardware back ends, document markers |
| `tests/import/` | document importers (Node has `File`) |
| `tests/model/` | detection quality with the real models (`RUN_MODEL_TESTS=1`) |

Stand-ins: `tests/fixtures/fake_gliner/` (packages `gliner`, `presidio_analyzer`, `spacy` that find the strings in
`FAKE_GLINER_ENTITIES` and `FAKE_PRESIDIO_ENTITIES`), `tests/fixtures/no_gliner/` (gliner fails to import),
`tests/fixtures/fake-cli.mjs`, `tests/fixtures/fake-document-reader.mjs` (stands in for Python running
`document_extraction.py`; "SLOW", "FAIL", "CRASH" in the PDF change its behaviour).

## Documents and baselines
`tests/fixtures/documents.mjs` holds the synthetic documents with `mustHide` and `mustKeep`; it includes
`tests/fixtures/generated-documents.mjs` (15 documents from the detection campaign). `knownMisses` and
`knownChanges` per detector in `tests/model/detection-eval.test.mjs` are a measured baseline: update them only
from an actual run. Last run (2026-10-16): 1246 tests, 1230 pass, 16 known. GLiNER misses "Peter", "Ruth" and
"Scheidung_Wenger_Rosa"; Presidio misses the latter too and changes some kept text (lab values such as
"Kreatinin", invoice terms, service names in logs, "Honda Civic", "Vorbezüge"). Identical with `onnx-cpu`.

Five documents were written blind for the Presidio comparison, and the campaign wrote every batch before running a
detector. Write new documents the same way, before looking at detector output, so fixes don't overfit.

## Verifying in the running app
Start a separate server (`PORT=8092 npm start`; the user's own server may run on 8091), back up `settings.json`
first and restore it afterwards, use synthetic text only. The browser tools work against `http://localhost:8092`;
PDFs can be served temporarily by copying a synthetic file into `public/` and deleting it afterwards.

## Checking for network calls
Python packages can phone home (ONNX Runtime did, on import). Run the helper with synthetic requests under strace,
keeping it alive a while so delayed uploads show, and look for internet or DNS connections:
```
(cat requests.jsonl; sleep 30) | strace -f -qq -e trace=connect -o net.trace .venv/bin/python python/gliner_helper.py
grep -E 'AF_INET6?, sin6?_port=htons\((443|80|53)\)' net.trace   # should print nothing
```
`-k` adds the call stack, which names the library. `unshare -n` (no network) is blocked by AppArmor on this laptop.

## Pitfalls in this environment
- VS Code activates `.venv`, so `python3` is `.venv/bin/python3` with all packages. Tests that need a missing
  package must use a stand-in (`tests/fixtures/no_gliner/`), never rely on the shell's Python.
- The GLiNER stand-in runs with `.venv`'s real PyTorch, which on this laptop is the XPU build (CPU build in
  `.venv-cpu`). With "auto" the helper then tries the Intel GPU; tests that check `runtime` ask for `torch-cpu`.
- VS Code also sets `ELECTRON_RUN_AS_NODE`: Electron started from this shell exits silently. Unset it, or use
  `npm run desktop`.
- `pkill -f <pattern>` also matches the shell running it if the command line contains the pattern; it then kills
  that shell (exit 144). Stop processes by the PID from `ss -ltnp`.
- Timings vary a lot (power saving, Chrome and VS Code in the background); compare settings in interleaved rounds.
- `settings tests: refuses writes from other websites` failed once under full-suite load and passed in every
  run since; treat a single failure there as load-related, but recheck.
- Installing Python packages can replace PyTorch's CPU builds (Docling brought a CUDA torchvision that broke
  GLiNER). Install with constraints: `pip freeze | grep -E '^(torch|torchvision|transformers|numpy|gliner)=='`
  into a file and pass it with `-c`.
