# 7. Swiss towns named alone are found with a list from swisstopo

Status: accepted (2026-10-18)

## Context
Towns named without a postal code ("aus Hochdorf", "Pretura di Mendrisio") leaked: GLiNER often misses them and
the patterns only found "postal code and town". The corpus evaluation counted them among the remaining leaks.
A list of place names must be usable in a commercial product, ship offline, and be kept current.

## Decision
- `public/js/core/swiss-places.js` holds 4011 names built from swisstopo's "Amtliches Ortschaftenverzeichnis mit
  Postleitzahl und Perimeter" (columns Ortschaftsname and Gemeindename), found by `detectPlaces` in
  `public/js/core/patterns.js`. Left out: names under 4 letters, never-sensitive words and 87 names that are also
  common words ("Berg", "Lohn", "Root"). A town right after a court word stays readable unless it also appears
  elsewhere in the text.
- Licence, checked 2026-10-18: the dataset is free geodata, "Open use. Must provide the source." on
  opendata.swiss; swisstopo's terms of use for free geodata (version 1.3.2021) allow commercial use, processing
  and redistribution, and make naming the source mandatory ("©swisstopo" or "Federal Office of Topography
  swisstopo"). The app names it at the bottom of the Settings tab, and the file names it in its header.

## Consequences
- GLiNER 0.4 on the corpus: 29 -> 25 leaks of 4100 values in the dev set, 8 -> 7 of 396 held out; false hits rise
  by about 20 (towns the truth files don't list, such as Zürich, Vevey).
- The list is a snapshot (validity 2026-09-30); swisstopo updates it monthly. Rebuild it when communes merge, with
  the same filters, and keep the source note.
- Still open: names under 4 letters ("Brè") and towns outside Switzerland.

Sources: https://opendata.swiss/en/dataset/amtliches-ortschaftenverzeichnis-mit-postleitzahl-und-perimeter,
https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices
