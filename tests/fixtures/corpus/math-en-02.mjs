const LESSONS = [
  ['02.09.2026', 'Quadratic equations, factorising', '60 min', '75.00'],
  ['09.09.2026', 'Quadratic formula, discriminant', '60 min', '75.00'],
  ['16.09.2026', 'Exponential functions, logarithms', '90 min', '112.50'],
  ['23.09.2026', 'Logarithm rules, exam preparation', '60 min', '75.00'],
  ['30.09.2026', 'Trigonometry in right triangles', '60 min', '75.00'],
  ['07.10.2026', 'Corrections of the class test', '45 min', '56.25'],
];

export default {
  id: 'math-en-02',
  domain: 'math',
  language: 'en',
  title: 'Tutoring invoice and homework sheet',
  header: 'NADINE FAVRE MATHS TUTORING | Invoice 2026-031 | Pupil: OLIVER HUBER',
  footer: 'N. Favre, Maths tutoring - invoice and homework for Oliver Huber',
  parts: [
    {
      html: String.raw`
<div class="as-image">Nadine Favre - Maths &amp; Physics Tutoring - Grade 7 to Matura</div>
<p class="small">Nadine Favre, Rue des Alpes 27, 1700 Fribourg, nadine.favre@tutoring.example, 079 555 41 86</p>
<p>Mr and Mrs Daniel and Karin Huber-Steiner<br>Schönbergstrasse 12<br>1700 Fribourg</p>
<p class="right">Fribourg, 9 October 2026</p>
<h1>Invoice 2026-031</h1>
<table class="facts">
<tr><th>Pupil</th><td>Oliver Huber, born 21.05.2011, Collège du Bourg, class 4B</td></tr>
<tr><th>Customer no.</th><td>NF-C-0147</td></tr>
<tr><th>Period</th><td>September and October 2026</td></tr>
<tr><th>Rate</th><td>CHF 75.00 per hour (60 min), billed per 15 min</td></tr>
</table>
<table class="grid">
<tr><th>Date</th><th>Topic</th><th>Duration</th><th>Amount (CHF)</th></tr>
${LESSONS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
<tr><td></td><td>Worksheets and copies</td><td></td><td>12.00</td></tr>
<tr><td></td><td><b>Total</b></td><td>6 h 15 min</td><td><b>480.75</b></td></tr>
</table>
<p>Not subject to VAT (turnover below CHF 100 000, Art. 10 para. 2 MWSTG). Please pay within 30 days to:</p>
<table class="facts">
<tr><th>Account holder</th><td>Nadine Favre, 1700 Fribourg</td></tr>
<tr><th>IBAN</th><td>CH37 0076 8300 1452 9087 3</td></tr>
<tr><th>Reference</th><td>2026-031 Huber</td></tr>
</table>
<p>Dear Mr and Mrs Huber, Oliver has made good progress with quadratic equations; he now finds the discriminant
reliably and checks his solutions. Logarithms still need practice before the test on 22 October. I have
attached this week's homework sheet. If Oliver cannot attend on 14 October, please let me know by text message
to 079 555 41 86 at least 24 hours in advance.</p>
<p>Kind regards<br>Nadine Favre</p>
`,
    },
    {
      html: String.raw`
<h1>Homework sheet 6 - Oliver, due 14 October 2026</h1>
<p class="small">Tutor: N. Favre. Show every step, write the solution set at the end, check with the calculator.</p>
<h2>1 Quadratic equations</h2>
<p>Solve with the quadratic formula</p>
<tex display>x_{1,2} = \frac{-b \pm \sqrt{b^{2} - 4ac}}{2a}</tex>
<p>and state the discriminant <tex>D = b^{2} - 4ac</tex> first.</p>
<ol type="a">
<li><tex>2x^{2} - 7x + 3 = 0</tex></li>
<li><tex>x^{2} + 6x + 9 = 0</tex></li>
<li><tex>3x^{2} + x + 5 = 0</tex> (what does a negative discriminant mean?)</li>
</ol>
<p>Last week on the whiteboard we factorised this one together; solve it again without looking at your notes:</p>
<div class="as-image">Whiteboard, 07.10.: x^2 + 5x + 6 = 0 &nbsp; =&gt; (x + 2)(x + 3) = 0 &nbsp; =&gt; x = -2 or x = -3 &nbsp; (Oliver, check!)</div>
<h2>2 Fractions and roots</h2>
<p>Simplify as far as possible:</p>
<tex display>\frac{\frac{1}{x} + \frac{1}{y}}{\frac{1}{x} - \frac{1}{y}}</tex>
<tex display>\sqrt{50} - \sqrt{18} + \sqrt[3]{54}</tex>
<h2>3 Exponentials and logarithms</h2>
<p>Use the logarithm rules for products and powers to solve:</p>
<tex display>3^{2x - 1} = 81</tex>
<tex display>\log_{2}(x + 3) + \log_{2}(x - 3) = 4</tex>
<h2>4 Piecewise function</h2>
<p>Sketch the graph of</p>
<tex display>f(x) = \begin{cases} x^{2} & x < 1 \\ 2 - x & x \geq 1 \end{cases}</tex>
<p>and decide whether f is continuous at x = 1.</p>
<h2>5 Bonus (optional)</h2>
<p>Compute the sum <tex>\sum_{k=1}^{10} (2k - 1)</tex> and guess a formula for the first n odd numbers.</p>
<div class="as-image signature">Parent signature: K. Huber-Steiner</div>
`,
    },
  ],
  values: [
    { text: 'NADINE FAVRE', category: 'PERSON' },
    { text: 'Nadine Favre', category: 'PERSON' },
    { text: 'N. Favre', category: 'PERSON' },
    { text: 'OLIVER HUBER', category: 'PERSON' },
    { text: 'Oliver Huber', category: 'PERSON' },
    { text: 'Oliver', category: 'PERSON' },
    { text: 'Daniel and Karin Huber-Steiner', category: 'PERSON' },
    { text: 'K. Huber-Steiner', category: 'PERSON' },
    { text: 'Mr and Mrs Huber', category: 'PERSON' },
    { text: 'Rue des Alpes 27', category: 'ADDRESS' },
    { text: 'Schönbergstrasse 12', category: 'ADDRESS' },
    { text: '1700 Fribourg', category: 'ADDRESS' },
    { text: 'nadine.favre@tutoring.example', category: 'EMAIL' },
    { text: '079 555 41 86', category: 'PHONE' },
    { text: '21.05.2011', category: 'DATE' },
    { text: 'class 4B', category: 'ID' },
    { text: 'NF-C-0147', category: 'ID' },
    { text: 'CH37 0076 8300 1452 9087 3', category: 'IBAN' },
    { text: '2026-031 Huber', category: 'ID' },
  ],
  keep: ['quadratic formula', 'discriminant', 'Art. 10 para. 2 MWSTG', 'CHF 75.00 per hour', 'x^2 + 5x + 6 = 0',
    'Logarithm rules', 'Piecewise function'],
};
