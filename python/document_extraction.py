#!/usr/bin/env python3
"""The only place that uses Docling: turns a PDF into Markdown with headings, tables, formulas as LaTeX, numbered
page breaks and a marker for every image. Images themselves are never part of the result.

Run as: document_extraction.py <file.pdf> [--accelerator ID] [--formulas], with ID as in accelerators.py (default
auto). Answers with one JSON object on stdout: {"markdown", "pages", "images", "formulas", "formulasConverted",
"tables", "device"} plus "deviceNote" when the chosen hardware can't run Docling, or {"error"}; everything else goes
to stderr. Formulas become LaTeX only with --formulas (seconds per formula on a GPU, longer on a CPU), otherwise a
marker."""
import itertools
import json
import os
import re
import sys

import accelerators

try:
    from docling.datamodel.accelerator_options import AcceleratorOptions
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import CodeFormulaVlmOptions, PdfPipelineOptions, RapidOcrOptions
    from docling.datamodel.vlm_engine_options import TransformersVlmEngineOptions
    from docling.models.stages.code_formula.code_formula_vlm_model import CodeFormulaVlmModel
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling_core.types.doc import DocItemLabel, PictureItem, TableItem
    IMPORT_ERROR = None
except ImportError as e:
    IMPORT_ERROR = f'Python package "docling" is not installed ({e}). See docs/setup.md, section "Opening PDF documents".'

# Docling's model folder; the desktop app points DOCLING_ARTIFACTS_PATH at the models it ships.
DEFAULT_ARTIFACTS = os.path.join(os.path.expanduser('~'), '.cache', 'docling', 'models')
# One private-use character each, so they can't occur in the document and are replaced by numbered markers.
IMAGE_MARK = '\U000F0001'
PAGE_MARK = '\U000F0002'
# What Docling writes for a formula it did not convert.
FORMULA_NOT_CONVERTED = '<!-- formula-not-decoded -->'
MAX_SECONDS = 600
# The space Docling puts after a hyphen when it joins the PDF's text pieces of a table cell: "ATV- K2604- 118" for
# "ATV-K2604-118", "name@example- clinic.example". Matches "-" and one space between two letters or digits
# ([^\W_]), unless the next word is a conjunction, as in "Ein- und Ausgang" or "import- et export".
TABLE_HYPHEN_GAP = re.compile(r'(?<=[^\W_])- (?!(?:und|oder|bis|sowie|bzw|et|ou|e|o|ed|and|or|to)\b)(?=[^\W_])', re.IGNORECASE)
# NVIDIA GPUs compute bfloat16 natively from compute capability 8 (Ampere) on.
BFLOAT16_CAPABILITY = 8
# Formulas the model reads at once on a GPU (Docling: 5). On an 8 GB RTX 2070, 32 read the 24 formulas of a test
# document in 11 s, 16 in 20 s, with the same result.
GPU_FORMULA_BATCH = 32


def cuda_capability():
    """The major compute capability of the first NVIDIA GPU."""
    import torch
    return torch.cuda.get_device_capability(0)[0]


def device_note(backend, device):
    """A note for the user when the chosen hardware is not one Docling can use, so the CPU reads the document."""
    if device != 'cpu' or backend in ('torch-cpu', 'onnx-cpu'):
        return None
    return f"Docling can't use {accelerators.LABELS[backend]}, so the document was read on the processor."


def formula_dtype(device, capability):
    """Docling's preset runs the formula model in bfloat16, which CPUs and GPUs before Ampere only emulate: on an
    8-core desktop CPU float32 measured about 8 times faster with the same result, and those GPUs have fast float16.
    None keeps the preset (other GPUs, not measured)."""
    if device == 'cpu':
        return 'float32'
    if device == 'cuda':
        return 'bfloat16' if capability >= BFLOAT16_CAPABILITY else 'float16'
    return None


def formula_options(device, capability):
    """The formula model's options for PdfPipelineOptions; a copy of the preset, so Docling's shared default
    options are not changed."""
    dtype = formula_dtype(device, capability)
    if dtype is None:
        return {}
    engine = TransformersVlmEngineOptions(torch_dtype=dtype)
    return {'code_formula_options': CodeFormulaVlmOptions.from_preset('codeformulav2', engine_options=engine)}


def build_converter(artifacts_path, formulas, device):
    capability = cuda_capability() if device == 'cuda' else None
    if device == 'cuda':
        # A class attribute in Docling; this process converts one PDF, so changing it affects nothing else.
        CodeFormulaVlmModel.elements_batch_size = GPU_FORMULA_BATCH
    options = PdfPipelineOptions(
        artifacts_path=artifacts_path,
        accelerator_options=AcceleratorOptions(device=device),
        enable_remote_services=False,
        allow_external_plugins=False,
        do_ocr=True,
        do_table_structure=True,
        do_formula_enrichment=formulas,
        document_timeout=MAX_SECONDS,
        **formula_options(device, capability),
    )
    # "de" selects the multilingual PP-OCRv6 model, which also reads French and Italian accents and keeps umlauts
    # (the older Latin model dropped them); the torch backend uses the PyTorch already installed.
    options.ocr_options = RapidOcrOptions(backend='torch', lang=['de'])
    return DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=options)})


def join_table_hyphens(text):
    """Removes the space Docling added after a hyphen inside a table cell, so values such as IDs and e-mail
    addresses reach detection as written in the PDF."""
    return TABLE_HYPHEN_GAP.sub('-', text)


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


def extract(path, artifacts_path, formulas, backend):
    device = accelerators.docling_device(backend)
    note = device_note(backend, device)
    result = build_converter(artifacts_path, formulas, device).convert(path)
    document = result.document
    for table in document.tables:
        for cell in table.data.table_cells:
            cell.text = join_table_hyphens(cell.text)
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
    answer = {
        'markdown': number_markers(markdown, image_pages, formula_pages, page_count).strip() + '\n',
        'pages': page_count,
        'images': len(image_pages),
        'formulas': len(formula_pages),
        'formulasConverted': formulas,
        'tables': len(pages_of(document, lambda item: isinstance(item, TableItem))),
        'device': device,
    }
    if note:
        answer['deviceNote'] = note
    return answer


def parse_args(args):
    options = {'accelerator': 'auto', 'formulas': False}
    files = []
    rest = iter(args)
    for arg in rest:
        if arg == '--formulas':
            options['formulas'] = True
        elif arg == '--accelerator':
            options['accelerator'] = next(rest, 'auto')
        else:
            files.append(arg)
    if len(files) != 1:
        raise ValueError('expected one PDF file, optionally --accelerator ID and --formulas')
    return options, files


def main(args):
    answers = sys.stdout
    sys.stdout = sys.stderr  # libraries that print must not mix into the answer
    try:
        if IMPORT_ERROR:
            raise RuntimeError(IMPORT_ERROR)
        options, files = parse_args(args)
        backend = accelerators.resolve(options['accelerator'])
        answer = extract(files[0], os.environ.get('DOCLING_ARTIFACTS_PATH', DEFAULT_ARTIFACTS), options['formulas'], backend)
    except Exception as e:
        answer = {'error': f'{type(e).__name__}: {e}'}
    answers.write(json.dumps(answer) + '\n')
    answers.flush()


if __name__ == '__main__':
    main(sys.argv[1:])
