// Electron main process: prints HTML files to PDF. Every element with class "as-image" is first replaced by a
// picture of itself, so the PDF has no text layer there. Usage: electron render.cjs <job.json>
// job.json: [{ "html": "<file>", "pdf": "<file>", "header": "text", "footer": "text" }]
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// Snippets are captured at twice the CSS size, about 190 dpi on paper, enough for OCR.
const SCALE = 2;
// A4 content width in CSS pixels with the margins below (210 mm - 2 * 18 mm at 96 dpi).
const CONTENT_WIDTH = 658;
const MARGIN_INCH = { top: 0.9, bottom: 0.8, left: 0.71, right: 0.71 };

const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const band = (content) => `<div style="font-family: Segoe UI, Arial, sans-serif; font-size: 8pt; color: #333; width: 100%; padding: 0 0.71in;">${content}</div>`;

// Each snippet is shown alone in a second window, at twice its size, and captured from there.
async function captureSnippets(contents, snippetWindow, job) {
  const snippets = await contents.executeJavaScript(`[...document.querySelectorAll('.as-image')].map((el) => {
    const r = el.getBoundingClientRect();
    return { html: el.outerHTML, width: r.width, height: r.height };
  })`);
  if (!snippets.length) return;
  const head = await contents.executeJavaScript(`document.head.innerHTML`);
  const images = [];
  for (const [i, snippet] of snippets.entries()) {
    const file = `${job.html}.snippet${i}.html`;
    fs.writeFileSync(file, `<!doctype html><html><head>${head}</head><body style="margin:0; zoom:${SCALE}">`
      + `<div style="display:inline-block; width:${Math.ceil(snippet.width)}px">${snippet.html}</div></body></html>`);
    await snippetWindow.loadURL(pathToFileURL(file).href);
    await new Promise((r) => setTimeout(r, 400));
    const image = await snippetWindow.webContents.capturePage({
      x: 0, y: 0, width: Math.ceil(snippet.width * SCALE), height: Math.ceil(snippet.height * SCALE),
    });
    images.push({ url: image.toDataURL(), width: snippet.width, height: snippet.height });
  }
  await contents.executeJavaScript(`(() => {
    const images = ${JSON.stringify(images)};
    [...document.querySelectorAll('.as-image')].forEach((el, i) => {
      const img = document.createElement('img');
      img.src = images[i].url;
      img.className = 'from-snippet';
      img.style.width = images[i].width + 'px';
      img.style.height = images[i].height + 'px';
      el.replaceWith(img);
    });
    return Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  })()`);
}

async function render(window, snippetWindow, job) {
  await window.loadURL(pathToFileURL(job.html).href);
  await captureSnippets(window.webContents, snippetWindow, job);
  const header = job.header ? band(escapeHtml(job.header)) : '<span></span>';
  const footerText = job.footer ? escapeHtml(job.footer) + ' | ' : '';
  const footer = band(`${footerText}<span class="pageNumber"></span> / <span class="totalPages"></span>`);
  const pdf = await window.webContents.printToPDF({
    pageSize: 'A4', printBackground: true, preferCSSPageSize: false,
    margins: MARGIN_INCH,
    displayHeaderFooter: true, headerTemplate: header, footerTemplate: footer,
  });
  fs.writeFileSync(job.pdf, pdf);
}

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[process.argv.length - 1], 'utf8'));
  const window = new BrowserWindow({ show: false, width: CONTENT_WIDTH, height: 1100, webPreferences: { spellcheck: false } });
  const snippetWindow = new BrowserWindow({
    show: false, width: CONTENT_WIDTH * SCALE, height: 1000 * SCALE, webPreferences: { offscreen: true, spellcheck: false },
  });
  let code = 0;
  try {
    for (const job of jobs) await render(window, snippetWindow, job);
  } catch (e) {
    console.error(e);
    code = 1;
  }
  app.exit(code);
});
