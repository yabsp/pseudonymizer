#!/usr/bin/env python3
import json
import re
import sys
import warnings

# First: it turns off ONNX Runtime's telemetry, which gliner would otherwise load with it on.
import accelerators

try:
    from gliner import GLiNER
    IMPORT_ERROR = None
except ImportError as e:
    IMPORT_ERROR = f'Python package "gliner" is not installed ({e}). See docs/setup.md, section "Detection with GLiNER".'

# A word as GLiNER counts it, so "a,b@c.d" is 7 words:
#   \w+(?:[-_]\w+)*  letters/digits/"_", possibly joined by "-" or "_" ("2021-03-15", "Jean-Luc")
#   |\S              or any other single non-space character (",", ".", "@")
WORD = re.compile(r'\w+(?:[-_]\w+)*|\S')
# An underscore between two letters or digits ([^\W_] is \w without "_"): "Carla_Imhof", "Kaelin_Erich_2026".
UNDERSCORE_IN_WORD = re.compile(r'(?<=[^\W_])_(?=[^\W_])')

# GLiNER reads at most 384 words and silently drops the rest; the labels take part of that room.
# 150-word windows still find every name in dense CSV rows with 23 labels (200 did not, see tests/model).
# The overlap is longer than the longest value GLiNER returns (12 words), so no value is cut in two.
WINDOW_WORDS = 150
OVERLAP_WORDS = 40

# The one model kept in memory: key (model name, requested hardware), and runtime, which says where it runs.
loaded = {'key': None, 'model': None, 'runtime': None}


def load_checked(name, requested):
    """The model on the requested hardware, checked against the CPU. If the hardware can't be used, fails the
    check or fails to load, the CPU is used and runtime['notice'] says why, so the user sees it."""
    backend = accelerators.resolve(requested)
    runtime = {'id': backend, 'label': accelerators.LABELS[backend]}
    if backend == 'torch-cpu':
        return accelerators.load_gliner(name, backend), runtime
    try:
        model = accelerators.load_gliner(name, backend)
        same, _reference, _found = accelerators.verify(model, name)
    except Exception as e:  # reported below, as the reason for using the CPU
        same, problem = False, f'could not be used ({type(e).__name__}: {e})'
    else:
        problem = 'found different values than the CPU on a test text'
    if same:
        return model, {**runtime, 'verified': True}
    model = None
    cpu = {'id': 'torch-cpu', 'label': accelerators.LABELS['torch-cpu'],
           'notice': f'{runtime["label"]} {problem}, so detection runs on the CPU.'}
    return accelerators.load_gliner(name, 'torch-cpu'), cpu


def get_model(name, requested='auto'):
    key = (name, requested)
    if loaded['key'] != key:
        loaded.update(key=None, model=None, runtime=None)  # free the old model before loading the next
        model, runtime = load_checked(name, requested)
        loaded.update(key=key, model=model, runtime=runtime)
    return loaded['model']


def predict(model, text, labels, threshold):
    """Fails instead of returning a partial result if GLiNER still had to cut the text."""
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter('always')
        entities = model.predict_entities(text, labels, threshold=threshold)
    for w in caught:
        if 'truncated' in str(w.message):
            raise RuntimeError(f'GLiNER could not read the whole text ({w.message}); nothing was detected')
        warnings.showwarning(w.message, w.category, w.filename, w.lineno)
    return entities


def windows(text):
    words = [m.span() for m in WORD.finditer(text)]
    step = WINDOW_WORDS - OVERLAP_WORDS
    for i in range(0, len(words), step):
        part = words[i:i + WINDOW_WORDS]
        yield part[0][0], part[-1][1]
        if i + WINDOW_WORDS >= len(words):
            break


def detect_with_gliner(text, request):
    model = get_model(request['model'], request.get('accelerator', 'auto'))
    best_by_span = {}

    def read(reading, start, end):
        for e in predict(model, reading[start:end], request['labels'], request.get('threshold', 0.4)):
            span = (start + e['start'], start + e['end'])
            if span not in best_by_span or e['score'] > best_by_span[span]['score']:
                best_by_span[span] = {'text': text[span[0]:span[1]], 'label': e['label'], 'start': span[0], 'end': span[1],
                                      'score': round(e['score'], 3), 'source': 'gliner'}

    for start, end in windows(text):
        read(text, start, end)
    # GLiNER reads "Vertrag_Mueller_Brandenberger.pdf" as one word and never finds the names in it. The windows
    # with such underscores are read again with spaces instead; a space replaces each one, so the offsets and the
    # values taken from the original text stay right ("Mueller_Brandenberger").
    spaced = UNDERSCORE_IN_WORD.sub(' ', text)
    if spaced != text:
        for start, end in windows(spaced):
            if spaced[start:end] != text[start:end]:
                read(spaced, start, end)
    return sorted(best_by_span.values(), key=lambda e: e['start'])


def detect(request):
    """engine "gliner" (default) or "presidio", which adds Presidio's values to GLiNER's."""
    text = request.get('text', '')
    engine = request.get('engine', 'gliner')
    if engine not in ('gliner', 'presidio'):
        raise ValueError(f'unknown engine "{engine}"')
    if IMPORT_ERROR:
        raise RuntimeError(IMPORT_ERROR)
    entities = detect_with_gliner(text, request)
    runtime = loaded['runtime']
    if engine == 'gliner' or not text.strip():
        return {'entities': entities, 'runtime': runtime}
    # imported only here, so GLiNER alone works without Presidio installed and starts faster
    from presidio_detection import detect_with_presidio
    language, found = detect_with_presidio(text, request.get('language', 'auto'), request.get('threshold', 0.4))
    return {'entities': entities + found, 'language': language, 'runtime': runtime}


def answer(line):
    request_id = None
    try:
        request = json.loads(line)
        request_id = request.get('id')
        if request.get('probe'):
            return {'id': request_id, **accelerators.probe()}
        return {'id': request_id, **detect(request)}
    except Exception as e:
        return {'id': request_id, 'error': f'{type(e).__name__}: {e}'}


def main():
    # stdout carries only the answers; libraries that print (download progress, warnings) go to stderr.
    answers = sys.stdout
    sys.stdout = sys.stderr
    # The server writes UTF-8; Windows would otherwise decode stdin as cp1252 and garble "Müller" before detection.
    sys.stdin.reconfigure(encoding='utf-8')
    for line in sys.stdin:
        if line.strip():
            answers.write(json.dumps(answer(line)) + '\n')
            answers.flush()


if __name__ == '__main__':
    # The desktop app bundles this file as its one Python program; with --extract-document it reads a PDF instead.
    if sys.argv[1:2] == ['--extract-document']:
        import document_extraction
        document_extraction.main(sys.argv[2:])
    else:
        main()
