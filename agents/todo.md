# To do

Planned work, roughly in order. Each item lists what it is for, a first design and what must stay true for
confidentiality (AGENTS.md, section 3). Decisions still open are marked as such.

## 1. Document pipeline (batch conversion)
Converting documents takes time (about 10 s per scanned page, a minute per formula on a CPU), so the user
shouldn't wait in front of the busy overlay for each file.

- A separate part of the app ("Documents"): drop several files at once; they are converted one after another,
  and the results are listed in the order the files were added, whatever finishes first.
- Each document runs through a pipeline of steps, configurable per format, e.g. PDF: extract text and tables
  (Docling) -> OCR for scanned pages -> convert formulas (optional) -> find sensitive values. A step is one
  entry in a registry, like `IMPORTERS` and `DETECTORS`, so new tools (Word, images, audio transcription) can be
  added without changing the others.
- Every job shows its state: waiting, running (step and progress, e.g. "page 12 of 40"), ready, failed (with
  the reason) or cancelled; each can be cancelled on its own. One job runs at a time, since the steps use all
  CPU cores.
- A ready document opens in the normal steps (review, send or save). Sending stays a separate, manual step.
- Confidentiality: jobs and their text live in memory only and are gone when the app closes; temporary files
  are deleted after each step; nothing is written to logs, settings or browser storage. If results should
  survive a restart, that needs a decision (encrypted storage, where, for how long).
- Server API (sketch): `POST /api/jobs` (upload, returns an id), `GET /api/jobs` (states in input order),
  `GET /api/jobs/<id>` (result), `DELETE /api/jobs/<id>` (cancel and forget).

## 2. Notifications
- Notify when a document is converted and when detection on a large text or document is done, so the user can
  work in other apps meanwhile.
- Browser: the Notification API, after the user turns it on (the browser asks for permission once). Desktop
  app: native notifications; `desktop/main.js` currently refuses every permission, so it must allow
  notifications only.
- Notifications must not contain confidential content: no file names (they often contain a name), no text, no
  values. Example: "Document 2 of 5 is ready to review."
- Detection can become a pipeline step of its own (item 1), so batch jobs end at "ready to review".

## 3. GPU and NPU acceleration
Done (2026-10-16): hardware check, the Hardware setting with "Automatic", PyTorch on CPU/CUDA/XPU/MPS and ONNX
Runtime on CPU/CUDA/DirectML/CoreML for GLiNER, Docling on the matching device, and a check against the CPU before
any GPU is used (see docs/setup.md, "Hardware acceleration", and reference.md). Tested on Linux with the CPU
back ends only.

Still to do:
- Test on the Dell XPS 15 (Windows): the hardware check, then DirectML (`onnxruntime-directml`) and, with an NVIDIA
  GPU, the CUDA build of PyTorch; run `DETECTION_ACCELERATOR=<id> npm run test:model` there.
- Intel GPU on this laptop: try the XPU build of PyTorch in a separate environment.
- NPU (Intel Core Ultra): OpenVINO can't run GLiNER yet (dynamic shapes in its LSTM layer) and loads Intel's
  telemetry module. Revisit with a fixed-shape export, a newer OpenVINO, or ONNX Runtime's OpenVINO provider;
  the NPU also needs `intel-level-zero-npu` and `intel-driver-compiler-npu` on Linux.
- Desktop app: ship GPU variants (CUDA, DirectML) or let the user add them; today it bundles the CPU build.
- Thread count on hybrid CPUs (4 threads were 25% faster than 16 on the Core Ultra 7): measure once per machine.

## 4. Reusable value lists
Detection takes seconds per page, and a lawyer or doctor often works with several documents of the same case or
patient. Today "Edit values" can save the list as JSON and load it again, but only for restoring one answer later.

- Apply a saved list to a new text or document: its values are replaced right away, and detection only adds what
  is new. Placeholders stay the same across documents of a case, so answers from several documents fit together.
- Speed-up: skip detection for text that hasn't changed, e.g. after "Convert formulas" or when a document is opened
  again, by reusing the result for the unchanged parts (GLiNER windows whose text is identical). Measure the gain.
- Merge lists (two documents of the same case) without renumbering placeholders that are already in use.
- Confidentiality: a list contains the original values, so it is as sensitive as the documents. It is only saved
  where the user chooses, never automatically, never in settings or browser storage; the UI says so when saving.
  Keeping a library of lists per case inside the app needs a decision (encrypted storage, where, for how long),
  like the document pipeline (item 1).
- Validate loaded lists (`parseMapping`): types, duplicate values, placeholder format, a size limit.

## Other open items
- Desktop app speed: load the model at app start with a visible "preparing" state; keep it loaded in the system
  tray after the window closes; an uncompressed Linux package (`.deb` or `.tar.gz`, the AppImage loads the model
  twice as slowly); a tuned thread count (4 threads were 25% faster than 16 on this laptop). Waiting for a decision.
- PDF documents in the desktop app: bundle Docling and its models (about 1.3 GB more).
- Remove the Italian spaCy model (`it_core_news_lg`, CC BY-NC-SA 3.0, non-commercial use only) before the app is
  used commercially: drop `it` from `SPACY_MODELS` in `python/presidio_detection.py`,
  uninstall it from `.venv`, update docs/setup.md, and decide whether Italian texts then use GLiNER alone (Presidio would report a
  missing model) or another model with a commercial licence.
- From the detection campaign: High sensitivity (0.3) as the default (9 instead of 15 leaks, 44 instead of 36 false
  hits on all documents); a never-sensitive list split into titles and other words, so names like "Mia" can be
  hidden on their own; re-reading only the area around underscores to cut the extra time.
- Windows installer: build and test on Windows; code signing.
- Prompt changes in the installed desktop app are lost when it closes (its files are read-only).
