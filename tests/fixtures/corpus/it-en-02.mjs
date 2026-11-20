const VALUES = new Map();
const v = (text, category) => {
  VALUES.set(text, category);
  return text;
};

let seed = 0x2f6e2b1;
const next = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
};
const pick = (list) => list[next() % list.length];
const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const token = (prefix, length) => prefix + Array.from({ length }, () => B62[next() % B62.length]).join('');

const PORTAL = 'portal.pfannenstiel.example';
const CUSTOMERS = [
  { name: 'Lena Vogt', email: 'lena.vogt@example.com', id: 'CUST-104882', ip: '198.51.100.23', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0' },
  { name: 'Markus Oberholzer', email: 'markus.oberholzer@example.ch', id: 'CUST-100317', ip: '192.0.2.41', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) Safari/605.1.15' },
  { name: 'Aisha Rahman', email: 'aisha.rahman@example.org', id: 'CUST-109554', ip: '198.51.100.77', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148' },
  { name: 'Pierre-Alain Junod', email: 'pa.junod@example.ch', id: 'CUST-101206', ip: '192.0.2.118', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/129.0' },
  { name: 'Giulia Cattaneo', email: 'giulia.cattaneo@example.it', id: 'CUST-107731', ip: '198.51.100.152', ua: 'Mozilla/5.0 (Linux; Android 15) Chrome/129.0 Mobile' },
  { name: 'Thomas Brändli', email: 't.braendli@example.com', id: 'CUST-102948', ip: '192.0.2.203', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0' },
  { name: 'Sophie Lambert', email: 'sophie.lambert@example.fr', id: 'CUST-108065', ip: '198.51.100.199', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) Firefox/131.0' },
  { name: 'Jan Kowalski', email: 'jan.kowalski@example.pl', id: 'CUST-110422', ip: '192.0.2.87', ua: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0' },
].map((c) => ({ ...c, sessions: [token('sid_', 24), token('sid_', 24)] }));
const VICTIM = CUSTOMERS[1];

const STAFF = [
  { name: 'Nadia Schürch', username: 'nschuerch', email: 'nadia.schuerch@pfannenstiel.example', ip: '10.30.4.21', role: 'Customer Support Lead' },
  { name: 'Oliver Hartmann', username: 'ohartmann', email: 'oliver.hartmann@pfannenstiel.example', ip: '10.30.4.33', role: 'Site Reliability Engineer' },
  { name: 'Raphael Egli', username: 'regli', email: 'raphael.egli@pfannenstiel.example', ip: '10.30.4.47', role: 'Database Administrator' },
];
const HOSTS = [
  ['pf-bastion01', '10.30.1.5'],
  ['pf-app01', '10.30.1.11'],
  ['pf-app02', '10.30.1.12'],
  ['pf-db01', '10.30.1.21'],
  ['pf-mail01', '10.30.1.31'],
];

const ATTACKER_IP = '203.0.113.88';
const ATTACKER_IP_2 = '203.0.113.91';
const ATTACKER_EMAIL = 'oberholzer.markus.backup@example.net';
const ATTACKER_SESSION = token('sid_', 24);
const RESET_TOKEN = token('rst_', 32);
const API_KEY_ID = token('ak_live_', 16);
const LEAKED_PASSWORD = 'Herbst-Lena-2026';
const DROP_ADDRESS = 'Industriestrasse 9, 8952 Schlieren';

const START = Date.UTC(2026, 8, 21, 18, 0, 0);
const at = (h, m, s) => Date.UTC(2026, 8, h < 12 ? 22 : 21, h, m, s);
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const two = (n) => String(n).padStart(2, '0');
const clf = (t) => {
  const d = new Date(t);
  return `${two(d.getUTCDate())}/${MONTHS[d.getUTCMonth()]}/${d.getUTCFullYear()}:${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} +0000`;
};
const syslog = (t) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${two(d.getUTCDate())} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}`;
};

const backgroundTimes = (count, step) => {
  let t = START;
  return Array.from({ length: count }, () => (t += 20_000 + (next() % step) * 1000));
};
const sortLines = (entries) => entries.sort((a, b) => a.t - b.t).map((e) => e.line).join('\n');
const invoice = () => `INV-2026-${String(10000 + (next() % 9000)).padStart(5, '0')}`;

const auditLine = (t, level, action, fields) => `${iso(t)} portal-api ${level} AUDIT action=${action} ${fields}`;
const customerFields = (c, session) => `user=${v(c.email, 'EMAIL')} customer=${v(c.id, 'ID')} ip=${v(c.ip, 'IP')} session=${v(session, 'SECRET')}`;

const AUDIT_ACTIONS = ['LOGIN_SUCCESS', 'VIEW_INVOICE', 'VIEW_INVOICE', 'DOWNLOAD_INVOICE_PDF', 'SESSION_REFRESH', 'UPDATE_PREFERENCES', 'LOGOUT', 'LOGIN_FAILED'];
const auditBackground = backgroundTimes(92, 260).map((t) => {
  const c = pick(CUSTOMERS);
  const session = pick(c.sessions);
  const action = pick(AUDIT_ACTIONS);
  if (action === 'LOGIN_FAILED') {
    return { t, line: auditLine(t, 'WARN', action, `user=${v(c.email, 'EMAIL')} ip=${v(c.ip, 'IP')} reason=bad_password attempt=1`) };
  }
  const extra = action.includes('INVOICE') ? ` invoice=${invoice()}` : action === 'LOGIN_SUCCESS' ? ' mfa=totp' : '';
  return { t, line: auditLine(t, 'INFO', action, customerFields(c, session) + extra) };
});
const victimFields = (session, ip) => `user=${v(VICTIM.email, 'EMAIL')} customer=${v(VICTIM.id, 'ID')} ip=${v(ip, 'IP')} session=${v(session, 'SECRET')}`;
const auditAttack = [
  ...[7, 58, 121, 186, 244, 302].map((s, i) => ({
    t: at(22, 41, 0) + s * 1000,
    line: auditLine(at(22, 41, 0) + s * 1000, 'WARN', 'LOGIN_FAILED', `user=${v(VICTIM.email, 'EMAIL')} ip=${v(ATTACKER_IP, 'IP')} reason=bad_password attempt=${i + 1}`),
  })),
  { t: at(22, 50, 31), line: auditLine(at(22, 50, 31), 'INFO', 'PASSWORD_RESET_REQUESTED', `user=${VICTIM.email} ip=${ATTACKER_IP} channel=email`) },
  { t: at(22, 53, 2), line: auditLine(at(22, 53, 2), 'INFO', 'PASSWORD_RESET_COMPLETED', `user=${VICTIM.email} ip=${ATTACKER_IP} reset_token=${v(RESET_TOKEN, 'SECRET')}`) },
  { t: at(22, 53, 40), line: auditLine(at(22, 53, 40), 'INFO', 'LOGIN_SUCCESS', `${victimFields(ATTACKER_SESSION, ATTACKER_IP)} mfa=none`) },
  { t: at(22, 55, 12), line: auditLine(at(22, 55, 12), 'INFO', 'EMAIL_CHANGED', `${victimFields(ATTACKER_SESSION, ATTACKER_IP)} old=${VICTIM.email} new=${v(ATTACKER_EMAIL, 'EMAIL')} verification=skipped`) },
  { t: at(22, 56, 1), line: auditLine(at(22, 56, 1), 'INFO', 'SHIPPING_ADDRESS_CHANGED', `${victimFields(ATTACKER_SESSION, ATTACKER_IP)} new="${v(DROP_ADDRESS, 'ADDRESS')}"`) },
  { t: at(23, 2, 10), line: auditLine(at(23, 2, 10), 'INFO', 'EXPORT_DATA', `${victimFields(ATTACKER_SESSION, ATTACKER_IP)} type=orders format=csv rows=412`) },
  { t: at(23, 15, 33), line: auditLine(at(23, 15, 33), 'INFO', 'API_KEY_CREATED', `${victimFields(ATTACKER_SESSION, ATTACKER_IP)} key_id=${v(API_KEY_ID, 'SECRET')} scope=orders:read,invoices:read`) },
  { t: at(23, 40, 18), line: auditLine(at(23, 40, 18), 'INFO', 'API_KEY_USED', `key_id=${API_KEY_ID} customer=${VICTIM.id} ip=${v(ATTACKER_IP_2, 'IP')} endpoint=/api/v2/invoices count=57`) },
  { t: at(23, 31, 9), line: auditLine(at(23, 31, 9), 'INFO', 'LOGOUT', victimFields(ATTACKER_SESSION, ATTACKER_IP)) },
  { t: at(19, 12, 44), line: `${iso(at(19, 12, 44))} portal-api DEBUG auth.login request body={"email":"${v(CUSTOMERS[0].email, 'EMAIL')}","password":"${v(LEAKED_PASSWORD, 'SECRET')}","remember":true}` },
  { t: at(0, 12, 5), line: auditLine(at(0, 12, 5), 'WARN', 'ACCOUNT_LOCKED', `customer=${VICTIM.id} by=${v(STAFF[0].username, 'USERNAME')} staff_ip=${v(STAFF[0].ip, 'IP')} reason="suspected account takeover, ticket SEC-2026-0219"`) },
  { t: at(0, 14, 40), line: auditLine(at(0, 14, 40), 'WARN', 'API_KEY_REVOKED', `key_id=${API_KEY_ID} by=${STAFF[0].username}`) },
  { t: at(0, 15, 2), line: auditLine(at(0, 15, 2), 'WARN', 'SESSIONS_TERMINATED', `customer=${VICTIM.id} count=3 by=${STAFF[0].username}`) },
];

const ACCESS_PATHS = ['GET /api/v2/invoices?page=1', 'GET /api/v2/orders?status=open', 'GET /api/v2/profile', 'POST /api/v2/auth/refresh', 'GET /static/app.4f9c2e.js', 'GET /api/v2/notifications'];
const accessLine = (t, ip, path, status, bytes, ua, uid, sid) => `${ip} - - [${clf(t)}] "${path} HTTP/2.0" ${status} ${bytes} "https://${v(PORTAL, 'HOST')}/" "${ua}" rt=0.${String(10 + (next() % 890)).padStart(3, '0')} uid=${uid} sid=${sid}`;
const accessBackground = backgroundTimes(78, 330).map((t) => {
  const c = pick(CUSTOMERS);
  const path = pick(ACCESS_PATHS);
  return { t, line: accessLine(t, v(c.ip, 'IP'), path, 200, 800 + (next() % 9000), c.ua, v(c.id, 'ID'), v(pick(c.sessions), 'SECRET')) };
});
const ATTACK_UA = 'python-requests/2.32.3';
const accessAttack = [
  ...[7, 58, 121, 186, 244, 302].map((s) => ({ t: at(22, 41, 0) + s * 1000, line: accessLine(at(22, 41, 0) + s * 1000, ATTACKER_IP, 'POST /api/v2/auth/login', 401, 112, ATTACK_UA, '-', '-') })),
  { t: at(22, 50, 31), line: accessLine(at(22, 50, 31), ATTACKER_IP, 'POST /api/v2/auth/password-reset', 202, 64, ATTACK_UA, '-', '-') },
  { t: at(22, 53, 2), line: accessLine(at(22, 53, 2), ATTACKER_IP, `POST /api/v2/auth/password-reset/confirm?token=${RESET_TOKEN}`, 200, 88, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0', '-', '-') },
  { t: at(22, 55, 12), line: accessLine(at(22, 55, 12), ATTACKER_IP, 'PATCH /api/v2/profile/email', 200, 301, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0', VICTIM.id, ATTACKER_SESSION) },
  { t: at(23, 2, 10), line: accessLine(at(23, 2, 10), ATTACKER_IP, 'GET /api/v2/export/orders.csv', 200, 1288412, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0', VICTIM.id, ATTACKER_SESSION) },
  { t: at(23, 40, 18), line: `${ATTACKER_IP_2} - - [${clf(at(23, 40, 18))}] "GET /api/v2/invoices?limit=100 HTTP/1.1" 200 228940 "-" "${ATTACK_UA}" rt=0.311 uid=${VICTIM.id} auth=apikey:${API_KEY_ID}` },
];

const sshBackground = backgroundTimes(44, 560).map((t, i) => {
  const s = pick(STAFF);
  const [host] = pick(HOSTS);
  const pid = 2000 + (next() % 7000);
  const kind = i % 3;
  if (kind === 0) return { t, line: `${syslog(t)} ${v(host, 'HOST')} sshd[${pid}]: Accepted publickey for ${v(s.username, 'USERNAME')} from ${v(s.ip, 'IP')} port ${40000 + (next() % 20000)} ssh2: ED25519` };
  if (kind === 1) return { t, line: `${syslog(t)} ${v(host, 'HOST')} sudo: ${v(s.username, 'USERNAME')} : TTY=pts/${next() % 4} ; PWD=/home/${s.username} ; USER=root ; COMMAND=${pick(['/usr/bin/systemctl status portal-api', '/usr/bin/journalctl -u portal-api --since -1h', '/usr/bin/df -h', '/usr/bin/systemctl reload nginx'])}` };
  return { t, line: `${syslog(t)} ${v(host, 'HOST')} sshd[${pid}]: pam_unix(sshd:session): session closed for user ${v(s.username, 'USERNAME')}` };
});
const sshInvestigation = [
  { t: at(0, 31, 12), line: `${syslog(at(0, 31, 12))} pf-db01 sshd[7102]: Accepted publickey for regli from 10.30.4.47 port 51833 ssh2: ED25519` },
  { t: at(0, 33, 40), line: `${syslog(at(0, 33, 40))} pf-db01 postgres[7140]: [regli] LOG:  statement: SELECT id, email, email_changed_at, mfa_enrolled FROM customers WHERE id = '${VICTIM.id}';` },
  { t: at(0, 36, 2), line: `${syslog(at(0, 36, 2))} pf-db01 postgres[7140]: [regli] LOG:  statement: UPDATE customers SET email = '${VICTIM.email}', shipping_address = NULL WHERE id = '${VICTIM.id}';` },
  { t: at(0, 41, 55), line: `${syslog(at(0, 41, 55))} pf-app01 sudo: ohartmann : TTY=pts/1 ; PWD=/home/ohartmann ; USER=root ; COMMAND=/usr/sbin/nft add rule inet filter input ip saddr { ${ATTACKER_IP}, ${ATTACKER_IP_2} } drop` },
  { t: at(0, 44, 10), line: `${syslog(at(0, 44, 10))} pf-app01 sudo: ohartmann : TTY=pts/1 ; PWD=/home/ohartmann ; USER=root ; COMMAND=/usr/bin/portalctl sessions revoke --customer ${VICTIM.id}` },
];
for (const [host, ip] of HOSTS) {
  v(host, 'HOST');
  v(ip, 'IP');
}

const MAIL_SUBJECTS = ['Your invoice is ready', 'Order confirmation', 'Payment received', 'Your monthly statement'];
const mailBackground = backgroundTimes(24, 1000).map((t) => {
  const c = pick(CUSTOMERS);
  const domain = c.email.split('@')[1];
  return { t, line: `${syslog(t)} pf-mail01 postfix/smtp[${8000 + (next() % 900)}]: ${(next() % 0xfffff).toString(16).toUpperCase().padStart(5, '0')}C0: to=&lt;${v(c.email, 'EMAIL')}&gt;, relay=mx.${domain}[${v('192.0.2.25', 'IP')}]:25, delay=0.${next() % 9}, dsn=2.0.0, status=sent (250 OK) subject="${pick(MAIL_SUBJECTS)}"` };
});
const mailAttack = [
  { t: at(22, 50, 32), line: `${syslog(at(22, 50, 32))} pf-mail01 postfix/smtp[8812]: 4F2A11C03: to=&lt;${VICTIM.email}&gt;, relay=mx.example.ch[192.0.2.25]:25, delay=0.8, dsn=2.0.0, status=sent (250 OK) subject="Reset your password"` },
  { t: at(22, 55, 13), line: `${syslog(at(22, 55, 13))} pf-mail01 postfix/smtp[8840]: 5B7710C11: to=&lt;${ATTACKER_EMAIL}&gt;, relay=mx.example.net[198.51.100.61]:25, delay=1.2, dsn=2.0.0, status=sent (250 OK) subject="Your e-mail address was changed"` },
  { t: at(22, 55, 14), line: `${syslog(at(22, 55, 14))} pf-mail01 postfix/smtp[8841]: 5B7712C02: to=&lt;${VICTIM.email}&gt;, relay=mx.example.ch[192.0.2.25]:25, delay=0.9, dsn=2.0.0, status=sent (250 OK) subject="Your e-mail address was changed"` },
  { t: at(23, 15, 34), line: `${syslog(at(23, 15, 34))} pf-mail01 postfix/smtp[8902]: 6D0E31C07: to=&lt;${ATTACKER_EMAIL}&gt;, relay=mx.example.net[198.51.100.61]:25, delay=1.0, dsn=2.0.0, status=sent (250 OK) subject="New API key created"` },
  { t: at(0, 12, 6), line: `${syslog(at(0, 12, 6))} pf-mail01 postfix/smtp[9017]: 7A1C22C04: to=&lt;${v(STAFF[1].email, 'EMAIL')}&gt;, relay=local, dsn=2.0.0, status=sent subject="[SEC-2026-0219] Account locked by ${STAFF[0].username}"` },
];
v('198.51.100.61', 'IP');

const AUDIT_LOG = sortLines([...auditBackground, ...auditAttack]);
const ACCESS_LOG = sortLines([...accessBackground, ...accessAttack]);
const SSH_LOG = sortLines([...sshBackground, ...sshInvestigation]);
const MAIL_LOG = sortLines([...mailBackground, ...mailAttack]);

const row = (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;

const PARTS = [
  {
    html: String.raw`
<p class="small">Pfannenstiel Software AG, Security &amp; Compliance, Forchstrasse 240, 8704 Herrliberg</p>
<h1>Audit Trail Export SEC-2026-0219</h1>
<table class="facts">
<tr><th>Case</th><td>SEC-2026-0219, suspected account takeover on the customer portal ${PORTAL}</td></tr>
<tr><th>Requested by</th><td>${v('Dr. Iris Wettstein', 'PERSON')}, General Counsel, ${v('iris.wettstein@pfannenstiel.example', 'EMAIL')}, ${v('044 555 18 60', 'PHONE')}</td></tr>
<tr><th>Exported by</th><td>${v(STAFF[1].name, 'PERSON')}, ${STAFF[1].role}, ${v(STAFF[1].email, 'EMAIL')}</td></tr>
<tr><th>Export window</th><td>21 September 2026 18:00 UTC to 22 September 2026 01:30 UTC</td></tr>
<tr><th>Sources</th><td>portal-api audit log, nginx access log (pf-app01, pf-app02), syslog of the admin hosts, postfix log of pf-mail01</td></tr>
<tr><th>Integrity</th><td>SHA-256 of the raw export: 9b1f4c07e2a85d36f0c9e4b17a2d58c6031e7f94ab6d2c58e1f07b3a94c6d2e8</td></tr>
<tr><th>Export date</th><td>23 September 2026</td></tr>
</table>
<h2>1. Purpose and handling</h2>
<p>This export documents the events around the takeover of the portal account of the customer
${v(VICTIM.name, 'PERSON')} (customer number ${VICTIM.id}) during the night of 21 to 22 September 2026. It was
prepared at the request of the legal department to support the assessment of the reporting duties under
Art. 24 nDSG (FDPIC) and, because two affected customers live in the EU, Art. 33 GDPR. The export also serves as
evidence for the criminal complaint filed with the cantonal police.</p>
<p>The raw logs contain personal data of uninvolved customers, session identifiers and in one case a clear-text
password caused by a logging bug. The export is therefore classified as strictly confidential. It may only be
shared with the legal department, the external forensic consultant and the authorities. Session identifiers
listed here were invalidated on 22 September 2026 at 00:15 UTC; the leaked password was reset.</p>
<h2>2. Accounts and addresses in this export</h2>
<table class="grid">
<tr><th>Name</th><th>E-mail</th><th>Customer no.</th><th>Usual IP address</th></tr>
${CUSTOMERS.map((c) => row([v(c.name, 'PERSON'), c.email, c.id, c.ip])).join('\n')}
</table>
<table class="grid">
<tr><th>Staff member</th><th>Username</th><th>Role</th><th>Workstation IP</th></tr>
${STAFF.map((s) => row([v(s.name, 'PERSON'), v(s.username, 'USERNAME'), s.role, v(s.ip, 'IP')])).join('\n')}
</table>
<table class="grid">
<tr><th>Host</th><th>IP address</th><th>Role</th></tr>
${HOSTS.map(([h, ip], i) => row([h, ip, ['SSH bastion', 'Portal API, nginx', 'Portal API, nginx', 'PostgreSQL 16', 'Postfix relay'][i]])).join('\n')}
</table>
<p>External addresses attributed to the attacker: ${ATTACKER_IP} (login, password reset, e-mail change, export)
and ${ATTACKER_IP_2} (use of the API key). Both belong to a hosting provider; no Swiss or EU residential
address is involved.</p>
`,
  },
  {
    html: String.raw`
<h2>3. Portal audit trail (portal-api)</h2>
<p>All security-relevant actions of portal users. Times in UTC. The DEBUG line at 19:12:44 shows the logging bug
(request bodies of the login endpoint were written to the log after the release 4.18.0); it is listed to
document that the password of one uninvolved customer was exposed in the log files.</p>
<pre>
${AUDIT_LOG}
</pre>
`,
  },
  {
    html: String.raw`
<h2>4. Web access log (nginx, pf-app01 and pf-app02)</h2>
<p>Combined log format with the custom fields rt (response time in seconds), uid (customer number) and sid
(session identifier). Static assets and health checks are filtered out.</p>
<pre>
${ACCESS_LOG}
</pre>
`,
  },
  {
    html: String.raw`
<h2>5. Administrative access (syslog of the admin hosts)</h2>
<p>SSH logins and sudo commands of the operations staff. The entries after 00:30 UTC belong to the
investigation and the remediation by ${STAFF[2].name} and ${STAFF[1].name}.</p>
<pre>
${SSH_LOG}
</pre>
<h2>6. Outgoing e-mail (postfix, pf-mail01)</h2>
<pre>
${MAIL_LOG}
</pre>
`,
  },
  {
    html: String.raw`
<h2>7. Findings</h2>
<ol>
<li>The attacker tried six passwords for the account ${VICTIM.email} from ${ATTACKER_IP} between 22:41 and
22:46 UTC. The rate limit (10 attempts per 15 minutes) was not reached.</li>
<li>At 22:50 UTC the attacker requested a password reset. The reset link was sent to the customer's own
mailbox; the token ${RESET_TOKEN} was used three minutes later from the same IP address. ${VICTIM.name}
confirmed by phone on 22 September 2026 that his private mailbox had been compromised the week before.</li>
<li>Multi-factor authentication was not enrolled for the account, so the login succeeded with the new password
alone. The e-mail address was changed to ${ATTACKER_EMAIL} without confirmation from the old address
("verification=skipped", known defect PORTAL-2291).</li>
<li>The attacker changed the shipping address to ${DROP_ADDRESS}, exported 412 orders and created an API key that
was used from ${ATTACKER_IP_2} to download 57 invoices. No orders were placed.</li>
<li>The account was locked at 00:12 UTC by ${STAFF[0].name} after the customer called the support hotline;
the original e-mail address was restored by ${STAFF[2].name}.</li>
<li>Independent of the incident, the DEBUG log of the login endpoint exposed the password of
${v(CUSTOMERS[0].name, 'PERSON')}. The customer was informed and the password was reset on 22 September 2026.</li>
</ol>
<h2>8. Recommendations</h2>
<ul>
<li>Require confirmation from the old e-mail address before an address change takes effect (fix PORTAL-2291).</li>
<li>Enforce MFA (TOTP or passkey) for all portal accounts with access to invoices; at the latest by 31 December 2026.</li>
<li>Remove request body logging and purge the affected log files after the retention for this case ends.</li>
<li>Rate-limit password resets per account and alert on e-mail change followed by data export within one hour.</li>
</ul>
<p>The screenshot below shows the account in the support back office after the remediation:</p>
<div class="as-image screenshot">Back office - Customer ${VICTIM.id}<br>
Name: ${VICTIM.name} &nbsp; E-mail: ${VICTIM.email}<br>
Status: LOCKED (by ${STAFF[0].username}, 22.09.2026 00:12 UTC) &nbsp; MFA: not enrolled<br>
Sessions: 0 active, 3 terminated &nbsp; API keys: ${API_KEY_ID} (revoked)</div>
<p>Prepared by</p>
<div class="as-image signature">${STAFF[1].name} &nbsp;&nbsp;&nbsp; Herrliberg, 23.09.2026</div>
`,
  },
];

export default {
  id: 'it-en-02',
  domain: 'it',
  language: 'en',
  title: 'Audit Trail Export SEC-2026-0219',
  header: `${v('PFANNENSTIEL SOFTWARE AG', 'COMPANY')} | Audit trail export SEC-2026-0219 | Requested by ${v('I. WETTSTEIN', 'PERSON')} | STRICTLY CONFIDENTIAL`,
  footer: `Exported by ${v('O. Hartmann', 'PERSON')} - contains personal data and session identifiers, do not forward`,
  parts: PARTS,
  values: [
    ...[...VALUES].map(([text, category]) => ({ text, category })),
    { text: 'Pfannenstiel Software AG', category: 'COMPANY' },
    { text: 'Forchstrasse 240', category: 'ADDRESS' },
    { text: '8704 Herrliberg', category: 'ADDRESS' },
    { text: 'SEC-2026-0219', category: 'ID' },
    { text: 'pfannenstiel.example', category: 'HOST' },
  ],
  keep: ['Art. 24 nDSG', 'Art. 33 GDPR', 'multi-factor authentication', 'rate limit', 'PORTAL-2291',
    'postfix/smtp', 'Combined log format', 'SHA-256'],
};
