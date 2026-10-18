const HOLDER_IBAN = 'CH93 0838 7000 0123 4567 8';

const SALARY = { name: 'Gerber Holzbau AG', iban: 'CH41 0900 0000 3061 2245 8', category: 'COMPANY' };
const RENT = { name: 'Kämpf Liegenschaften GmbH', iban: 'CH72 0077 8180 4421 7730 2', category: 'COMPANY' };
const DAUGHTER = { name: 'Lea Zbinden', iban: 'CH05 0838 7000 0988 1204 6', category: 'PERSON' };
const FATHER = { name: 'Andreas Huber', iban: 'CH61 0079 0016 2245 9087 3', category: 'PERSON' };
const HEALTH = { name: 'Gesundheitskasse Birsfeld', iban: 'CH28 0900 0000 2577 6610 4', category: 'COMPANY' };
const LEASING = { name: 'Autoleasing Seeland AG', iban: 'CH17 0483 5099 7612 0044 1', category: 'COMPANY' };
const QR_CREDITORS = [
  { name: 'Energie Bolligen AG', iban: 'CH89 0900 0000 3044 8120 7', prefix: 'EB', months: [2, 5], amount: 18440 },
  { name: 'Telekom Aaretal AG', iban: 'CH37 0076 8300 1458 2290 5', prefix: 'TA', months: [1, 2, 3, 4, 5, 6], amount: 8990 },
  { name: 'Urs Bühlmann', iban: 'CH50 0839 1000 0567 3311 9', prefix: 'ZB', months: [3], amount: 61250, category: 'PERSON', label: 'Zahnarztpraxis' },
  { name: 'Tierarztpraxis Lindenhof GmbH', iban: 'CH13 0900 0000 6012 7755 0', prefix: 'TL', months: [4], amount: 23800 },
  { name: 'Musikschule Worblental', iban: 'CH74 0079 0042 8810 3376 2', prefix: 'MW', months: [1, 4], amount: 52000 },
];
const MERCHANTS = ['Bäckerei Gfeller', 'Metzgerei Wüthrich GmbH', 'Drogerie Aebersold', 'Garage Schüpbach AG',
  'Restaurant Sternen Ittigen', 'Velo Kunz GmbH', 'Papeterie Ryser', 'Optik Bigler AG', 'Gärtnerei Zaugg',
  'Hofladen Stucki'];
const TWINT = [
  { name: 'Thomas Rüegg', phone: '+41 79 555 12 34' },
  { name: 'Sabine Wyss', phone: '+41 78 555 61 09' },
  { name: 'Kevin Moser', phone: '+41 76 555 33 80' },
  { name: 'Nadja Imhof', phone: '+41 79 555 47 21' },
];
const ATMS = ['Bancomat Bern Bahnhof', 'Bancomat Bolligen Dorf', 'Bancomat Ittigen Zentrum'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30];
const OPENING_BALANCE = 1845270;

let seed = 20260101;
const next = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const pick = (list) => list[Math.floor(next() * list.length)];
const between = (low, high) => low + Math.floor(next() * (high - low + 1));

const pad = (n) => String(n).padStart(2, '0');
const date = (day, month) => `${pad(day)}.${pad(month)}.2026`;
const chf = (cents) => {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const francs = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${sign}${francs}.${pad(abs % 100)}`;
};

const generatedValues = [];
const addValue = (text, category) => generatedValues.push({ text, category });

function bookingsOf(month) {
  const rows = [];
  const add = (day, text, party, amount) => rows.push({ day, text, party, amount, order: rows.length });
  add(1, 'Dauerauftrag Miete Lindenweg', `${RENT.name}<br>${RENT.iban}`, -248000);
  add(1, 'Dauerauftrag Taschengeld', `${DAUGHTER.name}<br>${DAUGHTER.iban}`, -15000);
  add(5, 'Lastschrift LSV+ Prämie KVG/VVG', `${HEALTH.name}<br>${HEALTH.iban}`, -61785);
  add(10, 'Dauerauftrag Leasingrate Vertrag 77-40218', `${LEASING.name}<br>${LEASING.iban}`, -42900);
  add(25, 'Gutschrift Lohn ' + MONTHS[month - 1], `${SALARY.name}<br>${SALARY.iban}`, 684235);
  if (month === 3 || month === 6) {
    add(28, 'Zahlung Steuern Rate', 'Steuerverwaltung des Kantons Bern', -185000);
  }
  if (month === 4) add(12, 'Gutschrift Geburtstag', `${FATHER.name}<br>${FATHER.iban}`, 50000);
  for (const creditor of QR_CREDITORS) {
    if (!creditor.months.includes(month)) continue;
    const reference = `${creditor.prefix}-26${pad(month)}${between(100, 999)}`;
    addValue(reference, 'ID');
    const title = creditor.label ? `${creditor.label} ${creditor.name}` : creditor.name;
    add(between(8, 22), 'eBill / QR-Rechnung', `${title}, Rg. ${reference}<br>${creditor.iban}`,
      -(creditor.amount + between(0, 900)));
  }
  const cardCount = between(26, 32);
  for (let i = 0; i < cardCount; i++) {
    add(between(1, DAYS_IN_MONTH[month - 1]), 'Kartenzahlung Debit', pick(MERCHANTS), -between(450, 18900));
  }
  const twintCount = between(3, 5);
  for (let i = 0; i < twintCount; i++) {
    const friend = pick(TWINT);
    const incoming = next() < 0.4;
    add(between(1, DAYS_IN_MONTH[month - 1]), incoming ? 'TWINT Gutschrift' : 'TWINT Zahlung',
      `${friend.name}, ${friend.phone}`, incoming ? between(1500, 8000) : -between(1200, 9500));
  }
  for (let i = 0; i < 2; i++) {
    add(between(1, DAYS_IN_MONTH[month - 1]), 'Bargeldbezug', pick(ATMS), -between(1, 4) * 10000);
  }
  if (month === 6) add(30, 'Kontoführungsgebühr 1. Halbjahr', 'Bank Talwiesen AG', -1800);
  return rows.sort((a, b) => a.day - b.day || a.order - b.order);
}

let balance = OPENING_BALANCE;
let totalDebit = 0;
let totalCredit = 0;
const monthSections = MONTHS.map((name, index) => {
  const month = index + 1;
  const rows = bookingsOf(month).map((row) => {
    balance += row.amount;
    if (row.amount < 0) totalDebit -= row.amount;
    else totalCredit += row.amount;
    const valuta = row.amount > 0 ? date(row.day, month) : date(Math.min(row.day + (row.text.startsWith('Karten') ? 1 : 0), DAYS_IN_MONTH[index]), month);
    return `<tr><td>${date(row.day, month)}</td><td>${valuta}</td><td>${row.text}</td><td>${row.party}</td>`
      + `<td class="num">${row.amount < 0 ? chf(-row.amount) : ''}</td><td class="num">${row.amount > 0 ? chf(row.amount) : ''}</td>`
      + `<td class="num">${chf(balance)}</td></tr>`;
  });
  return `<h2>${name} 2026</h2>
<table class="grid stmt">
<tr><th>Datum</th><th>Valuta</th><th>Buchungstext</th><th>Gegenpartei / Mitteilung</th><th class="num">Belastung</th><th class="num">Gutschrift</th><th class="num">Saldo</th></tr>
${rows.join('\n')}
</table>
<p class="small">Saldo per ${date(DAYS_IN_MONTH[index], month)}: CHF ${chf(balance)}</p>`;
});
const closingBalance = balance;

const usedMerchants = MERCHANTS.filter((m) => monthSections.some((s) => s.includes(m)));
const usedTwint = TWINT.filter((t) => monthSections.some((s) => s.includes(t.name)));

export default {
  id: 'banking-de-01',
  domain: 'banking',
  language: 'de',
  title: 'Kontoauszug Privatkonto 1. Halbjahr 2026',
  header: `BANK TALWIESEN AG | Kontoauszug Privatkonto | ZBINDEN-HUBER MARTINA | IBAN ${HOLDER_IBAN}`,
  footer: 'Bank Talwiesen AG, Marktgasse 22, 3011 Bern - Kundenberaterin S. Lüthi, 031 555 40 12',
  css: 'table.stmt td, table.stmt th { font-size: 8.5pt; padding: 2pt 4pt; }',
  parts: [
    {
      html: String.raw`
<div class="as-image stamp">BANK TALWIESEN AG<br>Marktgasse 22 - 3011 Bern</div>
<p class="small">Bank Talwiesen AG, Marktgasse 22, 3011 Bern, BIC TALWCH22XXX</p>
<p>Frau<br>Martina Zbinden-Huber<br>Lindenweg 14<br>3065 Bolligen</p>
<p class="right">Bern, 1. Juli 2026</p>
<h1>Kontoauszug Privatkonto</h1>
<table class="facts">
<tr><th>Kontoinhaberin</th><td>Martina Zbinden-Huber, geb. 03.11.1978</td></tr>
<tr><th>Kunden-Nr.</th><td>4410-882913</td></tr>
<tr><th>Konto-Nr.</th><td>16.4567.8001.01</td></tr>
<tr><th>IBAN</th><td>${HOLDER_IBAN}</td></tr>
<tr><th>Kontoart</th><td>Privatkonto in CHF</td></tr>
<tr><th>Periode</th><td>01.01.2026 bis 30.06.2026</td></tr>
<tr><th>Habenzins</th><td>Habenzins 0.10 % p.a., Zinsberechnung 30/360</td></tr>
<tr><th>Debitkarte</th><td>Visa Debit 4789 **** **** 2210, gültig bis 08/2028</td></tr>
</table>
<p>Sehr geehrte Frau Zbinden-Huber</p>
<p>Wir senden Ihnen den Auszug Ihres Privatkontos für das erste Halbjahr 2026. Bitte prüfen Sie die Buchungen.
Beanstandungen sind uns gemäss Art. 6 der Allgemeinen Geschäftsbedingungen innert 30 Tagen seit Zustellung
schriftlich mitzuteilen, andernfalls gilt der Auszug als genehmigt.</p>
<h2>Übersicht</h2>
<table class="grid">
<tr><th>Position</th><th class="num">CHF</th></tr>
<tr><td>Anfangssaldo per 01.01.2026</td><td class="num">${chf(OPENING_BALANCE)}</td></tr>
<tr><td>Total Belastungen</td><td class="num">${chf(totalDebit)}</td></tr>
<tr><td>Total Gutschriften</td><td class="num">${chf(totalCredit)}</td></tr>
<tr><td>Schlusssaldo per 30.06.2026</td><td class="num">${chf(closingBalance)}</td></tr>
</table>
<h2>Daueraufträge und Lastschriften</h2>
<table class="grid">
<tr><th>Art</th><th>Begünstigter</th><th>IBAN</th><th>Ausführung</th><th class="num">Betrag CHF</th></tr>
<tr><td>Dauerauftrag</td><td>${RENT.name}</td><td>${RENT.iban}</td><td>monatlich am 1.</td><td class="num">2'480.00</td></tr>
<tr><td>Dauerauftrag</td><td>${DAUGHTER.name}</td><td>${DAUGHTER.iban}</td><td>monatlich am 1.</td><td class="num">150.00</td></tr>
<tr><td>Dauerauftrag</td><td>${LEASING.name}</td><td>${LEASING.iban}</td><td>monatlich am 10.</td><td class="num">429.00</td></tr>
<tr><td>Lastschriftverfahren (LSV+)</td><td>${HEALTH.name}</td><td>${HEALTH.iban}</td><td>monatlich am 5.</td><td class="num">617.85</td></tr>
</table>
<p>Ihre Einlagen sind im Rahmen der Einlagensicherung bis CHF 100'000 pro Kundin geschützt. Für Fragen zu Ihrem
Konto steht Ihnen Ihre Kundenberaterin Sandra Lüthi gerne zur Verfügung (sandra.luethi@bank-talwiesen.example,
Tel. 031 555 40 12).</p>
`,
    },
    {
      html: `<h1>Buchungen 01.01.2026 bis 30.06.2026</h1>
<p class="small">Konto ${HOLDER_IBAN}, lautend auf Martina Zbinden-Huber, Beträge in CHF</p>
${monthSections.join('\n')}`,
    },
    {
      html: String.raw`
<h1>Zinsabschluss per 30.06.2026</h1>
<p>Der Habenzins wird nach der Methode 30/360 auf dem täglichen Saldo berechnet:</p>
<tex display>Z = \sum_{i=1}^{n} \frac{K_i \cdot p \cdot t_i}{100 \cdot 360}</tex>
<p>Dabei ist <tex>K_i</tex> der Saldo in der Periode <tex>i</tex>, <tex>p = 0.10</tex> der Zinssatz in Prozent und
<tex>t_i</tex> die Anzahl Zinstage. Auf Zinsgutschriften über CHF 200 pro Kalenderjahr wird die
Verrechnungssteuer 35 % abgezogen und der Eidgenössischen Steuerverwaltung abgeliefert.</p>
<table class="grid">
<tr><th>Position</th><th class="num">CHF</th></tr>
<tr><td>Bruttozins 0.10 %</td><td class="num">11.42</td></tr>
<tr><td>Verrechnungssteuer 35 %</td><td class="num">0.00 (Freigrenze)</td></tr>
<tr><td>Kontoführungsgebühr</td><td class="num">18.00</td></tr>
</table>
<h2>Hinweise</h2>
<ul>
<li>Die Valuta bestimmt den Beginn bzw. das Ende der Verzinsung einer Buchung.</li>
<li>Kartenzahlungen mit der Debitkarte werden in der Regel einen Bankwerktag nach der Transaktion valutiert.</li>
<li>Bitte bewahren Sie diesen Auszug für Ihre Steuererklärung auf (Wertschriften- und Guthabenverzeichnis).</li>
<li>Das Konto ist für eBill aktiviert; neue Rechnungssteller können Sie im E-Banking freigeben.</li>
</ul>
<p>Freundliche Grüsse</p>
<p>Bank Talwiesen AG</p>
<div class="as-image signature">Sandra Lüthi &nbsp;&nbsp;&nbsp; i.V. Marco Feller</div>
<p class="small">Sandra Lüthi, Kundenberaterin Privatkunden, Marco Feller, Teamleiter Privatkunden Bern</p>
`,
    },
  ],
  values: [
    { text: 'BANK TALWIESEN AG', category: 'COMPANY' },
    { text: 'Bank Talwiesen AG', category: 'COMPANY' },
    { text: 'ZBINDEN-HUBER MARTINA', category: 'PERSON' },
    { text: 'Martina Zbinden-Huber', category: 'PERSON' },
    { text: 'Zbinden-Huber', category: 'PERSON' },
    { text: HOLDER_IBAN, category: 'IBAN' },
    { text: 'Lindenweg 14', category: 'ADDRESS' },
    { text: '3065 Bolligen', category: 'ADDRESS' },
    { text: '03.11.1978', category: 'DATE' },
    { text: '4410-882913', category: 'ID' },
    { text: '16.4567.8001.01', category: 'ACCOUNT' },
    { text: '4789 **** **** 2210', category: 'CARD' },
    { text: 'Marktgasse 22', category: 'ADDRESS' },
    { text: '3011 Bern', category: 'ADDRESS' },
    { text: 'S. Lüthi', category: 'PERSON' },
    { text: 'Sandra Lüthi', category: 'PERSON' },
    { text: 'sandra.luethi@bank-talwiesen.example', category: 'EMAIL' },
    { text: '031 555 40 12', category: 'PHONE' },
    { text: 'Marco Feller', category: 'PERSON' },
    { text: '77-40218', category: 'ID' },
    ...[SALARY, RENT, DAUGHTER, HEALTH, LEASING].flatMap((p) => [
      { text: p.name, category: p.category }, { text: p.iban, category: 'IBAN' }]),
    ...(monthSections.some((s) => s.includes(FATHER.name))
      ? [{ text: FATHER.name, category: 'PERSON' }, { text: FATHER.iban, category: 'IBAN' }] : []),
    ...QR_CREDITORS.flatMap((c) => [
      { text: c.name, category: c.category ?? 'COMPANY' }, { text: c.iban, category: 'IBAN' }]),
    ...generatedValues,
    ...usedMerchants.map((m) => ({ text: m, category: 'COMPANY' })),
    ...usedTwint.flatMap((t) => [{ text: t.name, category: 'PERSON' }, { text: t.phone, category: 'PHONE' }]),
  ],
  keep: ['Habenzins 0.10 %', 'Verrechnungssteuer 35 %', 'Lastschriftverfahren (LSV+)', 'Dauerauftrag',
    'Einlagensicherung', 'Kontoführungsgebühr', 'Valuta', 'Art. 6 der Allgemeinen Geschäftsbedingungen',
    'Zinsberechnung 30/360', 'eBill'],
};
