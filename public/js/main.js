import { initBusyOverlay } from './ui/busy.js';
import { warmUpGliner } from './ui/detector-settings.js';
import { initPromptsPanel, loadPrompts } from './ui/prompts-panel.js';
import { initSettingsPanel, loadSettings } from './ui/settings-panel.js';
import { initTabs } from './ui/tabs.js';
import { initTheme } from './ui/theme.js';
import { initWorkflow, refresh } from './ui/workflow.js';

initTheme();
initTabs();
initBusyOverlay();
initSettingsPanel();
initPromptsPanel();
initWorkflow();

await loadSettings();
refresh();
void warmUpGliner();
await loadPrompts();
