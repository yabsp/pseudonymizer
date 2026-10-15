export const $ = (id) => document.getElementById(id);

export function setStatus(id, msg, isError = false) {
  $(id).textContent = msg;
  $(id).classList.toggle('error', isError);
}

/**
 * Builds an element: h('button', { type: 'button', className: 'ghost', onclick }, 'Text', child).
 * Strings become text nodes, never HTML, so values from users, files or models are safe to pass.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('aria-') || key.startsWith('data-')) el.setAttribute(key, value);
    else el[key] = value;
  }
  el.append(...children.filter((child) => child !== null && child !== undefined));
  return el;
}
