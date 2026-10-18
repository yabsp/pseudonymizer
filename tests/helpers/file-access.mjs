import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ICACLS = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'icacls.exe');

/**
 * Only the current user may read the file: mode 0600 on Linux and macOS; on Windows, which ignores the mode, an
 * access list with one entry, full control for the current user. "icacls <file>" prints the file name and the
 * first entry on one line, further entries indented below, then an empty line and a summary.
 */
export function assertOnlyUserCanAccess(file) {
  if (process.platform !== 'win32') {
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    return;
  }
  const output = execFileSync(ICACLS, [file], { encoding: 'utf8', windowsHide: true });
  // The entries end at the first empty line: a line break, optional spaces, another line break.
  const [listing] = output.replace(file, '').split(/\r?\n\s*\r?\n/);
  const entries = listing.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  assert.equal(entries.length, 1, `expected one access entry, got: ${entries.join(', ')}`);
  const expected = `\\${os.userInfo().username}:(F)`.toLowerCase();
  assert.ok(entries[0].toLowerCase().endsWith(expected), `${entries[0]} should end with ${expected}`);
}
