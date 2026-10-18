"""Converts LaTeX to MathML for printing. Reads a JSON list of {"tex", "display"} on stdin and writes a JSON list
of MathML strings (or {"error"} per formula) on stdout."""
import json
import re
import sys

from latex2mathml.converter import convert

# A fence written right before or after a table (pmatrix, bmatrix, vmatrix, cases), e.g. <mo>&#x00028;</mo><mtable>;
# latex2mathml leaves it at text size, so it is made to stretch over the whole matrix.
FENCE_BEFORE_TABLE = re.compile(r'<mo>([^<]*)</mo>(<mtable)')
FENCE_AFTER_TABLE = re.compile(r'(</mtable>)<mo>([^<]*)</mo>')


def stretch_fences(mathml):
    mathml = FENCE_BEFORE_TABLE.sub(lambda m: f'<mo stretchy="true" fence="true" form="prefix">{m[1]}</mo>{m[2]}', mathml)
    return FENCE_AFTER_TABLE.sub(lambda m: f'{m[1]}<mo stretchy="true" fence="true" form="postfix">{m[2]}</mo>', mathml)


def to_mathml(item):
    try:
        return stretch_fences(convert(item['tex'], display='block' if item.get('display') else 'inline'))
    except Exception as e:
        return {'error': f'{type(e).__name__}: {e}'}


if __name__ == '__main__':
    items = json.load(sys.stdin)
    json.dump([to_mathml(item) for item in items], sys.stdout)
