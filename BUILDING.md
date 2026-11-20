# Setting up and building Pseudonymizer

From a fresh clone to a desktop app for your own computer: an installer that people without technical knowledge can
use. Written for people and for AI agents doing the setup; follow the steps in order. How the app works inside is in
[docs/reference.md](docs/reference.md).

## What you need
| | |
|---|---|
| System | Windows 10 or 11 (x64), Linux (x64), macOS (Apple chips). An app is built on, and for, the system it is built on. |
| Node.js | 22.13 or newer, with npm (`node --version`). Nothing else: no Python, no compiler, no administrator rights. |
| Disk | about 6 GB free in the project folder: packages 510 MB, Electron 350 MB, model 1.2 GB, a build 3 GB |
| Internet | for `npm run setup` and the first `npm run build` only. The app itself never uses it. |
| Linux only | the usual desktop libraries (GTK 3, NSS, ALSA). Desktop distributions have them; minimal ones and WSL lack `libnss3`, `libnspr4` and `libasound2`. The AppImage needs FUSE 2 (`libfuse2`) to start. |

To use the app you also need one AI tool, installed and logged in by you: Claude Code (`claude`, log in once), OpenAI
Codex CLI (`codex login`) or Gemini CLI (`GEMINI_API_KEY` set). The app shows how when the tool is missing.

## Everything stays in the project folder
The scripts point every cache and download into the folder (they set `npm_config_cache`, `electron_config_cache`,
`ELECTRON_CACHE`, `ELECTRON_BUILDER_CACHE` and, while building, `TEMP`, `TMP` and `TMPDIR`). All of it is
git-ignored.

| Path | What | Made by |
|---|---|---|
| `node_modules/` | the packages, exactly as in `package-lock.json` | `npm run setup` |
| `node_modules/electron/dist/` | Electron's program | `npm run setup` |
| `models/gliner/` | the detection model, checked by SHA-256 | `npm run setup` |
| `.cache/npm`, `.cache/electron` | download caches | `npm run setup` |
| `.cache/electron-builder`, `.cache/tmp` | the build tools (NSIS, AppImage) and the build's temporary files | `npm run build` |
| `.cache/desktop` | the window's browser data when the app runs from the folder | `npm start` |
| `settings.json`, `prompts/*.txt`, `prompts/*.md` (without `.default`) | your settings when the app runs from the folder | the app |
| `dist/` | the built app and its installer | `npm run build` |

Outside the folder: only an installed app keeps its settings in the system's place for app data (`%APPDATA%\Pseudonymizer`,
`~/.config/Pseudonymizer`, `~/Library/Application Support/Pseudonymizer`), and the AI tools keep their own logins.

## 1. Set up
```
npm run setup
```
In order: installs the packages (`npm ci`, install scripts off, see `.npmrc`); downloads Electron and checks it
against its checksums; downloads the detection model and checks every file against the SHA-256 in
`scripts/setup.mjs` (the full model from 8 GB of memory, else the small one; `-- --model full` or `-- --model small`
to choose); on Linux with an NVIDIA card, CUDA's libraries for ONNX Runtime (see "Graphics card and NPU"); finally it
loads the model once and says where detection runs, for example:
```
== Where detection runs
Graphics card: NVIDIA GeForce RTX 2070
Detection runs on the graphics card (DirectML), 2.0 times as fast as the processor in the check.
```
Takes 2 to 10 minutes, mostly the model download. Finished steps are skipped, so run it again after any failure; a
download that does not match its checksum is deleted and stops the setup.

## 2. Try it
```
npm start          # the desktop app, from the project folder
npm run server     # or only the server: open http://localhost:8091 in a browser
```

## 3. Check it
```
npm run check            # syntax of every file (seconds)
npm test                 # 256 tests with stand-ins (seconds)
npm run test:model       # the real model on 73 made-up documents: no more values visible than measured (2 to 5 minutes)
npm run check:network    # the server contacts nothing outside this computer (1 minute)
```
All must pass before an app is passed on. `npm run test:model` must report `19 of 2850 values visible` and
`20 of 538 terms changed` or fewer.

## 4. Build the app
```
npm run build            # the installer
npm run build -- --dir   # only the unpacked app in dist/, to try it without installing
```
The build is for this system and its processor type, with Electron, the app, only the parts of the packages it uses
(ONNX Runtime's libraries for this system only, including CUDA's if setup installed them) and the model of
`models/gliner`. It takes about 3 minutes; the first build downloads electron-builder's tools.

| System | In `dist/` | Size (full model) |
|---|---|---|
| Windows | `Pseudonymizer-<version>-windows-x64-setup.exe`: installs for the current user, no administrator rights, the folder can be chosen | 1.0 GB |
| Linux | `Pseudonymizer-<version>-linux-x86_64.AppImage`: one file, made executable and started | 1.1 GB |
| macOS | `Pseudonymizer-<version>-macos-arm64.dmg` | not built yet |

Then check the built app too (it must say OK), for example on Windows:
```
npm run check:network -- --app dist/win-unpacked/Pseudonymizer.exe
```
(Linux: `dist/linux-unpacked/pseudonymizer`.) It starts the app, lets it detect, and records every connection of
all its processes.

**Signing.** The apps are not signed. Windows shows "Windows protected your PC" (More info, Run anyway); macOS refuses
an unsigned app at first (Control-click the app, Open). To sign, give electron-builder a certificate through
`CSC_LINK` and `CSC_KEY_PASSWORD` before `npm run build` (electron-builder's documentation, "Code Signing"); macOS
also needs notarization with an Apple developer account. Not set up here.

**Passing it on.** The installer contains the model and runs without internet. The people using it still need one of
the AI tools above, logged in with their own account.

## Graphics card and NPU
The app finds out itself what it can use, each time it starts: it tries the accelerator ONNX Runtime has for the
system, compares its result on a check text with the processor's, and uses it only if the results are the same and it
is faster. Settings shows where detection runs, and why not on an accelerator if not.

| System | Used automatically | Needs |
|---|---|---|
| Windows | any graphics card with DirectX 12 (NVIDIA, AMD, Intel, also built into the processor), through DirectML | nothing, it is part of the build |
| Linux | NVIDIA graphics cards, through CUDA | CUDA 12 and cuDNN 9 installed before `npm run setup` (it then downloads ONNX Runtime's CUDA libraries from NuGet, and they go into the build) |
| macOS | the Neural Engine (the NPU of Apple chips) and the graphics, through Core ML | nothing |

NPUs in Windows and Linux PCs (Intel AI Boost, AMD Ryzen AI, Qualcomm Hexagon) can't be used yet: ONNX Runtime for
Node has no provider for them. `npm run setup` lists one if the system reports it; detection then runs on the
graphics card or the processor. Measured: DirectML on an NVIDIA RTX 2070 reads 2.6 times as fast as an 8-core
processor with the same results (docs/reference.md, "Measurements").

`PSEUDONYMIZER_DEVICE` overrides the choice for a start from the project folder: `cpu`, `dml`, `cuda`, `coreml`, `webgpu`
(WebGPU is never chosen automatically; it was slower than the processor where measured), with an adapter number if
there are several (`dml:1`). An accelerator named this way is used even if it is not faster, but never if its results
differ.

## When something goes wrong
- **Use `npm run setup`, not `npm install`.** `.npmrc` turns install scripts off (ONNX Runtime's would download GPU
  libraries, Electron's its program), so after `npm install` Electron's program is missing and `npm start` fails.
  Setup runs the needed scripts with the caches in the folder.
- **Adding or updating a package:** `npm install --save-exact --cache .cache/npm <name>@<version>`, then
  `npm run setup`, `npm test` and `npm run check:network`.
- **"The detection model is not installed"**: run `npm run setup`. A model folder copied from elsewhere needs its
  `model.json`.
- **Port in use:** `npm run server` takes another port if 8091 is taken; the app uses 47291 or any free one.
- **The app starts slowly the first time on a machine with a graphics card:** the comparison with the processor
  takes a few seconds once per start; the window is usable meanwhile.
- **Windows: never end processes by name** (`taskkill /IM node.exe`): AI agents and other tools run on Node too.
  End them by process number.
- **Long commands:** let them write to a file instead of a pipe such as `| head`; on Windows, a process whose
  reader is gone can hang at exit.
- **WSL:** run commands from PowerShell (`wsl -d <distro> -- bash script.sh`); Git Bash rewrites `/mnt/...` paths.
  The Windows drives under `/mnt/` are slow (the model loads in 17 s instead of 2 s). Electron needs the three
  libraries above; it runs in WSLg. As root, Chromium needs `--no-sandbox`, for tests only.
- **Linux without a terminal session for tests:** start the app with input from `/dev/null`
  (`... < /dev/null`), else a shell started in the background can be stopped by the terminal.
- **Another system:** build there. electron-builder can't build an app with the right ONNX Runtime and model check
  for another system.

## What was checked, and where
On 2026-11-11, with Electron 45.1.0, electron-builder 26.18.1, ONNX Runtime 1.31.1:

| | Windows 11 x64, NVIDIA RTX 2070 | Linux x64 (Ubuntu 24.04 in WSL 2) | macOS |
|---|---|---|---|
| `npm run setup` | yes | yes, from a fresh copy of the repository | not tried |
| `npm test` | 256 pass | 254 pass, 2 Windows-only skipped | not tried |
| `npm run test:model` | 19 / 20, on DirectML, 110 s | 19 / 20, on the processor, 285 s | not tried |
| `npm run build` | installer and unpacked app | AppImage and unpacked app | not tried |
| The built app, all steps in its window (33 checks) | pass | pass (WSLg) | not tried |
| Installer or AppImage installed and started | no (installing writes outside the folder) | no (needs FUSE) | not tried |
| `npm run check:network`, server and built app | nothing outside this computer | nothing outside this computer | not tried |
| Accelerator | DirectML used | CUDA not installed: the processor, as designed | Core ML not tried |
