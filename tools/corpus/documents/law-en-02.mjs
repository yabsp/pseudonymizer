export default {
  id: 'law-en-02',
  domain: 'law',
  language: 'en',
  title: 'Mutual Non-Disclosure Agreement',
  header: 'MUTUAL NON-DISCLOSURE AGREEMENT | ALPENQUELL ROBOTICS AG / HARROWGATE ANALYTICS LTD',
  footer: 'Agreement No. NDA-2026-0317 - Strictly confidential',
  parts: [
    {
      html: String.raw`
<h1>Mutual Non-Disclosure Agreement</h1>
<p>Agreement No. NDA-2026-0317, dated 5 October 2026</p>
<p>between</p>
<table class="facts">
<tr><th>(1)</th><td><b>Alpenquell Robotics AG</b>, a company limited by shares incorporated under the laws of Switzerland, registered in the commercial register of the Canton of Zug under UID CHE-418.227.903, with its registered office at Industriestrasse 22, 6300 Zug, Switzerland ("Alpenquell")</td></tr>
<tr><th>(2)</th><td><b>Harrowgate Analytics Ltd</b>, a private limited company incorporated in England and Wales under company number 11893472, with its registered office at 48 Whitworth Street, Manchester M1 3NR, United Kingdom ("Harrowgate")</td></tr>
</table>
<p>(each a "Party" and together the "Parties").</p>
<h2>Background</h2>
<p>(A) Alpenquell develops autonomous inspection robots for pipelines and tunnels. Harrowgate provides machine learning
services for the analysis of sensor and video data.</p>
<p>(B) The Parties intend to evaluate a joint development of a defect classification model for ultrasonic pipeline
inspection under the working title "Project Lindwurm" (the "Purpose"). For this Purpose each Party will disclose
technical, commercial and personal data to the other Party.</p>
<p>(C) The Parties wish to set out the terms on which such information is disclosed and protected.</p>
<h2>1. Definitions</h2>
<p>1.1 "Confidential Information" means all information, in whatever form or medium, disclosed by or on behalf of
a Party (the "Disclosing Party") to the other Party (the "Receiving Party") in connection with the Purpose, whether
before or after the date of this Agreement, including source code, model weights, training data, sensor recordings,
drawings, price lists, customer names and the existence and content of the discussions between the Parties. The
data sets listed in Exhibit A are Confidential Information in all cases.</p>
<p>1.2 "Personal Data" has the meaning given in the Swiss Federal Act on Data Protection (FADP) and, where
applicable, the UK General Data Protection Regulation (UK GDPR).</p>
<p>1.3 "Representatives" means the directors, employees, professional advisers and subcontractors of a Party who
need to know the Confidential Information for the Purpose.</p>
<h2>2. Obligations of confidentiality</h2>
<p>2.1 The Receiving Party shall (a) keep the Confidential Information strictly confidential; (b) use it solely
for the Purpose; (c) disclose it only to its Representatives who are bound by obligations of confidentiality no
less protective than those in this Agreement; and (d) protect it with at least the degree of care it uses for its
own confidential information, and in any event with no less than reasonable care.</p>
<p>2.2 The Receiving Party shall store Confidential Information only on systems located in Switzerland, the
United Kingdom or the European Economic Area which are operated in accordance with ISO/IEC 27001. Training of
machine learning models on Confidential Information outside the evaluation environment described in Exhibit A
is not permitted.</p>
<p>2.3 The obligations in this Clause 2 do not apply to information which the Receiving Party can demonstrate
(a) is or becomes publicly available other than through a breach of this Agreement; (b) was lawfully in its
possession before disclosure; (c) is independently developed without use of the Confidential Information; or
(d) must be disclosed by law, by a court or by a regulatory authority, provided that the Receiving Party gives the
Disclosing Party prompt written notice where legally permitted.</p>
<h2>3. Personal Data</h2>
<p>3.1 The sensor recordings in Exhibit A may contain Personal Data of employees of Alpenquell's customers (for
example faces and voices captured by inspection cameras). Harrowgate shall process such data only on documented
instructions of Alpenquell and shall conclude a data processing agreement before receiving it.</p>
<p>3.2 Transfers of Personal Data from Switzerland to the United Kingdom are based on the adequacy decision of the
Swiss Federal Council in Annex 1 of the Data Protection Ordinance (DPO).</p>
<h2>4. Return and destruction</h2>
<p>4.1 Upon written request of the Disclosing Party, and in any event within 30 days after the end of the
evaluation, the Receiving Party shall return or securely destroy all Confidential Information, including all
copies, extracts and derived model artefacts, and shall confirm the destruction in writing signed by an
authorised officer.</p>
`,
    },
    {
      html: String.raw`
<h2>5. Term</h2>
<p>5.1 This Agreement enters into force on the date of the last signature and remains in force for two years. The
obligations of confidentiality survive termination for five years; for source code and trade secrets they continue
as long as the information remains secret.</p>
<h2>6. Contractual penalty and remedies</h2>
<p>6.1 For each breach of Clauses 2 or 3 the breaching Party shall pay a contractual penalty of CHF 100'000
pursuant to Art. 160 et seq. of the Swiss Code of Obligations. Payment of the penalty does not release the
breaching Party from its obligations; claims for further damages and for injunctive relief remain reserved.</p>
<p>6.2 The Parties acknowledge that the unauthorised disclosure of trade secrets may be punishable under Art. 162
of the Swiss Criminal Code and Art. 6 of the Federal Act against Unfair Competition (UCA).</p>
<h2>7. Notices</h2>
<p>7.1 Notices under this Agreement shall be in writing and sent by e-mail with a copy by registered mail to:</p>
<table class="grid">
<tr><th>Party</th><th>Contact</th><th>E-mail</th><th>Telephone</th></tr>
<tr><td>Alpenquell</td><td>Dr. Matthias Zehnder, Chief Executive Officer</td><td>m.zehnder@alpenquell.example</td><td>+41 41 555 72 10</td></tr>
<tr><td>Alpenquell</td><td>Corinne Wyss, Head of Legal</td><td>legal@alpenquell.example</td><td>+41 41 555 72 18</td></tr>
<tr><td>Harrowgate</td><td>Oliver Pemberton, Managing Director</td><td>oliver.pemberton@harrowgate-analytics.example</td><td>+44 161 555 0193</td></tr>
<tr><td>Harrowgate</td><td>Priya Ramaswamy, General Counsel</td><td>p.ramaswamy@harrowgate-analytics.example</td><td>+44 161 555 0147</td></tr>
</table>
<h2>8. Governing law and jurisdiction</h2>
<p>8.1 This Agreement is governed by substantive Swiss law, excluding its conflict of laws rules and the United
Nations Convention on Contracts for the International Sale of Goods (CISG).</p>
<p>8.2 The Commercial Court of the Canton of Zurich shall have exclusive jurisdiction for all disputes arising
out of or in connection with this Agreement, subject to an appeal to the Swiss Federal Supreme Court. Each Party
may seek interim measures before any competent court.</p>
<h2>9. Miscellaneous</h2>
<p>9.1 No licence or other right in the Confidential Information is granted except as expressly set out herein.
9.2 Amendments require written form, signed by both Parties. 9.3 Should any provision be invalid, the remaining
provisions remain in force.</p>
<h2>Exhibit A - Disclosed project data</h2>
<table class="grid">
<tr><th>No.</th><th>Data set</th><th>Content</th><th>Volume</th><th>Transfer</th><th>Custodian</th></tr>
<tr><td>A1</td><td>UT-Scans Line 7</td><td>Ultrasonic wall thickness scans, gas pipeline Rotkreuz - Cham, 2024-2026</td><td>412 GB</td><td>SFTP sftp.alpenquell.example (198.51.100.24)</td><td>Lukas Imhof</td></tr>
<tr><td>A2</td><td>Defect labels v3</td><td>14'280 annotated defect regions, corrosion and weld classes</td><td>1.2 GB</td><td>SFTP sftp.alpenquell.example (198.51.100.24)</td><td>Lukas Imhof</td></tr>
<tr><td>A3</td><td>Tunnel video Gotthard-Nord</td><td>Inspection video with audio, contains faces of maintenance staff</td><td>2.9 TB</td><td>Encrypted drive, serial AQ-HDD-55102</td><td>Sandra Bucher</td></tr>
<tr><td>A4</td><td>Customer list</td><td>Utility customers of Alpenquell with contract volumes 2025</td><td>84 KB</td><td>Data room, user hgt-eval-02</td><td>Corinne Wyss</td></tr>
<tr><td>A5</td><td>HGA-Classifier 2.4</td><td>Pre-trained model weights and inference code of Harrowgate</td><td>6.4 GB</td><td>Evaluation VM eval-lindwurm-01.harrowgate-analytics.example</td><td>Thomas Okafor</td></tr>
<tr><td>A6</td><td>Benchmark report</td><td>Precision and recall of HGA-Classifier on public pipeline data</td><td>3 MB</td><td>E-mail, PGP encrypted</td><td>Thomas Okafor</td></tr>
</table>
<p>Access credentials (keys and passwords) are exchanged by telephone only and are not part of this Exhibit.
The evaluation VM is reachable from Alpenquell only through the VPN gateway vpn.harrowgate-analytics.example
(203.0.113.58).</p>
`,
    },
    {
      html: String.raw`
<h2>Signatures</h2>
<p>In witness whereof the Parties have executed this Agreement in two originals in English.</p>
<p><b>For Alpenquell Robotics AG</b></p>
<div class="as-image signature">Zug, 5 October 2026<br>M. Zehnder &nbsp;&nbsp;&nbsp;&nbsp; C. Wyss<br>Dr. Matthias Zehnder, CEO &nbsp;&nbsp; Corinne Wyss, Head of Legal</div>
<p><b>For Harrowgate Analytics Ltd</b></p>
<div class="as-image signature">Manchester, 7 October 2026<br>O. Pemberton &nbsp;&nbsp;&nbsp;&nbsp; P. Ramaswamy<br>Oliver Pemberton, Managing Director &nbsp;&nbsp; Priya Ramaswamy, General Counsel</div>
<p class="small">Both signatories of each Party sign jointly (collective signature by two, as entered in the
commercial register for Alpenquell and as resolved by the board of Harrowgate on 2 October 2026).</p>
<h2>Annex - Representatives with access</h2>
<table class="grid">
<tr><th>Name</th><th>Party</th><th>Role</th><th>Access to</th></tr>
<tr><td>Lukas Imhof</td><td>Alpenquell</td><td>Lead data engineer</td><td>A1, A2, A5</td></tr>
<tr><td>Sandra Bucher</td><td>Alpenquell</td><td>Inspection operations</td><td>A3</td></tr>
<tr><td>Thomas Okafor</td><td>Harrowgate</td><td>Principal ML engineer</td><td>A1 to A6</td></tr>
<tr><td>Emily Hartley</td><td>Harrowgate</td><td>Data protection officer</td><td>A3 (audit only)</td></tr>
</table>
`,
    },
  ],
  values: [
    { text: 'ALPENQUELL ROBOTICS AG', category: 'COMPANY' },
    { text: 'HARROWGATE ANALYTICS LTD', category: 'COMPANY' },
    { text: 'Alpenquell Robotics AG', category: 'COMPANY' },
    { text: 'Harrowgate Analytics Ltd', category: 'COMPANY' },
    { text: 'Alpenquell', category: 'COMPANY' },
    { text: 'Harrowgate', category: 'COMPANY' },
    { text: 'NDA-2026-0317', category: 'ID' },
    { text: 'CHE-418.227.903', category: 'ID' },
    { text: 'Industriestrasse 22', category: 'ADDRESS' },
    { text: '6300 Zug', category: 'ADDRESS' },
    { text: '11893472', category: 'ID' },
    { text: '48 Whitworth Street', category: 'ADDRESS' },
    { text: 'Manchester M1 3NR', category: 'ADDRESS' },
    { text: 'Matthias Zehnder', category: 'PERSON' },
    { text: 'M. Zehnder', category: 'PERSON' },
    { text: 'm.zehnder@alpenquell.example', category: 'EMAIL' },
    { text: '+41 41 555 72 10', category: 'PHONE' },
    { text: 'Corinne Wyss', category: 'PERSON' },
    { text: 'C. Wyss', category: 'PERSON' },
    { text: 'legal@alpenquell.example', category: 'EMAIL' },
    { text: '+41 41 555 72 18', category: 'PHONE' },
    { text: 'Oliver Pemberton', category: 'PERSON' },
    { text: 'O. Pemberton', category: 'PERSON' },
    { text: 'oliver.pemberton@harrowgate-analytics.example', category: 'EMAIL' },
    { text: '+44 161 555 0193', category: 'PHONE' },
    { text: 'Priya Ramaswamy', category: 'PERSON' },
    { text: 'P. Ramaswamy', category: 'PERSON' },
    { text: 'p.ramaswamy@harrowgate-analytics.example', category: 'EMAIL' },
    { text: '+44 161 555 0147', category: 'PHONE' },
    { text: 'sftp.alpenquell.example', category: 'HOST' },
    { text: '198.51.100.24', category: 'IP' },
    { text: 'Lukas Imhof', category: 'PERSON' },
    { text: 'AQ-HDD-55102', category: 'ID' },
    { text: 'Sandra Bucher', category: 'PERSON' },
    { text: 'hgt-eval-02', category: 'USERNAME' },
    { text: 'eval-lindwurm-01.harrowgate-analytics.example', category: 'HOST' },
    { text: 'vpn.harrowgate-analytics.example', category: 'HOST' },
    { text: '203.0.113.58', category: 'IP' },
    { text: 'Thomas Okafor', category: 'PERSON' },
    { text: 'Emily Hartley', category: 'PERSON' },
  ],
  keep: ['Confidential Information', 'Swiss Code of Obligations', 'Art. 162 of the Swiss Criminal Code',
    'contractual penalty', 'Commercial Court of the Canton of Zurich', 'ISO/IEC 27001',
    'Federal Act on Data Protection (FADP)', 'UK GDPR', 'CISG', 'ultrasonic pipeline inspection'],
};
