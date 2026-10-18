const faxLine = (page) =>
  `<p class="small">09.10.2026 14:32 &nbsp; VON: 071 555 18 40 RHEUMAPRAXIS KAELIN &nbsp; AN: 071 555 30 99 &nbsp; S. ${page}/2</p>`;

export default {
  id: 'medicine-de-03',
  domain: 'medicine',
  language: 'de',
  title: 'Kostengutsprache-Gesuch Upadacitinib (Fax)',
  parts: [
    {
      scan: { rotate: 1.2, noise: 17, dpi: 150 },
      html: String.raw`
${faxLine(1)}
<p><b>Rheumapraxis Kälin</b><br>Dr. med. Andreas Kälin, Facharzt FMH Rheumatologie und Innere Medizin<br>Poststrasse 5, 9100 Herisau<br>Tel. 071 555 18 41, Fax 071 555 18 40, praxis@rheuma-kaelin.example<br>ZSR-Nr. K 4471.22, GLN 7601000555889</p>
<table class="facts">
<tr><th>An</th><td>Ostschweizer Krankenversicherung AG<br>Vertrauensärztlicher Dienst<br>Postfach 1180<br>9001 St. Gallen</td></tr>
<tr><th>Fax</th><td>071 555 30 99</td></tr>
<tr><th>Datum</th><td>9. Oktober 2026</td></tr>
<tr><th>Seiten</th><td>2 (inkl. dieser)</td></tr>
</table>
<h1>Gesuch um Kostengutsprache</h1>
<table class="grid">
<tr><th>Versicherte</th><td>Frau Ursula Gämperli-Frei</td></tr>
<tr><th>Geburtsdatum</th><td>30.11.1967</td></tr>
<tr><th>Adresse</th><td>Hinterdorfstrasse 12, 9104 Waldstatt</td></tr>
<tr><th>Versicherten-Nr.</th><td>80756-0012-4471</td></tr>
<tr><th>AHV-Nr.</th><td>756.8833.0294.57</td></tr>
<tr><th>Versicherungsmodell</th><td>Hausarztmodell, Zuweisung durch Dr. med. Beatrice Sonderegger, Teufen</td></tr>
</table>
<h2>Beantragte Therapie</h2>
<p>Upadacitinib (Rinvoq) 15 mg, 1 Retardtablette täglich peroral, Beginn per 20.10.2026, vorerst für 12 Monate,
in Kombination mit Methotrexat 15 mg 1x wöchentlich s.c. und Folsäure 5 mg 1x wöchentlich.</p>
<p>Das Präparat ist in der Spezialitätenliste (SL) mit Limitatio aufgeführt. Die Vergütung setzt eine vorgängige
Kostengutsprache durch den Krankenversicherer nach Konsultation des Vertrauensarztes voraus.</p>
<h2>Diagnose</h2>
<ol>
<li>Seropositive rheumatoide Arthritis (RF 148 U/ml, Anti-CCP > 340 U/ml), ED 03/2021, erosiv (MCP II und III
beidseits, MTP V rechts)</li>
<li>Status nach Versagen von zwei konventionellen DMARD und einem TNF-alpha-Blocker</li>
<li>Osteopenie (DXA 06/2026, T-Score LWS -1.8)</li>
</ol>
`,
    },
    {
      scan: { rotate: 1.3, noise: 19, dpi: 150 },
      html: String.raw`
${faxLine(2)}
<p class="small">Betrifft: Ursula Gämperli-Frei, geb. 30.11.1967, Vers.-Nr. 80756-0012-4471</p>
<h2>Bisherige Therapien</h2>
<table class="grid">
<tr><th>Medikament</th><th>Dosis</th><th>Dauer</th><th>Grund des Absetzens</th></tr>
<tr><td>Methotrexat</td><td>20 mg 1x/Woche s.c.</td><td>04/2021 - 12/2022</td><td>ungenügendes Ansprechen, Transaminasen 3x ULN</td></tr>
<tr><td>Leflunomid</td><td>20 mg/Tag</td><td>01/2023 - 09/2023</td><td>Diarrhoe, arterielle Hypertonie</td></tr>
<tr><td>Adalimumab</td><td>40 mg alle 2 Wochen s.c.</td><td>10/2023 - 08/2026</td><td>sekundäres Wirkversagen, Anti-Drug-Antikörper positiv</td></tr>
<tr><td>Prednison</td><td>7.5 mg/Tag</td><td>seit 08/2026</td><td>Überbrückung, Ziel Ausschleichen</td></tr>
</table>
<h2>Aktueller Befund</h2>
<p>Untersuchung vom 7.10.2026: 9 geschwollene und 12 druckdolente Gelenke (28-Gelenk-Index), Morgensteifigkeit
90 Minuten, CRP 31 mg/l, BSR 48 mm/h. DAS28-CRP 5.1, HAQ-DI 1.6, entsprechend hoher Krankheitsaktivität.
Die Patientin ist als Detailhandelsangestellte zu 50 % arbeitsunfähig.</p>
<p>Vor Therapiebeginn: Quantiferon negativ, Hepatitis-B- und -C-Serologie negativ, Herpes-zoster-Impfung (Shingrix)
erfolgt am 15.09.2026, kein venöses Thromboembolie-Ereignis in der Anamnese, Nichtraucherin, keine kardiovaskulären
Ereignisse. Die Kriterien der Limitatio sind damit erfüllt; die Therapie ist wirksam, zweckmässig und wirtschaftlich
im Sinne von Art. 32 KVG.</p>
<p>Wir bitten Sie um Kostengutsprache und um Zustellung Ihres Entscheides an unsere Praxis. Für Rückfragen stehe
ich Ihnen gerne zur Verfügung.</p>
<p>Freundliche Grüsse</p>
<div class="as-image signature">A. Kälin</div>
<p>Dr. med. Andreas Kälin</p>
<p class="small">Beilagen: Röntgenbefund Hände und Füsse vom 02.06.2026, Laborbericht vom 07.10.2026.
Kopie: Dr. med. Beatrice Sonderegger, Teufen; Frau U. Gämperli-Frei.</p>
<p class="small">Dieses Fax enthält vertrauliche medizinische Daten. Falls Sie nicht der richtige Empfänger sind,
benachrichtigen Sie uns bitte unter 071 555 18 41 und vernichten Sie das Dokument.</p>
`,
    },
  ],
  values: [
    { text: '071 555 18 40', category: 'PHONE' },
    { text: 'RHEUMAPRAXIS KAELIN', category: 'COMPANY' },
    { text: 'Rheumapraxis Kälin', category: 'COMPANY' },
    { text: '071 555 30 99', category: 'PHONE' },
    { text: 'Andreas Kälin', category: 'PERSON' },
    { text: 'A. Kälin', category: 'PERSON' },
    { text: 'Poststrasse 5', category: 'ADDRESS' },
    { text: '9100 Herisau', category: 'ADDRESS' },
    { text: '071 555 18 41', category: 'PHONE' },
    { text: 'praxis@rheuma-kaelin.example', category: 'EMAIL' },
    { text: 'K 4471.22', category: 'ID' },
    { text: '7601000555889', category: 'ID' },
    { text: 'Ostschweizer Krankenversicherung AG', category: 'COMPANY' },
    { text: 'Postfach 1180', category: 'ADDRESS' },
    { text: 'Ursula Gämperli-Frei', category: 'PERSON' },
    { text: 'U. Gämperli-Frei', category: 'PERSON' },
    { text: '30.11.1967', category: 'DATE' },
    { text: 'Hinterdorfstrasse 12', category: 'ADDRESS' },
    { text: '9104 Waldstatt', category: 'ADDRESS' },
    { text: '80756-0012-4471', category: 'ID' },
    { text: '756.8833.0294.57', category: 'AHV' },
    { text: 'Beatrice Sonderegger', category: 'PERSON' },
  ],
  keep: ['Upadacitinib (Rinvoq) 15 mg', 'Methotrexat 15 mg', 'Seropositive rheumatoide Arthritis', 'DAS28-CRP 5.1',
    'Adalimumab', '40 mg alle 2 Wochen s.c.', 'Leflunomid', 'Spezialitätenliste (SL)', 'Art. 32 KVG', 'Limitatio',
    'Quantiferon negativ'],
};
