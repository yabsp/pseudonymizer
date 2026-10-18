const LAB_ROWS = [
  ['Hämoglobin', '128', 'g/l', '135-170'],
  ['Leukozyten', '9.8', 'G/l', '3.5-10.0'],
  ['Kreatinin', '112', 'µmol/l', '62-106'],
  ['eGFR (CKD-EPI)', '58', 'ml/min/1.73m²', '> 90'],
  ['Troponin T hs', '86', 'ng/l', '< 14'],
  ['NT-proBNP', '1840', 'ng/l', '< 300'],
  ['HbA1c', '8.1', '%', '4.0-6.0'],
];

export default {
  id: 'medicine-de-01',
  domain: 'medicine',
  language: 'de',
  title: 'Austrittsbericht Kardiologie',
  header: 'SPITAL SEEWIL AG | Kardiologie | Patient: AMMANN RETO, 14.02.1961',
  footer: 'Vertraulich - Austrittsbericht R. Ammann - Fall-Nr. 2026-448812',
  parts: [
    {
      html: String.raw`
<p class="small">Spital Seewil AG, Klinik für Kardiologie, Seestrasse 101, 8800 Thalwil</p>
<p>Frau Dr. med. Corinne Bachmann<br>Praxis am Bahnhof<br>Bahnhofplatz 3<br>8910 Affoltern am Albis</p>
<p class="right">Thalwil, 9. September 2026</p>
<h1>Austrittsbericht</h1>
<table class="facts">
<tr><th>Patient</th><td>Herr Reto Ammann, geb. 14.02.1961</td></tr>
<tr><th>Adresse</th><td>Dorfstrasse 7, 8932 Mettmenstetten</td></tr>
<tr><th>AHV-Nr.</th><td>756.4821.3390.15</td></tr>
<tr><th>Fall-Nr.</th><td>2026-448812</td></tr>
<tr><th>Hospitalisation</th><td>02.09.2026 bis 09.09.2026</td></tr>
</table>
<p>Sehr geehrte Frau Kollegin Bachmann</p>
<p>Wir berichten über die Hospitalisation Ihres Patienten, Herrn Ammann, der uns notfallmässig mit retrosternalen
Thoraxschmerzen zugewiesen wurde.</p>
<h2>Diagnosen</h2>
<ol>
<li>NSTEMI bei koronarer 3-Gefässerkrankung, PCI mit 2 DES (RIVA, RCX) am 03.09.2026</li>
<li>Vorhofflimmern, CHA₂DS₂-VASc-Score 3</li>
<li>Diabetes mellitus Typ 2, HbA1c 8.1 %</li>
<li>Chronische Niereninsuffizienz KDIGO G3a</li>
</ol>
<h2>Labor bei Eintritt</h2>
<table class="grid">
<tr><th>Parameter</th><th>Wert</th><th>Einheit</th><th>Referenz</th></tr>
${LAB_ROWS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<p>Der Body-Mass-Index betrug <tex>\mathrm{BMI} = \frac{m}{h^{2}} = 31.2</tex> kg/m².</p>
<h2>Medikation bei Austritt</h2>
<ul>
<li>Apixaban 5 mg 1-0-1</li>
<li>Clopidogrel 75 mg 1-0-0 für 6 Monate</li>
<li>Atorvastatin 80 mg 0-0-1</li>
<li>Metformin 1000 mg 1-0-1</li>
</ul>
<p>Herr Ammann wurde von seiner Tochter, Simone Ammann-Keller (simone.ammann@example.com, 079 555 88 10),
begleitet, die bevollmächtigt ist, Auskünfte zu erhalten.</p>
<h2>Procedere</h2>
<p>Kontrolle in der kardiologischen Sprechstunde bei Dr. med. Lukas Steiner in 6 Wochen. Kreatinin-Kontrolle
beim Hausarzt in 1 Woche.</p>
<p>Freundliche Grüsse</p>
<p>Dr. med. Lukas Steiner<br>Oberarzt Kardiologie<br>lukas.steiner@spital-seewil.example<br>Tel. 044 555 21 40</p>
`,
    },
    {
      scan: { rotate: -0.7, noise: 10, dpi: 150 },
      html: String.raw`
<h1>Einverständniserklärung Koronarangiographie</h1>
<p>Name, Vorname: <b>Ammann Reto</b> &nbsp; Geburtsdatum: <b>14.02.1961</b></p>
<p>Ich bestätige, dass ich von Dr. med. Lukas Steiner über die Koronarangiographie, die perkutane
Koronarintervention (PCI) und ihre Risiken (Blutung, Kontrastmittelallergie, Gefässverletzung) aufgeklärt wurde.</p>
<div class="as-image signature">Unterschrift: R. Ammann &nbsp;&nbsp; Thalwil, 02.09.2026</div>
`,
    },
  ],
  values: [
    { text: 'AMMANN RETO', category: 'PERSON' },
    { text: 'Reto Ammann', category: 'PERSON' },
    { text: 'Ammann Reto', category: 'PERSON' },
    { text: 'R. Ammann', category: 'PERSON' },
    { text: '14.02.1961', category: 'DATE' },
    { text: 'Fall-Nr. 2026-448812', category: 'ID' },
    { text: '2026-448812', category: 'ID' },
    { text: 'Corinne Bachmann', category: 'PERSON' },
    { text: 'Bahnhofplatz 3', category: 'ADDRESS' },
    { text: '8910 Affoltern am Albis', category: 'ADDRESS' },
    { text: 'Dorfstrasse 7', category: 'ADDRESS' },
    { text: '8932 Mettmenstetten', category: 'ADDRESS' },
    { text: '756.4821.3390.15', category: 'AHV' },
    { text: 'Simone Ammann-Keller', category: 'PERSON' },
    { text: 'simone.ammann@example.com', category: 'EMAIL' },
    { text: '079 555 88 10', category: 'PHONE' },
    { text: 'Lukas Steiner', category: 'PERSON' },
    { text: 'lukas.steiner@spital-seewil.example', category: 'EMAIL' },
    { text: '044 555 21 40', category: 'PHONE' },
    { text: 'Spital Seewil AG', category: 'COMPANY' },
    { text: 'SPITAL SEEWIL AG', category: 'COMPANY' },
    { text: 'Seestrasse 101', category: 'ADDRESS' },
    { text: '8800 Thalwil', category: 'ADDRESS' },
  ],
  keep: ['NSTEMI', 'Vorhofflimmern', 'Apixaban 5 mg', 'Clopidogrel 75 mg', 'Diabetes mellitus Typ 2', 'KDIGO G3a',
    'Troponin T hs', 'Koronarangiographie'],
};
