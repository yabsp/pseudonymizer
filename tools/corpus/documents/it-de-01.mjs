const DOMAIN = 'sonnenberg-treuhand.example';
const FIRST = ['Anna', 'Beat', 'Claudia', 'Daniel', 'Esther', 'Fabian', 'Gabriela', 'Heinz', 'Irene', 'Jonas', 'Karin',
  'Lukas', 'Martina', 'Nico', 'Olivia', 'Pascal', 'Regula', 'Simon', 'Tanja', 'Urs', 'Vanessa', 'Werner', 'Yvonne'];
const LAST = ['Baumann', 'Bühler', 'Achermann', 'Portmann', 'Wicki', 'Stocker', 'Bucher', 'Lustenberger', 'Estermann',
  'Schnider', 'Kurmann', 'Bisang', 'Gisler', 'Tschopp', 'Steffen', 'Arnet', 'Zihlmann', 'Huwiler', 'Rölli'];
const DEPARTMENTS = [
  ['Treuhand', 'GG-Treuhand'],
  ['Steuern', 'GG-Steuern'],
  ['Revision', 'GG-Revision'],
  ['Lohnbuchhaltung', 'GG-Lohn'],
  ['Treuhand', 'GG-Treuhand'],
  ['Sekretariat', 'GG-Sekretariat'],
  ['Steuern', 'GG-Steuern'],
];
const USER_COUNT = 38;
const hex = (n) => n.toString(16).toUpperCase().padStart(2, '0');
const ascii = (s) => s.toLowerCase().replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae');

const USERS = Array.from({ length: USER_COUNT }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 5 + 3) % LAST.length];
  const [department, group] = DEPARTMENTS[i % DEPARTMENTS.length];
  return {
    name: `${first} ${last}`,
    username: ascii(first[0] + last),
    email: `${ascii(first)}.${ascii(last)}@${DOMAIN}`,
    department,
    group,
    site: i % 4 === 3 ? 'Luzern' : 'Sursee',
    vpn: i % 3 !== 2,
    vpnIp: `10.40.90.${20 + i}`,
    notebook: `sur-nb${String(i + 1).padStart(3, '0')}`,
    notebookIp: `10.40.20.${101 + i}`,
    mac: `3C:52:82:1A:${hex((i * 37 + 16) % 256)}:${hex((i * 91 + 7) % 256)}`,
  };
});

const SERVERS = [
  ['sur-fw01', '10.40.0.1', '-', 'FortiGate 100F, Perimeter-Firewall, SSL-VPN-Gateway', 'Management'],
  ['sur-sw-core01', '10.40.0.2', '-', 'Core-Switch (Layer 3), Routing zwischen den VLANs', 'Management'],
  ['sur-dc01', '10.40.10.11', '00:15:5D:28:0B:11', 'Domain Controller, DNS, DHCP (Windows Server 2022)', 'Server'],
  ['sur-dc02', '10.40.10.12', '00:15:5D:28:0B:12', 'Domain Controller, DNS (Windows Server 2022)', 'Server'],
  ['sur-fs01', '10.40.10.20', '00:15:5D:28:0B:20', 'Fileserver, Mandantenablage, DFS-Namespace', 'Server'],
  ['sur-sql01', '10.40.10.30', '00:15:5D:28:0B:30', 'Microsoft SQL Server 2022, Datenbanken der Buchhaltungs- und Lohnsoftware', 'Server'],
  ['sur-app01', '10.40.10.31', '00:15:5D:28:0B:31', 'Applikationsserver Abacus (Finanz, Lohn, Debitoren)', 'Server'],
  ['sur-rds01', '10.40.10.41', '00:15:5D:28:0B:41', 'Remote Desktop Session Host 1', 'Server'],
  ['sur-rds02', '10.40.10.42', '00:15:5D:28:0B:42', 'Remote Desktop Session Host 2, Connection Broker', 'Server'],
  ['sur-mon01', '10.40.10.50', '00:15:5D:28:0B:50', 'Monitoring (Checkmk), Syslog-Sammler', 'Server'],
  ['sur-pki01', '10.40.10.60', '00:15:5D:28:0B:60', 'Interne Zertifizierungsstelle (Enterprise CA)', 'Server'],
  ['sur-print01', '10.40.10.70', '00:15:5D:28:0B:70', 'Druckserver, Scan-to-Folder', 'Server'],
  ['sur-hv01', '10.40.0.21', '9C:DC:71:4E:20:01', 'Hyper-V-Host 1 (Cluster-Knoten)', 'Management'],
  ['sur-hv02', '10.40.0.22', '9C:DC:71:4E:20:02', 'Hyper-V-Host 2 (Cluster-Knoten)', 'Management'],
  ['sur-bkp01', '10.40.15.10', '9C:DC:71:4E:20:10', 'Backup-Server (Veeam Backup & Replication), physisch', 'Backup'],
  ['sur-nas01', '10.40.15.20', '00:11:32:9A:41:20', 'Backup-Repository mit Unveränderbarkeit (immutable, 30 Tage)', 'Backup'],
  ['sur-ap01', '10.40.0.31', '-', 'WLAN-Access-Point EG', 'Management'],
  ['sur-ap02', '10.40.0.32', '-', 'WLAN-Access-Point 1. OG', 'Management'],
  ['sur-ap03', '10.40.0.33', '-', 'WLAN-Access-Point 2. OG', 'Management'],
  ['sur-mfp01', '10.40.40.11', '00:26:73:5C:11:01', 'Multifunktionsdrucker EG', 'Drucker'],
  ['sur-mfp02', '10.40.40.12', '00:26:73:5C:11:02', 'Multifunktionsdrucker 1. OG', 'Drucker'],
  ['luz-fw01', '10.41.0.1', '-', 'FortiGate 40F, Filiale Luzern, IPsec-Tunnel nach Sursee', 'Filiale'],
  ['luz-fs01', '10.41.10.20', '00:15:5D:31:0C:20', 'Lokaler Cache-Fileserver Filiale Luzern (DFS-Replikat)', 'Filiale'],
  ['luz-mfp01', '10.41.40.11', '00:26:73:5C:12:01', 'Multifunktionsdrucker Filiale Luzern', 'Filiale'],
];

const VLANS = [
  ['1', 'nicht verwendet', '-', 'Default-VLAN deaktiviert, alle Ports explizit zugewiesen'],
  ['10', 'Management', '10.40.0.0/24', 'Switches, Access Points, Hypervisor, Firewall-Interfaces'],
  ['15', 'Backup', '10.40.15.0/24', 'Backup-Server und Repository, nur aus VLAN 10 erreichbar'],
  ['20', 'Server', '10.40.10.0/24', 'Virtuelle Server (Domain, Datei, Datenbank, Applikation)'],
  ['30', 'Clients', '10.40.20.0/24', 'Notebooks und Docking-Stationen der Mitarbeitenden'],
  ['35', 'WLAN intern', '10.40.30.0/24', 'WPA3-Enterprise mit Zertifikat (EAP-TLS), nur verwaltete Geräte'],
  ['40', 'Drucker', '10.40.40.0/24', 'Multifunktionsgeräte, nur Druckserver und Scan-Ziel erlaubt'],
  ['50', 'Gäste', '10.40.50.0/24', 'Gäste-WLAN, nur Internet, Client-Isolation aktiv'],
  ['90', 'VPN', '10.40.90.0/24', 'Adresspool SSL-VPN für Fernzugriff'],
  ['-', 'Filiale Luzern', '10.41.0.0/16', 'Gleiche Segmentierung, über IPsec-Tunnel angebunden'],
];

const FIREWALL = [
  ['FW-010', 'VLAN 30 Clients', 'VLAN 20 Server', 'SMB 445, RDP 3389 (nur RDS), Abacus 40000-40010, DNS 53, Kerberos 88, LDAP 389/636', 'erlauben'],
  ['FW-020', 'VLAN 90 VPN', 'sur-rds01, sur-rds02', 'RDP 3389', 'erlauben'],
  ['FW-021', 'VLAN 90 VPN', 'VLAN 20 Server', 'DNS 53, Kerberos 88, alle übrigen Dienste', 'verweigern'],
  ['FW-030', 'VLAN 20 Server', 'VLAN 15 Backup', 'Veeam 9392-9401, 2500-3300', 'erlauben'],
  ['FW-031', 'VLAN 30 Clients', 'VLAN 15 Backup', 'alle', 'verweigern, protokollieren'],
  ['FW-040', 'VLAN 40 Drucker', 'sur-print01', 'SMB 445 (Scan-to-Folder)', 'erlauben'],
  ['FW-050', 'VLAN 50 Gäste', 'intern (alle RFC1918-Netze)', 'alle', 'verweigern'],
  ['FW-051', 'VLAN 50 Gäste', 'Internet', 'HTTP/HTTPS, DNS über Firewall', 'erlauben, Bandbreite 20 Mbit/s'],
  ['FW-060', 'Internet', 'sur-fw01 (203.0.113.45)', 'HTTPS 443 (SSL-VPN), IKE 500/4500 (Filiale)', 'erlauben, Geo-IP nur CH/LI/DE/AT'],
  ['FW-070', 'VLAN 10 Management', 'alle VLANs', 'SSH 22, HTTPS 443, SNMP 161, WinRM 5986', 'erlauben, nur von sur-mon01 und Admin-PAW'],
  ['FW-080', 'VLAN 20 Server', 'Internet', 'HTTPS 443 nur zu freigegebenen FQDN (Updates, Lizenzserver)', 'erlauben'],
  ['FW-099', 'alle', 'alle', 'alle', 'verweigern, protokollieren (Default Deny)'],
];

const SERVICE_ACCOUNTS = [
  ['svc_abacus', 'sur-app01, sur-sql01', 'Dienst Abacus und Datenbankzugriff (db_owner auf ABACUS_PROD)', 'gMSA nicht möglich, Passwort 32 Zeichen, Rotation jährlich'],
  ['svc_sqlagent', 'sur-sql01', 'SQL Server Agent, Wartungspläne', 'gMSA'],
  ['svc_veeam', 'sur-bkp01', 'Backup-Jobs, lokale Administratorrechte auf den Hyper-V-Hosts', 'eigene Backup-Domäne, nicht im AD der Firma'],
  ['svc_scan2folder', 'sur-mfp01, sur-mfp02, luz-mfp01', 'Schreibrecht nur auf \\\\sur-fs01\\Scan$', 'Passwort 24 Zeichen, keine interaktive Anmeldung'],
  ['svc_checkmk', 'sur-mon01', 'Monitoring per WinRM, nur lesend (Gruppe "Remote Management Users")', 'gMSA'],
  ['svc_adsync', 'sur-dc01', 'Synchronisation mit Microsoft Entra ID (Kennwort-Hash-Synchronisation)', 'vom Installationsassistenten verwaltet'],
  ['svc_ldap_fw', 'sur-fw01, luz-fw01', 'LDAP-Bind der Firewall für VPN-Gruppenprüfung, nur lesend', 'Passwort 28 Zeichen, Rotation halbjährlich'],
  ['svc_print', 'sur-print01', 'Druckwarteschlangen, Treiberverteilung', 'gMSA'],
];

const GROUPS = [
  ['GG-Treuhand', 'DL-Mandanten-RW, DL-Abacus-Fibu', 'Mandantenordner lesen/schreiben, Abacus Finanzbuchhaltung'],
  ['GG-Steuern', 'DL-Mandanten-RW, DL-Steuer-Software', 'Mandantenordner, Steuererklärungsprogramme'],
  ['GG-Revision', 'DL-Mandanten-RO, DL-Revision-RW', 'Mandantenordner nur lesen, Revisionsablage schreiben'],
  ['GG-Lohn', 'DL-Lohn-RW, DL-Abacus-Lohn', 'Lohnordner (getrennte Freigabe), Abacus Lohnbuchhaltung'],
  ['GG-Sekretariat', 'DL-Post-RW, DL-Mandanten-Stammdaten-RO', 'Posteingang, Stammdaten nur lesen'],
  ['GG-Geschaeftsleitung', 'DL-GL-RW, DL-Mandanten-RO, DL-Lohn-RO', 'GL-Ablage, Leserechte auf alle Fachablagen'],
  ['GG-VPN-Benutzer', 'DL-VPN-RDS', 'SSL-VPN mit Zugriff auf die RDS-Farm'],
  ['GG-IT-Admin', 'DL-Server-Admin (Tier 1)', 'Serveradministration, nur mit adm-Konto und PAW'],
];

const row = (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;

const CONNECTION_STRING = `Server=sur-sql01.ad.${DOMAIN},1433;Database=ABACUS_PROD;User Id=svc_abacus;Password=Tr3u#Sonnen!2026sql;Encrypt=True;TrustServerCertificate=False`;

const generatedValues = [
  ...USERS.flatMap((u) => [
    { text: u.name, category: 'PERSON' },
    { text: u.username, category: 'USERNAME' },
    { text: u.email, category: 'EMAIL' },
    { text: u.notebook, category: 'HOST' },
    { text: u.notebookIp, category: 'IP' },
    { text: u.mac, category: 'MAC' },
    ...(u.vpn ? [{ text: u.vpnIp, category: 'IP' }] : []),
  ]),
  ...SERVERS.flatMap(([host, ip, mac]) => [
    { text: host, category: 'HOST' },
    { text: ip, category: 'IP' },
    ...(mac !== '-' ? [{ text: mac, category: 'MAC' }] : []),
  ]),
  ...VLANS.filter((v) => v[2] !== '-').map((v) => ({ text: v[2], category: 'IP' })),
  ...SERVICE_ACCOUNTS.map(([name]) => ({ text: name, category: 'USERNAME' })),
];

export default {
  id: 'it-de-01',
  domain: 'it',
  language: 'de',
  title: 'Netzwerk- und Berechtigungskonzept',
  header: 'TREUHAND SONNENBERG AG | Netzwerk- und Berechtigungskonzept v2.3 | Owner: R. AMSTUTZ',
  footer: 'Klassifikation VERTRAULICH - Verteiler: Geschäftsleitung, IT-Koordination, Netzwerk Pilatus GmbH',
  parts: [
    {
      html: String.raw`
<p class="small">Treuhand Sonnenberg AG, Bahnhofstrasse 8, 6210 Sursee, CHE-339.842.107, Filiale Pilatusstrasse 21, 6003 Luzern</p>
<h1>Netzwerk- und Berechtigungskonzept</h1>
<table class="facts">
<tr><th>Dokument</th><td>Netzwerk- und Berechtigungskonzept, Version 2.3 vom 5. Oktober 2026</td></tr>
<tr><th>Gültig ab</th><td>1. November 2026, ersetzt Version 2.2 vom 14. März 2025</td></tr>
<tr><th>Dokumentverantwortung</th><td>Roland Amstutz, Mitglied der Geschäftsleitung, roland.amstutz@${DOMAIN}, 041 555 92 10</td></tr>
<tr><th>Datenschutzberaterin</th><td>Brigitte Zemp, brigitte.zemp@${DOMAIN}, 041 555 92 14</td></tr>
<tr><th>IT-Koordination intern</th><td>Reto Kälin, reto.kaelin@${DOMAIN}, 041 555 92 31</td></tr>
<tr><th>Externer IT-Dienstleister</th><td>Netzwerk Pilatus GmbH, Dominik Rüttimann, dominik.ruettimann@netzwerk-pilatus.example, 041 555 62 80</td></tr>
<tr><th>Klassifikation</th><td>Vertraulich, nur für den internen Gebrauch und den beauftragten IT-Dienstleister</td></tr>
</table>
<h2>1. Zweck und Ausgangslage</h2>
<p>Die Treuhand Sonnenberg AG erbringt für rund 640 Mandanten Dienstleistungen in den Bereichen
Finanzbuchhaltung, Lohnbuchhaltung, Steuerberatung und eingeschränkte Revision. Die Mitarbeitenden bearbeiten
dabei laufend besonders schützenswerte Personendaten (Lohnausweise, Krankheitsabsenzen, Angaben zu
Konfessionen in Steuererklärungen, Betreibungsauskünfte) und Geschäftsgeheimnisse der Mandanten. Als
Revisionsunternehmen und als Beauftragte der Mandanten unterliegen die Mitarbeitenden einer vertraglichen und
teilweise strafrechtlich geschützten Schweigepflicht (Art. 321 StGB für die Revisionsstelle, Art. 730b Abs. 2
OR, Art. 62 DSG).</p>
<p>Dieses Konzept beschreibt die Netzwerksegmentierung, die eingesetzten Server und Netzwerkkomponenten, den
Fernzugriff, das Berechtigungsmodell im Active Directory sowie die Regeln für privilegierte Konten und
Servicekonten. Es bildet die Grundlage für die technischen und organisatorischen Massnahmen (TOM) gemäss
Art. 8 DSG und Art. 1 bis 3 DSV und ist Bestandteil des Informationssicherheits-Managements der Firma. Ziel ist,
dass jede Person nur auf jene Daten zugreifen kann, die sie für ihre Aufgabe benötigt (Need-to-know-Prinzip),
und dass ein kompromittiertes Gerät oder Konto nicht das ganze Netzwerk gefährdet.</p>
<p>Anlass der Revision 2.3 sind die Inbetriebnahme der Filiale Luzern, die Ablösung des bisherigen
IPsec-Client-VPN durch SSL-VPN mit Multi-Faktor-Authentifizierung (MFA), die Einführung des Tiering-Modells für
Administratorkonten sowie die Feststellungen der Prüfung durch die externe Revisionsstelle vom Juni 2026
(fehlende Rezertifizierung der Berechtigungen, Servicekonto mit Domänen-Administratorrechten).</p>
<h2>2. Geltungsbereich</h2>
<p>Das Konzept gilt für alle IT-Systeme der Treuhand Sonnenberg AG an den Standorten Sursee (Hauptsitz) und
Luzern (Filiale), für alle Mitarbeitenden, Lernenden und temporären Mitarbeitenden sowie für den externen
IT-Dienstleister, soweit er im Auftrag der Firma auf die Systeme zugreift. Nicht Gegenstand sind die
Cloud-Dienste Microsoft 365 (eigenes Konzept "M365-Governance" vom Mai 2026) und die Branchensoftware
im Rechenzentrum des Herstellers.</p>
<h2>3. Rollen und Verantwortlichkeiten</h2>
<table class="grid">
<tr><th>Rolle</th><th>Person / Stelle</th><th>Aufgaben</th></tr>
<tr><td>Systemeigner (Owner)</td><td>Roland Amstutz</td><td>Genehmigt das Konzept und Ausnahmen, entscheidet über Risikoakzeptanz</td></tr>
<tr><td>Datenschutzberaterin</td><td>Brigitte Zemp</td><td>Prüft Bearbeitungen besonders schützenswerter Daten, führt das Verzeichnis der Bearbeitungstätigkeiten (Art. 12 DSG)</td></tr>
<tr><td>IT-Koordination</td><td>Reto Kälin</td><td>Erfasst Ein- und Austritte, beantragt Berechtigungen, erster Ansprechpartner der Mitarbeitenden</td></tr>
<tr><td>Dateneigner</td><td>Bereichsleitende</td><td>Genehmigen Zugriffe auf ihre Ablagen, rezertifizieren die Berechtigungen halbjährlich</td></tr>
<tr><td>Betrieb</td><td>Netzwerk Pilatus GmbH</td><td>Betrieb, Patching, Backup, Überwachung, Umsetzung der Berechtigungsanträge</td></tr>
</table>
`,
    },
    {
      html: String.raw`
<h2>4. Rechtliche und regulatorische Anforderungen</h2>
<ul>
<li><b>Datenschutz:</b> Art. 8 DSG verlangt eine dem Risiko angemessene Datensicherheit. Nach Art. 3 DSV sind
insbesondere Zugriffskontrolle, Benutzerkontrolle, Datenträgerkontrolle, Speicherkontrolle und
Wiederherstellbarkeit sicherzustellen. Für besonders schützenswerte Personendaten wird die Bearbeitung
protokolliert (Art. 4 DSV).</li>
<li><b>Aufbewahrung:</b> Geschäftsbücher und Buchungsbelege der Mandanten sind während zehn Jahren
aufzubewahren (Art. 958f OR); die Integrität elektronisch aufbewahrter Unterlagen richtet sich nach der GeBüV.</li>
<li><b>Revisionsaufsicht:</b> Die eingeschränkten Revisionen unterliegen den Anforderungen an die
Unabhängigkeit (Art. 729 OR); Revisionsakten dürfen für das Treuhandteam desselben Mandanten nicht zugänglich
sein (Trennung von Buchführung und Prüfung).</li>
<li><b>Meldepflicht:</b> Verletzungen der Datensicherheit, die voraussichtlich zu einem hohen Risiko führen,
sind dem EDÖB so rasch als möglich zu melden (Art. 24 DSG). Das Vorgehen ist im Notfallhandbuch beschrieben.</li>
<li><b>Vertrag mit dem Dienstleister:</b> Die Netzwerk Pilatus GmbH bearbeitet Daten im Auftrag (Art. 9 DSG).
Der Auftragsbearbeitungsvertrag vom 2. Februar 2024 verpflichtet sie zur Geheimhaltung und erlaubt
Unterauftragnehmer nur nach vorgängiger schriftlicher Genehmigung.</li>
</ul>
<h2>5. Netzwerkarchitektur</h2>
<p>Der Hauptsitz Sursee ist über einen Glasfaseranschluss (1 Gbit/s symmetrisch, feste öffentliche Adresse
203.0.113.45) mit dem Internet verbunden; ein 4G-Router dient als Ersatzverbindung mit automatischer
Umschaltung. Die Filiale Luzern ist über einen IPsec-Tunnel (IKEv2, AES-256-GCM, Diffie-Hellman-Gruppe 20) mit
dem Hauptsitz verbunden; ihre öffentliche Adresse lautet 198.51.100.140. Der gesamte Datenverkehr der Filiale
ins Internet läuft über den Hauptsitz (kein Split-Tunneling), damit die zentralen Filter- und
Protokollierungsregeln gelten.</p>
<p>Das interne Netz ist in VLANs segmentiert. Das Routing zwischen den VLANs erfolgt ausschliesslich über die
Firewall sur-fw01 (nicht über den Core-Switch), damit jeder Übergang einer Regel unterliegt. Der
Core-Switch routet nur das Management-VLAN.</p>
<table class="grid">
<tr><th>VLAN</th><th>Bezeichnung</th><th>Netz</th><th>Zweck und Regeln</th></tr>
${VLANS.map(row).join('\n')}
</table>
<p>Die DHCP-Bereiche der Clients sind auf reservierte Adressen beschränkt; unbekannte Geräte erhalten im
VLAN 30 keine Adresse (MAC-basierte Reservierung zusammen mit 802.1X an den Switchports). Nicht verwendete
Switchports sind deaktiviert und dem VLAN 999 (Quarantäne) zugewiesen.</p>
<h2>6. Server und Netzwerkkomponenten</h2>
<table class="grid">
<tr><th>Hostname</th><th>IP-Adresse</th><th>MAC-Adresse</th><th>Funktion</th><th>Zone</th></tr>
${SERVERS.map(row).join('\n')}
</table>
<p>Die Server sind Mitglieder der Domäne ad.${DOMAIN}. Die Domain Controller sur-dc01 und sur-dc02 laufen auf
unterschiedlichen Hyper-V-Hosts. Die Hyper-V-Hosts und der Backup-Server sind nicht Mitglied der Domäne, damit
ein kompromittiertes Domänenkonto weder die Virtualisierung noch die Datensicherung übernehmen kann.</p>
`,
    },
    {
      html: String.raw`
<h2>7. Arbeitsplatzgeräte</h2>
<p>Alle Mitarbeitenden arbeiten mit verwalteten Notebooks (Windows 11 Enterprise, BitLocker mit TPM und PIN,
Microsoft Defender for Endpoint). Die Geräte werden über Intune verwaltet und erhalten feste Adressen im
VLAN 30. Private Geräte dürfen nicht mit dem internen Netz verbunden werden; sie können das Gäste-WLAN nutzen.</p>
<table class="grid">
<tr><th>Gerät</th><th>IP-Adresse</th><th>MAC-Adresse</th><th>Benutzer</th><th>Standort</th></tr>
${USERS.map((u) => row([u.notebook, u.notebookIp, u.mac, u.username, u.site])).join('\n')}
</table>
`,
    },
    {
      html: String.raw`
<h2>8. Firewall-Regelwerk (Auszug)</h2>
<p>Das Regelwerk folgt dem Grundsatz "Default Deny": Alles, was nicht ausdrücklich erlaubt ist, wird
verweigert. Jede Regel hat eine eindeutige Nummer, einen Zweck und einen Verantwortlichen; Änderungen werden im
Ticketsystem der Netzwerk Pilatus GmbH beantragt und von Roland Amstutz oder Reto Kälin freigegeben.</p>
<table class="grid">
<tr><th>Regel</th><th>Quelle</th><th>Ziel</th><th>Dienste</th><th>Aktion</th></tr>
${FIREWALL.map(row).join('\n')}
</table>
<p>Die Firewall prüft ausgehenden HTTPS-Verkehr der Clients mit Webfilter und Anwendungskontrolle; die
TLS-Inspektion ist für Banken- und Gesundheitsseiten deaktiviert. Die Protokolle der Firewall werden an
sur-mon01 gesendet und 12 Monate aufbewahrt.</p>
<h2>9. Fernzugriff (SSL-VPN)</h2>
<p>Der Fernzugriff erfolgt ausschliesslich über das SSL-VPN der Firewall sur-fw01 unter der Adresse
vpn.${DOMAIN} (203.0.113.45, Port 443). Die Anmeldung erfordert Benutzername, Passwort und einen zweiten Faktor
(FortiToken Mobile, TOTP). Zusätzlich muss das Gerät ein gültiges Gerätezertifikat der internen
Zertifizierungsstelle sur-pki01 vorweisen; private Geräte können sich daher nicht verbinden. Nach der
Verbindung können die Mitarbeitenden ausschliesslich die Remote-Desktop-Farm (sur-rds01, sur-rds02) erreichen;
der direkte Zugriff auf Fileserver und Datenbank aus dem VPN ist gesperrt (Regel FW-021).</p>
<p>Jeder berechtigten Person wird eine feste Adresse aus dem VPN-Pool zugewiesen, damit die Protokolle eindeutig
einer Person zugeordnet werden können. Die Berechtigung wird über die Gruppe GG-VPN-Benutzer gesteuert und
bei Austritt am letzten Arbeitstag um 17.00 Uhr entzogen.</p>
<table class="grid">
<tr><th>Benutzer</th><th>Name</th><th>Feste VPN-Adresse</th><th>Gerät</th></tr>
${USERS.filter((u) => u.vpn).map((u) => row([u.username, u.name, u.vpnIp, u.notebook])).join('\n')}
</table>
<p>Der externe Dienstleister verbindet sich über ein eigenes VPN-Profil "Pilatus-Support" mit MFA, das nur
nach Freigabe durch die IT-Koordination für jeweils 8 Stunden aktiviert wird. Die Sitzungen werden
aufgezeichnet.</p>
`,
    },
    {
      html: String.raw`
<h2>10. Identitäten und Berechtigungsmodell</h2>
<p>Alle Berechtigungen werden nach dem AGDLP-Prinzip vergeben: Benutzerkonten (Accounts) werden Mitglied
globaler Rollengruppen (GG-), diese werden Mitglied domänenlokaler Ressourcengruppen (DL-), und nur die
domänenlokalen Gruppen erhalten Berechtigungen (Permissions) auf Freigaben, Ordner und Anwendungen. Direkte
Berechtigungen für einzelne Benutzerkonten sind nicht zulässig. Jede Gruppe hat einen Dateneigner, der Anträge
genehmigt und die Mitgliedschaften halbjährlich rezertifiziert.</p>
<table class="grid">
<tr><th>Rollengruppe</th><th>Mitglied in</th><th>Wirkung</th></tr>
${GROUPS.map(row).join('\n')}
</table>
<h3>Mandantenablage</h3>
<p>Die Mandantenablage liegt unter \\sur-fs01\Mandanten und ist pro Mandant in Unterordner gegliedert
(Mandantennummer und Kurzname). Die Unterordner "Lohn" und "Revision" sind von der Vererbung ausgenommen und
nur für GG-Lohn bzw. GG-Revision zugänglich. Für Mandanten, bei denen die Firma gleichzeitig Buchführung und
Revision erbringen würde, ist dies aus Gründen der Unabhängigkeit ausgeschlossen; die Revisionsakten sind für
das Treuhandteam nicht sichtbar (Access-Based Enumeration aktiviert).</p>
<h3>Ein-, Um- und Austritte</h3>
<ol>
<li>Die Personalabteilung meldet Eintritte mindestens fünf Arbeitstage im Voraus an die IT-Koordination.</li>
<li>Die IT-Koordination erstellt den Antrag mit Rollengruppen gemäss Stellenbeschreibung; Abweichungen
genehmigt der Dateneigner schriftlich.</li>
<li>Bei einem Wechsel der Abteilung werden die bisherigen Gruppen am Tag des Wechsels entfernt (kein
"Mitnehmen" von Rechten).</li>
<li>Bei Austritt wird das Konto am letzten Arbeitstag deaktiviert, nach 30 Tagen in die OU "Ausgetreten"
verschoben und nach 180 Tagen gelöscht. Das Postfach wird auf Anweisung der Geschäftsleitung 10 Jahre
archiviert.</li>
</ol>
<p>Der folgende Bildschirmausschnitt zeigt die Mitgliedschaften der Gruppe GG-IT-Admin zum Stichtag
1. Oktober 2026 (Prüfung durch die Revisionsstelle):</p>
<div class="as-image">Active Directory-Benutzer und -Computer - ad.${DOMAIN}/Gruppen/Tier1<br>
GG-IT-Admin - Mitglieder:<br>
adm-rkaelin (Reto Kälin) - letzte Anmeldung 30.09.2026 16:42<br>
adm-druettimann (Dominik Rüttimann, Netzwerk Pilatus GmbH) - letzte Anmeldung 28.09.2026 07:15<br>
adm-lzbinden (Laura Zbinden, Netzwerk Pilatus GmbH) - letzte Anmeldung 12.09.2026 21:03</div>
`,
    },
    {
      html: String.raw`
<h2>11. Benutzerverzeichnis</h2>
<p>Stand 1. Oktober 2026, ohne deaktivierte Konten. Die Benutzernamen bestehen aus dem ersten Buchstaben des
Vornamens und dem Nachnamen (ohne Umlaute); bei Namensgleichheit wird eine Ziffer angehängt.</p>
<table class="grid">
<tr><th>Name</th><th>Benutzername</th><th>E-Mail</th><th>Abteilung</th><th>Rollengruppe</th><th>VPN</th></tr>
<tr><td>Roland Amstutz</td><td>ramstutz</td><td>roland.amstutz@${DOMAIN}</td><td>Geschäftsleitung</td><td>GG-Geschaeftsleitung</td><td>ja</td></tr>
<tr><td>Brigitte Zemp</td><td>bzemp</td><td>brigitte.zemp@${DOMAIN}</td><td>Geschäftsleitung</td><td>GG-Geschaeftsleitung</td><td>ja</td></tr>
<tr><td>Reto Kälin</td><td>rkaelin</td><td>reto.kaelin@${DOMAIN}</td><td>IT-Koordination</td><td>GG-Sekretariat</td><td>ja</td></tr>
${USERS.map((u) => row([u.name, u.username, u.email, u.department, u.group, u.vpn ? 'ja' : 'nein'])).join('\n')}
</table>
`,
    },
    {
      html: String.raw`
<h2>12. Privilegierte Konten</h2>
<p>Administrative Tätigkeiten werden nie mit dem persönlichen Arbeitskonto ausgeführt. Jede administrierende
Person erhält ein separates Konto mit dem Präfix "adm-", das nur auf einer Privileged Access Workstation (PAW)
verwendet werden darf. Es gilt ein Tiering-Modell mit drei Ebenen:</p>
<table class="grid">
<tr><th>Ebene</th><th>Systeme</th><th>Konten</th><th>Regeln</th></tr>
<tr><td>Tier 0</td><td>sur-dc01, sur-dc02, sur-pki01, Entra Connect</td><td>t0-rkaelin, t0-druettimann</td><td>Anmeldung nur an Tier-0-Systemen und der PAW, MFA, Konten ohne Postfach</td></tr>
<tr><td>Tier 1</td><td>Server in VLAN 20, Hyper-V-Hosts</td><td>adm-rkaelin, adm-druettimann, adm-lzbinden</td><td>keine Anmeldung an Clients, LAPS für lokale Administratoren</td></tr>
<tr><td>Tier 2</td><td>Notebooks, Drucker</td><td>Intune-Rolle "Helpdesk"</td><td>keine Domänenrechte, nur über Intune</td></tr>
</table>
<p>Das Notfallkonto bg-admin (Domänen-Administrator, "break glass") ist deaktiviert. Sein Passwort ist in zwei
Hälften aufgeteilt, in versiegelten Umschlägen im Tresor des Hauptsitzes und im Bankschliessfach hinterlegt. Die
Verwendung löst eine Alarmierung an Roland Amstutz und Brigitte Zemp aus und ist nachträglich zu begründen.</p>
<h2>13. Servicekonten</h2>
<p>Servicekonten sind nicht interaktiv nutzbar ("Anmelden als Dienst" ja, "Lokal anmelden" und "Über
Remotedesktop anmelden" verweigert) und haben nur die minimal nötigen Rechte. Wo möglich werden Group Managed
Service Accounts (gMSA) verwendet, deren Passwort das Active Directory automatisch wechselt. Das bisherige
Servicekonto svc_backup mit Domänen-Administratorrechten wurde am 18. Juli 2026 gelöscht (Feststellung der
Revisionsstelle).</p>
<table class="grid">
<tr><th>Konto</th><th>Systeme</th><th>Zweck und Rechte</th><th>Passwortverwaltung</th></tr>
${SERVICE_ACCOUNTS.map(row).join('\n')}
</table>
<p>Die Passwörter der Servicekonten ohne gMSA werden im Passwortmanager im Tresor "IT-Service" abgelegt, auf
den nur Reto Kälin und die Administratoren der Netzwerk Pilatus GmbH Zugriff haben. Bei der Analyse für diese
Version wurde festgestellt, dass die Verbindungszeichenfolge der Lohnsoftware mit Klartext-Passwort in der
Konfigurationsdatei C:\Abacus\config\db.config auf sur-app01 gespeichert ist:</p>
<pre>
&lt;add name="AbacusProd" connectionString="${CONNECTION_STRING}" /&gt;
</pre>
<p>Massnahme M-07: Die Datei wird bis 30. November 2026 mit DPAPI verschlüsselt, die NTFS-Rechte werden auf
svc_abacus und die Tier-1-Administratoren beschränkt, und das Passwort wird nach der Umstellung gewechselt.
Bis dahin gilt das Passwort als bekannt für alle Personen, die Zugriff auf sur-app01 hatten.</p>
<h3>Weitere festgestellte Geheimnisse</h3>
<ul>
<li>Pre-Shared Key des IPsec-Tunnels zur Filiale Luzern (wird bis 31. Dezember 2026 durch Zertifikate ersetzt):
Pk7-Lu2026!sursee-tunnel</li>
<li>WLAN-Passwort Gäste (wöchentlich wechselnd, am Empfang angeschrieben): Sonnenberg-Gast-4471</li>
<li>SNMPv2-Community der Access Points (Umstellung auf SNMPv3 offen): sb-ro-7731</li>
</ul>
`,
    },
    {
      columns: 2,
      html: String.raw`
<h1>14. Passwort-, MFA- und Arbeitsplatzrichtlinie</h1>
<h3>Passwörter</h3>
<p>Persönliche Passwörter haben mindestens 14 Zeichen. Empfohlen werden Passphrasen aus mehreren Wörtern. Ein
regelmässiger Wechsel wird nicht erzwungen; das Passwort muss jedoch sofort geändert werden, wenn ein Verdacht
auf Offenlegung besteht oder das Konto in einer bekannten Datenleck-Liste erscheint (Prüfung durch Entra ID
Password Protection). Die letzten 24 Passwörter dürfen nicht wiederverwendet werden. Nach 10 fehlgeschlagenen
Anmeldungen wird das Konto für 15 Minuten gesperrt.</p>
<p>Passwörter werden nie per E-Mail, Telefon oder Chat weitergegeben, auch nicht an die IT-Koordination
oder den Dienstleister. Für das Zurücksetzen gilt ein Rückrufverfahren über die im Personalsystem hinterlegte
Mobiltelefonnummer.</p>
<h3>Multi-Faktor-Authentifizierung</h3>
<p>MFA ist Pflicht für den Fernzugriff, für Microsoft 365 ausserhalb des Firmennetzes, für alle
administrativen Konten und für den Zugriff auf das E-Banking der Mandanten. Zulässige Faktoren sind die
Authenticator-App mit Nummernabgleich und FIDO2-Sicherheitsschlüssel; SMS ist nur als Ersatzverfahren
während höchstens 14 Tagen erlaubt. Der Verlust eines Mobiltelefons oder Schlüssels ist sofort der
IT-Koordination zu melden.</p>
<h3>Arbeitsplatz</h3>
<p>Der Bildschirm wird nach 5 Minuten Inaktivität gesperrt. Beim Verlassen des Arbeitsplatzes ist er manuell
zu sperren (Windows-Taste + L). Ausdrucke mit Mandantendaten werden über "Follow-me-Printing" erst am Gerät
nach Anmeldung mit Badge ausgegeben. USB-Datenträger sind gesperrt; Ausnahmen für verschlüsselte
Datenträger genehmigt die IT-Koordination für jeweils höchstens 30 Tage.</p>
<p>Mandantendaten dürfen nur auf den Firmensystemen gespeichert werden. Private Cloud-Speicher, private
E-Mail-Konten und öffentliche KI-Dienste dürfen für Mandantendaten nicht verwendet werden; zulässig ist nur
der von der Geschäftsleitung freigegebene Dienst mit pseudonymisierten Daten.</p>
<h3>Homeoffice und Reisen</h3>
<p>Im Homeoffice wird ausschliesslich über das SSL-VPN gearbeitet. Gespräche über Mandanten werden so geführt,
dass Dritte nicht mithören können. Auf Reisen ausserhalb der EU und des EWR ist vorgängig die Zustimmung der
Geschäftsleitung einzuholen; die Notebooks werden bei der Einreise in Länder mit Durchsuchungspraxis nicht
mitgeführt.</p>
<h3>Meldung von Sicherheitsvorfällen</h3>
<p>Verdächtige E-Mails werden mit der Schaltfläche "Phishing melden" weitergeleitet. Verdacht auf einen
Sicherheitsvorfall (z. B. unbekannte Anmeldung, verschlüsselte Dateien, verlorenes Gerät) ist sofort der
IT-Koordination, ausserhalb der Bürozeiten dem Pikett der Netzwerk Pilatus GmbH (041 555 62 99) zu melden. Die
Datenschutzberaterin prüft innert 24 Stunden, ob eine Meldung an den EDÖB oder an betroffene Mandanten
erforderlich ist.</p>
<h3>Sanktionen</h3>
<p>Verstösse gegen diese Richtlinie können arbeitsrechtliche Massnahmen bis zur Kündigung nach sich ziehen.
Die Verletzung des Berufsgeheimnisses kann zudem strafrechtliche Folgen haben.</p>
`,
    },
    {
      html: String.raw`
<h2>15. Protokollierung und Überwachung</h2>
<p>Protokolliert werden Anmeldungen (erfolgreich und fehlgeschlagen), Änderungen an privilegierten Gruppen,
Zugriffe auf die Ordner "Lohn" und "Revision", VPN-Verbindungen und Firewall-Regelverletzungen. Die Protokolle
werden zentral auf sur-mon01 gesammelt, gegen Veränderung geschützt und 12 Monate aufbewahrt; Protokolle zu
besonders schützenswerten Personendaten werden gemäss Art. 4 Abs. 5 DSV mindestens ein Jahr getrennt vom
System aufbewahrt. Alarme bei fünf fehlgeschlagenen Anmeldungen eines Administratorkontos, bei Änderungen der
Gruppe "Domänen-Admins" und bei der Verwendung von bg-admin gehen sofort an die Netzwerk Pilatus GmbH und an
Reto Kälin.</p>
<h2>16. Datensicherung</h2>
<p>Die Datensicherung folgt der 3-2-1-Regel: drei Kopien, auf zwei unterschiedlichen Medien, davon eine
ausserhalb des Hauptsitzes. Die virtuellen Server werden täglich um 22.00 Uhr gesichert (Aufbewahrung 30
Tage täglich, 12 Monate monatlich, 10 Jahre jährlich für die Datenbanken der Buchhaltung). Das Repository
sur-nas01 speichert die Sicherungen unveränderbar während 30 Tagen. Eine Kopie wird verschlüsselt (AES-256)
in das Rechenzentrum des Dienstleisters in 6340 Baar repliziert. Die Wiederherstellung wird quartalsweise
getestet (Recovery Time Objective 8 Stunden für Abacus, Recovery Point Objective 24 Stunden).</p>
<h2>17. Rezertifizierung und Kontrolle</h2>
<table class="grid">
<tr><th>Kontrolle</th><th>Häufigkeit</th><th>Verantwortlich</th><th>Nachweis</th></tr>
<tr><td>Rezertifizierung der Gruppenmitgliedschaften durch die Dateneigner</td><td>halbjährlich (März, September)</td><td>Reto Kälin</td><td>unterschriebener Bericht</td></tr>
<tr><td>Prüfung der privilegierten Konten und des Notfallkontos</td><td>quartalsweise</td><td>Roland Amstutz</td><td>Protokoll</td></tr>
<tr><td>Review des Firewall-Regelwerks, Entfernen ungenutzter Regeln</td><td>jährlich</td><td>Netzwerk Pilatus GmbH</td><td>Änderungsticket</td></tr>
<tr><td>Wiederherstellungstest</td><td>quartalsweise</td><td>Netzwerk Pilatus GmbH</td><td>Testprotokoll</td></tr>
<tr><td>Phishing-Simulation und Schulung</td><td>halbjährlich</td><td>Brigitte Zemp</td><td>Teilnehmerliste</td></tr>
<tr><td>Externer Penetrationstest (Perimeter und VPN)</td><td>jährlich</td><td>Roland Amstutz</td><td>Bericht</td></tr>
</table>
<h2>18. Offene Massnahmen</h2>
<table class="grid">
<tr><th>Nr.</th><th>Massnahme</th><th>Termin</th><th>Verantwortlich</th></tr>
<tr><td>M-05</td><td>SNMPv3 auf allen Access Points und Switches, SNMPv2 deaktivieren</td><td>31.12.2026</td><td>Dominik Rüttimann</td></tr>
<tr><td>M-06</td><td>Zertifikatsbasierte Authentifizierung für den IPsec-Tunnel Luzern</td><td>31.12.2026</td><td>Dominik Rüttimann</td></tr>
<tr><td>M-07</td><td>Verschlüsselung der Verbindungszeichenfolge auf sur-app01, Passwortwechsel svc_abacus</td><td>30.11.2026</td><td>Laura Zbinden</td></tr>
<tr><td>M-08</td><td>Einführung von FIDO2-Schlüsseln für die Geschäftsleitung</td><td>31.01.2027</td><td>Reto Kälin</td></tr>
<tr><td>M-09</td><td>Ablösung der lokalen Administratorkonten auf Druckern durch zentrale Verwaltung</td><td>31.03.2027</td><td>Netzwerk Pilatus GmbH</td></tr>
</table>
<h2>19. Freigabe</h2>
<p>Dieses Konzept wurde von der Geschäftsleitung am 5. Oktober 2026 genehmigt und tritt am 1. November 2026 in
Kraft. Es wird jährlich sowie bei wesentlichen Änderungen der Infrastruktur überprüft.</p>
<div class="as-image signature">Roland Amstutz &nbsp;&nbsp;&nbsp;&nbsp; Brigitte Zemp &nbsp;&nbsp;&nbsp;&nbsp; Dominik Rüttimann</div>
<p>Sursee, 5. Oktober 2026 - R. Amstutz (Owner), B. Zemp (Datenschutzberaterin), D. Rüttimann (Netzwerk Pilatus GmbH)</p>
`,
    },
  ],
  values: [
    { text: 'R. AMSTUTZ', category: 'PERSON' },
    { text: 'Roland Amstutz', category: 'PERSON' },
    { text: 'R. Amstutz', category: 'PERSON' },
    { text: `roland.amstutz@${DOMAIN}`, category: 'EMAIL' },
    { text: 'ramstutz', category: 'USERNAME' },
    { text: '041 555 92 10', category: 'PHONE' },
    { text: 'Brigitte Zemp', category: 'PERSON' },
    { text: 'B. Zemp', category: 'PERSON' },
    { text: `brigitte.zemp@${DOMAIN}`, category: 'EMAIL' },
    { text: 'bzemp', category: 'USERNAME' },
    { text: '041 555 92 14', category: 'PHONE' },
    { text: 'Reto Kälin', category: 'PERSON' },
    { text: `reto.kaelin@${DOMAIN}`, category: 'EMAIL' },
    { text: 'rkaelin', category: 'USERNAME' },
    { text: 'adm-rkaelin', category: 'USERNAME' },
    { text: 't0-rkaelin', category: 'USERNAME' },
    { text: '041 555 92 31', category: 'PHONE' },
    { text: 'Dominik Rüttimann', category: 'PERSON' },
    { text: 'D. Rüttimann', category: 'PERSON' },
    { text: 'dominik.ruettimann@netzwerk-pilatus.example', category: 'EMAIL' },
    { text: 'adm-druettimann', category: 'USERNAME' },
    { text: 't0-druettimann', category: 'USERNAME' },
    { text: '041 555 62 80', category: 'PHONE' },
    { text: '041 555 62 99', category: 'PHONE' },
    { text: 'Laura Zbinden', category: 'PERSON' },
    { text: 'adm-lzbinden', category: 'USERNAME' },
    { text: 'bg-admin', category: 'USERNAME' },
    { text: 'svc_backup', category: 'USERNAME' },
    { text: 'Treuhand Sonnenberg AG', category: 'COMPANY' },
    { text: 'TREUHAND SONNENBERG AG', category: 'COMPANY' },
    { text: 'CHE-339.842.107', category: 'ID' },
    { text: 'Bahnhofstrasse 8', category: 'ADDRESS' },
    { text: '6210 Sursee', category: 'ADDRESS' },
    { text: 'Pilatusstrasse 21', category: 'ADDRESS' },
    { text: '6003 Luzern', category: 'ADDRESS' },
    { text: 'Netzwerk Pilatus GmbH', category: 'COMPANY' },
    { text: DOMAIN, category: 'HOST' },
    { text: `ad.${DOMAIN}`, category: 'HOST' },
    { text: `vpn.${DOMAIN}`, category: 'HOST' },
    { text: `sur-sql01.ad.${DOMAIN}`, category: 'HOST' },
    { text: '203.0.113.45', category: 'IP' },
    { text: '198.51.100.140', category: 'IP' },
    { text: 'Tr3u#Sonnen!2026sql', category: 'SECRET' },
    { text: 'Pk7-Lu2026!sursee-tunnel', category: 'SECRET' },
    { text: 'Sonnenberg-Gast-4471', category: 'SECRET' },
    { text: 'sb-ro-7731', category: 'SECRET' },
    ...generatedValues,
  ],
  keep: ['AGDLP', 'Art. 8 DSG', 'Art. 321 StGB', 'Art. 958f OR', 'GeBüV', 'Tiering-Modell', '3-2-1-Regel',
    'Default Deny', 'IKEv2, AES-256-GCM', 'WPA3-Enterprise', 'Need-to-know-Prinzip', 'Art. 24 DSG'],
};
