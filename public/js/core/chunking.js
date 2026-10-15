/** Splits on line boundaries, so a value is never cut in two; every chunk ends with a line break. */
export function chunkText(text, size = 3000) {
  const chunks = [];
  let current = '';
  for (const line of text.split('\n')) {
    if (current && current.length + line.length > size) {
      chunks.push(current);
      current = '';
    }
    current += line + '\n';
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}
