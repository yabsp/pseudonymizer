"""Runs one detection candidate over the benchmark documents and writes its entities per document.

Usage: python tests/bench/run_candidate.py <candidate> <docs.jsonl> <out.jsonl> [key=value ...]
Each output line is {"id", "ms", "entities": [...]} or {"id", "error"}; the first line of stderr reports the
load time. Entities carry either "category" (an app category, or null to ignore) or GLiNER/Presidio "label"
and "source", which tests/bench/score.mjs maps like the app does.
"""
import json
import os
import re
import sys
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'python'))
sys.path.insert(0, os.path.dirname(__file__))

# "label = CATEGORY" lines of the GLiNER label file, as parseGlinerLabels reads them.
LABEL_LINE = re.compile(r'^\s*([^#=][^=]*?)\s*=\s*([A-Z0-9_]+)\s*$')


def app_labels():
    path = os.path.join(ROOT, 'prompts', 'gliner-labels.txt')
    if not os.path.exists(path):
        path = os.path.join(ROOT, 'prompts', 'gliner-labels.default.txt')
    with open(path, encoding='utf-8') as f:
        return {m.group(1): m.group(2) for m in map(LABEL_LINE.match, f) if m}


def main():
    name, docs_path, out_path, *options = sys.argv[1:]
    options = dict(o.split('=', 1) for o in options)
    import candidates
    started = time.perf_counter()
    candidate = candidates.CANDIDATES[name](options, app_labels())
    print(f'load {time.perf_counter() - started:.1f} s', file=sys.stderr, flush=True)
    with open(docs_path, encoding='utf-8') as f:
        docs = [json.loads(line) for line in f if line.strip()]
    only = options.get('only')
    if only:
        docs = [d for d in docs if re.search(only, d['id'])]
    with open(out_path, 'w', encoding='utf-8') as out:
        for doc in docs:
            started = time.perf_counter()
            try:
                entities = candidate(doc)
                line = {'id': doc['id'], 'ms': round((time.perf_counter() - started) * 1000), 'entities': entities}
            except Exception as e:  # reported per document, so one failure doesn't hide the others' results
                line = {'id': doc['id'], 'error': f'{type(e).__name__}: {e}'}
            out.write(json.dumps(line, ensure_ascii=False) + '\n')
            out.flush()
            print(f"{doc['id']}: {line.get('ms', 'error')} {line.get('error', '')}", file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
