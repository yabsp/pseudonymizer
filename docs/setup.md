# Setup

How to run Pseudonymizer from the project folder and how to add the optional parts. The desktop app needs none
of this; see the [README](../README.md).

Everything below is installed on your computer only. Downloads happen once, while you install; the app itself
never downloads anything.

## Run from the project folder
Needs [Node.js](https://nodejs.org) 22 or newer and Python 3.12.
```
npm start
```
Open http://localhost:8091 (another port: `PORT=9000 npm start`). No `npm install` is needed for this.

## Detection with GLiNER
GLiNER is the base of both detectors: a small model that finds names, companies, addresses, IDs and similar. Install it
once into `.venv` in the project folder (about 1.2 GB):
```
python3 -m venv .venv
.venv/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r python/requirements.txt
```
On Windows, use `python -m venv .venv` and `.venv\Scripts\python -m pip` instead (`python3` there is often only
the Microsoft Store's stand-in). The model (`urchade/gliner_multi_pii-v1`,
Apache-2.0, 1.1 GB) is downloaded from Hugging Face the first time you run detection and kept in
`~/.cache/huggingface`. The app uses `.venv` automatically; `GLINER_PYTHON=/path/to/python` selects another Python.

`python/requirements.txt` also installs Docling (for PDFs, below) and ONNX Runtime (for hardware acceleration,
below). Install PyTorch and torchvision from the line above first: the torchvision Docling would pick on its own
doesn't fit the CPU build of PyTorch and stops GLiNER from loading.

## Detection with Presidio
The default detector is GLiNER + Presidio: Presidio adds a second name finder (spaCy) and checks for phone, card
and bank numbers; it finds more but also lists more words that aren't sensitive. After GLiNER, download a language
model per language you need (without them, choose GLiNER alone in Settings; the desktop app always uses GLiNER):
```
.venv/bin/python -m spacy download de_core_news_lg    # German, MIT, about 600 MB
.venv/bin/python -m spacy download fr_core_news_lg    # French, LGPL-LR, about 600 MB
.venv/bin/python -m spacy download it_core_news_lg    # Italian, CC BY-NC-SA 3.0: non-commercial use only
.venv/bin/python -m spacy download en_core_web_lg     # English, MIT, about 430 MB
```
A text in a language whose model is missing is reported, not detected with less protection. Each loaded
language needs about 0.7 GB of memory.

## Opening PDF documents
PDFs are read with Docling (MIT), which `python/requirements.txt` installs. Download its models once (about
1.1 GB, kept in `~/.cache/docling/models`, or set `DOCLING_ARTIFACTS_PATH`):
```
.venv/bin/docling-tools models download layout tableformer code_formula rapidocr --rapidocr-backend-lang torch:de
```
Licences: layout model Apache-2.0, table and formula models CDLA-Permissive-2.0, RapidOCR Apache-2.0.

## Hardware acceleration
Detection and PDFs can use a GPU. Settings > Detection > Advanced > "This computer" shows what your computer has
and what to install for it. Install one of these into `.venv`:

| Hardware | What to install | Used for |
|---|---|---|
| NVIDIA GPU (Linux, Windows) | the CUDA build of PyTorch, from the selector on pytorch.org | detection and PDFs |
| NVIDIA GPU, alternative | `pip uninstall onnxruntime`, then `pip install onnxruntime-gpu` | detection |
| Any GPU on Windows (NVIDIA, Intel, AMD) | `pip uninstall onnxruntime`, then `pip install onnxruntime-directml` | detection; a good first try on laptops |
| Intel GPU (Linux, Windows) | the XPU build of PyTorch from pytorch.org, and Intel's GPU drivers | detection and PDFs; not tested yet |
| Apple silicon | nothing extra | later macOS version |

For PDFs, the CUDA build of PyTorch makes formula conversion about 5 times faster (tested with an RTX 2070); it
is about 2.5 GB larger than the CPU build. A GPU is only used after it finds the same values as the CPU on a test text; otherwise the app uses the CPU and
says why. The ONNX Runtime options convert the model once (about 10 s, 1.2 GB in `~/.cache/pseudonymizer`, or
set `PSEUDONYMIZER_CACHE`).

## Detection with Ollama
Optional, slower (1 to 2 minutes per text). Install [Ollama](https://ollama.com), then for example:
```
ollama pull qwen2.5:7b
```
Choose the model in Settings ("Reload list" after pulling a new one).

## AI tools
The pseudonymized text is sent through an AI tool installed on your computer, logged in with your own account:

| Tool | Setup |
|---|---|
| Claude Code | install Claude Code, run `claude` once and log in |
| OpenAI Codex CLI | `npm install -g @openai/codex`, then `codex login` |
| Gemini CLI | `npm install -g @google/gemini-cli`; start the app with `GEMINI_API_KEY=... npm start` (Google no longer accepts personal logins there) |

Usage counts against your plan's limits.

## Build the desktop app
Needs the setup above (with the model downloaded once by running a detection):
```
npm install                          # Electron and electron-builder, build tools only
.venv/bin/python -m pip install pyinstaller
npm run desktop                      # try it from the project folder
npm run dist:linux                   # dist/Pseudonymizer-<version>-x86_64.AppImage
npm run dist:win                     # on Windows: dist/Pseudonymizer-<version>-win-x64.zip
npm run dist:win:gpu                 # the same with PyTorch's CUDA build, see below
```
Build each system's version on that system. The Docling models must be downloaded first (see "Opening PDF
documents"); they ship with the app. Windows gets a ZIP instead of an installer: the app is larger than the 2 GB
an NSIS installer can hold (docs/adr/0008-desktop-packaging.md). For the GPU variant, set `HELPER_PYTHON` to the
`python.exe` of a separate environment with the CUDA build of PyTorch, the requirements and PyInstaller.

## Run the tests
```
npm test             # fast, with stand-ins for the models
npm run test:model   # the real models on realistic synthetic documents (a few minutes)
npm run eval:corpus -- --corpus <folder>   # leaks and over-redaction on a corpus with ground truth
```
