import fs from 'node:fs';
import path from 'node:path';
import { SETTINGS_FILE } from './config.js';
import { readBody, rejectUnlessFromApp, send } from './http.js';

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

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

export async function saveSettings(req, res) {
  if (rejectUnlessFromApp(req, res)) return;
  try {
    const settings = JSON.parse(await readBody(req));
    if (!isPlainObject(settings)) throw new Error('Settings must be a JSON object.');
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
    send(res, 200, { file: path.basename(SETTINGS_FILE) });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
}
