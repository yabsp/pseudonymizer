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

## 3. GPU and NPU acceleration (to evaluate)
Everything that takes time runs in Python: GLiNER (detection), Presidio/spaCy, and Docling (layout, tables,
OCR, formulas). The JavaScript part (patterns, replacement, restore) takes well under a second and doesn't need
a GPU. All options below run locally, so nothing changes for confidentiality.

- **NVIDIA GPUs (CUDA):** PyTorch's CUDA build; GLiNER and Docling (`device='cuda'`) use it directly. Large
  gains, above all for formula conversion (minutes to seconds). The CUDA build is about 2 to 3 GB more, so the
  desktop app would need a separate GPU variant or download.
- **Intel GPUs (XPU), as in this laptop (Arc graphics of the Core Ultra 7 155H):** PyTorch's XPU build;
  Docling supports `device='xpu'`, GLiNER runs on any PyTorch device. Needs Intel's GPU compute runtime.
  Untested here; Ollama on this GPU produced garbage with Vulkan FP16 until it was turned off.
- **OpenVINO (Intel CPU, GPU and NPU):** GLiNER ships an OpenVINO runtime (`gliner.runtime.OpenVINOModel`) and an
  ONNX runtime. This laptop also has an NPU (`/dev/accel/accel0`). Likely the best option for Intel laptops,
  and also faster on the CPU alone; needs the model exported once.
- **Apple Silicon (MPS):** for a later macOS version; Docling supports `device='mps'`.
- Measure first: detection quality must not change (`npm run test:model`, 29 documents), and speed on CPU, GPU
  and NPU. Then decide what the desktop app ships (CPU only, plus GPU variants, or detection at first start).
- Related: ONNX Runtime instead of PyTorch on the CPU (usually 2 to 3 times faster, smaller installer) was
  deferred; it shares most of the work with OpenVINO.

## Other open items
- Desktop app speed: load the model at app start with a visible "preparing" state; keep it loaded in the system
  tray after the window closes; an uncompressed Linux package (`.deb` or `.tar.gz`, the AppImage loads the model
  twice as slowly); a tuned thread count (4 threads were 25% faster than 16 on this laptop). Waiting for a decision.
- PDF documents in the desktop app: bundle Docling and its models (about 1.3 GB more).
- Italian spaCy model for Presidio is non-commercial (CC BY-NC-SA 3.0): keep, replace or drop.
- From the detection campaign: High sensitivity (0.3) as the default (9 instead of 15 leaks, 44 instead of 36 false
  hits on all documents); a never-sensitive list split into titles and other words, so names like "Mia" can be
  hidden on their own; re-reading only the area around underscores to cut the extra time.
- Windows installer: build and test on Windows; code signing.
- Prompt changes in the installed desktop app are lost when it closes (its files are read-only).
