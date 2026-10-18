/** A SHA-256 of the file's bytes as hex, to recognize a file that was already added; it stays in this page. */
export async function fingerprintOf(file) {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
