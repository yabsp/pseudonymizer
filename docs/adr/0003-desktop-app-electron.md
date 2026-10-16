# 3. Ship as an Electron desktop app with a bundled PyTorch helper

Status: accepted (2026-10-16)

## Context
The tool should reach single users (lawyers, doctors, consultants) who won't set up Node, Python and a 1 GB
model by hand. The original text must stay on their machine, and the targets remain the AI command-line tools
they have installed and logged in to. Options considered: a hosted web app (rejected: the text would reach a
server, and a web page can't start local CLIs), a hosted app that runs everything in the browser, Electron,
Tauri, Docker, and the current install script.

## Decision
- Electron, because the existing Node server and page run in it unchanged. `desktop/main.js` starts the server
  in the main process and shows it in a locked-down window.
- The detection helper stays PyTorch-based for now and is bundled with PyInstaller (`--onedir`); Presidio and
  spaCy are left out. The GLiNER model and its tokenizer are copied into the installer and loaded offline.
- First targets: Linux (AppImage, built and tested) and Windows (NSIS installer, prepared, built on Windows).
- Electron and electron-builder are devDependencies only, pinned exactly; the app code keeps zero runtime
  dependencies, and `npm start` works without `npm install`.

## Consequences
- The installer is large (about 1.4 GB): PyTorch and the helper about 850 MB, the model 1.1 GB, compressed.
  Moving GLiNER to ONNX later would remove Python and PyTorch and shrink it considerably.
- Each system's version must be built on that system (PyInstaller does not cross-compile).
- Chromium has background features that go online (the spell checker downloaded dictionaries from Google); the
  app switches the spell checker off and cancels every request that doesn't go to this machine. New Electron
  versions need this checked again.
- Unsigned builds trigger warnings on Windows; signing (and notarization for a later macOS version) needs
  certificates.
- Prompt overrides can't be saved in the installed app yet, since its files are read-only.
