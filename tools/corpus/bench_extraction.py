"""Measures python/document_extraction.py per stage: model load, then Docling's own per-stage timings (layout,
table structure, OCR, formula enrichment, ...) for each PDF, in one process. Writes one JSON object per PDF.
Usage: bench_extraction.py [--formulas] [--repeat N] [--extractor-dir DIR] [--out FILE] file.pdf ...
Device and threads come from Docling's environment variables (DOCLING_DEVICE=cpu|cuda, OMP_NUM_THREADS)."""
import argparse
import json
import os
import sys
import time

parser = argparse.ArgumentParser()
parser.add_argument('files', nargs='+')
parser.add_argument('--formulas', action='store_true')
parser.add_argument('--repeat', type=int, default=1)
parser.add_argument('--extractor-dir', default=os.path.join(os.path.dirname(__file__), '..', '..', 'python'))
parser.add_argument('--out')
parser.add_argument('--dtype', help='torch dtype of the formula model (float32, float16, bfloat16); default: Docling preset')
parser.add_argument('--device', default='auto', help='auto, cpu or cuda (extractors with device selection only)')
parser.add_argument('--formula-batch', type=int, help='formulas per batch of the formula model (Docling: 5)')
parser.add_argument('--markdown-dir', help='write <file>.md of the last run of each PDF here')
args = parser.parse_args()

started = time.perf_counter()
sys.path.insert(0, os.path.abspath(args.extractor_dir))
import document_extraction as extraction  # noqa: E402
from docling.datamodel.base_models import InputFormat  # noqa: E402
from docling.datamodel.settings import settings  # noqa: E402

settings.debug.profile_pipeline_timings = True
imported = time.perf_counter()
artifacts = os.environ.get('DOCLING_ARTIFACTS_PATH', extraction.DEFAULT_ARTIFACTS)
device = None
if hasattr(extraction, 'pick_device'):
    capability = None if args.device == 'cpu' else extraction.cuda_capability()
    device, note = extraction.pick_device(args.device, capability)
    converter = extraction.build_converter(artifacts, args.formulas, device, capability)
else:
    converter = extraction.build_converter(artifacts, args.formulas)
if args.formula_batch:
    from docling.models.stages.code_formula.code_formula_vlm_model import CodeFormulaVlmModel
    CodeFormulaVlmModel.elements_batch_size = args.formula_batch
if args.dtype:
    from docling.datamodel.vlm_engine_options import TransformersVlmEngineOptions
    pipeline_options = converter.format_to_options[InputFormat.PDF].pipeline_options
    pipeline_options.code_formula_options.engine_options = TransformersVlmEngineOptions(torch_dtype=args.dtype, load_in_8bit=False)
converter.initialize_pipeline(InputFormat.PDF)
loaded = time.perf_counter()
print(json.dumps({'import_s': imported - started, 'load_s': loaded - imported}), file=sys.stderr)

results = []
for path in args.files:
    for run in range(args.repeat):
        t0 = time.perf_counter()
        result = converter.convert(path)
        markdown = result.document.export_to_markdown()
        if args.markdown_dir:
            with open(os.path.join(args.markdown_dir, os.path.basename(path) + '.md'), 'w', encoding='utf-8') as f:
                f.write(markdown)
        total = time.perf_counter() - t0
        stages = {key: round(sum(item.times), 3) for key, item in result.timings.items()}
        entry = {'file': os.path.basename(path), 'run': run, 'pages': len(result.document.pages), 'total_s': round(total, 3),
                 'stages': stages, 'chars': len(markdown)}
        results.append(entry)
        print(json.dumps(entry), file=sys.stderr)

summary = {'import_s': round(imported - started, 3), 'load_s': round(loaded - imported, 3), 'formulas': args.formulas,
           'device': device or os.environ.get('DOCLING_DEVICE', 'auto'), 'dtype': args.dtype, 'formula_batch': args.formula_batch, 'threads': os.environ.get('OMP_NUM_THREADS'), 'runs': results}
if args.out:
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=1)
print(json.dumps(summary))
