// Runs before the page is drawn (a classic script in <head>), so a chosen theme never flashes the other one.
// "system" has no attribute and follows the operating system through prefers-color-scheme in style.css.
try {
  const theme = localStorage.getItem('pseudo-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {
  // storage blocked: the system setting applies
}
