# 4. PDF documents are extracted with Docling and sent as pseudonymized Markdown

Status: accepted (2026-10-16)

## Context
Users want to work with PDF documents (reports, court letters, contracts). Pasting a long PDF into the text box
and through the clipboard is impractical, and plain text extraction loses tables and garbles formulas. Images
can't be pseudonymized, and a PDF can carry hidden data (metadata, comments, attachments, hidden layers).

## Options for extraction
- pdf.js in the browser: light, but only loose text; tables fall apart and formulas are garbled.
- PyMuPDF, Marker, MinerU: good results, but AGPL or GPL licences, a problem for commercial users.
- Docling (MIT): layout analysis, tables, formulas to LaTeX (CodeFormulaV2), OCR (RapidOCR), Markdown output,
  runs locally with the PyTorch already installed for GLiNER.

## Decision
- Docling, in its own process per PDF (`python/document_extraction.py`), started by the local server. Remote
  services and external plugins stay off; models are prefetched and loaded offline.
- OCR with RapidOCR's multilingual PP-OCRv6 model (the Latin model dropped umlauts in tests).
- Formula conversion is optional per document: it takes about a minute per formula on a CPU. Until converted,
  formulas are marked and their content is not sent.
- Images are never sent; a numbered marker takes their place. Text Docling reads in images and scans is part of
  the Markdown and goes through detection and review.
- The pseudonymized Markdown is sent inside the message between `<document>` markers (no clipboard), or saved as
  a file. The CLI is not given file access, since a document could contain instructions to read other files.

## Consequences
- About 600 MB of Python packages and 1.1 GB of models. torchvision must be the CPU build to match torch.
- Measured on a synthetic 2-page report with a table, two formulas, an ID-card image and a scanned page:
  16 to 25 s without formulas, about 3 minutes with formula conversion; all 16 sensitive values hidden.
- Not in the desktop app yet; bundling Docling and its models into the helper is the next step.
