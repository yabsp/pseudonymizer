export default {
  id: 'medicine-it-01',
  domain: 'medicine',
  language: 'it',
  title: 'Rapporto di psicoterapia',
  header: 'STUDIO DI PSICOTERAPIA CERESIO | Paziente: BERNASCONI GIULIA, nata il 02.04.1989',
  footer: 'Strettamente confidenziale - segreto professionale (art. 321 CP) - G. Bernasconi - Dossier PT-2026-0147',
  parts: [
    {
      html: String.raw`
<p class="small">Studio di psicoterapia Ceresio Sagl, Via Nassa 21, 6900 Lugano, tel. 091 555 72 30, segreteria@psico-ceresio.example</p>
<p>Egregio Dottore<br>Dr. med. Fabrizio Cattaneo<br>Studio medico Cattaneo<br>Via San Gottardo 64<br>6500 Bellinzona</p>
<p class="right">Lugano, 3 ottobre 2026</p>
<h1>Rapporto intermedio di psicoterapia</h1>
<table class="facts">
<tr><th>Paziente</th><td>Signora Giulia Bernasconi, nata il 02.04.1989</td></tr>
<tr><th>Indirizzo</th><td>Via ai Ronchi 3, 6814 Lamone</td></tr>
<tr><th>N. AVS</th><td>756.9142.0376.61</td></tr>
<tr><th>Cassa malati</th><td>Cassa malati Ticino Salute SA, n. assicurato 88-430-2291</td></tr>
<tr><th>Dossier</th><td>PT-2026-0147</td></tr>
<tr><th>Prescrizione</th><td>psicoterapia psicologica su prescrizione medica (art. 11b OPre), 15 sedute, seconda serie</td></tr>
<tr><th>Terapeuta</th><td>lic. phil. Martina Pedrazzini, psicoterapeuta riconosciuta a livello federale</td></tr>
</table>
<p>Caro collega Cattaneo,</p>
<p>con il consenso scritto della paziente le trasmetto il rapporto intermedio dopo 24 sedute, necessario per la
richiesta di proseguimento alla cassa malati. La signora Bernasconi mi è stata inviata da Lei il 14.01.2026 per
uno stato depressivo insorto dopo la separazione dal compagno e la perdita del posto di lavoro.</p>
<h2>Diagnosi (ICD-10)</h2>
<ul>
<li>F33.1 Disturbo depressivo ricorrente, episodio attuale di gravità media</li>
<li>F41.1 Disturbo d'ansia generalizzato</li>
<li>Z63.5 Disgregazione della famiglia per separazione</li>
</ul>
<h2>Anamnesi</h2>
<p>La paziente, 37 anni, impiegata di commercio, vive da sola con il figlio Leonardo (8 anni) a Lamone. Il padre
del bambino, il signor Davide Rusconi, ha lasciato l'abitazione comune nell'ottobre 2025; i contatti avvengono
attraverso l'Autorità regionale di protezione. La madre della paziente, signora Elena Bernasconi-Gianola,
residente a Mendrisio, la sostiene nella cura del figlio. Il fratello Marco Bernasconi soffre di un disturbo
bipolare ed è seguito presso la Clinica psichiatrica cantonale; la familiarità per disturbi dell'umore è quindi
positiva.</p>
<p>Un primo episodio depressivo si era verificato nel 2012, durante gli studi, trattato con sertralina per un anno.
Non vi sono stati tentativi di suicidio. Consumo di alcol occasionale, nessun uso di sostanze.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>Decorso della terapia</h2>
<p>All'inizio la signora Bernasconi presentava umore depresso per gran parte della giornata, anedonia, disturbi
del sonno con risvegli precoci, perdita di peso di 5 kg in tre mesi e marcata ruminazione sul futuro. Il punteggio
PHQ-9 era di 19, il GAD-7 di 15. Riferiva pensieri passivi di morte senza intenzionalità né piani concreti; è
stato concordato un piano di sicurezza scritto con i numeri di emergenza e il coinvolgimento della madre.</p>
<p>Il trattamento segue un approccio cognitivo-comportamentale con elementi di attivazione comportamentale e di
terapia basata sulla mindfulness. Nelle prime dieci sedute il lavoro si è concentrato sulla strutturazione della
giornata, sulla ripresa di attività gratificanti e sul riconoscimento dei pensieri automatici negativi
("sono una cattiva madre", "non troverò più lavoro").</p>
<p>Il Dr. Cattaneo ha introdotto il 20.02.2026 una terapia con escitalopram 10 mg, aumentata a 15 mg dopo sei
settimane, ben tollerata. Da aprile si osserva un netto miglioramento del sonno e dell'energia.</p>
<p>Un momento critico si è verificato a giugno, quando il signor Rusconi ha chiesto una modifica del diritto di
visita. Giulia ha reagito con un aumento dell'ansia e un breve ritiro sociale. In due sedute congiunte, svolte con
il consenso di entrambi, si è lavorato sulla comunicazione genitoriale nell'interesse di Leonardo.</p>
<p>Attualmente la paziente partecipa a un programma di reinserimento professionale dell'Ufficio regionale di
collocamento e ha iniziato uno stage presso la ditta Fiduciaria Lago Sagl di Agno. Il PHQ-9 è sceso a 9, il
GAD-7 a 8.</p>
<h2>Valutazione attuale</h2>
<p>Remissione parziale dell'episodio depressivo. Persistono una vulnerabilità a situazioni di conflitto e una
tendenza all'autosvalutazione. Non sono presenti ideazioni suicidarie (valutazione con C-SSRS negativa il
26.09.2026). La capacità lavorativa è stimata al 50 %.</p>
<h2>Obiettivi per la prossima serie</h2>
<ul>
<li>consolidare le strategie di regolazione emotiva e la prevenzione delle ricadute</li>
<li>lavorare sugli schemi di autosvalutazione</li>
<li>sostenere il rientro professionale progressivo</li>
<li>riduzione graduale della frequenza delle sedute da settimanale a quindicinale</li>
</ul>
`,
    },
    {
      html: String.raw`
<h2>Richiesta</h2>
<p>Chiedo pertanto la prescrizione di un'ulteriore serie di 15 sedute di psicoterapia, nonché il proseguimento
della terapia farmacologica con escitalopram 15 mg per almeno sei mesi dopo la remissione, secondo le
raccomandazioni per il disturbo depressivo ricorrente.</p>
<p>Le informazioni contenute in questo rapporto sono soggette al segreto professionale (art. 321 CP) e non vanno
trasmesse al datore di lavoro né all'Autorità regionale di protezione senza il consenso esplicito della paziente.</p>
<h2>Sedute svolte</h2>
<table class="grid">
<tr><th>Periodo</th><th>Sedute</th><th>Durata</th><th>Contenuto principale</th></tr>
<tr><td>gennaio - marzo 2026</td><td>10</td><td>60 min</td><td>stabilizzazione, piano di sicurezza, attivazione comportamentale</td></tr>
<tr><td>aprile - giugno 2026</td><td>9</td><td>60 min</td><td>ristrutturazione cognitiva, 2 sedute congiunte con D. Rusconi</td></tr>
<tr><td>luglio - settembre 2026</td><td>5</td><td>50 min</td><td>prevenzione delle ricadute, reinserimento lavorativo</td></tr>
</table>
<p>Resto volentieri a disposizione per un colloquio telefonico.</p>
<p>Cordiali saluti</p>
<p>lic. phil. Martina Pedrazzini<br>Psicoterapeuta FSP<br>martina.pedrazzini@psico-ceresio.example<br>tel. 091 555 72 31</p>
<div class="as-image signature">M. Pedrazzini</div>
<p class="small">Allegato: consenso della paziente alla trasmissione del rapporto, firmato da Giulia Bernasconi il 29.09.2026.<br>
Persona di contatto in caso di emergenza indicata dalla paziente: Elena Bernasconi-Gianola, tel. 079 555 12 64.</p>
`,
    },
  ],
  values: [
    { text: 'BERNASCONI GIULIA', category: 'PERSON' },
    { text: 'Giulia Bernasconi', category: 'PERSON' },
    { text: 'G. Bernasconi', category: 'PERSON' },
    { text: 'Giulia', category: 'PERSON' },
    { text: '02.04.1989', category: 'DATE' },
    { text: 'Via ai Ronchi 3', category: 'ADDRESS' },
    { text: '6814 Lamone', category: 'ADDRESS' },
    { text: 'Lamone', category: 'ADDRESS' },
    { text: '756.9142.0376.61', category: 'AHV' },
    { text: 'Cassa malati Ticino Salute SA', category: 'COMPANY' },
    { text: '88-430-2291', category: 'ID' },
    { text: 'PT-2026-0147', category: 'ID' },
    { text: 'Martina Pedrazzini', category: 'PERSON' },
    { text: 'M. Pedrazzini', category: 'PERSON' },
    { text: 'martina.pedrazzini@psico-ceresio.example', category: 'EMAIL' },
    { text: '091 555 72 31', category: 'PHONE' },
    { text: 'Studio di psicoterapia Ceresio Sagl', category: 'COMPANY' },
    { text: 'STUDIO DI PSICOTERAPIA CERESIO', category: 'COMPANY' },
    { text: 'Via Nassa 21', category: 'ADDRESS' },
    { text: '6900 Lugano', category: 'ADDRESS' },
    { text: '091 555 72 30', category: 'PHONE' },
    { text: 'segreteria@psico-ceresio.example', category: 'EMAIL' },
    { text: 'Fabrizio Cattaneo', category: 'PERSON' },
    { text: 'Studio medico Cattaneo', category: 'COMPANY' },
    { text: 'Via San Gottardo 64', category: 'ADDRESS' },
    { text: '6500 Bellinzona', category: 'ADDRESS' },
    { text: 'Leonardo', category: 'PERSON' },
    { text: 'Davide Rusconi', category: 'PERSON' },
    { text: 'D. Rusconi', category: 'PERSON' },
    { text: 'Elena Bernasconi-Gianola', category: 'PERSON' },
    { text: 'Mendrisio', category: 'ADDRESS' },
    { text: 'Marco Bernasconi', category: 'PERSON' },
    { text: 'Fiduciaria Lago Sagl', category: 'COMPANY' },
    { text: 'Agno', category: 'ADDRESS' },
    { text: '079 555 12 64', category: 'PHONE' },
  ],
  keep: ['F33.1 Disturbo depressivo ricorrente', 'F41.1 Disturbo d\'ansia generalizzato', 'escitalopram 15 mg',
    'sertralina', 'PHQ-9', 'GAD-7', 'C-SSRS', 'art. 321 CP', 'art. 11b OPre', 'cognitivo-comportamentale'],
};
