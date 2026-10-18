const LOADS = [
  ['Dach', 'Ziegeleindeckung, Lattung, Unterdach', '0.65'],
  ['Dach', 'Sparren 80/200, Wärmedämmung 220 mm', '0.45'],
  ['Decke über EG', 'Stahlbetondecke d = 240 mm', '6.00'],
  ['Decke über EG', 'Unterlagsboden 80 mm, Trittschalldämmung', '1.90'],
  ['Decke über EG', 'Parkett, Gipsputz', '0.40'],
  ['Decke über EG', 'Zuschlag leichte Trennwände', '1.00'],
  ['Balkon', 'Platte d = 200 mm, Gefällsüberzug, Platten', '6.20'],
];

const ACTIONS = [
  ['Nutzlast Wohnen, Kategorie A', 'q_k', '2.0 kN/m²', 'SIA 261, Tab. 8'],
  ['Nutzlast Balkon', 'q_k', '3.0 kN/m²', 'SIA 261, Tab. 8'],
  ['Schnee, Referenzhöhe 520 m ü. M.', 's_k', '1.24 kN/m²', 'SIA 261, Ziff. 5.2'],
  ['Wind, Staudruck', 'q_p0', '0.90 kN/m²', 'SIA 261, Anhang E'],
  ['Erdbeben, Zone Z1b, Baugrundklasse C', 'a_gd', '0.8 m/s²', 'SIA 261, Ziff. 16'],
];

const DESIGN = [
  ['Pos. 1', 'Sparren 80/200 C24', '5.10 m', '6.9 kNm', '0.71'],
  ['Pos. 2', 'Firstpfette 160/280 GL24h', '4.80 m', '24.3 kNm', '0.82'],
  ['Pos. 3', 'Decke über EG, Feld 1', '5.60 m', '38.4 kNm/m', '0.88'],
  ['Pos. 4', 'Unterzug HEA 220 S235 über Wohnzimmer', '6.20 m', '112.6 kNm', '0.93'],
  ['Pos. 5', 'Balkonplatte, Kragarm', '1.80 m', '-27.9 kNm/m', '0.79'],
  ['Pos. 6', 'Stütze Rundrohr 139.7 x 6.3', '2.60 m', 'N = 286 kN', '0.64'],
  ['Pos. 7', 'Streifenfundament 600/300', '-', 'σ = 182 kN/m²', '0.91'],
];

const table = (head, rows) => `<table class="grid">
<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>`;

export default {
  id: 'engineering-de-01',
  domain: 'engineering',
  language: 'de',
  title: 'Statisches Gutachten Einfamilienhaus, Umbau und Anbau',
  header: 'STATISCHES GUTACHTEN | BAUHERRSCHAFT ZIMMERLI THOMAS UND SANDRA | PARZELLE NR. 2187',
  footer: 'Brunner + Lüthi Bauingenieure AG - Projekt 26-114 - EFH Zimmerli, Im Grund 14, Volketswil',
  parts: [
    {
      html: String.raw`
<div class="as-image letterhead">Brunner + Lüthi Bauingenieure AG | Industriestrasse 31 | 8610 Uster | Tel. 044 555 92 60</div>
<p>Thomas und Sandra Zimmerli<br>Im Grund 14<br>8604 Volketswil</p>
<p class="right">Uster, 28. Mai 2026</p>
<h1>Statisches Gutachten</h1>
<p><b>Umbau und Anbau Einfamilienhaus, Im Grund 14, 8604 Volketswil</b></p>
<table class="facts">
<tr><th>Bauherrschaft</th><td>Thomas Zimmerli und Sandra Zimmerli-Baumgartner</td></tr>
<tr><th>Grundstück</th><td>Parzelle Nr. 2187, Grundbuch Volketswil, Gebäudeversicherung Vers.-Nr. 4417-0093</td></tr>
<tr><th>Architekt</th><td>Atelier Hohl Architektur GmbH, Daniela Hohl, daniela.hohl@atelier-hohl.example</td></tr>
<tr><th>Bauingenieur</th><td>Patrick Lüthi, dipl. Bauingenieur, Brunner + Lüthi Bauingenieure AG</td></tr>
<tr><th>Projekt-Nr.</th><td>26-114</td></tr>
<tr><th>Baugesuch</th><td>BG 2026-0418, Gemeinde Volketswil</td></tr>
</table>
<h2>1 Auftrag und Grundlagen</h2>
<p>Die Bauherrschaft, Herr und Frau Zimmerli, beabsichtigt, das bestehende Einfamilienhaus (Baujahr 1974) um
einen eingeschossigen Anbau mit Flachdach zu erweitern und im Erdgeschoss eine tragende Wand zwischen Küche
und Wohnzimmer zu entfernen. Wir wurden mit der Beurteilung der Tragsicherheit und Gebrauchstauglichkeit sowie
mit der Bemessung der neuen Bauteile beauftragt.</p>
<p>Grundlagen: Normen SIA 260 (Grundlagen der Projektierung von Tragwerken), SIA 261 (Einwirkungen auf
Tragwerke), SIA 262 (Betonbau), SIA 263 (Stahlbau), SIA 265 (Holzbau), SIA 267 (Geotechnik) sowie
SIA 269/8 (Erhaltung von Tragwerken, Erdbeben); Pläne Atelier Hohl vom 12.05.2026; Augenschein vor Ort am
15.05.2026 mit Herrn Thomas Zimmerli; geologisches Gutachten Geotest Ost Nr. 26-0371.</p>
<h2>2 Tragwerk</h2>
<p>Das bestehende Gebäude ist ein Massivbau mit Aussenwänden aus Backstein (Wandstärke 300 mm), Stahlbetondecken
über Keller und Erdgeschoss und einem Satteldach mit Sparren und Firstpfette. Die Fundation besteht aus
Streifenfundamenten auf siltigem Kies. Der Anbau wird als Holzrahmenbau auf einer Bodenplatte erstellt.
Die Auswechslung der Wand erfolgt mit einem Stahlunterzug HEA 220 auf zwei neuen Stützen.</p>
<h2>3 Einwirkungen</h2>
<h3>3.1 Ständige Lasten</h3>
${table(['Bauteil', 'Aufbau', 'g_k (kN/m²)'], LOADS)}
<h3>3.2 Veränderliche Einwirkungen</h3>
${table(['Einwirkung', 'Symbol', 'Wert', 'Grundlage'], ACTIONS)}
<p>Die Schneelast auf dem Dach ergibt sich aus</p>
<tex display>q_{k} = \mu_{i} \cdot C_{e} \cdot C_{t} \cdot s_{k} = 0.8 \cdot 1.0 \cdot 1.0 \cdot 1.24 = 0.99\,\mathrm{kN/m^{2}}</tex>
<p>mit dem charakteristischen Wert auf Geländehöhe</p>
<tex display>s_{k} = \left[1 + \left(\frac{h_{0}}{350}\right)^{2}\right] \cdot 0.4\,\mathrm{kN/m^{2}} \geq 0.9\,\mathrm{kN/m^{2}}</tex>
`,
    },
    {
      html: String.raw`
<h2>4 Bemessung</h2>
<h3>4.1 Bemessungssituation und Lastkombination</h3>
<p>Für die Tragsicherheit (Typ 2) wird die Grundkombination nach SIA 260, Gleichung (17), verwendet:</p>
<tex display>E_{d} = E\left\{ \gamma_{G} G_{k}, \; \gamma_{Q} Q_{k1}, \; \sum_{i > 1} \psi_{0i} Q_{ki} \right\}</tex>
<tex display>q_{d} = \gamma_{G} \, g_{k} + \gamma_{Q} \, q_{k} = 1.35 \cdot 9.30 + 1.5 \cdot 2.0 = 15.56\,\mathrm{kN/m^{2}}</tex>
<p>Für die Gebrauchstauglichkeit wird die quasi-ständige Kombination
<tex>E_{d,qs} = G_{k} + \sum \psi_{2i} Q_{ki}</tex> mit <tex>\psi_{2} = 0.3</tex> (Wohnen) verwendet.</p>
<h3>4.2 Pos. 4: Unterzug HEA 220 über Wohnzimmer</h3>
<p>Einfacher Balken mit Spannweite <tex>l = 6.20\,\mathrm{m}</tex>, Einzugsbreite 3.80 m, Linienlast aus Decke und
Wandauflast <tex>q_{d} = 23.4\,\mathrm{kN/m}</tex>:</p>
<tex display>M_{d} = \frac{q_{d} \, l^{2}}{8} = \frac{23.4 \cdot 6.20^{2}}{8} = 112.4\,\mathrm{kNm}</tex>
<tex display>V_{d} = \frac{q_{d} \, l}{2} = 72.5\,\mathrm{kN}</tex>
<p>Biegewiderstand mit dem plastischen Widerstandsmoment <tex>W_{pl,y} = 568 \cdot 10^{3}\,\mathrm{mm^{3}}</tex>:</p>
<tex display>M_{Rd} = \frac{f_{y} \, W_{pl,y}}{\gamma_{M1}} = \frac{235 \cdot 568 \cdot 10^{3}}{1.05} \cdot 10^{-6} = 127.1\,\mathrm{kNm}</tex>
<tex display>\frac{M_{d}}{M_{Rd}} = \frac{112.4}{127.1} = 0.88 \leq 1.0</tex>
<p>Unter Berücksichtigung des Biegedrillknickens (Abminderungsfaktor <tex>\chi_{LT} = 0.94</tex>, Druckgurt durch die
Decke nicht durchgehend gehalten) ergibt sich ein Ausnutzungsgrad von 0.93.</p>
<p>Durchbiegung unter quasi-ständiger Last <tex>q_{qs} = 14.9\,\mathrm{kN/m}</tex>, mit
<tex>E = 210\,000\,\mathrm{N/mm^{2}}</tex> und <tex>I_{y} = 5410 \cdot 10^{4}\,\mathrm{mm^{4}}</tex>:</p>
<tex display>w = \frac{5}{384} \cdot \frac{q_{qs} \, l^{4}}{E \, I_{y}} = 25.2\,\mathrm{mm} \leq \frac{l}{200} = 31\,\mathrm{mm}</tex>
<h3>4.3 Pos. 3: Stahlbetondecke über EG</h3>
<p>Beton C25/30, Betonstahl B500B, statische Höhe <tex>d = 210\,\mathrm{mm}</tex>. Erforderliche Biegebewehrung
mit dem Hebelarm <tex>z \approx 0.9\,d</tex>:</p>
<tex display>A_{s,erf} = \frac{m_{d}}{z \, f_{sd}} = \frac{38.4 \cdot 10^{6}}{0.9 \cdot 210 \cdot 435} = 467\,\mathrm{mm^{2}/m}</tex>
<p>Gewählt: Ø10 s = 150 mm, <tex>A_{s,vorh} = 524\,\mathrm{mm^{2}/m}</tex>. Kontrolle der Druckzonenhöhe:</p>
<tex display>x = \frac{A_{s} \, f_{sd}}{0.85 \, b \, f_{cd}} = \frac{524 \cdot 435}{0.85 \cdot 1000 \cdot 16.5} = 16.3\,\mathrm{mm}, \qquad \frac{x}{d} = 0.08 \leq 0.35</tex>
`,
    },
    {
      html: String.raw`
<h3>4.4 Pos. 5: Balkonplatte als Kragarm</h3>
<p>Auskragung <tex>l_{k} = 1.80\,\mathrm{m}</tex>, Geländerlast <tex>Q_{k} = 0.8\,\mathrm{kN/m}</tex> in 1.0 m Höhe:</p>
<tex display>m_{d} = -\left(\frac{q_{d} \, l_{k}^{2}}{2} + 1.5 \cdot Q_{k} \cdot 1.0\right) = -\left(\frac{12.87 \cdot 1.80^{2}}{2} + 1.2\right) = -22.0\,\mathrm{kNm/m}</tex>
<p>Zusätzlich wird ein wärmegedämmtes Kragplattenanschlusselement Typ K-50 eingesetzt, dessen Bemessungswert
<tex>m_{Rd} = 28.5\,\mathrm{kNm/m}</tex> beträgt.</p>
<h3>4.5 Pos. 6: Stütze</h3>
<p>Knicklänge <tex>l_{cr} = 2.60\,\mathrm{m}</tex>, Schlankheit</p>
<tex display>\bar{\lambda}_{k} = \frac{l_{cr}}{i \, \pi} \sqrt{\frac{f_{y}}{E}} = \frac{2600}{47.2 \cdot \pi} \sqrt{\frac{235}{210\,000}} = 0.59</tex>
<tex display>N_{K,Rd} = \chi_{k} \frac{f_{y} A}{\gamma_{M1}} = 0.84 \cdot \frac{235 \cdot 2640}{1.05} \cdot 10^{-3} = 496\,\mathrm{kN} \geq N_{d} = 286\,\mathrm{kN}</tex>
<h3>4.6 Pos. 7: Fundation</h3>
<p>Die Stützenlast wird über ein neues Einzelfundament 1.20 x 1.20 m abgetragen. Bodenpressung:</p>
<tex display>\sigma_{d} = \frac{N_{d} + G_{F}}{B \cdot L} = \frac{286 + 21.6}{1.20 \cdot 1.20} = 214\,\mathrm{kN/m^{2}} \leq \sigma_{Rd} = 250\,\mathrm{kN/m^{2}}</tex>
<h3>4.7 Erdbeben</h3>
<p>Die Erdbebensicherheit des bestehenden Gebäudes wird nach SIA 269/8 überprüft. Mit der
Ersatzkraftmethode beträgt die horizontale Ersatzkraft</p>
<tex display>F_{d} = S_{d}(T_{1}) \cdot \sum_{j} \frac{G_{k,j} + \psi_{2} Q_{k,j}}{g}, \qquad S_{d} = 2.5 \, \gamma_{f} \frac{a_{gd}}{g} \frac{S}{q}</tex>
<p>Der Erfüllungsfaktor beträgt <tex>\alpha_{eff} = 0.82</tex>; nach SIA 269/8 sind keine Ertüchtigungsmassnahmen
verhältnismässig, sofern die zwei Backsteinwände in Achse B unverändert bleiben.</p>
<h2>5 Zusammenstellung der Nachweise</h2>
${table(['Position', 'Bauteil', 'Spannweite', 'Bemessungswert', 'Ausnutzung'], DESIGN)}
`,
    },
    {
      html: String.raw`
<h2>6 Schlussfolgerungen und Auflagen</h2>
<ol>
<li>Die Entfernung der Wand zwischen Küche und Wohnzimmer ist mit dem Unterzug HEA 220 (Pos. 4) statisch
möglich. Während der Bauphase ist die Decke über EG mit mindestens vier Spriessen (je 20 kN) abzustützen.</li>
<li>Die Backsteinwände in Achse B dürfen nicht geschwächt werden (keine Schlitze tiefer als 30 mm).</li>
<li>Der Bewehrungsplan der Bodenplatte des Anbaus und die Werkpläne Stahlbau sind vor Ausführung dem
Bauingenieur zur Freigabe vorzulegen.</li>
<li>Die Gebrauchstauglichkeit des Unterzugs ist mit einer Überhöhung von 15 mm sicherzustellen.</li>
<li>Die Nutzungsvereinbarung und Projektbasis (SIA 260, Anhang A) ist von der Bauherrschaft zu unterzeichnen.</li>
</ol>
<p>Für Rückfragen steht Ihnen der Unterzeichnende gerne zur Verfügung (patrick.luethi@brunner-luethi.example,
Direktwahl 044 555 92 64). Die Bauherrschaft erreicht die Bauleitung unter 079 555 40 18 (Sandra Zimmerli).</p>
<p>Uster, 28. Mai 2026</p>
<p>Brunner + Lüthi Bauingenieure AG</p>
<div class="as-image stamp">BRUNNER + LÜTHI BAUINGENIEURE AG - USTER - geprüft P. Lüthi, dipl. Bauing. FH/SIA - 28.05.2026</div>
<p>Verteiler: Bauherrschaft Th. und S. Zimmerli; Atelier Hohl Architektur GmbH; Bauamt Volketswil (zum Baugesuch
BG 2026-0418)</p>
`,
    },
  ],
  values: [
    { text: 'ZIMMERLI THOMAS UND SANDRA', category: 'PERSON' },
    { text: 'Thomas und Sandra Zimmerli', category: 'PERSON' },
    { text: 'Thomas Zimmerli', category: 'PERSON' },
    { text: 'Sandra Zimmerli-Baumgartner', category: 'PERSON' },
    { text: 'Sandra Zimmerli', category: 'PERSON' },
    { text: 'Th. und S. Zimmerli', category: 'PERSON' },
    { text: 'EFH Zimmerli', category: 'PERSON' },
    { text: 'Herr und Frau Zimmerli', category: 'PERSON' },
    { text: 'Im Grund 14', category: 'ADDRESS' },
    { text: '8604 Volketswil', category: 'ADDRESS' },
    { text: 'Parzelle Nr. 2187', category: 'ID' },
    { text: 'PARZELLE NR. 2187', category: 'ID' },
    { text: 'Vers.-Nr. 4417-0093', category: 'ID' },
    { text: 'BG 2026-0418', category: 'ID' },
    { text: '079 555 40 18', category: 'PHONE' },
    { text: 'Daniela Hohl', category: 'PERSON' },
    { text: 'daniela.hohl@atelier-hohl.example', category: 'EMAIL' },
    { text: 'Atelier Hohl Architektur GmbH', category: 'COMPANY' },
    { text: 'Atelier Hohl', category: 'COMPANY' },
    { text: 'Patrick Lüthi', category: 'PERSON' },
    { text: 'P. Lüthi', category: 'PERSON' },
    { text: 'patrick.luethi@brunner-luethi.example', category: 'EMAIL' },
    { text: '044 555 92 64', category: 'PHONE' },
    { text: 'Brunner + Lüthi Bauingenieure AG', category: 'COMPANY' },
    { text: 'BRUNNER + LÜTHI BAUINGENIEURE AG', category: 'COMPANY' },
    { text: 'Industriestrasse 31', category: 'ADDRESS' },
    { text: '8610 Uster', category: 'ADDRESS' },
    { text: '044 555 92 60', category: 'PHONE' },
    { text: 'Geotest Ost', category: 'COMPANY' },
    { text: '26-114', category: 'ID' },
  ],
  keep: ['SIA 261', 'SIA 269/8', 'HEA 220', 'C25/30', 'B500B', 'Biegedrillknickens', 'Ersatzkraftmethode',
    'Streifenfundamenten', 'Kragarm'],
};
