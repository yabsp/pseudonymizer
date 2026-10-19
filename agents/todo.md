# To do

Planned work, roughly in order. Each item lists what it is for, a first design and what must stay true for
confidentiality (AGENTS.md, section 3). Decisions still open are marked as such.

## 1. Documents list: follow-ups
The Documents tab (batch conversion with detection, docs/adr/0005-document-jobs-in-memory.md) and notifications
are done. Open:
- Keeping results across a restart of the app needs a decision: encrypted storage, where, for how long.
- Progress inside a step ("page 12 of 40") needs the document reader to report pages as it goes.
- Detection of a converted document runs in the page while the server converts the next one; if both together
  are too slow on small machines, the server could wait for the page's detection before starting the next job.
- More steps per format: OCR of images, Word documents, audio transcription (one entry in `PIPELINES` in
  `server/jobs.js` plus an importer with `job` in `public/js/import/`).

## 2. GPU and NPU acceleration
Done (2026-10-16): hardware check, the Hardware setting with "Automatic", PyTorch on CPU/CUDA/XPU/MPS and ONNX
Runtime on CPU/CUDA/DirectML/CoreML for GLiNER, Docling on the matching device, and a check against the CPU before
any GPU is used (see docs/setup.md, "Hardware acceleration", and reference.md). Tested on Linux with the CPU
back ends only. Docling's formula model runs in float32 on the CPU and in float16 (bfloat16 from Ampere on) with
batches of 32 on an NVIDIA GPU, measured on Windows with an RTX 2070 (ADR 0006).

Still to do:
- Test on the Dell XPS 15 (Windows): the hardware check, then DirectML (`onnxruntime-directml`) and, with an NVIDIA
  GPU, the CUDA build of PyTorch; run `DETECTION_ACCELERATOR=<id> npm run test:model` there.
- Intel GPU on this laptop: detection works with the XPU build of PyTorch, now the laptop's `.venv` (2026-10-19,
  see reference.md); the CPU build is kept in `.venv-cpu`, use `HELPER_PYTHON=.venv-cpu/bin/python` for local
  desktop builds (docs/setup.md). PDFs run on `xpu` too (a synthetic page, 2026-10-19); speed not measured yet.
- NPU (Intel Core Ultra): OpenVINO can't run GLiNER yet (dynamic shapes in its LSTM layer) and loads Intel's
  telemetry module. Revisit with a fixed-shape export, a newer OpenVINO, or ONNX Runtime's OpenVINO provider;
  the NPU also needs `intel-level-zero-npu` and `intel-driver-compiler-npu` on Linux.
- Desktop app: ship GPU variants (CUDA, DirectML, Intel XPU) or let the user add them; today it bundles the CPU build.
  A local Linux build from the XPU environment works (SYCL adapters bundled by `desktop/build-helper.mjs`, 5.7 GB
  helper). Shipping it to others needs a licence review first: Intel's SYCL and compiler runtime are under the Intel
  Developer Tools EULA (redistribution only of files in a redist list, under terms forbidding reverse engineering;
  section 4.1 allows data collection, none seen under strace).
- Thread count on hybrid CPUs (4 threads were 25% faster than 16 on the Core Ultra 7): measure once per machine.

## 3. Reusable value lists
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
- From the tune-detection run (2026-10, docs/reports/tune-detection.md): GLiNER 0.4 leaks 471 -> 29 of 4102
  corpus values. Swiss towns standing alone are now found from the swisstopo register (GLiNER 0.4: 29 -> 25 dev leaks); towns outside Switzerland and names under 4 letters ("Brè") stay open. Open: company names
  GLiNER misses ("Saentis Mutual Health", "Seetal"), lower-case user names ("spm"), short initials outside a
  name table ("NP", "SP"), seat and class numbers in exam documents; Presidio has no Italian spaCy model, so
  GLiNER + Presidio fails on every Italian document (fail closed). Decide whether 0.3 becomes the default
  (27 instead of 29 leaks, 113 instead of 91 over-redacted terms).
- Windows installer: the helper and the unpacked app are built and tested on Windows; run the NSIS step
  (`npm run dist:win`, electron-builder downloads its NSIS tools once) and test the installer; code signing
  needs a decision.
