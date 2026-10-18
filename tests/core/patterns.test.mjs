import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectWithPatterns } from '../helpers/core.mjs';
import { DOCUMENTS } from '../fixtures/documents.mjs';

const found = (text, category) => detectWithPatterns(text).filter((e) => e.category === category).map((e) => e.text);
const doc = (id) => DOCUMENTS.find((d) => d.id === id).text;

describe('pattern detection', () => {
  it('finds every email address in a realistic email, without trailing punctuation', () => {
    const emails = found(doc('consulting-incident-email-en'), 'EMAIL');
    for (const email of ['daniel.hofer@northwind-consulting.example', 'p.raman@helvetic-insure.example', 'marco.rossi@helvetic-insure.example']) {
      assert.ok(emails.includes(email), email);
    }
    // Also matches user:password@host in connection strings, which usefully hides both.
    assert.ok(emails.includes('Kx9vR2pQ77@db-prod-03.helvetic.internal'));
    assert.deepEqual(found('Write to anna+billing@sub.example.co.uk. Or Anna.Meier@Example.CH!', 'EMAIL'), ['anna+billing@sub.example.co.uk', 'Anna.Meier@Example.CH']);
  });

  it('finds Swiss phone numbers in all common notations, as a whole', () => {
    const numbers = ['+41 79 555 01 23', '079 555 01 23', '044/555 01 23', '+41 (0)44 555 01 23', '0041 44 555 01 23', '+41445550123'];
    assert.deepEqual(found(numbers.join('; '), 'PHONE'), numbers);
  });

  it('finds the phone numbers in the realistic letters', () => {
    assert.deepEqual(found(doc('medical-discharge-letter-de'), 'PHONE').filter((t) => t.startsWith('0')), ['044 555 22 33', '079 555 88 10']);
    assert.ok(found(doc('court-letter-fr'), 'PHONE').includes('+41 22 555 01 90'));
  });

  it('does not mistake amounts, percentages or short numbers for phone numbers', () => {
    assert.deepEqual(found('CHF 2\'450.-, HbA1c 8.1 %, Typ 2, 3-Gefässerkrankung, 02:13, Raum 4.12, 6 Wochen', 'PHONE'), []);
  });

  it('finds IPv4 addresses and URLs', () => {
    const text = doc('consulting-incident-email-en');
    assert.deepEqual(found(text, 'IP'), ['10.42.7.15', '192.0.2.0']);
    assert.deepEqual(found('see (https://wiki.example.internal/a?b=1#c) and http://10.0.0.5:8080/x', 'URL'), ['https://wiki.example.internal/a?b=1#c', 'http://10.0.0.5:8080/x']);
  });

  it('URLs at the end of a sentence exclude the full stop', () => {
    assert.deepEqual(found('Details: https://wiki.example.internal/incident-42.', 'URL'), ['https://wiki.example.internal/incident-42']);
  });

  it('finds Swiss AHV numbers with dots, spaces or neither, as IDs', () => {
    assert.deepEqual(found('AHV-Nr.: 756.1234.5678.97, alt 756 1234 5678 97, kompakt 7561234567897.', 'ID'), ['756.1234.5678.97', '756 1234 5678 97', '7561234567897']);
    assert.deepEqual(found('Wert 1756.1234.5678.97, Tel. 756.12.34', 'ID'), []);
  });

  it('finds BIC/SWIFT codes after "BIC" or "SWIFT", in the usual notations', () => {
    const text = 'BIC/SWIFT: SEEBCHZZ80A, BIC UBSWCHZH80A, SWIFT-Code: POFICHBEXXX, BIC Code UBSWCHZH';
    assert.deepEqual(found(text, 'ID'), ['SEEBCHZZ80A', 'UBSWCHZH80A', 'POFICHBEXXX', 'UBSWCHZH']);
  });

  it('does not mistake other upper-case words for BIC codes', () => {
    assert.deepEqual(found('ABSCHNITT 3: DOSSIERS, NOTFALLNUMMER, BICYCLE ABCDEFGH, ZKBKCHZZ80A ohne Hinweis', 'ID'), []);
  });

  it('finds IPv6 addresses, full and shortened', () => {
    assert.deepEqual(found('from 2001:0db8:85a3:0000:0000:8a2e:0370:7334, peer fe80::1c2b:3aff:fe4d:12 closed, lo ::1', 'IP'),
      ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'fe80::1c2b:3aff:fe4d:12', '::1']);
  });

  it('does not mistake times, ratios or code for IPv6 addresses', () => {
    assert.deepEqual(found('um 17:45:30, Verhältnis 3:2, std::vector, Foo::Bar', 'IP'), []);
  });

  it('finds MAC addresses with one kind of separator', () => {
    assert.deepEqual(found('MAC 00:1A:2B:3C:4D:5E and 00-1a-2b-3c-4d-5e, not 00:1A-2B:3C:4D:5E', 'MAC'), ['00:1A:2B:3C:4D:5E', '00-1a-2b-3c-4d-5e']);
  });

  it('finds payment card numbers that pass the Luhn checksum, before the phone pattern claims them', () => {
    const text = 'Visa 4111 1111 1111 1111, MC 5555-5555-5555-4444, Amex 378282246310005; not 1234 5678 9012 3456 or 000123456789';
    assert.deepEqual(found(text, 'CARD'), ['4111 1111 1111 1111', '5555-5555-5555-4444', '378282246310005']);
    assert.equal(detectWithPatterns(text).find((e) => e.text === '4111 1111 1111 1111').category, 'CARD');
  });

  it('finds a card number that fails the checksum when a word for a card stands before it (regression: card shown as PHONE)', () => {
    const text = 'The full card number I used was 4000 1234 5678 4111. Kreditkarte: 5555 1234 5678 9999. Konto 1234 5678 9012 3456.';
    assert.deepEqual(found(text, 'CARD'), ['4000 1234 5678 4111', '5555 1234 5678 9999']);
  });

  it('finds the last four digits of a card (regression: "ending in 4111" stayed visible)', () => {
    const text = 'billed to my Visa ending in 4111, last four digits: 0005, Karte endend auf 9999; carte se terminant par 1234; 4111 apples';
    assert.deepEqual(found(text, 'CARD'), ['4111', '0005', '9999', '1234']);
  });

  it('finds an NPI as an ID, not a phone number (regression)', () => {
    assert.deepEqual(found('National Provider Identifier (NPI): 1987654320', 'ID'), ['1987654320']);
  });

  it('finds masked card numbers (regression: "PAIEMENT CARTE 4111********1111" stayed visible)', () => {
    assert.deepEqual(found('PAIEMENT CARTE 4111********1111 MIGROS; card 411111xxxxxx1111; Visa 4111 **** **** 1111', 'CARD'),
      ['4111********1111', '411111xxxxxx1111', '4111 **** **** 1111']);
  });

  it('finds card security codes only after CVV, CVC or security code', () => {
    assert.deepEqual(found('with the CVV 443, CVC2: 1234, Sicherheitscode 087; Zimmer 443, Code 123', 'SECRET'), ['443', '1234', '087']);
  });

  it('finds usernames after a messenger or account name', () => {
    assert.deepEqual(found('Skype: Mike_Aber_Tech, Username: dchen_88, Login: @anna.meier, Teams: ab, Note: something', 'USERNAME'),
      ['Mike_Aber_Tech', 'dchen_88', '@anna.meier']);
  });

  it('finds IDs after a word that announces them, in four languages (regression: "DL# F9876543", "VIN", "Group #")', () => {
    const text = 'Document ID: CONF-2026-X8891. DL# F9876543, VIN: 4T1B11HK2LU123456, Group # 90210, Member ID: XYZ123456789. '
      + 'Your confirmation code is REF-99482-XYZ. Grundbuchblatt Nr. 4471, Versicherten-Nr. 123.456.789-0, Seriennummer SN-88213, '
      + 'réf. 2026/LT/0457, Dossier KE-2026-0815, company no. 09876543, numero 55-123456-7.';
    assert.deepEqual(found(text, 'ID'), ['CONF-2026-X8891', 'F9876543', '4T1B11HK2LU123456', '90210', 'XYZ123456789', 'REF-99482-XYZ',
      '4471', '123.456.789-0', 'SN-88213', '2026/LT/0457', 'KE-2026-0815', '09876543', '55-123456-7']);
  });

  it('finds reference codes without a label, but not short codes such as ICD-10 (regression: "SEC-INT-441", "INC-20419")', () => {
    assert.deepEqual(found('Incident ID: SEC-INT-441, see INC-20419 and HC-2026-001942; ICD-10: E11.9, COVID-19, Typ 2, Ticket: open', 'ID'),
      ['SEC-INT-441', 'INC-20419', 'HC-2026-001942']);
  });

  it('finds IBANs that pass the checksum, with or without spaces', () => {
    const text = 'IBAN DE89 3704 0044 0532 0130 00, CH9300762011623852957, not DE89 3704 0044 0532 0130 01';
    assert.deepEqual(found(text, 'ID').filter((t) => t.startsWith('DE') || t.startsWith('CH')), ['DE89 3704 0044 0532 0130 00', 'CH9300762011623852957']);
  });

  it('finds dates with "/" and ISO dates as dates, not phone numbers, and card expiry dates', () => {
    const text = 'DOB: 11/04/1958, on 10/12/2026 at 2026-10-14T08:14:00Z; card expiration 12/28, Exp: 03/2029; ratio 160/95, expiring on 11/29';
    assert.deepEqual(found(text, 'DATE'), ['11/04/1958', '10/12/2026', '12/28', '03/2029']);
    assert.deepEqual(found(text, 'PHONE'), []);
  });

  it('replaces a timestamp with its time, not just the date (regression: "[[DATE_4]]T08:14:00Z")', () => {
    const text = 'Timestamp: 2026-10-14T08:14:00Z, logged 2026-10-14 08:14 and 2026-10-15T23:59:59.123+02:00; report of 2026-10-16.';
    assert.deepEqual(found(text, 'TIMESTAMP'), ['2026-10-14T08:14:00Z', '2026-10-14 08:14', '2026-10-15T23:59:59.123+02:00']);
    assert.deepEqual(found(text, 'DATE'), ['2026-10-16']);
    assert.deepEqual(found(text, 'PHONE'), []);
  });

  it('finds street addresses in American, German, Swiss, French and Italian notation', () => {
    const text = 'Address: 492 West 4th Avenue, Suite 200, New York, NY 10012. Also 77 Ocean View Road, Carmel, CA 93921. '
      + 'Rebgasse 21, 4058 Basel; Lindenhofweg 3; Rue du Rhône 42, 1204 Genève; Place Pury 4; Via ai Grotti 9, 6517 Arbedo.';
    assert.deepEqual(found(text, 'ADDRESS'), ['492 West 4th Avenue, Suite 200', '77 Ocean View Road', 'New York, NY 10012', 'Carmel, CA 93921',
      '4058 Basel', '1204 Genève', '6517 Arbedo', 'Rebgasse 21', 'Lindenhofweg 3', 'Rue du Rhône 42', 'Place Pury 4', 'Via ai Grotti 9']);
  });

  it('finds phone numbers with dots, and never starts a phone number inside another value (regression: "415.555.8822", "503) 555-0142")', () => {
    const text = 'reached at 415.555.8822, Tel. 044.555.22.33, (503) 555-0142, Member ID: XYZ123456789, DOB 1990 (03/22/1990); not 02.09.2026 or 203.0.113.45';
    assert.deepEqual(found(text, 'PHONE'), ['(503) 555-0142', '415.555.8822']);
    // four groups like an IPv4 address: hidden, but under IP
    assert.ok(found(text, 'IP').includes('044.555.22.33'));
  });

  it('finds access keys and tokens of well-known services wherever they stand (regression: AWS keys in a config file stayed visible)', () => {
    const text = 'key=sk_live_51HxEXAMPLEq8Zt2mN0pQrS7, openai sk-EXAMPLEa1B2c3D4e5F6g7H8i9J0kLmN, ghp_EXAMPLE16C7e42F292c6912E7710c838347Ae178B4a, '
      + 'xoxb-1234567890-EXAMPLEtoken, AKIAIOSFODNN7EXAMPLE, eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.EXAMPLEsignature0123, '
      + 'Authorization: Bearer 9f8e7d6c5b4a3928EXAMPLE';
    assert.deepEqual(found(text, 'SECRET'), ['sk_live_51HxEXAMPLEq8Zt2mN0pQrS7', 'sk-EXAMPLEa1B2c3D4e5F6g7H8i9J0kLmN',
      'ghp_EXAMPLE16C7e42F292c6912E7710c838347Ae178B4a', 'xoxb-1234567890-EXAMPLEtoken', 'AKIAIOSFODNN7EXAMPLE',
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.EXAMPLEsignature0123', '9f8e7d6c5b4a3928EXAMPLE']);
  });

  it('finds passwords, keys and tokens after their name in config files, logs and sentences (regression: "aws_secret_access_key: wJalr...")', () => {
    const text = 'password: "kL9#vB2!mQ"\nDB_PASSWORD=Sommerwind\naws_secret_access_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n'
      + '{"api_key": "EXAMPLE1234"} session created sid=9f8e7d6c5b4a39281706f5e4d3c2b1a0; das Passwort ist Kaelin2026! Bitte löschen.';
    assert.deepEqual(found(text, 'SECRET'), ['kL9#vB2!mQ', 'Sommerwind', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'EXAMPLE1234',
      '9f8e7d6c5b4a39281706f5e4d3c2b1a0', 'Kaelin2026!']);
  });

  it('does not take ordinary words after a password or a secretary for secrets', () => {
    assert.deepEqual(found('the password is wrong. Le mot de passe est correct. Secretary: Anna Muster. Token: ok. Pass-Nr.: X1234567', 'SECRET'), []);
  });

  it('finds usernames after "user=" or "owner=" in logs and URLs (regression: "?owner=petra.vogel")', () => {
    assert.deepEqual(found('login ok user=kschneider src=192.0.2.1; GET /files?owner=petra.vogel 200; superuser=root', 'USERNAME'), ['kschneider', 'petra.vogel']);
  });

  it('hides connection strings of any scheme as a whole, with the password in them', () => {
    assert.deepEqual(found('url: postgresql://portal_admin:Pf8!qLz2xR@10.20.30.40:5432/mandanten, mongodb+srv://u:p@db.example', 'URL'),
      ['postgresql://portal_admin:Pf8!qLz2xR@10.20.30.40:5432/mandanten', 'mongodb+srv://u:p@db.example']);
  });

  it('finds case, patient and key numbers in the notations of courts, labs and logs (regression: "ZK 26 318", "P-104233", "N. paziente: 0045821")', () => {
    const text = 'Geschäftsnummer ZK 26 318; BGer 4A_123/2026; P-104233;Müller; N. paziente: 0045821; Patient-ID 7781; client_id=88213; '
      + 'GET /clients/4471-ZRH/files; Ihre Akte 2026-ZH-0193';
    assert.deepEqual(found(text, 'ID'), ['ZK 26 318', '0045821', '7781', '88213', '2026-ZH-0193', 'P-104233', '4471-ZRH', '4A_123/2026']);
  });

  it('does not take units, status codes or years after a label for IDs (regression: "g/dL 12.0" became an ID)', () => {
    const text = 'Emoglobina 11.2 g/dL      12.0 - 16.0; status_code=200; a claim for 2026; Dossier von 2026; ICD-10, COVID-19, 5-HT';
    assert.deepEqual(found(text, 'ID'), []);
  });

  it('does not take reference ranges in lab reports for phone numbers (regression: "15 - 150")', () => {
    assert.deepEqual(found('Ferritina 8 µg/L 15 - 150; Natrium 141 mmol/l 135 - 145; Thrombozyten 150 - 400', 'PHONE'), []);
    assert.deepEqual(found('Tel. 044 555 01 23, (503) 555-0142', 'PHONE'), ['044 555 01 23', '(503) 555-0142']);
  });

  it('does not join table columns, a calendar week or years into a phone number (regression: "25    96.00", "KW 46 / 2026", "2025-2028", "20261012.4")', () => {
    const text = '1    SW-2210    25    96.00   2400.00\nKontrolle KW 46 / 2026\n2    Tel.    044 555 01 23\n044 / 555 01 23\nFinanzplanung 2025-2028, Saison 2019/2020, Build 20261012.4';
    assert.deepEqual(found(text, 'PHONE'), ['044 555 01 23', '044 / 555 01 23']);
  });

  it('finds Italian tax codes, Swiss company numbers and invoice numbers after "N." (regression: codice fiscale stayed visible)', () => {
    const text = 'FATTURA N. 2026/0458 - C.F. FMGRRT80A41F205X, Codice fiscale: CLMLSN72C15A794K; UID CHE-123.456.789 MWST';
    assert.deepEqual(found(text, 'ID'), ['2026/0458', 'FMGRRT80A41F205X', 'CLMLSN72C15A794K', 'CHE-123.456.789']);
  });

  it('finds a person\'s name after a label for one in forms and records (regression: "Preferred name: Seun")', () => {
    const text = 'Name: Oluwaseun ADEYEMI-CLARKE\nPreferred name: Seun\nPatient: Herr Reto Ammann, geb. 14.02.1961\n'
      + 'Pat. : SCHMID Beat , geb . 02 . 11 . 1963\nPrénom : Héloïse\nKlientin: Ursula von Gunten (geb. 1947)\nPatient: Dr. med. Corinne Bachmann';
    assert.deepEqual(found(text, 'PERSON'), ['Corinne Bachmann', 'Oluwaseun ADEYEMI-CLARKE', 'Seun', 'Herr Reto Ammann', 'SCHMID Beat', 'Héloïse',
      'Ursula von Gunten', 'Dr. med. Corinne Bachmann']);
  });

  it('finds a first name and surname after an academic title (regression: "Dr. med. dent. Laurin Hofer", "lic. phil. Rebekka Hauser")', () => {
    const text = 'Praxis Dr. med. dent. Laurin Hofer; Schulpsychologin: lic. phil. Rebekka Hauser\nProf. Dr. Ueli Baumann-Sommer; MLaw Dario Pfister; '
      + 'Dr Amelia Ferreira-Hart; Dr. h.c. Margrit Zehnder; Dr. med. Lukas Steiner in 6 Wochen';
    assert.deepEqual(found(text, 'PERSON'), ['Laurin Hofer', 'Rebekka Hauser', 'Ueli Baumann-Sommer', 'Dario Pfister', 'Amelia Ferreira-Hart', 'Margrit Zehnder',
      'Lukas Steiner']);
  });

  it('does not take abbreviations in a sentence or a single word after a title for a name', () => {
    assert.deepEqual(found('Dr. Steiner hat mich krankgeschrieben; die med. Versorgung Zürich; die pol. Gemeinde Bern', 'PERSON'), []);
  });

  it('does not take titles, initials, lower-case words or other labels for names', () => {
    const text = 'Name: Herr\nPatient: H.\nName: siehe Beilage\nDateiname: Bericht.pdf\nUsername: dchen_88\nPatient presented with chest pain';
    assert.deepEqual(found(text, 'PERSON'), []);
  });

  it('finds court case numbers, passport and ID card numbers without a label (regression: "HG250117-O", "VB.2026.00321" in a table)', () => {
    const text = '| Elektro Wyss GmbH | HG250117-O | 19.10.2026 |\n| Fam. Oppliger | VB.2026.00321 |\n| WBE.2026.144 | Incarto 12.2026.45 |\n'
      + 'Pass X1234567, Identitätskarte E4821937; ISO9001, COVID19, 02.09.2026, Art. 308 ZPO; 04.01_Claim_vs_APH_HG230045.pdf';
    assert.deepEqual(found(text, 'ID'), ['HG250117-O', 'X1234567', 'E4821937', 'HG230045', 'VB.2026.00321', 'WBE.2026.144', '12.2026.45']);
  });

  it('finds report numbers with a canton or court between slashes and Italian ID card numbers without a label (regression: "2026/TI/4471", "CA12345BC")', () => {
    const text = "Rapporto d'incidente 2026/TI/4471; Cause C/18342/2026; carta d'identità CA12345BC; 24/7, km/h, 1/2";
    assert.deepEqual(found(text, 'ID'), ['CA12345BC', '2026/TI/4471', 'C/18342/2026']);
  });

  it('finds Swiss postal account numbers without a label (regression: "compte postal (CCP 17-123456-8)")', () => {
    assert.deepEqual(found('Le compte postal du défunt (CCP 17-123456-8); PC 30-1234-5; 2026-10-14; 3-Gefässerkrankung', 'ID'), ['17-123456-8', '30-1234-5']);
  });

  it('finds IDs after "n°" (regression: "permis B n° 1234567" stayed visible), and leaves an AHV number after "N° AVS" whole', () => {
    assert.deepEqual(found('permis B n° 1234567, N° AVS 756.9012.3456.78, Nº 4471', 'ID'), ['756.9012.3456.78', '1234567', '4471']);
  });

  it('keeps diagnosis codes after "code" (regression: \'code="M54.5"\' became an ID)', () => {
    assert.deepEqual(found('<diagnosis code="M54.5">Lumbago</diagnosis> Code: F41.1, Code: AB-1234', 'ID'), ['AB-1234']);
  });

  it('finds Swiss license plates in the usual notations (regression: "SO 77 312")', () => {
    const text = 'Personenwagen SO 77 312, Kontrollschild ZH 123456, "plate": "LU 145 872", BE-12345; not AI 2026, Akte 2026-ZH-0193, BE 12.5 %';
    assert.deepEqual(found(text, 'ID').filter((t) => !t.startsWith('2026')), ['BE-12345', 'SO 77 312', 'ZH 123456', 'LU 145 872']);
  });

  it('finds family names after "Fam.", "famille" or "famiglia" (regression: "Fam. Oppliger")', () => {
    const text = 'Fam. Oppliger (Peter + Ruth); c/o Famille Rochat-Favre; la famiglia Bernasconi; wir haben der Familie Zeit gegeben';
    assert.deepEqual(found(text, 'PERSON'), ['Oppliger', 'Rochat-Favre', 'Bernasconi']);
  });

  it('finds the names of relatives after a word for them (regression: "Ihre Tochter Lea (7)" stayed visible)', () => {
    const text = 'Ihre Tochter Lea (7) übernachtet bei der Grossmutter. Ehefrau Claudia (Buchhaltung). Sohn Noah und Tochter Lina. '
      + 'Seine Schwester Monika Schaller-Huber lebt in Kanada. He stays with his brother Vincent in Cranston. Sa fille Nathalie Rochat. mia sorella Federica';
    assert.deepEqual(found(text, 'PERSON'), ['Vincent', 'Nathalie Rochat', 'Federica', 'Monika Schaller-Huber', 'Lea', 'Claudia', 'Noah', 'Lina']);
  });

  it('does not take German nouns after a word for a relative, or a noun after the French "son", for names', () => {
    assert.deepEqual(found('Wir müssen der Mutter Bescheid geben, weil die Tochter Angst hat und der Vater Geld braucht.', 'PERSON'), []);
    assert.deepEqual(found('Die Mutter gibt dem Sohn Bescheid, wenn sich etwas ändert.', 'PERSON'), []);
    assert.deepEqual(found('La fondation et son Conseil ont décidé. Her son Mark called.', 'PERSON'), ['Mark']);
  });

  it('finds a postal code and town on a line of its own or after a comma (regression: "1752 Villars-sur-Glâne" below the street)', () => {
    const text = 'Monsieur\nJoël Clerc\nRoute de la Glâne 120\n1752 Villars-sur-Glâne\n\nKanzlei, 9001 St. Gallen, 6. Oktober 2026\n  CH-6300 Zug\n'
      + '3294 Büren an der Aare\n2300 La Chaux-de-Fonds.\nEr ist seit 2014 Mandant. 2014 Mandant seit\n';
    assert.deepEqual(found(text, 'ADDRESS').filter((t) => /^(?:CH-)?\d/.test(t)), ['1752 Villars-sur-Glâne', '9001 St. Gallen', 'CH-6300 Zug', '3294 Büren an der Aare',
      '2300 La Chaux-de-Fonds']);
  });

  it('finds user names in home folder paths and serial numbers after "S/N" (regression: "C:\\Users\\mkeller", "S/N PF3EXAMPLE")', () => {
    const text = 'Datei C:\\Users\\mkeller\\Documents\\Mandate\\x.docx, /home/anna.meier/.ssh/id_rsa, /Users/rkeller/Desktop; Device S/N PF3EXAMPLE';
    assert.deepEqual(found(text, 'USERNAME'), ['mkeller', 'anna.meier', 'rkeller']);
    assert.ok(found(text, 'ID').includes('PF3EXAMPLE'));
  });

  it('finds dates of birth after the words that announce them, in four languages', () => {
    const text = [
      'Patient: Herr Hans Muster, geb. 14.02.1961, AHV', 'Mme Claire Rochat, née le 1er mars 1980 à Sion', 'né le 21 juin 1975',
      'Paziente: Giorgio Dalla Valle, nato il 5.3.1958', 'DOB: 03/22/1990', 'born May 4, 1971 in Bern', 'Feld geburtsdatum = 31.02.1947',
      'geboren am 4. Mai 1971', 'Jahrgang 1961',
    ].join('\n');
    assert.deepEqual(found(text, 'DATE'), ['03/22/1990', '14.02.1961', '1er mars 1980', '21 juin 1975', '5.3.1958', 'May 4, 1971', '31.02.1947', '4. Mai 1971', '1961']);
  });

  it('leaves other dates alone, also after words that only end like a birth cue', () => {
    assert.deepEqual(found('Termin am 14.02.2026; l\'aîné le 3 mai 2026; nata ieri; Born in the USA 1984', 'DATE'), []);
  });

  it('finds the values of identifying columns in CSV exports and Markdown tables', () => {
    const csv = 'id;Vorname;Nachname;Geburtsdatum;Abteilung\n1;Hans;Muster;14.02.1961;Finanzen\n2;Maria;Keller;3.5.1980;IT\n';
    assert.deepEqual(found(csv, 'PERSON'), ['Hans', 'Muster', 'Maria', 'Keller']);
    assert.deepEqual(found(csv, 'DATE'), ['14.02.1961', '3.5.1980']);
    const markdown = '| Nome | Data di nascita | Documento |\n|---|---|---|\n| Agnese Bernasconi | 19.12.1965 | C7Q20984 |\n';
    assert.deepEqual(detectWithPatterns(markdown).filter((e) => e.text !== 'C7Q20984'), [{ text: 'Agnese Bernasconi', category: 'PERSON' }, { text: '19.12.1965', category: 'DATE' }]);
    assert.ok(found(markdown, 'ID').includes('C7Q20984'));
  });

  it('finds the value next to a label in a form laid out as a table, and keeps the rest', () => {
    const form = '| Geburtsdatum | 14.02.1961 |\n| Adresse | Im Bühl 12, 8564 Wäldi |\n| Diagnose | Vorhofflimmern |\n';
    const values = detectWithPatterns(form).map((e) => e.text);
    assert.ok(values.includes('14.02.1961') && values.includes('Im Bühl 12, 8564 Wäldi'), values.join(' | '));
    assert.ok(!values.includes('Vorhofflimmern'));
  });

  it('finds subject IDs, randomisation numbers and initials in a study listing (regression: "101-001", "G.H.")', () => {
    const listing = '| Subject ID | Initials | Sex | Age | Site | Randomisation no. | Status |\n|---|---|---|---|---|---|---|\n| 101-001 | G.H. | M | 35 | 101 | R3001 | completed |\n| 102-004 | A.S.-M. | F | 44 | 102 | R3002 | withdrawn |\n';
    const values = detectWithPatterns(listing);
    for (const [text, category] of [['101-001', 'ID'], ['R3001', 'ID'], ['G.H.', 'PERSON'], ['A.S.-M.', 'PERSON']]) assert.ok(values.some((e) => e.text === text && e.category === category), text);
    for (const kept of ['M', 'F', '35', '101', 'completed', 'Initials']) assert.ok(!values.some((e) => e.text === kept), kept);
  });

  it('finds postal code and town after the name of an institution in a table cell, but not a year in a sentence (regression: "Vennes 1010 Lausanne")', () => {
    const text = '| 103 | Unité clinique Vennes 1010 Lausanne   | Dr X |\nZentrum 79106 Freiburg im Breisgau\nseit 2014 Mandant.\nim Jahr 2014 Zürich besucht';
    assert.deepEqual(found(text, 'ADDRESS'), ['1010 Lausanne', '79106 Freiburg im Breisgau']);
  });

  it('reads a table continued after a page break with the labels of the table before it (regression: "102-001" on page 9)', () => {
    const pages = '| Subject ID | Initials | Status |\n|---|---|---|\n| 101-001 | G.H. | completed |\n\n--- Page 9 ---\n\n| 102-001 | G.M. | completed |\n|---|---|---|\n| 102-002 | K.L. | withdrawn |\n';
    const values = detectWithPatterns(pages).map((e) => e.text);
    for (const text of ['101-001', 'G.H.', '102-001', 'G.M.', '102-002', 'K.L.']) assert.ok(values.includes(text), text);
    assert.ok(!values.includes('completed') && !values.includes('withdrawn'));
  });

  it('reads a CSV export whose cells contain the separator in quotes (regression: "Viktor" in an HR export)', () => {
    const csv = 'id,first_name,last_name,notes\nHPS-1,Hans,Muster,"permit G, cross-border"\nHPS-2,Viktor,Keller,none\n';
    assert.deepEqual(found(csv, 'PERSON'), ['Hans', 'Muster', 'Viktor', 'Keller']);
  });

  it('does not hide row numbers, column headers or cells of other columns', () => {
    const csv = 'Nr;Name;Status;Konto\n1;Hans Muster;aktiv;offen\n2;Maria Keller;inaktiv;CH93 0076 2011 6238 5295 7\n';
    const values = detectWithPatterns(csv).map((e) => e.text);
    for (const kept of ['1', '2', 'aktiv', 'inaktiv', 'offen', 'Name', 'Konto']) assert.ok(!values.includes(kept), kept);
    assert.ok(values.includes('Hans Muster') && values.includes('CH93 0076 2011 6238 5295 7'));
  });

  it('finds IDs, e-mail addresses and host names that PDF extraction wrapped after a hyphen (regression: "harrowgate- analytics.example")', () => {
    const text = 'Buchung TA- 2601178 am 3.1.\n| oliver.pemberton@harrowgate- analytics.example | eval-lindwurm- 01.harrowgate- analytics.example |';
    assert.deepEqual(detectWithPatterns(text).map((e) => [e.text, e.category]), [
      ['oliver.pemberton@harrowgate- analytics.example', 'EMAIL'], ['eval-lindwurm- 01.harrowgate- analytics.example', 'HOST'], ['TA- 2601178', 'ID']]);
  });

  it('finds computer names without a domain, and leaves codes and versions alone (regression: "sur-nb002", "ETUDE-PC-07")', () => {
    const text = 'Clients sur-nb002, sgrh-scan03 und db-billing-01; Poste ETUDE-PC-07, LT-LMO-05. ICD-10, COVID-19, sha-256, covid-19, utf-8, gpt-4o, e-mail.';
    assert.deepEqual(found(text, 'HOST'), ['sur-nb002', 'sgrh-scan03', 'db-billing-01', 'ETUDE-PC-07', 'LT-LMO-05']);
  });

  it('finds Swiss towns named without a postal code (regression: "attinente di Poschiavo", "Schadenzentrum Hochdorf")', () => {
    const text = 'Attinente di Poschiavo, residente a Mendrisio. Schadenzentrum Hochdorf; La Chaux-de-Fonds und St. Gallen.';
    assert.deepEqual(found(text, 'LOCATION'), ['Poschiavo', 'Mendrisio', 'Hochdorf', 'La Chaux-de-Fonds', 'St. Gallen']);
  });

  it('leaves town names that are also common words alone ("Berg", "Lohn", "Chemin", "Root")', () => {
    assert.deepEqual(found('Der Lohn am Berg; chemin du Port; root cause, Root Cause Analysis.', 'LOCATION'), []);
  });

  it('keeps the seat of a court readable ("Bezirksgericht Hochdorf", "Pretura di Mendrisio")', () => {
    const text = 'Bezirksgericht Hochdorf, Pretura di Mendrisio, Tribunal d\'arrondissement de Lausanne; wohnhaft in Hochdorf.';
    assert.deepEqual(found(text, 'LOCATION'), ['Hochdorf']);
  });

  it('lists each value once, with the category of the first pattern that finds it', () => {
    const values = detectWithPatterns('AHV-Nr.: 756.1234.5678.97').map((e) => [e.text, e.category]);
    assert.deepEqual(values, [['756.1234.5678.97', 'ID']]);
  });
});
