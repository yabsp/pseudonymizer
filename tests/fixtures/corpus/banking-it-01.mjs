const POSITIONS = [
  ['Liquidità', 'Conto corrente CHF', '-', '-', '1', '84\'215.40', '84\'215.40', '6.1'],
  ['Liquidità', 'Conto corrente EUR', '-', '-', '1', '12\'480.00', '11\'694.96', '0.8'],
  ['Obbligazioni', 'Confederazione Svizzera 1.50% 2033', 'CH0224397338', '100\'000', '101.85', '101\'850.00', '101\'850.00', '7.4'],
  ['Obbligazioni', 'Zürcher Kantonalbank 1.125% 2030', 'CH1148573227', '80\'000', '99.40', '79\'520.00', '79\'520.00', '5.8'],
  ['Obbligazioni', 'Nestlé Holdings 2.25% 2031 (USD)', 'XS2462301845', '50\'000', '97.10', '48\'550.00', '42\'965.20', '3.1'],
  ['Obbligazioni', 'Fondo obbligazionario CHF Corporate', 'CH0410556689', '1\'250', '96.42', '120\'525.00', '120\'525.00', '8.8'],
  ['Azioni Svizzera', 'Nestlé SA nom.', 'CH0038863350', '600', '84.12', '50\'472.00', '50\'472.00', '3.7'],
  ['Azioni Svizzera', 'Novartis AG nom.', 'CH0012005267', '700', '92.48', '64\'736.00', '64\'736.00', '4.7'],
  ['Azioni Svizzera', 'Roche Holding AG BJ', 'CH0012032048', '200', '258.30', '51\'660.00', '51\'660.00', '3.8'],
  ['Azioni Svizzera', 'UBS Group AG nom.', 'CH0244767585', '1\'800', '26.85', '48\'330.00', '48\'330.00', '3.5'],
  ['Azioni Svizzera', 'Zurich Insurance Group AG', 'CH0011075394', '90', '512.60', '46\'134.00', '46\'134.00', '3.4'],
  ['Azioni Svizzera', 'ETF SPI Mid Caps', 'CH0019852802', '420', '118.75', '49\'875.00', '49\'875.00', '3.6'],
  ['Azioni estere', 'ETF MSCI World (USD)', 'IE00B4L5Y983', '1\'900', '104.20', '197\'980.00', '175\'202.30', '12.8'],
  ['Azioni estere', 'ETF MSCI Emerging Markets (USD)', 'IE00BKM4GZ66', '2\'400', '33.15', '79\'560.00', '70\'406.60', '5.1'],
  ['Azioni estere', 'ETF Euro Stoxx 50 (EUR)', 'IE0008471009', '1\'100', '52.70', '57\'970.00', '54\'322.80', '4.0'],
  ['Immobili', 'Fondo immobiliare Svizzera', 'CH0026465366', '900', '138.40', '124\'560.00', '124\'560.00', '9.1'],
  ['Alternativi', 'Oro fisico ETF (USD)', 'CH0139101593', '320', '228.90', '73\'248.00', '64\'824.50', '4.7'],
  ['Alternativi', 'Fondo multi-strategy hedge (CHF)', 'LU1234567891', '400', '102.35', '40\'940.00', '40\'940.00', '3.0'],
];

const positionRows = POSITIONS.map(([cls, name, isin, qty, price, valueOrig, valueChf, weight]) =>
  `<tr><td>${cls}</td><td>${name}</td><td>${isin}</td><td class="num">${qty}</td><td class="num">${price}</td>`
  + `<td class="num">${valueOrig}</td><td class="num">${valueChf}</td><td class="num">${weight}</td></tr>`).join('\n');

export default {
  id: 'banking-it-01',
  domain: 'banking',
  language: 'it',
  title: 'Estratto deposito titoli',
  header: 'BANCA DEL CERESIO SA | Estratto deposito titoli al 30.09.2026 | CLIENTE: BERNASCONI MARCO E LURATI BERNASCONI ELENA',
  footer: 'Deposito n. 0417-882361.01 - Documento confidenziale, destinato esclusivamente al cliente',
  parts: [
    {
      html: String.raw`
<p class="small">Banca del Ceresio SA, Private Banking, Riva Paradiso 14, 6900 Lugano-Paradiso</p>
<p>Egregi Signori<br>Marco Bernasconi e Elena Lurati Bernasconi<br>Via ai Ronchi 22<br>6926 Montagnola</p>
<p class="right">Lugano, 3 ottobre 2026</p>
<h1>Estratto deposito titoli al 30.09.2026</h1>
<table class="facts">
<tr><th>Titolari</th><td>Marco Bernasconi, nato il 19.05.1964, e Elena Lurati Bernasconi, nata il 02.11.1967 (conto congiunto)</td></tr>
<tr><th>Relazione cliente n.</th><td>0417-882361</td></tr>
<tr><th>Deposito n.</th><td>0417-882361.01</td></tr>
<tr><th>Conto di riferimento</th><td>IBAN CH38 0864 1000 4178 8236 1</td></tr>
<tr><th>Conto EUR</th><td>IBAN CH91 0864 1000 4178 8236 2</td></tr>
<tr><th>Mandato</th><td>Consulenza d'investimento "Equilibrato", profilo di rischio 3 su 5</td></tr>
<tr><th>Moneta di riferimento</th><td>CHF</td></tr>
<tr><th>Consulente</th><td>Davide Pedrazzini, tel. 091 555 38 72, davide.pedrazzini@bancaceresio.example</td></tr>
</table>
<p>Gentili Signori, vi trasmettiamo l'estratto trimestrale del vostro deposito titoli. Le valutazioni si basano sui
corsi di chiusura del 30.09.2026 e sui tassi di cambio EUR/CHF 0.9371 e USD/CHF 0.8849. Vi preghiamo di
verificare l'estratto e di comunicarci eventuali contestazioni entro 30 giorni; trascorso tale termine
l'estratto si considera approvato ai sensi delle condizioni generali della Banca.</p>
<h2>Riepilogo per categoria d'investimento</h2>
<table class="grid">
<tr><th>Categoria</th><th class="num">Valore CHF</th><th class="num">Quota %</th><th class="num">Strategia %</th><th class="num">Fascia %</th></tr>
<tr><td>Liquidità</td><td class="num">95'910.36</td><td class="num">7.0</td><td class="num">5</td><td class="num">0-15</td></tr>
<tr><td>Obbligazioni</td><td class="num">344'860.20</td><td class="num">25.1</td><td class="num">30</td><td class="num">20-40</td></tr>
<tr><td>Azioni Svizzera</td><td class="num">311'207.00</td><td class="num">22.7</td><td class="num">20</td><td class="num">10-30</td></tr>
<tr><td>Azioni estere</td><td class="num">299'931.70</td><td class="num">21.9</td><td class="num">25</td><td class="num">15-35</td></tr>
<tr><td>Immobili</td><td class="num">124'560.00</td><td class="num">9.1</td><td class="num">10</td><td class="num">5-15</td></tr>
<tr><td>Alternativi</td><td class="num">105'764.50</td><td class="num">7.7</td><td class="num">10</td><td class="num">0-15</td></tr>
<tr><th>Totale patrimonio</th><th class="num">1'282'233.76</th><th class="num">100.0</th><th></th><th></th></tr>
</table>
<p>Performance netta da inizio anno (metodo time-weighted, TWR): +4.82 %; trimestre: +1.37 %. Rendimento
money-weighted (MWR) da inizio anno: +4.65 %. Prelievi nel periodo: CHF 25'000 (pagamento a favore di Studio
d'architettura Vassalli Sagl, Lugano).</p>
`,
    },
    {
      html: String.raw`
<h2>Posizioni al 30.09.2026</h2>
<table class="grid">
<tr><th>Categoria</th><th>Titolo</th><th>ISIN</th><th class="num">Quantità / nominale</th><th class="num">Corso</th><th class="num">Valore in moneta</th><th class="num">Valore CHF</th><th class="num">%</th></tr>
${positionRows}
</table>
<p class="small">Le quote dei fondi sono valutate al valore netto d'inventario (NAV) dell'ultimo giorno di
valutazione disponibile. Per le obbligazioni il valore non comprende gli interessi maturati (pro rata).
Totale interessi maturati: CHF 3'418.55.</p>
<h2>Movimenti del trimestre</h2>
<table class="grid">
<tr><th>Data</th><th>Operazione</th><th>Titolo</th><th class="num">Quantità</th><th class="num">Importo CHF</th></tr>
<tr><td>08.07.2026</td><td>Acquisto</td><td>ETF MSCI World (USD)</td><td class="num">300</td><td class="num">-27'412.80</td></tr>
<tr><td>15.07.2026</td><td>Dividendo</td><td>Novartis AG nom.</td><td class="num">700</td><td class="num">1'570.10</td></tr>
<tr><td>22.07.2026</td><td>Rimborso</td><td>Cantone Ticino 0.50% 2026</td><td class="num">50'000</td><td class="num">50'000.00</td></tr>
<tr><td>02.08.2026</td><td>Sottoscrizione</td><td>Fondo immobiliare Svizzera</td><td class="num">150</td><td class="num">-20'640.00</td></tr>
<tr><td>01.09.2026</td><td>Prelievo</td><td>Bonifico a Studio d'architettura Vassalli Sagl</td><td class="num">-</td><td class="num">-25'000.00</td></tr>
<tr><td>30.09.2026</td><td>Commissione</td><td>Spese di deposito e consulenza trimestrali</td><td class="num">-</td><td class="num">-2'243.90</td></tr>
</table>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>Commento del consulente</h2>
<p>Nel terzo trimestre i mercati azionari globali hanno proseguito il rialzo, sostenuti dal calo
dell'inflazione negli Stati Uniti e dall'allentamento della politica monetaria. La Banca nazionale svizzera ha
ridotto il tasso guida allo 0.25 %, con effetti positivi sulle obbligazioni in franchi, la cui duration media
nel vostro portafoglio è di 5.8 anni.</p>
<p>La quota in azioni svizzere (22.7 %) supera la strategia di 2.7 punti percentuali ma resta nella fascia
tattica. Proponiamo di realizzare parzialmente gli utili su Roche Holding AG BJ e di aumentare le azioni estere,
in particolare i mercati emergenti, per riavvicinarci all'allocazione strategica.</p>
<p>Come discusso con il Signor Bernasconi il 12.09.2026, valuteremo inoltre un'obbligazione verde in CHF con
scadenza 2032 per la parte di liquidità eccedente. La valuta USD resta non coperta; il rischio di cambio
corrisponde al 22.1 % del patrimonio.</p>
<h2>Indicatori di rischio</h2>
<p>Volatilità annualizzata (36 mesi): 7.9 %. Value at Risk (99 %, 10 giorni): CHF 46'300. Drawdown massimo
negli ultimi 36 mesi: -9.4 %. Il profilo corrisponde al questionario di rischio firmato dalla Signora Lurati
Bernasconi e dal Signor Bernasconi il 14.03.2025, conforme agli art. 11-14 LSerFi (legge sui servizi
finanziari).</p>
<h2>Informazioni fiscali</h2>
<p>L'imposta preventiva del 35 % trattenuta sui dividendi svizzeri nel 2026 ammonta finora a CHF 2'317.40 ed è
recuperabile con la dichiarazione d'imposta del Canton Ticino. L'elenco titoli fiscale 2026 sarà inviato a fine
gennaio 2027 al domicilio di Via ai Ronchi 22.</p>
<h2>Contatti</h2>
<p>Consulente: Davide Pedrazzini<br>Sostituta: Chiara Molinari, tel. 091 555 38 74, chiara.molinari@bancaceresio.example<br>
E-banking: utente MBERNASCONI64</p>
<p>Con i migliori saluti</p>
<p>Banca del Ceresio SA</p>
<div class="as-image signature">D. Pedrazzini &nbsp;&nbsp;&nbsp; C. Molinari</div>
`,
    },
  ],
  values: [
    { text: 'BANCA DEL CERESIO SA', category: 'COMPANY' },
    { text: 'Banca del Ceresio SA', category: 'COMPANY' },
    { text: 'BERNASCONI MARCO', category: 'PERSON' },
    { text: 'LURATI BERNASCONI ELENA', category: 'PERSON' },
    { text: 'Marco Bernasconi', category: 'PERSON' },
    { text: 'Elena Lurati Bernasconi', category: 'PERSON' },
    { text: 'Signor Bernasconi', category: 'PERSON' },
    { text: 'Signora Lurati Bernasconi', category: 'PERSON' },
    { text: '0417-882361.01', category: 'ACCOUNT' },
    { text: '0417-882361', category: 'ID' },
    { text: 'Riva Paradiso 14', category: 'ADDRESS' },
    { text: '6900 Lugano-Paradiso', category: 'ADDRESS' },
    { text: 'Via ai Ronchi 22', category: 'ADDRESS' },
    { text: '6926 Montagnola', category: 'ADDRESS' },
    { text: '19.05.1964', category: 'DATE' },
    { text: '02.11.1967', category: 'DATE' },
    { text: 'CH38 0864 1000 4178 8236 1', category: 'IBAN' },
    { text: 'CH91 0864 1000 4178 8236 2', category: 'IBAN' },
    { text: 'Davide Pedrazzini', category: 'PERSON' },
    { text: 'D. Pedrazzini', category: 'PERSON' },
    { text: '091 555 38 72', category: 'PHONE' },
    { text: 'davide.pedrazzini@bancaceresio.example', category: 'EMAIL' },
    { text: 'Chiara Molinari', category: 'PERSON' },
    { text: 'C. Molinari', category: 'PERSON' },
    { text: '091 555 38 74', category: 'PHONE' },
    { text: 'chiara.molinari@bancaceresio.example', category: 'EMAIL' },
    { text: "Studio d'architettura Vassalli Sagl", category: 'COMPANY' },
    { text: 'MBERNASCONI64', category: 'USERNAME' },
  ],
  keep: ['time-weighted', 'Value at Risk', 'imposta preventiva del 35 %', 'LSerFi', 'valore netto d\'inventario (NAV)',
    'duration media', 'ETF MSCI World (USD)', 'Confederazione Svizzera 1.50% 2033', 'interessi maturati'],
};
