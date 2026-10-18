const BAREME = [
  ['1', 'Dénombrement', '6', '5'],
  ['2', 'Probabilités conditionnelles, formule de Bayes', '8', '6'],
  ['3', 'Loi binomiale', '8', '7'],
  ['4', 'Variable aléatoire, espérance et variance', '8', '4.5'],
  ['5', 'Loi normale (bonus)', '4', '1'],
  ['Total', '', '30 (+4)', '23.5'],
];

export default {
  id: 'math-fr-01',
  domain: 'math',
  language: 'fr',
  title: 'Devoir surveillé de probabilités, corrigé',
  header: 'GYMNASE DES CÈDRES-BLEUS | Mathématiques 2M3 | ROCHAT MATHIS',
  footer: 'Corrigé personnel de M. Rochat - à faire signer par un parent',
  parts: [
    {
      html: String.raw`
<p class="small">Gymnase des Cèdres-Bleus, Chemin des Cèdres 12, 1004 Lausanne</p>
<h1>Devoir surveillé n° 3 - Probabilités</h1>
<table class="facts">
<tr><th>Élève</th><td>Mathis Rochat, classe 2M3</td></tr>
<tr><th>Date de naissance</th><td>04.06.2009</td></tr>
<tr><th>N° d'élève</th><td>GCB-2024-0517</td></tr>
<tr><th>Date du devoir</th><td>mardi 10 mars 2026, 2 périodes</td></tr>
<tr><th>Enseignante</th><td>Mme Valérie Clerc</td></tr>
</table>
<table class="grid">
<tr><th>Exercice</th><th>Thème</th><th>Points</th><th>Obtenus</th></tr>
${BAREME.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<p>Note : <b>4.5</b> (barème linéaire <tex>n = 1 + 5 \cdot \frac{p}{30}</tex>, arrondi au demi-point).</p>
<p>Remarque générale : bon travail sur la loi binomiale. Attention à bien définir les événements avant de
calculer et à justifier l'indépendance. Mathis doit revoir la variance (exercice 4) avant l'épreuve commune.</p>

<h2>Exercice 1 (6 points)</h2>
<p>Un code de cadenas est formé de 4 chiffres distincts choisis parmi 0 à 9. Combien de codes existe-t-il ?
Combien contiennent le chiffre 7 ?</p>
<p><b>Corrigé.</b> Il s'agit d'arrangements : <tex>A_{10}^{4} = \frac{10!}{(10-4)!} = 10 \cdot 9 \cdot 8 \cdot 7 = 5040</tex>.
Les codes sans le chiffre 7 sont au nombre de <tex>A_{9}^{4} = 3024</tex>, donc <tex>5040 - 3024 = 2016</tex>
codes contiennent le 7.</p>
<p>Pour un comité de 3 élèves choisis parmi 25 :</p>
<tex display>\binom{25}{3} = \frac{25!}{3! \, 22!} = 2300</tex>

<h2>Exercice 2 (8 points)</h2>
<p>Dans un gymnase, 60 % des élèves prennent le bus. Parmi eux, 15 % arrivent en retard ; parmi les autres,
5 % arrivent en retard. On choisit un élève au hasard. On note <tex>B</tex> « l'élève prend le bus » et
<tex>R</tex> « l'élève arrive en retard ».</p>
<p>a) Formule des probabilités totales :</p>
<tex display>P(R) = P(R \mid B) \, P(B) + P(R \mid \overline{B}) \, P(\overline{B}) = 0.15 \cdot 0.6 + 0.05 \cdot 0.4 = 0.11</tex>
<p>b) Formule de Bayes :</p>
<tex display>P(B \mid R) = \frac{P(R \mid B) \, P(B)}{P(R)} = \frac{0.09}{0.11} = \frac{9}{11} \approx 0.818</tex>
<p>c) Les événements <tex>B</tex> et <tex>R</tex> sont-ils indépendants ? Non, car
<tex>P(B \cap R) = 0.09 \neq P(B) \, P(R) = 0.066</tex>.</p>
<p class="note">Remarque : en b), tu as calculé <tex>P(R \mid B)</tex> au lieu de <tex>P(B \mid R)</tex>. -2</p>

<div class="page-break"></div>
<h2>Exercice 3 (8 points)</h2>
<p>Un QCM comporte 10 questions avec 4 réponses possibles dont une seule est juste. Un élève répond au hasard.
Soit <tex>X</tex> le nombre de bonnes réponses, <tex>X \sim \mathcal{B}(10, \frac{1}{4})</tex>.</p>
<tex display>P(X = k) = \binom{10}{k} \left(\frac{1}{4}\right)^{k} \left(\frac{3}{4}\right)^{10-k}, \quad k = 0, 1, \ldots, 10</tex>
<p>a) <tex>P(X = 3) = \binom{10}{3} \cdot \frac{3^{7}}{4^{10}} \approx 0.250</tex></p>
<p>b) Au moins une bonne réponse :</p>
<tex display>P(X \geq 1) = 1 - P(X = 0) = 1 - \left(\frac{3}{4}\right)^{10} \approx 0.944</tex>
<p>c) <tex>E(X) = n p = 2.5</tex> et <tex>V(X) = n p (1 - p) = \frac{15}{8}</tex>, donc
<tex>\sigma(X) = \sqrt{\frac{15}{8}} \approx 1.37</tex>.</p>
<p class="note">Remarque : très bien. -1 pour l'arrondi en a) (0.25 attendu à 3 décimales).</p>

<h2>Exercice 4 (8 points)</h2>
<p>On lance deux dés équilibrés et on note <tex>Y</tex> la valeur absolue de la différence des deux résultats.</p>
<p>a) Loi de <tex>Y</tex> :</p>
<table class="grid">
<tr><th>y</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
<tr><th>P(Y = y)</th><td>6/36</td><td>10/36</td><td>8/36</td><td>6/36</td><td>4/36</td><td>2/36</td></tr>
</table>
<p>b) Espérance :</p>
<tex display>E(Y) = \sum_{y=0}^{5} y \, P(Y = y) = \frac{0 + 10 + 16 + 18 + 16 + 10}{36} = \frac{70}{36} = \frac{35}{18}</tex>
<p>c) Variance, avec <tex>E(Y^{2}) = \frac{10 + 32 + 54 + 64 + 50}{36} = \frac{210}{36} = \frac{35}{6}</tex> :</p>
<tex display>V(Y) = E(Y^{2}) - \big(E(Y)\big)^{2} = \frac{35}{6} - \left(\frac{35}{18}\right)^{2} = \frac{665}{324} \approx 2.05</tex>
<p class="note">Remarque : la loi est juste, mais tu as utilisé <tex>V(Y) = E(Y^{2}) - E(Y)</tex>. Revoir le
théorème de König-Huygens. -3.5</p>

<h2>Exercice 5 (bonus, 4 points)</h2>
<p>La taille des élèves suit approximativement une loi normale <tex>\mathcal{N}(\mu, \sigma^{2})</tex> avec
<tex>\mu = 172</tex> cm et <tex>\sigma = 8</tex> cm. Calculer la probabilité qu'un élève mesure plus de 180 cm.</p>
<tex display>P(T > 180) = P\left(Z > \frac{180 - 172}{8}\right) = 1 - \Phi(1) \approx 0.159</tex>
<tex display>f(t) = \frac{1}{\sigma \sqrt{2\pi}} \, e^{-\frac{(t - \mu)^{2}}{2\sigma^{2}}}</tex>
<p class="note">Remarque : bonne standardisation, mais lecture de la table erronée. +1</p>
<p>Contact : valerie.clerc@cedres-bleus.example. Merci de rendre ce corrigé signé d'ici au 20 mars 2026.</p>
`,
    },
    {
      scan: { rotate: -1.2, noise: 16, dpi: 150 },
      html: String.raw`
<h1>Coupon à retourner - signature des parents</h1>
<p>Je soussignée, Nathalie Rochat-Bovet, mère de l'élève Mathis Rochat (2M3), atteste avoir pris connaissance du
devoir surveillé n° 3 de mathématiques et de la note obtenue (4.5).</p>
<p>Adresse : Avenue de Montoie 27, 1007 Lausanne<br>Téléphone : 079 555 12 86<br>Courriel : n.rochat-bovet@example.ch</p>
<p>Remarque des parents : Mathis suit des cours d'appui le mercredi avec M. Olivier Rochat (son père) ; nous
souhaitons un entretien avec Mme Clerc au sujet de l'épreuve commune.</p>
<div class="as-image signature">Lu et approuvé, Lausanne, le 16.03.2026 - N. Rochat-Bovet</div>
`,
    },
  ],
  values: [
    { text: 'ROCHAT MATHIS', category: 'PERSON' },
    { text: 'Mathis Rochat', category: 'PERSON' },
    { text: 'M. Rochat', category: 'PERSON' },
    { text: 'Mathis', category: 'PERSON' },
    { text: '04.06.2009', category: 'DATE' },
    { text: 'GCB-2024-0517', category: 'ID' },
    { text: 'Valérie Clerc', category: 'PERSON' },
    { text: 'Mme Clerc', category: 'PERSON' },
    { text: 'valerie.clerc@cedres-bleus.example', category: 'EMAIL' },
    { text: 'Nathalie Rochat-Bovet', category: 'PERSON' },
    { text: 'N. Rochat-Bovet', category: 'PERSON' },
    { text: 'n.rochat-bovet@example.ch', category: 'EMAIL' },
    { text: 'Olivier Rochat', category: 'PERSON' },
    { text: 'Avenue de Montoie 27', category: 'ADDRESS' },
    { text: '1007 Lausanne', category: 'ADDRESS' },
    { text: '079 555 12 86', category: 'PHONE' },
    { text: 'Gymnase des Cèdres-Bleus', category: 'COMPANY' },
    { text: 'GYMNASE DES CÈDRES-BLEUS', category: 'COMPANY' },
    { text: 'Chemin des Cèdres 12', category: 'ADDRESS' },
    { text: '1004 Lausanne', category: 'ADDRESS' },
  ],
  keep: ['formule de Bayes', 'loi binomiale', 'probabilités totales', 'König-Huygens', 'loi normale',
    'arrangements', 'espérance'],
};
