// Input for Twinview Detective: mouse clicks and moves plus the keyboard
// ring, all converted into logical 1280x720 coordinates for main.js.
// Handlers: onClick(x, y), onMove(x, y), onKey(key) with key names like
// 'Enter', 'Tab', 'ArrowLeft', 'h', 'r', 'p', 'm', '1'.

import { VIEW_W, VIEW_H } from './render.js';

/** Convert a pointer event to logical canvas coordinates. */
function toLogical(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

export function createInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toLogical(canvas, event);
    handlers.onClick(x, y);
  });
  canvas.addEventListener('pointermove', (event) => {
    const { x, y } = toLogical(canvas, event);
    handlers.onMove(x, y);
  });
  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'Tab' || key.startsWith('Arrow') || key === ' ') event.preventDefault();
    handlers.onKey(key);
  });
}
