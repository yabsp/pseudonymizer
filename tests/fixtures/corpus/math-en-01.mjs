const SCORES = [
  ['1', 'Limits and continuity', '10', '9'],
  ['2', 'Derivatives, implicit differentiation', '10', '10'],
  ['3', 'Integration by parts and substitution', '12', '8'],
  ['4', 'Improper integrals', '8', '6'],
  ['5', 'Series and convergence tests', '12', '7'],
  ['6', 'Taylor polynomials', '8', '8'],
  ['Total', '', '60', '48'],
];

export default {
  id: 'math-en-01',
  domain: 'math',
  language: 'en',
  title: 'Analysis I (Calculus) - graded final exam with solutions',
  header: 'LAKESIDE INSTITUTE OF TECHNOLOGY | Analysis I, Final Exam | RAMAN PRIYA (22-817-305)',
  footer: 'Graded copy for P. Raman - do not distribute',
  parts: [
    {
      html: String.raw`
<p class="small">Lakeside Institute of Technology, School of Basic Sciences, Avenue de la Gare 48, 1003 Lausanne</p>
<h1>Analysis I (Calculus) - Final Exam, Winter Session 2026</h1>
<table class="facts">
<tr><th>Student</th><td>Priya Raman</td></tr>
<tr><th>Student ID</th><td>22-817-305</td></tr>
<tr><th>Programme</th><td>BSc Mechanical Engineering, year 1</td></tr>
<tr><th>Email</th><td>priya.raman@students.lit.example</td></tr>
<tr><th>Exam date</th><td>27 January 2026, 09:15-12:15, room CE 1 515, seat 88</td></tr>
<tr><th>Lecturer</th><td>Dr. Helen Whitcombe</td></tr>
<tr><th>Graded by</th><td>Jonas Brändli (teaching assistant), second reader Amélie Favre</td></tr>
</table>
<h2>Score sheet</h2>
<table class="grid">
<tr><th>Problem</th><th>Topic</th><th>Max.</th><th>Points</th></tr>
${SCORES.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<p>Grade: <b>5.0</b> on the Swiss scale. The grade is computed as <tex>G = 1 + 5 \cdot \frac{P}{60}</tex>, rounded
to the nearest quarter, so <tex>G = 1 + 5 \cdot \frac{48}{60} = 5.0</tex>.</p>
<p>Dear Priya, overall a solid exam. Your work on derivatives and Taylor polynomials was excellent; the points
were lost mainly on series (problem 5), where several convergence tests were applied without checking their
hypotheses. Detailed comments follow each problem. - Jonas</p>

<h2>Problem 1 (10 points)</h2>
<p>Compute the following limits.</p>
<tex display>\text{(a)} \quad \lim_{x \to 0} \frac{\sin(3x)}{x}</tex>
<tex display>\text{(b)} \quad \lim_{x \to \infty} \left(1 + \frac{2}{x}\right)^{x}</tex>
<tex display>\text{(c)} \quad \lim_{x \to 0^{+}} x \ln x</tex>
<p><b>Solution.</b> (a) With <tex>\lim_{u \to 0} \frac{\sin u}{u} = 1</tex> and <tex>u = 3x</tex> we get
<tex>\lim_{x \to 0} \frac{\sin(3x)}{x} = 3</tex>. (b) Writing the expression as
<tex>\exp\left(x \ln\left(1 + \frac{2}{x}\right)\right)</tex> gives the limit <tex>e^{2}</tex>.
(c) By l'Hôpital's rule:</p>
<tex display>\lim_{x \to 0^{+}} x \ln x = \lim_{x \to 0^{+}} \frac{\ln x}{1/x} = \lim_{x \to 0^{+}} \frac{1/x}{-1/x^{2}} = \lim_{x \to 0^{+}} (-x) = 0</tex>
<p class="note"><b>TA comment:</b> (c) correct, but say explicitly that the quotient is of type
<tex>\frac{-\infty}{\infty}</tex> before using l'Hôpital. -1.</p>

<h2>Problem 2 (10 points)</h2>
<p>Let <tex>f(x) = x^{2} e^{-x}</tex>. Find <tex>f'(x)</tex> and the local extrema. Then find
<tex>\frac{dy}{dx}</tex> for the curve <tex>x^{3} + y^{3} = 6xy</tex> at the point <tex>(3, 3)</tex>.</p>
<p><b>Solution.</b> <tex>f'(x) = (2x - x^{2}) e^{-x} = x(2 - x) e^{-x}</tex>, so the critical points are
<tex>x = 0</tex> (minimum) and <tex>x = 2</tex> (maximum, <tex>f(2) = 4e^{-2}</tex>). Implicit differentiation:</p>
<tex display>3x^{2} + 3y^{2} \frac{dy}{dx} = 6y + 6x \frac{dy}{dx} \quad \Rightarrow \quad \frac{dy}{dx} = \frac{2y - x^{2}}{y^{2} - 2x}</tex>
<p>At <tex>(3, 3)</tex>: <tex>\frac{dy}{dx} = \frac{6 - 9}{9 - 6} = -1</tex>.</p>
<p class="note"><b>TA comment:</b> Full marks.</p>

<div class="page-break"></div>
<h2>Problem 3 (12 points)</h2>
<p>Evaluate the integrals</p>
<tex display>I_1 = \int_{0}^{\pi} x \sin x \, dx, \qquad I_2 = \int \frac{2x}{\sqrt{1 + x^{2}}} \, dx, \qquad I_3 = \int_{1}^{e} \frac{(\ln x)^{2}}{x} \, dx</tex>
<p><b>Solution.</b> Integration by parts with <tex>u = x</tex>, <tex>dv = \sin x \, dx</tex>:</p>
<tex display>I_1 = \Big[-x \cos x\Big]_{0}^{\pi} + \int_{0}^{\pi} \cos x \, dx = \pi + 0 = \pi</tex>
<p>Substitution <tex>t = 1 + x^{2}</tex>, <tex>dt = 2x \, dx</tex>:</p>
<tex display>I_2 = \int t^{-1/2} \, dt = 2\sqrt{t} + C = 2\sqrt{1 + x^{2}} + C</tex>
<p>Substitution <tex>s = \ln x</tex>, <tex>ds = \frac{dx}{x}</tex>:</p>
<tex display>I_3 = \int_{0}^{1} s^{2} \, ds = \frac{1}{3}</tex>
<p class="note"><b>TA comment:</b> In <tex>I_1</tex> you wrote <tex>\Big[x \cos x\Big]_{0}^{\pi}</tex> (sign error),
so your result was <tex>-\pi</tex>. <tex>I_3</tex>: you forgot to change the bounds and integrated from 1 to
<tex>e</tex> in the variable <tex>s</tex>. -4 in total.</p>

<h2>Problem 4 (8 points)</h2>
<p>Decide whether the improper integrals converge and compute their value if they do.</p>
<tex display>J_1 = \int_{1}^{\infty} \frac{dx}{x^{2}}, \qquad J_2 = \int_{0}^{1} \frac{dx}{\sqrt{x}}, \qquad J_3 = \int_{0}^{\infty} e^{-\alpha x} \, dx \quad (\alpha > 0)</tex>
<p><b>Solution.</b></p>
<tex display>J_1 = \lim_{R \to \infty} \left[-\frac{1}{x}\right]_{1}^{R} = 1</tex>
<tex display>J_2 = \lim_{\varepsilon \to 0^{+}} \Big[2\sqrt{x}\Big]_{\varepsilon}^{1} = 2</tex>
<tex display>J_3 = \lim_{R \to \infty} \frac{1 - e^{-\alpha R}}{\alpha} = \frac{1}{\alpha}</tex>
<p>More generally <tex>\int_{1}^{\infty} x^{-p} \, dx</tex> converges if and only if <tex>p > 1</tex>.</p>
<p class="note"><b>TA comment:</b> <tex>J_3</tex> correct, but for <tex>J_2</tex> you claimed divergence by
comparison with <tex>\frac{1}{x}</tex>; the comparison goes the wrong way on <tex>(0, 1]</tex>. -2.</p>

<div class="page-break"></div>
<h2>Problem 5 (12 points)</h2>
<p>Determine whether the series converge (absolutely, conditionally) or diverge.</p>
<tex display>\text{(a)} \quad \sum_{n=1}^{\infty} \frac{n^{2}}{2^{n}}</tex>
<tex display>\text{(b)} \quad \sum_{n=1}^{\infty} \frac{(-1)^{n+1}}{\sqrt{n}}</tex>
<tex display>\text{(c)} \quad \sum_{n=2}^{\infty} \frac{1}{n (\ln n)^{2}}</tex>
<tex display>\text{(d)} \quad \sum_{n=1}^{\infty} \frac{n!}{n^{n}}</tex>
<p><b>Solution.</b> (a) Ratio test:</p>
<tex display>\lim_{n \to \infty} \left| \frac{a_{n+1}}{a_n} \right| = \lim_{n \to \infty} \frac{(n+1)^{2}}{2 n^{2}} = \frac{1}{2} < 1</tex>
<p>so the series converges absolutely; in fact <tex>\sum_{n=1}^{\infty} \frac{n^{2}}{2^{n}} = 6</tex>.
(b) By the Leibniz criterion the series converges, since <tex>\frac{1}{\sqrt{n}}</tex> decreases to 0; it does
not converge absolutely because <tex>\sum \frac{1}{\sqrt{n}}</tex> is a <tex>p</tex>-series with
<tex>p = \frac{1}{2} \leq 1</tex>. (c) Integral test:</p>
<tex display>\int_{2}^{\infty} \frac{dx}{x (\ln x)^{2}} = \left[-\frac{1}{\ln x}\right]_{2}^{\infty} = \frac{1}{\ln 2} < \infty</tex>
<p>(d) Ratio test: <tex>\frac{a_{n+1}}{a_n} = \left(\frac{n}{n+1}\right)^{n} \to \frac{1}{e} < 1</tex>, converges.</p>
<p class="note"><b>TA comment:</b> (a) and (d) fine. In (b) you used the ratio test, which gives
<tex>\lim = 1</tex> and is therefore inconclusive; conditional convergence was not discussed. In (c) the
condition that <tex>f(x) = \frac{1}{x (\ln x)^{2}}</tex> is positive and decreasing is missing. -5.</p>

<h2>Problem 6 (8 points)</h2>
<p>Find the Taylor polynomial of degree 4 of <tex>g(x) = \cos x</tex> around <tex>x_0 = 0</tex>, estimate the
error on <tex>[-\frac{1}{2}, \frac{1}{2}]</tex> and use it to approximate <tex>\cos(0.5)</tex>.</p>
<tex display>T_4(x) = \sum_{k=0}^{2} \frac{(-1)^{k} x^{2k}}{(2k)!} = 1 - \frac{x^{2}}{2} + \frac{x^{4}}{24}</tex>
<tex display>|R_4(x)| = \left| \frac{g^{(6)}(\xi)}{6!} x^{6} \right| \leq \frac{(1/2)^{6}}{720} \approx 2.2 \cdot 10^{-5}</tex>
<p>Hence <tex>\cos(0.5) \approx T_4(0.5) = 0.877604</tex>.</p>
<p class="note"><b>TA comment:</b> Excellent, including the remark that <tex>T_4 = T_5</tex> because the odd
coefficients vanish.</p>

<div class="page-break"></div>
<h2>Exam review and regrade requests</h2>
<p>The exam review takes place on 10 February 2026 in room MA A1 10. Regrade requests must be submitted in
writing within 10 days after the review, by e-mail to the teaching assistant (jonas.braendli@lit.example,
phone +41 21 555 47 02) with the lecturer in copy (helen.whitcombe@lit.example). Only arguments about the
mathematical content are considered.</p>
<p>Office hours of Dr. Whitcombe: Thursdays 14:00-15:00, office MA B2 434.</p>
`,
    },
    {
      scan: { rotate: 1.1, noise: 14, dpi: 150 },
      html: String.raw`
<h1>Regrade request</h1>
<p>Student: Priya Raman, ID 22-817-305<br>Course: Analysis I, final exam of 27 January 2026<br>Date: 12 February 2026</p>
<p>Dear Mr Brändli,</p>
<p>I would like to ask for a regrade of problem 4. For <tex>J_2</tex> I first wrote that the integral diverges,
but in the next line I computed <tex>\lim_{\varepsilon \to 0^{+}} (2 - 2\sqrt{\varepsilon}) = 2</tex> and
circled this as my final answer. I believe at least one of the two points should be given back.</p>
<p>Kind regards,<br>Priya Raman<br>Chemin des Vignes 5, 1009 Pully, 078 555 31 64</p>
<div class="as-image signature">Decision: +1 point (problem 4), total 49/60, grade unchanged. J. Brändli, 16.02.2026</div>
`,
    },
  ],
  values: [
    { text: 'RAMAN PRIYA', category: 'PERSON' },
    { text: 'Priya Raman', category: 'PERSON' },
    { text: 'P. Raman', category: 'PERSON' },
    { text: 'Priya', category: 'PERSON' },
    { text: '22-817-305', category: 'ID' },
    { text: 'priya.raman@students.lit.example', category: 'EMAIL' },
    { text: 'seat 88', category: 'ID' },
    { text: 'Helen Whitcombe', category: 'PERSON' },
    { text: 'Dr. Whitcombe', category: 'PERSON' },
    { text: 'helen.whitcombe@lit.example', category: 'EMAIL' },
    { text: 'Jonas Brändli', category: 'PERSON' },
    { text: 'Mr Brändli', category: 'PERSON' },
    { text: 'J. Brändli', category: 'PERSON' },
    { text: 'Jonas', category: 'PERSON' },
    { text: 'jonas.braendli@lit.example', category: 'EMAIL' },
    { text: '+41 21 555 47 02', category: 'PHONE' },
    { text: 'Amélie Favre', category: 'PERSON' },
    { text: 'Chemin des Vignes 5', category: 'ADDRESS' },
    { text: '1009 Pully', category: 'ADDRESS' },
    { text: '078 555 31 64', category: 'PHONE' },
    { text: 'Lakeside Institute of Technology', category: 'COMPANY' },
    { text: 'LAKESIDE INSTITUTE OF TECHNOLOGY', category: 'COMPANY' },
    { text: 'Avenue de la Gare 48', category: 'ADDRESS' },
    { text: '1003 Lausanne', category: 'ADDRESS' },
  ],
  keep: ['ratio test', 'Leibniz criterion', 'Integration by parts', 'Taylor polynomial', 'l\'Hôpital\'s rule',
    'improper integrals', 'conditional convergence', 'Swiss scale'],
};
