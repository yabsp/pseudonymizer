#!/usr/bin/env python3
"""The only place that uses Docling: turns a PDF into Markdown with headings, tables, formulas as LaTeX, numbered
page breaks and a marker for every image. Images themselves are never part of the result.

Run as: document_extraction.py <file.pdf> [--formulas]. Answers with one JSON object on stdout:
{"markdown", "pages", "images", "formulas", "formulasConverted", "tables"} or {"error"}; everything else goes to
stderr. Formulas become LaTeX only with --formulas (about a minute per formula on a CPU), otherwise a marker."""
import itertools
import json
import os
import re
import sys

try:
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, RapidOcrOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling_core.types.doc import DocItemLabel, PictureItem, TableItem
    IMPORT_ERROR = None
except ImportError as e:
    IMPORT_ERROR = f'Python package "docling" is not installed ({e}). See README, section "Opening PDF documents".'

# Docling's model folder; the desktop app points DOCLING_ARTIFACTS_PATH at the models it ships.
DEFAULT_ARTIFACTS = os.path.join(os.path.expanduser('~'), '.cache', 'docling', 'models')
# One private-use character each, so they can't occur in the document and are replaced by numbered markers.
IMAGE_MARK = '\U000F0001'
PAGE_MARK = '\U000F0002'
# What Docling writes for a formula it did not convert.
FORMULA_NOT_CONVERTED = '<!-- formula-not-decoded -->'
MAX_SECONDS = 600


def build_converter(artifacts_path, formulas):
    options = PdfPipelineOptions(
        artifacts_path=artifacts_path,
        enable_remote_services=False,
        allow_external_plugins=False,
        do_ocr=True,
        do_table_structure=True,
        do_formula_enrichment=formulas,
        document_timeout=MAX_SECONDS,
    )
    # "de" selects the multilingual PP-OCRv6 model, which also reads French and Italian accents and keeps umlauts
    # (the older Latin model dropped them); the torch backend uses the PyTorch already installed.
    options.ocr_options = RapidOcrOptions(backend='torch', lang=['de'])
    return DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=options)})


def pages_of(document, is_wanted):
    """The page of every item that is_wanted, in reading order (None if unknown)."""
    return [item.prov[0].page_no if item.prov else None
            for item, _level in document.iterate_items(traverse_pictures=False) if is_wanted(item)]


def numbered(kind, ending, pages):
    """A function for re.sub that writes "[Image 1, page 2: not sent]", counting up."""
    counter = itertools.count(1)

    def marker(_match):
        number = next(counter)
        page = pages[number - 1] if number <= len(pages) else None
        where = f', page {page}' if page else ''
        return f'[{kind} {number}{where}: {ending}]'
    return marker


def number_markers(markdown, image_pages, formula_pages, page_count):
    """Replaces the image, formula and page-break marks with numbered, readable markers."""
    page_numbers = iter(range(2, page_count + 2))
    markdown = re.sub(re.escape(IMAGE_MARK), numbered('Image', 'not sent', image_pages), markdown)
    markdown = re.sub(re.escape(FORMULA_NOT_CONVERTED), numbered('Formula', 'not converted', formula_pages), markdown)
    return re.sub(re.escape(PAGE_MARK), lambda _m: f'\n\n--- Page {next(page_numbers)} ---\n\n', markdown)


def extract(path, artifacts_path, formulas):
    result = build_converter(artifacts_path, formulas).convert(path)
    document = result.document
    image_pages = pages_of(document, lambda item: isinstance(item, PictureItem))
    formula_pages = pages_of(document, lambda item: getattr(item, 'label', None) == DocItemLabel.FORMULA)
    markdown = document.export_to_markdown(
        image_placeholder=IMAGE_MARK,
        page_break_placeholder=PAGE_MARK,
        # Text inside images (OCR) is kept, so it is checked and pseudonymized like the rest; the images are not.
        traverse_pictures=True,
        escape_underscores=False,
        escape_html=False,
    )
    page_count = len(document.pages)
    return {
        'markdown': number_markers(markdown, image_pages, formula_pages, page_count).strip() + '\n',
        'pages': page_count,
        'images': len(image_pages),
        'formulas': len(formula_pages),
        'formulasConverted': formulas,
        'tables': len(pages_of(document, lambda item: isinstance(item, TableItem))),
    }


def main(args):
    answers = sys.stdout
    sys.stdout = sys.stderr  # libraries that print must not mix into the answer
    try:
        if IMPORT_ERROR:
            raise RuntimeError(IMPORT_ERROR)
        files = [a for a in args if a != '--formulas']
        if len(files) != 1:
            raise ValueError('expected one PDF file and optionally --formulas')
        answer = extract(files[0], os.environ.get('DOCLING_ARTIFACTS_PATH', DEFAULT_ARTIFACTS), '--formulas' in args)
    except Exception as e:
        answer = {'error': f'{type(e).__name__}: {e}'}
    answers.write(json.dumps(answer) + '\n')
    answers.flush()


if __name__ == '__main__':
    main(sys.argv[1:])
