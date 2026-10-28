"""Stands in for python/document_extraction.py in the server tests' copy of the project, so they run without
Docling: argv is [file, --accelerator, id, --formulas?]. Writes the path of the file it was given to FAKE_DOC_LOG, so tests can check
it is deleted afterwards. A PDF containing "SLOW" makes it wait (to test cancelling), "FAIL" makes it answer with
an error, "CRASH" makes it exit without an answer, "ENV" makes it answer with the model folders it was given
(HF_HOME and DOCLING_ARTIFACTS_PATH, one per line, empty if unset)."""
import json
import os
import sys
import time

file = sys.argv[1]
formulas = '--formulas' in sys.argv[2:]
accelerator = sys.argv[sys.argv.index('--accelerator') + 1] if '--accelerator' in sys.argv else 'auto'
if os.environ.get('FAKE_DOC_LOG'):
    with open(os.environ['FAKE_DOC_LOG'], 'a', encoding='utf-8') as log:
        log.write(file + '\n')
with open(file, encoding='latin-1') as pdf:
    content = pdf.read()
if 'CRASH' in content:
    sys.exit(3)
if 'SLOW' in content:
    time.sleep(60)
if 'ENV' in content:
    folders = [os.environ.get('HF_HOME', ''), os.environ.get('DOCLING_ARTIFACTS_PATH', '')]
    print(json.dumps({'markdown': '\n'.join(folders), 'pages': 1, 'images': 0, 'formulas': 0, 'formulasConverted': False, 'tables': 0, 'device': 'cpu'}))
elif 'FAIL' in content:
    print(json.dumps({'error': 'RuntimeError: broken PDF'}))
else:
    formula = '$$E = mc^2$$' if formulas else '[Formula 1, page 1: not converted]'
    print('a library printing to stdout')
    print(json.dumps({
        'markdown': f'## Befund\n\nPatient Hans Muster\n\n{formula}\n',
        'pages': 1, 'images': 0, 'formulas': 1, 'formulasConverted': formulas, 'tables': 0,
        # device: the real reader reports Docling's device; this one echoes the hardware choice it was given
        'device': f'chosen {accelerator}', 'extra': 'dropped',
    }))
