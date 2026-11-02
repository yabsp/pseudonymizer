import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DOCUMENT_TIMEOUT_MS } from './config.js';
import { stopProcessTreeNow } from './processes.js';

// A work folder of this app: "pseudo-", optionally "doc-", the id of the process that owns it (group 1), and the 6
// letters and digits mkdtemp adds ("pseudo-doc-4711-aB3dE9"). Versions before the id wrote it without
// ("pseudo-doc-aB3dE9"). Other "pseudo-" folders have a word in that place and are not ours to touch.
const WORK_FOLDER = /^pseudo-(?:doc-)?(?:(\d+)-)?[A-Za-z0-9]{6}$/;
const DELETE_RETRIES = 5;

// The folders in use, each with the process working in it (null until it is started).
const active = new Map();

/** A private temporary folder (mode 0700), named so that the next start can tell whether its owner is gone. */
export function createWorkFolder(prefix) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}${process.pid}-`));
  active.set(folder, null);
  return folder;
}

export function setFolderProcess(folder, child) {
  active.set(folder, child);
}

/** Never throws: a folder Windows still holds open stays listed, so it is tried again when the app ends or starts. */
export function deleteWorkFolder(folder) {
  active.set(folder, null);
  try {
    fs.rmSync(folder, { recursive: true, force: true, maxRetries: DELETE_RETRIES });
    active.delete(folder);
  } catch {
    // tried again by stopAllWork and deleteLeftovers
  }
}

/** When the app ends: stops every process that works on a document and deletes its folder. Synchronous, for process 'exit'. */
export function stopAllWork() {
  for (const [folder, child] of active) {
    if (child) stopProcessTreeNow(child);
    deleteWorkFolder(folder);
  }
}

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // it exists, but belongs to another user
  }
}

const isOlderThanAnyWork = (file) => Date.now() - fs.statSync(file).mtimeMs > DOCUMENT_TIMEOUT_MS;

/**
 * At start: deletes what a crash or a forced stop left behind, as nothing can clean up at that moment. A folder is
 * left alone while its owner runs, which may be another copy of this app. Without an owner in the name, only once it
 * is older than any work takes. Never throws: what can't be deleted now is tried again at the next start.
 */
export function deleteLeftovers() {
  const temp = os.tmpdir();
  let names;
  try {
    names = fs.readdirSync(temp);
  } catch {
    return; // no temporary folder to read, so there is nothing to clean up, and work in it will report its own error
  }
  for (const name of names) {
    const match = WORK_FOLDER.exec(name);
    if (!match) continue;
    const folder = path.join(temp, name);
    try {
      const isAbandoned = match[1] ? !isRunning(Number(match[1])) : isOlderThanAnyWork(folder);
      if (isAbandoned) fs.rmSync(folder, { recursive: true, force: true, maxRetries: DELETE_RETRIES });
    } catch {
      // still in use or not ours to delete; tried again at the next start
    }
  }
}
