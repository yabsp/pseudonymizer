export default {
  id: 'math-it-01',
  domain: 'math',
  language: 'it',
  title: 'Esame di Analisi matematica II, verbale e correzione',
  header: 'UNIVERSITÀ DEL CERESIO | Analisi matematica II | Sessione estiva 2026',
  footer: 'Correzione individuale PEDRAZZINI GIULIA - Matricola 23-604-219 - riservato',
  parts: [
    {
      html: String.raw`
<p class="small">Università del Ceresio, Facoltà di scienze informatiche, Via Ceresio 44, 6900 Lugano</p>
<h1>Esame scritto di Analisi matematica II</h1>
<table class="facts">
<tr><th>Studentessa</th><td>Giulia Pedrazzini</td></tr>
<tr><th>Matricola</th><td>23-604-219</td></tr>
<tr><th>Nata il</th><td>11.11.2003</td></tr>
<tr><th>Domicilio</th><td>Via ai Ronchi 3, 6942 Savosa</td></tr>
<tr><th>Telefono</th><td>076 555 20 19</td></tr>
<tr><th>Corso di laurea</th><td>Bachelor in Informatica, 2° anno</td></tr>
<tr><th>E-mail</th><td>giulia.pedrazzini@unicer.example</td></tr>
<tr><th>Data</th><td>16 giugno 2026, aula A-12, posto 41</td></tr>
<tr><th>Docente</th><td>prof. Renato Fumagalli</td></tr>
<tr><th>Correttore</th><td>Elena Quadri, assistente</td></tr>
</table>
<table class="grid">
<tr><th>Esercizio</th><th>Argomento</th><th>Punti</th><th>Ottenuti</th></tr>
<tr><td>1</td><td>Derivate parziali e piano tangente</td><td>8</td><td>8</td></tr>
<tr><td>2</td><td>Massimi e minimi vincolati (moltiplicatori di Lagrange)</td><td>10</td><td>6</td></tr>
<tr><td>3</td><td>Integrali doppi, coordinate polari</td><td>8</td><td>7</td></tr>
<tr><td>4</td><td>Equazioni differenziali lineari del secondo ordine</td><td>10</td><td>9</td></tr>
<tr><td>Totale</td><td></td><td>36</td><td>30</td></tr>
</table>
<p>Voto: <b>5.25</b>, calcolato come <tex>v = 1 + 5 \cdot \frac{p}{36}</tex> e arrotondato al quarto di punto.
Esame superato, 6 ECTS.</p>
<p>Gentile Giulia, l'elaborato è chiaro e ben strutturato. Nell'esercizio 2 manca la verifica dei punti sul
bordo del vincolo; si veda il commento. Per la visione dell'esame scrivere a elena.quadri@unicer.example
oppure telefonare allo 091 555 38 74. - E. Quadri</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h2>Esercizio 1</h2>
<p>Sia <tex>f(x, y) = x^{2} y + e^{xy}</tex>. Le derivate parziali sono</p>
<tex display>\frac{\partial f}{\partial x} = 2xy + y e^{xy}, \qquad \frac{\partial f}{\partial y} = x^{2} + x e^{xy}</tex>
<p>e il gradiente nel punto <tex>(1, 0)</tex> vale <tex>\nabla f(1, 0) = (0, 2)</tex>. Piano tangente:</p>
<tex display>z = f(1, 0) + \nabla f(1, 0) \cdot (x - 1, y) = 1 + 2y</tex>
<p>La matrice hessiana è</p>
<tex display>H_f(x, y) = \begin{pmatrix} 2y + y^{2} e^{xy} & 2x + e^{xy} + xy e^{xy} \\ 2x + e^{xy} + xy e^{xy} & x^{2} e^{xy} \end{pmatrix}</tex>
<p class="note">Commento: corretto. 8/8</p>
<h2>Esercizio 2</h2>
<p>Trovare gli estremi di <tex>f(x, y) = x + 2y</tex> sul vincolo <tex>g(x, y) = x^{2} + y^{2} - 5 = 0</tex>.</p>
<tex display>\mathcal{L}(x, y, \lambda) = x + 2y - \lambda (x^{2} + y^{2} - 5)</tex>
<tex display>\begin{cases} 1 - 2\lambda x = 0 \\ 2 - 2\lambda y = 0 \\ x^{2} + y^{2} = 5 \end{cases}</tex>
<p>Si ottiene <tex>y = 2x</tex>, quindi <tex>5x^{2} = 5</tex> e i punti <tex>(1, 2)</tex> con
<tex>f = 5</tex> (massimo) e <tex>(-1, -2)</tex> con <tex>f = -5</tex> (minimo).</p>
<p class="note">Commento: la studentessa ha trovato solo <tex>(1, 2)</tex>, dimenticando la radice
<tex>x = -1</tex> di <tex>x^{2} = 1</tex>. Manca inoltre la giustificazione con il teorema di Weierstrass
(vincolo compatto). 6/10</p>
<h2>Esercizio 3</h2>
<p>Calcolare <tex>\iint_{D} (x^{2} + y^{2}) \, dx \, dy</tex> con <tex>D = \{(x, y) : 1 \leq x^{2} + y^{2} \leq 4, \; y \geq 0\}</tex>.
In coordinate polari <tex>x = \rho \cos\theta</tex>, <tex>y = \rho \sin\theta</tex>, con jacobiano <tex>\rho</tex>:</p>
<tex display>\int_{0}^{\pi} \int_{1}^{2} \rho^{2} \cdot \rho \, d\rho \, d\theta = \pi \left[\frac{\rho^{4}}{4}\right]_{1}^{2} = \frac{15\pi}{4}</tex>
<p class="note">Commento: risultato giusto, ma il dominio di <tex>\theta</tex> non è motivato. 7/8</p>
<h2>Esercizio 4</h2>
<p>Risolvere il problema di Cauchy</p>
<tex display>y'' - 3y' + 2y = e^{3t}, \qquad y(0) = 1, \quad y'(0) = 0</tex>
<p>L'equazione caratteristica <tex>r^{2} - 3r + 2 = 0</tex> ha radici <tex>r_1 = 1</tex> e <tex>r_2 = 2</tex>.
Una soluzione particolare è <tex>y_p(t) = \frac{1}{2} e^{3t}</tex>, quindi</p>
<tex display>y(t) = c_1 e^{t} + c_2 e^{2t} + \frac{1}{2} e^{3t}</tex>
<p>Dalle condizioni iniziali <tex>c_1 + c_2 = \frac{1}{2}</tex> e <tex>c_1 + 2c_2 = -\frac{3}{2}</tex>, da cui
<tex>c_1 = \frac{5}{2}</tex>, <tex>c_2 = -2</tex>:</p>
<tex display>y(t) = \frac{5}{2} e^{t} - 2 e^{2t} + \frac{1}{2} e^{3t}</tex>
<p class="note">Commento: errore di segno in <tex>y'(0)</tex>, corretto alla riga successiva. 9/10</p>
<p>Lugano, 23 giugno 2026<br>Il docente: Renato Fumagalli<br>La correttrice: Elena Quadri</p>
`,
    },
  ],
  values: [
    { text: 'Giulia Pedrazzini', category: 'PERSON' },
    { text: 'Giulia', category: 'PERSON' },
    { text: 'PEDRAZZINI GIULIA', category: 'PERSON' },
    { text: '11.11.2003', category: 'DATE' },
    { text: 'Via ai Ronchi 3', category: 'ADDRESS' },
    { text: '6942 Savosa', category: 'ADDRESS' },
    { text: '076 555 20 19', category: 'PHONE' },
    { text: '23-604-219', category: 'ID' },
    { text: 'giulia.pedrazzini@unicer.example', category: 'EMAIL' },
    { text: 'posto 41', category: 'ID' },
    { text: 'Renato Fumagalli', category: 'PERSON' },
    { text: 'Elena Quadri', category: 'PERSON' },
    { text: 'E. Quadri', category: 'PERSON' },
    { text: 'elena.quadri@unicer.example', category: 'EMAIL' },
    { text: '091 555 38 74', category: 'PHONE' },
    { text: 'Università del Ceresio', category: 'COMPANY' },
    { text: 'UNIVERSITÀ DEL CERESIO', category: 'COMPANY' },
    { text: 'Via Ceresio 44', category: 'ADDRESS' },
    { text: '6900 Lugano', category: 'ADDRESS' },
  ],
  keep: ['moltiplicatori di Lagrange', 'teorema di Weierstrass', 'coordinate polari', 'problema di Cauchy',
    'matrice hessiana', 'equazione caratteristica', '6 ECTS'],
};
