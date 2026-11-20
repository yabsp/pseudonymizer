export default {
  id: 'law-en-01',
  domain: 'law',
  language: 'en',
  title: 'Legal Due Diligence Memorandum',
  header: 'PRIVILEGED AND CONFIDENTIAL | PROJECT EDELWEISS | TARGET: ALPENTECH SENSORIK AG',
  footer: 'Legal due diligence memorandum - Alpentech Sensorik AG - draft for discussion',
  parts: [
    {
      html: String.raw`
<p class="small">Hürlimann Graf Partners Ltd, Attorneys at Law, Bleicherweg 18, 8002 Zurich, www.hgp-law.example</p>
<h1>Memorandum</h1>
<table class="facts">
<tr><th>To</th><td>Ms Hannah Whitfield, General Counsel, Northbridge Instruments plc, 40 Harbour Road, Bristol BS1 6QA, United Kingdom, h.whitfield@northbridge-instr.example</td></tr>
<tr><th>Cc</th><td>Mr Oliver Brandt, Head of M&amp;A, o.brandt@northbridge-instr.example, +44 20 7946 0581</td></tr>
<tr><th>From</th><td>Dr. Andrea Hürlimann and Severin Imhof, Hürlimann Graf Partners Ltd, a.huerlimann@hgp-law.example, +41 44 555 62 10</td></tr>
<tr><th>Date</th><td>12 October 2026</td></tr>
<tr><th>Re</th><td>Project Edelweiss - legal due diligence of Alpentech Sensorik AG, Winterthur (CHE-402.117.865)</td></tr>
</table>
<h2>1. Scope and limitations</h2>
<p>You asked us to carry out a limited-scope legal due diligence of Alpentech Sensorik AG (the "Company"), a
company limited by shares (Aktiengesellschaft) under Swiss law with its registered office at Technoparkstrasse 5,
8406 Winterthur, in view of the proposed acquisition of 100 % of its shares by Northbridge Instruments plc (the
"Purchaser") from its current shareholders (the "Sellers").</p>
<p>Our review is based exclusively on the documents uploaded to the virtual data room operated by the Sellers'
counsel up to 2 October 2026 (index version 4) and on the answers to our Q&amp;A list provided by the Company's CFO,
Mr Reto Hasler, in a call on 6 October 2026. We have not verified the accuracy of factual information and have not
reviewed tax, accounting, IT security or environmental matters, which are covered by the separate reports of other
advisors. Red flags are marked <b>[RED]</b>, issues to be addressed in the share purchase agreement (SPA) are marked
<b>[SPA]</b>.</p>
<h2>2. Executive summary</h2>
<ul>
<li><b>[RED]</b> The shareholders' agreement of 3 May 2019 grants a right of first refusal and a tag-along right to
all shareholders; the waiver of Ms Ursula Frei-Nägeli (holding 18.0 %) has not yet been obtained.</li>
<li><b>[RED]</b> The key customer contract with Rheintal Mobility GmbH (approx. 31 % of 2025 revenue) contains a
change-of-control clause allowing termination with 60 days' notice.</li>
<li><b>[SPA]</b> Two employee share option plan grants were made without the required board resolution; we recommend a
specific indemnity.</li>
<li><b>[SPA]</b> A pending labour court claim by a former sales manager (wrongful dismissal, Art. 336 CO) with an
amount in dispute of CHF 96'000.</li>
<li>No indication of pending or threatened litigation exceeding CHF 250'000, of regulatory investigations or of
infringement claims regarding the Company's patents.</li>
</ul>
<h2>3. Corporate matters</h2>
<p>The Company was incorporated on 14 February 2011 and is registered in the commercial register of the Canton of
Zurich. Its share capital amounts to CHF 1'250'000, divided into 1'250'000 registered shares with a nominal value of
CHF 1.00 each, fully paid in. The articles of association (last amended on 22 June 2023) contain a transfer
restriction (Vinkulierung) under Art. 685b CO, under which the board may refuse a transfer for important reasons
stated in the articles. There is no capital band (Art. 653s CO) and no conditional capital.</p>
<p>The board of directors consists of Mr Martin Egli (chairman), Ms Ursula Frei-Nägeli and Mr Jonas Wyss. Mr Egli
and Mr Hasler have joint signing authority by two; Ms Frei-Nägeli has individual signing authority, which in our
view should be revoked at closing. The auditors are a mid-sized audit firm with a limited audit (eingeschränkte
Revision) opting-out not exercised.</p>
`,
    },
    {
      html: String.raw`
<h2>4. Share register and shareholders</h2>
<p>According to the share register as at 30 September 2026, which we compared with the register of beneficial
owners under Art. 697j CO, the shareholders are:</p>
<table class="grid">
<tr><th>Shareholder</th><th>Address</th><th>Shares</th><th>Percentage</th><th>Entry</th></tr>
<tr><td>Martin Egli</td><td>Rosenbergstrasse 41, 8400 Winterthur</td><td>437'500</td><td>35.0 %</td><td>14.02.2011</td></tr>
<tr><td>Ursula Frei-Nägeli</td><td>Seeblickweg 2, 8708 Männedorf</td><td>225'000</td><td>18.0 %</td><td>14.02.2011</td></tr>
<tr><td>Jonas Wyss</td><td>Schützenmattstrasse 17, 4051 Basel</td><td>187'500</td><td>15.0 %</td><td>01.07.2015</td></tr>
<tr><td>Egli Family Holding AG</td><td>Rosenbergstrasse 41, 8400 Winterthur</td><td>150'000</td><td>12.0 %</td><td>03.05.2019</td></tr>
<tr><td>Venture Oberland Fund II LP</td><td>Bahnhofstrasse 9, 6300 Zug</td><td>200'000</td><td>16.0 %</td><td>03.05.2019</td></tr>
<tr><td>Reto Hasler</td><td>Lindenweg 6, 8304 Wallisellen</td><td>31'250</td><td>2.5 %</td><td>01.01.2022</td></tr>
<tr><td>Dr. Mei Lin Zhao</td><td>Weinbergstrasse 88, 8006 Zurich</td><td>18'750</td><td>1.5 %</td><td>01.01.2022</td></tr>
<tr><td>Total</td><td></td><td>1'250'000</td><td>100.0 %</td><td></td></tr>
</table>
<p>The transfers of 1 January 2022 to Mr Hasler and Dr. Zhao were made under the employee participation plan at a
price per share determined by the formula valuation in the plan rules:</p>
<tex display>P = \frac{1}{2}\left(\frac{E_{t-1} + E_{t-2}}{2} \cdot m\right) + \frac{1}{2}\,\frac{NAV_{t-1}}{N}</tex>
<p>where <tex>E</tex> is the audited EBITDA, <tex>m = 6</tex> the agreed multiple, <tex>NAV</tex> the net asset
value and <tex>N</tex> the number of shares. The board resolution approving these transfers is missing from the
data room (see section 2).</p>
<p>The shareholders' agreement (SHA) of 3 May 2019 between all shareholders except Mr Hasler and Dr. Zhao, who
acceded on 1 January 2022, provides for a right of first refusal (clause 7), a tag-along right (clause 9) and a
drag-along right if holders of at least 75 % of the shares accept an offer (clause 10). As the Sellers representing
82.0 % support the transaction, the drag-along right could be exercised against Ms Frei-Nägeli, but the
procedure requires a 30-day notice period. We recommend obtaining a written waiver instead.</p>
<h2>5. Material contracts</h2>
<p>We reviewed 23 contracts marked as material. The following require attention:</p>
<table class="grid">
<tr><th>Counterparty</th><th>Contract</th><th>Issue</th><th>Recommendation</th></tr>
<tr><td>Rheintal Mobility GmbH</td><td>Framework supply agreement no. RM-2021-044</td><td>Change of control, termination right</td><td>Consent before signing [RED]</td></tr>
<tr><td>Präzisionsguss Thurgau AG</td><td>Exclusive supply of sensor housings</td><td>Exclusivity until 2029, minimum purchase</td><td>Disclose, no action</td></tr>
<tr><td>Zürcher Kantonalbank</td><td>Credit facility CHF 4 million, account 1100-4478.221</td><td>Change of control is an event of default</td><td>Refinance or waiver [SPA]</td></tr>
<tr><td>Swiss Federal Institute of Technology (ETH Zurich)</td><td>Licence of patent family WO 2018/114 577</td><td>Royalty 3.5 %, non-assignable</td><td>Confirm licence continues</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>6. Employment</h2>
<p>The Company employs 64 persons (58.4 full-time equivalents). Employment contracts follow a template governed by
Swiss law with notice periods of three months after the probationary period and a post-contractual non-compete of
12 months for sales staff (Art. 340 ff. CO). The non-compete covenants are limited to Switzerland and Germany and
appear enforceable, although a court may reduce them (Art. 340a para. 2 CO).</p>
<p>A former sales manager, Mr Daniel Kocher, Burgstrasse 12, 8610 Uster, was dismissed on 28 February 2026. He filed
a claim with the Labour Court of Winterthur (case no. AN260071) for a compensation of six months' salary for abusive
termination (Art. 336a CO) and an overtime payment. According to the Company's counsel, Ms Petra Schnyder of
Schnyder Arbeitsrecht GmbH (p.schnyder@schnyder-ar.example), the risk is moderate; the expected settlement range
is CHF 25'000 to 40'000.</p>
<p>The CEO, Mr Martin Egli, has an employment agreement with a notice period of 12 months and a change-of-control
bonus of one annual base salary. This bonus is payable if his employment is terminated within 18 months after
closing. The Purchaser should take this into account in the purchase price.</p>
<h2>7. Intellectual property</h2>
<p>The Company owns 11 granted patents and 4 pending applications (Switzerland, EPO, US) relating to MEMS pressure
sensors. All inventors are employees; the assignment of inventions made in the course of employment follows from
Art. 332 CO. For the two inventors who are external consultants, Dr. Felix Amstutz and Ms Carla Montanari, we found
signed assignment agreements dated 9 March 2020. The trademark ALPENTECH is registered in Switzerland and the EU.</p>
<h2>8. Data protection</h2>
<p>The Company processes personal data of customer employees and of its own staff. A record of processing activities
under Art. 12 FADP exists. The data processing agreement with the cloud provider for the ERP system has not been
updated to the revised Swiss FADP (in force since 1 September 2023); this is a minor issue.</p>
<h2>9. Purchase price adjustment</h2>
<p>For the SPA we suggest a locked-box mechanism with a leakage covenant. Should the parties prefer completion
accounts, the adjustment would be:</p>
<tex display>\Delta P = (NWC_{close} - NWC_{target}) - (ND_{close} - ND_{target})</tex>
<p>with the target net working capital set at CHF 3.1 million. Leakage would be defined to include the change-of-control
bonus of Mr Egli and any payments to Egli Family Holding AG.</p>
<h2>10. Next steps</h2>
<ol>
<li>Request the waiver of Ms Frei-Nägeli under the SHA and the consent of Rheintal Mobility GmbH.</li>
<li>Obtain the missing board resolutions on the option grants of 1 January 2022.</li>
<li>Include specific indemnities for the Kocher claim and the option plan in the SPA.</li>
<li>Agree on the treatment of the credit facility with Zürcher Kantonalbank before signing.</li>
</ol>
<p>We remain at your disposal for any questions. Please contact Severin Imhof (s.imhof@hgp-law.example,
+41 44 555 62 14) for data room access issues.</p>
<p>Hürlimann Graf Partners Ltd<br>Dr. Andrea Hürlimann &nbsp;&nbsp; Severin Imhof</p>
`,
    },
  ],
  values: [
    { text: 'ALPENTECH SENSORIK AG', category: 'COMPANY' },
    { text: 'Alpentech Sensorik AG', category: 'COMPANY' },
    { text: 'ALPENTECH', category: 'COMPANY' },
    { text: 'CHE-402.117.865', category: 'ID' },
    { text: 'Technoparkstrasse 5', category: 'ADDRESS' },
    { text: '8406 Winterthur', category: 'ADDRESS' },
    { text: 'Hürlimann Graf Partners Ltd', category: 'COMPANY' },
    { text: 'Bleicherweg 18', category: 'ADDRESS' },
    { text: '8002 Zurich', category: 'ADDRESS' },
    { text: 'www.hgp-law.example', category: 'URL' },
    { text: 'Hannah Whitfield', category: 'PERSON' },
    { text: 'Northbridge Instruments plc', category: 'COMPANY' },
    { text: '40 Harbour Road', category: 'ADDRESS' },
    { text: 'Bristol BS1 6QA', category: 'ADDRESS' },
    { text: 'h.whitfield@northbridge-instr.example', category: 'EMAIL' },
    { text: 'Oliver Brandt', category: 'PERSON' },
    { text: 'o.brandt@northbridge-instr.example', category: 'EMAIL' },
    { text: '+44 20 7946 0581', category: 'PHONE' },
    { text: 'Andrea Hürlimann', category: 'PERSON' },
    { text: 'Severin Imhof', category: 'PERSON' },
    { text: 'a.huerlimann@hgp-law.example', category: 'EMAIL' },
    { text: '+41 44 555 62 10', category: 'PHONE' },
    { text: 's.imhof@hgp-law.example', category: 'EMAIL' },
    { text: '+41 44 555 62 14', category: 'PHONE' },
    { text: 'Reto Hasler', category: 'PERSON' },
    { text: 'Mr Hasler', category: 'PERSON' },
    { text: 'Ursula Frei-Nägeli', category: 'PERSON' },
    { text: 'Ms Frei-Nägeli', category: 'PERSON' },
    { text: 'Martin Egli', category: 'PERSON' },
    { text: 'Mr Egli', category: 'PERSON' },
    { text: 'Jonas Wyss', category: 'PERSON' },
    { text: 'Rosenbergstrasse 41', category: 'ADDRESS' },
    { text: '8400 Winterthur', category: 'ADDRESS' },
    { text: 'Seeblickweg 2', category: 'ADDRESS' },
    { text: '8708 Männedorf', category: 'ADDRESS' },
    { text: 'Schützenmattstrasse 17', category: 'ADDRESS' },
    { text: '4051 Basel', category: 'ADDRESS' },
    { text: 'Egli Family Holding AG', category: 'COMPANY' },
    { text: 'Venture Oberland Fund II LP', category: 'COMPANY' },
    { text: 'Bahnhofstrasse 9', category: 'ADDRESS' },
    { text: '6300 Zug', category: 'ADDRESS' },
    { text: 'Lindenweg 6', category: 'ADDRESS' },
    { text: '8304 Wallisellen', category: 'ADDRESS' },
    { text: 'Mei Lin Zhao', category: 'PERSON' },
    { text: 'Dr. Zhao', category: 'PERSON' },
    { text: 'Weinbergstrasse 88', category: 'ADDRESS' },
    { text: '8006 Zurich', category: 'ADDRESS' },
    { text: 'Rheintal Mobility GmbH', category: 'COMPANY' },
    { text: 'RM-2021-044', category: 'ID' },
    { text: 'Präzisionsguss Thurgau AG', category: 'COMPANY' },
    { text: '1100-4478.221', category: 'ACCOUNT' },
    { text: 'Daniel Kocher', category: 'PERSON' },
    { text: 'Kocher', category: 'PERSON' },
    { text: 'Burgstrasse 12', category: 'ADDRESS' },
    { text: '8610 Uster', category: 'ADDRESS' },
    { text: 'AN260071', category: 'ID' },
    { text: 'Petra Schnyder', category: 'PERSON' },
    { text: 'Schnyder Arbeitsrecht GmbH', category: 'COMPANY' },
    { text: 'p.schnyder@schnyder-ar.example', category: 'EMAIL' },
    { text: 'Felix Amstutz', category: 'PERSON' },
    { text: 'Carla Montanari', category: 'PERSON' },
    { text: 'PROJECT EDELWEISS', category: 'ID' },
    { text: 'Project Edelweiss', category: 'ID' },
  ],
  keep: ['Art. 685b CO', 'Art. 697j CO', 'Art. 336a CO', 'Art. 340a para. 2 CO', 'Art. 332 CO', 'FADP',
    'change-of-control clause', 'drag-along right', 'locked-box mechanism', 'MEMS pressure sensors'],
};
