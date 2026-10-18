const MRZ_1 = 'P&lt;GBRWHITMORE&lt;&lt;OLIVER&lt;JAMES&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;';
const MRZ_2 = '5338172644GBR7603173M3204118&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02';
const decode = (s) => s.replace(/&lt;/g, '<');

export default {
  id: 'banking-en-01',
  domain: 'banking',
  language: 'en',
  title: 'Client Onboarding and KYC Form',
  header: 'HALDENSTEIN PRIVATE BANK LTD | Client Onboarding / KYC | WHITMORE OLIVER JAMES | Relationship 0471-228193',
  footer: 'Strictly confidential - prepared by D. Brändli, Private Clients International',
  parts: [
    {
      html: String.raw`
<p class="small">Haldenstein Private Bank Ltd, Talacker 29, 8001 Zurich, Switzerland</p>
<h1>Client Onboarding and KYC Form</h1>
<p>This form documents the identification of the contracting partner pursuant to Art. 3 AMLA, the establishment of
the beneficial owner pursuant to Art. 4 AMLA and the Agreement on the Swiss banks' code of conduct with regard to
the exercise of due diligence (CDB 20). All fields are mandatory unless marked optional.</p>
<h2>1. Contracting partner</h2>
<table class="grid">
<tr><th>Surname, given names</th><td>Whitmore, Oliver James</td></tr>
<tr><th>Date of birth</th><td>17.03.1976</td></tr>
<tr><th>Place of birth</th><td>Bristol, United Kingdom</td></tr>
<tr><th>Nationality</th><td>British</td></tr>
<tr><th>Residential address</th><td>Route de Florissant 41, 1206 Geneva, Switzerland</td></tr>
<tr><th>Previous address (last 3 years)</th><td>14 Clifton Park Road, Bristol BS8 3HL, United Kingdom</td></tr>
<tr><th>Mobile / e-mail</th><td>+41 79 555 83 16 / o.whitmore@example.co.uk</td></tr>
<tr><th>Identification document</th><td>Passport no. 533817264, issued 11.04.2022, valid until 11.04.2032</td></tr>
<tr><th>Swiss residence permit</th><td>Permit B no. GE-C-7741902, valid until 30.06.2028</td></tr>
<tr><th>Marital status</th><td>Married to Hannah Whitmore (née Fairbairn), date of birth 02.09.1979</td></tr>
<tr><th>Profession</th><td>Independent investor, former CEO and founder of Whitmore Logistics Ltd</td></tr>
</table>
<h2>2. Tax status</h2>
<table class="grid">
<tr><th>Country of tax residence</th><th>Tax identification number</th><th>Since</th></tr>
<tr><td>Switzerland (Canton of Geneva)</td><td>AHV/AVS 756.9045.1276.83</td><td>01.07.2025</td></tr>
<tr><td>United Kingdom (until 30.06.2025)</td><td>UTR 48213 90576</td><td>-</td></tr>
</table>
<p>US person under FATCA: <b>No</b> (form W-8BEN signed). CRS self-certification: tax resident in Switzerland only.
The client confirms that he holds no US citizenship, green card or substantial presence in the United States.</p>
<h2>3. Beneficial owner and powers of attorney</h2>
<p>The contracting partner declares on Form A that he is the sole beneficial owner of the assets. A general power of
attorney is granted to Hannah Whitmore. No third-party mandates.</p>
<h2>4. Politically exposed person (PEP) screening</h2>
<p>World-Check screening on 06.10.2026 without hits. The client is not a politically exposed person (PEP) and has no
close family or business relationship with a PEP.</p>
`,
    },
    {
      html: String.raw`
<h2>5. Source of wealth and source of funds</h2>
<table class="grid">
<tr><th>Item</th><th>Description</th><th class="num">Amount (CHF equiv.)</th></tr>
<tr><td>Sale of business</td><td>Sale of 100 % of Whitmore Logistics Ltd (Company no. 07731845, England and Wales) to Northbay Freight Holdings plc, completed 28.02.2025; sale and purchase agreement and completion statement on file</td><td class="num">9'850'000</td></tr>
<tr><td>Earned income</td><td>Salary and dividends as CEO 2009-2025, documented by UK tax returns 2019-2024</td><td class="num">1'720'000</td></tr>
<tr><td>Real estate</td><td>Sale of residence 14 Clifton Park Road, Bristol, completed 15.06.2025</td><td class="num">830'000</td></tr>
<tr><td colspan="2">Total estimated net wealth</td><td class="num">12'400'000</td></tr>
</table>
<p>Initial funding: transfer of GBP 6'200'000 from the client's account with Calder &amp; Rowe Bankers Ltd,
IBAN GB47 EXMP 4020 1588 3301 72, held in his sole name. Expected further inflows: none in the next 12 months.</p>
<h2>6. Account and services</h2>
<table class="grid">
<tr><th>Relationship no.</th><td>0471-228193</td></tr>
<tr><th>Accounts</th><td>0471-228193-01 (CHF), 0471-228193-02 (GBP), 0471-228193-03 (USD)</td></tr>
<tr><th>Service</th><td>Discretionary mandate, risk profile: balanced, reference currency CHF</td></tr>
<tr><th>Expected transactions</th><td>4-6 outgoing payments per year to own accounts and for living expenses</td></tr>
<tr><th>Correspondence</th><td>E-banking only, no hold mail</td></tr>
</table>
<h2>7. Risk classification</h2>
<p>Higher-risk relationship pursuant to Art. 13 AMLO-FINMA (assets above CHF 5 million, recent change of domicile).
Approval by the head of compliance required before the account is opened.</p>
<table class="grid">
<tr><th>Role</th><th>Name</th><th>Date</th></tr>
<tr><td>Relationship manager</td><td>Daniela Brändli, daniela.braendli@haldenstein-bank.example, +41 44 555 19 62</td><td>07.10.2026</td></tr>
<tr><td>Team head</td><td>Reto Caflisch</td><td>08.10.2026</td></tr>
<tr><td>Head of compliance</td><td>Marc Oberholzer</td><td>09.10.2026</td></tr>
</table>
<p>Introduced by: Ardley Grange Advisors LLP, London, contact person Fiona Ardley-Hughes, f.ardley@ardleygrange.example.</p>
<div class="as-image signature">Oliver J. Whitmore &nbsp;&nbsp;&nbsp; Geneva, 07.10.2026</div>
`,
    },
    {
      scan: { rotate: -1.1, noise: 16, dpi: 200 },
      html: String.raw`
<h1>Copy of identification document</h1>
<p>Certified true copy of the original, which was presented in person on 07.10.2026 at the Zurich office.</p>
<div class="as-image">
<p><b>UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND - PASSPORT</b></p>
<table class="facts">
<tr><th>Type / Code</th><td>P / GBR</td></tr>
<tr><th>Passport No.</th><td>533817264</td></tr>
<tr><th>Surname</th><td>WHITMORE</td></tr>
<tr><th>Given names</th><td>OLIVER JAMES</td></tr>
<tr><th>Nationality</th><td>BRITISH CITIZEN</td></tr>
<tr><th>Date of birth</th><td>17 MAR 1976</td></tr>
<tr><th>Sex / Place of birth</th><td>M / BRISTOL</td></tr>
<tr><th>Date of issue</th><td>11 APR 2022</td></tr>
<tr><th>Date of expiry</th><td>11 APR 2032</td></tr>
</table>
<pre>${MRZ_1}
${MRZ_2}</pre>
</div>
<p>Copy certified by: Daniela Brändli, Relationship Manager, Haldenstein Private Bank Ltd.</p>
<div class="as-image stamp">HALDENSTEIN PRIVATE BANK LTD<br>Certified copy - 07.10.2026 - DB</div>
`,
    },
  ],
  values: [
    { text: 'HALDENSTEIN PRIVATE BANK LTD', category: 'COMPANY' },
    { text: 'Haldenstein Private Bank Ltd', category: 'COMPANY' },
    { text: 'Talacker 29', category: 'ADDRESS' },
    { text: '8001 Zurich', category: 'ADDRESS' },
    { text: 'WHITMORE OLIVER JAMES', category: 'PERSON' },
    { text: 'Whitmore, Oliver James', category: 'PERSON' },
    { text: 'Oliver J. Whitmore', category: 'PERSON' },
    { text: 'WHITMORE', category: 'PERSON' },
    { text: 'OLIVER JAMES', category: 'PERSON' },
    { text: '0471-228193', category: 'ACCOUNT' },
    { text: '0471-228193-01', category: 'ACCOUNT' },
    { text: '0471-228193-02', category: 'ACCOUNT' },
    { text: '0471-228193-03', category: 'ACCOUNT' },
    { text: 'D. Brändli', category: 'PERSON' },
    { text: 'Daniela Brändli', category: 'PERSON' },
    { text: 'daniela.braendli@haldenstein-bank.example', category: 'EMAIL' },
    { text: '+41 44 555 19 62', category: 'PHONE' },
    { text: '17.03.1976', category: 'DATE' },
    { text: '17 MAR 1976', category: 'DATE' },
    { text: 'Route de Florissant 41', category: 'ADDRESS' },
    { text: '1206 Geneva', category: 'ADDRESS' },
    { text: '14 Clifton Park Road', category: 'ADDRESS' },
    { text: 'Bristol BS8 3HL', category: 'ADDRESS' },
    { text: '+41 79 555 83 16', category: 'PHONE' },
    { text: 'o.whitmore@example.co.uk', category: 'EMAIL' },
    { text: '533817264', category: 'ID' },
    { text: 'GE-C-7741902', category: 'ID' },
    { text: 'Hannah Whitmore', category: 'PERSON' },
    { text: 'Fairbairn', category: 'PERSON' },
    { text: '02.09.1979', category: 'DATE' },
    { text: 'Whitmore Logistics Ltd', category: 'COMPANY' },
    { text: '756.9045.1276.83', category: 'AHV' },
    { text: '48213 90576', category: 'ID' },
    { text: '07731845', category: 'ID' },
    { text: 'Northbay Freight Holdings plc', category: 'COMPANY' },
    { text: 'Calder &amp; Rowe Bankers Ltd'.replace('&amp;', '&'), category: 'COMPANY' },
    { text: 'GB47 EXMP 4020 1588 3301 72', category: 'IBAN' },
    { text: 'Reto Caflisch', category: 'PERSON' },
    { text: 'Marc Oberholzer', category: 'PERSON' },
    { text: 'Ardley Grange Advisors LLP', category: 'COMPANY' },
    { text: 'Fiona Ardley-Hughes', category: 'PERSON' },
    { text: 'f.ardley@ardleygrange.example', category: 'EMAIL' },
    { text: decode(MRZ_1), category: 'ID' },
    { text: decode(MRZ_2), category: 'ID' },
  ],
  keep: ['Art. 3 AMLA', 'Art. 4 AMLA', 'CDB 20', 'FATCA', 'W-8BEN', 'CRS self-certification', 'Form A',
    'politically exposed person (PEP)', 'Art. 13 AMLO-FINMA', 'Discretionary mandate', 'source of funds'],
};
