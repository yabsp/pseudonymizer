import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { ROOT } from '../helpers/server.mjs';

// Runs Python code with python/document_extraction.py importable; Docling itself is not needed for these parts.
function runPython(code) {
  const result = spawnSync('python3', ['-c', code], { cwd: path.join(ROOT, 'python'), encoding: 'utf8' });
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
