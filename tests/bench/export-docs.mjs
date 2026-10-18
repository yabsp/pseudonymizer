// Writes the benchmark documents as JSON lines { id, language, text } for the Python candidate runner.
// Usage: node tests/bench/export-docs.mjs <out.jsonl> [fixtures|corpus|all]
import fs from 'node:fs';
import { loadDocuments } from './corpus.mjs';

const [out, which = 'all'] = process.argv.slice(2);
const docs = loadDocuments(which);
fs.writeFileSync(out, docs.map(({ id, language, text }) => JSON.stringify({ id, language, text })).join('\n') + '\n');
console.log(`${docs.length} documents written to ${out}`);
