export default {
  id: 'tax-de-01',
  domain: 'tax',
  language: 'de',
  title: 'Veranlagungsverfügung Staats- und Gemeindesteuern 2025',
  header: 'STEUERVERWALTUNG DES KANTONS AARETAL | Veranlagungsverfügung 2025 | WIDMER-ZBINDEN DANIEL UND SANDRA',
  footer: 'Register-Nr. 420.118.773 - Veranlagung Staats- und Gemeindesteuern 2025 - vertraulich (Steuergeheimnis)',
  parts: [
    {
      html: String.raw`
<p class="small">Steuerverwaltung des Kantons Aaretal, Abteilung natürliche Personen, Postfach, 3270 Aarberg</p>
<p>Herr und Frau<br>Daniel und Sandra Widmer-Zbinden<br>Lindenhofweg 14<br>3292 Busswil bei Büren</p>
<p class="right">Aarberg, 22. September 2026</p>
<h1>Veranlagungsverfügung Staats- und Gemeindesteuern 2025</h1>
<table class="facts">
<tr><th>Register-Nr.</th><td>420.118.773</td></tr>
<tr><th>Steuerpflichtige Person 1</th><td>Daniel Widmer, geb. 11.08.1978, AHV-Nr. 756.4093.2716.58</td></tr>
<tr><th>Steuerpflichtige Person 2</th><td>Sandra Widmer-Zbinden, geb. 25.02.1981, AHV-Nr. 756.7741.0638.24</td></tr>
<tr><th>Zivilstand</th><td>verheiratet (gemeinsame Veranlagung, Art. 9 StHG)</td></tr>
<tr><th>Wohngemeinde</th><td>Lyss-Busswil, Steuerfuss Gemeinde 1.62, Kirchgemeinde reformiert 0.207</td></tr>
<tr><th>Steuerperiode</th><td>01.01.2025 bis 31.12.2025</td></tr>
<tr><th>Veranlagende Person</th><td>Rolf Lüthi, Steuerkommissär, Tel. 032 555 64 18</td></tr>
</table>
<p>Gestützt auf die eingereichte Steuererklärung vom 28.03.2026 und die Untersuchung der Steuerverwaltung wird die
Veranlagung wie folgt vorgenommen. Abweichungen von der Selbstdeklaration sind unten begründet.</p>
<h2>Kinder und unterstützte Personen</h2>
<table class="grid">
<tr><th>Name</th><th>Geburtsdatum</th><th>Ausbildung</th><th class="num">Kinderabzug CHF</th></tr>
<tr><td>Jonas Widmer</td><td>04.06.2010</td><td>Sekundarschule</td><td class="num">8'000</td></tr>
<tr><td>Lena Widmer</td><td>19.10.2013</td><td>Primarschule</td><td class="num">8'000</td></tr>
<tr><td>Mia Widmer</td><td>02.03.2021</td><td>Kindertagesstätte Sonnenstrahl GmbH</td><td class="num">8'000</td></tr>
</table>
<p>Für Mia Widmer werden Kinderbetreuungskosten (Kita Sonnenstrahl GmbH, 2.5 Tage pro Woche) von
CHF 14'860 belegt; abzugsfähig sind höchstens CHF 12'000 (Art. 9 Abs. 2 lit. m StHG, kantonales Maximum).</p>
<h2>Erwerbseinkommen</h2>
<table class="grid">
<tr><th>Person</th><th>Arbeitgeber</th><th class="num">Nettolohn gemäss Lohnausweis CHF</th></tr>
<tr><td>Daniel Widmer</td><td>Präzisionsmechanik Seeland AG, Industriering 40, 3250 Lyss</td><td class="num">112'480</td></tr>
<tr><td>Sandra Widmer-Zbinden</td><td>Apotheke am Bielersee AG, Seevorstadt 21, 2502 Biel/Bienne (Pensum 60 %)</td><td class="num">51'920</td></tr>
<tr><td>Sandra Widmer-Zbinden</td><td>Nebenerwerb: Kursleiterin Volkshochschule Seeland</td><td class="num">2'350</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>Berechnung des steuerbaren Einkommens</h2>
<table class="grid">
<tr><th>Position</th><th class="num">Deklariert CHF</th><th class="num">Veranlagt CHF</th><th>Bemerkung</th></tr>
<tr><td>Einkünfte aus unselbständiger Erwerbstätigkeit</td><td class="num">166'750</td><td class="num">166'750</td><td></td></tr>
<tr><td>Wertschriftenertrag</td><td class="num">1'184</td><td class="num">1'412</td><td>1</td></tr>
<tr><td>Eigenmietwert Liegenschaft Lindenhofweg 14</td><td class="num">19'600</td><td class="num">19'600</td><td></td></tr>
<tr><th>Total Einkünfte</th><th class="num">187'534</th><th class="num">187'762</th><th></th></tr>
<tr><td>Berufskosten Fahrkosten (Daniel Widmer)</td><td class="num">-4'200</td><td class="num">-3'200</td><td>2</td></tr>
<tr><td>Berufskosten Verpflegung und übrige</td><td class="num">-5'600</td><td class="num">-5'600</td><td></td></tr>
<tr><td>Beiträge Säule 3a (beide Ehegatten)</td><td class="num">-14'516</td><td class="num">-14'516</td><td></td></tr>
<tr><td>Einkauf berufliche Vorsorge (Pensionskasse, Art. 33 Abs. 1 lit. d DBG)</td><td class="num">-20'000</td><td class="num">-20'000</td><td></td></tr>
<tr><td>Schuldzinsen Hypothek</td><td class="num">-8'950</td><td class="num">-8'950</td><td></td></tr>
<tr><td>Liegenschaftsunterhalt (Pauschale 20 %)</td><td class="num">-3'920</td><td class="num">-3'920</td><td></td></tr>
<tr><td>Versicherungsprämien und Sparzinsen</td><td class="num">-6'400</td><td class="num">-6'400</td><td></td></tr>
<tr><td>Kinderbetreuungskosten</td><td class="num">-14'860</td><td class="num">-12'000</td><td>3</td></tr>
<tr><td>Krankheitskosten über 5 % des Nettoeinkommens</td><td class="num">-1'840</td><td class="num">0</td><td>4</td></tr>
<tr><td>Zweiverdienerabzug</td><td class="num">-9'300</td><td class="num">-9'300</td><td></td></tr>
<tr><td>Gemeinnützige Zuwendungen</td><td class="num">-650</td><td class="num">-650</td><td></td></tr>
<tr><td>Kinderabzüge (3 Kinder)</td><td class="num">-24'000</td><td class="num">-24'000</td><td></td></tr>
<tr><td>Abzug für Verheiratete</td><td class="num">-5'300</td><td class="num">-5'300</td><td></td></tr>
<tr><th>Steuerbares Einkommen</th><th class="num">67'998</th><th class="num">73'926</th><th></th></tr>
<tr><th>Satzbestimmendes Einkommen (gerundet)</th><th class="num">67'900</th><th class="num">73'900</th><th></th></tr>
</table>
<h2>Begründung der Abweichungen</h2>
<ol>
<li>Der Ertrag aus dem Depot bei der Regionalbank Aaretal AG, Depot-Nr. 30-551.207.9, wurde gemäss Steuerauszug
korrigiert (Dividende Fondsanteile CHF 228 nicht deklariert).</li>
<li>Für den Arbeitsweg Busswil bei Büren - Lyss werden die Kosten des öffentlichen Verkehrs anerkannt; die
Benützung des privaten Fahrzeugs ist nicht notwendig (Zeitersparnis unter einer Stunde pro Tag).</li>
<li>Kantonales Maximum für Kinderbetreuungskosten CHF 12'000 pro Kind.</li>
<li>Die Krankheitskosten von CHF 1'840 übersteigen den Selbstbehalt von 5 % des Nettoeinkommens
(CHF 6'260) nicht.</li>
</ol>
<h2>Steuerbares Vermögen per 31.12.2025</h2>
<table class="grid">
<tr><th>Position</th><th class="num">Veranlagt CHF</th></tr>
<tr><td>Bankguthaben und Wertschriften (Regionalbank Aaretal AG, IBAN CH29 0636 3016 8820 4417 0)</td><td class="num">86'420</td></tr>
<tr><td>Liegenschaft Lindenhofweg 14, amtlicher Wert, Grundstück Lyss-Busswil Nr. 1187</td><td class="num">512'000</td></tr>
<tr><td>Fahrzeuge, Rückkaufswert Lebensversicherung (Police LV-88.40217)</td><td class="num">31'800</td></tr>
<tr><td>Hypothekarschulden</td><td class="num">-448'000</td></tr>
<tr><td>Sozialabzüge Vermögen</td><td class="num">-36'000</td></tr>
<tr><th>Steuerbares Vermögen</th><th class="num">146'220</th></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>Steuerberechnung</h2>
<table class="grid">
<tr><th>Steuer</th><th class="num">Bemessung CHF</th><th class="num">Einfache Steuer CHF</th><th class="num">Steueranlage</th><th class="num">Betrag CHF</th></tr>
<tr><td>Einkommenssteuer Kanton</td><td class="num">73'900</td><td class="num">4'118.60</td><td class="num">3.025</td><td class="num">12'458.80</td></tr>
<tr><td>Einkommenssteuer Gemeinde</td><td class="num">73'900</td><td class="num">4'118.60</td><td class="num">1.62</td><td class="num">6'672.15</td></tr>
<tr><td>Kirchensteuer</td><td class="num">73'900</td><td class="num">4'118.60</td><td class="num">0.207</td><td class="num">852.55</td></tr>
<tr><td>Vermögenssteuer Kanton und Gemeinde</td><td class="num">146'000</td><td class="num">72.20</td><td class="num">4.852</td><td class="num">350.30</td></tr>
<tr><td>Liegenschaftssteuer (1.2 Promille)</td><td class="num">512'000</td><td class="num">-</td><td class="num">-</td><td class="num">614.40</td></tr>
<tr><th colspan="4">Total Staats- und Gemeindesteuern 2025</th><th class="num">20'948.20</th></tr>
<tr><td colspan="4">Bezahlte Vorauszahlungen (Ratenrechnungen 2025)</td><td class="num">-19'500.00</td></tr>
<tr><td colspan="4">Ausgleichszins</td><td class="num">-14.60</td></tr>
<tr><th colspan="4">Restbetrag zu Ihren Lasten</th><th class="num">1'433.60</th></tr>
</table>
<p>Der Restbetrag ist innert 30 Tagen auf das Konto der Steuerverwaltung zu überweisen (Referenz-Nr.
42 01187 73250 00000 00014 33607). Die direkte Bundessteuer wird separat veranlagt.</p>
<h2>Rechtsmittelbelehrung</h2>
<p>Gegen diese Veranlagungsverfügung kann innert 30 Tagen seit Zustellung bei der Steuerverwaltung des Kantons
Aaretal schriftlich und begründet Einsprache erhoben werden (Art. 48 StHG). Die Einsprache muss einen Antrag
enthalten und die Beweismittel bezeichnen. Gegen den Einspracheentscheid ist der Rekurs an die kantonale
Steuerrekurskommission zulässig. Das Verfahren ist kostenlos, sofern es nicht mutwillig eingeleitet wird.</p>
<p>Die Steuerpflichtigen werden darauf hingewiesen, dass die Steuerverwaltung gemäss Art. 39 StHG zur
Verschwiegenheit verpflichtet ist (Steuergeheimnis).</p>
<p>Freundliche Grüsse</p>
<p>Steuerverwaltung des Kantons Aaretal<br>Rolf Lüthi, Steuerkommissär<br>rolf.luethi@stv-aaretal.example</p>
<p class="small">Kopie an: Treuhandbüro Kocher &amp; Partner GmbH, Frau Barbara Kocher, Bahnhofstrasse 5, 3294 Büren an der Aare
(Vertreterin gemäss Vollmacht vom 10.02.2026)</p>
`,
    },
    {
      scan: { rotate: 1.1, noise: 16, dpi: 150 },
      html: String.raw`
<h1>Lohnausweis 2025 (Formular 11)</h1>
<table class="facts">
<tr><th>A Lohnausweis</th><td>Jahr 2025, vom 01.01.2025 bis 31.12.2025</td></tr>
<tr><th>AHV-Nr.</th><td>756.4093.2716.58</td></tr>
<tr><th>Geburtsdatum</th><td>11.08.1978</td></tr>
<tr><th>Name, Vorname, Adresse</th><td>WIDMER DANIEL, Lindenhofweg 14, 3292 Busswil bei Büren</td></tr>
<tr><th>F Unentgeltliche Beförderung</th><td>nein</td></tr>
<tr><th>G Kantinenverpflegung</th><td>ja</td></tr>
</table>
<table class="grid">
<tr><th>Ziffer</th><th>Bezeichnung</th><th class="num">CHF</th></tr>
<tr><td>1</td><td>Lohn</td><td class="num">118'300</td></tr>
<tr><td>2.1</td><td>Gehaltsnebenleistungen: Verpflegung</td><td class="num">0</td></tr>
<tr><td>3</td><td>Unregelmässige Leistungen (Bonus)</td><td class="num">9'500</td></tr>
<tr><td>8</td><td>Bruttolohn total</td><td class="num">127'800</td></tr>
<tr><td>9</td><td>Beiträge AHV/IV/EO/ALV/NBUV</td><td class="num">-8'250</td></tr>
<tr><td>10.1</td><td>Berufliche Vorsorge, ordentliche Beiträge</td><td class="num">-7'070</td></tr>
<tr><td>11</td><td>Nettolohn</td><td class="num">112'480</td></tr>
<tr><td>13.1.1</td><td>Spesenvergütungen: Reisespesen effektiv</td><td class="num">1'860</td></tr>
<tr><td>15</td><td>Bemerkungen</td><td>Spesenreglement vom Kanton genehmigt am 14.05.2019</td></tr>
</table>
<p>I Ort und Datum: Lyss, 31.01.2026 &nbsp;&nbsp; Arbeitgeber: Präzisionsmechanik Seeland AG, Industriering 40,
3250 Lyss, UID CHE-318.407.552</p>
<div class="as-image stamp">PRÄZISIONSMECHANIK SEELAND AG<br>Personalabteilung - K. Hofstetter<br>Tel. 032 555 80 40</div>
`,
    },
  ],
  values: [
    { text: 'WIDMER-ZBINDEN DANIEL UND SANDRA', category: 'PERSON' },
    { text: 'Daniel und Sandra Widmer-Zbinden', category: 'PERSON' },
    { text: 'Daniel Widmer', category: 'PERSON' },
    { text: 'WIDMER DANIEL', category: 'PERSON' },
    { text: 'Sandra Widmer-Zbinden', category: 'PERSON' },
    { text: '420.118.773', category: 'ID' },
    { text: 'Lindenhofweg 14', category: 'ADDRESS' },
    { text: '3292 Busswil bei Büren', category: 'ADDRESS' },
    { text: '11.08.1978', category: 'DATE' },
    { text: '756.4093.2716.58', category: 'AHV' },
    { text: '25.02.1981', category: 'DATE' },
    { text: '756.7741.0638.24', category: 'AHV' },
    { text: 'Rolf Lüthi', category: 'PERSON' },
    { text: '032 555 64 18', category: 'PHONE' },
    { text: 'rolf.luethi@stv-aaretal.example', category: 'EMAIL' },
    { text: 'Jonas Widmer', category: 'PERSON' },
    { text: '04.06.2010', category: 'DATE' },
    { text: 'Lena Widmer', category: 'PERSON' },
    { text: '19.10.2013', category: 'DATE' },
    { text: 'Mia Widmer', category: 'PERSON' },
    { text: '02.03.2021', category: 'DATE' },
    { text: 'Kindertagesstätte Sonnenstrahl GmbH', category: 'COMPANY' },
    { text: 'Kita Sonnenstrahl GmbH', category: 'COMPANY' },
    { text: 'Präzisionsmechanik Seeland AG', category: 'COMPANY' },
    { text: 'PRÄZISIONSMECHANIK SEELAND AG', category: 'COMPANY' },
    { text: 'Industriering 40', category: 'ADDRESS' },
    { text: '3250 Lyss', category: 'ADDRESS' },
    { text: 'Apotheke am Bielersee AG', category: 'COMPANY' },
    { text: 'Seevorstadt 21', category: 'ADDRESS' },
    { text: '2502 Biel/Bienne', category: 'ADDRESS' },
    { text: 'Regionalbank Aaretal AG', category: 'COMPANY' },
    { text: '30-551.207.9', category: 'ACCOUNT' },
    { text: 'CH29 0636 3016 8820 4417 0', category: 'IBAN' },
    { text: 'Grundstück Lyss-Busswil Nr. 1187', category: 'ID' },
    { text: 'LV-88.40217', category: 'ID' },
    { text: '42 01187 73250 00000 00014 33607', category: 'ID' },
    { text: 'Treuhandbüro Kocher & Partner GmbH', category: 'COMPANY' },
    { text: 'Barbara Kocher', category: 'PERSON' },
    { text: 'Bahnhofstrasse 5', category: 'ADDRESS' },
    { text: '3294 Büren an der Aare', category: 'ADDRESS' },
    { text: 'CHE-318.407.552', category: 'ID' },
    { text: 'K. Hofstetter', category: 'PERSON' },
    { text: '032 555 80 40', category: 'PHONE' },
  ],
  keep: ['Art. 9 Abs. 2 lit. m StHG', 'Art. 33 Abs. 1 lit. d DBG', 'Eigenmietwert', 'Säule 3a', 'Zweiverdienerabzug',
    'Einsprache', 'Art. 48 StHG', 'Steuergeheimnis', 'satzbestimmendes Einkommen', 'Liegenschaftsunterhalt (Pauschale 20 %)'],
};
