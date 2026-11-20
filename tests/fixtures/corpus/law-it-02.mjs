export default {
  id: 'law-it-02',
  domain: 'law',
  language: 'it',
  title: 'Procura e mandato',
  parts: [
    {
      html: String.raw`
<p class="small">Studio legale Fontana Zanetti, Piazza Grande 14, 6600 Locarno, tel. 091 555 40 62, segreteria@fontana-zanetti.example</p>
<h1>Procura</h1>
<p>La sottoscritta</p>
<table class="facts">
<tr><th>Mandante</th><td>Paola Righetti-Fumagalli, nata il 27 aprile 1958, cittadina svizzera, attinente di Avegno Gordevio, domiciliata in Via ai Grotti 9, 6672 Gordevio, N. AVS 756.6120.4471.83</td></tr>
</table>
<p>conferisce con la presente procura all'</p>
<table class="facts">
<tr><th>Mandatario</th><td>avv. Luca Fontana, iscritto nel Registro cantonale degli avvocati, Studio legale Fontana Zanetti, Piazza Grande 14, 6600 Locarno, l.fontana@fontana-zanetti.example</td></tr>
</table>
<p>il mandato di rappresentarla, con facoltà di sostituzione, nella successione del defunto marito Carlo Righetti,
nato il 3 febbraio 1952, deceduto a Locarno il 21 agosto 2026 (incarto della Pretura di Locarno-Campagna
SU.2026.388), e in particolare di:</p>
<ol>
<li>richiedere il certificato ereditario (art. 559 CC) e, se del caso, l'inventario a beneficio (art. 580 CC);</li>
<li>rappresentarla verso gli altri eredi, segnatamente il figlio Marco Righetti, e verso l'esecutore testamentario;</li>
<li>trattare e concludere la vendita del fondo particella n. 812 RFD Avegno Gordevio, comprese l'iscrizione e la
cancellazione di diritti nel registro fondiario (art. 396 cpv. 3 CO);</li>
<li>incassare e quietanzare somme, in particolare il saldo del conto IBAN CH93 0076 4120 5531 0098 2;</li>
<li>agire in giudizio, transigere, desistere e ricorrere (art. 68 CPC).</li>
</ol>
<p>Il mandatario è autorizzato a consultare gli atti presso le autorità fiscali, il registro fondiario e gli
istituti bancari. La procura vale fino a revoca scritta (art. 34 CO e art. 404 CO); essa non si estingue con la
perdita dell'esercizio dei diritti civili della mandante (art. 35 cpv. 1 CO).</p>
<p>Copia del documento d'identità della mandante:</p>
<div class="as-image">CONFOEDERATIO HELVETICA - CARTA D'IDENTITÀ<br>Cognome: RIGHETTI-FUMAGALLI<br>Nome: PAOLA<br>Data di nascita: 27 04 1958 &nbsp; Sesso: F<br>N. documento: C7R4K2Z91 &nbsp; Valida fino al: 11 03 2031<br>Indirizzo: Via ai Grotti 9, 6672 Gordevio</div>
<p>Gordevio, 9 ottobre 2026</p>
<div class="as-image signature">P. Righetti-Fumagalli</div>
<p class="small">Firma autenticata: Notaio avv. Sandro Mazzoleni, Locarno, registro autentiche n. 2026/1174.</p>
`,
    },
  ],
  values: [
    { text: 'Studio legale Fontana Zanetti', category: 'COMPANY' },
    { text: 'Piazza Grande 14', category: 'ADDRESS' },
    { text: '6600 Locarno', category: 'ADDRESS' },
    { text: '091 555 40 62', category: 'PHONE' },
    { text: 'segreteria@fontana-zanetti.example', category: 'EMAIL' },
    { text: 'Paola Righetti-Fumagalli', category: 'PERSON' },
    { text: 'RIGHETTI-FUMAGALLI', category: 'PERSON' },
    { text: 'PAOLA', category: 'PERSON' },
    { text: 'P. Righetti-Fumagalli', category: 'PERSON' },
    { text: '27 aprile 1958', category: 'DATE' },
    { text: '27 04 1958', category: 'DATE' },
    { text: 'Via ai Grotti 9', category: 'ADDRESS' },
    { text: '6672 Gordevio', category: 'ADDRESS' },
    { text: '756.6120.4471.83', category: 'AHV' },
    { text: 'Luca Fontana', category: 'PERSON' },
    { text: 'l.fontana@fontana-zanetti.example', category: 'EMAIL' },
    { text: 'Carlo Righetti', category: 'PERSON' },
    { text: '3 febbraio 1952', category: 'DATE' },
    { text: 'SU.2026.388', category: 'ID' },
    { text: 'Marco Righetti', category: 'PERSON' },
    { text: 'particella n. 812 RFD Avegno Gordevio', category: 'ID' },
    { text: 'CH93 0076 4120 5531 0098 2', category: 'IBAN' },
    { text: 'C7R4K2Z91', category: 'ID' },
    { text: 'Sandro Mazzoleni', category: 'PERSON' },
    { text: '2026/1174', category: 'ID' },
  ],
  keep: ['certificato ereditario (art. 559 CC)', 'inventario a beneficio (art. 580 CC)', 'art. 396 cpv. 3 CO',
    'art. 35 cpv. 1 CO', 'art. 68 CPC', 'registro fondiario', 'facoltà di sostituzione'],
};
