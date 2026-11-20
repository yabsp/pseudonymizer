export default {
  id: 'physics-de-01',
  domain: 'physics',
  language: 'de',
  title: 'Prüfungsprotokoll mündliche Prüfung Physik',
  header: 'UNIVERSITÄT LINDENBERG | Departement Physik | Protokoll: BRUNNER LEA, Matrikel-Nr. 21-718-344',
  footer: 'Vertraulich - Prüfungsprotokoll L. Brunner - Bachelor Physik, Sessionsprüfung Sommer 2026',
  parts: [
    {
      scan: { rotate: 0.9, noise: 14, dpi: 150 },
      html: String.raw`
<p class="small">Universität Lindenberg, Departement Physik, Studiensekretariat, Hochschulstrasse 18, 3012 Bern</p>
<h1>Protokoll der mündlichen Prüfung</h1>
<table class="facts">
<tr><th>Prüfungsfach</th><td>Physik III: Elektrodynamik und Quantenmechanik (Modul PHY-301, 9 ECTS)</td></tr>
<tr><th>Kandidatin</th><td>Lea Brunner, geb. 03.07.2003</td></tr>
<tr><th>Matrikel-Nr.</th><td>21-718-344</td></tr>
<tr><th>Adresse</th><td>Wylerstrasse 41, 3014 Bern</td></tr>
<tr><th>Examinator</th><td>Prof. Dr. Matthias Zürcher</td></tr>
<tr><th>Beisitzer</th><td>Dr. Giulia Ferrari-Roth</td></tr>
<tr><th>Datum, Zeit</th><td>24. Juni 2026, 10.15 bis 10.45 Uhr, Raum ExWi B 105</td></tr>
<tr><th>Prüfungs-ID</th><td>SP26-PHY301-0457</td></tr>
</table>
<p>Die Kandidatin bestätigt zu Beginn, dass sie prüfungsfähig ist. Prof. Zürcher erläutert den Ablauf: je
etwa 15 Minuten Elektrodynamik und Quantenmechanik, Herleitungen an der Wandtafel.</p>
<h2>1 Elektrodynamik</h2>
<p><b>Frage 1:</b> Formulieren Sie die Maxwell-Gleichungen im Vakuum in differentieller Form.</p>
<p>Frau Brunner schreibt das Gaußsche Gesetz <tex>\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_{0}}</tex>
und das Fehlen magnetischer Monopole <tex>\nabla \cdot \vec{B} = 0</tex> korrekt an. Das Induktionsgesetz gibt
sie zunächst mit falschem Vorzeichen an und korrigiert sich selbst:</p>
<tex display>\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}</tex>
<tex display>\nabla \times \vec{B} = \mu_{0} \vec{j} + \mu_{0} \varepsilon_{0} \frac{\partial \vec{E}}{\partial t}</tex>
<p><b>Frage 2:</b> Leiten Sie daraus die Wellengleichung her. Die Kandidatin bildet die Rotation des
Induktionsgesetzes, verwendet die Identität für die doppelte Rotation und erhält im ladungsfreien Raum</p>
<tex display>\Delta \vec{E} - \frac{1}{c^{2}} \frac{\partial^{2} \vec{E}}{\partial t^{2}} = 0, \qquad c = \frac{1}{\sqrt{\mu_{0} \varepsilon_{0}}}</tex>
<p>Auf Nachfrage von Dr. Ferrari-Roth nennt sie den Poynting-Vektor <tex>\vec{S} = \frac{1}{\mu_{0}} \vec{E} \times \vec{B}</tex>
als Energiestromdichte und erklärt den Energieerhaltungssatz qualitativ.</p>
<p><b>Frage 3:</b> Feld einer homogen geladenen Kugel. Mit dem Gaußschen Satz leitet sie die Fallunterscheidung her:</p>
<tex display>E(r) = \begin{cases} \frac{Q r}{4 \pi \varepsilon_{0} R^{3}} & r \leq R \\ \frac{Q}{4 \pi \varepsilon_{0} r^{2}} & r > R \end{cases}</tex>
<p>Die Stetigkeit am Kugelrand r = R wird überprüft. Bewertung Teil 1: sicher, mit kleiner Unsicherheit beim
Vorzeichen im Induktionsgesetz.</p>
<div class="page-break"></div>
<h2>2 Quantenmechanik</h2>
<p><b>Frage 4:</b> Teilchen im unendlich tiefen Potentialtopf der Breite <tex>L</tex>. Die Kandidatin löst die
zeitunabhängige Schrödinger-Gleichung</p>
<tex display>-\frac{\hbar^{2}}{2m} \frac{d^{2} \psi}{dx^{2}} = E \psi</tex>
<p>und erhält die normierten Eigenfunktionen und Energien</p>
<tex display>\psi_{n}(x) = \sqrt{\frac{2}{L}} \sin\left(\frac{n \pi x}{L}\right), \qquad E_{n} = \frac{n^{2} \pi^{2} \hbar^{2}}{2 m L^{2}}</tex>
<p>Die Normierung zeigt sie durch Integration des Betragsquadrats über den Topf.</p>
<p><b>Frage 5:</b> Spin-1/2 und Pauli-Matrizen. Frau Brunner schreibt</p>
<tex display>\sigma_{x} = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad \sigma_{y} = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad \sigma_{z} = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}</tex>
<p>und nennt die Vertauschungsrelation <tex>[\sigma_{x}, \sigma_{y}] = 2 i \sigma_{z}</tex>. Die Frage nach den
Eigenwerten des Spinoperators in z-Richtung beantwortet sie direkt.</p>
<p><b>Frage 6:</b> Heisenbergsche Unschärferelation. Die allgemeine Form
<tex>\Delta A \, \Delta B \geq \frac{1}{2} |\langle [A, B] \rangle|</tex> wird genannt, die Herleitung über die
Cauchy-Schwarz-Ungleichung nur skizziert. Für Ort und Impuls folgt <tex>\Delta x \, \Delta p \geq \frac{\hbar}{2}</tex>.</p>
<p><b>Frage 7 (Zusatz):</b> Erwartungswert der Energie im harmonischen Oszillator,
<tex>E_{n} = \hbar \omega \left(n + \frac{1}{2}\right)</tex>; die Nullpunktsenergie wird richtig interpretiert.</p>
<h2>Beurteilung</h2>
<table class="grid">
<tr><th>Teil</th><th>Beurteilung</th><th>Note</th></tr>
<tr><td>Elektrodynamik</td><td>gute Herleitungen, ein Vorzeichenfehler selbst korrigiert</td><td>5.5</td></tr>
<tr><td>Quantenmechanik</td><td>sicher, Unschärferelation nur skizziert</td><td>5.0</td></tr>
<tr><td><b>Gesamtnote</b></td><td>bestanden</td><td><b>5.25, gerundet 5.5</b></td></tr>
</table>
<p>Die Note wird der Kandidatin im Anschluss mündlich mitgeteilt. Eine Einsicht ins Protokoll kann innert 30
Tagen beim Studiensekretariat (studsek.physik@uni-lindenberg.example, 031 555 64 20) beantragt werden.</p>
<div class="as-image signature">Examinator: M. Zürcher &nbsp;&nbsp; Beisitzerin: G. Ferrari-Roth &nbsp;&nbsp; Bern, 24.06.2026</div>
`,
    },
  ],
  values: [
    { text: 'BRUNNER LEA', category: 'PERSON' },
    { text: 'Lea Brunner', category: 'PERSON' },
    { text: 'L. Brunner', category: 'PERSON' },
    { text: '21-718-344', category: 'ID' },
    { text: '03.07.2003', category: 'DATE' },
    { text: 'Wylerstrasse 41', category: 'ADDRESS' },
    { text: '3014 Bern', category: 'ADDRESS' },
    { text: 'Matthias Zürcher', category: 'PERSON' },
    { text: 'Prof. Zürcher', category: 'PERSON' },
    { text: 'M. Zürcher', category: 'PERSON' },
    { text: 'Giulia Ferrari-Roth', category: 'PERSON' },
    { text: 'Dr. Ferrari-Roth', category: 'PERSON' },
    { text: 'G. Ferrari-Roth', category: 'PERSON' },
    { text: 'SP26-PHY301-0457', category: 'ID' },
    { text: 'studsek.physik@uni-lindenberg.example', category: 'EMAIL' },
    { text: '031 555 64 20', category: 'PHONE' },
    { text: 'Universität Lindenberg', category: 'COMPANY' },
    { text: 'UNIVERSITÄT LINDENBERG', category: 'COMPANY' },
    { text: 'Hochschulstrasse 18', category: 'ADDRESS' },
    { text: '3012 Bern', category: 'ADDRESS' },
  ],
  keep: ['Maxwell-Gleichungen', 'Induktionsgesetz', 'Poynting-Vektor', 'Schrödinger-Gleichung', 'Pauli-Matrizen',
    'Unschärferelation', 'Potentialtopf', 'PHY-301'],
};
