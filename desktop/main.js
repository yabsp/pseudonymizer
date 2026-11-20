// The desktop app: the local server (server/) inside Electron, and its page in a window of its own. Nothing leaves
// this computer: the server listens on 127.0.0.1 only, the model ships with the app, and the window loads nothing
// but the app's own page (any other request is cancelled before it starts).
import { app, BrowserWindow, dialog, Menu, session } from 'electron';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { readConfig, ROOT } from '../server/config.js';
import { createApp } from '../server/index.js';

// A fixed port keeps the page's origin, and with it what the page remembers (theme, settings copy), between runs;
// another free port is used if it is taken.
const PREFERRED_PORT = 47291;
const ICON = path.join(ROOT, 'desktop', 'icons', 'icon.png');
const SHELL_PATH_TIMEOUT_MS = 5000;
// The search path a terminal would print: the login shell's PATH between two markers, so greetings or other
// output from shell start-up files are ignored. [\s\S]*? matches everything between the markers, also line breaks.
const MARKED_PATH = /__PATH__([\s\S]*?)__PATH__/;
// Where the AI tools are usually installed, in case the login shell can't be asked.
const TOOL_FOLDERS = ['.local/bin', '.npm-global/bin', '.volta/bin', '.bun/bin'];
// Not a server: a spell-check dictionary download (Chromium starts one from Google otherwise) fails at once.
const NO_DOWNLOADS = 'http://127.0.0.1:9/';

/** What the login shell prints for its PATH, or '' if it can't be asked in time. */
function askLoginShell() {
  return new Promise((resolve) => {
    // A session of its own: an interactive shell started from a terminal in the background would otherwise stop
    // its whole process group, this app included, to wait for the terminal.
    const shell = spawn(process.env.SHELL || '/bin/sh', ['-ilc', 'printf "__PATH__%s__PATH__" "$PATH"'], { detached: true, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    const timer = setTimeout(() => shell.kill('SIGKILL'), SHELL_PATH_TIMEOUT_MS);
    shell.stdout.on('data', (data) => (output += data));
    shell.on('error', () => resolve(''));
    shell.on('close', () => {
      clearTimeout(timer);
      resolve(output);
    });
  });
}

/**
 * Apps started from the desktop get a minimal PATH on macOS and Linux, without ~/.local/bin (Claude Code) or nvm's
 * folder (Codex, Gemini CLI). The login shell knows the real one, so it is asked once.
 */
async function useTerminalSearchPath() {
  if (process.platform === 'win32') return;
  const extra = TOOL_FOLDERS.map((folder) => path.join(app.getPath('home'), folder));
  const shellPath = MARKED_PATH.exec(await askLoginShell())?.[1];
  if (shellPath) extra.unshift(...shellPath.split(path.delimiter));
  process.env.PATH = [...new Set([...extra, ...(process.env.PATH || '').split(path.delimiter)])].filter(Boolean).join(path.delimiter);
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

/**
 * The server's settings. Installed, what the user changes is kept in the system's place for app data (on Windows
 * %APPDATA%\Pseudonymizer) and the model is in the app's resources; started from the project folder ("npm start")
 * both are the project's, as with "npm run server". PSEUDONYMIZER_DATA_DIR and PSEUDONYMIZER_MODEL_DIR still win.
 */
async function serverConfig() {
  const env = { ...process.env, PORT: String((await isPortFree(PREFERRED_PORT)) ? PREFERRED_PORT : 0) };
  if (app.isPackaged) {
    env.PSEUDONYMIZER_DATA_DIR ||= app.getPath('userData');
    env.PSEUDONYMIZER_MODEL_DIR ||= path.join(process.resourcesPath, 'models', 'gliner');
  }
  return readConfig(env);
}

/** Runs before the page loads: the window may reach its own server and nothing else, and ask for no permission but copying. */
function allowOnly(origin) {
  const isOwn = (url = '') => url.startsWith(origin + '/') || url.startsWith(`blob:${origin}/`) || url.startsWith('data:') || url.startsWith('devtools:');
  const own = session.defaultSession;
  own.setSpellCheckerEnabled(false);
  own.setSpellCheckerDictionaryDownloadURL(NO_DOWNLOADS);
  own.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !isOwn(details.url) }));
  const isAllowed = (permission, url) => permission === 'clipboard-sanitized-write' && isOwn(url);
  own.setPermissionRequestHandler((_contents, permission, callback, details) => callback(isAllowed(permission, details.requestingUrl)));
  own.setPermissionCheckHandler((_contents, permission, requestingOrigin) => isAllowed(permission, requestingOrigin + '/'));
  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, url) => {
      if (!url.startsWith(origin + '/')) event.preventDefault(); // also a file dropped next to the drop zone
    });
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-attach-webview', (event) => event.preventDefault());
  });
}

function openWindow(origin) {
  const window = new BrowserWindow({
    width: 1100,
    height: 900,
    minWidth: 380,
    minHeight: 500,
    title: 'Pseudonymizer',
    icon: ICON,
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  window.once('ready-to-show', () => window.show());
  void window.loadURL(origin + '/'); // a failure to load shows in the window itself
  return window;
}

// The macOS menu bar carries the shortcuts for copy and paste; elsewhere the window needs no menu.
const MENU = process.platform === 'darwin' ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }]) : null;

// server === null: not started (yet); otherwise the running server (createApp in server/index.js).
let server = null;

async function start() {
  await useTerminalSearchPath();
  server = createApp(await serverConfig());
  // However the process ends, no AI tool it started keeps running.
  process.on('exit', server.stopNow);
  const origin = `http://127.0.0.1:${await server.listen()}`;
  // The only line the app writes: where it runs (also what tests read).
  console.log(`Pseudonymizer running at ${origin}`);
  allowOnly(origin);
  Menu.setApplicationMenu(MENU);
  const window = openWindow(origin);
  app.on('second-instance', () => {
    if (window.isMinimized()) window.restore();
    window.focus();
  });
}

// Started from the project folder, the browser data (cache, what the page remembers) stays in it too.
if (!app.isPackaged) app.setPath('userData', process.env.PSEUDONYMIZER_DATA_DIR || path.join(ROOT, '.cache', 'desktop'));
else if (process.env.PSEUDONYMIZER_DATA_DIR) app.setPath('userData', process.env.PSEUDONYMIZER_DATA_DIR);

// The one way the app ends: running AI tools are stopped and the model is released, then the process exits. A model
// that is still loading can't be interrupted, so the wait is limited.
const END_WAIT_MS = 10000;
let ending = null;
function end() {
  ending ??= Promise.race([server?.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, END_WAIT_MS))]).finally(() => app.exit(0));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('window-all-closed', end);
  // Quit from the menu (macOS) or by Electron itself.
  app.on('will-quit', (event) => {
    event.preventDefault();
    end();
  });
  // Ended by the system: logging out, shutting down, "kill".
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, end);
  app.whenReady().then(start).catch((e) => {
    dialog.showErrorBox('Pseudonymizer could not start', e.message);
    app.exit(1);
  });
}
