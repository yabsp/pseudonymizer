import { $ } from './dom.js';

const TABS = ['work', 'settings', 'prompts'];
const ARROW_STEPS = { ArrowRight: 1, ArrowLeft: -1 };

export function showTab(name) {
  for (const id of TABS) {
    const active = id === name;
    $('tab-' + id).setAttribute('aria-selected', active);
    $('tab-' + id).tabIndex = active ? 0 : -1;
    $('panel-' + id).hidden = !active;
  }
}

export function initTabs() {
  for (const id of TABS) $('tab-' + id).addEventListener('click', () => showTab(id));
  document.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    const step = ARROW_STEPS[e.key];
    if (!step) return;
    const current = TABS.findIndex((id) => $('tab-' + id).getAttribute('aria-selected') === 'true');
    const next = TABS[(current + step + TABS.length) % TABS.length];
    showTab(next);
    $('tab-' + next).focus();
  });
  showTab('work');
}
