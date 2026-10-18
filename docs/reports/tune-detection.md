# tune-detection: final report (branch tune/detection, 2026-10-18)

Goal: no confidential value reaches the target model, while context stays readable, by tuning the existing
tool (patterns, core mapping rules, never-sensitive words). All numbers below are measured with
`npm run eval:corpus` on the shared corpus (E:\Projects\pseudonymizer-corpus, 74 documents: 30 text documents
and 44 PDFs extracted to Markdown; 4102 dev values, 396 held-out values; held-out = sha256(id)[0] % 4 == 0).

## Baseline vs. final (same corpus, same metric, threshold 0.4 = default)

| Detector | Code | Dev leaks | Held-out leaks | Dev over-redacted (of 758) | Held-out over-redacted |
|---|---|---|---|---|---|
| GLiNER | baseline (6fa86a7) | 471 / 4102 | 17 / 396 | 79 | 16 |
| GLiNER | final (98ff65d) | 29 / 4102 | 8 / 396 | 91 | 16 |
| GLiNER + Presidio | baseline | 333 / 4102 | 5 / 396 | 185 | 49 |
| GLiNER + Presidio | final | 13 / 4102 | 3 / 396 | 178 | 39 |

Final, by sensitivity (GLiNER): 0.3: 27 dev / 8 held-out leaks, 113 over-redacted; 0.5: 34 / 10, 78.
GLiNER + Presidio: 0.3: 12 / 3, 188; 0.5: 16 / 5, 174. Presidio fails on all 14 Italian documents (no Italian
spaCy model in the venv); a failed run counts as failed, not as leaks, so its totals cover fewer documents.

Metric note: the evaluation counts a value with a wrapped hyphen ("TA- 2601178") as a form of "TA-2601178", and
does not count titles or never-sensitive words ("Signora", "Herrn", "Prof") as name parts. Both baseline and
final rows above use this metric.

Timing (loaded machine, shared CPU): GLiNER detection 876 s for 74 documents at one threshold (674k characters,
about 1.3 ms per character); the core steps (patterns, addDetected, pseudonymize) 1.9 s in total, against
3.8 s for the baseline core.

## What changed
- Core (mapping.js): values hidden in any case, across line breaks and in any Unicode form (11 known gaps
  closed); initials of detected people ("CB", "A.S.-M.", "JvdM"), with their own placeholder when two people
  share them; a town standing alone after its "postal code + town" was detected; spellings without umlauts or
  accents ("Luethi", "Gerard"); a value with a wrapped hyphen matches in both forms.
- Patterns (patterns.js): birth dates after their cue words in DE/FR/IT/EN; identifying columns of CSV and
  Markdown tables (names, initials, birth dates, IDs, subject and randomisation numbers), form rows laid out as
  tables, quoted CSV cells, tables continued after a page break; host names (Windows network paths, internal
  domains, computer names such as "sur-nb002", "ETUDE-PC-07"); quoted user names; ZSR, ID card and case
  numbers; postal code and town in table cells; values wrapped after a hyphen by PDF extraction.
- Never-sensitive list: abbreviations that look like initials ("OR", "CEO", "DTF").
- Harness: tests/model/corpus-eval.mjs (`npm run eval:corpus`), cached detector output, per-document diffs.

## Remaining leaks (GLiNER 0.4, dev) and reasons
- Truth artefacts: "UND" (from "ZIMMERLI THOMAS UND SANDRA"), "Testpatient Muster".
- Towns without a postal code: Mendrisio, Agno, Hochdorf, Poschiavo, Brè.
- Companies GLiNER misses: Saentis Mutual Health, Seetal, Sonnenberg, Geotest Ost.
- Short initials and user names outside a table: NP, SP, MKT, UvG, spm, Dani, Dalla.
- Seat and class numbers in exam documents: seat 88, posto 41, class 4B; Office MA 3.17; 8'412 (a plot number).
- IDs without a cue word or a known shape: C7R4K2Z91, CLM-55B0912, ATV-K2604-118.
- OCR typo of a name: "Rornano Castelli" (for Romano).

## Checks
npm run check passes; npm test passes apart from the 3 known Windows failures (2 CLI bridge tests, settings
file mode); test:model: the GLiNER suite passes (619 pass, 16 todo), the Presidio suite fails because the Italian
spaCy model is not installed in the shared venv (fails closed, environment, not a regression). knownMisses and
knownChanges were not updated in this run.

## User decisions (2026-10-18), follow-up batch
All numbers from `npm run eval:corpus` on the same 74 documents, cached detector output, measured back to back
(tags ud-before, ud-titles, ud-after in the corpus reports folder).

| GLiNER 0.4 | Dev leaks | Dev over-redacted (of 758) | Dev false hits | Held-out leaks | Held-out over | Held-out false hits |
|---|---|---|---|---|---|---|
| before (98ff65d, old truth) | 29 / 4102 | 91 | 2307 | 8 / 396 | 16 | 274 |
| titles out of the truth | 29 / 4100 | 91 | 2325 | 8 / 396 | 16 | 278 |
| plus town list (f45514d) | 25 / 4100 | 91 | 2345 | 7 / 396 | 16 | 286 |

GLiNER + Presidio 0.4: 13 / 4100 dev leaks and 178 over-redacted before and after (Presidio already found these
towns where it runs); false hits 3324 -> 3346. After, by sensitivity, GLiNER: 0.3: 23 dev / 7 held-out leaks,
113 over; 0.5: 30 / 9, 78. GLiNER + Presidio: 0.3: 12 / 3, 188; 0.5: 16 / 5, 174.

1. Threshold: stays 0.4, unchanged.
2. Italian spaCy model: skipped. The official it_core_news_sm/md/lg are CC BY-NC-SA 3.0. Community spaCy
   pipelines with a permissive licence on the card exist (nickprock/it_spacy_ner_trf, MIT, spaCy 3.5 only;
   bullmount/it_nerIta_trf, Apache-2.0, spaCy 3.2 only, sources and licence fields "n/a"), but both are pinned to
   old spaCy versions, need spacy-transformers, and are trained on WikiANN/WikiNER, whose licences are not
   stated on the card. None is a verified open, commercial-use model for the current Presidio setup, so nothing
   was installed; Presidio still fails closed on Italian documents.
3. Town list: `public/js/core/swiss-places.js`, 4011 names from the swisstopo "Amtliches Ortschaftenverzeichnis
   mit Postleitzahl und Perimeter" (CSV, 133 kB zip, data.geo.admin.ch; swisstopo free geodata, open use
   including commercial, source must be named). Left out: names under 4 letters ("Brè", "Egg"), never-sensitive
   words, 87 names that are also frequent French, English or German words (rank in the spaCy fr/en/de lg
   vectors, plus "Root" by hand). A town right after a court word ("Bezirksgericht", "Pretura di", "Tribunal
   d'arrondissement de") stays readable; if the same town also appears elsewhere it is hidden everywhere,
   because replacement covers every occurrence. Gone leaks: Mendrisio, Hochdorf, Poschiavo, Rüthi SG, Dani.
   The extra false hits are towns that the truth files do not list (Zürich, St. Gallen, Vevey, Lutry).
4. Titles: the corpus README now says titles and forms of address are context; 27 PERSON values in 18 truth
   files lost their title ("Signor Bernasconi" -> "Bernasconi"), 2 duplicates were removed. The leak metric
   already ignored titles, so leaks did not change; detections that include a title now count as false hits.

Checks: npm run check passes; npm test 240 pass, 3 known Windows failures (2 CLI bridge, settings file mode);
test:model GLiNER suite 619 pass, 0 fail, 16 todo; "Peter" and "Ruth" (r3-markdown-case-table) are now hidden,
so they were removed from the GLiNER knownMisses after this run. The Presidio suite is still cancelled by the
missing Italian spaCy model (fails closed), its baselines are unchanged.
