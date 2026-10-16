// Synthetic documents written during a detection campaign (2026-10-16), each before any detector saw it, and
// kept because they guard a fix: names in capitals and double names, IDs in court tables and file names, keys
// in config files, lab reference ranges, relatives' names. All names, numbers and addresses are invented,
// domains are .example, IP addresses are from the documentation ranges and the AHV numbers are example numbers.
export const GENERATED_DOCUMENTS = [
  {
    id: 'r1-patient-list-csv-de',
    language: 'de',
    text: `PatNr;Name;Vorname;Geburtsdatum;AHV;Telefon;Hausarzt;Diagnose
P-104233;von Gunten;Ursula;12.03.1947;756.3047.5821.03;031 555 12 40;Dr. M. Zwahlen;Herzinsuffizienz NYHA II
P-104234;Di Stefano;Giuseppe;01.11.1952;756.8899.1234.56;+41 79 555 66 77;Dr. M. Zwahlen;COPD GOLD 3
P-104235;Schärer-Leuenberger;Anna-Barbara;23.07.1960;756.1122.3344.55;062 555 98 10;Dr. K. Oberli;Diabetes mellitus Typ 2
P-104236;Nguyen;Thi Lan;30.05.1971;756.6677.8899.00;076 555 31 22;Dr. K. Oberli;Hypertonie
P-104237;MÜLLER;HANS-PETER;14.09.1939;756.2468.1357.90;033 555 70 70;Dr. M. Zwahlen;Vorhofflimmern
`,
    mustHide: [
      'P-104233', 'von Gunten', 'Ursula', '12.03.1947', '756.3047.5821.03', '031 555 12 40', 'M. Zwahlen', 'Zwahlen', 'P-104234', 'Di Stefano', 'Giuseppe',
      '01.11.1952', '756.8899.1234.56', '+41 79 555 66 77', 'P-104235', 'Schärer-Leuenberger', 'Anna-Barbara', '23.07.1960', '756.1122.3344.55',
      '062 555 98 10', 'K. Oberli', 'Oberli', 'P-104236', 'Nguyen', 'Thi Lan', '30.05.1971', '756.6677.8899.00', '076 555 31 22', 'P-104237', 'MÜLLER',
      'HANS-PETER', '14.09.1939', '756.2468.1357.90', '033 555 70 70',
    ],
    mustKeep: [
      'Herzinsuffizienz NYHA II', 'COPD GOLD 3', 'Diabetes mellitus Typ 2', 'Hypertonie', 'Vorhofflimmern', 'Geburtsdatum',
    ],
  },
  {
    id: 'r1-auth-log-en',
    language: 'en',
    text: `2026-10-15T07:02:11.204Z INFO  auth-service[2231]: login ok user=kschneider src=198.51.100.77 ua="Mozilla/5.0"
2026-10-15T07:02:15.881Z WARN  auth-service[2231]: failed login user=m.dubois@lexpartners.example src=203.0.113.9 attempts=3
2026-10-15T07:03:02.010Z INFO  api-gw[118]: GET /api/v2/clients/4471-ZRH/files?owner=petra.vogel 200 34ms
2026-10-15T07:03:44.552Z ERROR billing[901]: Stripe call failed: key=sk_live_51HxEXAMPLEq8Zt2mN0pQrS7 customer=cus_Q8xT2EXAMPLE9
2026-10-15T07:04:10.003Z DEBUG db[77]: connect host=pg-mandanten-01.kanzlei.internal user=app_rw password=Wint3r!Sonne2026
2026-10-15T07:05:00.120Z INFO  mailer[45]: sent "Ihre Akte 2026-ZH-0193" to rolf.baumgartner@bluewin.example (client_id=88213)
2026-10-15T07:05:02.777Z INFO  auth-service[2231]: session created sid=9f8e7d6c5b4a39281706f5e4d3c2b1a0 for user=kschneider
2026-10-15T07:06:19.400Z WARN  vpn[12]: new device mac=3C:22:FB:9A:10:7E hostname=LAPTOP-RBAUMGARTNER ip=192.0.2.141
`,
    mustHide: [
      'kschneider', '198.51.100.77', 'm.dubois@lexpartners.example', '203.0.113.9', '4471-ZRH', 'petra.vogel', 'sk_live_51HxEXAMPLEq8Zt2mN0pQrS7',
      'cus_Q8xT2EXAMPLE9', 'pg-mandanten-01.kanzlei.internal', 'Wint3r!Sonne2026', '2026-ZH-0193', 'rolf.baumgartner@bluewin.example', '88213',
      '9f8e7d6c5b4a39281706f5e4d3c2b1a0', '3C:22:FB:9A:10:7E', 'LAPTOP-RBAUMGARTNER', '192.0.2.141',
    ],
    mustKeep: [
      'auth-service', 'failed login', 'api-gw', 'session created', 'new device',
    ],
  },
  {
    id: 'r1-court-decision-de',
    language: 'de',
    text: `Obergericht des Kantons Bern
Zivilabteilung

Urteil vom 2. Oktober 2026
Geschäftsnummer ZK 26 318

Parteien
A.________ GmbH, Postfach 220, 3001 Bern,
vertreten durch Rechtsanwältin lic. iur. Simone Häfliger, Advokatur Bärenplatz, Bärenplatz 2, 3011 Bern,
Klägerin und Berufungsklägerin

gegen

Bruno Wüthrich-Studer, geboren am 7. Mai 1966, Oberdorf 14, 3612 Steffisburg,
vertreten durch Fürsprecher Dr. iur. Kaspar von Steiger, c/o Kanzlei Steiger & Partner, Thunstrasse 5, 3005 Bern,
Beklagter und Berufungsbeklagter

Gegenstand
Forderung aus Werkvertrag

Sachverhalt
A. Die Klägerin führte im Auftrag von Herrn Wüthrich im Jahr 2024 Malerarbeiten an dessen Liegenschaft aus. Mit Rechnung Nr. 2024-0877 forderte sie CHF 38'400.00.
B. Der Beklagte bestritt die Forderung unter Hinweis auf Mängel. Der Gutachter, Architekt Reto Glauser, bestätigte am 3. März 2025 einzelne Mängel.

Das Obergericht erwägt:
1. Die Berufung ist zulässig (Art. 308 ZPO).
`,
    mustHide: [
      'Simone Häfliger', 'Advokatur Bärenplatz', 'Bruno Wüthrich-Studer', '7. Mai 1966', 'Oberdorf 14', '3612 Steffisburg', 'Kaspar von Steiger',
      'Steiger & Partner', 'Thunstrasse 5', 'Wüthrich', 'Reto Glauser', 'ZK 26 318', '2024-0877', 'Postfach 220',
    ],
    mustKeep: [
      'Forderung aus Werkvertrag', 'Art. 308 ZPO', 'Klägerin und Berufungsklägerin', 'Malerarbeiten',
    ],
  },
  {
    id: 'r1-lab-report-it',
    language: 'it',
    text: `LABORATORIO ANALISI MEDICHE TICINO SA
Via Ciseri 22, 6600 Locarno - Tel. 091 555 72 00

REFERTO N. LAB-2026-118734
Paziente: BERNASCONI-TETTAMANTI Lucia
Data di nascita: 09/12/1979   Sesso: F
N. paziente: 0045821
Medico richiedente: Dott. Fabrizio Lurati, Studio medico Minusio

Esame                Risultato   Unità     Valori di riferimento
Emoglobina           11.2        g/dL      12.0 - 16.0
Ferritina            8           µg/L      15 - 150
TSH                  2.1         mU/L      0.4 - 4.0
Creatinina           68          µmol/L    45 - 90

Commento: anemia sideropenica, si consiglia controllo tra 3 mesi.
Validato da: Dr.ssa Chiara Pellandini, FAMH
`,
    mustHide: [
      'LAB-2026-118734', 'BERNASCONI-TETTAMANTI', 'Lucia', '09/12/1979', '0045821', 'Fabrizio Lurati', 'Chiara Pellandini', 'Studio medico Minusio',
    ],
    mustKeep: [
      'Emoglobina', 'Ferritina', 'TSH', 'Creatinina', 'anemia sideropenica', 'Valori di riferimento', 'FAMH', '12.0 - 16.0',
    ],
  },
  {
    id: 'r1-config-yaml',
    language: 'en',
    text: `# deployment config for the client portal (Kanzlei Frei Ammann)
app:
  name: mandantenportal
  admin_email: thomas.frei@frei-ammann.example
  support_phone: "+41 44 555 81 00"
database:
  url: postgresql://portal_admin:Pf8!qLz2xR@10.20.30.40:5432/mandanten
  backup_host: nas-backup.frei-ammann.example
smtp:
  user: noreply@frei-ammann.example
  password: "kL9#vB2!mQ"
integrations:
  openai_api_key: sk-EXAMPLEa1B2c3D4e5F6g7H8i9J0kLmN
  github_token: ghp_EXAMPLE16C7e42F292c6912E7710c838347Ae178B4a
  aws_access_key_id: AKIAIOSFODNN7EXAMPLE
  aws_secret_access_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
`,
    mustHide: [
      'Frei Ammann', 'thomas.frei@frei-ammann.example', '+41 44 555 81 00', 'Pf8!qLz2xR', '10.20.30.40', 'nas-backup.frei-ammann.example',
      'noreply@frei-ammann.example', 'kL9#vB2!mQ', 'sk-EXAMPLEa1B2c3D4e5F6g7H8i9J0kLmN', 'ghp_EXAMPLE16C7e42F292c6912E7710c838347Ae178B4a',
      'AKIAIOSFODNN7EXAMPLE', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    ],
    mustKeep: [
      'deployment config', 'database:', 'integrations:', 'backup_host',
    ],
  },
  {
    id: 'r2-invoice-it',
    language: 'it',
    text: `FATTURA N. 2026/0458 del 10/10/2026

Studio Legale Avv. Roberta Fumagalli
Corso Venezia 18, 20121 Milano
P.IVA 01234567890 - C.F. FMGRRT80A41F205X
PEC: r.fumagalli@pec.studiofumagalli.example

Cliente: Sig. Alessandro Colombo
Via dei Mille 7, 24121 Bergamo
Codice fiscale: CLMLSN72C15A794K

Descrizione                                   Importo
Assistenza legale pratica n. 2026-CIV-0193    EUR 2.400,00
Spese di cancelleria                          EUR    85,00
IVA 22%                                       EUR   546,70
Totale                                        EUR 3.031,70

Pagamento entro 30 giorni su IBAN IT60 X054 2811 1010 0000 0123 456
`,
    mustHide: [
      'Roberta Fumagalli', 'Corso Venezia 18', '01234567890', 'FMGRRT80A41F205X', 'r.fumagalli@pec.studiofumagalli.example', 'Alessandro Colombo',
      'Via dei Mille 7', 'CLMLSN72C15A794K', '2026-CIV-0193', 'IT60 X054 2811 1010 0000 0123 456', 'Studio Legale Avv. Roberta Fumagalli',
    ],
    mustKeep: [
      'Spese di cancelleria', 'IVA 22%', 'Pagamento entro 30 giorni', 'Assistenza legale',
    ],
  },
  {
    id: 'r2-hr-record-uk',
    language: 'en',
    text: `EMPLOYEE RECORD - STRICTLY CONFIDENTIAL

Name: Oluwaseun ADEYEMI-CLARKE
Preferred name: Seun
DOB: 4 July 1988
National Insurance No: QQ 12 34 56 C
Passport: 533401287 (GBR)
Address: Flat 4, 27 Holloway Road, London N7 8JG
Mobile: 07700 900481
NHS number: 943 476 5919
Bank: sort code 20-45-77, account 41093827

Line manager: Gwendolyn Price-Hughes
Sickness absence 2026: 6 days (lower back pain, GP note from Dr Rajesh Venkataraman)
Disciplinary: none
`,
    mustHide: [
      'Oluwaseun ADEYEMI-CLARKE', 'Seun', '4 July 1988', 'QQ 12 34 56 C', '533401287', '27 Holloway Road', 'N7 8JG', '07700 900481', '943 476 5919',
      '20-45-77', '41093827', 'Gwendolyn Price-Hughes', 'Rajesh Venkataraman',
    ],
    mustKeep: [
      'lower back pain', 'Sickness absence', 'Disciplinary: none', 'EMPLOYEE RECORD',
    ],
  },
  {
    id: 'r3-markdown-case-table',
    language: 'de',
    text: `## Fristenkontrolle KW 42

| Mandant | Gegenpartei | Aktenzeichen | Frist | Verantwortlich |
|---|---|---|---|---|
| Elektro Wyss GmbH | Baukonsortium Seepark | HG250117-O | 19.10.2026 | lic. iur. Mirjam Eggenberger |
| Fam. Oppliger (Peter + Ruth) | Gemeinde Wohlen | VB.2026.00321 | 21.10.2026 | MLaw Dario Pfister |
| Nikola Petrović | Securitas Direct AG | 4A_512/2026 | 23.10.2026 | Mirjam Eggenberger |
| Stiftung Sonnenhalde | Kanton Aargau, Steueramt | WBE.2026.144 | 30.10.2026 | Dr. iur. Beat Ritschard |

Bemerkung: Petrović hat neue Adresse: Bachstrasse 4a, 5600 Lenzburg.
`,
    mustHide: [
      'Elektro Wyss GmbH', 'Baukonsortium Seepark', 'HG250117-O', 'Mirjam Eggenberger', 'Oppliger', 'Peter', 'Ruth', 'VB.2026.00321', 'Dario Pfister',
      'Nikola Petrović', 'Petrović', '4A_512/2026', 'Stiftung Sonnenhalde', 'WBE.2026.144', 'Beat Ritschard', 'Bachstrasse 4a',
    ],
    mustKeep: [
      'Fristenkontrolle KW 42', 'Aktenzeichen', 'Verantwortlich', 'Bemerkung',
    ],
  },
  {
    id: 'r3-police-report-de',
    language: 'de',
    text: `Kantonspolizei Solothurn, Posten Grenchen
Rapport Nr. 2026/GR/0817

Am 11.10.2026 um 22:40 Uhr wurde der Lenker des Personenwagens SO 77 312, Herr Dominik Kunz-Meier, am 3. März 1985 geboren, wohnhaft Lindenweg 6, 2540 Grenchen, einer Kontrolle unterzogen. Ausweis: Identitätskarte Nr. E4821937.
Beifahrerin war seine Partnerin, die 34-jährige Selina Hostettler.
Der Atemalkoholtest ergab 0.61 mg/l. Ort der Kontrolle: Solothurnstrasse, Koordinaten 47.1907, 7.3958.
Ein weiterer Wagen (deutsches Kennzeichen LÖ-KM 482) hielt kurz an; Fahrer unbekannt.
Sachbearbeiter: Wm Patrick Born, Tel. 032 555 18 80
`,
    mustHide: [
      '2026/GR/0817', 'SO 77 312', 'Dominik Kunz-Meier', '3. März 1985', 'Lindenweg 6', 'E4821937', 'Selina Hostettler', '47.1907, 7.3958', 'LÖ-KM 482',
      'Patrick Born', '032 555 18 80',
    ],
    mustKeep: [
      'Atemalkoholtest', '0.61 mg/l', 'Kontrolle unterzogen',
    ],
  },
  {
    id: 'r5-letter-fr-allcaps',
    language: 'fr',
    text: `ÉTUDE BERSET-RAPIN & ASSOCIÉS
MAÎTRE CLAUDINE BERSET-RAPIN, AVOCATE
Rue de Lausanne 64, 1700 Fribourg

Monsieur
Joël Clerc
Route de la Glâne 120
1752 Villars-sur-Glâne

Fribourg, le 9 octobre 2026

Concerne : votre accident du 4 avril 2026 - sinistre n° 26.04.117.33

Monsieur,

Me Berset-Rapin m'a chargée de vous informer que l'assurance Mutuelle Romande a accepté de prendre en charge les frais de votre physiothérapeute, Mme Laetitia Mauron.
Votre employeur, la Menuiserie Clerc Frères SA, recevra une copie de ce courrier.

Veuillez agréer, Monsieur, nos salutations distinguées.

p.o. Sandrine Aebischer, secrétaire
`,
    mustHide: [
      'BERSET-RAPIN', 'CLAUDINE BERSET-RAPIN', 'Rue de Lausanne 64', 'Joël Clerc', 'Route de la Glâne 120', '1752 Villars-sur-Glâne', '26.04.117.33',
      'Berset-Rapin', 'Laetitia Mauron', 'Menuiserie Clerc Frères SA', 'Sandrine Aebischer',
    ],
    mustKeep: [
      'physiothérapeute', 'salutations distinguées', 'prendre en charge les frais',
    ],
  },
  {
    id: 'r5-it-ticket-mixed',
    language: 'en',
    text: `Ticket #HD-58213 | Priority: High | Requester: Michael Keller (Kanzlei Keller & Bühler)

Hallo IT-Support,
mein Laptop PC-MKELLER-01 startet nicht mehr. Wichtig ist vor allem die Datei C:\\Users\\mkeller\\Documents\\Mandate\\Scheidung_Wenger_Rosa.docx.
Letztes Backup lief auf \\\\nas01\\backup\\mkeller am Freitag.

Tech notes (Rafael Costa):
- Device: Lenovo T14, S/N PF3EXAMPLE, MAC 98-FA-9B-12-34-56, last IP 192.0.2.58
- User SID S-1-5-21-3623811015-3361044348-30300820-1013
- BitLocker recovery key: 412357-031542-678902-345611-210984-563201-887766-129034
- Called user on 044 555 98 76, he will bring the device tomorrow.
`,
    mustHide: [
      'HD-58213', 'Michael Keller', 'Keller & Bühler', 'PC-MKELLER-01', 'mkeller', 'Scheidung_Wenger_Rosa', 'Rafael Costa', 'PF3EXAMPLE',
      '98-FA-9B-12-34-56', '192.0.2.58', 'S-1-5-21-3623811015-3361044348-30300820-1013', '412357-031542-678902-345611-210984-563201-887766-129034',
      '044 555 98 76',
    ],
    mustKeep: [
      'startet nicht mehr', 'Lenovo T14', 'BitLocker recovery key', 'Priority: High',
    ],
  },
  {
    id: 'r6-lab-results-de',
    language: 'de',
    text: `Zentrallabor Kantonsspital Seetal
Patient: Gisler, Brigitte, *09.06.1951, Fall-Nr. 26-0417733
Auftraggeber: Dr. med. P. Arnold, Station 4B

Parameter          Resultat   Einheit        Referenz
Natrium            141        mmol/l         135 - 145
Kalium             5.6 H      mmol/l         3.5 - 5.1
Kreatinin          112 H      µmol/l         45 - 84
eGFR (CKD-EPI)     41         ml/min/1.73m²  > 60
CRP                38 H       mg/l           < 5
Hämoglobin         118 L      g/l            120 - 160
Leukozyten         11.4 H     G/l            3.5 - 10.0
Thrombozyten       388        G/l            150 - 400

Befund telefonisch an Dr. Arnold übermittelt, 14.10.2026 10:42 (Visum: MKU)
`,
    mustHide: [
      'Gisler', 'Brigitte', '09.06.1951', '26-0417733', 'P. Arnold', 'Arnold',
    ],
    mustKeep: [
      '135 - 145', '3.5 - 5.1', '45 - 84', 'ml/min/1.73m²', '120 - 160', '3.5 - 10.0', '150 - 400', 'Kreatinin', 'Thrombozyten', 'Station 4B',
    ],
  },
  {
    id: 'r9-dataroom-index-en',
    language: 'en',
    text: `Data room index - Project Edelweiss (target: Alpine Precision Holding AG)

01_Corporate/01.03_Shareholders_Agreement_Mueller_Brandenberger_2019.pdf
02_Employees/02.01_Employment_Contract_CEO_Stefan_Brandenberger.pdf
02_Employees/02.04_Severance_Agreement_Carla_Imhof_signed.pdf
03_IP/03.02_Patent_CH712345_Valve_Assembly.pdf
04_Litigation/04.01_Claim_Hostettler_vs_APH_Commercial_Court_HG230045.pdf
Q&A log: question 47 (asked by Nathalie Brunner, Northbridge Partners): "Is the claim by Mr. Hostettler covered by D&O insurance?"
`,
    mustHide: [
      'Project Edelweiss', 'Alpine Precision Holding AG', 'Mueller_Brandenberger', 'Stefan_Brandenberger', 'Carla_Imhof', 'Hostettler', 'HG230045',
      'Nathalie Brunner', 'CH712345',
    ],
    mustKeep: [
      'Shareholders_Agreement', 'Employment_Contract_CEO', 'Severance_Agreement', 'D&O insurance', 'Data room index',
    ],
  },
  {
    id: 'r10-divorce-agreement-de',
    language: 'de',
    text: `Scheidungskonvention

zwischen Andrea Hänni-Rufer, geb. 14.07.1984, Bürgerin von Langnau i.E., wohnhaft Bernstrasse 41, 3550 Langnau im Emmental
und Simon Hänni, geb. 02.02.1982, Bürger von Trub, wohnhaft Dorfplatz 3, 3555 Trubschachen

1. Die Kinder Elin Hänni (geb. 30.05.2015) und Noel Hänni (geb. 11.11.2018) werden unter die gemeinsame elterliche Sorge gestellt.
2. Die Obhut über die Tochter Elin und den Sohn Noel wird der Mutter zugeteilt. Der Vater hat das Recht, die Kinder jedes zweite Wochenende zu sich zu nehmen.
3. Der Vater bezahlt an den Unterhalt der Kinder monatlich CHF 1'250.- pro Kind. Die Mutter gibt dem Sohn Bescheid, wenn sich etwas ändert.
4. Die Liegenschaft Dorfplatz 3 (Grundbuch Trubschachen Nr. 788) geht zu Alleineigentum an Simon Hänni.
`,
    mustHide: [
      'Andrea Hänni-Rufer', '14.07.1984', 'Bernstrasse 41', '3550 Langnau im Emmental', 'Simon Hänni', '02.02.1982', 'Dorfplatz 3', '3555 Trubschachen',
      'Elin Hänni', '30.05.2015', 'Noel Hänni', '11.11.2018', 'Elin', 'Noel', '788', 'Hänni',
    ],
    mustKeep: [
      'gemeinsame elterliche Sorge', 'jedes zweite Wochenende', "CHF 1'250.- pro Kind", 'Die Mutter gibt dem Sohn Bescheid', 'zu Alleineigentum',
    ],
  },
  {
    id: 'r12-school-report-de',
    language: 'de',
    text: `Schulpsychologischer Dienst Kanton Schaffhausen - Abklärungsbericht

Schüler: Luca Stamm, geb. 17.01.2016, 4. Klasse, Schulhaus Breite, Lehrperson: Frau Désirée Ritzmann
Eltern: Sonja und Mario Stamm-Ferrara, Hohlenbaumstrasse 50, 8200 Schaffhausen

Fragestellung: Abklärung Lese-Rechtschreibstörung.
Ergebnisse: SLRT-II Lesegeschwindigkeit PR 8, Rechtschreibung HSP PR 5; nonverbale Intelligenz (CFT 20-R) IQ 104.
Empfehlung: Nachteilsausgleich gemäss kantonalem Leitfaden, Logopädie bei Frau Ladina Caduff.

Schulpsychologin: lic. phil. Rebekka Hauser
`,
    mustHide: [
      'Luca Stamm', '17.01.2016', 'Désirée Ritzmann', 'Sonja und Mario Stamm-Ferrara', 'Stamm-Ferrara', 'Hohlenbaumstrasse 50', '8200 Schaffhausen',
      'Ladina Caduff', 'Rebekka Hauser',
    ],
    mustKeep: [
      'Lese-Rechtschreibstörung', 'SLRT-II Lesegeschwindigkeit PR 8', 'Rechtschreibung HSP PR 5', 'CFT 20-R) IQ 104', 'Nachteilsausgleich',
    ],
  },
];
