import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chunkText } from '../helpers/core.mjs';
import { createRandom } from '../helpers/random.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

describe('splitting long text for the local model', () => {
  it('keeps short text in one chunk', () => {
    const text = DOCUMENTS[0].text;
    assert.deepEqual(chunkText(text, 3000), [text + '\n']);
  });

  it('returns nothing for empty or blank text', () => {
    assert.deepEqual(chunkText('', 3000), []);
    assert.deepEqual(chunkText('\n \n\t\n', 3000), []);
  });

  it('loses no text and never splits a line, for random documents and sizes', () => {
    const random = createRandom(7);
    for (let run = 0; run < 300; run++) {
      const lines = Array.from({ length: 1 + random.int(80) }, () => 'x'.repeat(random.int(120)) + random.pick(['', ' Reto Ammann', ' 756.1234.5678.97']));
      const text = lines.join('\n');
      const size = 20 + random.int(400);
      const chunks = chunkText(text, size);
      if (!text.trim()) continue;
      assert.equal(chunks.join(''), text + '\n', `run ${run}`);
      for (const chunk of chunks) {
        assert.ok(chunk.endsWith('\n'), `run ${run}: chunk ends mid-line`);
        const longestLine = Math.max(...chunk.split('\n').map((l) => l.length));
        assert.ok(chunk.length <= Math.max(size, longestLine) + 1, `run ${run}: chunk of ${chunk.length} for size ${size}`);
      }
    }
  });
});
