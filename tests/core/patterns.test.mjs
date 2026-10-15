import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knownGap } from '../helpers/known-gaps.mjs';
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

  it('KNOWN GAP: URLs at the end of a sentence exclude the full stop', knownGap('the full stop becomes part of the URL value; harmless but noisy'), () => {
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
      'Rebgasse 21', 'Lindenhofweg 3', 'Rue du Rhône 42', 'Place Pury 4', 'Via ai Grotti 9']);
  });

  it('finds phone numbers with dots, and never starts a phone number inside another value (regression: "415.555.8822", "503) 555-0142")', () => {
    const text = 'reached at 415.555.8822, Tel. 044.555.22.33, (503) 555-0142, Member ID: XYZ123456789, DOB 1990 (03/22/1990); not 02.09.2026 or 203.0.113.45';
    assert.deepEqual(found(text, 'PHONE'), ['(503) 555-0142', '415.555.8822']);
    // four groups like an IPv4 address: hidden, but under IP
    assert.ok(found(text, 'IP').includes('044.555.22.33'));
  });

  it('lists each value once, with the category of the first pattern that finds it', () => {
    const values = detectWithPatterns('AHV-Nr.: 756.1234.5678.97').map((e) => [e.text, e.category]);
    assert.deepEqual(values, [['756.1234.5678.97', 'ID']]);
  });
});
