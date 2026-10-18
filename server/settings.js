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

const runTool = promisify(execFile);
const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

let currentUserSid = null;

/**
 * Windows ignores the file mode, so the file's access list is set to the current user only: inherited entries
 * (the folder's users and groups) are removed and the user gets full control.
 */
async function restrictToCurrentUser(file) {
  const options = { timeout: WINDOWS_TOOL_TIMEOUT_MS, windowsHide: true };
  if (!currentUserSid) {
    const { stdout } = await runTool(path.join(WINDOWS_TOOLS_DIR, 'whoami.exe'), ['/user', '/fo', 'csv', '/nh'], options);
    currentUserSid = stdout.trim().match(USER_SID)?.[1];
    if (!currentUserSid) throw new Error('could not find your Windows user');
  }
  await runTool(path.join(WINDOWS_TOOLS_DIR, 'icacls.exe'), [file, '/inheritance:r', '/grant:r', `*${currentUserSid}:F`], options);
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
