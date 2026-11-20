// Deterministic pseudo-random numbers (Park-Miller), so the generated listings are the same on every build.
const random = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const pick = (next, list) => list[Math.floor(next() * list.length)];

const SITES = [
  { no: '101', centre: 'Clinical Research Unit Birsfelden', city: '4127 Birsfelden', investigator: 'Prof. Dr med. Ursula Brändli', name: 'Ursula Brändli', email: 'u.braendli@cru-birsfelden.example', phone: '+41 61 555 31 10' },
  { no: '102', centre: 'Inselhof Research Centre', city: '3010 Bern', investigator: 'Dr med. Kaspar Wyttenbach', name: 'Kaspar Wyttenbach', email: 'k.wyttenbach@inselhof-research.example', phone: '+41 31 555 82 44' },
  { no: '103', centre: 'Unité d\'investigation clinique Vennes', city: '1010 Lausanne', investigator: 'Dr méd. Aurélie Chappuis', name: 'Aurélie Chappuis', email: 'a.chappuis@uic-vennes.example', phone: '+41 21 555 19 63' },
  { no: '104', centre: 'Studienzentrum Limmattal', city: '8952 Schlieren', investigator: 'PD Dr med. Reto Hunkeler', name: 'Reto Hunkeler', email: 'r.hunkeler@sz-limmattal.example', phone: '+41 44 555 47 08' },
  { no: '105', centre: 'Centro studi clinici Sottoceneri', city: '6850 Mendrisio', investigator: 'Dr. med. Paola Ferrazzini', name: 'Paola Ferrazzini', email: 'p.ferrazzini@csc-sottoceneri.example', phone: '+41 91 555 26 51' },
  { no: '106', centre: 'Klinische Prüfstelle Breisgau', city: '79106 Freiburg im Breisgau', investigator: 'Dr. med. Henrik Albrecht', name: 'Henrik Albrecht', email: 'h.albrecht@kp-breisgau.example', phone: '+49 761 555 3920' },
];

const LETTERS = 'ABCDEFGHJKLMNPRSTVWZ';
const COHORTS = ['A (25 mg)', 'B (75 mg)', 'C (150 mg)', 'D (300 mg)'];

function buildSubjects() {
  const next = random(41702);
  const perSite = [24, 22, 18, 20, 16, 20];
  const subjects = [];
  let randomisation = 3001;
  SITES.forEach((site, s) => {
    for (let i = 1; i <= perSite[s]; i++) {
      const initials = `${pick(next, LETTERS)}.${pick(next, LETTERS)}.`;
      const roll = next();
      const status = roll < 0.06 ? 'withdrawn (consent)' : roll < 0.09 ? 'screen failure' : 'completed';
      const randomised = status !== 'screen failure';
      subjects.push({
        id: `${site.no}-${String(i).padStart(3, '0')}`,
        initials,
        sex: next() < 0.45 ? 'F' : 'M',
        age: 19 + Math.floor(next() * 36),
        site: site.no,
        cohort: randomised ? pick(next, COHORTS) : '-',
        arm: randomised ? (next() < 0.75 ? 'active' : 'placebo') : '-',
        randomisation: randomised ? `R${randomisation++}` : '-',
        status,
      });
    }
  });
  return subjects;
}

const SUBJECTS = buildSubjects();
const PK_SUBJECTS = SUBJECTS.filter((s) => s.status === 'completed' && s.arm === 'active').slice(0, 70);
const DOSE = { 'A (25 mg)': 25, 'B (75 mg)': 75, 'C (150 mg)': 150, 'D (300 mg)': 300 };

function pkRow(subject, index) {
  const next = random(9000 + index * 37);
  const dose = DOSE[subject.cohort];
  const cmax = (dose * (5.8 + next() * 2.4)).toFixed(0);
  const tmax = (1 + Math.floor(next() * 6) * 0.5).toFixed(1);
  const auc = (dose * (61 + next() * 22)).toFixed(0);
  const halfLife = (13.5 + next() * 6).toFixed(1);
  const clearance = ((dose * 1000) / Number(auc)).toFixed(2);
  return `<tr><td>${subject.id}</td><td>${subject.cohort}</td><td>${cmax}</td><td>${tmax}</td><td>${auc}</td><td>${halfLife}</td><td>${clearance}</td></tr>`;
}

const subjectTable = (rows) => `<table class="grid">
<tr><th>Subject ID</th><th>Initials</th><th>Sex</th><th>Age</th><th>Site</th><th>Cohort</th><th>Arm</th><th>Randomisation no.</th><th>Status</th></tr>
${rows.map((s) => `<tr><td>${s.id}</td><td>${s.initials}</td><td>${s.sex}</td><td>${s.age}</td><td>${s.site}</td><td>${s.cohort}</td><td>${s.arm}</td><td>${s.randomisation}</td><td>${s.status}</td></tr>`).join('\n')}
</table>`;

const pkTable = (rows, offset) => `<table class="grid">
<tr><th>Subject ID</th><th>Cohort</th><th>Cmax (ng/ml)</th><th>tmax (h)</th><th>AUC0-inf (ng·h/ml)</th><th>t1/2 (h)</th><th>CL/F (l/h)</th></tr>
${rows.map((s, i) => pkRow(s, offset + i)).join('\n')}
</table>`;

const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

const SUBJECT_VALUES = [
  ...SUBJECTS.map((s) => ({ text: s.id, category: 'ID' })),
  ...[...new Set(SUBJECTS.map((s) => s.initials))].map((text) => ({ text, category: 'PERSON' })),
  ...SUBJECTS.filter((s) => s.randomisation !== '-').map((s) => ({ text: s.randomisation, category: 'ID' })),
];

const SITE_VALUES = SITES.flatMap((s) => [
  { text: s.centre, category: 'COMPANY' },
  { text: s.city, category: 'ADDRESS' },
  { text: s.name, category: 'PERSON' },
  { text: s.email, category: 'EMAIL' },
  { text: s.phone, category: 'PHONE' },
]);

export default {
  id: 'pharma-en-01',
  domain: 'pharma',
  language: 'en',
  title: 'Clinical study protocol synopsis VLM417-102',
  header: 'VALMORA THERAPEUTICS AG | Protocol VLM417-102 | Sponsor contact: DR HELEN ACHERMANN | CONFIDENTIAL',
  footer: 'Protocol VLM417-102, version 3.0 of 14 July 2026 - Valmora Therapeutics AG - confidential',
  parts: [
    {
      html: String.raw`
<div class="as-image">VALMORA THERAPEUTICS AG<br>Hochbergerstrasse 60, 4057 Basel, Switzerland</div>
<h1>Clinical study protocol synopsis</h1>
<table class="facts">
<tr><th>Protocol number</th><td>VLM417-102</td></tr>
<tr><th>EU CT number</th><td>2026-500418-27-00</td></tr>
<tr><th>Swissmedic reference</th><td>701442</td></tr>
<tr><th>BASEC number</th><td>2026-00731</td></tr>
<tr><th>Title</th><td>A randomised, double-blind, placebo-controlled, multiple ascending dose study to evaluate the safety,
tolerability, pharmacokinetics and pharmacodynamics of oral VLM-417 in healthy adult subjects</td></tr>
<tr><th>Phase</th><td>Phase I</td></tr>
<tr><th>Investigational product</th><td>VLM-417, oral factor XIa inhibitor, film-coated tablets 25 mg and 75 mg</td></tr>
<tr><th>Sponsor</th><td>Valmora Therapeutics AG, Hochbergerstrasse 60, 4057 Basel</td></tr>
<tr><th>Sponsor contact</th><td>Dr Helen Achermann, Clinical Study Leader, helen.achermann@valmora.example, +41 61 555 70 14</td></tr>
<tr><th>Medical monitor</th><td>Dr med. Katrin Vogt, katrin.vogt@valmora.example, 24 h safety line +41 61 555 70 99</td></tr>
<tr><th>Contract research organisation</th><td>Meridian Clinical Services GmbH, project manager Jonas Frei, jonas.frei@meridian-cs.example</td></tr>
<tr><th>Coordinating investigator</th><td>Prof. Dr med. Ursula Brändli, Clinical Research Unit Birsfelden</td></tr>
</table>
<h2>1. Background and rationale</h2>
<p>Factor XIa is a key enzyme of the intrinsic coagulation pathway that amplifies thrombin generation but plays a
minor role in physiological haemostasis. Inhibition of factor XIa is therefore expected to prevent thrombosis with
a lower bleeding risk than current anticoagulants such as apixaban or rivaroxaban. VLM-417 is a small molecule,
reversible, highly selective inhibitor of factor XIa with an in vitro IC50 of 1.8 nM and more than 1000-fold
selectivity against thrombin, factor Xa and plasma kallikrein.</p>
<p>In the first-in-human single ascending dose study VLM417-101, single oral doses of 10 mg to 600 mg were well
tolerated in 64 healthy subjects. Exposure increased approximately dose-proportionally up to 300 mg, the terminal
half-life was 14 to 19 hours, supporting once-daily dosing, and a dose-dependent prolongation of the activated
partial thromboplastin time (aPTT) was observed without effect on the prothrombin time. No clinically relevant
bleeding events occurred.</p>
<p>The present study investigates repeated once-daily dosing over 14 days to characterise steady-state
pharmacokinetics, accumulation, the time course of factor XI activity inhibition and the safety profile before
the start of phase II studies in patients after total knee arthroplasty and in patients with end-stage renal
disease on haemodialysis.</p>
<h2>2. Objectives and endpoints</h2>
<table class="grid">
<tr><th>Objective</th><th>Endpoint</th></tr>
<tr><td>Primary: safety and tolerability of multiple oral doses</td><td>Incidence of treatment-emergent adverse events (TEAE), bleeding events according to ISTH criteria, vital signs, 12-lead ECG, clinical laboratory</td></tr>
<tr><td>Secondary: pharmacokinetics on day 1 and day 14</td><td>Cmax, tmax, AUC0-24, AUC0-inf, t1/2, CL/F, Vz/F, accumulation ratio Rac</td></tr>
<tr><td>Secondary: pharmacodynamics</td><td>Factor XI activity (FXI:C), aPTT, PT/INR, thrombin generation</td></tr>
<tr><td>Exploratory: food effect in cohort B</td><td>Ratio of AUC0-inf and Cmax fed versus fasted</td></tr>
<tr><td>Exploratory: metabolite profiling</td><td>Plasma and urine metabolites M3 and M7</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>3. Study design</h2>
<p>This is a single-centre-per-cohort, randomised, double-blind, placebo-controlled study with four sequential
dose cohorts of 25 mg, 75 mg, 150 mg and 300 mg VLM-417 once daily for 14 days. In each cohort, 24 subjects are
randomised in a 3:1 ratio to VLM-417 or matching placebo. Sentinel dosing is applied in every cohort: two subjects
(one active, one placebo) are dosed first and the remaining subjects are dosed at least 48 hours later if no
safety concern has occurred.</p>
<p>Dose escalation to the next cohort is decided by the Safety Review Committee after review of blinded safety,
tolerability and available pharmacokinetic data up to day 21 of at least 18 subjects of the previous cohort. The
Safety Review Committee consists of the coordinating investigator, the medical monitor, an independent
haematologist and the sponsor's clinical pharmacologist.</p>
<p>Subjects are confined to the clinical research unit from day -1 to day 15 and return for ambulatory visits on
days 17, 21 and 28. The end-of-study visit is on day 42.</p>
<h2>4. Population</h2>
<p>Key inclusion criteria: healthy male and female subjects aged 18 to 55 years, body mass index 18.5 to 30.0 kg/m²,
body weight at least 50 kg, normal coagulation parameters (aPTT, PT, fibrinogen, factor XI activity within the
reference range), women of non-childbearing potential or using highly effective contraception.</p>
<p>Key exclusion criteria: history of bleeding disorders or abnormal bleeding, gastrointestinal ulcer within five
years, major surgery within three months, use of anticoagulants, antiplatelet agents, NSAIDs or strong CYP3A4 and
P-gp inhibitors or inducers within 14 days, positive test for HIV, hepatitis B or C, eGFR below 90 ml/min/1.73 m²,
QTcF above 450 ms, smoking more than 5 cigarettes per day.</p>
<h2>5. Pharmacokinetic assessments and analysis</h2>
<p>Blood samples for VLM-417 plasma concentrations are taken on day 1 and day 14 pre-dose and at 0.5, 1, 1.5, 2, 3,
4, 6, 8, 12, 16 and 24 hours post-dose, on days 3, 5, 7, 10 and 12 pre-dose (trough), and on days 15, 16, 17, 21 and
28. Concentrations are measured with a validated LC-MS/MS method, lower limit of quantification 0.5 ng/ml.</p>
<p>Pharmacokinetic parameters are derived by non-compartmental analysis with actual sampling times. The maximum
plasma concentration <tex>C_{\max}</tex> and the time to reach it, <tex>t_{\max}</tex>, are read directly from the
concentration-time data. The area under the curve up to the last quantifiable concentration is calculated with
the linear-up log-down trapezoidal method; for the linear part:</p>
<tex display>\mathrm{AUC}_{0-t} = \sum_{i=1}^{n} \frac{(C_{i-1} + C_{i})}{2} \cdot (t_{i} - t_{i-1})</tex>
<p>and for declining concentrations:</p>
<tex display>\mathrm{AUC}_{t_{i-1}}^{t_{i}} = \frac{(C_{i-1} - C_{i}) \cdot (t_{i} - t_{i-1})}{\ln\left(\frac{C_{i-1}}{C_{i}}\right)}</tex>
<p>The terminal elimination rate constant <tex>\lambda_{z}</tex> is estimated by log-linear regression of at least
three points of the terminal phase:</p>
<tex display>\ln C(t) = \ln C_{0} - \lambda_{z} \cdot t</tex>
<p>Extrapolation to infinity uses the last quantifiable concentration <tex>C_{\mathrm{last}}</tex>:</p>
<tex display>\mathrm{AUC}_{0-\infty} = \mathrm{AUC}_{0-t} + \frac{C_{\mathrm{last}}}{\lambda_{z}}</tex>
<p>which is equivalent to the integral of the concentration-time curve:</p>
<tex display>\mathrm{AUC}_{0-\infty} = \int_{0}^{\infty} C(t)\, dt</tex>
<p>The terminal half-life, the apparent clearance and the apparent volume of distribution are:</p>
<tex display>t_{1/2} = \frac{\ln 2}{\lambda_{z}}</tex>
<tex display>\mathrm{CL}/F = \frac{\mathrm{Dose}}{\mathrm{AUC}_{0-\infty}}</tex>
<tex display>V_{z}/F = \frac{\mathrm{CL}/F}{\lambda_{z}} = \frac{\mathrm{Dose}}{\lambda_{z} \cdot \mathrm{AUC}_{0-\infty}}</tex>
<p>The accumulation ratio after 14 days and its theoretical value for a dosing interval <tex>\tau = 24</tex> h are:</p>
<tex display>R_{\mathrm{ac}} = \frac{\mathrm{AUC}_{0-\tau,\,\mathrm{day}\,14}}{\mathrm{AUC}_{0-\tau,\,\mathrm{day}\,1}}</tex>
<tex display>R_{\mathrm{ac,theor}} = \frac{1}{1 - e^{-\lambda_{z} \tau}}</tex>
<p>AUC values with more than 20 % extrapolated area are reported but excluded from summary statistics.</p>
`,
    },
    {
      html: String.raw`
<h2>6. Statistical methods</h2>
<p>Dose proportionality of <tex>C_{\max}</tex> and <tex>\mathrm{AUC}_{0-\tau}</tex> on day 14 is assessed with the
power model, fitted by linear regression of the log-transformed parameter on log-transformed dose:</p>
<tex display>\ln(\mathrm{PK}) = \alpha + \beta \cdot \ln(\mathrm{Dose}) + \varepsilon</tex>
<p>Dose proportionality is concluded if the 90 % confidence interval of <tex>\beta</tex> lies within the critical
range derived from the dose span <tex>r = 300/25 = 12</tex>:</p>
<tex display>1 + \frac{\ln(0.8)}{\ln(r)} \leq \beta \leq 1 + \frac{\ln(1.25)}{\ln(r)}</tex>
<p>The relationship between plasma concentration and factor XI activity is described with an inhibitory
<tex>E_{\max}</tex> model:</p>
<tex display>E(C) = E_{0} \cdot \left(1 - \frac{I_{\max} \cdot C^{\gamma}}{\mathrm{IC}_{50}^{\gamma} + C^{\gamma}}\right)</tex>
<p>Geometric means and the geometric coefficient of variation are reported for all exposure parameters:</p>
<tex display>\mathrm{CV}_{\mathrm{geo}} = 100 \cdot \sqrt{e^{s^{2}} - 1}</tex>
<p>The sample size of 18 active and 6 placebo subjects per cohort is not based on a formal power calculation and is
customary for multiple ascending dose studies. With 18 subjects on active treatment, an adverse event with a true
incidence of 15 % will be observed at least once with a probability of</p>
<tex display>P = 1 - (1 - 0.15)^{18} = 0.95</tex>
<h2>7. Safety assessments</h2>
<p>Adverse events are recorded from the signature of informed consent until the end-of-study visit and coded with
MedDRA version 29.0. Bleeding events are classified as major, clinically relevant non-major or minor according to
ISTH criteria. Stopping rules: dosing in a cohort is stopped if one subject has a major bleeding or two subjects
have a clinically relevant non-major bleeding, if one serious adverse event is considered related, if two subjects
have ALT above 3 x ULN, or if two subjects have a QTcF increase of more than 60 ms from baseline.</p>
<p>Safety laboratory, coagulation parameters and ECGs are performed at screening, day -1, days 1, 2, 4, 7, 10, 14,
15, 17, 21, 28 and at the end-of-study visit. Continuous telemetry is recorded on days 1 and 14 from 1 hour before
to 24 hours after dosing.</p>
<h2>8. Ethics and data protection</h2>
<p>The study is conducted in accordance with the Declaration of Helsinki, ICH E6(R3) Good Clinical Practice, the
Swiss Human Research Act (HRA) and the Clinical Trials Ordinance (ClinO), Regulation (EU) No 536/2014 for the German
site, and the applicable data protection laws (revised Swiss Federal Act on Data Protection, GDPR). Subjects are
identified in all study documents only by their subject ID; the subject identification log linking the subject ID
to name and date of birth is kept exclusively at the site. The listing of initials below is used for source data
verification only and must not leave the investigator site file.</p>
<h2>9. Investigators and sites</h2>
<table class="grid">
<tr><th>Site</th><th>Centre</th><th>Principal investigator</th><th>Contact</th></tr>
${SITES.map((s) => `<tr><td>${s.no}</td><td>${s.centre}<br>${s.city}</td><td>${s.investigator}</td><td>${s.email}<br>${s.phone}</td></tr>`).join('\n')}
</table>
<p>Central laboratory: Labor Rheinsprung AG, 4051 Basel, contact Dr sc. nat. Simon Gutzwiller,
s.gutzwiller@rheinsprung-lab.example. Bioanalytical laboratory: Meridian Clinical Services GmbH.</p>
`,
    },
    {
      html: String.raw`
<h2>10. Schedule of assessments</h2>
<table class="grid">
<tr><th>Assessment</th><th>Screening (day -28 to -2)</th><th>Day -1</th><th>Days 1-14</th><th>Day 15-17</th><th>Day 21, 28</th><th>EOS (day 42)</th></tr>
<tr><td>Informed consent</td><td>x</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Inclusion and exclusion criteria</td><td>x</td><td>x</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Medical history, demography</td><td>x</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Physical examination</td><td>x</td><td>x</td><td>days 1, 7, 14</td><td>day 15</td><td>x</td><td>x</td></tr>
<tr><td>Vital signs</td><td>x</td><td>x</td><td>daily</td><td>x</td><td>x</td><td>x</td></tr>
<tr><td>12-lead ECG (triplicate)</td><td>x</td><td>x</td><td>days 1, 4, 7, 14</td><td>x</td><td>x</td><td>x</td></tr>
<tr><td>Telemetry</td><td></td><td></td><td>days 1, 14</td><td></td><td></td><td></td></tr>
<tr><td>Haematology, chemistry, urinalysis</td><td>x</td><td>x</td><td>days 2, 4, 7, 10, 14</td><td>x</td><td>x</td><td>x</td></tr>
<tr><td>Coagulation (aPTT, PT, fibrinogen)</td><td>x</td><td>x</td><td>days 1, 2, 4, 7, 10, 14</td><td>x</td><td>x</td><td>x</td></tr>
<tr><td>Factor XI activity</td><td>x</td><td>x</td><td>days 1, 14 (serial), trough</td><td>x</td><td>x</td><td></td></tr>
<tr><td>PK blood sampling</td><td></td><td></td><td>days 1, 14 (serial), trough</td><td>x</td><td>x</td><td></td></tr>
<tr><td>Urine collection for metabolites</td><td></td><td>x</td><td>day 14 (0-24 h)</td><td></td><td></td><td></td></tr>
<tr><td>Study drug administration</td><td></td><td></td><td>once daily</td><td></td><td></td><td></td></tr>
<tr><td>Adverse events, concomitant medication</td><td>x</td><td>x</td><td>continuous</td><td>x</td><td>x</td><td>x</td></tr>
</table>
<h2>11. Investigational product</h2>
<p>VLM-417 is supplied as film-coated tablets of 25 mg (batch VLM-T25-2604) and 75 mg (batch VLM-T75-2605) with
matching placebo tablets (batch PLC-2606), packed in blinded child-resistant blisters by the sponsor's packaging
partner. Storage below 25 °C. The 150 mg dose is given as two 75 mg tablets, the 300 mg dose as four 75 mg tablets;
the placebo arm receives the matching number of placebo tablets. Tablets are taken with 240 ml water in the
morning after an overnight fast of at least 10 hours, except on day 14 in cohort B (high-fat breakfast).</p>
<h2>12. Contacts for urgent safety matters</h2>
<p>Serious adverse events must be reported within 24 hours to the drug safety unit of Meridian Clinical Services
GmbH, safety@meridian-cs.example, fax +41 61 555 70 98, and to the medical monitor Dr Katrin Vogt. Unblinding is
possible around the clock through the IWRS of the CRO. The sponsor's study leader Dr Achermann is informed by the
CRO.</p>
<h2>Appendix A. Subject listing (initials for source data verification only)</h2>
${subjectTable(chunks(SUBJECTS, 30)[0])}
`,
    },
    ...chunks(SUBJECTS, 30).slice(1).map((rows, i) => ({
      html: `<h2>Appendix A. Subject listing (continued, page ${i + 2})</h2>\n${subjectTable(rows)}`,
    })),
    ...chunks(PK_SUBJECTS, 34).map((rows, i) => ({
      html: String.raw`<h2>Appendix B. Individual pharmacokinetic parameters, day 1${i ? ' (continued)' : ''}</h2>
<p>Preliminary non-compartmental results of subjects on active treatment with complete profiles. Cmax and AUC are
expressed in ng/ml and ng·h/ml; <tex>\mathrm{CL}/F</tex> in l/h.</p>
${pkTable(rows, i * 34)}`,
    })),
    {
      html: String.raw`
<h2>Protocol approval</h2>
<p>By signing, the sponsor representatives and the coordinating investigator confirm the protocol version 3.0 of
14 July 2026.</p>
<table class="grid">
<tr><th>Role</th><th>Name</th><th>Date</th></tr>
<tr><td>Clinical Study Leader, sponsor</td><td>Dr Helen Achermann</td><td>14.07.2026</td></tr>
<tr><td>Head of Clinical Pharmacology, sponsor</td><td>Dr Marc-Olivier Rapin</td><td>14.07.2026</td></tr>
<tr><td>Medical monitor</td><td>Dr med. Katrin Vogt</td><td>15.07.2026</td></tr>
<tr><td>Coordinating investigator</td><td>Prof. Dr med. Ursula Brändli</td><td>17.07.2026</td></tr>
</table>
<div class="as-image signature">H. Achermann &nbsp;&nbsp; M.-O. Rapin &nbsp;&nbsp; K. Vogt &nbsp;&nbsp; U. Brändli</div>
`,
    },
  ],
  values: [
    { text: 'Valmora Therapeutics AG', category: 'COMPANY' },
    { text: 'VALMORA THERAPEUTICS AG', category: 'COMPANY' },
    { text: 'Hochbergerstrasse 60', category: 'ADDRESS' },
    { text: '4057 Basel', category: 'ADDRESS' },
    { text: 'Helen Achermann', category: 'PERSON' },
    { text: 'HELEN ACHERMANN', category: 'PERSON' },
    { text: 'Dr Achermann', category: 'PERSON' },
    { text: 'H. Achermann', category: 'PERSON' },
    { text: 'helen.achermann@valmora.example', category: 'EMAIL' },
    { text: '+41 61 555 70 14', category: 'PHONE' },
    { text: 'Katrin Vogt', category: 'PERSON' },
    { text: 'K. Vogt', category: 'PERSON' },
    { text: 'katrin.vogt@valmora.example', category: 'EMAIL' },
    { text: '+41 61 555 70 99', category: 'PHONE' },
    { text: '+41 61 555 70 98', category: 'PHONE' },
    { text: 'Meridian Clinical Services GmbH', category: 'COMPANY' },
    { text: 'Jonas Frei', category: 'PERSON' },
    { text: 'jonas.frei@meridian-cs.example', category: 'EMAIL' },
    { text: 'safety@meridian-cs.example', category: 'EMAIL' },
    { text: 'U. Brändli', category: 'PERSON' },
    { text: 'Labor Rheinsprung AG', category: 'COMPANY' },
    { text: '4051 Basel', category: 'ADDRESS' },
    { text: 'Simon Gutzwiller', category: 'PERSON' },
    { text: 's.gutzwiller@rheinsprung-lab.example', category: 'EMAIL' },
    { text: 'Marc-Olivier Rapin', category: 'PERSON' },
    { text: 'M.-O. Rapin', category: 'PERSON' },
    ...SITE_VALUES,
    ...SUBJECT_VALUES,
  ],
  keep: ['VLM-417', 'factor XIa inhibitor', 'Cmax', 'AUC0-inf', 'aPTT', 'ISTH criteria', 'ICH E6(R3)', 'MedDRA version 29.0',
    'Clinical Trials Ordinance (ClinO)', 'linear-up log-down trapezoidal method', 'CYP3A4', 'QTcF', 'VLM417-102'],
};
