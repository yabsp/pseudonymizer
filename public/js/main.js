import { initBusyOverlay } from './ui/busy.js';
import { initDocuments } from './ui/documents.js';
import { initInfoTips } from './ui/info.js';
import { startDetection } from './ui/detector-settings.js';
import { initNotifications, showNotificationState } from './ui/notifications.js';
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
initDocuments();
initNotifications();
initInfoTips();

const saved = await loadSettings();
showNotificationState();
refresh();
void startDetection(saved.accelerator || 'auto');
await loadPrompts();
