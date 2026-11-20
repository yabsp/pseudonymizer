const YEARS = [2026, 2027, 2028, 2029, 2030, 2031];
const REVENUE_GROWTH = [0, 0.084, 0.078, 0.069, 0.058, 0.045];
const EBITDA_MARGIN = [0.162, 0.168, 0.175, 0.181, 0.186, 0.188];
const WACC = 0.0815;

const fmt = (n) => (n < 0 ? '-' : '') + String(Math.round(Math.abs(n) * 10) / 10)
  .replace(/^(\d+)(\.\d)?$/, (m, int, dec) => int.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + (dec ?? '.0'));

const projection = [];
let revenue = 148.6;
for (let i = 0; i < YEARS.length; i++) {
  revenue = i === 0 ? revenue : revenue * (1 + REVENUE_GROWTH[i]);
  const ebitda = revenue * EBITDA_MARGIN[i];
  const depreciation = revenue * 0.041;
  const ebit = ebitda - depreciation;
  const taxes = ebit * 0.148;
  const capex = revenue * (0.052 - i * 0.002);
  const nwc = revenue * 0.006;
  const fcf = ebit - taxes + depreciation - capex - nwc;
  const discount = 1 / (1 + WACC) ** (i + 0.5);
  projection.push({ year: YEARS[i], revenue, ebitda, depreciation, ebit, taxes, capex, nwc, fcf, discount, pv: fcf * discount });
}

const projectionRows = [
  ['Revenue', 'revenue'], ['EBITDA', 'ebitda'], ['Depreciation and amortisation', 'depreciation'], ['EBIT', 'ebit'],
  ['Taxes on EBIT (14.8 %)', 'taxes'], ['Capital expenditure', 'capex'], ['Change in net working capital', 'nwc'],
  ['Unlevered free cash flow', 'fcf'], ['Discount factor (mid-year)', 'discount'], ['Present value of FCF', 'pv'],
].map(([label, key]) => `<tr><td>${label}</td>${projection.map((p) => `<td class="num">${key === 'discount' ? p[key].toFixed(4) : fmt(p[key])}</td>`).join('')}</tr>`).join('\n');

const SENSITIVITY_WACC = [0.0765, 0.079, 0.0815, 0.084, 0.0865];
const SENSITIVITY_G = [0.01, 0.015, 0.02];
const lastFcf = projection[projection.length - 1].fcf;
const sumPv = projection.reduce((s, p) => s + p.pv, 0);
const sensitivityRows = SENSITIVITY_WACC.map((w) => `<tr><th>${(w * 100).toFixed(2)} %</th>${SENSITIVITY_G.map((g) => {
  const tv = (lastFcf * (1 + g)) / (w - g) / (1 + w) ** 5.5;
  const pvs = projection.reduce((s, p, i) => s + p.fcf / (1 + w) ** (i + 0.5), 0);
  return `<td class="num">${fmt(pvs + tv - 38.4 + 12.7)}</td>`;
}).join('')}</tr>`).join('\n');

const terminalValue = (lastFcf * 1.015) / (WACC - 0.015);
const pvTerminal = terminalValue / (1 + WACC) ** 5.5;
const enterpriseValue = sumPv + pvTerminal;

export default {
  id: 'finance-en-01',
  domain: 'finance',
  language: 'en',
  title: 'Valuation Report Project Edelweiss',
  header: 'STRICTLY CONFIDENTIAL | Project Edelweiss - Valuation of HELVETRONIC SENSORS AG | Prepared by Rhein Valley Corporate Finance AG',
  footer: 'Draft for discussion with the Board of Directors - not for distribution - Ref. RVCF-2026-118',
  parts: [
    {
      html: String.raw`
<h1>Project Edelweiss: Independent Valuation of Helvetronic Sensors AG</h1>
<table class="facts">
<tr><th>Target</th><td>Helvetronic Sensors AG, Grabenstrasse 42, 6340 Baar, UID CHE-402.719.385</td></tr>
<tr><th>Mandated by</th><td>Board of Directors of Helvetronic Sensors AG, represented by its chair Dr. Andrea Kessler-Brunner</td></tr>
<tr><th>Prepared by</th><td>Rhein Valley Corporate Finance AG, Talacker 12, 8001 Zürich</td></tr>
<tr><th>Engagement team</th><td>Oliver Hartmann (partner), Nadia Rochat (director), Kevin Imhof (analyst)</td></tr>
<tr><th>Valuation date</th><td>30 June 2026</td></tr>
<tr><th>Report date</th><td>14 August 2026</td></tr>
</table>
<h2>1. Purpose and scope</h2>
<p>The Board of Directors of Helvetronic Sensors AG ("Helvetronic" or the "Company") has received a
non-binding indicative offer from Northbridge Industrial Partners LP for 100 % of the share capital. In
preparation for the negotiations, the Board has asked us to determine the fair market value of the equity
on a stand-alone basis as at 30 June 2026. This report is based on the business plan 2026-2031 approved by
the Board on 2 July 2026, the audited financial statements 2023-2025 (Swiss GAAP FER) and interviews with
management.</p>
<p>The valuation follows the principles of IDW S 1 and the International Valuation Standards (IVS 200).
We applied a discounted cash flow (DCF) analysis as the primary method and a trading multiples analysis as a
plausibility check. We have not audited the information provided and do not express an audit opinion.</p>
<h2>2. Executive summary</h2>
<p>Based on our analysis, the fair market value of 100 % of the equity of Helvetronic lies in a range of
CHF 268 million to CHF 312 million, with a point estimate of CHF ${fmt(enterpriseValue - 38.4 + 12.7)} million.
This corresponds to an implied EV/EBITDA multiple of ${(enterpriseValue / projection[0].ebitda).toFixed(1)}x on
2026 budget EBITDA. The indicative offer of CHF 255 million is below our range.</p>
<table class="grid">
<tr><th>Item</th><th class="num">CHF m</th></tr>
<tr><td>Sum of present values of free cash flows 2026-2031</td><td class="num">${fmt(sumPv)}</td></tr>
<tr><td>Present value of terminal value</td><td class="num">${fmt(pvTerminal)}</td></tr>
<tr><th>Enterprise value</th><th class="num">${fmt(enterpriseValue)}</th></tr>
<tr><td>Net financial debt (incl. leases IFRS-16-like)</td><td class="num">-38.4</td></tr>
<tr><td>Non-operating assets (land plot Steinhausen)</td><td class="num">12.7</td></tr>
<tr><th>Equity value</th><th class="num">${fmt(enterpriseValue - 38.4 + 12.7)}</th></tr>
</table>
<h2>3. The Company</h2>
<p>Helvetronic, founded in 1994 by Werner Brunner, develops and manufactures MEMS pressure and flow sensors for
medical devices (infusion pumps, ventilators) and industrial automation. The Company employs 412 FTE at its
sites in Baar and Brno (Czech Republic) and generated revenue of CHF 137.1 million in 2025. Shareholders are
the Brunner family (61.5 %, held through Brunner Familienholding AG), CEO Matthias Odermatt (8.0 %), the
management pool (4.5 %) and Alpine Growth Fund II (26.0 %).</p>
`,
    },
    {
      html: String.raw`
<h2>4. Management</h2>
<table class="grid">
<tr><th>Name</th><th>Function</th><th>Since</th><th>Contact</th></tr>
<tr><td>Matthias Odermatt</td><td>Chief Executive Officer</td><td>2017</td><td>matthias.odermatt@helvetronic.example</td></tr>
<tr><td>Dr. Fabienne Chevalley</td><td>Chief Technology Officer</td><td>2019</td><td>fabienne.chevalley@helvetronic.example</td></tr>
<tr><td>Stefan Aregger</td><td>Chief Financial Officer</td><td>2021</td><td>stefan.aregger@helvetronic.example, +41 41 555 72 10</td></tr>
<tr><td>Petra Novotná</td><td>Managing Director Brno plant</td><td>2015</td><td>petra.novotna@helvetronic.example</td></tr>
<tr><td>Marco Lanfranchi</td><td>Head of Sales Medical</td><td>2022</td><td>marco.lanfranchi@helvetronic.example</td></tr>
</table>
<p>In our interviews on 9 and 10 July 2026, Mr Odermatt and Mr Aregger explained the key assumptions of the
business plan. Management expects growth to be driven by the new ventilator sensor platform "AirSense 4",
for which a supply agreement with a European medical device manufacturer (contract MDA-2026-031) was signed
in May 2026. Dr. Chevalley confirmed that the ISO 13485 recertification of the Baar site is scheduled for
Q1 2027.</p>
<h2>5. Business plan</h2>
<p>Revenue is planned to grow at a compound annual growth rate (CAGR) of 6.7 % from 2026 to 2031, while the
EBITDA margin expands from 16.2 % to 18.8 % due to the scale effects of the Brno plant. We consider the plan
ambitious but achievable; the order backlog at 30 June 2026 covers 71 % of the 2026 budget.</p>
<p>Unlevered free cash flow is defined as:</p>
<tex display>\mathrm{FCF}_t = \mathrm{EBIT}_t \cdot (1 - \tau) + \mathrm{DA}_t - \mathrm{CAPEX}_t - \Delta \mathrm{NWC}_t</tex>
<p>where <tex>\tau = 14.8\,\%</tex> is the combined Swiss tax rate of the canton of Zug including the federal tax.</p>
<table class="grid">
<tr><th>CHF m</th>${YEARS.map((y) => `<th class="num">${y}${y === 2026 ? ' B' : ' P'}</th>`).join('')}</tr>
${projectionRows}
</table>
<p class="small">B = budget, P = plan. Discounting assumes cash flows arise in the middle of each year.</p>
`,
    },
    {
      html: String.raw`
<h2>6. Cost of capital</h2>
<p>Cash flows are discounted at the weighted average cost of capital (WACC) after taxes:</p>
<tex display>\mathrm{WACC} = \frac{E}{E + D} \cdot r_E + \frac{D}{E + D} \cdot r_D \cdot (1 - \tau)</tex>
<p>The cost of equity is derived with the capital asset pricing model (CAPM), extended by a size premium
<tex>s</tex>:</p>
<tex display>r_E = r_f + \beta_L \cdot \mathrm{MRP} + s</tex>
<p>The levered beta is derived from the unlevered beta of the peer group (Harris-Pringle without tax shield
adjustment, Hamada for the sensitivity):</p>
<tex display>\beta_L = \beta_U \cdot \left(1 + (1 - \tau) \cdot \frac{D}{E}\right)</tex>
<table class="grid">
<tr><th>Parameter</th><th>Value</th><th>Source</th></tr>
<tr><td>Risk-free rate <tex>r_f</tex></td><td>0.80 %</td><td>Yield of 10-year Swiss Confederation bonds, 3-month average</td></tr>
<tr><td>Market risk premium MRP</td><td>5.50 %</td><td>Long-term Swiss equity premium</td></tr>
<tr><td>Unlevered beta <tex>\beta_U</tex></td><td>1.05</td><td>Median of 9 listed sensor and medtech component peers, 5-year monthly</td></tr>
<tr><td>Target debt to equity <tex>D/E</tex></td><td>15 %</td><td>Peer group median</td></tr>
<tr><td>Levered beta <tex>\beta_L</tex></td><td>1.18</td><td>Formula above</td></tr>
<tr><td>Size premium <tex>s</tex></td><td>1.75 %</td><td>Small-cap premium for enterprise values below CHF 500 m</td></tr>
<tr><td>Cost of equity <tex>r_E</tex></td><td>9.04 %</td><td></td></tr>
<tr><td>Pre-tax cost of debt <tex>r_D</tex></td><td>3.10 %</td><td>SARON + 2.25 % credit spread (term loan with Zuger Gewerbebank AG)</td></tr>
<tr><th>WACC</th><th>8.15 %</th><th></th></tr>
</table>
<p>With <tex>E/(E+D) = 0.870</tex> and <tex>D/(E+D) = 0.130</tex> we obtain:</p>
<tex display>\mathrm{WACC} = 0.870 \cdot 9.04\,\% + 0.130 \cdot 3.10\,\% \cdot (1 - 0.148) = 8.15\,\%</tex>
<h2>7. Enterprise value</h2>
<p>The enterprise value is the sum of the discounted free cash flows during the detailed planning period and the
discounted terminal value:</p>
<tex display>\mathrm{EV} = \sum_{t=1}^{T} \frac{\mathrm{FCF}_t}{(1 + \mathrm{WACC})^{t - 0.5}} + \frac{\mathrm{TV}_T}{(1 + \mathrm{WACC})^{T - 0.5}}</tex>
<p>The terminal value is calculated with the Gordon growth model, using a long-term growth rate of
<tex>g = 1.5\,\%</tex>, in line with expected Swiss inflation plus a modest real growth:</p>
<tex display>\mathrm{TV}_T = \frac{\mathrm{FCF}_{T} \cdot (1 + g)}{\mathrm{WACC} - g} = \frac{${fmt(lastFcf)} \cdot 1.015}{0.0815 - 0.015} = ${fmt(terminalValue)}</tex>
<p>The terminal value accounts for ${Math.round((pvTerminal / enterpriseValue) * 100)} % of the enterprise value,
which is typical for a growing industrial technology company. The implied exit multiple is
<tex>\mathrm{TV}_T / \mathrm{EBITDA}_T = ${(terminalValue / projection[5].ebitda).toFixed(1)}</tex>.</p>
`,
    },
    {
      html: String.raw`
<h2>8. Sensitivity analysis</h2>
<p>The table shows the equity value (CHF m) depending on the WACC and the long-term growth rate:</p>
<table class="grid">
<tr><th>WACC / g</th>${SENSITIVITY_G.map((g) => `<th class="num">${(g * 100).toFixed(1)} %</th>`).join('')}</tr>
${sensitivityRows}
</table>
<p>A change of the EBITDA margin in the terminal year by one percentage point changes the equity value by
approximately CHF 14 million. The continuous-compounding equivalent of the discount rate is
<tex>\ln(1 + \mathrm{WACC}) = 7.84\,\%</tex>.</p>
<h2>9. Plausibility check: trading multiples</h2>
<table class="grid">
<tr><th>Peer group (listed)</th><th class="num">EV/EBITDA 2026</th><th class="num">EV/EBIT 2026</th><th class="num">EBITDA margin</th></tr>
<tr><td>Sensor component manufacturers (5)</td><td class="num">12.4x</td><td class="num">17.1x</td><td class="num">19.2 %</td></tr>
<tr><td>Medtech suppliers (4)</td><td class="num">13.8x</td><td class="num">19.6x</td><td class="num">21.5 %</td></tr>
<tr><td>Median (9)</td><td class="num">12.9x</td><td class="num">18.0x</td><td class="num">20.1 %</td></tr>
</table>
<p>Applying a discount of 10 % for size and lower margin to the median EV/EBITDA multiple yields:</p>
<tex display>\mathrm{EV}_{\mathrm{multiple}} = 0.9 \cdot 12.9 \cdot \mathrm{EBITDA}_{2026} = 0.9 \cdot 12.9 \cdot ${fmt(projection[0].ebitda)} = ${fmt(0.9 * 12.9 * projection[0].ebitda)}</tex>
<p>The result supports the DCF value range. A transaction multiples analysis (precedent transactions
2021-2025 in the sensor sector, median 13.5x EBITDA) indicates a control premium which the indicative offer of
Northbridge Industrial Partners LP does not reflect.</p>
<h2>10. Equity bridge and value per share</h2>
<p>The share capital consists of 2'400'000 registered shares with a nominal value of CHF 1.00. The value per
share is:</p>
<tex display>V_{\mathrm{share}} = \frac{\mathrm{EV} - \mathrm{ND} + \mathrm{NOA}}{N} = \frac{${fmt(enterpriseValue)} - 38.4 + 12.7}{2.4} = ${fmt((enterpriseValue - 38.4 + 12.7) / 2.4)}</tex>
<p>i.e. about CHF ${Math.round(((enterpriseValue - 38.4 + 12.7) / 2.4))} per share. Options granted under the management
participation plan 2022 (180'000 options, strike CHF 64) are in the money; the diluted value per share is
lower by about 3 %.</p>
`,
    },
    {
      html: String.raw`
<h2>11. Key risks</h2>
<ul>
<li>Customer concentration: the three largest customers account for 47 % of revenue; the AirSense 4 contract
contains a termination right for convenience after 24 months.</li>
<li>Regulatory: the transition to the EU Medical Device Regulation (MDR) increases documentation costs for
the customers and may delay product launches.</li>
<li>Currency: 68 % of revenue is invoiced in EUR, while 55 % of costs arise in CHF. A 5 % appreciation of the
CHF reduces EBITDA by about CHF 3.1 million.</li>
<li>Key persons: the technology roadmap depends on Dr. Chevalley and a team of eight engineers; retention
agreements expire in March 2027.</li>
</ul>
<h2>12. Investor contacts and process</h2>
<p>The Board has authorised us to contact a limited number of strategic and financial investors under
non-disclosure agreements. Contacts so far:</p>
<table class="grid">
<tr><th>Investor</th><th>Contact person</th><th>E-mail / phone</th><th>Status</th></tr>
<tr><td>Northbridge Industrial Partners LP</td><td>James O'Connell, Managing Partner</td><td>j.oconnell@northbridge-ip.example, +44 20 7946 0518</td><td>Indicative offer CHF 255 m</td></tr>
<tr><td>Sensora Holding GmbH</td><td>Dr. Katrin Vogelsang</td><td>k.vogelsang@sensora.example, +49 89 5550 3341</td><td>NDA signed 21.07.2026</td></tr>
<tr><td>Lakeside Capital Partners AG</td><td>Philippe Dubuis</td><td>philippe.dubuis@lakeside-capital.example, 022 555 81 26</td><td>Management presentation 03.09.2026</td></tr>
<tr><td>Kanto Precision Co., Ltd.</td><td>Hiroshi Tanaka</td><td>h.tanaka@kanto-precision.example</td><td>Declined 05.08.2026</td></tr>
</table>
<p>The virtual data room (project code EDELWEISS-VDR, host vdr.rvcf.example) was opened on 1 August 2026.
Access requests are handled by Kevin Imhof (kevin.imhof@rvcf.example, 044 555 19 87).</p>
<h2>13. Conclusion</h2>
<p>Based on the information available to us and the assumptions described, we determine the fair market value
of 100 % of the equity of Helvetronic Sensors AG as at 30 June 2026 in a range of CHF 268 million to CHF 312
million. We recommend that the Board does not accept the indicative offer in its current form.</p>
<p>Zürich, 14 August 2026</p>
<p>Rhein Valley Corporate Finance AG</p>
<div class="as-image signature">Oliver Hartmann, Partner &nbsp;&nbsp;&nbsp;&nbsp; Nadia Rochat, Director</div>
`,
    },
    {
      html: String.raw`
<h1>Appendix: Information basis and distribution</h1>
<h2>A. Documents received</h2>
<table class="grid">
<tr><th>No.</th><th>Document</th><th>Received from</th><th>Date</th></tr>
<tr><td>1</td><td>Audited financial statements 2023-2025 (auditor: Treuhand Zugerland AG)</td><td>Stefan Aregger</td><td>18.06.2026</td></tr>
<tr><td>2</td><td>Business plan 2026-2031, version 3.2</td><td>Stefan Aregger</td><td>03.07.2026</td></tr>
<tr><td>3</td><td>Order backlog report as at 30.06.2026</td><td>Marco Lanfranchi</td><td>08.07.2026</td></tr>
<tr><td>4</td><td>Supply agreement MDA-2026-031 (redacted)</td><td>Matthias Odermatt</td><td>09.07.2026</td></tr>
<tr><td>5</td><td>Shareholders' agreement of 12.03.2021</td><td>Dr. Andrea Kessler-Brunner</td><td>10.07.2026</td></tr>
<tr><td>6</td><td>Capex plan Brno plant 2026-2028</td><td>Petra Novotná</td><td>15.07.2026</td></tr>
<tr><td>7</td><td>Term loan agreement, Zuger Gewerbebank AG, facility no. ZG-TL-77120</td><td>Stefan Aregger</td><td>15.07.2026</td></tr>
<tr><td>8</td><td>Management participation plan 2022</td><td>Stefan Aregger</td><td>22.07.2026</td></tr>
</table>
<h2>B. Representation letter</h2>
<p>Management has confirmed in a representation letter dated 12 August 2026, signed by Matthias Odermatt and
Stefan Aregger, that all information relevant to the valuation has been provided and that no events after the
valuation date are known which would materially affect the value.</p>
<h2>C. Distribution list</h2>
<ul>
<li>Dr. Andrea Kessler-Brunner, Chair of the Board, andrea.kessler@brunner-holding.example</li>
<li>Urs Gisler, Member of the Board (Alpine Growth Fund II), u.gisler@alpinegrowth.example</li>
<li>Matthias Odermatt, CEO (excluding section 12)</li>
<li>Me Claire Fournier, legal counsel, Étude Fournier &amp; Rey, claire.fournier@fournier-rey.example</li>
</ul>
<h2>D. Independence</h2>
<p>Rhein Valley Corporate Finance AG has no financial interest in Helvetronic Sensors AG or any of the
investors named. Our fee is fixed and independent of the valuation result or the outcome of the transaction.
Oliver Hartmann (oliver.hartmann@rvcf.example, 044 555 19 80) is the responsible partner.</p>
`,
    },
  ],
  values: [
    { text: 'HELVETRONIC SENSORS AG', category: 'COMPANY' },
    { text: 'Helvetronic Sensors AG', category: 'COMPANY' },
    { text: 'Helvetronic', category: 'COMPANY' },
    { text: 'Rhein Valley Corporate Finance AG', category: 'COMPANY' },
    { text: 'RVCF-2026-118', category: 'ID' },
    { text: 'Grabenstrasse 42', category: 'ADDRESS' },
    { text: '6340 Baar', category: 'ADDRESS' },
    { text: 'CHE-402.719.385', category: 'ID' },
    { text: 'Andrea Kessler-Brunner', category: 'PERSON' },
    { text: 'Talacker 12', category: 'ADDRESS' },
    { text: '8001 Zürich', category: 'ADDRESS' },
    { text: 'Oliver Hartmann', category: 'PERSON' },
    { text: 'Nadia Rochat', category: 'PERSON' },
    { text: 'Kevin Imhof', category: 'PERSON' },
    { text: 'Northbridge Industrial Partners LP', category: 'COMPANY' },
    { text: 'Werner Brunner', category: 'PERSON' },
    { text: 'Brunner', category: 'PERSON' },
    { text: 'Brunner Familienholding AG', category: 'COMPANY' },
    { text: 'Matthias Odermatt', category: 'PERSON' },
    { text: 'Mr Odermatt', category: 'PERSON' },
    { text: 'Alpine Growth Fund II', category: 'COMPANY' },
    { text: 'matthias.odermatt@helvetronic.example', category: 'EMAIL' },
    { text: 'Fabienne Chevalley', category: 'PERSON' },
    { text: 'Dr. Chevalley', category: 'PERSON' },
    { text: 'fabienne.chevalley@helvetronic.example', category: 'EMAIL' },
    { text: 'Stefan Aregger', category: 'PERSON' },
    { text: 'Mr Aregger', category: 'PERSON' },
    { text: 'stefan.aregger@helvetronic.example', category: 'EMAIL' },
    { text: '+41 41 555 72 10', category: 'PHONE' },
    { text: 'Petra Novotná', category: 'PERSON' },
    { text: 'petra.novotna@helvetronic.example', category: 'EMAIL' },
    { text: 'Marco Lanfranchi', category: 'PERSON' },
    { text: 'marco.lanfranchi@helvetronic.example', category: 'EMAIL' },
    { text: 'MDA-2026-031', category: 'ID' },
    { text: 'Zuger Gewerbebank AG', category: 'COMPANY' },
    { text: "James O'Connell", category: 'PERSON' },
    { text: 'j.oconnell@northbridge-ip.example', category: 'EMAIL' },
    { text: '+44 20 7946 0518', category: 'PHONE' },
    { text: 'Sensora Holding GmbH', category: 'COMPANY' },
    { text: 'Katrin Vogelsang', category: 'PERSON' },
    { text: 'k.vogelsang@sensora.example', category: 'EMAIL' },
    { text: '+49 89 5550 3341', category: 'PHONE' },
    { text: 'Lakeside Capital Partners AG', category: 'COMPANY' },
    { text: 'Philippe Dubuis', category: 'PERSON' },
    { text: 'philippe.dubuis@lakeside-capital.example', category: 'EMAIL' },
    { text: '022 555 81 26', category: 'PHONE' },
    { text: 'Kanto Precision Co., Ltd.', category: 'COMPANY' },
    { text: 'Hiroshi Tanaka', category: 'PERSON' },
    { text: 'h.tanaka@kanto-precision.example', category: 'EMAIL' },
    { text: 'EDELWEISS-VDR', category: 'ID' },
    { text: 'vdr.rvcf.example', category: 'HOST' },
    { text: 'kevin.imhof@rvcf.example', category: 'EMAIL' },
    { text: '044 555 19 87', category: 'PHONE' },
    { text: 'Treuhand Zugerland AG', category: 'COMPANY' },
    { text: 'ZG-TL-77120', category: 'ID' },
    { text: 'andrea.kessler@brunner-holding.example', category: 'EMAIL' },
    { text: 'Urs Gisler', category: 'PERSON' },
    { text: 'u.gisler@alpinegrowth.example', category: 'EMAIL' },
    { text: 'Claire Fournier', category: 'PERSON' },
    { text: 'Étude Fournier & Rey', category: 'COMPANY' },
    { text: 'claire.fournier@fournier-rey.example', category: 'EMAIL' },
    { text: 'oliver.hartmann@rvcf.example', category: 'EMAIL' },
    { text: '044 555 19 80', category: 'PHONE' },
  ],
  keep: ['weighted average cost of capital (WACC)', 'Gordon growth model', 'capital asset pricing model (CAPM)',
    'terminal value', 'Unlevered free cash flow', 'EV/EBITDA', 'Swiss GAAP FER', 'IDW S 1', 'size premium',
    'Medical Device Regulation (MDR)', 'ISO 13485'],
};
