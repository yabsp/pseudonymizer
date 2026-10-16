// Synthetic documents of the app's users (doctors, lawyers, consultants); names, numbers and addresses are
// invented, domains are .example and the AHV numbers are example numbers. mustHide must not be visible in
// the prompt that is sent; mustKeep (optional) must reach the model unchanged.
import { GENERATED_DOCUMENTS } from './generated-documents.mjs';

// No spaces inside a row: for GLiNER every comma, dot and @ is a word (19 per row), and it reads at most 384.
const CSV_FIRST = ['James', 'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'William', 'Sophia', 'Mason', 'Isabella'];
const CSV_LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const CSV_DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'IT', 'Customer Support'];
const CSV_STATUS = ['Active', 'Active', 'On Leave', 'Active', 'Terminated'];
export const CSV_PEOPLE = CSV_FIRST.flatMap((first) => CSV_LAST.map((last) => `${first},${last}`));
export const CSV_EXPORT = ['id,first_name,last_name,email,department,status,join_date', ...CSV_PEOPLE.map((name, i) => {
  const [first, last] = name.split(',');
  const date = `20${16 + (i % 8)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`;
  return `${i + 1},${name},${first.toLowerCase()}.${last.toLowerCase()}@example.com,${CSV_DEPARTMENTS[i % 7]},${CSV_STATUS[i % 5]},${date}`;
})].join('\n') + '\n';

export const DOCUMENTS = [
  {
    id: 'medical-discharge-letter-de',
    language: 'de',
    text: `Klinik Seeblick AG, Innere Medizin
Seestrasse 101, 8800 Thalwil

Austrittsbericht

Patient: Herr Reto Ammann, geb. 14.02.1961
AHV-Nr.: 756.1234.5678.97
Adresse: Dorfstrasse 7, 8932 Mettmenstetten
Versichertennummer: 80756 0001 2345 678
Hausärztin: Dr. med. Corinne Bachmann, Praxis am Bahnhof, Tel. 044 555 22 33

Sehr geehrte Frau Kollegin Bachmann

Wir berichten über die Hospitalisation von Herrn Ammann vom 02.09.2026 bis 09.09.2026.

Diagnosen
1. NSTEMI bei koronarer 3-Gefässerkrankung
2. Diabetes mellitus Typ 2, HbA1c 8.1 %

Herr Ammann wurde von seiner Tochter, Simone Ammann-Keller (simone.ammann@example.com, 079 555 88 10), begleitet. Die Tochter ist bevollmächtigt, Auskünfte zu erhalten.

Procedere: Kontrolle in der kardiologischen Sprechstunde bei Dr. med. Lukas Steiner in 6 Wochen.

Freundliche Grüsse

Dr. med. Lukas Steiner
Oberarzt Kardiologie
lukas.steiner@klinik-seeblick.example
`,
    mustHide: [
      'Klinik Seeblick', 'Reto Ammann', 'Ammann', '14.02.1961', '756.1234.5678.97', 'Dorfstrasse 7',
      '8932 Mettmenstetten', '80756 0001 2345 678', 'Corinne Bachmann', 'Bachmann', '044 555 22 33',
      'Simone Ammann-Keller', 'simone.ammann@example.com', '079 555 88 10', 'Lukas Steiner',
      'lukas.steiner@klinik-seeblick.example',
    ],
  },
  {
    id: 'court-letter-fr',
    language: 'fr',
    text: `Étude Favre & Rochat, avocats
Rue du Rhône 42, 1204 Genève

Genève, le 3 octobre 2026

Par recommandé
Tribunal de première instance
Case postale 3736, 1211 Genève 3

Cause C/18342/2026 - Jean-Luc Perret c/ Immobilière Lémanique SA

Monsieur le Président,

Au nom de mon mandant, M. Jean-Luc Perret, né le 21 juin 1975, domicilié chemin des Crêts 15, 1218 Le Grand-Saconnex, je conclus au rejet de la requête déposée par Immobilière Lémanique SA le 12 septembre 2026.

M. Perret a versé le loyer de CHF 2'450.- sur le compte IBAN CH56 0483 5012 3456 7800 9 de la bailleresse. Les témoins Nadia Haddad et Pierre-Alain Chevalley pourront le confirmer.

Je vous prie d'agréer, Monsieur le Président, mes salutations distinguées.

Me Claire Rochat
claire.rochat@favre-rochat.example
+41 22 555 01 90
`,
    mustHide: [
      'Favre & Rochat', 'Jean-Luc Perret', 'Perret', '21 juin 1975', 'chemin des Crêts 15',
      '1218 Le Grand-Saconnex', 'Immobilière Lémanique SA', 'C/18342/2026', 'CH56 0483 5012 3456 7800 9',
      'Nadia Haddad', 'Pierre-Alain Chevalley', 'Claire Rochat', 'claire.rochat@favre-rochat.example',
      '+41 22 555 01 90',
    ],
  },
  {
    id: 'consulting-incident-email-en',
    language: 'en',
    text: `From: Daniel Hofer <daniel.hofer@northwind-consulting.example>
To: Priya Raman <p.raman@helvetic-insure.example>
Cc: Marco Rossi <marco.rossi@helvetic-insure.example>
Subject: Project Falcon - failed claims migration (INC-20419)

Hi Priya,

as discussed with Marco yesterday, the nightly ETL for Helvetic Insure failed again at 02:13.
The job log shows the connection string it used:

    postgres://etl_user:Kx9vR2pQ77@db-prod-03.helvetic.internal:5432/claims

Please rotate that password and the API key in config/prod.env (sk-proj-7f3kQ9xEXAMPLE2mZ8vT4) today.
Server 10.42.7.15 refused connections from our VPN range 192.0.2.0/24.

I'm in Zurich until Friday, call me at +41 76 555 18 42 if anything is unclear.

Best,
Daniel Hofer
Senior Consultant, Northwind Consulting
`,
    mustHide: [
      'Daniel Hofer', 'daniel.hofer@northwind-consulting.example', 'Priya Raman', 'Priya',
      'p.raman@helvetic-insure.example', 'Marco Rossi', 'Marco', 'marco.rossi@helvetic-insure.example',
      'Falcon', 'INC-20419', 'Helvetic Insure', 'Kx9vR2pQ77', 'db-prod-03.helvetic.internal',
      'sk-proj-7f3kQ9xEXAMPLE2mZ8vT4', '10.42.7.15', '192.0.2.0', '+41 76 555 18 42', 'Northwind Consulting',
    ],
  },
  {
    id: 'trust-company-letter-it',
    language: 'it',
    text: `Spettabile avv. Marco Bernasconi,

le scrivo in merito alla signora Giulia Pedrazzini, nata il 05.05.1984 e residente in Via Cantonale 18, 6900 Lugano. La signora Pedrazzini è assicurata presso di noi con la polizza n. 4471-209-88.

Distinti saluti
Fiduciaria Ceresio SA
Laura Bianchi
`,
    mustHide: [
      'Marco Bernasconi', 'Giulia Pedrazzini', 'Pedrazzini', '05.05.1984', 'Via Cantonale 18', '6900 Lugano',
      '4471-209-88', 'Fiduciaria Ceresio SA', 'Laura Bianchi',
    ],
  },
  {
    id: 'hr-database-export-csv',
    language: 'en',
    text: CSV_EXPORT,
    // each name appears in ten rows, so one visible row fails the check
    mustHide: [...CSV_FIRST, ...CSV_LAST],
  },
  {
    id: 'pension-fund-letter-de',
    language: 'de',
    text: `Sehr geehrte Damen und Herren,

mit diesem Schreiben möchte ich Sie über einige wichtige Veränderungen in meiner aktuellen Lebenssituation informieren und Sie gleichzeitig bitten, mein Dossier entsprechend auf den neuesten Stand zu bringen. Wie Sie möglicherweise bereits durch den automatisierten Abgleich mit der Einwohnerkontrolle erfahren haben, bin ich im vergangenen Monat umgezogen. Ich bin nicht mehr im Kanton Basel-Landschaft wohnhaft, sondern habe meinen neuen Lebensmittelpunkt in die Hauptstadt verlegt. Meine neue Meldeadresse lautet Kramgasse 12, 3011 Bern. Ich bitte Sie, sämtliche zukünftige Korrespondenz, einschliesslich der jährlichen Kontoauszüge, ausschliesslich an diese Adresse zu senden.

Um sicherzustellen, dass meine Akte vollständig ist und bei einer späteren Rentenberechnung keine Lücken entstehen, möchte ich Sie zudem um eine Überprüfung meiner bisherigen Beitragszeiten bitten. Nach dem Abschluss meines Studiums war ich zunächst mehrere Jahre als Projektleiter bei der fiktiven Muster Engineering AG angestellt. In dieser Zeit wurden meine Beiträge stets pünktlich und vollumfänglich durch den Arbeitgeber abgeführt. Da es jedoch bei meinem letzten beruflichen Wechsel zu einer administrativen Verzögerung bei der Anmeldung kam, ist es mir ein Anliegen, dass Sie die Einträge, die unter meiner AHV-Nummer 756.9876.5432.10 verbucht sind, genau kontrollieren. Es ist für meine private Finanzplanung essenziell, dass hier keine Beitragsmonate fehlen, insbesondere da ich beabsichtige, in den kommenden zwei Jahren ein längeres, unbezahltes Sabbatical einzulegen.

Für eventuelle Rückfragen zu den von mir eingereichten Unterlagen oder falls weitere Formulare ausgefüllt werden müssen, stehe ich Ihnen selbstverständlich gerne zur Verfügung. Da ich tagsüber beruflich stark eingebunden und oft in Besprechungen bin, erreichen Sie mich am zuverlässigsten auf meinem Mobiltelefon. Meine Nummer lautet 079 555 12 34. Alternativ können Sie mir auch jederzeit unkompliziert eine E-Mail an lukas.meier@example.com senden; ich prüfe mein Postfach regelmässig. Zur eindeutigen Identifikation meiner Person und um den administrativen Prozess zu beschleunigen, habe ich diesem Schreiben eine Kopie meines aktuellen Reisepasses beigelegt. Falls Sie die Dokumentennummer direkt für die Aktualisierung Ihrer Datenbank benötigen: Sie lautet X1234567 und das Dokument wurde am 15. August 2022 ausgestellt. Mein Geburtsdatum bleibt, wie in Ihren Systemen hinterlegt, der 23. November 1985.

Des Weiteren möchte ich kurz auf die Abrechnungsmodalitäten eingehen. Im Rahmen meiner Umzugsplanung habe ich mich entschieden, meine Bankverbindung zu wechseln, weshalb die Ihnen vorliegenden Kontodaten nicht mehr gültig sind. Bitte überweisen Sie allfällige Rückerstattungen, Taggelder oder zukünftige Auszahlungen ab sofort auf mein neues Konto bei der Aare Bank AG. Die entsprechende IBAN für den Zahlungsverkehr lautet CH93 0076 2011 6238 5295 7. Mein altes Konto wird Ende des nächsten Monats endgültig saldiert und geschlossen. In der Vergangenheit wurden bestimmte Gebühren direkt über meine Kreditkarte abgerechnet (Visa, Nummer 4111 1111 1111 1111, gültig bis 12/27). Ich möchte ausdrücklich betonen, dass diese Karte ab sofort nicht mehr belastet werden soll und alle künftigen Transaktionen ausschliesslich über das neue Bankkonto laufen müssen.

Abschliessend erwähne ich der Vollständigkeit halber, dass auch mein Fahrzeug, welches unter dem Kennzeichen BE 123456 registriert ist, inzwischen auf die neue Adresse umgemeldet wurde. Dies ist vor allem für den Abgleich der Pendlerabzüge relevant, falls es Rückfragen seitens der Steuerbehörden geben sollte, auf die Sie Bezug nehmen müssten.

Ich hoffe, dass diese detaillierten Angaben ausreichend sind, um meine Akte reibungslos zu aktualisieren. Sollten Sie wider Erwarten noch weitere offizielle Bestätigungen benötigen, lassen Sie es mich bitte zeitnah wissen. Ich danke Ihnen im Voraus für Ihre Bemühungen, Ihre Sorgfalt und die rasche Bearbeitung meines Anliegens.

Mit freundlichen Grüssen

Lukas Meier
`,
    mustHide: [
      'Lukas Meier', 'Kramgasse 12, 3011 Bern', 'Muster Engineering AG', 'Aare Bank AG', '756.9876.5432.10',
      '079 555 12 34', 'lukas.meier@example.com', 'X1234567', '23. November 1985', 'CH93 0076 2011 6238 5295 7',
      '4111 1111 1111 1111', 'BE 123456',
    ],
    mustKeep: [
      'möchte ich Sie über einige wichtige Veränderungen', 'Sie gleichzeitig bitten', 'Wie Sie möglicherweise',
      'automatisierten Abgleich', 'Ich bitte Sie, sämtliche', 'Identifikation meiner Person', 'ist es mir ein Anliegen',
      'durch den Arbeitgeber', 'Mein Geburtsdatum', 'Abschluss meines Studiums', 'Mit freundlichen Grüssen',
    ],
  },
  {
    id: 'accident-report-de',
    language: 'de',
    text: `Der Text enthält eine hohe Dichte an unterschiedlichen, fiktiven persönlichen Daten (Namen von Dritten, Adressen, Telefonnummern, verschiedene Identifikationsnummern, Bankverbindungen, Fahrzeugdaten etc.), die natürlich in den Lesefluss eingebettet sind.

Absenderin:
Claudia Brunner
Seefeldstrasse 88, 8008 Zürich
Telefon Privat: 044 555 67 89
E-Mail: claudia.brunner@example.com

Empfänger:
Alpina Assekuranz AG
Abteilung für Sach- und Personenschäden
Bahnhofplatz 5, 8001 Zürich, 6. Oktober 2026

Betreff: Detaillierter Unfallbericht und Geltendmachung von Schadenersatzansprüchen
Referenznummer: SCH-2026-48213
Police-Nr.: PL-77.120.554
Versicherte Person: Claudia Brunner, geb. 03.04.1988 (AHV-Nr. 756.4321.8765.12)

Sehr geehrte Damen und Herren,

in der Anlage beziehe ich mich auf unser kurzes telefonisches Vorabgespräch vom 14. September 2026 mit Ihrem Sachbearbeiter, Herrn Thomas Keller, und reiche hiermit wie besprochen die detaillierte schriftliche Schilderung des Verkehrsunfalls sowie die dazugehörigen Belege ein.

1. Unfallhergang und beteiligte Personen
Der Unfall ereignete sich am Donnerstag, den 12. September 2026, um exakt 17:45 Uhr. Ich befand mich auf dem Heimweg von meiner Arbeitsstelle und fuhr auf der Badenerstrasse in Zürich in Richtung stadtauswärts. Bei der Kreuzung zur Langstrasse zeigte die Ampel für meine Fahrspur Grün. Ich fuhr mit meinem Fahrzeug, einem blauen VW Golf (Kontrollschild ZH 123456, Chassis-Nummer WVGZZZ1Z23456789), mit einer Geschwindigkeit von ca. 45 km/h in den Kreuzungsbereich ein.

In diesem Moment missachtete ein von rechts kommender Personenwagen, ein schwarzer BMW 320i mit dem Kontrollschild AG 98765, das für ihn geltende Rotlicht und kollidierte frontal mit der rechten Seite meines Fahrzeugs. Der Fahrer des BMWs, Markus Gerber (wohnhaft an der Rütistrasse 14, 8952 Schlieren, geboren am 22.11.1979), gab gegenüber der kurz darauf eintreffenden Stadtpolizei Zürich an, er sei durch sein Mobiltelefon abgelenkt gewesen. Die Unfallaufnahme erfolgte durch Wachtmeisterin Petra Lüthi (Rapport-Nr. RP-26-091234). Eine unabhängige Zeugin des Vorfalls, Fatima Aydin (erreichbar unter der Handynummer 076 555 43 21 oder f.aydin@example.com), hat den Rotlichtverstoß von Herrn Gerber ausserdem schriftlich bestätigt.

2. Medizinische Erstversorgung und Personenschaden
Aufgrund des heftigen Aufpralls lösten in meinem Fahrzeug die Seitenairbags aus. Ich erlitt ein mittelschweres Schleudertrauma (HWS-Distorsion) sowie Prellungen an der rechten Schulter und am Brustkorb. Ich wurde noch an der Unfallstelle von den Sanitätern von Schutz & Rettung Zürich (Einsatz-Nr. 2026-0912-117) erstversorgt und anschliessend mit der Ambulanz in das Universitätsspital Seeblick (USB) gebracht.

Dort wurde ich in der Notaufnahme von Dr. med. Laura Steiner untersucht. Für die Verrechnung der Erstbehandlung im Spital musste ich meine Krankenversicherungskarte der Krankenkasse Alpenblick vorlegen (Karten-Nr. 80756 0002 3344 556). Dr. Steiner hat mich vorerst bis zum 3. Oktober 2026 zu 100 % krankgeschrieben. Ein entsprechendes Arztzeugnis liegt diesem Schreiben bei. Da es sich um einen Wegunfall handelt, habe ich den Vorfall parallel auch der Unfallversicherung meines Arbeitgebers gemeldet.

3. Arbeitsausfall und Koordination mit dem Arbeitgeber
Ich bin hauptberuflich als Projektleiterin bei der Muster Digital AG angestellt (Firmenadresse: Hardturmstrasse 100, 8005 Zürich). Da mein monatliches Bruttogehalt CHF 8'500.- beträgt, führt mein wochenlanger Ausfall zu einem entsprechenden Koordinationsbedarf bezüglich der Taggelder. Bitte setzen Sie sich für die Abwicklung des Erwerbsausfalls direkt mit unserer HR-Verantwortlichen, Sabine Roth (Telefon direkt: 044 555 90 12), in Verbindung.

4. Sachschäden und Forderungen
Mein Fahrzeug hat durch den Seitenaufprall einen Totalschaden erlitten. Ein entsprechendes Gutachten der Garage Huber AG vom 18. September liegt bei. Darüber hinaus befand sich auf dem Beifahrersitz meine Arbeitstasche mit meinem Firmen-Laptop. Das Gerät, ein Apple MacBook Pro 16" (Seriennummer: C02X12345678, Kaufdatum: 10.01.2025), wurde durch die Deformation der Beifahrertür komplett zerstört. Der Wiederbeschaffungswert beläuft sich gemäss beiliegender Quittung von Data Quest AG auf exakt CHF 2'499.00.

5. Zahlungsverbindung
Für die Auszahlung der Sachschadenentschädigung bitte ich Sie, den Gesamtbetrag auf folgendes gemeinsames Konto von mir und meinem Ehemann (Stefan Brunner) zu überweisen:

Bank: Seebank Zürich AG
Kontoinhaber: Claudia und Stefan Brunner
IBAN: CH44 0070 0110 0012 3456 7
BIC/SWIFT: SEEBCHZZ80A

Sollten Sie von mir noch weitere Unterlagen benötigen, kontaktieren Sie mich bitte bevorzugt per E-Mail, da ich aufgrund der Schmerzmittel aktuell tagsüber oft schlafe.

Mit freundlichen Grüssen

Claudia Brunner

Beilagen:
Kopie Polizeirapport (RP-26-091234)
Arztzeugnis USB (Dr. Steiner)
Gutachten Totalschaden (Garage Huber AG)
`,
    mustHide: [
      'Claudia Brunner', 'Seefeldstrasse 88, 8008 Zürich', '044 555 67 89', 'claudia.brunner@example.com',
      'Alpina Assekuranz AG', 'SCH-2026-48213', 'PL-77.120.554', '03.04.1988', '756.4321.8765.12', 'Thomas Keller',
      'ZH 123456', 'WVGZZZ1Z23456789', 'AG 98765', 'Markus Gerber', 'Rütistrasse 14, 8952 Schlieren', '22.11.1979',
      'Petra Lüthi', 'RP-26-091234', 'Fatima Aydin', '076 555 43 21', 'f.aydin@example.com', 'Gerber',
      'Universitätsspital Seeblick', 'USB', 'Laura Steiner', 'Steiner', '80756 0002 3344 556', 'Muster Digital AG',
      'Hardturmstrasse 100, 8005 Zürich', 'Sabine Roth', '044 555 90 12', 'C02X12345678', 'Stefan Brunner',
      'Seebank Zürich AG', 'CH44 0070 0110 0012 3456 7', 'SEEBCHZZ80A',
    ],
    mustKeep: ['E-Mail: ', 'per E-Mail', 'Namen von Dritten, Adressen', 'Ein entsprechendes Arztzeugnis', 'Sehr geehrte Damen und Herren'],
  },
  {
    id: 'escalation-email-en',
    language: 'en',
    text: `To: Sarah Johnson (sarah.johnson@example.com)
From: Michael Abernathy (m.abernathy@northbridge.example)
CC: compliance@northbridge.example
Date: October 7, 2026
Subject: URGENT: Escalation regarding Ticket #48213-B - Privacy and Billing Incident

Hi Sarah,

I am writing to formally escalate a critical issue regarding one of our premium enterprise clients. On Tuesday, September 15th, 2026, we received a highly concerning support ticket from Mr. David Chen (Username: dchen_88). Mr. Chen can be reached at his primary email, david.chen@example.com, or his secondary work email, d.chen@chenconsulting.example.

During the initial intake call, Mr. Chen reported that his account had been compromised. He called in from his mobile phone, (415) 555-0132, but requested that any follow-up text messages be sent to his international line at +44 20 7946 0958. Our system logs indicate that the suspicious login originated from an IP address of 198.51.100.42, with a secondary IPv6 address of 2001:0db8:85a3:0000:0000:8a2e:0370:7334. The device used had the MAC address 00:1A:2B:3C:4D:5E.

Mr. Chen resides at 742 Market Street, Apt 5B, San Francisco, CA 94102. However, his billing address on file is listed as 1200 Pine Ridge Road, Austin, TX 78701. He mentioned that the fraudulent activity resulted in an unauthorized charge of $4,350.00 on his corporate credit card. The card used was a Visa, number 4111 1111 1111 1111, expiring on 11/29, with the CVV 443. To expedite the refund, he provided his banking details over the phone: routing number 021000021 and checking account number 000123456789. Since he travels frequently to Europe, he also asked if we could wire the funds to his Rheinland Bank account, IBAN: DE89 3704 0044 0532 0130 00.

Further complicating the matter, our customer service representative, Jessica Moreno (Employee ID: EMP-20391), accidentally screen-shared internal documentation during a Zoom troubleshooting session. The document exposed Mr. Chen's date of birth (March 14, 1981) and his Social Security Number (SSN: 078-05-1120). Furthermore, a support case note was visible on the screen, noting that Mr. Chen requested accessibility accommodations due to his recent diagnosis of Type 2 Diabetes and PTSD.

Jessica was driving her company-issued vehicle, a 2022 Honda Civic (License Plate: 8ABC123, California), during the incident and was parked at a local Starbucks at 500 Mission Street when she took the call. We have flagged this as a severe violation of company policy.

Please let me know how you would like to proceed with the refund and the subsequent data breach notification. We may need to involve our legal counsel, Rebecca Lin (rebecca.lin@northbridge.example), to draft the formal apology letter.

Best regards,

Michael Abernathy
Senior Regional Manager, Region 4
Office: (512) 555-0187
Skype: Mike_Aber_Tech
`,
    mustHide: [
      'Sarah Johnson', 'Sarah', 'sarah.johnson@example.com', 'Michael Abernathy', 'm.abernathy@northbridge.example', 'compliance@northbridge.example',
      '48213-B', 'David Chen', 'Chen', 'dchen_88', 'david.chen@example.com', 'd.chen@chenconsulting.example',
      '(415) 555-0132', '+44 20 7946 0958', '198.51.100.42', '2001:0db8:85a3:0000:0000:8a2e:0370:7334', '00:1A:2B:3C:4D:5E', '742 Market Street',
      'CA 94102', '1200 Pine Ridge Road', 'TX 78701', '4111 1111 1111 1111', 'CVV 443', '021000021',
      '000123456789', 'Rheinland Bank', 'DE89 3704 0044 0532 0130 00', 'Jessica Moreno', 'Jessica', 'EMP-20391',
      'March 14, 1981', '078-05-1120', '8ABC123', '500 Mission Street', 'Rebecca Lin', 'rebecca.lin@northbridge.example',
      '(512) 555-0187', 'Mike_Aber_Tech',
    ],
    mustKeep: ['Hi ', 'Type 2 Diabetes', 'Honda Civic', 'data breach notification', 'expiring on 11/29'],
  },
  // Written as held-out documents for the Presidio comparison (2026-10-15), before either detector saw them.
  {
    id: 'therapy-note-de',
    language: 'de',
    text: `Psychotherapeutische Praxis Lindenhof
lic. phil. Beatrice Zürcher, Fachpsychologin für Psychotherapie FSP
Lindenhofweg 3, 4052 Basel

Verlaufsnotiz, Sitzung 14

Klientin: Nadine Gerber-Kunz (geb. 03.07.1988), wohnhaft Rebgasse 21, 4058 Basel
Krankenkasse: Helvetia Gesundheit, Versicherten-Nr. 123.456.789-0
Zuweisender Arzt: Dr. Pascal Imhof, Hausarztpraxis Riehen

Frau Gerber berichtet, dass die Konflikte mit ihrem Ex-Partner Daniel Kunz weiter zunehmen. Er habe ihr am
Wochenende mehrfach auf 076 432 18 90 angerufen. Ihre Tochter Lea (7) übernachte seit zwei Wochen bei der
Grossmutter in Pratteln. Die KESB Basel-Stadt (Dossier KE-2026-0815) wurde informiert.
Nadine wirkt erschöpft, Schlaf weiterhin gestört. Wir vereinbaren, die Medikation mit Dr. Imhof zu besprechen.

Nächster Termin: Donnerstag, 22.10.2026, 16:00 Uhr.
Rückfragen bitte an b.zuercher@praxis-lindenhof.example`,
    mustHide: ['Beatrice Zürcher', 'Lindenhofweg 3', 'Nadine Gerber-Kunz', '03.07.1988', 'Rebgasse 21', '123.456.789-0', 'Pascal Imhof',
      'Gerber', 'Daniel Kunz', '076 432 18 90', 'Lea', 'KE-2026-0815', 'Nadine', 'Imhof', 'b.zuercher@praxis-lindenhof.example'],
    mustKeep: ['Verlaufsnotiz', 'Sitzung 14', 'Schlaf weiterhin gestört', 'Medikation', 'Nächster Termin'],
  },
  {
    id: 'employment-dispute-fr',
    language: 'fr',
    text: `De : Me Sophie Vuilleumier <s.vuilleumier@etude-lac.example>
À : Monsieur Thierry Baud
Objet : Votre licenciement, réf. 2026/LT/0457

Cher Monsieur Baud,

Suite à notre entretien du 8 octobre, je vous confirme que votre ancien employeur, Horlogerie Fleurier SA,
conteste le caractère abusif du congé. Votre supérieure, Mme Valérie Chappuis, aurait déclaré au service RH que
vous auriez « manqué de loyauté ». Selon votre contrat, votre salaire mensuel brut s'élève à CHF 8'450.-.

Votre collègue Karim Benali est prêt à témoigner; il peut être joint au +41 32 555 76 12.
Merci de m'envoyer votre certificat médical du Dr Jean-Marc Rossel ainsi que votre numéro AVS (756.9876.5432.10).
Le paiement de l'avance de frais peut être effectué sur le compte CH56 0483 5012 3456 7800 9.

Je reste à votre disposition.
Sophie Vuilleumier, avocate
Étude du Lac, Place Pury 4, 2000 Neuchâtel`,
    mustHide: ['Sophie Vuilleumier', 's.vuilleumier@etude-lac.example', 'Thierry Baud', '2026/LT/0457', 'Baud', 'Horlogerie Fleurier SA',
      'Valérie Chappuis', 'Karim Benali', '+41 32 555 76 12', 'Jean-Marc Rossel', '756.9876.5432.10', 'CH56 0483 5012 3456 7800 9',
      'Place Pury 4'],
    mustKeep: ['licenciement', 'caractère abusif du congé', 'certificat médical', 'avance de frais'],
  },
  {
    id: 'referral-it',
    language: 'it',
    text: `Studio medico Dr.ssa Francesca Bernasconi
Via San Gottardo 54, 6500 Bellinzona

Gentile collega,

Le invio il signor Matteo Ghirlanda, nato il 19.11.1975, residente in Via ai Grotti 9, 6517 Arbedo,
per una valutazione cardiologica. Il paziente lamenta dispnea da sforzo da circa tre mesi.
In anamnesi: infarto miocardico nel 2019, trattato all'Ospedale Regionale di Lugano.
Terapia attuale: aspirina 100 mg, bisoprololo 5 mg.

La moglie, signora Elena Ghirlanda-Rusconi, lo accompagnerà; il suo numero è 091 825 44 10.
Numero di assicurato: 80756 0004 9876 543. Numero AVS: 756.5555.4444.33.

Cordiali saluti
Francesca Bernasconi`,
    mustHide: ['Francesca Bernasconi', 'Via San Gottardo 54', 'Matteo Ghirlanda', '19.11.1975', 'Via ai Grotti 9', 'Elena Ghirlanda-Rusconi',
      '091 825 44 10', '80756 0004 9876 543', '756.5555.4444.33'],
    mustKeep: ['valutazione cardiologica', 'dispnea da sforzo', 'infarto miocardico', 'aspirina 100 mg'],
  },
  {
    id: 'due-diligence-memo-en',
    language: 'en',
    text: `PRIVILEGED & CONFIDENTIAL - ATTORNEY WORK PRODUCT

Memo to: Gregor Lindqvist, Partner
From: Aisha Okafor, Associate
Re: Project Falcon - target Brightwater Analytics Ltd. (company no. 09876543)

1. The target's founder, Tomasz Wieczorek, holds 62% of the shares through Wieczorek Holdings S.à r.l.
2. Key employee Rachel O'Donnell (CTO) has a non-compete expiring 30 June 2027. Her personal email
   rachel.odonnell@mailbox.example was used for board communications, which we flag as a risk.
3. A pending claim by former contractor Benjamin Akerman (claim no. HC-2026-001942) alleges unpaid fees of GBP 410,000.
4. The data room login used by the seller is user "bw_dataroom_admin", password "Falcon#2026!".
5. Servers are hosted at 198.51.100.24 and backed up to bw-backup-02.brightwater.example.

Please call me on +44 20 7946 0321 before Thursday. Rachel and Tomasz will join the call.
Aisha`,
    mustHide: ['Gregor Lindqvist', 'Aisha Okafor', 'Project Falcon', 'Brightwater Analytics Ltd.', '09876543', 'Tomasz Wieczorek',
      'Wieczorek Holdings', "Rachel O'Donnell", 'rachel.odonnell@mailbox.example', 'Benjamin Akerman', 'HC-2026-001942',
      'bw_dataroom_admin', 'Falcon#2026!', '198.51.100.24', 'bw-backup-02.brightwater.example', '+44 20 7946 0321', 'Rachel', 'Tomasz', 'Aisha'],
    mustKeep: ['non-compete', 'unpaid fees', 'data room', 'board communications'],
  },
  {
    id: 'trustee-notes-de-ch',
    language: 'de',
    text: `Aktennotiz Mandat Huber / Erbschaft

Telefonat vom 12. Oktober mit Erich Huber (Sohn der Erblasserin Margrit Huber-Wyss, verstorben am 01.08.2026).
Erich wohnt neu in Winterthur, Technikumstrasse 88. Seine Schwester Monika Schaller-Huber lebt in Kanada
und ist per WhatsApp unter +1 604 555 0187 erreichbar.

Nachlass: Liegenschaft Grundbuchblatt Nr. 4471, Gemeinde Elgg; Konto bei der Raiffeisenbank Elgg,
IBAN CH44 8080 8001 2345 6789 0; Depot Nr. 55-123456-7 bei der Bank Thurgau.
Das Testament liegt beim Notariat Elgg (Notar Urs Bänziger).

Erich vermutet, dass seine Schwester Vorbezüge von ca. CHF 120'000 erhalten hat. Bitte Kontoauszüge
anfordern. Termin mit Monika per Videocall am 29.10., Link: https://meet.example/huber-erbschaft

Visum: AB`,
    mustHide: ['Erich Huber', 'Margrit Huber-Wyss', '01.08.2026', 'Technikumstrasse 88', 'Monika Schaller-Huber', '+1 604 555 0187',
      '4471', 'CH44 8080 8001 2345 6789 0', '55-123456-7', 'Urs Bänziger', 'Erich', 'Monika', 'https://meet.example/huber-erbschaft'],
    mustKeep: ['Aktennotiz', 'Nachlass', 'Testament', 'Vorbezüge', 'Kontoauszüge'],
  },
  // Rebuilt with invented values from a pseudonymized result that still showed IDs, an address and a phone number (2026-10-15).
  {
    id: 'consolidated-records-en',
    language: 'en',
    text: `Document ID: CONF-2026-X8891
Date Generated: October 15, 2026
Subject: Consolidated Departmental Records (Customer Support, HR, Medical, and IT Security)

Section 1: Customer Support Escalation Transcript
Agent: Marcus Webb (ID: AGT-55021)
Customer: Jennifer Alvarez
Transcript Start:
Agent: Thank you for calling Northstar Telecom. My name is Marcus. How can I assist you today?
Customer: Hi Marcus, this is Jennifer Alvarez. I'm calling because I received a weird charge on my account. My customer ID is CUST-7720419.
Agent: I can help with that, Jennifer. For security, can you verify your primary billing address and the phone number on file?
Customer: Sure. The address is 1847 Maple Grove Drive, Apt 3B, Portland, OR 97205. The phone number is (503) 555-0142. I also have an alternate UK mobile number listed, which is +44 7700 900123.
Agent: Perfect, thank you. I see your email address is jennifer.alvarez@example.com. Is that still correct?
Customer: Actually, please update it to j.alvarez.home@example.net. Regarding the charge, it was billed to my Visa ending in 4111. The full card number I used was 4111 1111 1111 1111, expiration 12/28, CVV 739.
Agent: I see the charge of $412.50. I will process a refund immediately. Your confirmation code is REF-99482-XYZ.

Section 2: Human Resources Onboarding Memo
To: HR Data Entry (hr-intake@example.com)
From: Patricia Okonkwo, VP of Human Resources
Re: New Hire Profile - Jonathan Reyes

Please process the following new hire for the Q4 intake.
Full Legal Name: Jonathan Andrew Reyes
Date of Birth: March 22, 1990 (03/22/1990)
Social Security Number: 123-45-6789
National Provider Identifier (NPI): 1234567893
Driver's License: State of California, DL# F9876543, Exp: 03/22/2029.
Vehicle Information: 2021 Toyota Camry, License Plate: 8ABC123, VIN: 4T1B11HK2LU123456.

Direct Deposit Information:

Bank Name: First Pacific Bank

Routing Number: 121000358

Account Number: 000123456789

SWIFT/BIC: FPBKUS6S

IBAN (for European contractor work): DE89 3704 0044 0532 0130 00

Emergency Contact:
Maria Reyes (Spouse). Address: 492 West 4th Avenue, Suite 200, New York, NY 10012. Phone: (212) 555-0198.

Section 3: Medical / Patient Incident Report
Facility: St. Brigid Medical Center
Attending Physician: Dr. Alan Hughes
Patient Name: Robert Kim
DOB: 11/04/1958
Medical Record Number (MRN): MRN-00482913
Insurance Provider: BlueRiver Health, Group # 90210, Member ID: XYZ123456789.

Clinical Notes:
Patient Robert Kim presented to the emergency department on 10/12/2026 complaining of severe chest pain. Patient has a known history of Type 2 Diabetes Mellitus (ICD-10: E11.9) and essential hypertension (ICD-10: I10). Blood pressure at triage was 160/95. The patient's spouse, Susan Kim, was present and can be reached at 415.555.8822 for updates. Patient was administered 325mg Aspirin and referred to Bayview Cardiology Clinic. Discharge paperwork was mailed to his secondary residence at 77 Ocean View Road, Carmel, CA 93921.

Section 4: IT Security & Network Breach Log
Incident ID: SEC-INT-441
Reported By: Elena Petrova
Timestamp: 2026-10-14T08:14:00Z

Anomalous login activity was detected on the internal financial server (Hostname: fin-srv-01.corp.example).
The intrusion originated from an external IP Address: 203.0.113.45, which bypassed the firewall by spoofing the internal MAC Address 00:1B:44:11:3A:B7.
Secondary connections were established over IPv6 using the address 2001:db8:85a3::8a2e:370:7334.

The threat actor attempted to download a database dump containing customer passwords. The compromised employee account belongs to d.okafor@example.com (Daniel Okafor, Network Engineer). The session was terminated manually by the admin from the local IP 10.0.0.15.
All logs have been forwarded to our cybersecurity vendor at https://secure.vendor.example/upload.`,
    mustHide: [
      'CONF-2026-X8891', 'Marcus Webb', 'AGT-55021', 'Jennifer Alvarez', 'Northstar Telecom', 'Marcus', 'Jennifer', 'CUST-7720419',
      '1847 Maple Grove Drive', 'Portland, OR 97205', '(503) 555-0142', '+44 7700 900123', 'jennifer.alvarez@example.com',
      'j.alvarez.home@example.net', '4111 1111 1111 1111', 'ending in 4111', '12/28', '739', 'REF-99482-XYZ', 'hr-intake@example.com', 'Patricia Okonkwo',
      'Jonathan Reyes', 'Jonathan Andrew Reyes', 'March 22, 1990', '03/22/1990', '123-45-6789', '1234567893', 'F9876543', '03/22/2029',
      '8ABC123', '4T1B11HK2LU123456', 'First Pacific Bank', '121000358', '000123456789', 'FPBKUS6S', 'DE89 3704 0044 0532 0130 00',
      'Maria Reyes', '492 West 4th Avenue', 'New York, NY 10012', '(212) 555-0198', 'St. Brigid Medical Center', 'Alan Hughes',
      'Robert Kim', '11/04/1958', 'MRN-00482913', 'BlueRiver Health', '90210', 'XYZ123456789', 'Susan Kim', '415.555.8822',
      'Bayview Cardiology Clinic', '77 Ocean View Road', 'Carmel, CA 93921', 'SEC-INT-441', '08:14:00Z', 'Elena Petrova', 'fin-srv-01.corp.example',
      '203.0.113.45', '00:1B:44:11:3A:B7', '2001:db8:85a3::8a2e:370:7334', 'd.okafor@example.com', 'Daniel Okafor', '10.0.0.15',
      'https://secure.vendor.example/upload',
    ],
    mustKeep: ['Agent: Thank you', 'Customer: Hi', 'Type 2 Diabetes Mellitus', 'ICD-10: E11.9', 'ICD-10: I10', '160/95', '325mg Aspirin', '$412.50', 'Network Engineer'],
  },
  ...GENERATED_DOCUMENTS,
];
