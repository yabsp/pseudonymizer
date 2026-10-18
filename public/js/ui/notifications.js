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
  show(message);
}

function show(message) {
  const notification = new Notification('Pseudonymizer', { body: message });
  notification.onclick = () => window.focus();
  notification.onerror = () => setStatus('notifyStatus', 'The system refused to show the notification.', true);
  return notification;
}

/** Shows one right away, also while this window is in front, so the user can see that the system lets them through. */
async function sendTest() {
  if (!isSupported()) return explainPermission();
  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') {
    return setStatus('notifyStatus', "Notifications are not allowed for this page. Allow them in the browser's site settings.", true);
  }
  show('This is a test. Notifications appear like this when work is done.');
  setStatus('notifyStatus', 'Sent. If nothing appeared, check that the system allows notifications for this app or browser and that "Do not disturb" is off. They appear only while this window is not in front.');
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
  $('testNotifyBtn').disabled = !isSupported();
  $('testNotifyBtn').addEventListener('click', () => {
    sendTest().catch((e) => setStatus('notifyStatus', 'The test notification could not be shown: ' + e.message, true));
  });
  $('notify').addEventListener('change', () => {
    if ($('notify').checked) turnOn().catch((e) => setStatus('notifyStatus', 'Notifications could not be turned on: ' + e.message, true));
    else explainPermission();
  });
}
