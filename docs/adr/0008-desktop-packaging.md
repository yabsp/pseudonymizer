# 8. How the Windows desktop app is packaged now that it opens PDFs

Status: proposed (2026-10-18), a decision of the user is open

## Context
The desktop app now ships Docling for PDFs, and a GPU variant was asked for. Measured on Windows (2026-10-18):

| Part | Size on disk |
|---|---|
| Electron and the app | about 0.37 GB |
| Helper, CPU build of PyTorch, GLiNER and Docling (PyInstaller) | 0.94 GB (0.86 GB without Docling) |
| Helper, CUDA build of PyTorch | 3.3 GB (2.7 GB of it CUDA libraries) |
| GLiNER and its tokenizer | 1.1 GB |
| Docling models: layout, tables, formulas, OCR (the ONNX layout copy is left out) | 1.2 GB |
| Whole app, CPU | 3.5 GB unpacked, 2.21 GB compressed |
| Whole app, GPU | about 5.9 GB unpacked |

electron-builder's Windows installer (NSIS) can't embed a package over 2 GiB: the CPU app is 64 MB over, and
maximum compression doesn't help (the model weights don't compress). The GPU app is far over. Both work when
run unpacked: a PDF with 15 formulas took 198 s on the CPU and 30 s on an RTX 2070, with the same text and
values (one formula's LaTeX spacing differs).

## Options
1. **Installer plus packs.** The installer holds the app, the CPU helper and GLiNER (about 1.2 GB compressed).
   PDF support (Docling models) and GPU support (the CUDA helper) are separate files, installed from a file
   in Settings or picked up by the installer from its own folder; the app checks their hash. Offline, users pay
   only for what they need, and updates of the app don't repeat the models. Most work: pack format, import,
   verification, switching the helper.
2. **Portable ZIP.** The whole app folder as one ZIP per variant (no size limit). Least work, but no installer:
   no Start menu entry (needed for notifications; the app could create it on first start), no uninstaller,
   updates by hand.
3. **MSIX package.** A Windows app package has no 2 GB limit and installs and uninstalls cleanly, but needs a
   code-signing certificate even for sideloading, and the Windows SDK to build.
4. **Installer with the models beside it.** The installer copies a models folder that lies next to it; the
   download is a ZIP of both. Little work, but two parts that must stay together.

## Recommendation
Option 2 now, as it ships PDFs and the GPU variant today with almost no new code (plus the Start menu entry for
notifications), and option 1 when the app goes to more users, together with code signing. Option 3 becomes
attractive once there is a code-signing certificate anyway.
