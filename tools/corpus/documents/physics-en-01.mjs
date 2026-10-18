// Measured series are generated from the physical model plus a small deterministic "measurement noise".
const noise = (i, scale) => (((i * 7919 + 13) % 101) / 100 - 0.5) * scale;
const fmt = (x, digits) => x.toFixed(digits);

// Calorimeter: temperature of water after an aluminium block at about 98 °C was dropped in at t = 60 s.
const MIXING = Array.from({ length: 36 }, (_, i) => {
  const t = i * 15;
  const rise = t < 60 ? 0 : 6.42 * (1 - Math.exp(-(t - 60) / 35));
  const loss = t < 60 ? 0 : 0.0021 * (t - 60);
  return [t, fmt(21.35 + rise - loss + noise(i, 0.04), 2)];
});

// Cooling of the empty calorimeter (Newton's law of cooling), for the heat-loss correction.
const COOLING = Array.from({ length: 30 }, (_, i) => {
  const t = i * 60;
  return [t, fmt(22.0 + 48.0 * Math.exp(-t / 2150) + noise(i + 50, 0.08), 2)];
});

// Rüchardt experiment: 10 runs, time for 10 oscillations of the ball.
const RUECHARDT = Array.from({ length: 10 }, (_, i) => {
  const t10 = 11.62 + noise(i + 90, 0.18);
  return [i + 1, fmt(t10, 2), fmt(t10 / 10, 3)];
});

const table = (head, rows) => `<table class="grid">
<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>`;

export default {
  id: 'physics-en-01',
  domain: 'physics',
  language: 'en',
  title: 'Lab report: specific heat capacity and adiabatic index',
  header: 'AARE UNIVERSITY OF APPLIED SCIENCES | Physics Lab II | Group B07: KESSLER, BENSAID',
  footer: 'Lab report T3 - N. Kessler, A. Bensaid - submitted 14.04.2026',
  parts: [
    {
      html: String.raw`
<p class="small">Aare University of Applied Sciences, Institute of Physics, Bahnhofstrasse 102, 5000 Aarau</p>
<h1>Experiment T3: Specific heat capacity of aluminium and adiabatic index of air</h1>
<table class="facts">
<tr><th>Authors</th><td>Noah Kessler (student no. 24-301-882), Aisha Bensaid (student no. 24-305-117)</td></tr>
<tr><th>Group</th><td>B07, Tuesday afternoon</td></tr>
<tr><th>Lab assistant</th><td>Dr. Florian Gisler</td></tr>
<tr><th>Room</th><td>Lab building C, room C 2.14</td></tr>
<tr><th>Date of measurement</th><td>31 March 2026</td></tr>
<tr><th>Contact</th><td>noah.kessler@stud.aare-uas.example, aisha.bensaid@stud.aare-uas.example</td></tr>
</table>
<h2>Abstract</h2>
<p>We determined the specific heat capacity of an aluminium block with the method of mixtures in a Dewar
calorimeter and the adiabatic index (heat capacity ratio) of air with Rüchardt's method. After correcting for
heat losses with Newton's law of cooling we obtain <tex>c_{\mathrm{Al}} = (905 \pm 21)\,\mathrm{J\,kg^{-1}\,K^{-1}}</tex>,
in agreement with the literature value of <tex>897\,\mathrm{J\,kg^{-1}\,K^{-1}}</tex>. For air we find
<tex>\gamma = 1.38 \pm 0.04</tex>, compatible with <tex>\gamma = \frac{7}{5}</tex> for a diatomic ideal gas.</p>
<h2>1 Theory</h2>
<h3>1.1 Method of mixtures</h3>
<p>A body of mass <tex>m_{\mathrm{Al}}</tex> at temperature <tex>T_{\mathrm{Al}}</tex> is placed in water of mass
<tex>m_{w}</tex> at temperature <tex>T_{1}</tex>. If no heat is exchanged with the surroundings, energy
conservation gives at the mixing temperature <tex>T_{m}</tex>:</p>
<tex display>m_{\mathrm{Al}}\, c_{\mathrm{Al}} \,(T_{\mathrm{Al}} - T_{m}) = (m_{w} c_{w} + C_{K})(T_{m} - T_{1})</tex>
<p>where <tex>C_{K}</tex> is the heat capacity of the calorimeter. Solving for the unknown:</p>
<tex display>c_{\mathrm{Al}} = \frac{(m_{w} c_{w} + C_{K})(T_{m} - T_{1})}{m_{\mathrm{Al}} (T_{\mathrm{Al}} - T_{m})}</tex>
<h3>1.2 Heat loss correction</h3>
<p>The calorimeter exchanges heat with the room according to Newton's law of cooling,</p>
<tex display>\frac{dT}{dt} = -k \,(T - T_{\infty}) \quad \Rightarrow \quad T(t) = T_{\infty} + (T_{0} - T_{\infty})\, e^{-kt}</tex>
<p>The corrected mixing temperature is obtained by extrapolating the linear after-period back to the time
<tex>t^{*}</tex> at which the areas between the measured curve and the idealised jump are equal:</p>
<tex display>\int_{t_{0}}^{t^{*}} \big(T(t) - T_{1}\big)\, dt = \int_{t^{*}}^{t_{e}} \big(T_{m} - T(t)\big)\, dt</tex>
<h3>1.3 Rüchardt's method</h3>
<p>A ball of mass <tex>m</tex> closes a precision glass tube of cross-section <tex>A</tex> on top of a vessel of
volume <tex>V</tex> at pressure <tex>p</tex>. For a small displacement <tex>x</tex> the compression is
adiabatic, <tex>pV^{\gamma} = \mathrm{const}</tex>, so</p>
<tex display>\Delta p = -\gamma \frac{p}{V} A x, \qquad m \ddot{x} = -\frac{\gamma p A^{2}}{V} x</tex>
<p>The ball performs a harmonic oscillation with period</p>
<tex display>T = 2\pi \sqrt{\frac{m V}{\gamma p A^{2}}} \quad \Rightarrow \quad \gamma = \frac{4\pi^{2} m V}{p A^{2} T^{2}}</tex>
<p>with <tex>p = p_{0} + \frac{m g}{A}</tex>, where <tex>p_{0}</tex> is the air pressure in the room.</p>
`,
    },
    {
      html: String.raw`
<h2>2 Setup and equipment</h2>
<p>The setup was taken over from group B05 and checked by Dr. Gisler before the measurement. All
instruments are listed with their inventory and serial numbers, as required by the lab rules.</p>
${table(['Instrument', 'Type', 'Serial / inventory no.', 'Resolution'], [
  ['Dewar calorimeter with stirrer', '0.8 l, glass', 'INV-PH-04471', '-'],
  ['Digital thermometer', 'Pt100, 4-wire', 'SN 18-22671-B', '0.01 K'],
  ['Thermocouple (block temperature)', 'Type K', 'SN TK-48213-B', '0.1 K'],
  ['Data logger', '8 channels, USB', 'SN DL-2207-0193', '1 s'],
  ['Precision balance', 'max. 2100 g', 'SN BW-77310-46', '0.01 g'],
  ['Rüchardt apparatus', 'Glass vessel 10.0 l, tube d = 16 mm', 'INV-PH-03920', '-'],
  ['Light barrier with counter', 'Infrared', 'SN LB-5512-0087', '1 ms'],
  ['Barometer', 'Aneroid', 'INV-PH-01186', '0.1 hPa'],
])}
<p>The data logger was connected to the lab PC <b>phlab-c214-03</b> (IP 192.168.40.23), and the raw files
were copied to the group folder on the course server. The aluminium block was heated in a boiling water bath
for 15 minutes; its temperature was <tex>T_{\mathrm{Al}} = (97.8 \pm 0.3)\,^{\circ}\mathrm{C}</tex>.</p>
<div class="as-image screenshot">Logger T3 v2.4 | Device DL-2207-0193 | Channel 1: Pt100 SN 18-22671-B | User: nkessler | Run 2026-03-31 14:07:12 | Sample rate 1/15 s</div>
<h3>Masses and constants</h3>
${table(['Quantity', 'Symbol', 'Value'], [
  ['Mass of aluminium block', 'm_Al', '(201.47 ± 0.01) g'],
  ['Mass of water', 'm_w', '(452.10 ± 0.02) g'],
  ['Heat capacity of calorimeter', 'C_K', '(62 ± 8) J/K'],
  ['Specific heat of water', 'c_w', '4186 J/(kg K)'],
  ['Mass of oscillating ball', 'm', '(16.48 ± 0.01) g'],
  ['Vessel volume', 'V', '(10.12 ± 0.05) l'],
  ['Tube diameter', 'd', '(15.95 ± 0.02) mm'],
  ['Air pressure', 'p_0', '(965.3 ± 0.2) hPa'],
])}
`,
    },
    {
      html: String.raw`
<h2>3 Measurements</h2>
<h3>3.1 Mixing curve (block dropped at t = 60 s)</h3>
${table(['t (s)', 'T (°C)'], MIXING)}
<h3>3.2 Cooling curve of the calorimeter</h3>
<p>The calorimeter was filled with water at about 70 °C and left to cool with the lid closed.</p>
${table(['t (s)', 'T (°C)'], COOLING)}
<h3>3.3 Oscillation periods (Rüchardt)</h3>
${table(['Run', 'Time for 10 periods (s)', 'Period T (s)'], RUECHARDT)}
`,
    },
    {
      html: String.raw`
<h2>4 Analysis</h2>
<h3>4.1 Cooling constant</h3>
<p>A linear fit of <tex>\ln(T - T_{\infty})</tex> against <tex>t</tex> with <tex>T_{\infty} = 22.0\,^{\circ}\mathrm{C}</tex> gives</p>
<tex display>k = (4.65 \pm 0.06) \cdot 10^{-4}\,\mathrm{s^{-1}}, \qquad \tau = \frac{1}{k} \approx 2150\,\mathrm{s}</tex>
<p>The least-squares estimate of the slope is</p>
<tex display>\hat{k} = -\frac{\sum_{i=1}^{N} (t_i - \bar{t})(y_i - \bar{y})}{\sum_{i=1}^{N} (t_i - \bar{t})^{2}}, \qquad y_i = \ln(T_i - T_{\infty})</tex>
<h3>4.2 Corrected mixing temperature</h3>
<p>Extrapolating the after-period (<tex>t \geq 240\,\mathrm{s}</tex>) back to <tex>t^{*} = 84\,\mathrm{s}</tex>
gives <tex>T_{m} = (27.82 \pm 0.05)\,^{\circ}\mathrm{C}</tex>, with <tex>T_{1} = (21.35 \pm 0.02)\,^{\circ}\mathrm{C}</tex>.
Inserting into the formula of section 1.1:</p>
<tex display>c_{\mathrm{Al}} = \frac{(0.4521 \cdot 4186 + 62)\cdot 6.47}{0.20147 \cdot 69.98}\,\mathrm{J\,kg^{-1}\,K^{-1}} = 905\,\mathrm{J\,kg^{-1}\,K^{-1}}</tex>
<h3>4.3 Adiabatic index</h3>
<p>The mean period and its standard error are</p>
<tex display>\bar{T} = \frac{1}{n} \sum_{i=1}^{n} T_i = 1.162\,\mathrm{s}, \qquad s_{\bar{T}} = \sqrt{\frac{1}{n(n-1)} \sum_{i=1}^{n} (T_i - \bar{T})^{2}} = 0.002\,\mathrm{s}</tex>
<p>With <tex>A = \frac{\pi d^{2}}{4} = 1.998 \cdot 10^{-4}\,\mathrm{m^{2}}</tex> and
<tex>p = p_{0} + \frac{mg}{A} = 97339\,\mathrm{Pa}</tex>:</p>
<tex display>\gamma = \frac{4\pi^{2} \cdot 0.01648 \cdot 0.01012}{97339 \cdot (1.998 \cdot 10^{-4})^{2} \cdot 1.162^{2}} = 1.38</tex>
<h2>5 Uncertainty analysis</h2>
<p>Uncertainties were propagated with the Gaussian formula for uncorrelated inputs,</p>
<tex display>u(f) = \sqrt{\sum_{j} \left(\frac{\partial f}{\partial x_j}\right)^{2} u(x_j)^{2}}</tex>
<p>For the product-quotient form of <tex>\gamma</tex> this reduces to relative uncertainties:</p>
<tex display>\frac{u(\gamma)}{\gamma} = \sqrt{\left(\frac{u(m)}{m}\right)^{2} + \left(\frac{u(V)}{V}\right)^{2} + \left(\frac{u(p)}{p}\right)^{2} + \left(4\frac{u(d)}{d}\right)^{2} + \left(2\frac{u(T)}{T}\right)^{2}}</tex>
<p>The dominant contribution to <tex>u(c_{\mathrm{Al}})</tex> is the calorimeter constant <tex>C_{K}</tex>
(about 70 % of the variance), followed by the temperature difference <tex>T_{\mathrm{Al}} - T_{m}</tex>. For
<tex>\gamma</tex> the systematic error from friction of the ball dominates, which damps the oscillation and
lengthens the period; a damping-corrected period <tex>T_{0} = T \sqrt{1 - \left(\frac{\delta}{\omega}\right)^{2}}</tex>
changes <tex>\gamma</tex> by less than 0.3 %.</p>
<table class="grid">
<tr><th>Quantity</th><th>Result</th><th>Literature</th><th>Deviation</th></tr>
<tr><td>c_Al</td><td>(905 ± 21) J/(kg K)</td><td>897 J/(kg K)</td><td>0.4 σ</td></tr>
<tr><td>γ (air)</td><td>1.38 ± 0.04</td><td>1.40</td><td>0.5 σ</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>6 Discussion and conclusion</h2>
<p>Both results agree with the literature within one standard uncertainty. Without the heat-loss correction the
specific heat capacity would have come out about 4 % too low, which shows that the correction is essential for
a Dewar calorimeter with an open stirrer opening. The value of <tex>\gamma</tex> confirms that air behaves as a
diatomic ideal gas with <tex>f = 5</tex> degrees of freedom, since <tex>\gamma = \frac{f + 2}{f}</tex>, and that
the Dulong-Petit value <tex>c = \frac{3R}{M} = 924\,\mathrm{J\,kg^{-1}\,K^{-1}}</tex> slightly overestimates
aluminium at room temperature, as expected from the Debye model.</p>
<p>Possible improvements: a lid without stirrer opening, measuring <tex>C_{K}</tex> in a separate run on the
same day, and recording the ball position with the light barrier instead of counting periods by hand.</p>
<h2>Declaration</h2>
<p>We confirm that we performed the measurements ourselves and wrote this report independently. Work split:
Noah Kessler (calorimetry, analysis 4.1-4.2), Aisha Bensaid (Rüchardt, uncertainty analysis).</p>
<div class="as-image signature">Accepted 22.04.2026, 5.5 / 6 - F. Gisler, florian.gisler@aare-uas.example, ext. 062 555 71 30</div>
`,
    },
  ],
  values: [
    { text: 'KESSLER', category: 'PERSON' },
    { text: 'BENSAID', category: 'PERSON' },
    { text: 'N. Kessler', category: 'PERSON' },
    { text: 'A. Bensaid', category: 'PERSON' },
    { text: 'Noah Kessler', category: 'PERSON' },
    { text: 'Aisha Bensaid', category: 'PERSON' },
    { text: '24-301-882', category: 'ID' },
    { text: '24-305-117', category: 'ID' },
    { text: 'noah.kessler@stud.aare-uas.example', category: 'EMAIL' },
    { text: 'aisha.bensaid@stud.aare-uas.example', category: 'EMAIL' },
    { text: 'nkessler', category: 'USERNAME' },
    { text: 'Florian Gisler', category: 'PERSON' },
    { text: 'Dr. Gisler', category: 'PERSON' },
    { text: 'F. Gisler', category: 'PERSON' },
    { text: 'florian.gisler@aare-uas.example', category: 'EMAIL' },
    { text: '062 555 71 30', category: 'PHONE' },
    { text: 'room C 2.14', category: 'ADDRESS' },
    { text: 'phlab-c214-03', category: 'HOST' },
    { text: '192.168.40.23', category: 'IP' },
    { text: 'SN 18-22671-B', category: 'ID' },
    { text: '18-22671-B', category: 'ID' },
    { text: 'SN TK-48213-B', category: 'ID' },
    { text: 'SN DL-2207-0193', category: 'ID' },
    { text: 'DL-2207-0193', category: 'ID' },
    { text: 'SN BW-77310-46', category: 'ID' },
    { text: 'SN LB-5512-0087', category: 'ID' },
    { text: 'INV-PH-04471', category: 'ID' },
    { text: 'INV-PH-03920', category: 'ID' },
    { text: 'INV-PH-01186', category: 'ID' },
    { text: 'Aare University of Applied Sciences', category: 'COMPANY' },
    { text: 'AARE UNIVERSITY OF APPLIED SCIENCES', category: 'COMPANY' },
    { text: 'Bahnhofstrasse 102', category: 'ADDRESS' },
    { text: '5000 Aarau', category: 'ADDRESS' },
  ],
  keep: ['method of mixtures', 'Rüchardt', 'Newton\'s law of cooling', 'adiabatic index', 'Dewar calorimeter',
    'Dulong-Petit', 'Debye model', 'Pt100, 4-wire', 'Type K'],
};
