import { $, setStatus } from './dom.js';
import { scheduleSave } from './settings-store.js';

const isSupported = () => 'Notification' in globalThis;

/**
 * Tells the user that something finished while they work in another app: only if they turned notifications on
 * and this window is not in front. The message must never contain confidential content (no file names, which
 * often contain a name, no text, no values), as the system keeps and shows notifications outside the app.
 */
export function notify(message) {
  if (!isSupported() || !$('notify').checked || Notification.permission !== 'granted' || document.hasFocus()) return;
  const notification = new Notification('Pseudonymizer', { body: message });
  notification.onclick = () => window.focus();
}

function explainPermission() {
  if (!isSupported()) return setStatus('notifyStatus', 'This browser cannot show notifications.', true);
  const denied = $('notify').checked && Notification.permission === 'denied';
  setStatus('notifyStatus', denied ? 'Notifications are blocked for this page. Allow them in the browser\'s site settings.' : '', denied);
}

async function turnOn() {
  if (!isSupported()) return;
  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') {
    $('notify').checked = false;
    scheduleSave();
    setStatus('notifyStatus', 'Notifications were not allowed, so they stay off. Allow them in the browser\'s site settings to use them.', true);
    return;
  }
  explainPermission();
}

/** After loadSettings: the saved choice may meet a permission the user withdrew since. */
export const showNotificationState = explainPermission;

export function initNotifications() {
  $('notify').disabled = !isSupported();
  $('notify').addEventListener('change', () => {
    if ($('notify').checked) turnOn().catch((e) => setStatus('notifyStatus', 'Notifications could not be turned on: ' + e.message, true));
    else explainPermission();
  });
}
