# Synthetic PDF corpus

Generates the synthetic PDF documents of the shared evaluation corpus (layout, truth format and metrics:
`README.md` of the corpus folder) from one source file per document. Everything is invented: names, addresses,
numbers, e-mail domains (`example.com`, `*.example`), IP addresses from the documentation ranges.

```
tools/corpus/
  documents/<id>.mjs   one file per document: content (HTML), confidential values, context to keep
  check.mjs            checks the sources: values and keep entries appear, variants listed, no real data
  build.mjs            builds the PDFs and truth files (Electron for printing, Python for scans)
  render.cjs           Electron main process: HTML to PDF, snippets to images
  scan.py              rasterizes "scanned" pages (rotation, noise) and joins the parts into one PDF
  tex.py               LaTeX to MathML (latex2mathml) for the formulas
  extract.mjs          runs the app's extraction (python/document_extraction.py) on the built PDFs
  base.css             page styles shared by all documents
```

## Running
Needs Node 22+, Electron (the devDependency of this project, `npm install`, or `ELECTRON=<path>` to another
install) and a Python with `latex2mathml` (MIT), `pypdfium2` and `pillow` (`CORPUS_PYTHON=<python>`):

```sh
py -3.12 -m venv ../pseudonymizer-venvs/pdf-speed-tools        # once; any venv works
../pseudonymizer-venvs/pdf-speed-tools/Scripts/python -m pip install latex2mathml pypdfium2 pillow numpy
node tools/corpus/check.mjs                                     # all documents, or a list of ids
node tools/corpus/build.mjs --out ../pseudonymizer-corpus [ids] # writes pdf/<id>.pdf and truth/<id>.json
node tools/corpus/extract.mjs --out ../pseudonymizer-corpus [ids] # writes extracted/<id>.md (+ .formulas.md)
```

## Document source format
```js
export default {
  id: 'medicine-de-01',              // <domain>-<language>-<nn>, also the file name
  domain: 'medicine',
  language: 'de',                    // de, fr, it or en
  title: 'Austrittsbericht Kardiologie',
  header: 'KANTONSSPITAL BEISPIEL | HANS MUSTER, 12.03.1961', // optional, plain text, repeated on every page
  footer: 'Vertraulich | Austrittsbericht Muster',            // optional, plain text; the page number is added
  css: '',                           // optional extra CSS for this document
  parts: [                           // each part starts on a new page
    { html: String.raw`<h1>...</h1><p>...</p>` },
    { html: '...', columns: 2 },     // two-column layout
    { html: '...', scan: { rotate: -0.8, noise: 12, dpi: 150 } }, // printed, then only an image of it is kept
  ],
  values: [{ text: 'Hans Muster', category: 'PERSON' }],
  keep: ['Vorhofflimmern', 'Apixaban 5 mg'],
};
```
- `html` is the body of the part. Use `String.raw` so LaTeX backslashes stay as written.
- Formulas: `<tex>\frac{a}{b}</tex>` inline, `<tex display>...</tex>` as a block. They are printed as MathML and
  their LaTeX becomes the truth `formulas` (in source order). Use `aligned`, `pmatrix`, `cases`, `\sum`, `\int` freely.
- Text inside an image: `<div class="as-image">...</div>` is rendered to a picture first, so the PDF has no text
  layer there (ID cards, stamps, letterheads as logos, screenshots).
- Page breaks inside a part: `<div class="page-break"></div>`.
- `layout` in the truth file is derived from the source (table, formula, two-column, scanned-page, text-in-image,
  header-footer, born-digital).
- `values`: every confidential value exactly as written, each spelling once (also upper case in headers, "H. Muster",
  "Muster Hans", birth dates in every format used). Categories: PERSON, ADDRESS, DATE, AHV, ID, IBAN, ACCOUNT,
  CARD, EMAIL, PHONE, COMPANY, URL, IP, HOST, MAC, USERNAME, SECRET, PLATE.
- `keep`: domain context that must stay readable (diagnoses, drugs and doses, legal articles, technical terms).
