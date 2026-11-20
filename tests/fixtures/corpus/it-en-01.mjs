const TIMELINE = [
  ['2026-09-13 22:41', 'jump01.corp.example', 'First failed SSH logins for a.huber from 203.0.113.77 (credential stuffing, 412 attempts in 9 minutes)'],
  ['2026-09-13 22:50', 'jump01.corp.example', 'Successful login for a.huber from 203.0.113.77, no MFA prompt (legacy SSH key path)'],
  ['2026-09-13 23:04', 'jump01.corp.example', 'sudo -l executed; user enumerates /opt/deploy and reads .env of the deployment tool'],
  ['2026-09-13 23:11', 'git01.corp.example', 'GitHub token ghp_R7kQ2mXv9LtP4wZ8nB3cY6hF1dS5gJ0aEu2T used from 203.0.113.77 to clone 14 repositories'],
  ['2026-09-13 23:37', 'db01.corp.example', 'Login as svc_backup over the internal network from 10.20.4.15 (jump01)'],
  ['2026-09-13 23:52', 'db01.corp.example', 'pg_dump of database "tms_prod" started (approx. 3.1 GB), written to /tmp/.cache/x.gz'],
  ['2026-09-14 00:26', 'db01.corp.example', 'Outbound HTTPS transfer of 2.7 GB to 198.51.100.23 (TLS 1.3, SNI cdn-sync.example.net)'],
  ['2026-09-14 01:02', 'aws-console', 'Access key AKIAZ4T7QW2EXMPL9KDR lists S3 buckets brunnmatt-archive and brunnmatt-invoices'],
  ['2026-09-14 01:15', 'aws-console', 'GetObject on 1,284 objects in brunnmatt-invoices (PDF invoices with customer addresses)'],
  ['2026-09-14 02:13', 'SIEM', 'Rule "Large egress from DB tier" fires, alert assigned to the on-call engineer Marco Rossi'],
  ['2026-09-14 02:31', 'SIEM', 'Marco Rossi escalates to the CISO, Dr. Claudia Weibel, by phone (079 555 41 87)'],
  ['2026-09-14 02:48', 'fw01.corp.example', 'Egress to 198.51.100.23 and 203.0.113.77 blocked on the perimeter firewall'],
  ['2026-09-14 03:05', 'jump01.corp.example', 'Account a.huber disabled, all sessions killed, host isolated by EDR (network containment)'],
  ['2026-09-14 03:40', 'aws-console', 'Access key AKIAZ4T7QW2EXMPL9KDR deactivated, IAM user deploy-ci locked'],
  ['2026-09-14 04:10', 'git01.corp.example', 'Token ghp_R7kQ2mXv9LtP4wZ8nB3cY6hF1dS5gJ0aEu2T revoked, audit log exported'],
  ['2026-09-14 07:30', 'IR team', 'Kick-off with Securalp GmbH (forensics), lead investigator Priya Raman'],
  ['2026-09-14 09:00', 'db01.corp.example', 'Memory image and disk snapshot taken (SHA-256 hashes recorded in the chain of custody)'],
  ['2026-09-14 11:45', 'web03.corp.example', 'No indicators of compromise found; web tier ruled out'],
  ['2026-09-14 14:20', 'Management', 'Briefing of the executive board, decision to notify the FDPIC under Art. 24 nDSG'],
  ['2026-09-15 10:00', 'All hosts', 'Password reset for all service accounts, rotation of the database password'],
  ['2026-09-16 16:00', 'FDPIC', 'Data breach notification submitted, reference received'],
];

const LOG = [
  'Sep 13 22:49:58 jump01 sshd[48211]: Failed password for a.huber from 203.0.113.77 port 51544 ssh2',
  'Sep 13 22:50:03 jump01 sshd[48219]: Accepted publickey for a.huber from 203.0.113.77 port 51562 ssh2: RSA SHA256:q8Lx2Vn0Hc4Rk7pT1wYb9Zs3Fd6Gm5Ja8Ue2Io4Pr0',
  'Sep 13 22:50:03 jump01 sshd[48219]: pam_unix(sshd:session): session opened for user a.huber(uid=1043)',
  'Sep 13 23:04:17 jump01 sudo:  a.huber : TTY=pts/2 ; PWD=/home/a.huber ; USER=root ; COMMAND=/usr/bin/sudo -l',
  'Sep 13 23:06:42 jump01 bash[48302]: a.huber: cat /opt/deploy/.env',
  'Sep 13 23:36:55 jump01 bash[48302]: a.huber: ssh svc_backup@db01.corp.example',
  'Sep 13 23:37:01 db01 sshd[9932]: Accepted password for svc_backup from 10.20.4.15 port 40122 ssh2',
  'Sep 13 23:52:10 db01 postgres[10117]: [svc_backup] LOG:  connection authorized: user=svc_backup database=tms_prod',
  'Sep 13 23:52:11 db01 bash[10120]: svc_backup: pg_dump -Fc tms_prod | gzip > /tmp/.cache/x.gz',
  'Sep 14 00:26:33 db01 kernel: [UFW AUDIT] OUT=ens192 SRC=10.20.8.21 DST=198.51.100.23 PROTO=TCP DPT=443',
  'Sep 14 00:26:33 db01 kernel: ens192: MAC 00:50:56:A3:7C:19 tx_bytes=2894117652',
  'Sep 14 02:13:04 siem01 correlation[771]: ALERT id=58812 rule="Large egress from DB tier" host=db01.corp.example dst=198.51.100.23',
  'Sep 14 02:48:20 fw01 filterlog: block in on WAN from 203.0.113.77 rule 9001 "IR-2026-0147 containment"',
  'Sep 14 03:05:12 jump01 edr-agent[1290]: network containment enabled by c.weibel',
];

export default {
  id: 'it-en-01',
  domain: 'it',
  language: 'en',
  title: 'IT Security Incident Report IR-2026-0147',
  header: 'BRUNNMATT LOGISTIK AG | Incident IR-2026-0147 | CONFIDENTIAL - TLP:AMBER',
  footer: 'Prepared by C. WEIBEL, CISO - distribution: executive board, Securalp GmbH',
  parts: [
    {
      html: String.raw`
<p class="small">Brunnmatt Logistik AG, Information Security Office, Industriestrasse 44, 4600 Olten</p>
<h1>Security Incident Report IR-2026-0147</h1>
<table class="facts">
<tr><th>Incident ID</th><td>IR-2026-0147</td></tr>
<tr><th>Classification</th><td>Severity 1 - confirmed data exfiltration</td></tr>
<tr><th>Detected</th><td>14 September 2026, 02:13 CEST (SIEM alert 58812)</td></tr>
<tr><th>Status</th><td>Contained, eradication in progress</td></tr>
<tr><th>Incident owner</th><td>Dr. Claudia Weibel, CISO, claudia.weibel@brunnmatt.example, +41 62 555 30 12</td></tr>
<tr><th>Forensics</th><td>Securalp GmbH, Priya Raman, p.raman@securalp.example</td></tr>
<tr><th>Report version</th><td>1.2, 21 September 2026</td></tr>
</table>
<h2>1. Executive summary</h2>
<p>On the night of 13 to 14 September 2026 an external attacker gained access to the jump host
jump01.corp.example (10.20.4.15) with the account of the system administrator Andreas Huber (username a.huber).
The login succeeded after a credential stuffing attack from 203.0.113.77 because an old SSH public key of the
account was still authorised and the key path did not enforce multi-factor authentication (MFA). The attacker
read the configuration file /opt/deploy/.env, which contained a GitHub personal access token, an AWS access key
of the CI user deploy-ci and the password of the service account svc_backup.</p>
<p>With these secrets the attacker moved laterally to the database server db01.corp.example (10.20.8.21),
dumped the production database of the transport management system (tms_prod) and exfiltrated about 2.7 GB to
198.51.100.23. In parallel, 1,284 invoice PDFs were downloaded from the S3 bucket brunnmatt-invoices. The dump
contains names, delivery addresses and phone numbers of about 38,000 private customers, but no payment card
data. The incident therefore qualifies as a data breach that must be reported to the Federal Data Protection
and Information Commissioner (FDPIC) under Art. 24 nDSG.</p>
<p>The SIEM rule "Large egress from DB tier" detected the transfer 1 hour 47 minutes after it had started.
The on-call engineer Marco Rossi contained the incident within 52 minutes of the alert. All leaked secrets
have been revoked; no persistence mechanism has been found so far.</p>
<h2>2. Scope and affected systems</h2>
<table class="grid">
<tr><th>Host</th><th>IP address</th><th>MAC address</th><th>Role</th><th>Impact</th></tr>
<tr><td>jump01.corp.example</td><td>10.20.4.15</td><td>00:50:56:A3:1F:02</td><td>SSH jump host</td><td>Initial access</td></tr>
<tr><td>db01.corp.example</td><td>10.20.8.21</td><td>00:50:56:A3:7C:19</td><td>PostgreSQL 16 (tms_prod)</td><td>Data exfiltrated</td></tr>
<tr><td>git01.corp.example</td><td>10.20.6.30</td><td>00:50:56:A3:44:B8</td><td>Git mirror, CI runner</td><td>Repositories cloned</td></tr>
<tr><td>web03.corp.example</td><td>10.20.2.13</td><td>00:50:56:A3:09:6D</td><td>Customer portal</td><td>Not affected</td></tr>
<tr><td>fw01.corp.example</td><td>10.20.0.1</td><td>3C:EC:EF:12:A4:90</td><td>Perimeter firewall</td><td>Containment point</td></tr>
</table>
<p>External addresses involved: 203.0.113.77 (source of the logins, a rented VPS) and 198.51.100.23
(exfiltration target behind the host name cdn-sync.example.net).</p>
<div class="page-break"></div>
<h2>3. Timeline (times in CEST)</h2>
<table class="grid">
<tr><th>Time</th><th>System</th><th>Event</th></tr>
${TIMELINE.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</table>
<div class="page-break"></div>
<h2>4. Log excerpt</h2>
<p>The following lines are taken from the central syslog (siem01.corp.example) and show the attack path from
the initial login to the exfiltration. Lines are shortened; the full export is stored in the evidence share
under case IR-2026-0147.</p>
<pre>
${LOG.join('\n')}
</pre>
<p>The log shows that the attacker used the public key path after a single failed password attempt. The key with
fingerprint SHA256:q8Lx2Vn0Hc4Rk7pT1wYb9Zs3Fd6Gm5Ja8Ue2Io4Pr0 had been created in 2021 on the former laptop of
Andreas Huber and was never removed from /home/a.huber/.ssh/authorized_keys. Mr. Huber confirmed that the laptop
was sold privately in 2023 without a reset of the disk.</p>
<div class="page-break"></div>
<h2>5. Leaked secrets</h2>
<p>The screenshot below was taken by the forensic team on jump01 and shows the contents of /opt/deploy/.env as
the attacker saw them. The values have been rotated since.</p>
<div class="as-image screenshot">
a.huber@jump01:~$ cat /opt/deploy/.env<br>
GITHUB_TOKEN=ghp_R7kQ2mXv9LtP4wZ8nB3cY6hF1dS5gJ0aEu2T<br>
AWS_ACCESS_KEY_ID=AKIAZ4T7QW2EXMPL9KDR<br>
AWS_SECRET_ACCESS_KEY=wJ7rT2xLmQ9vB4nK8pZ3cY6hF1dS5gA0eU2iO7tR<br>
DB_HOST=db01.corp.example<br>
DB_USER=svc_backup<br>
DB_PASSWORD=Kx!9vTq#2026-Brunn<br>
SMTP_RELAY=mail.brunnmatt.example
</div>
<table class="grid">
<tr><th>Secret</th><th>Owner</th><th>Used by attacker</th><th>Rotated</th></tr>
<tr><td>GitHub token ghp_R7kQ...</td><td>deploy-ci (CI pipeline)</td><td>Yes, 14 repositories cloned</td><td>14.09.2026 04:10</td></tr>
<tr><td>AWS access key AKIAZ4T7QW2EXMPL9KDR</td><td>IAM user deploy-ci</td><td>Yes, S3 read</td><td>14.09.2026 03:40</td></tr>
<tr><td>Database password of svc_backup</td><td>DBA team (Laura Fischer)</td><td>Yes, SSH and PostgreSQL</td><td>15.09.2026 10:00</td></tr>
<tr><td>SMTP relay credentials</td><td>IT operations</td><td>No evidence</td><td>15.09.2026 10:00</td></tr>
</table>
<p>The cloned repositories contained further hard-coded credentials, among them the staging password
"Sommer2026!Staging" in the repository tms-integration. Securalp GmbH recommends treating every secret that was
ever committed to these repositories as compromised. The repositories also contain the internal address plan,
which makes later targeted attacks on the network easier.</p>
<h2>6. Root cause analysis</h2>
<ul>
<li>Stale SSH public key of a privileged account, not covered by the quarterly access review.</li>
<li>MFA enforced only for password logins on jump01, not for public key logins.</li>
<li>Secrets stored in plain text in a .env file readable by all members of the group "ops".</li>
<li>The service account svc_backup was allowed to log in interactively and had read access to all tables.</li>
<li>No egress filtering for the database tier; the SIEM rule had a 60-minute aggregation window.</li>
</ul>
<p>Mapped to MITRE ATT&amp;CK the attack used T1110.004 Credential Stuffing, T1078 Valid Accounts, T1552.001
Credentials In Files, T1021.004 Remote Services: SSH and T1048 Exfiltration Over Alternative Protocol.</p>
<div class="page-break"></div>
<h2>7. Remediation</h2>
<table class="grid">
<tr><th>No.</th><th>Measure</th><th>Owner</th><th>Due</th><th>Status</th></tr>
<tr><td>1</td><td>Remove all SSH keys older than 12 months, enforce MFA for every login on jump hosts</td><td>Andreas Huber</td><td>30.09.2026</td><td>In progress</td></tr>
<tr><td>2</td><td>Move secrets from .env files to the vault (HashiCorp Vault, AES-256, short-lived tokens)</td><td>Marco Rossi</td><td>31.10.2026</td><td>Planned</td></tr>
<tr><td>3</td><td>Disable interactive login for service accounts, least privilege for svc_backup</td><td>Laura Fischer</td><td>30.09.2026</td><td>Done</td></tr>
<tr><td>4</td><td>Egress allowlist for the database tier, SIEM aggregation window 5 minutes</td><td>Network team</td><td>15.10.2026</td><td>In progress</td></tr>
<tr><td>5</td><td>Secret scanning in all repositories, history rewrite where needed</td><td>Securalp GmbH</td><td>31.10.2026</td><td>Planned</td></tr>
<tr><td>6</td><td>Quarterly access review including SSH keys and API tokens (ISO/IEC 27001 A.5.18)</td><td>Claudia Weibel</td><td>31.12.2026</td><td>Planned</td></tr>
</table>
<h2>8. Notification and communication</h2>
<p>The FDPIC was notified on 16 September 2026 under Art. 24 nDSG. Affected customers are informed by letter,
as the exfiltrated data includes delivery addresses and phone numbers. The customer hotline is staffed by the
service desk; questions from the media go to the head of communications, Sandra Lüthi
(sandra.luethi@brunnmatt.example, 062 555 30 40). A criminal complaint against unknown persons was filed with
the cantonal police of Solothurn.</p>
<h2>9. Lessons learned</h2>
<p>Detection worked, but too late: the aggregation window let the attacker transfer most of the data before an
alert was raised. Containment worked well thanks to the EDR network isolation and the runbook for the
perimeter firewall. Privilege escalation was not necessary for the attacker, because the secrets in the .env
file already gave access to the most valuable data. Lateral movement over SSH with a password stored in plain
text must become impossible.</p>
<h2>10. Sign-off</h2>
<table class="facts">
<tr><th>Prepared by</th><td>Dr. Claudia Weibel, CISO</td></tr>
<tr><th>Reviewed by</th><td>Priya Raman, Securalp GmbH</td></tr>
<tr><th>Approved by</th><td>Thomas Brunner, CEO</td></tr>
</table>
<div class="as-image signature">C. Weibel &nbsp;&nbsp; T. Brunner &nbsp;&nbsp; Olten, 21.09.2026</div>
`,
    },
  ],
  values: [
    { text: 'BRUNNMATT LOGISTIK AG', category: 'COMPANY' },
    { text: 'Brunnmatt Logistik AG', category: 'COMPANY' },
    { text: 'C. WEIBEL', category: 'PERSON' },
    { text: 'C. Weibel', category: 'PERSON' },
    { text: 'Claudia Weibel', category: 'PERSON' },
    { text: 'c.weibel', category: 'USERNAME' },
    { text: 'claudia.weibel@brunnmatt.example', category: 'EMAIL' },
    { text: '+41 62 555 30 12', category: 'PHONE' },
    { text: '079 555 41 87', category: 'PHONE' },
    { text: 'Industriestrasse 44', category: 'ADDRESS' },
    { text: '4600 Olten', category: 'ADDRESS' },
    { text: 'Securalp GmbH', category: 'COMPANY' },
    { text: 'Priya Raman', category: 'PERSON' },
    { text: 'p.raman@securalp.example', category: 'EMAIL' },
    { text: 'Andreas Huber', category: 'PERSON' },
    { text: 'Mr. Huber', category: 'PERSON' },
    { text: 'a.huber', category: 'USERNAME' },
    { text: 'Marco Rossi', category: 'PERSON' },
    { text: 'Laura Fischer', category: 'PERSON' },
    { text: 'Sandra Lüthi', category: 'PERSON' },
    { text: 'sandra.luethi@brunnmatt.example', category: 'EMAIL' },
    { text: '062 555 30 40', category: 'PHONE' },
    { text: 'Thomas Brunner', category: 'PERSON' },
    { text: 'T. Brunner', category: 'PERSON' },
    { text: 'jump01.corp.example', category: 'HOST' },
    { text: 'db01.corp.example', category: 'HOST' },
    { text: 'git01.corp.example', category: 'HOST' },
    { text: 'web03.corp.example', category: 'HOST' },
    { text: 'fw01.corp.example', category: 'HOST' },
    { text: 'siem01.corp.example', category: 'HOST' },
    { text: 'mail.brunnmatt.example', category: 'HOST' },
    { text: 'cdn-sync.example.net', category: 'HOST' },
    { text: '10.20.4.15', category: 'IP' },
    { text: '10.20.8.21', category: 'IP' },
    { text: '10.20.6.30', category: 'IP' },
    { text: '10.20.2.13', category: 'IP' },
    { text: '10.20.0.1', category: 'IP' },
    { text: '203.0.113.77', category: 'IP' },
    { text: '198.51.100.23', category: 'IP' },
    { text: '00:50:56:A3:1F:02', category: 'MAC' },
    { text: '00:50:56:A3:7C:19', category: 'MAC' },
    { text: '00:50:56:A3:44:B8', category: 'MAC' },
    { text: '00:50:56:A3:09:6D', category: 'MAC' },
    { text: '3C:EC:EF:12:A4:90', category: 'MAC' },
    { text: 'svc_backup', category: 'USERNAME' },
    { text: 'deploy-ci', category: 'USERNAME' },
    { text: 'ghp_R7kQ2mXv9LtP4wZ8nB3cY6hF1dS5gJ0aEu2T', category: 'SECRET' },
    { text: 'ghp_R7kQ...', category: 'SECRET' },
    { text: 'AKIAZ4T7QW2EXMPL9KDR', category: 'SECRET' },
    { text: 'wJ7rT2xLmQ9vB4nK8pZ3cY6hF1dS5gA0eU2iO7tR', category: 'SECRET' },
    { text: 'Kx!9vTq#2026-Brunn', category: 'SECRET' },
    { text: 'Sommer2026!Staging', category: 'SECRET' },
    { text: 'SHA256:q8Lx2Vn0Hc4Rk7pT1wYb9Zs3Fd6Gm5Ja8Ue2Io4Pr0', category: 'SECRET' },
    { text: 'brunnmatt-archive', category: 'ID' },
    { text: 'brunnmatt-invoices', category: 'ID' },
  ],
  keep: ['credential stuffing', 'multi-factor authentication', 'lateral movement', 'Art. 24 nDSG', 'TLS 1.3',
    'T1078 Valid Accounts', 'ISO/IEC 27001', 'privilege escalation', 'network containment', 'PostgreSQL 16'],
};
