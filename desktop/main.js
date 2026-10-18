// The desktop app: starts the unchanged local server inside Electron and shows the page in a locked-down window.
// Everything stays on this machine: the server listens on 127.0.0.1 only, the models ship with the app and are
// loaded offline, and the window can't open other sites.
import { app, BrowserWindow, dialog, Menu, session, shell } from 'electron';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DESKTOP_DIR = path.dirname(fileURLToPath(import.meta.url));
// A fixed port, so the page keeps its origin and with it the theme choice between runs; another free port is
// used if it is taken.
const PREFERRED_PORT = 47291;
const APP_ID = 'app.pseudonymizer.desktop';
const SHELL_PATH_TIMEOUT_MS = 5000;
// The search path a terminal would print: the login shell's PATH between two markers, so greetings or other
// output from shell start-up files are ignored. [\s\S]*? matches everything between the markers, also line breaks.
const MARKED_PATH = /__PATH__([\s\S]*?)__PATH__/;
// The folders where the AI tools are usually installed, in case the login shell can't be asked.
const TOOL_FOLDERS = ['.local/bin', '.npm-global/bin', '.volta/bin', '.bun/bin'];
// What the page may load: this app's server and a local Ollama (the Ollama detector is called from the page),
// i.e. http on localhost or 127.0.0.1 with any port; and data: or blob: URLs the page creates itself (downloads
// of the mapping table). Everything else, such as a spell-check dictionary from Google, is blocked.
const LOCAL_URL = /^(?:http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/|data:|blob:|devtools:)/;

/**
 * Apps started from the desktop get a minimal PATH, without ~/.local/bin (Claude Code) or nvm's folder (Codex,
 * Gemini CLI). The login shell knows the real one, so it is asked once at start.
 */
function useTerminalSearchPath() {
  if (process.platform === 'win32') return;
  const home = app.getPath('home');
  const extra = TOOL_FOLDERS.map((folder) => path.join(home, folder));
  try {
    const shell = process.env.SHELL || '/bin/sh';
    const output = execFileSync(shell, ['-ilc', 'printf "__PATH__%s__PATH__" "$PATH"'], { encoding: 'utf8', timeout: SHELL_PATH_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'ignore'] });
    const shellPath = output.match(MARKED_PATH)?.[1];
    if (shellPath) extra.unshift(...shellPath.split(path.delimiter));
  } catch {
    // the shell could not be asked in time; the usual install folders below still apply
  }
  process.env.PATH = [...new Set([...extra, ...(process.env.PATH || '').split(path.delimiter)])].filter(Boolean).join(path.delimiter);
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

async function choosePort() {
  if (await isPortFree(PREFERRED_PORT)) return PREFERRED_PORT;
  const probe = net.createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address();
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

/** In the installed app the helper and the models are next to the program, in its resources folder. */
function configureServer(port) {
  process.env.PORT = String(port);
  process.env.PSEUDONYMIZER_DATA_DIR = app.getPath('userData');
  process.env.PSEUDONYMIZER_APP = 'desktop';
  process.env.PSEUDONYMIZER_API_TOKEN = apiToken;
  if (!app.isPackaged) return;
  const helperName = process.platform === 'win32' ? 'detection-helper.exe' : 'detection-helper';
  process.env.DETECTION_HELPER = path.join(process.resourcesPath, 'helper', 'detection-helper', helperName);
  process.env.HF_HOME = path.join(process.resourcesPath, 'models');
  process.env.DOCLING_ARTIFACTS_PATH = path.join(process.resourcesPath, 'models', 'docling');
  // Never contact Hugging Face: the models are bundled, and checking for updates would reveal app use.
  process.env.HF_HUB_OFFLINE = '1';
  process.env.TRANSFORMERS_OFFLINE = '1';
  process.env.HF_HUB_DISABLE_TELEMETRY = '1';
}

// Not a valid host, so a dictionary download fails right away instead of reaching Google.
const NO_DICTIONARY_DOWNLOADS = 'http://127.0.0.1:9/';

/** Runs first, before anything can load: the app never needs the internet. */
function blockInternet() {
  // Chromium's spell checker downloads dictionaries from Google as soon as the app starts.
  session.defaultSession.setSpellCheckerEnabled(false);
  session.defaultSession.setSpellCheckerDictionaryDownloadURL(NO_DICTIONARY_DOWNLOADS);
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !LOCAL_URL.test(details.url) }));
  // Notifications only (the page shows no content in them, see public/js/ui/notifications.js), and only for this
  // app's own page; no camera, microphone, location or other permissions.
  const isAllowed = (permission, url) => permission === 'notifications' && LOCAL_URL.test(url || '');
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback, details) => callback(isAllowed(permission, details.requestingUrl)));
  session.defaultSession.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => isAllowed(permission, requestingOrigin + '/'));
}

// A new secret on every start; only this app's window sends it, added here so the page itself never sees it.
const apiToken = crypto.randomBytes(32).toString('hex');

function sendApiToken(origin) {
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: [`${origin}/api/*`] }, (details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders, 'X-Pseudonymizer-Token': apiToken } });
  });
}

function lockWindows(origin) {
  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, url) => {
      if (!url.startsWith(origin + '/')) event.preventDefault();
    });
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
  });
}

function openWindow(origin) {
  const window = new BrowserWindow({
    width: 1100,
    height: 860,
    minWidth: 380,
    minHeight: 500,
    title: 'Pseudonymizer',
    icon: path.join(DESKTOP_DIR, 'icons', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  window.once('ready-to-show', () => window.show());
  void window.loadURL(origin + '/'); // load failures show in the window itself
  return window;
}

/**
 * Windows shows notifications only for an app id that a Start menu entry carries. The app ships as a folder
 * without an installer (ADR 0008), so it adds that entry itself, for this user only, and points it at the folder
 * it now runs from (it may have been moved). Not being able to is not fatal: only notifications are missing.
 */
function addStartMenuEntry() {
  const link = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Pseudonymizer.lnk');
  const entry = { target: process.execPath, appUserModelId: APP_ID, description: 'Pseudonymizer' };
  let current = null;
  try {
    current = shell.readShortcutLink(link);
  } catch {
    // no entry yet; it is created below
  }
  if (current?.target === entry.target && current?.appUserModelId === APP_ID) return;
  // 'replace' only overwrites an existing entry, 'create' only makes a new one.
  if (!shell.writeShortcutLink(link, current ? 'replace' : 'create', entry)) console.error('The Start menu entry could not be written, so notifications may not show.');
}

async function start() {
  blockInternet();
  // Started from the project folder, only Electron's own path is known to Windows as an app id.
  if (process.platform === 'win32') app.setAppUserModelId(app.isPackaged ? APP_ID : process.execPath);
  if (process.platform === 'win32' && app.isPackaged) addStartMenuEntry();
  useTerminalSearchPath();
  const port = await choosePort();
  configureServer(port);
  const { listening } = await import('../server/index.js');
  // server/config.js has read it; the helpers and AI tools the server starts don't inherit it.
  delete process.env.PSEUDONYMIZER_API_TOKEN;
  await listening;
  const origin = `http://127.0.0.1:${port}`;
  lockWindows(origin);
  sendApiToken(origin);
  Menu.setApplicationMenu(null);
  let window = openWindow(origin);
  app.on('second-instance', () => {
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) window = openWindow(origin);
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('window-all-closed', () => app.quit());
  app.whenReady().then(start).catch((e) => {
    dialog.showErrorBox('Pseudonymizer could not start', e.message);
    app.quit();
  });
}
