export default {
  id: 'medicine-fr-01',
  domain: 'medicine',
  language: 'fr',
  title: 'Ordonnance et lettre de transfert',
  header: 'CENTRE HOSPITALIER DU LÉMAN | Service de médecine interne | Patient: FAVRE JEAN-LUC, né le 07.08.1952',
  footer: 'Confidentiel - J.-L. Favre - N° de séjour 26-0091734',
  parts: [
    {
      html: String.raw`
<div class="as-image">CENTRE HOSPITALIER DU LÉMAN<br>Service de médecine interne<br>Avenue de la Gare 40, 1009 Pully</div>
<p class="right">Pully, le 21 septembre 2026</p>
<h1>Ordonnance médicale</h1>
<table class="facts">
<tr><th>Patient</th><td>M. Jean-Luc Favre, né le 07.08.1952</td></tr>
<tr><th>Adresse</th><td>Chemin des Vignes 5, 1095 Lutry</td></tr>
<tr><th>N° AVS</th><td>756.3067.5521.48</td></tr>
<tr><th>N° de séjour</th><td>26-0091734</td></tr>
<tr><th>Assurance</th><td>Caisse-maladie Romandie Santé SA, n° d'assuré 4410-772-019</td></tr>
<tr><th>Poids</th><td>78 kg, clairance de la créatinine 52 ml/min</td></tr>
</table>
<table class="grid">
<tr><th>Médicament</th><th>Dosage</th><th>Posologie</th><th>Durée</th></tr>
<tr><td>Apixaban (Eliquis)</td><td>2.5 mg</td><td>1-0-1</td><td>au long cours</td></tr>
<tr><td>Bisoprolol</td><td>5 mg</td><td>1-0-0</td><td>au long cours</td></tr>
<tr><td>Furosémide</td><td>40 mg</td><td>1-1-0</td><td>jusqu'au contrôle</td></tr>
<tr><td>Spironolactone</td><td>25 mg</td><td>1-0-0</td><td>au long cours</td></tr>
<tr><td>Amoxicilline/acide clavulanique</td><td>1 g</td><td>1-1-1</td><td>5 jours (jusqu'au 26.09.2026)</td></tr>
<tr><td>Paracétamol</td><td>1 g</td><td>en réserve, max. 3 g/24 h</td><td>10 jours</td></tr>
<tr><td>Enoxaparine</td><td>-</td><td>stop (relais par Apixaban)</td><td>-</td></tr>
</table>
<p>Non substituable: Apixaban. Renouvelable 3 fois.</p>
<p>Dr méd. Nathalie Rochat, cheffe de clinique, médecine interne<br>N° GLN 7601000555123<br>
nathalie.rochat@ch-leman.example, tél. +41 21 555 63 20</p>
<div class="as-image signature">TIMBRE - Centre hospitalier du Léman - Dr N. Rochat - GLN 7601000555123</div>
`,
    },
    {
      html: String.raw`
<h1>Lettre de transfert</h1>
<p>Clinique de réadaptation Les Pléiades SA<br>À l'att. du Dr méd. Olivier Bersier<br>Route du Signal 12<br>1807 Blonay</p>
<p>Cher Confrère,</p>
<p>Nous vous adressons M. Favre, 74 ans, hospitalisé du 09.09.2026 au 21.09.2026 dans notre service pour une
décompensation cardiaque gauche sur fibrillation auriculaire rapide, compliquée d'une pneumonie basale droite.</p>
<h2>Diagnostics</h2>
<ol>
<li>Insuffisance cardiaque à fraction d'éjection réduite (FEVG 35 %), NYHA III à l'entrée</li>
<li>Fibrillation auriculaire nouvellement diagnostiquée, CHA₂DS₂-VASc 4, HAS-BLED 2</li>
<li>Pneumonie communautaire basale droite, CURB-65 à 2</li>
<li>Insuffisance rénale chronique stade G3a</li>
</ol>
<h2>Évolution</h2>
<p>Bonne réponse au traitement diurétique intraveineux avec une perte de poids de 6 kg. Contrôle de la fréquence
par bisoprolol. Anticoagulation par enoxaparine, relayée par apixaban 2.5 mg deux fois par jour au vu de l'âge
et de la fonction rénale. Antibiothérapie par amoxicilline/acide clavulanique, CRP en baisse de 184 à 22 mg/l.</p>
<h2>Situation sociale</h2>
<p>Le patient vit seul. Sa fille, Mme Céline Favre Dubois, 1003 Lausanne, tél. 079 555 41 87,
celine.favre@example.ch, est sa personne de référence et dispose d'une procuration. Le médecin traitant est
le Dr méd. Pierre-André Monnier, Cabinet médical de Lutry, Grand-Rue 18, 1095 Lutry.</p>
<h2>Propositions</h2>
<ul>
<li>Réadaptation cardiaque, mobilisation progressive</li>
<li>Pesée quotidienne, restriction hydrique à 1.5 l/j</li>
<li>Contrôle de la kaliémie et de la créatinine dans une semaine sous spironolactone</li>
<li>Échocardiographie de contrôle dans 3 mois, discussion d'un ARNI (sacubitril/valsartan)</li>
</ul>
<p>Nous restons à votre disposition pour tout renseignement.</p>
<p>Avec nos meilleures salutations confraternelles.</p>
<p>Dr méd. Nathalie Rochat, cheffe de clinique<br>Prof. Dr méd. Étienne Gavillet, médecin chef de service</p>
<p class="small">Copie: Dr méd. Pierre-André Monnier; Mme Céline Favre Dubois (avec l'accord du patient)</p>
`,
    },
  ],
  values: [
    { text: 'FAVRE JEAN-LUC', category: 'PERSON' },
    { text: 'Jean-Luc Favre', category: 'PERSON' },
    { text: 'J.-L. Favre', category: 'PERSON' },
    { text: '07.08.1952', category: 'DATE' },
    { text: 'Chemin des Vignes 5', category: 'ADDRESS' },
    { text: '1095 Lutry', category: 'ADDRESS' },
    { text: '756.3067.5521.48', category: 'AHV' },
    { text: '26-0091734', category: 'ID' },
    { text: 'Caisse-maladie Romandie Santé SA', category: 'COMPANY' },
    { text: '4410-772-019', category: 'ID' },
    { text: 'Nathalie Rochat', category: 'PERSON' },
    { text: 'N. Rochat', category: 'PERSON' },
    { text: '7601000555123', category: 'ID' },
    { text: 'nathalie.rochat@ch-leman.example', category: 'EMAIL' },
    { text: '+41 21 555 63 20', category: 'PHONE' },
    { text: 'Clinique de réadaptation Les Pléiades SA', category: 'COMPANY' },
    { text: 'Olivier Bersier', category: 'PERSON' },
    { text: 'Route du Signal 12', category: 'ADDRESS' },
    { text: '1807 Blonay', category: 'ADDRESS' },
    { text: 'Céline Favre Dubois', category: 'PERSON' },
    { text: '1003 Lausanne', category: 'ADDRESS' },
    { text: '079 555 41 87', category: 'PHONE' },
    { text: 'celine.favre@example.ch', category: 'EMAIL' },
    { text: 'Pierre-André Monnier', category: 'PERSON' },
    { text: 'Cabinet médical de Lutry', category: 'COMPANY' },
    { text: 'Grand-Rue 18', category: 'ADDRESS' },
    { text: 'Étienne Gavillet', category: 'PERSON' },
    { text: 'CENTRE HOSPITALIER DU LÉMAN', category: 'COMPANY' },
    { text: 'Centre hospitalier du Léman', category: 'COMPANY' },
    { text: 'Avenue de la Gare 40', category: 'ADDRESS' },
    { text: '1009 Pully', category: 'ADDRESS' },
  ],
  keep: ['Apixaban', '2.5 mg', 'Bisoprolol', 'Furosémide', 'Amoxicilline/acide clavulanique', 'fibrillation auriculaire',
    'FEVG 35 %', 'CURB-65', 'sacubitril/valsartan', 'Insuffisance cardiaque'],
};
