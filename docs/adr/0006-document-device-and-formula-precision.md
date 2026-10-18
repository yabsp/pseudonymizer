# 6. PDF extraction picks the device and the formula model's precision

Status: accepted (2026-10-17)

## Context
Formula conversion (Docling's CodeFormulaV2) was the slowest part of opening a PDF: about a minute per formula
on a CPU. Docling's preset runs that model in bfloat16. Desktop CPUs without bfloat16 instructions (such as the
i9-9900K used for measuring) and NVIDIA GPUs before Ampere (compute capability below 8, e.g. an RTX 2070) only
emulate bfloat16, which is much slower than float32 on a CPU or float16 on such a GPU. Docling also uses an
NVIDIA GPU automatically when the installed PyTorch can, but the app did not say which device was used.

## Decision
Update (2026-10-18, merge with the Hardware setting): the device now comes from the user's Hardware setting
(`--accelerator`, `python/accelerators.py`), not from `--device` and `DOCUMENT_DEVICE`, which were removed. An
unavailable choice is an error; `deviceNote` remains for hardware Docling can't use (e.g. DirectML). The
precision and batch size below still apply.

- `python/document_extraction.py` takes `--device auto|cpu|cuda` (default `auto`); the server passes
  `DOCUMENT_DEVICE` (same values, default `auto`). `auto` uses the first NVIDIA GPU when PyTorch's CUDA build
  finds one, else the processor.
- The answer reports the device used (`device`: `cpu` or `cuda`, additive). If `cuda` was requested but no GPU is
  usable, the document is read on the processor and `deviceNote` says so; the document card shows both. Speed is
  the only thing that changes with the device, so falling back is safe as long as it is visible.
- The formula model runs in float32 on the processor, float16 on GPUs before Ampere and bfloat16 from Ampere on
  (from Ampere on untested here).
  The options are a copy of Docling's preset, so Docling's shared defaults stay untouched.
- One process per PDF stays (ADR 0004); nothing about locality changes: all devices are on this machine.

## Consequences
- GPU use needs PyTorch's CUDA build (about 2.5 GB more) in the Python environment; with the default CPU build
  everything runs on the processor as before.
- The formula model reads 32 formulas at once on a GPU (Docling: 5); on the processor Docling's 5 stay.
- Measured (medians of 3 runs, model loaded once, formula stage only; details in `docs/reports/pdf-speed.md`):
  i9-9900K, 1 page with 6 formulas: bfloat16 505 s, float32 67 s (7.5x), identical Markdown. RTX 2070, a 6-page
  document with 24 formulas: bfloat16 with batch 5 61 s, float16 with batch 16 20 s, with batch 32 11 s (5.4x),
  identical Markdown; float16 and float32 gave the same text apart from LaTeX spacing commands.
