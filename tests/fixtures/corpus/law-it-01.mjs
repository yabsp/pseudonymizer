const VICTIMS = [
  ['Rosa Bernasconi', 'CH14 0076 4301 2288 5410 3'],
  ['Elio Cattaneo', 'CH52 0900 0000 6532 1178 4'],
  ['Marisa Guscetti', 'CH08 0024 8248 1190 3376 Y'],
  ['Fulvio Mombelli', 'CH71 8080 8001 4417 2290 6'],
  ['Annalisa Ferrari', 'CH29 0076 4110 7735 2048 1'],
  ['Renzo Pozzi', 'CH66 0900 0000 6981 4402 7'],
  ['Teresa Locarnini', 'CH43 0024 8248 5520 1873 M'],
  ['Bruno Ghisletta', 'CH85 8080 8002 3364 9105 2'],
  ['Ivana Delcò', 'CH17 0076 4301 9902 6617 5'],
  ['Silvano Rusca', 'CH90 0900 0000 6544 0318 9'],
  ['Giuliana Maspoli', 'CH36 0024 8248 3047 6612 K'],
  ['Aldo Pedroni', 'CH58 8080 8003 7718 2236 0'],
];

const CHANNELS = ['bonifico e-banking', 'versamento allo sportello', 'bonifico e-banking', 'TWINT'];

// Deterministic rows: victim i pays on day (3 + 7k) mod 28 of months from February to September 2024.
const TRANSFERS = Array.from({ length: 60 }, (_, k) => {
  const victim = VICTIMS[(k * 5 + 3) % VICTIMS.length];
  const month = 2 + Math.floor(k / 8);
  const day = 1 + ((3 + 7 * k) % 28);
  const amount = 1500 + ((k * 3779) % 23) * 850;
  return {
    date: `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.2024`,
    name: victim[0],
    iban: victim[1],
    channel: CHANNELS[k % CHANNELS.length],
    amount: `${(amount / 1000).toFixed(3).replace('.', "'")}.00`,
  };
});

// Swiss thousands separator: an apostrophe before every group of three digits that ends the number, 651000 -> 651'000.
const chf = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.00`;
const TOTAL = chf(TRANSFERS.reduce((s, t) => s + Number(t.amount.replace(/'/g, '').replace('.00', '')), 0));

const transferTable =TRANSFERS.map((t, i) =>
  `<tr><td>${i + 1}</td><td>${t.date}</td><td>${t.name}</td><td>${t.iban}</td><td>${t.channel}</td><td>CHF ${t.amount}</td></tr>`).join('\n');

const victimTable = VICTIMS.map(([name], i) => {
  const total = TRANSFERS.filter((t) => t.name === name).reduce((s, t) => s + Number(t.amount.replace("'", '')), 0);
  return `<tr><td>${i + 1}</td><td>${name}</td><td>CHF ${total.toLocaleString('de-CH').replace(/’/g, "'")}.00</td><td>${i % 3 === 0 ? 'costituita' : 'costituita, rappresentata dall\'avv. Pedrazzini Jelmini'}</td></tr>`;
}).join('\n');

export default {
  id: 'law-it-01',
  domain: 'law',
  language: 'it',
  title: "Sentenza della Corte d'appello e di revisione penale",
  header: "TRIBUNALE D'APPELLO DEL CANTONE TICINO | CARP 17.2025.214 | LURATI DAVIDE",
  footer: 'Sentenza 17.2025.214 del 2 ottobre 2026 - imputato D. Lurati',
  parts: [
    {
      html: String.raw`
<p class="small">Tribunale d'appello, Corte d'appello e di revisione penale, Via Pretorio 16, 6901 Lugano</p>
<p>Incarto n. 17.2025.214</p>
<p>Lugano, 2 ottobre 2026</p>
<h1>In nome della Repubblica e Cantone Ticino</h1>
<p>La Corte d'appello e di revisione penale, composta dei giudici Marco Albertini, presidente, Lorena Taddei e
Paolo Moretti-Sciaroni, segretaria Giada Cereghetti, sedente con l'assistenza del procuratore pubblico
Stefano Quadri, ha pronunciato la seguente</p>
<h1>Sentenza</h1>
<p>nel procedimento penale a carico di</p>
<table class="facts">
<tr><th>Imputato</th><td>Davide Lurati, nato il 9 maggio 1981 a Mendrisio, cittadino svizzero, già consulente finanziario indipendente, domiciliato in Via San Gottardo 48, 6828 Balerna</td></tr>
<tr><th>Difensore</th><td>avv. Chiara Pedrazzini, Studio legale Pedrazzini &amp; Soldati, Via Nassa 21, 6900 Lugano, c.pedrazzini@studio-ps.example, tel. 091 555 23 80</td></tr>
<tr><th>Accusatore privato</th><td>Rosa Bernasconi e altri undici accusatori privati (elenco al consid. 8), patrocinati dall'avv. Nicoletta Pedrazzini Jelmini, Corso Pestalozzi 3, 6900 Lugano</td></tr>
<tr><th>Incarto MP</th><td>MP 2024.5531</td></tr>
</table>
<p>prevenuto colpevole di:</p>
<p><b>1. truffa per mestiere</b> (art. 146 cpv. 1 e 2 CP), per avere, nel periodo dal febbraio 2024 al settembre 2024,
a Balerna, Chiasso, Lugano e altrove, per procacciare a sé un indebito profitto, ingannato con astuzia dodici
persone, per lo più pensionati, inducendole a versare complessivamente CHF ${TOTAL} sul conto IBAN
CH40 0900 0000 6923 1157 0 intestato alla società Lurati Wealth Partners Sagl, prospettando investimenti in un
inesistente "fondo obbligazionario garantito" con un rendimento annuo del 7.5 %;</p>
<p><b>2. riciclaggio di denaro</b> (art. 305bis n. 1 CP), per avere trasferito parte dei fondi così ottenuti, almeno
CHF 212'000.00, su un conto aperto a suo nome presso un istituto a Malta e prelevato in contanti CHF 94'000.00,
atti idonei a vanificare l'accertamento dell'origine e il ritrovamento dei valori patrimoniali;</p>
<p><b>3. falsità in documenti</b> (art. 251 n. 1 CP), per avere allestito e consegnato ai clienti estratti conto
trimestrali fittizi recanti il logo di una banca, al fine di simulare l'esistenza degli investimenti.</p>
<h2>Fatti</h2>
<p>A. Con sentenza del 14 marzo 2025 la Corte delle assise criminali, sedente a Lugano, ha riconosciuto Davide Lurati
autore colpevole di truffa per mestiere, riciclaggio di denaro e ripetuta falsità in documenti, condannandolo alla
pena detentiva di 4 anni e 6 mesi, dedotto il carcere preventivo sofferto dal 2 ottobre 2024 al 19 dicembre 2024,
nonché alla pena pecuniaria di 90 aliquote giornaliere da CHF 80.00, sospesa condizionalmente per un periodo di
prova di due anni. L'imputato è stato inoltre condannato a risarcire agli accusatori privati il danno accertato e
a rifondere le loro spese di patrocinio (art. 433 CPP). È stato ordinato il risarcimento equivalente in favore dello
Stato di CHF 150'000.00 (art. 71 CP) e il mantenimento del sequestro sul conto della Lurati Wealth Partners Sagl.</p>
<p>B. Contro questa sentenza Davide Lurati, tramite l'avv. Pedrazzini, ha interposto tempestivo annuncio e
dichiarazione d'appello (art. 399 CPP), chiedendo il proscioglimento dall'accusa di truffa per mestiere, subordinatamente
la riqualifica in amministrazione infedele (art. 158 CP), e la riduzione della pena a una pena detentiva non superiore a
due anni, sospesa condizionalmente. Il procuratore pubblico Stefano Quadri ha presentato appello incidentale
limitato alla commisurazione della pena, chiedendo cinque anni di pena detentiva.</p>
<p>C. Il dibattimento d'appello si è svolto il 16 settembre 2026. L'imputato, presente con il suo difensore, è
stato interrogato sulla sua situazione personale. Sono stati sentiti quali testimoni la contabile della società,
signora Sabrina Induni, e l'ispettore della Polizia cantonale, sezione reati economico-finanziari, Mattia Gianella.
Gli accusatori privati erano rappresentati dall'avv. Pedrazzini Jelmini; l'accusatrice privata Rosa Bernasconi era
presente personalmente.</p>
<p>D. Davide Lurati è cresciuto a Mendrisio, dove ha conseguito la maturità commerciale e in seguito il diploma
federale di esperto in finanza e investimenti. Dal 2006 al 2019 ha lavorato come consulente alla clientela privata
presso diversi istituti bancari del Sottoceneri; nel 2020 ha fondato la Lurati Wealth Partners Sagl, con sede in
Via San Gottardo 48 a Balerna, della quale era socio e gerente unico con firma individuale. La società non ha mai
disposto di un'autorizzazione quale gestore patrimoniale ai sensi della legge sugli istituti finanziari (LIsFi) né
era affiliata a un organismo di vigilanza.</p>
<p>E. La denuncia all'origine del procedimento è stata presentata il 23 settembre 2024 dal figlio di
Rosa Bernasconi, signor Claudio Bernasconi, dopo che la madre non aveva ottenuto il rimborso promesso di un primo
investimento giunto a scadenza. Il 2 ottobre 2024 l'imputato è stato arrestato nel suo ufficio di Lugano; nel corso
della perquisizione la polizia ha sequestrato un computer portatile, due telefoni cellulari e un raccoglitore con
modelli di estratti conto. L'analisi forense dei supporti ha permesso di ricostruire l'elenco completo dei clienti e
la corrispondenza con gli stessi, condotta in prevalenza dall'indirizzo d.lurati@lwp-finanza.example.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>Considerando</h2>
<p><b>1.</b> L'appello e l'appello incidentale sono tempestivi e ricevibili (art. 398 segg. CPP). La Corte esamina
liberamente la sentenza impugnata nei punti contestati (art. 398 cpv. 2 e 3 CPP, art. 404 cpv. 1 CPP). Non sono
contestati in appello il reato di falsità in documenti, il reato di riciclaggio di denaro e le pretese civili nel loro
principio, ma unicamente nella loro entità.</p>
<p><b>2.</b> Commette truffa chiunque, per procacciare a sé o ad altri un indebito profitto, inganna con astuzia una
persona affermando cose false o dissimulando cose vere, oppure ne conferma subdolamente l'errore inducendola in tal
modo ad atti pregiudizievoli al patrimonio proprio o altrui (art. 146 cpv. 1 CP). L'inganno è astuto quando l'autore
ricorre a un edificio di menzogne, a manovre fraudolente o a una messinscena, ma anche quando fornisce semplici
indicazioni false la cui verifica non è possibile, è possibile solo con difficoltà o non è ragionevolmente esigibile,
oppure quando l'autore distoglie la vittima dal verificarle o prevede, in base alle circostanze, che essa vi rinuncerà
in ragione di un particolare rapporto di fiducia (DTF 147 IV 73 consid. 3.2; DTF 143 IV 302 consid. 1.3).</p>
<p><b>2.1</b> La difesa sostiene che i clienti, alcuni dei quali avevano esperienza di investimenti, avrebbero potuto
verificare con facilità l'inesistenza del fondo consultando il registro della FINMA, ciò che escluderebbe l'astuzia
secondo il principio della corresponsabilità della vittima. La Corte non condivide questa tesi. Dagli atti emerge che
Lurati si presentava come ex funzionario di una grande banca, organizzava gli incontri in un ufficio di prestigio in
Via Nassa a Lugano, consegnava prospetti curati con riferimenti normativi e presentava estratti conto trimestrali
falsificati, che riportavano i presunti interessi maturati. Tale insieme di manovre costituisce un edificio di
menzogne nel senso della giurisprudenza.</p>
<p><b>2.2</b> Le vittime erano in maggioranza persone anziane, prive di conoscenze finanziarie specifiche, che si
erano rivolte all'imputato su raccomandazione di conoscenti. La signora Bernasconi, vedova di 78 anni, ha dichiarato
in modo credibile di aver affidato a "Davide" i risparmi di una vita perché egli si era occupato per anni della
dichiarazione d'imposta del marito defunto. Il signor Elio Cattaneo ha riferito che l'imputato gli aveva mostrato su
un tablet un presunto accesso online al fondo con l'andamento giornaliero del valore. Una minima diligenza non
avrebbe consentito di scoprire l'inganno; la corresponsabilità delle vittime non è tale da relegare in secondo piano
il comportamento fraudolento dell'autore.</p>
<p><b>2.3</b> L'imputato ha agito per mestiere (art. 146 cpv. 2 CP): durante otto mesi ha sollecitato
sistematicamente nuovi clienti, ha impiegato i versamenti dei nuovi clienti per pagare interessi fittizi ai primi
(schema detto "Ponzi") e ha tratto dai reati la parte essenziale del suo reddito, finanziando tra l'altro il leasing di
un'automobile di lusso e l'affitto dell'appartamento. Il tempo e i mezzi impiegati e la frequenza degli atti
dimostrano che egli si era preparato ad agire un numero indeterminato di volte (DTF 119 IV 129).</p>
<p><b>2.4</b> La riqualifica in amministrazione infedele (art. 158 CP) è da escludere. L'imputato non ha mai
amministrato patrimoni in base a un rapporto di gestione validamente costituito: i fondi gli sono stati trasferiti
proprio a causa dell'inganno. L'appello è pertanto respinto su questo punto.</p>
<p><b>2.5</b> Sul piano soggettivo, la truffa è un reato intenzionale (art. 12 cpv. 1 CP) e presuppone inoltre
l'intenzione di arricchimento indebito. L'imputato sostiene di aver creduto fino all'ultimo di poter restituire i
capitali grazie a operazioni speculative su valute, che avrebbero dovuto coprire le perdite. La tesi non regge: dalla
corrispondenza sequestrata risulta che già nel marzo 2024 egli scriveva alla contabile Sabrina Induni di "tenere
separati i conti veri da quelli per i clienti", e che le presunte operazioni su valute non hanno mai superato un
importo di CHF 18'000.00. Chi prospetta un rendimento garantito pur sapendo che il fondo non esiste agisce con dolo
diretto; la speranza di poter un giorno rimborsare le vittime non elimina né l'inganno né l'intenzione di
arricchimento (DTF 142 IV 346 consid. 3.2). La Corte ritiene pertanto adempiuti anche gli elementi soggettivi del
reato.</p>
<p><b>2.6</b> Le dichiarazioni delle vittime sono concordanti nei punti essenziali. Fulvio Mombelli e
Teresa Locarnini hanno descritto in modo indipendente l'uno dall'altra lo stesso discorso di presentazione del fondo, con
il medesimo riferimento a una "garanzia di capitale presso una banca di primo ordine" e la promessa di un rimborso
entro 30 giorni in caso di disdetta. Silvano Rusca ha prodotto il prospetto consegnatogli, identico a quello
rinvenuto nel raccoglitore sequestrato. Non vi è motivo di dubitare della credibilità di questi testimoni.</p>
<p><b>3.</b> Per quanto concerne il riciclaggio di denaro, la Corte rileva che l'imputato non contesta più di
aver trasferito CHF 212'000.00 sul conto maltese e di aver prelevato contanti in diverse filiali, ciò che è
documentato dai giustificativi bancari e dalle registrazioni delle telecamere. La signora Sabrina Induni ha
confermato che i prelievi non trovavano alcun riscontro nella contabilità della Sagl.</p>
<p><b>4.</b> Il giudice commisura la pena alla colpa dell'autore, tenendo conto della vita anteriore e delle
condizioni personali, nonché dell'effetto che la pena avrà sulla sua vita (art. 47 cpv. 1 CP). La colpa è determinata
secondo il grado di lesione o esposizione a pericolo del bene giuridico offeso, secondo la riprovevolezza dell'offesa,
i moventi e gli obiettivi perseguiti, nonché secondo la misura in cui l'autore, viste le circostanze interne ed
esterne, avrebbe potuto evitare l'esposizione a pericolo o la lesione (art. 47 cpv. 2 CP).</p>
<p><b>4.1</b> Se l'autore, con uno o più atti, adempie le condizioni per l'inflizione di più pene dello stesso
genere, il giudice lo condanna alla pena prevista per il reato più grave aumentandola in misura adeguata (art. 49
cpv. 1 CP). Il reato più grave è la truffa per mestiere, punita con una pena detentiva sino a dieci anni o con una
pena pecuniaria non inferiore a 90 aliquote giornaliere.</p>
<p><b>4.2</b> La colpa di Lurati è grave. Egli ha sfruttato con freddezza la fiducia di persone vulnerabili, ha
provocato un danno complessivo di CHF ${TOTAL} e ha agito per puro scopo di lucro. A suo favore
depongono l'assenza di precedenti penali, la confessione parziale resa in appello e il versamento spontaneo di
CHF 25'000.00 agli accusatori privati prima del dibattimento. La sua situazione personale (separato, padre di due
figli minorenni che vivono con la madre, attualmente impiegato come magazziniere a Stabio con un salario netto di
CHF 4'350.00 mensili) non giustifica un'ulteriore riduzione.</p>
<p><b>4.3</b> Ponderati tutti questi elementi, la Corte ritiene adeguata una pena detentiva di 4 anni, inferiore di
sei mesi a quella di primo grado per tenere conto della confessione e del risarcimento parziale. L'appello
incidentale del procuratore pubblico è respinto.</p>
<p><b>5.</b> La pena pecuniaria per la falsità in documenti, che la prima Corte ha inflitto separatamente, va
confermata nel suo principio, ma l'aliquota giornaliera va adeguata alla situazione attuale dell'imputato
(art. 34 cpv. 2 CP) e fissata a CHF 50.00.</p>
<p><b>6.</b> Il risarcimento equivalente (art. 71 cpv. 1 CP) va ridotto a CHF 125'000.00, considerato che
CHF 25'000.00 sono già stati versati alle vittime. Il sequestro sul conto della Lurati Wealth Partners Sagl è
mantenuto a garanzia delle pretese degli accusatori privati (art. 73 CP).</p>
<p><b>7.</b> Gli accusatori privati hanno diritto a un'indennità adeguata per le spese necessarie sostenute nel
procedimento (art. 433 cpv. 1 CPP). La nota professionale dell'avv. Pedrazzini Jelmini per la procedura d'appello,
di CHF 8'640.00 comprensiva di IVA, è adeguata e va posta a carico dell'imputato.</p>
<p><b>7.1</b> Le pretese civili sono state fatte valere in via adesiva nel procedimento penale (art. 122 segg. CPP).
Il giudice penale decide sulle pretese civili se l'imputato è condannato (art. 126 cpv. 1 lett. a CPP). Il danno
corrisponde ai versamenti effettuati dalle vittime, documentati dalle contabili bancarie e dalle ricevute dei
versamenti allo sportello. La difesa chiede di dedurre gli interessi fittizi pagati ad alcuni clienti con i fondi
di altri clienti. La Corte rileva che tali pagamenti, pur riducendo il danno del singolo, provengono dal medesimo
schema fraudolento; essi andranno computati nella fase di esecuzione, sulla base delle quietanze prodotte, senza che
ciò modifichi il principio della responsabilità solidale dell'imputato.</p>
<p><b>7.2</b> Il torto morale chiesto da Rosa Bernasconi (CHF 5'000.00) è respinto. Pur comprendendo il disagio
causato dalla perdita dei risparmi, la Corte ritiene che la lesione della personalità non raggiunga l'intensità
richiesta dall'art. 49 CO. La richiesta di Elio Cattaneo di condannare l'imputato al pagamento degli interessi
moratori al 5 % dal giorno di ogni versamento è invece accolta (art. 41 e 73 CO).</p>
`,
    },
    {
      html: String.raw`
<p><b>8.</b> Le pretese civili sono ammesse nella misura indicata nella tabella seguente, che riprende i
versamenti accertati dalla Polizia cantonale (rapporto dell'ispettore Gianella del 3 febbraio 2025) senza deduzione degli
interessi fittizi già ricevuti, che saranno computati in sede esecutiva:</p>
<table class="grid">
<tr><th>N.</th><th>Accusatore privato</th><th>Danno accertato</th><th>Costituzione</th></tr>
${victimTable}
</table>
<p>Le singole operazioni accertate sono le seguenti (allegato 4 al rapporto di polizia):</p>
<table class="grid">
<tr><th>N.</th><th>Data</th><th>Ordinante</th><th>Conto ordinante</th><th>Modalità</th><th>Importo</th></tr>
${transferTable}
</table>
<p>I versamenti sono stati accreditati sul conto della Lurati Wealth Partners Sagl, IBAN CH40 0900 0000 6923 1157 0,
del quale l'imputato era l'unico avente diritto di firma.</p>
`,
    },
    {
      html: String.raw`
<p><b>9.</b> Le spese della procedura d'appello sono poste a carico delle parti nella misura in cui esse
risultano vincenti o soccombenti (art. 428 cpv. 1 CPP). L'imputato ottiene parzialmente ragione sulla
commisurazione della pena, ma soccombe sulla questione principale della qualifica giuridica. Si giustifica quindi
di porre a suo carico 4/5 della tassa di giustizia e delle spese, il resto essendo a carico dello Stato.</p>
<h2>Per questi motivi,</h2>
<p>visti gli art. 34, 40, 42, 47, 49, 51, 71, 73, 146 cpv. 1 e 2, 251 n. 1, 305bis n. 1 CP; 398 segg., 426, 428,
433 CPP,</p>
<h2>pronuncia:</h2>
<ol>
<li>L'appello di Davide Lurati è parzialmente accolto. L'appello incidentale del procuratore pubblico è respinto.</li>
<li>Davide Lurati è riconosciuto autore colpevole di truffa per mestiere, riciclaggio di denaro e ripetuta falsità in
documenti.</li>
<li>Egli è condannato alla pena detentiva di 4 anni, da cui va dedotto il carcere preventivo sofferto di 79 giorni,
nonché alla pena pecuniaria di 90 aliquote giornaliere da CHF 50.00 ciascuna, sospesa condizionalmente per un periodo
di prova di 2 anni.</li>
<li>È ordinato un risarcimento equivalente in favore dello Stato del Cantone Ticino di CHF 125'000.00. Il sequestro
del conto IBAN CH40 0900 0000 6923 1157 0 è mantenuto.</li>
<li>Le pretese civili degli accusatori privati sono accolte come al consid. 8. Davide Lurati è condannato a
versare agli accusatori privati, solidalmente, CHF 8'640.00 a titolo di indennità per la procedura d'appello.</li>
<li>La tassa di giustizia di CHF 4'000.00 e le spese di CHF 650.00 sono poste a carico dell'imputato in ragione di
4/5, il resto a carico dello Stato.</li>
<li>Intimazione a: avv. Chiara Pedrazzini, per Davide Lurati; avv. Nicoletta Pedrazzini Jelmini, per gli accusatori
privati; Ministero pubblico, procuratore pubblico Stefano Quadri, Palazzo di giustizia, 6901 Lugano.</li>
<li>Comunicazione a: Corte delle assise criminali; Ufficio dell'esecuzione delle pene e delle misure; Polizia
cantonale, ispettore Mattia Gianella; Ufficio dei registri, Mendrisio.</li>
</ol>
<p>Per la Corte d'appello e di revisione penale</p>
<p>Il presidente: M. Albertini &nbsp;&nbsp;&nbsp; La segretaria: G. Cereghetti</p>
<h2>Rimedi giuridici</h2>
<p>Contro la presente sentenza può essere interposto ricorso in materia penale al Tribunale federale, 1000 Losanna 14,
entro 30 giorni dalla notificazione della sentenza motivata (art. 78 segg. e 100 cpv. 1 LTF). Il ricorso deve
soddisfare i requisiti degli art. 42 e 48 LTF.</p>
`,
    },
  ],
  values: [
    { text: 'LURATI DAVIDE', category: 'PERSON' },
    { text: 'Davide Lurati', category: 'PERSON' },
    { text: 'D. Lurati', category: 'PERSON' },
    { text: 'Lurati', category: 'PERSON' },
    { text: 'Davide', category: 'PERSON' },
    { text: '17.2025.214', category: 'ID' },
    { text: 'MP 2024.5531', category: 'ID' },
    { text: '9 maggio 1981', category: 'DATE' },
    { text: 'Via San Gottardo 48', category: 'ADDRESS' },
    { text: '6828 Balerna', category: 'ADDRESS' },
    { text: 'Chiara Pedrazzini', category: 'PERSON' },
    { text: 'avv. Pedrazzini', category: 'PERSON' },
    { text: 'Studio legale Pedrazzini & Soldati', category: 'COMPANY' },
    { text: 'Via Nassa 21', category: 'ADDRESS' },
    { text: 'c.pedrazzini@studio-ps.example', category: 'EMAIL' },
    { text: '091 555 23 80', category: 'PHONE' },
    { text: 'Nicoletta Pedrazzini Jelmini', category: 'PERSON' },
    { text: 'Pedrazzini Jelmini', category: 'PERSON' },
    { text: 'Corso Pestalozzi 3', category: 'ADDRESS' },
    { text: 'Lurati Wealth Partners Sagl', category: 'COMPANY' },
    { text: 'CH40 0900 0000 6923 1157 0', category: 'IBAN' },
    { text: 'Marco Albertini', category: 'PERSON' },
    { text: 'M. Albertini', category: 'PERSON' },
    { text: 'Lorena Taddei', category: 'PERSON' },
    { text: 'Paolo Moretti-Sciaroni', category: 'PERSON' },
    { text: 'Giada Cereghetti', category: 'PERSON' },
    { text: 'G. Cereghetti', category: 'PERSON' },
    { text: 'Stefano Quadri', category: 'PERSON' },
    { text: 'Sabrina Induni', category: 'PERSON' },
    { text: 'Mattia Gianella', category: 'PERSON' },
    { text: 'Gianella', category: 'PERSON' },
    { text: 'Bernasconi', category: 'PERSON' },
    { text: 'Claudio Bernasconi', category: 'PERSON' },
    { text: 'd.lurati@lwp-finanza.example', category: 'EMAIL' },
    ...VICTIMS.flatMap(([name, iban]) => [{ text: name, category: 'PERSON' }, { text: iban, category: 'IBAN' }]),
  ],
  keep: ['art. 146 cpv. 1 e 2 CP', 'art. 305bis n. 1 CP', 'art. 251 n. 1 CP', 'amministrazione infedele',
    'art. 47 cpv. 1 CP', 'art. 433 cpv. 1 CPP', 'DTF 143 IV 302', 'truffa per mestiere', 'risarcimento equivalente',
    'pena detentiva di 4 anni'],
};
