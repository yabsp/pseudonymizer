const TRANCHE_B = 32000000;
const AMORTISATION_PER_QUARTER = 255555;
const RATE_B = 0.0175;

const pad = (n) => String(n).padStart(2, '0');
const chf = (cents) => {
  const francs = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${francs}.${pad(cents % 100)}`;
};

const QUARTER_ENDS = ['31.03', '30.06', '30.09', '31.12'];
const amortisationRows = [];
let capital = TRANCHE_B;
for (let q = 0; q < 60; q++) {
  const year = 2027 + Math.floor(q / 4);
  const interest = Math.round((capital * RATE_B) / 4);
  const amortisation = q < 59 ? AMORTISATION_PER_QUARTER : Math.min(AMORTISATION_PER_QUARTER, capital - 16666700);
  const end = capital - amortisation;
  amortisationRows.push(`<tr><td>${q + 1}</td><td>${QUARTER_ENDS[q % 4]}.${year}</td><td class="num">${chf(capital)}</td>`
    + `<td class="num">${chf(interest)}</td><td class="num">${chf(amortisation)}</td><td class="num">${chf(interest + amortisation)}</td>`
    + `<td class="num">${chf(end)}</td></tr>`);
  capital = end;
}

export default {
  id: 'banking-fr-01',
  domain: 'banking',
  language: 'fr',
  title: 'Contrat de crédit hypothécaire',
  header: 'CAISSE HYPOTHÉCAIRE DE LA VENOGE SA | Contrat n° HYP-2026-50417 | FAVRE JULIEN ET FAVRE-ROCHAT SOPHIE',
  footer: 'Contrat de crédit hypothécaire HYP-2026-50417 - Confidentiel',
  parts: [
    {
      html: String.raw`
<p class="small">Caisse Hypothécaire de la Venoge SA, Rue du Simplon 18, 1110 Morges</p>
<h1>Contrat de crédit hypothécaire</h1>
<p>Le présent contrat est conclu entre la Caisse Hypothécaire de la Venoge SA (ci-après « la Banque ») et les
emprunteurs désignés ci-dessous, solidairement responsables (ci-après « les Emprunteurs »). Il est régi par les
art. 312 ss CO relatifs au prêt de consommation et par les conditions générales de la Banque.</p>
<h2>1. Emprunteurs</h2>
<table class="grid">
<tr><th></th><th>Emprunteur 1</th><th>Emprunteuse 2</th></tr>
<tr><th>Nom, prénom</th><td>Favre Julien</td><td>Favre-Rochat Sophie</td></tr>
<tr><th>Date de naissance</th><td>08.04.1982</td><td>27.01.1985</td></tr>
<tr><th>Adresse</th><td>Chemin des Vignes 12, 1095 Lutry</td><td>Chemin des Vignes 12, 1095 Lutry</td></tr>
<tr><th>N° AVS</th><td>756.3318.9024.66</td><td>756.7102.4458.31</td></tr>
<tr><th>Employeur</th><td>Logiciels Riviera SA, Vevey</td><td>Clinique dentaire du Port Sàrl, Ouchy</td></tr>
<tr><th>Revenu brut annuel</th><td class="num">CHF 148'000</td><td class="num">CHF 96'500</td></tr>
<tr><th>Téléphone</th><td>079 555 28 47</td><td>078 555 90 13</td></tr>
<tr><th>E-mail</th><td>julien.favre@example.ch</td><td>sophie.favre@example.ch</td></tr>
</table>
<p>N° de client : 3307-418820. Compte de débit des intérêts et amortissements : IBAN CH47 0848 5000 7712 3094 6,
au nom de Julien Favre et Sophie Favre-Rochat.</p>
<h2>2. Objet financé et garanties</h2>
<p>Le crédit finance l'acquisition, par les Emprunteurs en copropriété pour moitié chacun, d'un appartement en
propriété par étages (PPE) de 4.5 pièces, sis Avenue de Lavaux 63, 1009 Pully, lot PPE n° 2418-7 du registre foncier
de Pully, bien-fonds n° 2418. Prix d'achat : CHF 1'150'000. Valeur de nantissement retenue par la Banque :
CHF 1'150'000.</p>
<p>Le crédit est garanti par une cédule hypothécaire de registre au sens de l'art. 842 CC d'un montant de
CHF 920'000 en premier rang, grevant le lot précité, constituée par acte authentique de Me Laurent Chappuis,
notaire à Lausanne, et transférée en propriété à la Banque à titre de garantie. Les Emprunteurs nantissent en outre
leurs avoirs du pilier 3a auprès de la Fondation de prévoyance 3a de la Banque, comptes n° 3A-90417 et n° 3A-90418.</p>
<h2>3. Montant et tranches</h2>
<table class="grid">
<tr><th>Tranche</th><th>Produit</th><th class="num">Montant CHF</th><th>Durée</th><th>Taux</th></tr>
<tr><td>A</td><td>Hypothèque à taux fixe</td><td class="num">600'000</td><td>10 ans, échéance 31.12.2036</td><td>taux fixe 1.85 % p.a.</td></tr>
<tr><td>B</td><td>Hypothèque SARON</td><td class="num">320'000</td><td>3 ans renouvelable</td><td>SARON composé + marge 0.80 %, plancher 0 %</td></tr>
<tr><td colspan="2">Total</td><td class="num">920'000</td><td colspan="2">Avance 80 % de la valeur de nantissement (LTV)</td></tr>
</table>
<p>Le versement intervient le 15.12.2026 directement en faveur du compte de consignation du notaire. La tranche B
correspond pour CHF 153'333 au financement de second rang (au-delà des deux tiers de la valeur de nantissement), qui
doit être amorti en 15 ans conformément aux directives de l'Association suisse des banquiers relatives aux exigences
minimales pour les financements hypothécaires.</p>
`,
    },
    {
      html: String.raw`
<h2>4. Calcul des intérêts et des annuités</h2>
<p>Les intérêts de la tranche A sont calculés selon la méthode 30/360 et payables trimestriellement à terme échu :</p>
<tex display>I_A = K_A \cdot \frac{r_A}{4} = 600\,000 \cdot \frac{0.0185}{4} = 2\,775.00</tex>
<p>Pour la tranche B, le taux d'intérêt de chaque trimestre est déterminé comme suit :</p>
<tex display>r_B = \max\left(0,\; \mathrm{SARON}_{\mathrm{comp}}\right) + m, \quad m = 0.80\,\%</tex>
<p>où le SARON composé d'une période de <tex>d</tex> jours est calculé à partir des taux journaliers <tex>s_j</tex>
appliqués pendant <tex>n_j</tex> jours :</p>
<tex display>\mathrm{SARON}_{\mathrm{comp}} = \left( \prod_{j=1}^{N} \left(1 + \frac{s_j \cdot n_j}{360}\right) - 1 \right) \cdot \frac{360}{d}</tex>
<p>À titre indicatif, une annuité constante équivalente pour un capital <tex>K</tex>, un taux trimestriel
<tex>i</tex> et <tex>n</tex> échéances serait :</p>
<tex display>A = K \cdot \frac{i}{1 - (1 + i)^{-n}}</tex>
<h2>5. Capacité financière</h2>
<p>La Banque vérifie la capacité financière (Tragbarkeit) avec un taux d'intérêt théorique de 5 %, un amortissement
de 1 % et des frais d'entretien de 1 % de la valeur du bien :</p>
<tex display>T = \frac{0.05 \cdot 920\,000 + 10\,222 + 0.01 \cdot 1\,150\,000}{148\,000 + 96\,500} = \frac{67\,722}{244\,500} \approx 27.7\,\% \leq 33\,\%</tex>
<p>La condition est remplie. Les Emprunteurs s'engagent à informer la Banque sans délai de toute modification
importante de leur situation financière (perte d'emploi, divorce, séparation de biens).</p>
<h2>6. Amortissement</h2>
<p>La part de second rang est amortie directement, par débits trimestriels de CHF 2'555.55 sur le compte de débit
mentionné au ch. 1, dès le 31.03.2027. Le plan d'amortissement figure en annexe. La tranche A n'est pas amortie
pendant sa durée.</p>
<h2>7. Remboursement anticipé</h2>
<p>Un remboursement anticipé de la tranche A n'est possible que moyennant le paiement d'une indemnité de
remboursement anticipé correspondant à la perte de taux de la Banque :</p>
<tex display>E = \sum_{t=1}^{T} \frac{K \cdot (r_A - r_{\mathrm{remploi}}) / 4}{\left(1 + \frac{r_{\mathrm{remploi}}}{4}\right)^{t}}</tex>
<p>La tranche B peut être remboursée en tout ou partie à la fin de chaque trimestre, moyennant un préavis de
30 jours.</p>
<h2>8. Résiliation et exigibilité</h2>
<p>La Banque peut dénoncer le crédit avec effet immédiat en cas de retard de paiement de plus de 90 jours, de
dépréciation importante du gage ou de fausses déclarations. Le for est à Morges; le droit suisse est applicable.</p>
`,
    },
    {
      html: `
<h1>Annexe 1 : Plan d'amortissement de la tranche B</h1>
<p class="small">Emprunteurs : Julien Favre et Sophie Favre-Rochat. Taux indicatif 1.75 % p.a. (SARON composé 0.95 % + marge
0.80 %), intérêts calculés sur le capital en début de trimestre. Montants en CHF.</p>
<table class="grid">
<tr><th>N°</th><th>Échéance</th><th class="num">Capital début</th><th class="num">Intérêts</th><th class="num">Amortissement</th><th class="num">Total</th><th class="num">Capital fin</th></tr>
${amortisationRows.join('\n')}
</table>
<p class="small">Le taux effectif de la tranche B est fixé chaque trimestre selon le ch. 4; le plan est donc
indicatif pour les intérêts et contraignant pour les amortissements.</p>
`,
    },
    {
      html: String.raw`
<h2>9. Signatures</h2>
<p>Les Emprunteurs déclarent avoir reçu, lu et accepté le présent contrat, ses annexes et les conditions générales
de la Banque. Ils confirment l'exactitude des informations fournies pour l'examen de la capacité financière.</p>
<table class="grid">
<tr><th>Pour la Banque</th><th>Les Emprunteurs</th></tr>
<tr><td>Nicolas Berset, conseiller hypothécaire<br>Valérie Monnier, cheffe crédits privés</td>
<td>Julien Favre<br>Sophie Favre-Rochat</td></tr>
<tr><td>Morges, le 20.11.2026</td><td>Lutry, le 24.11.2026</td></tr>
</table>
<div class="as-image signature">N. Berset &nbsp;&nbsp; V. Monnier &nbsp;&nbsp;&nbsp;&nbsp; J. Favre &nbsp;&nbsp; S. Favre-Rochat</div>
<p>Contact : Nicolas Berset, nicolas.berset@chv-venoge.example, tél. 021 555 30 44</p>
<div class="as-image stamp">Me Laurent Chappuis, notaire<br>Place Saint-François 5, 1003 Lausanne<br>Reçu le 25.11.2026</div>
`,
    },
  ],
  values: [
    { text: 'CAISSE HYPOTHÉCAIRE DE LA VENOGE SA', category: 'COMPANY' },
    { text: 'Caisse Hypothécaire de la Venoge SA', category: 'COMPANY' },
    { text: 'Rue du Simplon 18', category: 'ADDRESS' },
    { text: '1110 Morges', category: 'ADDRESS' },
    { text: 'HYP-2026-50417', category: 'ID' },
    { text: 'FAVRE JULIEN', category: 'PERSON' },
    { text: 'FAVRE-ROCHAT SOPHIE', category: 'PERSON' },
    { text: 'Favre Julien', category: 'PERSON' },
    { text: 'Favre-Rochat Sophie', category: 'PERSON' },
    { text: 'Julien Favre', category: 'PERSON' },
    { text: 'Sophie Favre-Rochat', category: 'PERSON' },
    { text: 'J. Favre', category: 'PERSON' },
    { text: 'S. Favre-Rochat', category: 'PERSON' },
    { text: '08.04.1982', category: 'DATE' },
    { text: '27.01.1985', category: 'DATE' },
    { text: 'Chemin des Vignes 12', category: 'ADDRESS' },
    { text: '1095 Lutry', category: 'ADDRESS' },
    { text: '756.3318.9024.66', category: 'AHV' },
    { text: '756.7102.4458.31', category: 'AHV' },
    { text: 'Logiciels Riviera SA', category: 'COMPANY' },
    { text: 'Clinique dentaire du Port Sàrl', category: 'COMPANY' },
    { text: '079 555 28 47', category: 'PHONE' },
    { text: '078 555 90 13', category: 'PHONE' },
    { text: 'julien.favre@example.ch', category: 'EMAIL' },
    { text: 'sophie.favre@example.ch', category: 'EMAIL' },
    { text: '3307-418820', category: 'ID' },
    { text: 'CH47 0848 5000 7712 3094 6', category: 'IBAN' },
    { text: 'Avenue de Lavaux 63', category: 'ADDRESS' },
    { text: '1009 Pully', category: 'ADDRESS' },
    { text: '2418-7', category: 'ID' },
    { text: 'bien-fonds n° 2418', category: 'ID' },
    { text: 'Laurent Chappuis', category: 'PERSON' },
    { text: '3A-90417', category: 'ACCOUNT' },
    { text: '3A-90418', category: 'ACCOUNT' },
    { text: 'Nicolas Berset', category: 'PERSON' },
    { text: 'N. Berset', category: 'PERSON' },
    { text: 'Valérie Monnier', category: 'PERSON' },
    { text: 'V. Monnier', category: 'PERSON' },
    { text: 'nicolas.berset@chv-venoge.example', category: 'EMAIL' },
    { text: '021 555 30 44', category: 'PHONE' },
    { text: 'Place Saint-François 5', category: 'ADDRESS' },
    { text: '1003 Lausanne', category: 'ADDRESS' },
  ],
  keep: ['cédule hypothécaire', "art. 842 CC", 'art. 312 ss CO', 'SARON composé', 'taux fixe 1.85 %', 'pilier 3a',
    'propriété par étages (PPE)', "indemnité de remboursement anticipé", 'capacité financière', 'second rang'],
};
