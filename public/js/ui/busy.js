import { $ } from './dom.js';

let runningTask = null;

export const isAbort = (e) => e.name === 'AbortError';

const setPageBlocked = (blocked) => {
  for (const el of document.querySelectorAll('.topbar, main')) el.inert = blocked;
};

/** Runs task(signal, showProgress) with the page blocked; Cancel and Escape abort the signal. */
export async function whileBusy(title, task) {
  runningTask = new AbortController();
  const started = Date.now();
  const timer = setInterval(() => ($('busyTime').textContent = Math.floor((Date.now() - started) / 1000)), 1000);
  $('busyTitle').textContent = title;
  $('busyDetail').textContent = '';
  $('busyTime').textContent = '0';
  $('busy').hidden = false;
  setPageBlocked(true);
  $('busyCancel').focus();
  try {
    return await task(runningTask.signal, (detail) => ($('busyDetail').textContent = detail));
  } finally {
    clearInterval(timer);
    $('busy').hidden = true;
    setPageBlocked(false);
    runningTask = null;
  }
}

export function initBusyOverlay() {
  $('busyCancel').addEventListener('click', () => runningTask?.abort());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') runningTask?.abort();
  });
}
