export default {
  id: 'pharma-de-01',
  domain: 'pharma',
  language: 'de',
  title: 'Meldung unerwünschte Arzneimittelwirkung',
  header: 'Meldung einer vermuteten unerwünschten Arzneimittelwirkung (UAW) an Swissmedic | Meldende Stelle: APOTHEKE ZUR LINDE AG',
  footer: 'Vertraulich - Pharmacovigilance - interne Referenz PV-LI-2026-0219',
  parts: [
    {
      html: String.raw`
<h1>Meldeformular UAW - Humanarzneimittel</h1>
<p class="small">Meldung gemäss Art. 59 HMG und Art. 61 VAM. Bitte alle bekannten Angaben ausfüllen. Die Identität
der Patientin oder des Patienten wird nur mit Initialen und Geburtsdatum angegeben.</p>
<h2>1. Patient/in</h2>
<table class="grid">
<tr><th>Initialen</th><td>S. K. (Sabine Krähenbühl)</td><th>Geburtsdatum</th><td>30.01.1958</td></tr>
<tr><th>Geschlecht</th><td>weiblich</td><th>Gewicht / Grösse</th><td>64 kg / 166 cm</td></tr>
<tr><th>Schwangerschaft</th><td>nein</td><th>Interne Patienten-Nr.</th><td>KD-77412</td></tr>
</table>
<h2>2. Vermutete unerwünschte Wirkung</h2>
<table class="grid">
<tr><th>Beginn</th><td>12.08.2026</td><th>Ende</th><td>noch andauernd</td></tr>
<tr><th>Beschreibung</th><td colspan="3">Seit dem 12.08.2026 zunehmende Myalgien in Oberschenkeln und Schultern, Schwäche beim
Treppensteigen, dunkler Urin am 15.08.2026. Hausärztlich CK 8420 U/l (Norm &lt; 170), Kreatinin 131 µmol/l.
Verdacht auf Rhabdomyolyse unter Atorvastatin nach Beginn von Clarithromycin (CYP3A4-Hemmung).</td></tr>
<tr><th>Schweregrad</th><td colspan="3">schwerwiegend: Hospitalisation vom 16.08.2026 bis 22.08.2026</td></tr>
<tr><th>Ausgang</th><td colspan="3">in Besserung, CK am 22.08.2026 bei 640 U/l</td></tr>
</table>
<h2>3. Verdächtigte und weitere Arzneimittel</h2>
<table class="grid">
<tr><th>Präparat (Wirkstoff)</th><th>Charge</th><th>Dosierung</th><th>Indikation</th><th>Von</th><th>Bis</th><th>Rolle</th></tr>
<tr><td>Atorvastatin 40 mg Filmtabletten</td><td>ATV-K2604-118</td><td>40 mg 0-0-1</td><td>Hypercholesterinämie</td><td>03.2021</td><td>16.08.2026</td><td>verdächtigt</td></tr>
<tr><td>Clarithromycin 500 mg Filmtabletten</td><td>CLM-55B0912</td><td>500 mg 1-0-1</td><td>ambulant erworbene Pneumonie</td><td>06.08.2026</td><td>15.08.2026</td><td>interagierend</td></tr>
<tr><td>Amlodipin 5 mg</td><td>AML-7731-26</td><td>5 mg 1-0-0</td><td>arterielle Hypertonie</td><td>2019</td><td>-</td><td>Begleitmedikation</td></tr>
<tr><td>Levothyroxin 75 µg</td><td>LT4-260311</td><td>75 µg 1-0-0</td><td>Hypothyreose</td><td>2015</td><td>-</td><td>Begleitmedikation</td></tr>
</table>
<h2>4. Meldende Person</h2>
<table class="facts">
<tr><th>Name</th><td>Lukas Brunner, eidg. dipl. Apotheker</td></tr>
<tr><th>Institution</th><td>Apotheke zur Linde AG, Marktgasse 12, 3400 Burgdorf</td></tr>
<tr><th>Telefon / E-Mail</th><td>034 555 21 77 / l.brunner@apotheke-linde.example</td></tr>
<tr><th>Behandelnde Ärztin</th><td>Dr. med. Franziska Hirschi, Hausarztpraxis Emmental, 3415 Hasle bei Burgdorf, 034 555 60 40</td></tr>
<tr><th>Spital</th><td>Regionalspital Oberaargau-Emme, Fall-Nr. 2026-0816-4402</td></tr>
</table>
<p>Kausalität aus Sicht der meldenden Person: wahrscheinlich (WHO-UMC). Die Wechselwirkung von Atorvastatin mit
Clarithromycin war in der Apotheke bei der Abgabe am 06.08.2026 nicht erkannt worden, da die Statintherapie
in einer anderen Apotheke bezogen wurde. Nach Absetzen beider Präparate rasche klinische Besserung, unter
Hydratation keine Dialyse nötig.</p>
`,
    },
    {
      scan: { rotate: 1.1, noise: 14, dpi: 150 },
      html: String.raw`
<h1>Beilage: Austrittsbericht (Kopie, Auszug)</h1>
<p class="small">Regionalspital Oberaargau-Emme, Medizinische Klinik, Spitalstrasse 30, 3400 Burgdorf</p>
<p>Patientin: Krähenbühl Sabine, geb. 30.01.1958, Bernstrasse 41, 3412 Heimiswil<br>
Fall-Nr. 2026-0816-4402</p>
<h2>Diagnosen</h2>
<ol>
<li>Rhabdomyolyse mit akuter Nierenschädigung AKIN 1, medikamentös bedingt (Atorvastatin 40 mg plus Clarithromycin)</li>
<li>Ambulant erworbene Pneumonie rechts basal, abgeheilt</li>
<li>Arterielle Hypertonie</li>
</ol>
<h2>Verlauf</h2>
<p>Bei Eintritt CK 9150 U/l, Myoglobin im Urin positiv, Kreatinin 138 µmol/l. Intravenöse Hydratation mit 3 l
NaCl 0.9 % pro Tag unter Bilanzierung. Kontinuierlicher Abfall der CK, Kreatinin bei Austritt 92 µmol/l.
Atorvastatin wurde gestoppt; eine Wiederaufnahme der Statintherapie mit Rosuvastatin 5 mg kann nach
Normalisierung der CK in 6 Wochen erwogen werden.</p>
<p>Mit freundlichen Grüssen<br>Dr. med. Bettina Schürch, Oberärztin Innere Medizin</p>
<div class="as-image signature">B. Schürch</div>
`,
    },
  ],
  values: [
    { text: 'S. K.', category: 'PERSON' },
    { text: 'Sabine Krähenbühl', category: 'PERSON' },
    { text: 'Krähenbühl Sabine', category: 'PERSON' },
    { text: '30.01.1958', category: 'DATE' },
    { text: 'KD-77412', category: 'ID' },
    { text: 'Bernstrasse 41', category: 'ADDRESS' },
    { text: '3412 Heimiswil', category: 'ADDRESS' },
    { text: 'ATV-K2604-118', category: 'ID' },
    { text: 'CLM-55B0912', category: 'ID' },
    { text: 'AML-7731-26', category: 'ID' },
    { text: 'LT4-260311', category: 'ID' },
    { text: 'Lukas Brunner', category: 'PERSON' },
    { text: 'Apotheke zur Linde AG', category: 'COMPANY' },
    { text: 'APOTHEKE ZUR LINDE AG', category: 'COMPANY' },
    { text: 'Marktgasse 12', category: 'ADDRESS' },
    { text: '3400 Burgdorf', category: 'ADDRESS' },
    { text: '034 555 21 77', category: 'PHONE' },
    { text: 'l.brunner@apotheke-linde.example', category: 'EMAIL' },
    { text: 'Franziska Hirschi', category: 'PERSON' },
    { text: 'Hausarztpraxis Emmental', category: 'COMPANY' },
    { text: '3415 Hasle bei Burgdorf', category: 'ADDRESS' },
    { text: '034 555 60 40', category: 'PHONE' },
    { text: 'Regionalspital Oberaargau-Emme', category: 'COMPANY' },
    { text: 'Spitalstrasse 30', category: 'ADDRESS' },
    { text: '2026-0816-4402', category: 'ID' },
    { text: 'PV-LI-2026-0219', category: 'ID' },
    { text: 'Bettina Schürch', category: 'PERSON' },
    { text: 'B. Schürch', category: 'PERSON' },
  ],
  keep: ['Rhabdomyolyse', 'Atorvastatin 40 mg', 'Clarithromycin 500 mg', 'CYP3A4', 'Art. 59 HMG', 'WHO-UMC',
    'AKIN 1', 'Rosuvastatin 5 mg', 'CK 8420 U/l'],
};
