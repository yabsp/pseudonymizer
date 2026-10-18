import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { COMMAND_SEARCH_PATH, WINDOWS_COMMAND_EXTENSIONS, WINDOWS_TOOLS_DIR } from './config.js';

const IS_WINDOWS = process.platform === 'win32';

// Arguments that need quotes when a command runs through cmd.exe: whitespace or any of the shell characters " & | < > ^
const NEEDS_WINDOWS_QUOTES = /[\s"&|<>^]/;
// Batch files (".cmd", ".bat", e.g. the shims npm installs for codex and gemini), which Windows only runs through cmd.exe.
const BATCH_FILE = /\.(?:cmd|bat)$/i;

const quoteForWindows = (arg) => (NEEDS_WINDOWS_QUOTES.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg);
const isFile = (file) => fs.statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;

/**
 * Where Windows would find the command, as cmd.exe does: in each folder on PATH (or as given, if it is a path),
 * as written and with each extension in PATHEXT. null if it isn't installed.
 */
export function findWindowsCommand(command) {
  const isPath = command.includes('/') || command.includes('\\');
  const folders = isPath ? [''] : COMMAND_SEARCH_PATH;
  const names = path.extname(command) ? [command] : WINDOWS_COMMAND_EXTENSIONS.map((ext) => command + ext);
  for (const folder of folders) {
    for (const name of names) {
      const file = path.join(folder, name);
      if (isFile(file)) return file;
    }
  }
  return null;
}

/**
 * Starts a command with an argument array, never through a shell, except for Windows batch files, which only
 * cmd.exe can run; their arguments are quoted then. Throws if the command isn't installed (on Windows, cmd.exe
 * would otherwise start and only print "is not recognized").
 */
export function startCommand(command, args, options) {
  if (!IS_WINDOWS) return spawn(command, args, options);
  const file = findWindowsCommand(command);
  if (!file) throw new Error('it was not found');
  if (!BATCH_FILE.test(file)) return spawn(file, args, { ...options, windowsHide: true });
  return spawn(quoteForWindows(file), args.map(quoteForWindows), { ...options, shell: true, windowsHide: true });
}

/**
 * Stops the process and everything it started. On Windows, child.kill() would end only the direct child, e.g.
 * cmd.exe for a batch file or the node wrapper of a CLI, and leave the real program running, so the whole
 * tree is ended with taskkill.
 */
export function stopProcessTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (!IS_WINDOWS || !child.pid) {
    child.kill();
    return;
  }
  const taskkill = spawn(path.join(WINDOWS_TOOLS_DIR, 'taskkill.exe'), ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  // taskkill missing or refused: ending at least the direct child is the best that is left.
  taskkill.on('error', () => child.kill());
  taskkill.on('close', (code) => {
    if (code !== 0) child.kill();
  });
}
