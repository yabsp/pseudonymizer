export default {
  id: 'insurance-de-01',
  domain: 'insurance',
  language: 'de',
  title: 'Schadenmeldung Motorfahrzeug',
  header: 'SEETAL ASSEKURANZ AG | Schadenmeldung Motorfahrzeug | SCHWARZENBACH BEAT | Police MF-2026-7741.093',
  footer: 'Schaden-Nr. S-26-118204 - Sachbearbeiterin N. Furrer, 041 555 73 20',
  parts: [
    {
      html: String.raw`
<p class="small">Seetal Assekuranz AG, Schadenzentrum Motorfahrzeug, Bahnhofstrasse 48, 6280 Hochdorf</p>
<h1>Schadenmeldung Motorfahrzeug</h1>
<p>Bitte vollständig ausfüllen und innert 5 Tagen nach dem Ereignis einreichen. Bei Personenschaden oder
Verdacht auf Fahrunfähigkeit ist gemäss Art. 51 SVG die Polizei beizuziehen.</p>
<h2>1. Versicherungsnehmer und Lenker</h2>
<table class="grid">
<tr><th>Versicherungsnehmer</th><td>Beat Schwarzenbach</td></tr>
<tr><th>Adresse</th><td>Rebenweg 9, 8645 Jona</td></tr>
<tr><th>Geburtsdatum</th><td>22.06.1984</td></tr>
<tr><th>Telefon / E-Mail</th><td>079 555 41 86 / beat.schwarzenbach@example.ch</td></tr>
<tr><th>Policen-Nr.</th><td>MF-2026-7741.093</td></tr>
<tr><th>Deckung</th><td>Haftpflicht, Vollkasko mit Selbstbehalt CHF 1'000, Parkschaden, Bonusschutz</td></tr>
<tr><th>Lenker zum Unfallzeitpunkt</th><td>Versicherungsnehmer selbst</td></tr>
<tr><th>Führerausweis-Nr.</th><td>FA 004 571 228, Kat. B, ausgestellt 14.09.2002</td></tr>
<tr><th>IBAN für Auszahlung</th><td>CH66 0078 1015 5402 3318 7</td></tr>
</table>
<h2>2. Fahrzeug des Versicherungsnehmers (Fahrzeug A)</h2>
<table class="grid">
<tr><th>Marke / Typ</th><td>Skoda Octavia Combi 2.0 TDI</td><th>Kontrollschild</th><td>SG 418 772</td></tr>
<tr><th>Stammnummer</th><td>412.338.907</td><th>Fahrgestell-Nr.</th><td>TMBJG7NE0L0219834</td></tr>
<tr><th>1. Inverkehrsetzung</th><td>03/2021</td><th>Kilometerstand</th><td>78'420 km</td></tr>
<tr><th>Leasing</th><td colspan="3">Ja, Leasinggeber Autoleasing Ostschweiz AG, Vertrag LV-30981</td></tr>
</table>
<h2>3. Unfallhergang</h2>
<table class="facts">
<tr><th>Datum / Zeit</th><td>12.10.2026, ca. 17.40 Uhr</td></tr>
<tr><th>Ort</th><td>Kreuzung Rütistrasse / Allmeindstrasse, 8645 Jona</td></tr>
<tr><th>Witterung</th><td>Regen, Dämmerung, Strasse nass</td></tr>
<tr><th>Polizei</th><td>Kantonspolizei St. Gallen, Rapport Nr. VU-26-04127</td></tr>
</table>
<p>Ich fuhr auf der Rütistrasse Richtung Rapperswil mit etwa 40 km/h. Bei der Kreuzung mit der Allmeindstrasse
hatte ich Vortritt (Rechtsvortritt gemäss Art. 36 Abs. 2 SVG, keine Signalisation). Das von links kommende
Fahrzeug B, gelenkt von Frau Rossetti, fuhr ohne anzuhalten in die Kreuzung ein. Trotz Vollbremsung kam es zur
Kollision ihrer Fahrzeugfront mit meiner linken Fahrzeugseite. Ein Europäisches Unfallprotokoll wurde vor Ort
von beiden Lenkern unterzeichnet.</p>
<h2>4. Gegenpartei (Fahrzeug B)</h2>
<table class="grid">
<tr><th>Halterin und Lenkerin</th><td>Claudia Rossetti</td></tr>
<tr><th>Adresse</th><td>Hohlstrasse 210, 8004 Zürich</td></tr>
<tr><th>Telefon</th><td>076 555 18 03</td></tr>
<tr><th>Fahrzeug / Kontrollschild</th><td>Toyota Yaris Hybrid, ZH 552 019</td></tr>
<tr><th>Haftpflichtversicherer</th><td>Limmat Versicherung AG, Police AH-55-902117</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>5. Unfallskizze</h2>
<div class="as-image">
<p><b>Skizze Kreuzung Rütistrasse / Allmeindstrasse, Jona</b></p>
<pre>
            Allmeindstrasse
                 |   |
                 | B |   Fahrzeug B: ZH 552 019
                 | v |
 ----------------+   +------------------
  Rütistrasse  A ->  X   -> Rapperswil
 ----------------+   +------------------
                 |   |
   Fahrzeug A: SG 418 772     X = Kollisionspunkt
</pre>
<p>Bremsspur A ca. 6 m, Fahrzeug B ohne Bremsspur</p>
</div>
<h2>6. Schäden</h2>
<table class="grid">
<tr><th>Fahrzeug</th><th>Beschädigte Teile</th><th>Besichtigung</th></tr>
<tr><td>A, SG 418 772</td><td>Tür vorne und hinten links, B-Säule, Seitenschweller, Aussenspiegel links</td>
<td>Garage Kälin AG, Zürcherstrasse 77, 8640 Rapperswil, Kostenvoranschlag CHF 8'940.00</td></tr>
<tr><td>B, ZH 552 019</td><td>Stossfänger vorne, Motorhaube, Scheinwerfer rechts</td><td>durch Gegenpartei</td></tr>
</table>
<h2>7. Personenschaden</h2>
<p>Keine Verletzten. Der Versicherungsnehmer klagte am Folgetag über Nackenschmerzen und liess sich bei
Dr. med. Ivo Stadler, Hausarztpraxis Jona, untersuchen (Verdacht auf HWS-Distorsion, Grad I nach Quebec Task
Force). Eine Arbeitsunfähigkeit besteht nicht.</p>
<h2>8. Zeuge</h2>
<table class="grid">
<tr><th>Name</th><td>Peter Gyger</td></tr>
<tr><th>Adresse</th><td>Allmeindstrasse 31, 8645 Jona</td></tr>
<tr><th>Telefon</th><td>079 555 62 18</td></tr>
<tr><th>Beobachtung</th><td>Stand als Fussgänger an der Ecke und sah, dass Fahrzeug B nicht abbremste.</td></tr>
</table>
<h2>9. Haftungsbeurteilung (durch die Versicherung auszufüllen)</h2>
<p>Gemäss Art. 58 SVG haftet der Halter für den durch den Betrieb seines Fahrzeugs verursachten Schaden. Bei
Kollisionen zwischen Motorfahrzeugen richtet sich die Verteilung nach Art. 61 SVG nach dem Verschulden. Die
Missachtung des Rechtsvortritts durch Fahrzeug B spricht für eine volle Haftung der Gegenpartei; der Regress
gegenüber der Limmat Versicherung AG wird eingeleitet. Ein Bonus-Malus-Rückfall entfällt, falls der Regress
vollständig gelingt.</p>
<p>Sachbearbeitung: Nina Furrer, Schadenzentrum Hochdorf, nina.furrer@seetal-assekuranz.example</p>
`,
    },
    {
      scan: { rotate: 0.9, noise: 14, dpi: 150 },
      html: String.raw`
<h1>Erklärung des Versicherungsnehmers</h1>
<p>Name, Vorname: <b>Schwarzenbach Beat</b> &nbsp; Geburtsdatum: <b>22.06.1984</b></p>
<p>Policen-Nr.: <b>MF-2026-7741.093</b> &nbsp; Schaden-Nr.: <b>S-26-118204</b></p>
<p>Ich bestätige, dass die Angaben in dieser Schadenmeldung vollständig und wahrheitsgetreu sind. Mir ist bekannt,
dass falsche Angaben gemäss Art. 40 VVG zum Verlust des Versicherungsanspruchs führen können. Ich ermächtige die
Seetal Assekuranz AG, bei der Kantonspolizei St. Gallen den Polizeirapport und bei Dr. med. Ivo Stadler die
für die Beurteilung notwendigen medizinischen Unterlagen einzuholen.</p>
<p>Beilagen: Europäisches Unfallprotokoll, Fotos der Fahrzeuge (6 Stück), Kostenvoranschlag Garage Kälin AG,
Kopie Fahrzeugausweis.</p>
<div class="as-image signature">Jona, 13.10.2026 &nbsp;&nbsp;&nbsp; B. Schwarzenbach</div>
<p class="small">Eingang Schadenzentrum: 15.10.2026, Visum NF</p>
`,
    },
  ],
  values: [
    { text: 'SEETAL ASSEKURANZ AG', category: 'COMPANY' },
    { text: 'Seetal Assekuranz AG', category: 'COMPANY' },
    { text: 'Bahnhofstrasse 48', category: 'ADDRESS' },
    { text: '6280 Hochdorf', category: 'ADDRESS' },
    { text: 'SCHWARZENBACH BEAT', category: 'PERSON' },
    { text: 'Beat Schwarzenbach', category: 'PERSON' },
    { text: 'Schwarzenbach Beat', category: 'PERSON' },
    { text: 'B. Schwarzenbach', category: 'PERSON' },
    { text: 'MF-2026-7741.093', category: 'ID' },
    { text: 'S-26-118204', category: 'ID' },
    { text: 'N. Furrer', category: 'PERSON' },
    { text: 'Nina Furrer', category: 'PERSON' },
    { text: 'nina.furrer@seetal-assekuranz.example', category: 'EMAIL' },
    { text: '041 555 73 20', category: 'PHONE' },
    { text: 'Rebenweg 9', category: 'ADDRESS' },
    { text: '8645 Jona', category: 'ADDRESS' },
    { text: '22.06.1984', category: 'DATE' },
    { text: '079 555 41 86', category: 'PHONE' },
    { text: 'beat.schwarzenbach@example.ch', category: 'EMAIL' },
    { text: 'FA 004 571 228', category: 'ID' },
    { text: 'CH66 0078 1015 5402 3318 7', category: 'IBAN' },
    { text: 'SG 418 772', category: 'PLATE' },
    { text: '412.338.907', category: 'ID' },
    { text: 'TMBJG7NE0L0219834', category: 'ID' },
    { text: 'Autoleasing Ostschweiz AG', category: 'COMPANY' },
    { text: 'LV-30981', category: 'ID' },
    { text: 'VU-26-04127', category: 'ID' },
    { text: 'Claudia Rossetti', category: 'PERSON' },
    { text: 'Rossetti', category: 'PERSON' },
    { text: 'Hohlstrasse 210', category: 'ADDRESS' },
    { text: '8004 Zürich', category: 'ADDRESS' },
    { text: '076 555 18 03', category: 'PHONE' },
    { text: 'ZH 552 019', category: 'PLATE' },
    { text: 'Limmat Versicherung AG', category: 'COMPANY' },
    { text: 'AH-55-902117', category: 'ID' },
    { text: 'Garage Kälin AG', category: 'COMPANY' },
    { text: 'Zürcherstrasse 77', category: 'ADDRESS' },
    { text: '8640 Rapperswil', category: 'ADDRESS' },
    { text: 'Ivo Stadler', category: 'PERSON' },
    { text: 'Peter Gyger', category: 'PERSON' },
    { text: 'Allmeindstrasse 31', category: 'ADDRESS' },
    { text: '079 555 62 18', category: 'PHONE' },
  ],
  keep: ['Art. 58 SVG', 'Art. 51 SVG', 'Art. 36 Abs. 2 SVG', 'Art. 61 SVG', 'Art. 40 VVG', 'Vollkasko',
    'Selbstbehalt CHF 1\'000', 'Europäisches Unfallprotokoll', 'HWS-Distorsion', 'Bonus-Malus', 'Rechtsvortritt'],
};
