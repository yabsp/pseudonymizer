const DATES = ['04.05.2026', '18.05.2026', '01.06.2026', '15.06.2026', '29.06.2026', '13.07.2026'];

// Deterministic "drift" per parameter and time point, so the series look like a real course.
const drift = (base, step, i, digits) => (base + step * i + ((i * 7 + 3) % 5 - 2) * step * 0.3).toFixed(digits);

const SERIES = {
  haematology: [
    ['Hämoglobin', 'g/l', '120-160', 104, 3.1, 0],
    ['Hämatokrit', 'l/l', '0.36-0.46', 0.32, 0.008, 2],
    ['Erythrozyten', 'T/l', '4.0-5.2', 3.6, 0.09, 2],
    ['MCV', 'fl', '80-98', 76, 1.4, 0],
    ['Leukozyten', 'G/l', '3.5-10.0', 6.2, 0.2, 1],
    ['Thrombozyten', 'G/l', '150-450', 388, -9, 0],
    ['Retikulozyten', '‰', '5-25', 31, -2.8, 0],
  ],
  chemistry: [
    ['Natrium', 'mmol/l', '136-145', 138, 0.3, 0],
    ['Kalium', 'mmol/l', '3.5-5.1', 4.6, -0.05, 1],
    ['Kreatinin', 'µmol/l', '45-84', 91, -1.6, 0],
    ['eGFR (CKD-EPI)', 'ml/min/1.73m²', '> 90', 64, 1.5, 0],
    ['Harnstoff', 'mmol/l', '2.6-6.4', 7.1, -0.15, 1],
    ['ALAT', 'U/l', '< 35', 48, -2.4, 0],
    ['ASAT', 'U/l', '< 35', 41, -1.7, 0],
    ['Gamma-GT', 'U/l', '< 40', 66, -3.1, 0],
    ['CRP', 'mg/l', '< 5', 18, -2.9, 0],
  ],
  iron: [
    ['Ferritin', 'µg/l', '15-150', 6, 9.5, 0],
    ['Transferrinsättigung', '%', '16-45', 8, 2.6, 0],
    ['Eisen', 'µmol/l', '6.6-26', 5.1, 1.4, 1],
    ['Vitamin B12', 'pmol/l', '145-569', 162, 6, 0],
    ['Folsäure', 'nmol/l', '> 10', 9.4, 0.6, 1],
    ['TSH', 'mU/l', '0.27-4.2', 2.1, 0.05, 2],
  ],
};

const table = (rows) => `<table class="grid">
<tr><th>Parameter</th><th>Einheit</th><th>Referenz</th>${DATES.map((d) => `<th>${d}</th>`).join('')}</tr>
${rows.map(([name, unit, ref, base, step, digits]) => `<tr><td>${name}</td><td>${unit}</td><td>${ref}</td>${DATES.map((_, i) => `<td>${drift(base, step, i, digits)}</td>`).join('')}</tr>`).join('\n')}
</table>`;

export default {
  id: 'medicine-de-02',
  domain: 'medicine',
  language: 'de',
  title: 'Laborbefund Verlauf',
  header: 'LABOR ALPENBLICK AG | Kumulativbefund | Patientin: ZWAHLEN-GERBER BEATRICE, 23.11.1974',
  footer: 'Vertraulich - Laborbefund B. Zwahlen-Gerber - Auftrags-Nr. LA-26-0713-4471',
  parts: [
    {
      html: String.raw`
<p class="small">Labor Alpenblick AG, Medizinisches Laboratorium, Spitalgasse 28, 3011 Bern, Tel. 031 555 40 00, befunde@labor-alpenblick.example</p>
<table class="facts">
<tr><th>Patientin</th><td>Frau Beatrice Zwahlen-Gerber, geb. 23.11.1974</td></tr>
<tr><th>Adresse</th><td>Lindenweg 14, 3122 Kehrsatz</td></tr>
<tr><th>Versichertennummer</th><td>80756 0004 2213 9087</td></tr>
<tr><th>Krankenversicherer</th><td>Krankenkasse Aaretal AG</td></tr>
<tr><th>Patienten-ID Labor</th><td>PID-0388152</td></tr>
<tr><th>Auftrags-Nr.</th><td>LA-26-0713-4471</td></tr>
<tr><th>Auftraggeber</th><td>Dr. med. Matthias Lüthi, Facharzt Allgemeine Innere Medizin, Praxis Lüthi &amp; Rindlisbacher, Belpstrasse 9, 3007 Bern</td></tr>
<tr><th>Kopie an</th><td>Dr. med. Sandrine Rindlisbacher, Gastroenterologie</td></tr>
<tr><th>Probeneingang</th><td>13.07.2026, 08:42</td></tr>
<tr><th>Befund validiert</th><td>13.07.2026, 14:10, Dr. sc. nat. Thomas Aebischer, FAMH Labormedizin</td></tr>
</table>
<h1>Kumulativer Laborbefund</h1>
<p>Klinische Angaben des Auftraggebers: Eisenmangelanämie bei Hypermenorrhoe, Status nach Eisencarboxymaltose
1000 mg i.v. am 18.05.2026, Verdacht auf Zöliakie. Laufende Therapie: Pantoprazol 40 mg 1-0-0,
Levothyroxin 50 µg 1-0-0.</p>
<h2>Hämatologie</h2>
${table(SERIES.haematology)}
<p>Beurteilung: Mikrozytäre, hypochrome Anämie mit deutlichem Anstieg des Hämoglobins nach intravenöser
Eisengabe. Retikulozytenantwort am 01.06.2026 regelrecht. Keine Hinweise auf Hämolyse.</p>
<h2>Klinische Chemie</h2>
${table(SERIES.chemistry)}
<p>Beurteilung: Leicht erhöhte Transaminasen, rückläufig. CRP normalisiert. Nierenfunktion stabil, eGFR nach
CKD-EPI 2021 berechnet.</p>
`,
    },
    {
      html: String.raw`
<h2>Eisenstoffwechsel, Vitamine, Schilddrüse</h2>
${table(SERIES.iron)}
<p>Beurteilung: Ferritin nach Substitution im Normbereich, Transferrinsättigung weiterhin knapp. Folsäure
grenzwertig, Substitution empfohlen.</p>
<h2>Zöliakie-Serologie (Probe vom 13.07.2026)</h2>
<table class="grid">
<tr><th>Untersuchung</th><th>Resultat</th><th>Einheit</th><th>Referenz</th><th>Bewertung</th></tr>
<tr><td>Anti-Transglutaminase IgA (tTG-IgA)</td><td>87</td><td>U/ml</td><td>&lt; 7</td><td>positiv</td></tr>
<tr><td>Anti-Endomysium IgA (EMA)</td><td>1:160</td><td>Titer</td><td>&lt; 1:10</td><td>positiv</td></tr>
<tr><td>Gesamt-IgA</td><td>2.1</td><td>g/l</td><td>0.7-4.0</td><td>normal</td></tr>
<tr><td>HLA-DQ2/DQ8</td><td>DQ2.5 nachgewiesen</td><td>-</td><td>-</td><td>kompatibel</td></tr>
</table>
<p>Interpretation: Die Konstellation mit tTG-IgA über dem 10-fachen oberen Normwert und positivem EMA ist
hochgradig verdächtig auf eine Zöliakie. Zur Bestätigung empfehlen wir eine Duodenalbiopsie gemäss Leitlinie,
sofern die Patientin weiterhin glutenhaltig isst. Wir haben Dr. med. Rindlisbacher am 13.07.2026 telefonisch
informiert.</p>
<h2>Urinstatus (Mittelstrahlurin, 13.07.2026)</h2>
<table class="grid">
<tr><th>Parameter</th><th>Resultat</th><th>Referenz</th></tr>
<tr><td>pH</td><td>6.0</td><td>5.0-7.5</td></tr>
<tr><td>Protein</td><td>negativ</td><td>negativ</td></tr>
<tr><td>Glukose</td><td>negativ</td><td>negativ</td></tr>
<tr><td>Erythrozyten</td><td>2 /µl</td><td>&lt; 10 /µl</td></tr>
<tr><td>Leukozyten</td><td>5 /µl</td><td>&lt; 10 /µl</td></tr>
<tr><td>Albumin/Kreatinin-Quotient</td><td>1.4 mg/mmol</td><td>&lt; 3.0 mg/mmol</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>Hinweise zu den Methoden</h2>
<p>Hämatologie mit Durchflusszytometrie, klinische Chemie photometrisch, Ferritin und Vitamin B12 mittels
Elektrochemilumineszenz-Immunoassay (ECLIA). Die eGFR wird nach CKD-EPI 2021 ohne Ethnie-Koeffizient berechnet.
Referenzbereiche gelten für Frauen zwischen 18 und 60 Jahren.</p>
<p>Werte ausserhalb des Referenzbereichs sind nicht automatisch pathologisch. Bei Fragen zur Interpretation
erreichen Sie den diensthabenden Laborarzt unter 031 555 40 12.</p>
<h2>Abrechnung</h2>
<table class="grid">
<tr><th>Tarifposition (Analysenliste)</th><th>Bezeichnung</th><th>Taxpunkte</th></tr>
<tr><td>1371.00</td><td>Hämatogramm II</td><td>12.0</td></tr>
<tr><td>1509.00</td><td>Kreatinin</td><td>2.5</td></tr>
<tr><td>1307.00</td><td>Ferritin</td><td>10.6</td></tr>
<tr><td>3121.00</td><td>Transglutaminase-Antikörper IgA</td><td>40.5</td></tr>
<tr><td>3118.00</td><td>Endomysium-Antikörper IgA</td><td>39.0</td></tr>
</table>
<p>Rechnung im Tiers payant an Krankenkasse Aaretal AG, Versichertennummer 80756 0004 2213 9087.</p>
<p>Dieser Befund wurde elektronisch validiert und ist ohne Unterschrift gültig.</p>
<div class="as-image signature">Labor Alpenblick AG - Dr. sc. nat. Thomas Aebischer, FAMH - validiert 13.07.2026</div>
<p class="small">Verteiler: Dr. med. Matthias Lüthi (Auftraggeber), Dr. med. Sandrine Rindlisbacher (Kopie),
Patientin B. Zwahlen-Gerber auf Wunsch per Post an Lindenweg 14, 3122 Kehrsatz.</p>
`,
    },
  ],
  values: [
    { text: 'ZWAHLEN-GERBER BEATRICE', category: 'PERSON' },
    { text: 'Beatrice Zwahlen-Gerber', category: 'PERSON' },
    { text: 'B. Zwahlen-Gerber', category: 'PERSON' },
    { text: '23.11.1974', category: 'DATE' },
    { text: 'Lindenweg 14', category: 'ADDRESS' },
    { text: '3122 Kehrsatz', category: 'ADDRESS' },
    { text: '80756 0004 2213 9087', category: 'ID' },
    { text: 'PID-0388152', category: 'ID' },
    { text: 'LA-26-0713-4471', category: 'ID' },
    { text: 'Matthias Lüthi', category: 'PERSON' },
    { text: 'Praxis Lüthi & Rindlisbacher', category: 'COMPANY' },
    { text: 'Belpstrasse 9', category: 'ADDRESS' },
    { text: '3007 Bern', category: 'ADDRESS' },
    { text: 'Sandrine Rindlisbacher', category: 'PERSON' },
    { text: 'Thomas Aebischer', category: 'PERSON' },
    { text: 'Labor Alpenblick AG', category: 'COMPANY' },
    { text: 'LABOR ALPENBLICK AG', category: 'COMPANY' },
    { text: 'Spitalgasse 28', category: 'ADDRESS' },
    { text: '3011 Bern', category: 'ADDRESS' },
    { text: '031 555 40 00', category: 'PHONE' },
    { text: '031 555 40 12', category: 'PHONE' },
    { text: 'befunde@labor-alpenblick.example', category: 'EMAIL' },
    { text: 'Krankenkasse Aaretal AG', category: 'COMPANY' },
  ],
  keep: ['Eisenmangelanämie', 'Eisencarboxymaltose 1000 mg i.v.', 'Pantoprazol 40 mg', 'Levothyroxin 50 µg',
    'Anti-Transglutaminase IgA', 'Zöliakie', 'CKD-EPI 2021', 'Hypermenorrhoe', 'Duodenalbiopsie'],
};
