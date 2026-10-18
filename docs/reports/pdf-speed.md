# pdf-speed: synthetic PDF corpus and faster PDF extraction (2026-10-16 to 2026-10-18)

## Corpus
- Generator in `tools/corpus/` (README there): one source file per document, printed with Electron (MathML for
  formulas), scanned pages rasterized with rotation and noise, text in images. All data invented.
- 44 PDFs, 237 pages, in DE, FR, IT and EN: mathematics, physics, engineering, academic paper, law (court letters,
  contracts, judgments, memos), medicine, pharma, banking, finance, insurance, HR, tax, real estate, IT incidents.
  Truth files list every value spelling, the context to keep and the LaTeX of every formula.
- Baseline extraction (unchanged extractor of `fix/windows-utf8`) of all 44 into `extracted/<id>.md`, and with
  formula conversion into `extracted/<id>.formulas.md` for the 17 documents with formulas.

## Findings on extraction quality (baseline)
- Page headers and footers are not in the Markdown (Docling's furniture layer), so names there are neither shown
  nor sent. Not a leak, but the user loses that context.
- Leak risk, fixed: inside table cells Docling joined the PDF's text pieces with a space after a hyphen:
  "ATV- K2604- 118", "oliver.pemberton@harrowgate- analytics.example". 219 such breaks in the corpus tables.
  Such a value is sent in the changed form, and a split e-mail address was not matched by the pattern.
  `document_extraction.py` now rejoins them inside table cells (not before a conjunction such as "Ein- und").
  tune-detection also handles the split form in detection.
- Only display formulas become formula items (academic-en-01: 24 of 149 truth formulas); inline MathML stays
  text with math italic letters ("BMI = 𝑚 ℎ 2"), which is sent as is. A matrix with stretched fences came out as
  `$$\begin{array} {$$` (content lost).

## Speed (medians of 3 runs in one process, model loaded once; formula stage = Docling's `doc_enrich`)
| Setting | Document | Formula stage | Change |
|---|---|---|---|
| CPU (i9-9900K, 4 threads, quiet), Docling default bfloat16 | 1 page, 6 formulas | 505.4 s | |
| CPU, float32 (new default on CPU) | same | 67.4 s | 7.5x, identical Markdown |
| GPU (RTX 2070), Docling default bfloat16, batch 5 | math-en-01, 24 formulas | 60.9 s | |
| GPU, float16, batch 16 | same | 20.3 s | 3.0x |
| GPU, float16, batch 32 (new default on GPU) | same | 11.2 s | 5.4x, identical Markdown |
- Model load in a long-lived process: 5 to 13 s, import 6 to 28 s, paid once per PDF process today.
- Without formulas (baseline, shared CPU): median 11.6 s per page, 46.7 s per document, including import and
  load in each process.
- float16 against float32 on the GPU (math-de-01, math-it-01, math-fr-01): same text apart from a few LaTeX spacing
  commands, same formula scores.

## End-to-end checks of the new extractor
- GPU (CUDA venv), math-en-01 with formulas: 25 s wall for the whole process (import, load, 6 pages, 24 formulas),
  against 290 s with the unchanged extractor in the baseline run (GPU shared at that time); same formula score.
- CPU, pharma-de-01 and law-en-02 without formulas: truth values missing from the Markdown 5 -> 1 and 9 -> 5 (the
  rest are page headers and footers), no words lost.
- Server on port 8101 with `DOCUMENT_DEVICE=cuda` and the CPU-only shared venv: answered `device: "cpu"` with the
  `deviceNote`. The document card itself was not checked in a browser.
- `npm run check` passes; `npm test` 211 of 228 pass, the 3 failures are the known Windows-only ones (2 CLI bridge,
  settings file mode); the server document tests are skipped on Windows, so the new one there did not run here.

## What changed on the branch
- `--device auto|cpu|cuda` and `DOCUMENT_DEVICE`; answer fields `device` and `deviceNote` (additive); the document
  card shows the device and a missing GPU (ADR 0006).
- Formula model in float32 on the CPU, float16 on GPUs before Ampere, bfloat16 from Ampere; batch 32 on the GPU.
- Table cell hyphen breaks rejoined. Formula time hints in the UI and README from these measurements.

## Downloads (own venvs under pseudonymizer-venvs, nothing shipped)
- latex2mathml 3.81.1 (MIT), pypdfium2 5.14.0 (Apache-2.0/BSD), pillow 12.3.0 (MIT-CMU), numpy 2.5.4 (BSD): 93 MB.
- electron 44.8.0 (MIT, npm, 383 MB), for printing the corpus only.
- torch 2.14.1+cu130 and torchvision 0.29.1 (BSD-3-Clause, download.pytorch.org) with the CUDA runtime, about
  2.5 GB, in pdf-speed-cuda.

## Not done, open
- Long-lived extraction process (would save the 10 to 40 s of import and load per PDF): needs an ADR against the
  one-process-per-file isolation of ADR 0004.
- Other formula models (UniMERNet, pix2tex), ONNX/OpenVINO, int8; using the PDF text layer for formulas.
- Thread count and OCR settings; a full-corpus before/after Markdown comparison (only spot checks were run).
- Open decisions for the user: ship a GPU variant of the desktop app (CUDA build is about 2.5 GB more); whether
  inline formulas (sent as text with math letters) are acceptable.
