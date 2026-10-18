const RATINGS = [
  ['Ticket throughput', 'Resolve at least 38 tickets per working day (team average 41)', '29.4', '2 - below expectations'],
  ['First-call resolution', 'At least 72 % of tickets closed on first contact', '61 %', '2 - below expectations'],
  ['Customer satisfaction (CSAT)', 'Average survey score of 4.3 out of 5 or higher', '3.6', '2 - below expectations'],
  ['SLA adherence', 'Priority 1 tickets answered within 15 minutes in 95 % of cases', '88 %', '2 - below expectations'],
  ['Knowledge base', 'At least two new or updated articles per month', '1.5', '3 - meets expectations'],
  ['Product knowledge', 'Certification "Kestrel Ledger Advanced" completed', 'Completed in March', '4 - exceeds expectations'],
  ['Team collaboration', 'Peer feedback, shift handovers, mentoring of new joiners', 'Mixed', '3 - meets expectations'],
  ['Attendance and punctuality', 'Shift start 08:00 or 12:00 as rostered, absences reported before shift start', '7 late starts, 2 unreported absences', '1 - unsatisfactory'],
];

export default {
  id: 'hr-en-01',
  domain: 'hr',
  language: 'en',
  title: 'Annual Performance Review and Written Warning',
  header: 'KESTREL ANALYTICS AG | People & Culture | BRUNNER KEVIN, Employee No. E-20417',
  footer: 'Strictly confidential - personnel file K. Brunner - prepared by S. Imhof, HR Business Partner',
  parts: [
    {
      html: String.raw`
<p class="small">Kestrel Analytics AG, Baarerstrasse 61, 6300 Zug, CHE-271.904.633</p>
<h1>Annual Performance Review 2026</h1>
<table class="facts">
<tr><th>Employee</th><td>Mr Kevin Brunner, born 22.11.1991</td></tr>
<tr><th>Employee number</th><td>E-20417</td></tr>
<tr><th>Home address</th><td>Lorzenweg 18, 6340 Baar</td></tr>
<tr><th>Position</th><td>Customer Support Specialist, Level 2 (Service Desk, Zug)</td></tr>
<tr><th>Line manager</th><td>Ms Fiona Lindqvist, Head of Customer Support, fiona.lindqvist@kestrel-analytics.example</td></tr>
<tr><th>HR Business Partner</th><td>Mr Stefan Imhof, stefan.imhof@kestrel-analytics.example, +41 41 555 72 30</td></tr>
<tr><th>Review period</th><td>1 October 2025 to 30 September 2026</td></tr>
<tr><th>Review meeting</th><td>6 October 2026, meeting room "Rigi", 3rd floor</td></tr>
</table>
<h2>1. Purpose of this review</h2>
<p>This document records the annual performance review of Kevin Brunner for the review period stated above. It
summarises the objectives agreed in the review of October 2025, the results achieved, the feedback given in the
review meeting and the measures agreed for the coming months. The review was prepared by the line manager,
Fiona Lindqvist, and discussed with the employee in the presence of the HR Business Partner, Stefan Imhof.
The employee received a draft three working days before the meeting and was given the opportunity to comment
in writing.</p>
<p>The ratings use the company-wide five-point scale (1 unsatisfactory, 2 below expectations, 3 meets
expectations, 4 exceeds expectations, 5 outstanding). The overall rating is not the arithmetic mean of the
individual ratings but a judgement of the line manager that takes into account the weight of each objective
as defined in the role profile "Customer Support Specialist L2" (version 3.1).</p>
<h2>2. Objectives and results</h2>
<table class="grid">
<tr><th>Objective</th><th>Target</th><th>Result</th><th>Rating</th></tr>
${RATINGS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<p><b>Overall rating: 2 - below expectations.</b> The employee's ticket throughput and first-call resolution
were below target in every quarter of the review period, with a clear downward trend since April 2026. The
quality of the knowledge base articles and the successful certification show that Mr Brunner has the technical
skills required for the role. The main concerns are reliability, punctuality and compliance with the
attendance rules of the Service Desk.</p>
<h2>3. Salary and bonus</h2>
<p>In line with the compensation policy, an overall rating of 2 does not qualify for a merit increase. The annual
base salary therefore remains at CHF 84'500.00 gross (13 instalments). The variable bonus for 2026 is set at
25 % of the target bonus of CHF 4'200.00, i.e. CHF 1'050.00, paid with the December salary to the account on
file (IBAN CH62 0077 4010 3392 8106 4). The bonus is a discretionary payment within the meaning of
Art. 322d OR and does not establish an entitlement for future years.</p>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h1>Feedback, employee statement and development plan</h1>
<h3>Feedback of the line manager</h3>
<p>Kevin is well liked by his colleagues and is often the person they turn to for complex questions about the
reconciliation module of Kestrel Ledger. His article on the bank import errors (KB-1184) is one of the most
viewed articles of the year. In the first months of the review period he regularly covered shifts at short
notice and helped onboard two new team members.</p>
<p>From spring 2026 onwards, however, his performance declined noticeably. He frequently started his shift late,
on several occasions without informing the shift lead, and the number of reopened tickets rose from 6 % to 14 %.
Customers of two key accounts complained about missed callbacks. The issues were raised in the monthly
one-to-one meetings on 12 May, 9 June and 14 July 2026 (notes in the HR system, case HR-2026-0388), without
lasting improvement.</p>
<h3>Statement of the employee</h3>
<p>Mr Brunner explained that he had been under considerable personal strain since spring and that he found the
new ticket routing confusing, as it assigns him a disproportionate share of priority 2 tickets from the
French-speaking region. He asked for more transparency about how tickets are distributed and for a fixed early
shift for the next three months. He did not agree with the rating for team collaboration and noted that he had
mentored Laura Gisler and Tobias Weng in their first weeks.</p>
<p>Mr Imhof informed Mr Brunner about the employee assistance programme (confidential counselling, up to six
free sessions) and about the option of a confidential conversation with the company doctor. The employee was
reminded that the employer must protect his personality and health (Art. 328 OR) and that he may raise
concerns about workload at any time.</p>
<h3>Development plan</h3>
<ul>
<li>Performance improvement plan (PIP) for three months, from 13 October 2026 to 12 January 2027.</li>
<li>Weekly 30-minute check-in with Ms Lindqvist, every Tuesday at 08:30.</li>
<li>Fixed early shift (08:00 to 16:48) during the PIP, as requested by the employee.</li>
<li>Monthly KPI report with throughput, first-call resolution and CSAT, shared with the employee.</li>
<li>Refresher training "Ticket triage and SLA handling" (half a day, internal, by 31 October 2026).</li>
<li>Interim targets: 34 tickets per day and 68 % first-call resolution by end of November, full targets by
the end of the PIP.</li>
</ul>
<h3>Next steps</h3>
<p>The PIP is reviewed in a meeting on 12 January 2027. If the targets are met, the written warning below is
removed from the personnel file after twelve months without further incidents. If they are not met, the
company reserves the right to take further steps up to and including ordinary termination with notice under
Art. 335c OR, taking into account the protection periods of Art. 336c OR.</p>
<p>Signed for acknowledgement (receipt, not agreement):</p>
<div class="as-image signature">K. Brunner &nbsp;&nbsp; F. Lindqvist &nbsp;&nbsp; S. Imhof &nbsp;&nbsp; Zug, 06.10.2026</div>
`,
    },
    {
      html: String.raw`
<p class="small">Kestrel Analytics AG, People &amp; Culture, Baarerstrasse 61, 6300 Zug</p>
<p><b>Personal and confidential - delivered by hand</b><br>Mr Kevin Brunner<br>Lorzenweg 18<br>6340 Baar</p>
<p class="right">Zug, 6 October 2026</p>
<h1>Written warning</h1>
<p>Dear Mr Brunner</p>
<p>We refer to the performance review meeting of today, attended by your line manager Fiona Lindqvist and by the
undersigned, and to the one-to-one meetings of 12 May, 9 June and 14 July 2026, in which your attendance was
discussed with you.</p>
<p>Between 1 May and 30 September 2026 you started your rostered shift late on seven occasions (between 18 and
95 minutes) and were absent without notifying the shift lead on 21 August and 15 September 2026. On
15 September 2026 two priority 1 tickets of the customer Alpenblick Treuhand GmbH remained unanswered for more
than three hours as a result. This conduct breaches your duty of diligence and loyalty under Art. 321a OR and
the instructions of the employer under Art. 321d OR, in particular section 4.2 of the Service Desk rules
("Absences must be reported to the shift lead before the start of the shift").</p>
<p>We hereby formally warn you. We expect you to comply with the rostered shift times and the reporting rules
without exception from now on. Please note that a further breach of these duties may lead to the termination of
your employment, in serious cases also without notice under Art. 337 OR.</p>
<p>We would like to emphasise that we value your technical knowledge and your contribution to the team, and
that we want the performance improvement plan to succeed. Should health or personal reasons be the cause of
the difficulties, please contact Stefan Imhof (+41 41 555 72 30) or the employee assistance programme; this
information will be treated confidentially.</p>
<p>Yours sincerely</p>
<p>Kestrel Analytics AG</p>
<div class="as-image signature">Fiona Lindqvist &nbsp;&nbsp;&nbsp;&nbsp; Stefan Imhof</div>
<p>Fiona Lindqvist, Head of Customer Support &nbsp;&nbsp; Stefan Imhof, HR Business Partner</p>
<h2>Acknowledgement of receipt</h2>
<p>I confirm that I received this written warning on 6 October 2026. I have been informed that I may submit a
written statement within 14 days, which will be added to my personnel file.</p>
<table class="facts">
<tr><th>Name</th><td>Kevin Brunner</td></tr>
<tr><th>Employee number</th><td>E-20417</td></tr>
<tr><th>Date, signature</th><td>06.10.2026</td></tr>
</table>
<div class="as-image signature">Brunner K.</div>
<p class="small">Copy: personnel file E-20417 (HR system case HR-2026-0388). Not to be forwarded.</p>
`,
    },
  ],
  values: [
    { text: 'BRUNNER KEVIN', category: 'PERSON' },
    { text: 'Kevin Brunner', category: 'PERSON' },
    { text: 'K. Brunner', category: 'PERSON' },
    { text: 'Brunner K.', category: 'PERSON' },
    { text: 'Kevin', category: 'PERSON' },
    { text: '22.11.1991', category: 'DATE' },
    { text: 'E-20417', category: 'ID' },
    { text: 'Lorzenweg 18', category: 'ADDRESS' },
    { text: '6340 Baar', category: 'ADDRESS' },
    { text: 'Fiona Lindqvist', category: 'PERSON' },
    { text: 'F. Lindqvist', category: 'PERSON' },
    { text: 'fiona.lindqvist@kestrel-analytics.example', category: 'EMAIL' },
    { text: 'Stefan Imhof', category: 'PERSON' },
    { text: 'S. Imhof', category: 'PERSON' },
    { text: 'stefan.imhof@kestrel-analytics.example', category: 'EMAIL' },
    { text: '+41 41 555 72 30', category: 'PHONE' },
    { text: 'Laura Gisler', category: 'PERSON' },
    { text: 'Tobias Weng', category: 'PERSON' },
    { text: 'HR-2026-0388', category: 'ID' },
    { text: 'CH62 0077 4010 3392 8106 4', category: 'IBAN' },
    { text: 'Kestrel Analytics AG', category: 'COMPANY' },
    { text: 'KESTREL ANALYTICS AG', category: 'COMPANY' },
    { text: 'CHE-271.904.633', category: 'ID' },
    { text: 'Baarerstrasse 61', category: 'ADDRESS' },
    { text: '6300 Zug', category: 'ADDRESS' },
    { text: 'Alpenblick Treuhand GmbH', category: 'COMPANY' },
  ],
  keep: ['Art. 321a OR', 'Art. 321d OR', 'Art. 336c OR', 'Art. 335c OR', 'Art. 337 OR', 'Art. 328 OR',
    'Art. 322d OR', 'performance improvement plan', 'first-call resolution', 'CHF 84\'500.00'],
};
