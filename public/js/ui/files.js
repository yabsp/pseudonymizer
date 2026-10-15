export function downloadJson(name, data) {
  const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}-${timestamp}.json` });
  link.click();
  URL.revokeObjectURL(link.href);
}
