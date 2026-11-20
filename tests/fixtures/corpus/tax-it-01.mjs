export default {
  id: 'tax-it-01',
  domain: 'tax',
  language: 'it',
  title: 'Decisione di tassazione imposte cantonali e comunali 2025',
  header: 'DIVISIONE DELLE CONTRIBUZIONI | Ufficio di tassazione delle persone fisiche | CONTRIBUENTE: FONTANA LUCA',
  footer: 'Numero di registro 7.218.440.15 - Decisione di tassazione 2025 - segreto fiscale',
  parts: [
    {
      html: String.raw`
<p class="small">Repubblica e Cantone Ticino, Divisione delle contribuzioni, Ufficio di tassazione di Bellinzona</p>
<p>Signor<br>Luca Fontana<br>Via San Gottardo 77<br>6500 Bellinzona</p>
<p class="right">Bellinzona, 17 settembre 2026</p>
<h1>Decisione di tassazione 2025 - Imposta cantonale e comunale</h1>
<table class="facts">
<tr><th>Contribuente</th><td>Luca Fontana, nato il 23.09.1986, celibe</td></tr>
<tr><th>Numero di registro</th><td>7.218.440.15</td></tr>
<tr><th>Numero AVS</th><td>756.5502.9814.36</td></tr>
<tr><th>Comune di domicilio</th><td>Bellinzona, moltiplicatore comunale 93 %</td></tr>
<tr><th>Attività</th><td>dipendente presso Ingegneria Strutture Ticino SA, Via Vela 9, 6500 Bellinzona;
attività indipendente accessoria (consulenza informatica, ditta individuale Fontana Digital)</td></tr>
<tr><th>Tassatore</th><td>Giorgio Ferrari, tel. 091 555 27 63, giorgio.ferrari@dfe-ti.example</td></tr>
</table>
<p>Visti la dichiarazione d'imposta del 30.04.2026 e gli accertamenti eseguiti, l'Ufficio di tassazione stabilisce
il reddito e la sostanza imponibili come segue (art. 192 e segg. della Legge tributaria del Cantone Ticino, LT).
Le modifiche rispetto alla dichiarazione sono indicate con un numero e motivate al punto successivo.</p>
<h2>Redditi e deduzioni</h2>
<table class="grid">
<tr><th>Codice</th><th>Voce</th><th class="num">Dichiarato CHF</th><th class="num">Accertato CHF</th><th>Nota</th></tr>
<tr><td>1.1</td><td>Reddito da attività dipendente (certificato di salario)</td><td class="num">94'260</td><td class="num">94'260</td><td></td></tr>
<tr><td>2.1</td><td>Reddito da attività indipendente accessoria</td><td class="num">8'400</td><td class="num">11'150</td><td>1</td></tr>
<tr><td>4.1</td><td>Redditi della sostanza mobiliare</td><td class="num">312</td><td class="num">312</td><td></td></tr>
<tr><th colspan="2">Totale dei redditi</th><th class="num">102'972</th><th class="num">105'722</th><th></th></tr>
<tr><td>11.1</td><td>Spese professionali: trasporto (abbonamento Arcobaleno)</td><td class="num">-1'230</td><td class="num">-1'230</td><td></td></tr>
<tr><td>11.2</td><td>Spese professionali: pasti fuori casa</td><td class="num">-3'200</td><td class="num">-3'200</td><td></td></tr>
<tr><td>11.3</td><td>Altre spese professionali (forfait 3 %)</td><td class="num">-2'828</td><td class="num">-2'828</td><td></td></tr>
<tr><td>12</td><td>Contributi AVS/AI/IPG su attività indipendente</td><td class="num">-860</td><td class="num">-1'140</td><td>1</td></tr>
<tr><td>14.1</td><td>Contributi pilastro 3a</td><td class="num">-7'258</td><td class="num">-7'258</td><td></td></tr>
<tr><td>15</td><td>Premi assicurazione malattia e interessi di capitali a risparmio</td><td class="num">-5'800</td><td class="num">-5'800</td><td></td></tr>
<tr><td>16</td><td>Spese di formazione e perfezionamento professionale</td><td class="num">-6'900</td><td class="num">-6'000</td><td>2</td></tr>
<tr><td>19</td><td>Contributi alimentari versati (figlio minorenne)</td><td class="num">-9'600</td><td class="num">-9'600</td><td></td></tr>
<tr><th colspan="2">Reddito imponibile</th><th class="num">65'296</th><th class="num">68'666</th><th></th></tr>
<tr><th colspan="2">Sostanza imponibile (dopo deduzione sociale)</th><th class="num">18'400</th><th class="num">18'400</th><th></th></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>Motivazione delle modifiche</h2>
<ol>
<li>Dalla contabilità della ditta individuale Fontana Digital risulta una fattura del 15.12.2025 alla Studio
Legale Rusconi &amp; Pellandini, Lugano, di CHF 2'750 incassata il 08.01.2026 ma esigibile nel 2025; il
reddito è determinato secondo il principio della realizzazione (diritto acquisito). I contributi AVS sono
adeguati di conseguenza.</li>
<li>Le spese per il corso di specializzazione "Cloud Architecture" sono deducibili fino al massimo legale di
CHF 6'000 per periodo fiscale (art. 32 cpv. 1 lett. j LT).</li>
</ol>
<p>I contributi alimentari di CHF 800 mensili sono versati per il figlio Matteo Fontana, nato il 12.06.2017,
che vive con la madre Sara Galli a Locarno; la deduzione corrisponde all'importo comprovato dagli estratti del
conto IBAN CH84 0076 4120 5503 1984 2 (art. 32 cpv. 1 lett. c LT).</p>
<h2>Calcolo dell'imposta</h2>
<table class="grid">
<tr><th>Imposta</th><th class="num">Base CHF</th><th class="num">Aliquota</th><th class="num">Importo CHF</th></tr>
<tr><td>Imposta cantonale sul reddito (coefficiente 97 %)</td><td class="num">68'600</td><td class="num">8.24 %</td><td class="num">5'483.15</td></tr>
<tr><td>Imposta comunale sul reddito (moltiplicatore 93 %)</td><td class="num">-</td><td class="num">-</td><td class="num">5'256.95</td></tr>
<tr><td>Imposta sulla sostanza cantonale e comunale</td><td class="num">18'000</td><td class="num">-</td><td class="num">0.00</td></tr>
<tr><td>Imposta personale</td><td class="num">-</td><td class="num">-</td><td class="num">40.00</td></tr>
<tr><th colspan="3">Totale imposte 2025</th><th class="num">10'780.10</th></tr>
<tr><td colspan="3">Acconti versati</td><td class="num">-10'200.00</td></tr>
<tr><th colspan="3">Saldo a vostro carico</th><th class="num">580.10</th></tr>
</table>
<p>Il saldo è esigibile entro 30 giorni dall'intimazione della presente decisione. Dopo tale termine è dovuto un
interesse di ritardo.</p>
<h2>Rimedi giuridici</h2>
<p>Contro la presente decisione il contribuente può interporre reclamo scritto e motivato all'Ufficio di
tassazione entro 30 giorni dalla notifica (art. 206 LT). Il reclamo deve contenere le conclusioni e indicare i
mezzi di prova. La decisione su reclamo è impugnabile con ricorso alla Camera di diritto tributario del
Tribunale d'appello.</p>
<p>Distinti saluti</p>
<p>Ufficio di tassazione di Bellinzona<br>Il tassatore: Giorgio Ferrari</p>
<div class="as-image stamp">DIVISIONE DELLE CONTRIBUZIONI<br>Ufficio di tassazione Bellinzona<br>Intimata il 18.09.2026 - G. Ferrari</div>
<p class="small">Copia: Fiduciaria Ceresa Sagl, Signora Monica Ceresa, Piazza Collegiata 3, 6500 Bellinzona
(rappresentante, procura del 02.04.2026), monica.ceresa@fiduciaria-ceresa.example</p>
`,
    },
  ],
  values: [
    { text: 'FONTANA LUCA', category: 'PERSON' },
    { text: 'Luca Fontana', category: 'PERSON' },
    { text: '7.218.440.15', category: 'ID' },
    { text: 'Via San Gottardo 77', category: 'ADDRESS' },
    { text: '23.09.1986', category: 'DATE' },
    { text: '756.5502.9814.36', category: 'AHV' },
    { text: 'Ingegneria Strutture Ticino SA', category: 'COMPANY' },
    { text: 'Via Vela 9', category: 'ADDRESS' },
    { text: 'Fontana Digital', category: 'COMPANY' },
    { text: 'Giorgio Ferrari', category: 'PERSON' },
    { text: 'G. Ferrari', category: 'PERSON' },
    { text: '091 555 27 63', category: 'PHONE' },
    { text: 'giorgio.ferrari@dfe-ti.example', category: 'EMAIL' },
    { text: 'Studio Legale Rusconi & Pellandini', category: 'COMPANY' },
    { text: 'Matteo Fontana', category: 'PERSON' },
    { text: '12.06.2017', category: 'DATE' },
    { text: 'Sara Galli', category: 'PERSON' },
    { text: 'CH84 0076 4120 5503 1984 2', category: 'IBAN' },
    { text: 'Fiduciaria Ceresa Sagl', category: 'COMPANY' },
    { text: 'Monica Ceresa', category: 'PERSON' },
    { text: 'Piazza Collegiata 3', category: 'ADDRESS' },
    { text: 'monica.ceresa@fiduciaria-ceresa.example', category: 'EMAIL' },
  ],
  keep: ['art. 32 cpv. 1 lett. j LT', 'art. 206 LT', 'reclamo', 'pilastro 3a', 'contributi alimentari',
    'principio della realizzazione', 'moltiplicatore comunale 93 %', 'Camera di diritto tributario'],
};
