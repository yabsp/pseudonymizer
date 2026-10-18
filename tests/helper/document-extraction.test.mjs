import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { PYTHON } from '../helpers/python.mjs';
import { ROOT } from '../helpers/server.mjs';

// Runs Python code with python/document_extraction.py importable; Docling itself is not needed for these parts.
function runPython(code) {
  const result = spawnSync(PYTHON, ['-c', code], { cwd: path.join(ROOT, 'python'), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

describe('document extraction markers', () => {
  it('numbers images, unconverted formulas and page breaks, with the page they are on', () => {
    const markdown = runPython(`
import json, document_extraction as d
md = 'A' + d.IMAGE_MARK + 'B' + d.FORMULA_NOT_CONVERTED + d.PAGE_MARK + 'C' + d.IMAGE_MARK + d.FORMULA_NOT_CONVERTED
print(json.dumps(d.number_markers(md, [1, 2], [1, None], 2)))`);
    assert.equal(markdown, 'A[Image 1, page 1: not sent]B[Formula 1, page 1: not converted]\n\n--- Page 2 ---\n\nC[Image 2, page 2: not sent][Formula 2: not converted]');
  });

  it('keeps counting when Docling reports more markers than items', () => {
    const markdown = runPython(`
import json, document_extraction as d
print(json.dumps(d.number_markers(d.IMAGE_MARK * 2, [], [], 1)))`);
    assert.equal(markdown, '[Image 1: not sent][Image 2: not sent]');
  });
});

describe('document extraction arguments and device', () => {
  it('reads the file, --formulas and --accelerator in any order', () => {
    const parsed = runPython(`
import json, document_extraction as d
print(json.dumps([d.parse_args(['a.pdf']), d.parse_args(['--accelerator', 'torch-cuda', 'a.pdf', '--formulas'])]))`);
    assert.deepEqual(parsed, [[{ accelerator: 'auto', formulas: false }, ['a.pdf']], [{ accelerator: 'torch-cuda', formulas: true }, ['a.pdf']]]);
  });

  it('rejects a second file', () => {
    const error = runPython(`
import json, document_extraction as d
try:
    d.parse_args(['a.pdf', 'b.pdf'])
    print(json.dumps(None))
except ValueError as e:
    print(json.dumps(str(e)))`);
    assert.equal(typeof error, 'string');
  });

  it('says so when the chosen hardware is one Docling cannot use', () => {
    const notes = runPython(`
import json, document_extraction as d
print(json.dumps([d.device_note('torch-cuda', 'cuda'), d.device_note('torch-cpu', 'cpu'), d.device_note('onnx-cpu', 'cpu'), d.device_note('onnx-directml', 'cpu')]))`);
    assert.deepEqual(notes.slice(0, 3), [null, null, null]);
    assert.match(notes[3], /read on the processor/);
  });

  it('runs the formula model in float32 on the CPU and in bfloat16 only on GPUs that compute it natively', () => {
    const dtypes = runPython(`
import json, document_extraction as d
print(json.dumps([d.formula_dtype('cpu', None), d.formula_dtype('cuda', 7), d.formula_dtype('cuda', 8), d.formula_dtype('mps', None)]))`);
    assert.deepEqual(dtypes, ['float32', 'float16', 'bfloat16', null]);
  });
});

describe('document extraction table cells', () => {
  it('rejoins IDs and e-mail addresses that Docling split after a hyphen, but keeps "Ein- und"', () => {
    const joined = runPython(`
import json, document_extraction as d
print(json.dumps([d.join_table_hyphens(t) for t in [
    'ATV- K2604- 118', 'oliver.pemberton@harrowgate- analytics.example', '1.36e- 2', 'Ein- und Ausgang',
    'import- et export', 'Staats- oder Gemeindesteuer', 'Kosten - Nutzen', '0- 0-1']]))`);
    assert.deepEqual(joined, ['ATV-K2604-118', 'oliver.pemberton@harrowgate-analytics.example', '1.36e-2', 'Ein- und Ausgang',
      'import- et export', 'Staats- oder Gemeindesteuer', 'Kosten - Nutzen', '0-0-1']);
  });
});
