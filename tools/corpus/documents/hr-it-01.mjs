export default {
  id: 'hr-it-01',
  domain: 'hr',
  language: 'it',
  title: 'Certificato di lavoro e lettera di disdetta',
  header: 'OFFICINE VEDEGGIO SA | Risorse umane | BERNASCONI CHIARA, matricola 7714',
  footer: 'Confidenziale - fascicolo personale C. Bernasconi',
  parts: [
    {
      html: String.raw`
<p class="small">Officine Vedeggio SA, Via Cantonale 24, 6805 Mezzovico, IDI CHE-406.118.275, tel. 091 555 40 10</p>
<h1>Certificato di lavoro</h1>
<p>Con il presente certifichiamo che la signora <b>Chiara Bernasconi</b>, nata il 4 marzo 1987, attinente di
Mendrisio, domiciliata in Via ai Ronchi 9, 6900 Lugano, numero AVS 756.6120.4473.09, è stata alle nostre
dipendenze dal 1° febbraio 2019 al 31 dicembre 2026 in qualità di responsabile della contabilità industriale,
con un grado di occupazione del 100 % (dal 1° settembre 2023 dell'80 %).</p>
<p>Le Officine Vedeggio SA progettano e producono componenti di precisione per l'industria medicale e
aeronautica e occupano circa 140 collaboratori nella sede di Mezzovico.</p>
<h2>Mansioni</h2>
<ul>
<li>Gestione della contabilità analitica e dei centri di costo dello stabilimento, inclusa la chiusura
mensile e annuale secondo Swiss GAAP FER.</li>
<li>Calcolo dei costi standard e delle commesse, analisi degli scostamenti e reporting alla direzione.</li>
<li>Introduzione del modulo CO di SAP S/4HANA (2021-2022) come responsabile di progetto lato utenti.</li>
<li>Preparazione del budget annuale e delle previsioni trimestrali in collaborazione con il CFO.</li>
<li>Conduzione di un team di due collaboratori e formazione di un'apprendista impiegata di commercio AFC.</li>
<li>Collaborazione con l'ufficio di revisione esterno durante le verifiche intermedie e finali.</li>
</ul>
<h2>Valutazione</h2>
<p>La signora Bernasconi ha svolto i compiti affidatile con grande competenza, precisione e senso di
responsabilità, sempre a nostra piena soddisfazione. Grazie alle sue solide conoscenze di contabilità dei costi
e alla sua capacità di analisi ha contribuito in modo determinante a rendere più trasparente il calcolo dei
margini per commessa. Nel progetto SAP S/4HANA ha dimostrato spirito d'iniziativa, capacità organizzative e
resistenza allo stress, rispettando le scadenze e il budget.</p>
<p>Il suo comportamento nei confronti dei superiori, dei colleghi e dei partner esterni è sempre stato
cortese, collaborativo e corretto. Come superiore era rispettata e ha saputo motivare il proprio team.</p>
<p>La signora Bernasconi lascia la nostra azienda di sua spontanea volontà per affrontare una nuova sfida
professionale. Ci rammarichiamo della sua partenza, la ringraziamo per il prezioso contributo e le auguriamo
per il futuro professionale e privato ogni successo e soddisfazione.</p>
<p>Il presente certificato è rilasciato ai sensi dell'art. 330a CO.</p>
<p class="right">Mezzovico, 31 dicembre 2026</p>
<p>Officine Vedeggio SA</p>
<div class="as-image signature">M. Pedrazzini &nbsp;&nbsp;&nbsp;&nbsp; D. Righetti</div>
<table class="facts">
<tr><th>Marco Pedrazzini</th><td>Direttore finanziario (CFO)</td></tr>
<tr><th>Daniela Righetti</th><td>Responsabile risorse umane, daniela.righetti@vedeggio.example</td></tr>
</table>
`,
    },
    {
      scan: { rotate: 1.1, noise: 14, dpi: 150 },
      html: String.raw`
<p>Chiara Bernasconi<br>Via ai Ronchi 9<br>6900 Lugano<br>079 555 23 68<br>chiara.bernasconi@example.ch</p>
<p><b>Raccomandata</b><br>Officine Vedeggio SA<br>Alla c.a. della signora Daniela Righetti<br>Risorse umane<br>Via Cantonale 24<br>6805 Mezzovico</p>
<p class="right">Lugano, 26 settembre 2026</p>
<h1>Disdetta del contratto di lavoro</h1>
<p>Gentile signora Righetti, egregio signor Pedrazzini</p>
<p>con la presente vi comunico la disdetta del mio contratto di lavoro del 10 gennaio 2019 (matricola 7714)
per il 31 dicembre 2026, nel rispetto del termine di disdetta di tre mesi per la fine di un mese previsto
all'art. 335c CO e al punto 9 del contratto.</p>
<p>Ho deciso di accettare un'offerta della Fiduciaria Lemano Sagl di Bellinzona, dove assumerò dal
1° gennaio 2027 la direzione del settore controlling. La decisione non è stata facile: in questi quasi otto anni
ho potuto crescere professionalmente e ringrazio voi e tutto il team per la fiducia accordatami.</p>
<p>Vi chiedo cortesemente:</p>
<ul>
<li>di conteggiare i 6,5 giorni di vacanza residui e il saldo delle ore supplementari (22,5 ore) entro il
termine di disdetta, oppure di pagarli con l'ultimo salario sul conto IBAN CH93 0076 4302 1187 5560 2;</li>
<li>di rilasciarmi un certificato di lavoro completo secondo l'art. 330a CO;</li>
<li>di inviarmi l'attestato di uscita della cassa pensione (LPP) con l'indicazione della prestazione di
libero passaggio.</li>
</ul>
<p>Mi impegno a garantire un passaggio di consegne ordinato alla mia sostituta e a documentare la chiusura
annuale 2026 fino alla mia partenza.</p>
<p>Distinti saluti</p>
<div class="as-image signature">Chiara Bernasconi</div>
<div class="as-image stamp">OFFICINE VEDEGGIO SA<br>RICEVUTO 28.09.2026<br>Risorse umane - DR</div>
`,
    },
  ],
  values: [
    { text: 'BERNASCONI CHIARA', category: 'PERSON' },
    { text: 'Chiara Bernasconi', category: 'PERSON' },
    { text: 'C. Bernasconi', category: 'PERSON' },
    { text: 'matricola 7714', category: 'ID' },
    { text: '4 marzo 1987', category: 'DATE' },
    { text: 'Via ai Ronchi 9', category: 'ADDRESS' },
    { text: '6900 Lugano', category: 'ADDRESS' },
    { text: '756.6120.4473.09', category: 'AHV' },
    { text: '079 555 23 68', category: 'PHONE' },
    { text: 'chiara.bernasconi@example.ch', category: 'EMAIL' },
    { text: 'CH93 0076 4302 1187 5560 2', category: 'IBAN' },
    { text: 'Marco Pedrazzini', category: 'PERSON' },
    { text: 'M. Pedrazzini', category: 'PERSON' },
    { text: 'Daniela Righetti', category: 'PERSON' },
    { text: 'D. Righetti', category: 'PERSON' },
    { text: 'daniela.righetti@vedeggio.example', category: 'EMAIL' },
    { text: 'Officine Vedeggio SA', category: 'COMPANY' },
    { text: 'OFFICINE VEDEGGIO SA', category: 'COMPANY' },
    { text: 'CHE-406.118.275', category: 'ID' },
    { text: 'Via Cantonale 24', category: 'ADDRESS' },
    { text: '6805 Mezzovico', category: 'ADDRESS' },
    { text: '091 555 40 10', category: 'PHONE' },
    { text: 'Fiduciaria Lemano Sagl', category: 'COMPANY' },
  ],
  keep: ['art. 330a CO', 'art. 335c CO', 'termine di disdetta', 'contabilità analitica', 'SAP S/4HANA',
    'Swiss GAAP FER', 'libero passaggio'],
};
