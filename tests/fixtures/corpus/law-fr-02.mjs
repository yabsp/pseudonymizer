const PENSIONS = [
  ['Léa', 'dès le 1er novembre 2026 jusqu\'à 16 ans révolus', '1\'150.00', '311.00', '260.00'],
  ['Léa', 'de 16 ans à la majorité, voire au-delà en cas d\'études sérieuses et régulières (art. 277 al. 2 CC), mais au plus tard jusqu\'à 25 ans', '1\'280.00', '415.00', '0.00'],
  ['Hugo', 'dès le 1er novembre 2026 jusqu\'à 12 ans révolus', '980.00', '311.00', '410.00'],
  ['Hugo', 'de 12 à 16 ans', '1\'090.00', '311.00', '260.00'],
  ['Hugo', 'de 16 ans à la majorité, voire au-delà en cas d\'études sérieuses et régulières, au plus tard jusqu\'à 25 ans', '1\'210.00', '415.00', '0.00'],
];

const pensionRows = PENSIONS.map(([child, period, need, allowance, care]) =>
  `<tr><td>${child}</td><td>${period}</td><td class="num">${need}</td><td class="num">${allowance}</td><td class="num">${care}</td></tr>`).join('\n');

export default {
  id: 'law-fr-02',
  domain: 'law',
  language: 'fr',
  title: 'Jugement de divorce',
  header: 'TRIBUNAL DE PREMIÈRE INSTANCE DE GENÈVE | C/18422/2025 | BERTHOUD VALÉRIE c/ BERTHOUD NICOLAS',
  footer: 'JTPI/12873/2026 - Divorce Berthoud - communiqué aux parties le 20 octobre 2026',
  parts: [
    {
      html: String.raw`
<p class="small">République et canton de Genève, Pouvoir judiciaire, Tribunal civil, Tribunal de première instance,
Rue de l'Athénée 6-8, 1205 Genève</p>
<p>C/18422/2025 &nbsp;&nbsp; JTPI/12873/2026</p>
<h1>Jugement</h1>
<p>rendu le 15 octobre 2026 par le Tribunal de première instance, 9e Chambre, siégeant à juge unique,
Mme Anne-Claude Rossier, juge, assistée de Mme Mélanie Pasche, greffière</p>
<p>dans la cause entre</p>
<table class="facts">
<tr><th>Demanderesse</th><td>Madame Valérie Berthoud, née Jaquier le 14 juin 1984, domiciliée Chemin de la Gravière 6, 1227 Carouge, comparant par Me Isabelle Charrière, avocate, Étude Charrière &amp; Vuilleumier, Rue du Rhône 54, 1204 Genève, en l'étude de laquelle elle fait élection de domicile</td></tr>
<tr><th>Défendeur</th><td>Monsieur Nicolas Berthoud, né le 2 novembre 1981, domicilié Rue de Lyon 88, 1203 Genève, comparant par Me Fabien Dumont, avocat, Dumont Avocats SA, Boulevard Helvétique 19, 1207 Genève, en l'étude duquel il fait élection de domicile</td></tr>
</table>
<h2>En fait</h2>
<p><b>A.</b> Valérie Jaquier, de nationalité suisse, originaire de Sainte-Croix (VD), et Nicolas Berthoud, de
nationalité suisse, originaire de Neuchâtel, ont contracté mariage le 18 août 2012 à Carouge, sans conclure de
contrat de mariage. Ils sont dès lors soumis au régime de la participation aux acquêts (art. 181 CC).</p>
<p>Deux enfants sont issus de cette union:</p>
<ul>
<li>Léa Berthoud, née le 23 mars 2013 à Genève;</li>
<li>Hugo Berthoud, né le 8 septembre 2016 à Genève.</li>
</ul>
<p><b>B.</b> Les époux vivent séparés depuis le 1er février 2025, date à laquelle Nicolas Berthoud a quitté le
domicile conjugal sis Avenue de Thônex 31, 1226 Thônex, pour s'installer dans un appartement à la Rue de Lyon.
Par jugement sur mesures protectrices de l'union conjugale du 12 mai 2025 (JTPI/6120/2025), le Tribunal a attribué
la garde des enfants à la mère, réservé au père un large droit de visite et condamné ce dernier à verser une
contribution d'entretien de CHF 1'100.00 par mois et par enfant, allocations familiales non comprises.</p>
<p><b>C.</b> Par demande unilatérale en divorce déposée le 3 septembre 2025 (art. 114 CC), Valérie Berthoud a conclu
au prononcé du divorce, à l'attribution de l'autorité parentale conjointe et de la garde alternée sur les enfants,
au versement de contributions d'entretien pour les enfants, à la liquidation du régime matrimonial et au partage
par moitié des avoirs de prévoyance professionnelle accumulés durant le mariage.</p>
<p>Dans sa réponse du 17 novembre 2025, Nicolas Berthoud a acquiescé au principe du divorce et à la garde alternée.
Il a contesté le montant des contributions réclamées, faisant valoir une baisse de ses revenus depuis son passage à
un taux d'activité de 80 % auprès de son employeur, Brison Ingénierie SA, à Plan-les-Ouates.</p>
<p><b>D.</b> Le Service d'évaluation et d'accompagnement de la séparation parentale (SEASP) a rendu son rapport le
2 mars 2026. Il en ressort que les deux parents disposent de bonnes capacités éducatives, que les enfants sont
attachés à chacun d'eux et que la garde alternée, pratiquée de fait depuis l'automne 2025 à raison d'une semaine
sur deux, fonctionne de manière satisfaisante. Léa, entendue par le SEASP, a exprimé le souhait de conserver ce
rythme; Hugo, en raison de son âge, n'a pas été entendu séparément (art. 298 CPC).</p>
<p><b>E.</b> Lors de l'audience de débats principaux du 9 septembre 2026, les parties ont trouvé un accord partiel
sur l'autorité parentale, la garde, le domicile légal des enfants, la liquidation du régime matrimonial et le
partage de la prévoyance professionnelle. Seule la question des contributions d'entretien est restée litigieuse.</p>
<p><b>F.</b> La situation financière des parties se présente comme suit:</p>
<p>Valérie Berthoud travaille en qualité de pharmacienne responsable à 70 % auprès de la
Pharmacie du Rondeau Sàrl, à Carouge, pour un salaire mensuel net de CHF 6'240.00, versé treize fois l'an. Nicolas Berthoud perçoit,
en qualité d'ingénieur civil à 80 %, un salaire mensuel net de CHF 8'910.00, versé treize fois l'an, plus un bonus
annuel variable d'environ CHF 6'000.00. Les avoirs de prévoyance professionnelle acquis durant le mariage s'élèvent
à CHF 92'418.35 pour l'épouse (Fondation collective LPP Romandie, n° d'assurée 31-0447-2290) et à CHF 168'902.60
pour l'époux (Caisse de pension Brison, n° d'assuré 7741-0093).</p>
`,
    },
    {
      html: String.raw`
<h2>En droit</h2>
<p><b>1.</b> Le Tribunal de première instance est compétent à raison du lieu (art. 23 al. 1 CPC) et de la matière
(art. 86 al. 2 let. a LOJ). La demande a été introduite plus de deux ans après le début de la vie séparée au sens de
l'art. 114 CC, compte tenu de l'acquiescement du défendeur au principe du divorce, qui permet en outre de prononcer
celui-ci sur requête commune (art. 292 CPC). Le divorce sera dès lors prononcé.</p>
<p><b>2.</b> Lorsqu'il statue sur le divorce, le juge règle les droits et les devoirs des père et mère conformément
aux dispositions régissant les effets de la filiation (art. 133 al. 1 CC). L'autorité parentale conjointe est la
règle (art. 296 al. 2 et 298 al. 1 CC). Lorsque l'un des parents ou l'enfant le demande, le juge examine si la garde
alternée est possible et compatible avec le bien de l'enfant (art. 298 al. 2ter CC).</p>
<p>En l'espèce, les parents s'accordent sur le maintien de l'autorité parentale conjointe et de la garde alternée.
Les conclusions du SEASP confirment que cette solution correspond à l'intérêt de Léa et de Hugo. Les domiciles des
parents, à Carouge et à Genève, sont proches des établissements scolaires fréquentés par les enfants. Le domicile
légal des enfants sera fixé chez la mère, qui percevra les allocations familiales.</p>
<p><b>3.</b> Selon l'art. 276 al. 1 CC, l'entretien est assuré par les soins, l'éducation et des prestations
pécuniaires. La contribution d'entretien doit correspondre aux besoins de l'enfant ainsi qu'à la situation et aux
ressources des père et mère (art. 285 al. 1 CC). Elle sert aussi à garantir la prise en charge de l'enfant par les
parents et les tiers (contribution de prise en charge, art. 285 al. 2 CC). Le Tribunal fédéral a imposé une méthode
uniforme de calcul en deux étapes, fondée sur le minimum vital du droit de la famille avec répartition de
l'excédent (ATF 147 III 265 consid. 6 à 8).</p>
<p><b>3.1</b> Le minimum vital du droit de la famille de chaque partie s'établit comme suit, en tenant compte de la
garde alternée et des frais de logement effectifs:</p>
<table class="grid">
<tr><th>Poste mensuel (CHF)</th><th class="num">Valérie Berthoud</th><th class="num">Nicolas Berthoud</th></tr>
<tr><td>Revenu net, 13e salaire inclus</td><td class="num">6'760.00</td><td class="num">10'152.50</td></tr>
<tr><td>Montant de base OP</td><td class="num">1'350.00</td><td class="num">1'200.00</td></tr>
<tr><td>Loyer, part des enfants déduite</td><td class="num">1'620.00</td><td class="num">1'740.00</td></tr>
<tr><td>Assurance-maladie LAMal et LCA</td><td class="num">498.30</td><td class="num">462.80</td></tr>
<tr><td>Frais de transport</td><td class="num">70.00</td><td class="num">70.00</td></tr>
<tr><td>Impôts courants</td><td class="num">780.00</td><td class="num">1'390.00</td></tr>
<tr><td>Prévoyance privée, pilier 3a</td><td class="num">0.00</td><td class="num">250.00</td></tr>
<tr><td><b>Total des charges</b></td><td class="num"><b>4'318.30</b></td><td class="num"><b>5'112.80</b></td></tr>
<tr><td><b>Disponible</b></td><td class="num"><b>2'441.70</b></td><td class="num"><b>5'039.70</b></td></tr>
</table>
<p>Le bonus du défendeur, qui a été versé régulièrement au cours des trois dernières années, est pris en compte
dans son revenu. Le Tribunal n'impute en revanche pas de revenu hypothétique à la demanderesse: un taux d'activité
de 70 % est conforme aux lignes directrices du Tribunal fédéral pour un parent dont le cadet est scolarisé au degré
primaire (ATF 144 III 481 consid. 4.7.6), compte tenu de la garde alternée.</p>
<p><b>3.2</b> Les besoins des enfants comprennent le montant de base OP, une part au logement de chaque parent,
les primes d'assurance-maladie, les frais de garde parascolaire et les frais de cuisine scolaire. Les allocations
familiales sont déduites de ces besoins. La part de l'excédent revenant à chaque enfant est fixée à un cinquième,
en application de la méthode dite des grandes et petites têtes.</p>
<p><b>3.3</b> Les parents se partageant la prise en charge par moitié, la contribution en espèces est supportée
en proportion de leur capacité contributive respective, soit 67 % pour le père et 33 % pour la mère. Il en résulte
les montants suivants, qui s'entendent par mois et par enfant, allocations familiales non comprises:</p>
<table class="grid">
<tr><th>Enfant</th><th>Période</th><th class="num">Besoin non couvert (CHF)</th><th class="num">Allocations (CHF)</th><th class="num">Frais de garde (CHF)</th></tr>
${pensionRows}
</table>
<p>Compte tenu de ce qui précède, le défendeur sera condamné à verser en mains de la demanderesse, par mois et
d'avance, à titre de contribution à l'entretien de chacun des enfants, CHF 750.00 jusqu'à l'âge de 12 ans révolus,
CHF 820.00 de 12 à 16 ans et CHF 890.00 de 16 ans jusqu'à la majorité, voire au-delà en cas d'études sérieuses et
régulières, mais au plus tard jusqu'à 25 ans (art. 277 al. 2 CC). Ces montants seront indexés à l'indice suisse des
prix à la consommation chaque 1er janvier, la première fois le 1er janvier 2028 (art. 286 al. 1 CC).</p>
<p>Les frais extraordinaires des enfants (orthodontie, camps, cours de soutien) excédant CHF 300.00 par événement
seront partagés par moitié entre les parents, pour autant qu'ils aient été convenus préalablement.</p>
<p><b>4.</b> Aucune contribution d'entretien post-divorce n'est due entre les époux (art. 125 CC): la demanderesse
a conservé une activité lucrative substantielle durant toute la vie commune et est en mesure de pourvoir elle-même
à son entretien convenable. Elle y a d'ailleurs renoncé.</p>
<p><b>5.</b> Les avoirs de prévoyance professionnelle acquis pendant le mariage sont partagés par moitié
(art. 122 et 123 CC). La différence entre les prestations de sortie s'élève à CHF 76'484.25; la moitié, soit
CHF 38'242.15, sera transférée du compte de prévoyance du défendeur auprès de la Caisse de pension Brison
(n° d'assuré 7741-0093) sur le compte de prévoyance de la demanderesse auprès de la
Fondation collective LPP Romandie (n° d'assurée 31-0447-2290).</p>
<p><b>6.</b> S'agissant de la liquidation du régime matrimonial, les parties ont convenu que l'appartement en
propriété par étages de l'Avenue de Thônex 31, 1226 Thônex (feuillet n° 4482 de la commune de Thônex), serait vendu
et le bénéfice net partagé par moitié, après remboursement de la dette hypothécaire auprès de la Banque Cantonale de
Genève. Cet accord est conforme au droit et sera ratifié (art. 279 CPC).</p>
`,
    },
    {
      html: String.raw`
<h2>Par ces motifs, le Tribunal statuant sur divorce:</h2>
<ol>
<li>Dissout par le divorce le mariage contracté le 18 août 2012 à Carouge par Valérie Berthoud, née Jaquier le
14.06.1984, et Nicolas Berthoud, né le 02.11.1981.</li>
<li>Maintient l'autorité parentale conjointe sur les enfants Léa Berthoud, née le 23.03.2013, et Hugo Berthoud,
né le 08.09.2016.</li>
<li>Instaure une garde alternée sur les enfants, à exercer à raison d'une semaine sur deux, du vendredi à la sortie
de l'école au vendredi suivant, et de la moitié des vacances scolaires.</li>
<li>Fixe le domicile légal des enfants chez la mère, Chemin de la Gravière 6, 1227 Carouge.</li>
<li>Condamne Nicolas Berthoud à verser en mains de Valérie Berthoud, par mois et d'avance, allocations familiales
non comprises, à titre de contribution à l'entretien de chacun des enfants, CHF 750.00 jusqu'à 12 ans révolus,
CHF 820.00 de 12 à 16 ans et CHF 890.00 de 16 ans jusqu'à la majorité, voire au-delà en cas d'études sérieuses et
régulières, mais au plus tard jusqu'à 25 ans, sur le compte IBAN CH62 0078 8000 0541 2290 3 au nom de
Valérie Berthoud.</li>
<li>Dit que ces contributions seront indexées au 1er janvier de chaque année, la première fois le 1er janvier 2028.</li>
<li>Dit que les frais extraordinaires des enfants seront partagés par moitié, sur accord préalable.</li>
<li>Donne acte aux parties de ce qu'elles renoncent à toute contribution d'entretien post-divorce.</li>
<li>Ordonne à la Caisse de pension Brison de transférer le montant de CHF 38'242.15 du compte de prévoyance de
Nicolas Berthoud (n° d'assuré 7741-0093, AVS 756.2219.8034.61) sur le compte de prévoyance de Valérie Berthoud
auprès de la Fondation collective LPP Romandie (n° d'assurée 31-0447-2290, AVS 756.5903.1176.28).</li>
<li>Ratifie la convention partielle des parties du 9 septembre 2026 sur la liquidation du régime matrimonial.</li>
<li>Arrête les frais judiciaires à CHF 2'800.00, les met à la charge des parties par moitié et les compense avec
les avances fournies.</li>
<li>Dit qu'il n'est pas alloué de dépens (art. 107 al. 1 let. c CPC).</li>
<li>Déboute les parties de toutes autres conclusions.</li>
</ol>
<p>Siégeant: Mme Anne-Claude Rossier, juge; Mme Mélanie Pasche, greffière.</p>
<table class="facts">
<tr><th>La greffière</th><td>M. Pasche</td></tr>
<tr><th>La juge</th><td>A.-C. Rossier</td></tr>
</table>
<h2>Indication des voies de recours</h2>
<p>Conformément aux art. 308 ss CPC, le présent jugement peut faire l'objet d'un appel par-devant la Cour de
justice dans les 30 jours qui suivent sa notification. L'appel doit être formé par écrit et motivé, en joignant
une copie du présent jugement. Il doit être adressé au greffe de la Cour de justice, Chambre civile, case postale
3108, 1211 Genève 3.</p>
<p class="small">Communiqué à: Me Isabelle Charrière (pour Valérie Berthoud); Me Fabien Dumont (pour
Nicolas Berthoud); Service de protection des mineurs (SPMi); Office de l'état civil de Carouge; Caisse de pension Brison
et Fondation collective LPP Romandie (ch. 9 du dispositif, après entrée en force).</p>
<p class="small">Contact du greffe: melanie.pasche@justice-ge.example, tél. 022 555 92 14</p>
`,
    },
  ],
  values: [
    { text: 'BERTHOUD VALÉRIE', category: 'PERSON' },
    { text: 'BERTHOUD NICOLAS', category: 'PERSON' },
    { text: 'Berthoud', category: 'PERSON' },
    { text: 'C/18422/2025', category: 'ID' },
    { text: 'JTPI/12873/2026', category: 'ID' },
    { text: 'JTPI/6120/2025', category: 'ID' },
    { text: 'Anne-Claude Rossier', category: 'PERSON' },
    { text: 'A.-C. Rossier', category: 'PERSON' },
    { text: 'Mélanie Pasche', category: 'PERSON' },
    { text: 'M. Pasche', category: 'PERSON' },
    { text: 'Valérie Berthoud', category: 'PERSON' },
    { text: 'Valérie Jaquier', category: 'PERSON' },
    { text: 'Jaquier', category: 'PERSON' },
    { text: 'Valérie', category: 'PERSON' },
    { text: '14 juin 1984', category: 'DATE' },
    { text: '14.06.1984', category: 'DATE' },
    { text: 'Chemin de la Gravière 6', category: 'ADDRESS' },
    { text: '1227 Carouge', category: 'ADDRESS' },
    { text: 'Isabelle Charrière', category: 'PERSON' },
    { text: 'Étude Charrière & Vuilleumier', category: 'COMPANY' },
    { text: 'Rue du Rhône 54', category: 'ADDRESS' },
    { text: '1204 Genève', category: 'ADDRESS' },
    { text: 'Nicolas Berthoud', category: 'PERSON' },
    { text: 'Nicolas', category: 'PERSON' },
    { text: '2 novembre 1981', category: 'DATE' },
    { text: '02.11.1981', category: 'DATE' },
    { text: 'Rue de Lyon 88', category: 'ADDRESS' },
    { text: '1203 Genève', category: 'ADDRESS' },
    { text: 'Fabien Dumont', category: 'PERSON' },
    { text: 'Dumont Avocats SA', category: 'COMPANY' },
    { text: 'Boulevard Helvétique 19', category: 'ADDRESS' },
    { text: '1207 Genève', category: 'ADDRESS' },
    { text: 'Léa Berthoud', category: 'PERSON' },
    { text: 'Léa', category: 'PERSON' },
    { text: '23 mars 2013', category: 'DATE' },
    { text: '23.03.2013', category: 'DATE' },
    { text: 'Hugo Berthoud', category: 'PERSON' },
    { text: 'Hugo', category: 'PERSON' },
    { text: '8 septembre 2016', category: 'DATE' },
    { text: '08.09.2016', category: 'DATE' },
    { text: 'Avenue de Thônex 31', category: 'ADDRESS' },
    { text: '1226 Thônex', category: 'ADDRESS' },
    { text: 'feuillet n° 4482', category: 'ID' },
    { text: 'Brison Ingénierie SA', category: 'COMPANY' },
    { text: 'Caisse de pension Brison', category: 'COMPANY' },
    { text: 'Pharmacie du Rondeau Sàrl', category: 'COMPANY' },
    { text: 'Fondation collective LPP Romandie', category: 'COMPANY' },
    { text: '31-0447-2290', category: 'ID' },
    { text: '7741-0093', category: 'ID' },
    { text: 'CH62 0078 8000 0541 2290 3', category: 'IBAN' },
    { text: '756.2219.8034.61', category: 'AHV' },
    { text: '756.5903.1176.28', category: 'AHV' },
    { text: 'melanie.pasche@justice-ge.example', category: 'EMAIL' },
    { text: '022 555 92 14', category: 'PHONE' },
  ],
  keep: ['art. 114 CC', 'art. 285 al. 1 CC', 'art. 277 al. 2 CC', 'autorité parentale conjointe', 'garde alternée',
    'ATF 147 III 265', 'minimum vital du droit de la famille', 'art. 122 et 123 CC', 'participation aux acquêts',
    'art. 308 ss CPC'],
};
