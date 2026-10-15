# 1. Presidio as an optional detector next to GLiNER

Status: proposed (2026-10-15)

## Context
The question was whether to move the core of the app to Microsoft Presidio (MIT), possibly with a Python
backend. Presidio is a detection framework: recognizers with checksums and context words, phone numbers
through Google's libphonenumber, and a pluggable name finder (spaCy, transformers, GLiNER). It does not
replace what happens after detection: the never-sensitive word list, name parts sharing a placeholder,
word-aware replacement and restore stay in `public/js/core/`.

## Measurement
`npm run test:model` on 13 synthetic documents (DE, FR, IT, EN; 232 values that must be hidden). Five of them
were written for this comparison before either detector saw them; on the other eight, GLiNER had already been
tuned.

| Detector, Balanced sensitivity, patterns on | Values still visible | Text wrongly changed |
|---|---|---|
| GLiNER | 7 | 0 |
| GLiNER + Presidio (large spaCy models) | 2 | 2 ("Honda Civic", "Vorbezüge") |

On the five new documents alone: 6 visible with GLiNER, 1 with GLiNER + Presidio. Most of the gain comes from
spaCy's name finder ("Lea"), some by luck (a number inside a span typed LOCATION or DATE_TIME). spaCy also
reports field labels and common nouns ("Versicherten-Nr", "Sohn", "Link"), so there are more rows to review.
Once the models are loaded, Presidio adds 0.1 to 0.5 s per document; loading a language takes 2 to 3 s once.
Memory: GLiNER alone about 2.8 GB, each loaded language about 0.7 GB more (about 4.9 GB with all four).

## Decision
- Presidio becomes a third detector, "GLiNER + Presidio", in the existing Python helper. GLiNER stays the
  default; the core, the Node server and the frontend stay as they are.
- `python/presidio_detection.py` is the only file using Presidio. It checks that the spaCy model is installed
  (Presidio would otherwise download it), and removes every recognizer for e-mail addresses and URLs: the
  e-mail recognizer fetches the public suffix list from the internet through tldextract, and the URL one cuts
  e-mail addresses into pieces. The app's patterns and GLiNER cover both.
- Spans are split at line breaks and pieces that start or end inside a word are dropped.
- Plain dates and nationalities from Presidio are ignored, as the GLiNER labels only ask for dates of birth.
- The language is set in Settings or guessed from frequent words; the result names the language used.

## Consequences
- About 2.2 GB of spaCy models (large) for the four languages, installed by the user (README).
- Licences: Presidio MIT; spaCy models `de_core_news_lg` and `en_core_web_lg` MIT, `fr_core_news_lg`
  LGPL-LR, **`it_core_news_lg` CC BY-NC-SA 3.0 (non-commercial)**. Law firms and practices are commercial
  users, so the Italian model needs a decision before this detector is recommended for Italian texts
  (alternatives: spaCy's multilingual `xx_ent_wiki_sm`, licence still to be checked, or no Italian spaCy model).
- A Python web backend is not part of this decision. It is worth revisiting together with PDF import, where
  Python's PDF and local OCR libraries help; the server tests would serve as its specification.
