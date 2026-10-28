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

## Quick setup
One command installs everything below that the app and the desktop build need, all inside the project folder:
```
npm run setup
```
It needs Node.js and Python 3.12 (on Windows from python.org, with the `py` launcher) and downloads about 6 GB.
What it puts where:

| What | Where |
|---|---|
| Python environment: PyTorch, `python/requirements.txt` (GLiNER, Presidio, Docling, ONNX Runtime), PyInstaller, spaCy's German, French and English models | `.venv` |
| GLiNER model and its tokenizer (1.1 GB) | `models/huggingface` |
| Docling's models for PDFs (1.2 GB) | `models/docling` |
| Electron and electron-builder, for the desktop build | `node_modules` |
| Download caches of pip, npm and Electron | `.cache` |

The app and the desktop build use `models/` automatically when it exists (unless `HF_HOME` or
`DOCLING_ARTIFACTS_PATH` is set); without it they use the libraries' caches in your home folder, as below. Steps that
are done already are skipped, so after a failed download just run it again. To start over, delete `.venv`,
`models` and `.cache`.

Options:
- `--torch cpu` (default), `cuda` (NVIDIA) or `xpu` (Intel Arc and Core Ultra graphics): which build of PyTorch.
- `--venv .venv-<name>`: another environment, e.g. for building the desktop app with a GPU build while `.venv`
  keeps the CPU build for development and tests. The models in `models/` are shared.

```
npm run setup                                         # development: .venv with the CPU build
npm run setup -- --torch cuda --venv .venv-cuda       # for the Windows app with NVIDIA support
npm run setup -- --torch xpu --venv .venv-xpu         # for an app for your own Intel GPU
```
An environment already holding another PyTorch build is not changed; the setup stops and asks for another `--venv`.
Not covered: Ollama and the AI tools (below), and the ONNX Runtime packages for DirectML or NVIDIA (see "Hardware
acceleration"). The sections below do the same steps by hand.

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
model per language you need (Presidio reads German, French and English, and the desktop app ships all three; without
them, choose GLiNER alone in Settings):
```
.venv/bin/python -m spacy download de_core_news_lg    # German, MIT, about 600 MB
.venv/bin/python -m spacy download fr_core_news_lg    # French, LGPL-LR, about 600 MB
.venv/bin/python -m spacy download en_core_web_lg     # English, MIT, about 430 MB
```
A text in a language whose model is missing, or in another language, is reported, not detected with less
protection; GLiNER alone reads it. Each loaded
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
| Intel GPU (Linux, Windows) | the XPU build of PyTorch and torchvision (`--index-url https://download.pytorch.org/whl/xpu`), and Intel's GPU drivers (Level Zero) | detection and PDFs; detection about 3 times faster on an Intel Arc iGPU |
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
Needs the setup above; `npm run setup` does all of it (by hand: `npm install` for Electron and electron-builder,
PyInstaller in the Python environment, and the GLiNER and Docling models downloaded once):
```
npm run desktop                      # try it from the project folder
npm run dist:linux                   # dist/Pseudonymizer-<version>-x86_64.AppImage
npm run dist:win                     # on Windows, see below
```
Build each system's version on that system. The models ship with the app, taken from `models/` (or from
`HF_HOME`, `DOCLING_ARTIFACTS_PATH` or the caches in your home folder). Windows gets a ZIP instead of an installer:
the app is larger than the 2 GB an NSIS installer can hold (docs/adr/0008-desktop-packaging.md).

The build takes PyTorch from the environment it is built from (`HELPER_PYTHON`, else `.venv`), so the app only
uses the GPU that environment's PyTorch supports. Keep `.venv` on the CPU build for development and tests, and
make a second environment for the build.

### Windows
`npm run dist:win` needs a GPU build of PyTorch and stops otherwise. Both run on the processor on computers without
that GPU.

| Build | Set up with | Result |
|---|---|---|
| NVIDIA (CUDA), the one to pass on | `npm run setup -- --torch cuda --venv .venv-cuda` | `dist/Pseudonymizer-<version>-win-x64.zip`, about 7.6 GB unpacked |
| Intel Arc and Core Ultra graphics (XPU), for your own computer | `npm run setup -- --torch xpu --venv .venv-xpu` | `dist/Pseudonymizer-<version>-win-x64-XPU.zip`, about 5 GB unpacked |

Then build with `HELPER_PYTHON` set to that environment's Python:
```
$env:HELPER_PYTHON = '.venv-cuda\Scripts\python.exe'; npm run dist:win      # PowerShell
HELPER_PYTHON=.venv-cuda/Scripts/python.exe npm run dist:win                 # Git Bash
```
The XPU app needs Intel's GPU drivers on the computer it runs on and finds the GPU under Settings > Detection >
Advanced > "This computer". Keep it for your own computer: Intel's GPU libraries in it may not be passed on as they
are (see agents/todo.md).

### Linux
`npm run dist:linux` builds with whatever PyTorch the environment has; the AppImage that is passed on uses the
CPU build (`.venv` from `npm run setup`). For your own Intel GPU, build from an XPU environment:
`npm run setup -- --torch xpu --venv .venv-xpu`, then `HELPER_PYTHON=.venv-xpu/bin/python npm run dist:linux`.
The same notes on drivers and passing it on apply.

### With GitHub Actions
`.github/workflows/desktop.yml` runs the tests on Linux and Windows, then builds the Linux AppImage and the
Windows ZIP (with PyTorch's CUDA build). It starts on a version tag (`git push origin v0.1.0`; the tagged commit
must contain the workflow) or by hand: Actions > "Desktop app" > Run workflow. The files are under "Artifacts" on the run's page, kept for 30 days. The first run downloads the
models (about 2.4 GB per system); later runs take them from the cache. GitHub release files can be at most 2 GiB
and the builds are larger, so they are not attached to a release automatically.

## Run the tests
```
npm test             # fast, with stand-ins for the models
npm run test:model   # the real models on realistic synthetic documents (a few minutes)
npm run eval:corpus -- --corpus <folder>   # leaks and over-redaction on a corpus with ground truth
```
