"""Joins the printed parts of each document into one PDF. Pages of a part with "scan" are replaced by a picture
of the page (grey, slightly rotated, blurred and noisy, as from an office scanner), so they have no text layer.
Usage: scan.py <job.json>, job.json: [{"pdf": "<printed file>", "out": "<file>", "seed": 1,
"parts": [{"pdf": "<the part printed alone>", "scan": null}]}], parts in page order. The part printed alone
tells how many pages of the whole document belong to it (each part starts on a new page).
"scan" is {"rotate": degrees, "noise": standard deviation of the grey noise (0-255), "dpi": resolution}."""
import io
import json
import sys

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageFilter


def scanned(page, scan, random):
    dpi = scan.get('dpi', 150)
    image = page.render(scale=dpi / 72, grayscale=True).to_pil().convert('L')
    image = image.filter(ImageFilter.GaussianBlur(0.5))
    image = image.rotate(scan.get('rotate', 0.5), resample=Image.BICUBIC, fillcolor=250)
    pixels = np.asarray(image, dtype=np.float32)
    pixels = pixels * 0.93 + 8 + random.normal(0, scan.get('noise', 10), pixels.shape)
    specks = random.random(pixels.shape) < 0.0008
    pixels[specks] = 40
    image = Image.fromarray(np.clip(pixels, 0, 255).astype(np.uint8))
    buffer = io.BytesIO()
    image.save(buffer, 'PDF', resolution=dpi, quality=70)
    return pdfium.PdfDocument(buffer.getvalue())


def join(job):
    random = np.random.default_rng(job.get('seed', 1))
    source = pdfium.PdfDocument(job['pdf'])
    parts = [pdfium.PdfDocument(part['pdf']) for part in job['parts']]
    counts = [len(part) for part in parts]
    # Printed as a whole, the page numbers in the footer run through; if a part ends with an empty page there, the
    # parts printed alone are joined instead (their page numbers start again at 1).
    whole = sum(counts) == len(source)
    if not whole:
        print(f"{job['out']}: parts have {counts} pages, the whole document {len(source)}; joining the parts", file=sys.stderr)
    out = pdfium.PdfDocument.new()
    keep = []
    first = 0
    for part, part_pdf, count in zip(job['parts'], parts, counts):
        pages = list(range(first, first + count)) if whole else list(range(count))
        pdf = source if whole else part_pdf
        first += count
        if not part.get('scan'):
            out.import_pages(pdf, pages)
            continue
        for index in pages:
            page_pdf = scanned(pdf[index], part['scan'], random)
            keep.append(page_pdf)
            out.import_pages(page_pdf)
    out.save(job['out'])
    return len(out)


if __name__ == '__main__':
    with open(sys.argv[1], encoding='utf-8') as f:
        jobs = json.load(f)
    print(json.dumps([join(job) for job in jobs]))
