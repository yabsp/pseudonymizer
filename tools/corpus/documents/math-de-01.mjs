const POINTS = [
  ['1', 'Lineare Gleichungssysteme (Gauss-Verfahren)', '8', '7'],
  ['2', 'Determinanten', '6', '6'],
  ['3', 'Eigenwerte und Eigenvektoren', '10', '7.5'],
  ['4', 'Diagonalisierung', '8', '5'],
  ['5', 'Orthogonale Projektion, Gram-Schmidt', '8', '6.5'],
  ['Total', '', '40', '32'],
];

export default {
  id: 'math-de-01',
  domain: 'math',
  language: 'de',
  title: 'Prüfung Lineare Algebra I, korrigiert',
  header: 'HOCHSCHULE LIMMAT | D-MATH | Basisprüfung Lineare Algebra I | WÜTHRICH LARA',
  footer: 'Korrigierte Prüfung L. Wüthrich - Matrikel-Nr. 21-934-117 - nur zur Einsicht',
  parts: [
    {
      html: String.raw`
<p class="small">Hochschule Limmat, Departement Mathematik, Rämistrasse 210, 8006 Zürich</p>
<h1>Basisprüfung Lineare Algebra I</h1>
<p>Sessionsprüfung Sommer 2026, schriftlich, 120 Minuten. Erlaubte Hilfsmittel: eine handgeschriebene
Zusammenfassung (2 A4-Seiten), kein Taschenrechner.</p>
<table class="facts">
<tr><th>Name, Vorname</th><td>Wüthrich Lara</td></tr>
<tr><th>Matrikel-Nr.</th><td>21-934-117</td></tr>
<tr><th>Studiengang</th><td>BSc Informatik, 2. Semester</td></tr>
<tr><th>E-Mail</th><td>lara.wuethrich@student.hs-limmat.example</td></tr>
<tr><th>Prüfungsdatum</th><td>18.08.2026, Raum HG E 7, Platz 143</td></tr>
<tr><th>Examinatorin</th><td>Beatrice Haldimann</td></tr>
<tr><th>Korrektur</th><td>Matthias Rüegg (Aufgaben 1-3), Sina Oberholzer (Aufgaben 4-5)</td></tr>
</table>
<h2>Punkteübersicht</h2>
<table class="grid">
<tr><th>Aufgabe</th><th>Thema</th><th>Max.</th><th>Erreicht</th></tr>
${POINTS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<p>Note: <b>5.0</b> (Notenskala <tex>N = 1 + 5 \cdot \frac{P}{P_{\max}}</tex>, gerundet auf Viertelnoten; mit
<tex>P = 32</tex> und <tex>P_{\max} = 40</tex> ergibt sich <tex>N = 5.0</tex>).</p>
<div class="as-image stamp">HOCHSCHULE LIMMAT - Prüfungsamt - EINGANG 21.08.2026 - Visum M. Rüegg</div>

<h2>Aufgabe 1 (8 Punkte)</h2>
<p>Bestimmen Sie in Abhängigkeit des Parameters <tex>a \in \mathbb{R}</tex> die Lösungsmenge des Systems
<tex>A\mathbf{x} = \mathbf{b}</tex> mit</p>
<tex display>A = \begin{pmatrix} 1 & 2 & -1 \\ 2 & 5 & 1 \\ -1 & a & 4 \end{pmatrix}, \quad \mathbf{b} = \begin{pmatrix} 3 \\ 8 \\ a+1 \end{pmatrix}</tex>
<p><b>Lösung der Kandidatin:</b> Nach den Zeilenoperationen <tex>Z_2 \to Z_2 - 2Z_1</tex> und
<tex>Z_3 \to Z_3 + Z_1</tex> erhält man die Zeilenstufenform</p>
<tex display>\left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 0 & 1 & 3 & 2 \\ 0 & 0 & 3 - 3(a+2) & a + 4 - 2(a+2) \end{array}\right)</tex>
<p>Für <tex>a \neq -1</tex> ist das System eindeutig lösbar, für <tex>a = -1</tex> gilt
<tex>\operatorname{rang}(A) = 2 = \operatorname{rang}(A|\mathbf{b})</tex>, also unendlich viele Lösungen.</p>
<p class="note"><b>Kommentar M. Rüegg:</b> Fallunterscheidung korrekt, aber im Fall <tex>a = -1</tex> fehlt die
Parametrisierung <tex>\mathbf{x} = (-1, 2, 0)^{T} + t\,(7, -3, 1)^{T}</tex>, <tex>t \in \mathbb{R}</tex>. -1 Punkt.</p>

<div class="page-break"></div>
<h2>Aufgabe 2 (6 Punkte)</h2>
<p>Berechnen Sie die Determinante der Matrix</p>
<tex display>B = \begin{pmatrix} 2 & 0 & 1 & 3 \\ 1 & -1 & 0 & 2 \\ 0 & 3 & 1 & 1 \\ 4 & 1 & 2 & 0 \end{pmatrix}</tex>
<p>und entscheiden Sie, ob <tex>B</tex> invertierbar ist.</p>
<p><b>Lösung der Kandidatin:</b> Entwicklung nach der ersten Zeile (Laplace'scher Entwicklungssatz):</p>
<tex display>\det B = \sum_{j=1}^{4} (-1)^{1+j}\, b_{1j}\, \det B_{1j}</tex>
<tex display>\det B = 2 \cdot \det\begin{pmatrix} -1 & 0 & 2 \\ 3 & 1 & 1 \\ 1 & 2 & 0 \end{pmatrix} + 1 \cdot \det\begin{pmatrix} 1 & -1 & 2 \\ 0 & 3 & 1 \\ 4 & 1 & 0 \end{pmatrix} - 3 \cdot \det\begin{pmatrix} 1 & -1 & 0 \\ 0 & 3 & 1 \\ 4 & 1 & 2 \end{pmatrix}</tex>
<tex display>\det B = 2 \cdot 12 + 1 \cdot (-27) - 3 \cdot 2 = -9</tex>
<p>Da <tex>\det B = -9 \neq 0</tex>, ist <tex>B</tex> invertierbar, und es gilt
<tex>\det(B^{-1}) = \frac{1}{\det B} = -\frac{1}{9}</tex>.</p>
<p class="note"><b>Kommentar M. Rüegg:</b> Vollständig und sauber begründet. Volle Punktzahl.</p>

<h2>Aufgabe 3 (10 Punkte)</h2>
<p>Gegeben ist die symmetrische Matrix</p>
<tex display>C = \begin{pmatrix} 4 & 1 & 1 \\ 1 & 4 & 1 \\ 1 & 1 & 4 \end{pmatrix}</tex>
<p>(a) Bestimmen Sie das charakteristische Polynom <tex>\chi_C(\lambda) = \det(C - \lambda I_3)</tex>.</p>
<p><b>Lösung:</b></p>
<tex display>\chi_C(\lambda) = (4-\lambda)^{3} - 3(4-\lambda) + 2 = -(\lambda - 3)^{2}(\lambda - 6)</tex>
<p>(b) Eigenwerte: <tex>\lambda_1 = \lambda_2 = 3</tex> (algebraische Vielfachheit 2) und <tex>\lambda_3 = 6</tex>.
Kontrolle mit der Spur: <tex>\operatorname{Spur}(C) = 12 = 3 + 3 + 6</tex> und
<tex>\det C = 54 = 3 \cdot 3 \cdot 6</tex>.</p>
<p>(c) Eigenräume:</p>
<tex display>E_{3} = \ker(C - 3I) = \operatorname{span}\left\{ \begin{pmatrix} 1 \\ -1 \\ 0 \end{pmatrix}, \begin{pmatrix} 1 \\ 0 \\ -1 \end{pmatrix} \right\}, \qquad E_{6} = \operatorname{span}\left\{ \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix} \right\}</tex>
<p class="note"><b>Kommentar M. Rüegg:</b> (a) und (b) korrekt. In (c) hat Frau Wüthrich für <tex>E_6</tex> den
Vektor <tex>(1, 1, -1)^{T}</tex> angegeben; die Probe <tex>C\mathbf{v} = 6\mathbf{v}</tex> hätte den Fehler
gezeigt. -2.5 Punkte. Rücksprache bei Fragen: matthias.rueegg@math.hs-limmat.example.</p>

<div class="page-break"></div>
<h2>Aufgabe 4 (8 Punkte)</h2>
<p>Diagonalisieren Sie <tex>C</tex> orthogonal, d.h. finden Sie eine orthogonale Matrix <tex>Q</tex> und eine
Diagonalmatrix <tex>D</tex> mit <tex>Q^{T} C Q = D</tex>, und berechnen Sie <tex>C^{n}</tex> für
<tex>n \in \mathbb{N}</tex>.</p>
<p><b>Musterlösung:</b></p>
<tex display>Q = \begin{pmatrix} \frac{1}{\sqrt{2}} & \frac{1}{\sqrt{6}} & \frac{1}{\sqrt{3}} \\ -\frac{1}{\sqrt{2}} & \frac{1}{\sqrt{6}} & \frac{1}{\sqrt{3}} \\ 0 & -\frac{2}{\sqrt{6}} & \frac{1}{\sqrt{3}} \end{pmatrix}, \qquad D = \begin{pmatrix} 3 & 0 & 0 \\ 0 & 3 & 0 \\ 0 & 0 & 6 \end{pmatrix}</tex>
<tex display>C^{n} = Q D^{n} Q^{T} = 3^{n} I_3 + \frac{6^{n} - 3^{n}}{3} \begin{pmatrix} 1 & 1 & 1 \\ 1 & 1 & 1 \\ 1 & 1 & 1 \end{pmatrix}</tex>
<p class="note"><b>Kommentar S. Oberholzer:</b> Die Kandidatin hat die Eigenvektoren zu <tex>\lambda = 3</tex> nicht
orthonormalisiert, deshalb gilt in ihrer Lösung <tex>Q^{T}Q \neq I</tex>. Ansatz für <tex>C^{n}</tex> richtig. -3 Punkte.</p>

<h2>Aufgabe 5 (8 Punkte)</h2>
<p>Im <tex>\mathbb{R}^{3}</tex> mit dem Standardskalarprodukt <tex>\langle \mathbf{u}, \mathbf{v} \rangle = \sum_{i=1}^{3} u_i v_i</tex>
seien <tex>\mathbf{v}_1 = (1, 1, 0)^{T}</tex> und <tex>\mathbf{v}_2 = (1, 0, 1)^{T}</tex> gegeben.</p>
<p>(a) Orthonormalisieren Sie mit dem Gram-Schmidt-Verfahren:</p>
<tex display>\mathbf{e}_1 = \frac{\mathbf{v}_1}{\lVert \mathbf{v}_1 \rVert} = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}</tex>
<tex display>\mathbf{e}_2 = \frac{\mathbf{v}_2 - \langle \mathbf{v}_2, \mathbf{e}_1 \rangle \mathbf{e}_1}{\lVert \mathbf{v}_2 - \langle \mathbf{v}_2, \mathbf{e}_1 \rangle \mathbf{e}_1 \rVert} = \frac{1}{\sqrt{6}} \begin{pmatrix} 1 \\ -1 \\ 2 \end{pmatrix}</tex>
<p>(b) Die orthogonale Projektion von <tex>\mathbf{w} = (3, 1, 2)^{T}</tex> auf <tex>U = \operatorname{span}\{\mathbf{v}_1, \mathbf{v}_2\}</tex>:</p>
<tex display>P_U(\mathbf{w}) = \sum_{k=1}^{2} \langle \mathbf{w}, \mathbf{e}_k \rangle \, \mathbf{e}_k = \frac{1}{3} \begin{pmatrix} 8 \\ 4 \\ 4 \end{pmatrix}</tex>
<p>(c) Abstand: <tex>d(\mathbf{w}, U) = \lVert \mathbf{w} - P_U(\mathbf{w}) \rVert = \frac{1}{\sqrt{3}}</tex>.</p>
<p class="note"><b>Kommentar S. Oberholzer:</b> (a) und (b) korrekt, in (c) Rechenfehler beim Betrag. -1.5 Punkte.</p>
<h2>Einsichtnahme</h2>
<p>Die Prüfungseinsicht findet am 02.09.2026 statt. Anmeldung bis 28.08.2026 bei Sina Oberholzer
(sina.oberholzer@math.hs-limmat.example, Tel. 044 555 63 18). Einsprachen gegen die Bewertung richten sich nach
der Allgemeinen Studienordnung der Hochschule Limmat (Art. 37 ASO).</p>
<p>Zürich, 21.08.2026<br>Beatrice Haldimann, Examinatorin</p>
`,
    },
  ],
  values: [
    { text: 'WÜTHRICH LARA', category: 'PERSON' },
    { text: 'Wüthrich Lara', category: 'PERSON' },
    { text: 'L. Wüthrich', category: 'PERSON' },
    { text: 'Frau Wüthrich', category: 'PERSON' },
    { text: '21-934-117', category: 'ID' },
    { text: 'lara.wuethrich@student.hs-limmat.example', category: 'EMAIL' },
    { text: 'Platz 143', category: 'ID' },
    { text: 'Beatrice Haldimann', category: 'PERSON' },
    { text: 'Matthias Rüegg', category: 'PERSON' },
    { text: 'M. Rüegg', category: 'PERSON' },
    { text: 'matthias.rueegg@math.hs-limmat.example', category: 'EMAIL' },
    { text: 'Sina Oberholzer', category: 'PERSON' },
    { text: 'S. Oberholzer', category: 'PERSON' },
    { text: 'sina.oberholzer@math.hs-limmat.example', category: 'EMAIL' },
    { text: '044 555 63 18', category: 'PHONE' },
    { text: 'Hochschule Limmat', category: 'COMPANY' },
    { text: 'HOCHSCHULE LIMMAT', category: 'COMPANY' },
    { text: 'Rämistrasse 210', category: 'ADDRESS' },
    { text: '8006 Zürich', category: 'ADDRESS' },
  ],
  keep: ['Gauss-Verfahren', 'Gram-Schmidt-Verfahren', 'charakteristische Polynom', 'Laplace\'scher Entwicklungssatz',
    'orthogonale Projektion', 'Eigenräume', 'Art. 37 ASO', 'algebraische Vielfachheit'],
};
