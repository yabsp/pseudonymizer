// Keeps only some categories and a minimum score of a candidate's entities, to score restricted ensembles.
// Usage: node tests/bench/filter-entities.cjs in.jsonl out.jsonl PERSON,ID,ADDRESS 0.5
const fs=require('fs'); const [i,o,cats,min]=process.argv.slice(2); const C=new Set(cats.split(','));
fs.writeFileSync(o, fs.readFileSync(i,'utf8').split('\n').filter(Boolean).map(l=>{const d=JSON.parse(l); if(d.entities) d.entities=d.entities.filter(e=>C.has(e.category)&&e.score>=+min); return JSON.stringify(d);}).join('\n')+'\n');
