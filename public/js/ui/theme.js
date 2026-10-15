import { $ } from './dom.js';

const THEME_KEY = 'pseudo-theme';
const THEMES = ['system', 'light', 'dark'];
const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' };

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.includes(saved) ? saved : 'system';
  } catch {
    return 'system'; // storage blocked: follow the system
  }
}

function applyTheme(theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  // All three labels stay in the button and CSS shows the current one, so its width never changes.
  $('themeToggle').dataset.theme = theme;
  $('themeToggle').setAttribute('aria-label', `Color theme: ${THEME_LABELS[theme]}. Change`);
}

/** The button cycles System, Light, Dark; the choice is kept in this browser only. */
export function initTheme() {
  applyTheme(readTheme());
  $('themeToggle').addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf($('themeToggle').dataset.theme) + 1) % THEMES.length];
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage blocked: the theme still applies until the page is reloaded
    }
  });
}
