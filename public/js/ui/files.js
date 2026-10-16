/** Saves content as "<name>-<date and time>.<extension>" in the browser's download folder. */
export function downloadFile(name, extension, content, type) {
  const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '');
  const blob = new Blob([content], { type });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}-${timestamp}.${extension}` });
  link.click();
  URL.revokeObjectURL(link.href);
}

export const downloadJson = (name, data) => downloadFile(name, 'json', JSON.stringify(data, null, 2), 'application/json');
