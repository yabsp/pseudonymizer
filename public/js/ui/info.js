/** Escape hides the full text of a hint ("i" button) that is open under the mouse or the keyboard focus. */
export function initInfoTips() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    for (const info of document.querySelectorAll('.info:hover, .info:focus-within')) info.classList.add('dismissed');
  });
  const reset = (e) => e.target.closest?.('.info')?.classList.remove('dismissed');
  document.addEventListener('mouseout', reset);
  document.addEventListener('focusout', reset);
}
