import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { SETTINGS_FILE, WINDOWS_TOOLS_DIR } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';

const IS_WINDOWS = process.platform === 'win32';
const WINDOWS_TOOL_TIMEOUT_MS = 10_000;
// The last field of "whoami /user /fo csv /nh", e.g. "pc\hans","S-1-5-21-1004336348-1177238915-682003330-1001":
// the security id in quotes, "S-1-" followed by digits and dashes, at the end of the line.
const USER_SID = /"(S-1-[\d-]+)"\s*$/;
// Replaces the whole access list with one entry, full control for the user, and keeps no inherited ones. Paths
// and the SID come in environment variables, so nothing from them is read as a command. Only the access list is
// written (SetAccessControl with a new FileSecurity), which needs no administrator rights.
const SET_ONLY_USER = '$a = New-Object System.Security.AccessControl.FileSecurity; $a.SetAccessRuleProtection($true, $false); '
  + "$a.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule((New-Object System.Security.Principal.SecurityIdentifier $env:PSEUDONYMIZER_SID), 'FullControl', 'Allow'))); "
  + '[System.IO.File]::SetAccessControl($env:PSEUDONYMIZER_FILE, $a)';

const runTool = promisify(execFile);
const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

let currentUserSid = null;

/** The number of entries in the file's access list. "icacls <file>" lists them one per line, then an empty line. */
async function accessEntryCount(file, options) {
  const { stdout } = await runTool(path.join(WINDOWS_TOOLS_DIR, 'icacls.exe'), [file], options);
  // The entries end at the first empty line: a line break, optional spaces, another line break.
  const [listing] = stdout.split(/\r?\n\s*\r?\n/);
  return listing.split(/\r?\n/).filter((line) => line.trim()).length;
}

/**
 * Windows ignores the file mode, so the file's access list is set to the current user only: inherited entries
 * (the folder's users and groups) are removed and the user gets full control. In a folder that passes nothing
 * on, Windows gives a new file explicit entries instead (SYSTEM, administrators, the logon session), which icacls
 * leaves alone; then the whole list is replaced, which takes PowerShell about a second.
 */
async function restrictToCurrentUser(file) {
  const options = { timeout: WINDOWS_TOOL_TIMEOUT_MS, windowsHide: true };
  if (!currentUserSid) {
    const { stdout } = await runTool(path.join(WINDOWS_TOOLS_DIR, 'whoami.exe'), ['/user', '/fo', 'csv', '/nh'], options);
    currentUserSid = stdout.trim().match(USER_SID)?.[1];
    if (!currentUserSid) throw new Error('could not find your Windows user');
  }
  await runTool(path.join(WINDOWS_TOOLS_DIR, 'icacls.exe'), [file, '/inheritance:r', '/grant:r', `*${currentUserSid}:F`], options);
  if (await accessEntryCount(file, options) === 1) return;
  const powershell = path.join(WINDOWS_TOOLS_DIR, 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  await runTool(powershell, ['-NoProfile', '-NonInteractive', '-Command', SET_ONLY_USER],
    { ...options, env: { ...process.env, PSEUDONYMIZER_FILE: file, PSEUDONYMIZER_SID: currentUserSid } });
  if (await accessEntryCount(file, options) !== 1) throw new Error('other users kept access to the file');
}

export function getSettings(req, res) {
  fs.readFile(SETTINGS_FILE, 'utf8', (err, data) => {
    if (err?.code === 'ENOENT') return send(res, 200, {});
    if (err) return send(res, 500, { error: err.message });
    try {
      send(res, 200, JSON.parse(data));
    } catch (e) {
      send(res, 500, { error: 'settings.json is invalid: ' + e.message });
    }
  });
}

/**
 * Written to a new file next to it, made readable by the user only, then renamed over settings.json, which keeps
 * those permissions also when an older settings.json was readable by others. If anything fails, the old file
 * stays as it was.
 */
export async function writePrivately(file, content) {
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, content, { mode: 0o600 });
    if (IS_WINDOWS) {
      try {
        await restrictToCurrentUser(temporary);
      } catch (e) {
        throw new Error(`${path.basename(file)} could not be limited to your Windows user (${e.message})`);
      }
    }
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}

export async function saveSettings(req, res) {
  if (rejectUnlessFromApp(req, res)) return;
  let settings;
  try {
    settings = JSON.parse(await readBody(req));
    if (!isPlainObject(settings)) throw new Error('Settings must be a JSON object.');
  } catch (e) {
    return send(res, 400, { error: e.message });
  }
  try {
    await writePrivately(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');
    send(res, 200, { file: path.basename(SETTINGS_FILE) });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}
