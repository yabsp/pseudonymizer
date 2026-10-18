const GROWTH = [
  ['naissance', '3.05', '48.0', 'P10', '-1.3'],
  ['6 mois', '7.10', '64.5', 'P10', '-1.2'],
  ['1 an', '8.90', '72.0', 'P5', '-1.6'],
  ['18 mois', '10.00', '78.0', 'P5', '-1.7'],
  ['2 ans', '11.00', '82.5', 'P3', '-1.9'],
  ['3 ans', '12.60', '89.5', 'P3', '-2.0'],
  ['4 ans', '14.10', '95.0', '&lt; P3', '-2.1'],
  ['5 ans', '15.60', '100.1', '&lt; P3', '-2.1'],
  ['6 ans', '17.00', '104.6', '&lt; P3', '-2.2'],
  ['7 ans 5 mois', '18.40', '109.0', '&lt; P3', '-2.4'],
];

const bmi = (kg, cm) => (Number(kg) / (Number(cm) / 100) ** 2).toFixed(1);

const growthRows = GROWTH.map(([age, kg, cm, pct, z]) =>
  `<tr><td>${age}</td><td class="num">${kg}</td><td class="num">${cm}</td><td class="num">${bmi(kg, cm)}</td><td>${pct}</td><td class="num">${z}</td></tr>`).join('\n');

export default {
  id: 'medicine-fr-02',
  domain: 'medicine',
  language: 'fr',
  title: 'Rapport de consultation pédiatrique',
  header: 'CABINET DE PÉDIATRIE DES ACACIAS | Patient: PERRENOUD NOAH, né le 12.05.2019',
  footer: 'Confidentiel - Rapport de consultation N. Perrenoud - dossier PED-19-0573',
  parts: [
    {
      html: String.raw`
<p class="small">Cabinet de pédiatrie des Acacias, Dre méd. Camille Joliat, pédiatre FMH, Rue des Acacias 7, 2000 Neuchâtel,
tél. 032 555 47 30, cabinet@pediatrie-acacias.example</p>
<p>Centre hospitalier des Montagnes SA<br>Consultation d'endocrinologie pédiatrique<br>Dr méd. Bastien Girardin<br>Rue du Collège 92<br>2300 La Chaux-de-Fonds</p>
<p class="right">Neuchâtel, le 14 octobre 2026</p>
<h1>Rapport de consultation</h1>
<table class="facts">
<tr><th>Enfant</th><td>Noah Perrenoud, né le 12 mai 2019 (7 ans 5 mois)</td></tr>
<tr><th>Adresse</th><td>Rue de la Promenade 18, 2052 Fontainemelon</td></tr>
<tr><th>Parents</th><td>Aurélie Perrenoud-Gex et Julien Perrenoud</td></tr>
<tr><th>N° AVS</th><td>756.1047.6629.05</td></tr>
<tr><th>Assurance</th><td>Mutuelle Jura-Lac, n° d'assuré 993-2019-04417</td></tr>
<tr><th>Dossier</th><td>PED-19-0573</td></tr>
</table>
<p>Cher Confrère,</p>
<p>Je vous adresse Noah, que je suis depuis sa naissance, pour une évaluation d'une petite taille avec
infléchissement de la courbe de croissance staturale. Les parents, Mme Perrenoud-Gex et M. Perrenoud, sont
inquiets car Noah est nettement le plus petit de sa classe de 4H et se plaint d'être moqué par ses camarades.</p>
<h2>Anamnèse</h2>
<p>Grossesse sans particularité, naissance à 39 4/7 semaines par voie basse, poids de naissance 3050 g
(P25), taille 48 cm (P10), périmètre crânien 34 cm. Pas d'hospitalisation néonatale. Allaitement maternel
exclusif jusqu'à 5 mois, diversification sans difficulté. Développement psychomoteur normal: marche à 13 mois,
premiers mots à 12 mois. Vaccinations à jour selon le plan suisse de vaccination.</p>
<p>Pas de troubles digestifs, transit régulier, pas de douleurs abdominales récurrentes. Appétit qualifié de
"petit mangeur" par la mère, sans sélectivité alimentaire marquée. Pas de céphalées, pas de troubles visuels,
pas de polyurie ni de polydipsie. Sommeil de 10 heures par nuit. Activité physique: football deux fois par semaine.
Pas de traitement au long cours, en particulier pas de corticoïdes inhalés.</p>
<p>Anamnèse familiale: taille du père 168 cm, puberté normale selon lui; taille de la mère 157 cm, ménarche
à 14 ans; une soeur, Lou Perrenoud, 10 ans, de taille normale (P25). Pas de maladie coeliaque ni de pathologie
thyroïdienne connues dans la famille. Le grand-père paternel aurait eu une "poussée de croissance tardive".</p>
<h2>Examen clinique</h2>
<p>Enfant en bon état général, proportions corporelles harmonieuses (rapport segment supérieur / segment inférieur
0.98, envergure 107 cm). Poids 18.4 kg (P3), taille 109.0 cm (&lt; P3, -2.4 DS), périmètre crânien 51 cm (P25).
TA 98/60 mmHg. Pas de dysmorphie, pas de signes de syndrome de Turner ou de Noonan (garçon), pas de
cassure de la courbe pondérale. Thyroïde non palpable. Stade pubertaire Tanner G1 P1, testicules 2 ml
bilatéralement. Examen neurologique et fond d'oeil normaux.</p>
`,
    },
    {
      html: String.raw`
<h2>Courbe de croissance</h2>
<p>Les mesures ci-dessous ont été reportées sur les courbes de croissance de l'OMS adoptées par la Société
Suisse de Pédiatrie (SSP). L'indice de masse corporelle est calculé selon</p>
<tex display>\mathrm{IMC} = \frac{m}{h^{2}} \quad [\mathrm{kg/m^{2}}]</tex>
<table class="grid">
<tr><th>Âge</th><th class="num">Poids (kg)</th><th class="num">Taille (cm)</th><th class="num">IMC (kg/m²)</th><th>Percentile taille</th><th class="num">Score z taille</th></tr>
${growthRows}
</table>
<p>Le score z (déviation standard) est déterminé par la méthode LMS, avec les paramètres L (asymétrie),
M (médiane) et S (coefficient de variation) des références OMS pour l'âge et le sexe:</p>
<tex display>z = \frac{\left(\frac{X}{M}\right)^{L} - 1}{L \cdot S}</tex>
<p>Pour la taille de Noah à 7 ans 5 mois (X = 109.0 cm; L = 1, M = 123.6 cm, S = 0.0433), on obtient
<tex>z = \frac{109.0/123.6 - 1}{0.0433} \approx -2.7</tex> selon la référence OMS brute; après correction pour la
référence suisse utilisée par le logiciel du cabinet, le score retenu est de -2.4. Le percentile correspond à la
fonction de répartition de la loi normale:</p>
<tex display>P = \Phi(z) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{z} e^{-t^{2}/2} dt</tex>
<p>soit <tex>\Phi(-2.4) \approx 0.008</tex>, c'est-à-dire en dessous du 1er percentile.</p>
<p>La vitesse de croissance sur les 17 derniers mois est de</p>
<tex display>v = \frac{\Delta h}{\Delta t} = \frac{109.0 - 104.6}{1.42} \approx 3.1 \quad \mathrm{cm/an}</tex>
<p>ce qui est inférieur au 10e percentile pour l'âge (norme environ 5 à 6 cm/an).</p>
<p>La taille cible parentale (formule de Tanner pour un garçon, en cm, avec T<sub>P</sub> la taille du père et T<sub>M</sub> celle de la mère) est de</p>
<tex display>T_{\mathrm{cible}} = \frac{T_{P} + T_{M} + 13}{2} = \frac{168 + 157 + 13}{2} = 169 \pm 8.5</tex>
<p>ce qui correspond à un score z d'environ -1.3. Noah se situe donc nettement en dessous de son couloir génétique
(écart de plus de 1 DS par rapport au score z de la taille cible).</p>
`,
    },
    {
      html: String.raw`
<h2>Examens complémentaires</h2>
<table class="grid">
<tr><th>Examen</th><th>Résultat</th><th>Norme</th></tr>
<tr><td>Hémogramme, ferritine</td><td>normal, ferritine 38 µg/l</td><td>20-200 µg/l</td></tr>
<tr><td>CRP, VS</td><td>&lt; 2 mg/l, 6 mm/h</td><td>&lt; 5 mg/l</td></tr>
<tr><td>TSH, T4 libre</td><td>2.1 mU/l, 15.8 pmol/l</td><td>0.7-5.0 mU/l, 12-22 pmol/l</td></tr>
<tr><td>IGF-1</td><td>58 µg/l (-1.9 DS)</td><td>pour l'âge -2 à +2 DS</td></tr>
<tr><td>IGFBP-3</td><td>2.2 mg/l (-1.2 DS)</td><td>-2 à +2 DS</td></tr>
<tr><td>Anti-transglutaminase IgA, IgA totales</td><td>négatifs, IgA 0.9 g/l</td><td>négatif</td></tr>
<tr><td>Créatinine, électrolytes, calcium, phosphate</td><td>normaux</td><td>-</td></tr>
<tr><td>Caryotype</td><td>non effectué (garçon, pas de dysmorphie)</td><td>-</td></tr>
<tr><td>Âge osseux (Greulich et Pyle), radiographie de la main gauche</td><td>5 ans 6 mois</td><td>âge chronologique 7 ans 5 mois</td></tr>
</table>
<h2>Appréciation</h2>
<p>Petite taille (-2.4 DS) avec ralentissement de la vitesse de croissance (3.1 cm/an), taille en dessous du
couloir génétique, retard de l'âge osseux de près de 2 ans et IGF-1 à la limite inférieure. Le bilan exclut une
maladie coeliaque, une hypothyroïdie, une maladie inflammatoire chronique et une insuffisance rénale.</p>
<p>Le diagnostic différentiel comprend un retard constitutionnel de croissance et de puberté, compatible avec
l'anamnèse familiale paternelle, et un déficit partiel en hormone de croissance, qui reste à exclure en raison de la
vitesse de croissance diminuée et de l'IGF-1 bas.</p>
<h2>Propositions</h2>
<ul>
<li>Test de stimulation de l'hormone de croissance (arginine et glucagon), avec priming par stéroïdes sexuels
à discuter selon votre protocole</li>
<li>En cas de déficit confirmé: IRM hypophysaire et discussion d'un traitement par somatropine (0.025-0.035 mg/kg/j)
avec demande de prise en charge à l'assurance-invalidité (infirmité congénitale)</li>
<li>Sinon, suivi de la croissance tous les 6 mois au cabinet</li>
<li>Soutien psychologique proposé à la famille en raison des moqueries à l'école</li>
</ul>
<p>Les parents sont d'accord avec cette démarche. Vous pouvez joindre la mère, Mme Aurélie Perrenoud-Gex, au
079 555 63 18 ou par courriel aurelie.perrenoud@example.ch, pour fixer le rendez-vous.</p>
<p>Je vous remercie de votre avis et vous prie d'agréer, cher Confrère, mes salutations les meilleures.</p>
<p>Dre méd. Camille Joliat<br>Pédiatre FMH</p>
<p class="small">Copie: M. Julien Perrenoud et Mme Aurélie Perrenoud-Gex, Rue de la Promenade 18, 2052 Fontainemelon</p>
`,
    },
  ],
  values: [
    { text: 'CABINET DE PÉDIATRIE DES ACACIAS', category: 'COMPANY' },
    { text: 'Cabinet de pédiatrie des Acacias', category: 'COMPANY' },
    { text: 'PERRENOUD NOAH', category: 'PERSON' },
    { text: '12.05.2019', category: 'DATE' },
    { text: '12 mai 2019', category: 'DATE' },
    { text: 'N. Perrenoud', category: 'PERSON' },
    { text: 'PED-19-0573', category: 'ID' },
    { text: 'Camille Joliat', category: 'PERSON' },
    { text: 'Rue des Acacias 7', category: 'ADDRESS' },
    { text: '2000 Neuchâtel', category: 'ADDRESS' },
    { text: '032 555 47 30', category: 'PHONE' },
    { text: 'cabinet@pediatrie-acacias.example', category: 'EMAIL' },
    { text: 'Centre hospitalier des Montagnes SA', category: 'COMPANY' },
    { text: 'Bastien Girardin', category: 'PERSON' },
    { text: 'Rue du Collège 92', category: 'ADDRESS' },
    { text: '2300 La Chaux-de-Fonds', category: 'ADDRESS' },
    { text: 'Noah Perrenoud', category: 'PERSON' },
    { text: 'Noah', category: 'PERSON' },
    { text: 'Rue de la Promenade 18', category: 'ADDRESS' },
    { text: '2052 Fontainemelon', category: 'ADDRESS' },
    { text: 'Aurélie Perrenoud-Gex', category: 'PERSON' },
    { text: 'Perrenoud-Gex', category: 'PERSON' },
    { text: 'Julien Perrenoud', category: 'PERSON' },
    { text: 'Perrenoud', category: 'PERSON' },
    { text: '756.1047.6629.05', category: 'AHV' },
    { text: 'Mutuelle Jura-Lac', category: 'COMPANY' },
    { text: '993-2019-04417', category: 'ID' },
    { text: 'Lou Perrenoud', category: 'PERSON' },
    { text: '079 555 63 18', category: 'PHONE' },
    { text: 'aurelie.perrenoud@example.ch', category: 'EMAIL' },
  ],
  keep: ['IGF-1', 'Greulich et Pyle', 'Anti-transglutaminase IgA', 'vitesse de croissance', 'taille cible parentale',
    'méthode LMS', 'retard constitutionnel de croissance et de puberté', "déficit partiel en hormone de croissance",
    'somatropine', 'Tanner G1 P1', "test de stimulation de l'hormone de croissance"],
};
