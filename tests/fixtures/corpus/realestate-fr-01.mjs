const ROOMS = [
  ['Hall d\'entrée', [
    ['Porte palière', 'Bon', 'Serrure Kaba, judas, butée de porte en ordre'],
    ['Sol (parquet chêne)', 'Bon', 'Légères rayures d\'usage devant l\'armoire'],
    ['Murs et plafond', 'Bon', 'Peinture blanche refaite en 2024'],
    ['Armoire murale', 'Bon', '2 portes, 4 tablettes, tringle'],
    ['Interphone / vidéophone', 'Bon', 'Testé, fonctionne'],
  ]],
  ['Séjour', [
    ['Sol (parquet chêne)', 'Bon', 'Rayure de 15 cm près de la porte-fenêtre (photo 1)'],
    ['Murs', 'Moyen', '6 trous de chevilles comblés, traces de cadres au mur nord'],
    ['Plafond', 'Bon', 'Sans remarque'],
    ['Fenêtres et porte-fenêtre', 'Bon', 'Double vitrage, joints en ordre, stores à lamelles électriques'],
    ['Radiateurs', 'Bon', 'Vannes thermostatiques, purgés'],
    ['Prises et interrupteurs', 'Bon', '1 cache de prise fissuré à côté de la porte'],
  ]],
  ['Cuisine', [
    ['Plan de travail (granit)', 'Moyen', 'Brûlure de 2 cm près de l\'évier (photo 3)'],
    ['Agencement, portes et tiroirs', 'Bon', 'Charnière du meuble haut gauche à régler'],
    ['Plaque vitrocéramique', 'Bon', '4 zones, sans rayure'],
    ['Four et micro-ondes', 'Bon', '2 plaques et 1 grille fournies'],
    ['Lave-vaisselle', 'Bon', 'Testé, programme court'],
    ['Réfrigérateur / congélateur', 'Bon', 'Clayettes complètes, bac à légumes fissuré'],
    ['Hotte de ventilation', 'Bon', 'Filtres neufs posés le 28.09.2026'],
    ['Carrelage mural', 'Bon', 'Joints propres'],
  ]],
  ['Chambre 1', [
    ['Sol (parquet)', 'Bon', 'Sans remarque'],
    ['Murs et plafond', 'Bon', 'Repeints avant l\'entrée'],
    ['Fenêtre', 'Bon', 'Store à lamelles manuel, sangle neuve'],
    ['Armoire encastrée', 'Bon', '3 portes coulissantes'],
  ]],
  ['Chambre 2', [
    ['Sol (parquet)', 'Moyen', 'Tache d\'humidité de 10 x 6 cm sous la fenêtre (photo 2)'],
    ['Murs', 'Moyen', 'Moisissure légère dans l\'angle nord-est, traitée le 25.09.2026'],
    ['Fenêtre', 'Bon', 'Store à lamelles manuel'],
  ]],
  ['Chambre 3', [
    ['Sol (moquette)', 'Usé', 'Moquette de 2011, usure normale, décolorée près de la fenêtre'],
    ['Murs et plafond', 'Bon', 'Papier peint ingrain peint en blanc'],
    ['Fenêtre', 'Bon', 'Sans remarque'],
  ]],
  ['Salle de bains', [
    ['Baignoire', 'Moyen', 'Éclat d\'émail de 5 mm sur le rebord (photo 4)'],
    ['Lavabo et robinetterie', 'Bon', 'Mitigeur neuf, siphon en ordre'],
    ['WC', 'Bon', 'Abattant neuf'],
    ['Armoire de toilette', 'Bon', 'Éclairage fonctionne, miroir sans défaut'],
    ['Carrelage et joints', 'Moyen', 'Joints de la baignoire jaunis, silicone à renouveler'],
    ['Ventilation', 'Bon', 'Fonctionne avec l\'interrupteur'],
  ]],
  ['WC séparé', [
    ['WC et lave-mains', 'Bon', 'Sans remarque'],
    ['Sol et murs', 'Bon', 'Carrelage complet'],
  ]],
  ['Balcon', [
    ['Sol (dalles)', 'Bon', '1 dalle fissurée côté gauche'],
    ['Garde-corps', 'Bon', 'Sans remarque'],
    ['Store solaire (tente)', 'Moyen', 'Toile délavée, manivelle fournie (photo 5)'],
  ]],
  ['Cave n° 32', [
    ['Porte et cadenas', 'Bon', 'Cadenas remis par la locataire précédente, 2 clés'],
    ['Sol et murs', 'Bon', 'Cave vide et balayée'],
  ]],
];

const PHOTOS = [
  ['Photo 1', 'Séjour, parquet devant la porte-fenêtre: rayure de 15 cm', '30.09.2026 14:05'],
  ['Photo 2', 'Chambre 2, sol sous la fenêtre: tache d\'humidité 10 x 6 cm', '30.09.2026 14:18'],
  ['Photo 3', 'Cuisine, plan de travail: brûlure de 2 cm près de l\'évier', '30.09.2026 14:22'],
  ['Photo 4', 'Salle de bains, rebord de la baignoire: éclat d\'émail 5 mm', '30.09.2026 14:31'],
  ['Photo 5', 'Balcon, store solaire: toile délavée', '30.09.2026 14:40'],
];

const roomTable = (name, rows) => `<h3>${name}</h3>
<table class="grid">
<tr><th>Élément</th><th>État</th><th>Remarques</th></tr>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>`;

export default {
  id: 'realestate-fr-01',
  domain: 'realestate',
  language: 'fr',
  title: 'État des lieux d\'entrée',
  header: 'RÉGIE BELVÉDÈRE GESTION SA | État des lieux d\'entrée | Locataire: MORAND LÉA | Objet 1207.03.32',
  footer: 'État des lieux - Chemin de Bois-Gentil 14, 1018 Lausanne - à conserver jusqu\'à la fin du bail',
  parts: [
    {
      html: String.raw`
<p class="small">Régie Belvédère Gestion SA, Avenue de la Gare 18, 1003 Lausanne, tél. 021 555 34 00, gerance@belvedere-gestion.example</p>
<h1>État des lieux d'entrée</h1>
<table class="facts">
<tr><th>Objet</th><td>Appartement de 4.5 pièces, 3e étage, n° 32, Chemin de Bois-Gentil 14, 1018 Lausanne</td></tr>
<tr><th>Référence</th><td>Objet 1207.03.32, bail n° BL-2026-5512</td></tr>
<tr><th>Propriétaire</th><td>SI Les Cèdres de Bois-Gentil SA, représentée par la gérance</td></tr>
<tr><th>Gérance</th><td>Régie Belvédère Gestion SA, gérant technique M. Nicolas Favre, nicolas.favre@belvedere-gestion.example, 021 555 34 17</td></tr>
<tr><th>Nouvelle locataire</th><td>Mme Léa Morand, née le 11.06.1993, Rue du Simplon 7, 1006 Lausanne (adresse précédente), lea.morand@example.ch, 079 555 71 26</td></tr>
<tr><th>Locataire précédent</th><td>M. Antoine Rochat, nouvelle adresse Route de Berne 52, 1010 Lausanne</td></tr>
<tr><th>Début du bail</th><td>1er octobre 2026</td></tr>
<tr><th>Date et heure de l'état des lieux</th><td>30 septembre 2026, 13:45 à 15:20</td></tr>
<tr><th>Présents</th><td>M. Nicolas Favre (gérance), Mme Léa Morand (locataire), M. Antoine Rochat (locataire sortant, jusqu'à 14:00)</td></tr>
</table>
<h2>Base légale et portée</h2>
<p>Le présent état des lieux est établi contradictoirement lors de la remise de la chose louée. Il constate
l'état de l'appartement et de ses dépendances au début du bail et sert de référence lors de la restitution.
La locataire peut signaler par écrit, dans un délai de 10 jours dès l'entrée en jouissance, les défauts qui
n'auraient pas été constatés ce jour (Règles et usages locatifs du canton de Vaud, RULV, art. 3). Selon
l'art. 256a CO, la locataire peut exiger de consulter le procès-verbal de l'état des lieux dressé lors de la
restitution au précédent locataire, ainsi que le montant du loyer précédent.</p>
<p>Les défauts mentionnés ci-dessous qui ne sont pas réparés par le bailleur ne pourront pas être imputés à la
locataire lors de sa sortie. La locataire ne répond pas de l'usure normale résultant d'un usage conforme au
contrat (art. 267 CO). Pour l'évaluation de la durée de vie des installations, les parties se réfèrent au
tableau paritaire des amortissements de l'ASLOCA et de l'USPI.</p>
<p>Légende de l'état: <b>Neuf</b>, <b>Bon</b>, <b>Moyen</b> (défaut mineur), <b>Usé</b> (usure normale
avancée), <b>Défectueux</b> (réparation nécessaire).</p>
<h2>Relevés des compteurs</h2>
<table class="grid">
<tr><th>Compteur</th><th>Numéro</th><th>Relevé au 30.09.2026</th></tr>
<tr><td>Électricité (Services industriels de Lausanne)</td><td>SIL-7702-48815</td><td>28'412 kWh (tarif haut), 19'077 kWh (tarif bas)</td></tr>
<tr><td>Eau chaude (répartiteur)</td><td>WZ 41-90233</td><td>311.4 m³</td></tr>
<tr><td>Répartiteurs de chauffage</td><td>HKV 32-01 à 32-05</td><td>remis à zéro le 30.09.2026</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>Constat pièce par pièce</h2>
${ROOMS.slice(0, 5).map(([name, rows]) => roomTable(name, rows)).join('\n')}
`,
    },
    {
      html: String.raw`
${ROOMS.slice(5).map(([name, rows]) => roomTable(name, rows)).join('\n')}
<h2>Clés remises</h2>
<table class="grid">
<tr><th>Type</th><th>Nombre</th><th>Numéros</th></tr>
<tr><td>Clés appartement / immeuble (Kaba 20)</td><td>3</td><td>K 1207-32-1 à K 1207-32-3</td></tr>
<tr><td>Clés boîte aux lettres</td><td>2</td><td>-</td></tr>
<tr><td>Badge buanderie</td><td>1</td><td>B-0932</td></tr>
<tr><td>Clés cave (cadenas)</td><td>2</td><td>-</td></tr>
</table>
<h2>Travaux à charge du bailleur</h2>
<ol>
<li>Remplacement du silicone de la baignoire et réparation de l'éclat d'émail, d'ici au 31 octobre 2026.</li>
<li>Recherche de la cause de l'humidité dans la chambre 2 (contrôle de l'isolation de l'embrasure), mandat
attribué à l'entreprise Lavaux Bâtiment Sàrl.</li>
<li>Réglage de la charnière du meuble haut de la cuisine et remplacement du bac à légumes.</li>
<li>Remplacement de la dalle fissurée du balcon lors de la prochaine campagne d'entretien.</li>
</ol>
<p>Les défauts relevés dans le présent état des lieux qui ne sont pas réparés ne constituent pas une
acceptation de la chose dans un état défectueux; les droits de la locataire selon les art. 259a ss CO sont
réservés.</p>
`,
    },
    {
      html: String.raw`
<h2>Photos annexées</h2>
<p>Les photos ci-dessous ont été prises par la gérance lors de l'état des lieux avec la tablette de la régie
et font partie intégrante du présent document.</p>
${PHOTOS.map(([n, caption, time]) => `<div class="as-image">${n} - ${caption}<br>${time} - Ch. de Bois-Gentil 14, app. 32 - N. Favre</div><br>`).join('\n')}
<h2>Remarques de la locataire</h2>
<p>Mme Morand signale que la sonnette de la porte palière est faible et qu'une odeur de tabac persiste dans la
chambre 3. Elle demande le nettoyage de la moquette ou son remplacement. La gérance prend note de la demande
et répondra par écrit d'ici au 15 octobre 2026.</p>
<h2>Signatures</h2>
<p>Le présent état des lieux a été établi en deux exemplaires, lu et approuvé par les parties. Un exemplaire
est remis à la locataire. En cas de désaccord sur un point, il est mentionné ci-dessus; à défaut d'entente,
la commission de conciliation en matière de baux à loyer du district de Lausanne peut être saisie.</p>
<table class="grid">
<tr><th>Pour la gérance</th><th>La locataire</th><th>Le locataire sortant</th></tr>
<tr><td>Nicolas Favre</td><td>Léa Morand</td><td>Antoine Rochat (constats jusqu'à 14:00)</td></tr>
</table>
<div class="as-image signature">N. Favre &nbsp;&nbsp;&nbsp;&nbsp; L. Morand &nbsp;&nbsp;&nbsp;&nbsp; A. Rochat</div>
<p>Lausanne, le 30 septembre 2026</p>
<div class="as-image stamp">RÉGIE BELVÉDÈRE GESTION SA<br>Avenue de la Gare 18 - 1003 Lausanne</div>
<p class="small">Garantie de loyer: CHF 6'150.00 déposés sur le compte de garantie n° 0452-118870-01 au nom de
Léa Morand. Restitution selon l'art. 257e CO.</p>
`,
    },
  ],
  values: [
    { text: 'MORAND LÉA', category: 'PERSON' },
    { text: 'Léa Morand', category: 'PERSON' },
    { text: 'L. Morand', category: 'PERSON' },
    { text: '11.06.1993', category: 'DATE' },
    { text: 'Rue du Simplon 7', category: 'ADDRESS' },
    { text: '1006 Lausanne', category: 'ADDRESS' },
    { text: 'lea.morand@example.ch', category: 'EMAIL' },
    { text: '079 555 71 26', category: 'PHONE' },
    { text: 'Antoine Rochat', category: 'PERSON' },
    { text: 'A. Rochat', category: 'PERSON' },
    { text: 'Route de Berne 52', category: 'ADDRESS' },
    { text: '1010 Lausanne', category: 'ADDRESS' },
    { text: 'Nicolas Favre', category: 'PERSON' },
    { text: 'N. Favre', category: 'PERSON' },
    { text: 'nicolas.favre@belvedere-gestion.example', category: 'EMAIL' },
    { text: '021 555 34 17', category: 'PHONE' },
    { text: 'Régie Belvédère Gestion SA', category: 'COMPANY' },
    { text: 'RÉGIE BELVÉDÈRE GESTION SA', category: 'COMPANY' },
    { text: 'Avenue de la Gare 18', category: 'ADDRESS' },
    { text: '1003 Lausanne', category: 'ADDRESS' },
    { text: '021 555 34 00', category: 'PHONE' },
    { text: 'gerance@belvedere-gestion.example', category: 'EMAIL' },
    { text: 'SI Les Cèdres de Bois-Gentil SA', category: 'COMPANY' },
    { text: 'Chemin de Bois-Gentil 14', category: 'ADDRESS' },
    { text: 'Ch. de Bois-Gentil 14', category: 'ADDRESS' },
    { text: '1018 Lausanne', category: 'ADDRESS' },
    { text: '1207.03.32', category: 'ID' },
    { text: 'BL-2026-5512', category: 'ID' },
    { text: 'SIL-7702-48815', category: 'ID' },
    { text: 'WZ 41-90233', category: 'ID' },
    { text: 'B-0932', category: 'ID' },
    { text: 'K 1207-32-1', category: 'ID' },
    { text: 'K 1207-32-3', category: 'ID' },
    { text: 'Lavaux Bâtiment Sàrl', category: 'COMPANY' },
    { text: '0452-118870-01', category: 'ACCOUNT' },
  ],
  keep: ['art. 256a CO', 'art. 267 CO', 'art. 257e CO', 'usure normale', 'RULV', 'tableau paritaire des amortissements',
    'Plaque vitrocéramique', 'Répartiteurs de chauffage'],
};
