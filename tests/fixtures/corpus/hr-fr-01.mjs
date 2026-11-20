const DEDUCTIONS = [
  ['AVS/AI/APG', '6 200.00', '5.30 %', '328.60'],
  ['Assurance-chômage (AC)', '6 200.00', '1.10 %', '68.20'],
  ['Assurance accidents non professionnels (AANP)', '6 200.00', '1.27 %', '78.74'],
  ['Indemnité journalière maladie (IJM)', '6 200.00', '0.60 %', '37.20'],
  ['Prévoyance professionnelle LPP (plan B)', '', 'forfait', '285.40'],
];

export default {
  id: 'hr-fr-01',
  domain: 'hr',
  language: 'fr',
  title: 'Fiche de salaire et certificat de salaire',
  header: 'ATELIER MERMOUD SA | Ressources humaines | PERRENOUD JULIEN',
  footer: 'Confidentiel - document destiné au collaborateur no 2219',
  parts: [
    {
      html: String.raw`
<p class="small">Atelier Mermoud SA, Rue du Lac 18, 1800 Vevey, IDE CHE-204.771.358</p>
<p class="right">Monsieur Julien Perrenoud<br>Chemin des Vignes 5<br>1814 La Tour-de-Peilz</p>
<h1>Fiche de salaire - septembre 2026</h1>
<table class="facts">
<tr><th>Collaborateur</th><td>Julien Perrenoud, no 2219</td></tr>
<tr><th>Date de naissance</th><td>21.05.1992</td></tr>
<tr><th>Numéro AVS</th><td>756.8194.2275.06</td></tr>
<tr><th>Fonction</th><td>Polisseur qualifié, taux d'activité 100 %</td></tr>
<tr><th>Entrée</th><td>01.03.2019</td></tr>
<tr><th>Période</th><td>01.09.2026 - 30.09.2026, versement le 25.09.2026</td></tr>
</table>
<table class="grid">
<tr><th>Rubrique</th><th>Base CHF</th><th>Taux</th><th>Montant CHF</th></tr>
<tr><td>Salaire mensuel</td><td></td><td></td><td>6 200.00</td></tr>
<tr><td><b>Salaire brut</b></td><td></td><td></td><td><b>6 200.00</b></td></tr>
${DEDUCTIONS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
<tr><td><b>Total des déductions</b></td><td></td><td></td><td><b>- 798.14</b></td></tr>
<tr><td><b>Salaire net</b></td><td></td><td></td><td><b>5 401.86</b></td></tr>
<tr><td>Allocations familiales (2 enfants, canton de Vaud)</td><td></td><td></td><td>300.00</td></tr>
<tr><td><b>Montant versé</b></td><td></td><td></td><td><b>5 701.86</b></td></tr>
</table>
<p>Calcul de la cotisation AVS/AI/APG à la charge du salarié:</p>
<tex display>\mathrm{AVS} = 6200 \cdot 0.053 = 328.60</tex>
<p>Le salaire net résulte de <tex>N = B - \sum_{i=1}^{5} d_i</tex>, où <tex>B</tex> est le salaire brut et
<tex>d_i</tex> les déductions ci-dessus.</p>
<table class="facts">
<tr><th>Versement</th><td>IBAN CH62 0900 0000 1457 3388 1, titulaire Julien Perrenoud</td></tr>
<tr><th>Solde vacances</th><td>11.5 jours au 30.09.2026</td></tr>
<tr><th>Heures supplémentaires</th><td>6.25 heures, à compenser</td></tr>
</table>
<p class="small">Questions: Corinne Delessert, responsable RH, corinne.delessert@mermoud.example, 021 555 74 30.
Les taux AANP et IJM correspondent aux contrats d'assurance 2026 de l'entreprise.</p>
`,
    },
    {
      html: String.raw`
<h1>Certificat de salaire 2025 (Formulaire 11)</h1>
<table class="facts">
<tr><th>A</th><td>Certificat de salaire</td></tr>
<tr><th>C</th><td>Numéro AVS: 756.8194.2275.06</td></tr>
<tr><th>D</th><td>Année: 2025, du 01.01.2025 au 31.12.2025</td></tr>
<tr><th>F</th><td>Transport gratuit entre domicile et lieu de travail: non</td></tr>
<tr><th>G</th><td>Repas à la cantine / chèques-repas: non</td></tr>
<tr><th>H</th><td>Monsieur Julien Perrenoud, Chemin des Vignes 5, 1814 La Tour-de-Peilz</td></tr>
</table>
<table class="grid">
<tr><th>Chiffre</th><th>Désignation</th><th>CHF</th></tr>
<tr><td>1.</td><td>Salaire / rente</td><td>80 600</td></tr>
<tr><td>2.1</td><td>Prestations salariales accessoires: repas, logement</td><td>0</td></tr>
<tr><td>3.</td><td>Prestations non périodiques (prime d'ancienneté)</td><td>1 500</td></tr>
<tr><td>8.</td><td>Salaire brut total</td><td>82 100</td></tr>
<tr><td>9.</td><td>Cotisations AVS/AI/APG/AC/AANP</td><td>6 296</td></tr>
<tr><td>10.1</td><td>Prévoyance professionnelle, cotisations ordinaires</td><td>3 425</td></tr>
<tr><td>11.</td><td>Salaire net</td><td>72 379</td></tr>
<tr><td>13.1.1</td><td>Frais effectifs: voyage, repas, nuitées</td><td>0</td></tr>
<tr><td>13.2.1</td><td>Frais forfaitaires de représentation</td><td>0</td></tr>
</table>
<p>Chiffre 15, observations: allocations familiales de CHF 3 600 versées par la caisse d'allocations
familiales et non comprises dans le salaire brut. Le collaborateur a été absent pour cause d'accident du
14.04.2025 au 02.05.2025 (indemnités journalières LAA versées à l'employeur).</p>
<div class="as-image stamp">ATELIER MERMOUD SA<br>Rue du Lac 18 - 1800 Vevey<br>Tél. 021 555 74 00</div>
<p>Lieu et date: Vevey, 28.01.2026 &nbsp;&nbsp; Personne de contact: Corinne Delessert, tél. 021 555 74 30</p>
<div class="as-image signature">C. Delessert</div>
`,
    },
  ],
  values: [
    { text: 'ATELIER MERMOUD SA', category: 'COMPANY' },
    { text: 'Atelier Mermoud SA', category: 'COMPANY' },
    { text: 'CHE-204.771.358', category: 'ID' },
    { text: 'Rue du Lac 18', category: 'ADDRESS' },
    { text: '1800 Vevey', category: 'ADDRESS' },
    { text: '021 555 74 00', category: 'PHONE' },
    { text: 'PERRENOUD JULIEN', category: 'PERSON' },
    { text: 'Julien Perrenoud', category: 'PERSON' },
    { text: 'Chemin des Vignes 5', category: 'ADDRESS' },
    { text: '1814 La Tour-de-Peilz', category: 'ADDRESS' },
    { text: 'no 2219', category: 'ID' },
    { text: '21.05.1992', category: 'DATE' },
    { text: '756.8194.2275.06', category: 'AHV' },
    { text: 'CH62 0900 0000 1457 3388 1', category: 'IBAN' },
    { text: 'Corinne Delessert', category: 'PERSON' },
    { text: 'C. Delessert', category: 'PERSON' },
    { text: 'corinne.delessert@mermoud.example', category: 'EMAIL' },
    { text: '021 555 74 30', category: 'PHONE' },
  ],
  keep: ['AVS/AI/APG', 'Prévoyance professionnelle LPP', 'Assurance-chômage (AC)', 'AANP', 'Formulaire 11',
    'Allocations familiales', 'Salaire brut total', 'indemnités journalières LAA'],
};
