// Rendering for Twinview Detective: the whole 1280x720 frame is painted on
// one canvas — header with the counter and timer, the two picture panels
// with their found-markers, the buttons along the bottom, and the title /
// pause / end screens. main.js owns the state; this file only draws it.

import { LEVELS, PANEL_W, PANEL_H } from './levels.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const PANEL_POS = [
  { x: 40, y: 118 },
  { x: 680, y: 118 },
];

/** Buttons along the bottom bar; input.js hit-tests against these. */
export const BUTTONS = [
  { id: 'hint', x: 40, y: 618, w: 150, h: 52, label: 'Hint (H)' },
  { id: 'restart', x: 206, y: 618, w: 170, h: 52, label: 'Restart (R)' },
  { id: 'pause', x: 392, y: 618, w: 150, h: 52, label: 'Pause (P)' },
  { id: 'sound', x: 558, y: 618, w: 170, h: 52, label: 'Sound (M)' },
  { id: 'level0', x: 760, y: 618, w: 150, h: 52, label: 'Room (1)' },
  { id: 'level1', x: 926, y: 618, w: 150, h: 52, label: 'Garden (2)' },
  { id: 'level2', x: 1092, y: 618, w: 150, h: 52, label: 'Harbor (3)' },
];

const INK = '#f4f1de';
const DIM = '#9fb3c8';
const ACCENT = '#ffd93d';
const GOOD = '#57cc99';
const BAD = '#ef476f';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawButton(ctx, button, active, disabled) {
  rr(ctx, button.x, button.y, button.w, button.h, 12);
  ctx.fillStyle = disabled ? '#2a3444' : active ? '#e4572e' : '#31405c';
  ctx.fill();
  ctx.strokeStyle = active ? '#ffb703' : '#4a5d7e';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, button.label, button.x + button.w / 2, button.y + button.h / 2 + 1, 19, disabled ? DIM : INK, 'center');
}

/** The green ring + tick drawn on both panels where a difference was found. */
function drawFoundMarker(ctx, cx, cy, r, now, foundAt) {
  const age = Math.min(1, (now - foundAt) / 260);
  const scale = 1 + (1 - age) * 0.35;
  ctx.strokeStyle = GOOD;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.34);
  ctx.lineTo(cx + r * 0.46, cy - r * 0.36);
  ctx.stroke();
}

function drawPanels(ctx, state, now) {
  const level = LEVELS[state.levelIndex];
  const shake = now < state.shakeUntil ? Math.sin(now / 18) * 4 : 0;
  for (let p = 0; p < 2; p += 1) {
    const pos = PANEL_POS[p];
    // Frame.
    rr(ctx, pos.x - 6 + shake, pos.y - 6, PANEL_W + 12, PANEL_H + 12, 14);
    ctx.fillStyle = '#1b2637';
    ctx.fill();
    ctx.strokeStyle = '#4a5d7e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.drawImage(state.panels[p], pos.x + shake, pos.y);
    // Panel label chip.
    rr(ctx, pos.x + 10 + shake, pos.y + 10, 132, 30, 8);
    ctx.fillStyle = 'rgba(16,22,35,0.78)';
    ctx.fill();
    text(ctx, p === 0 ? 'ORIGINAL' : 'CHANGED', pos.x + 76 + shake, pos.y + 26, 16, ACCENT, 'center');
    // Found markers.
    level.diffs.forEach((diff, i) => {
      if (!state.found.has(i)) return;
      drawFoundMarker(ctx, pos.x + diff.x + shake, pos.y + diff.y, diff.r, now, state.foundAt[i] ?? 0);
    });
    // Hint pulse on an unfound difference.
    if (state.hintPulse !== null && now < state.hintPulse.until) {
      const diff = level.diffs[state.hintPulse.index];
      const pulse = 1 + Math.sin(now / 90) * 0.16;
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.arc(pos.x + diff.x + shake, pos.y + diff.y, diff.r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Miss marks (red X where the player clicked wrongly).
    for (const miss of state.misses) {
      if (miss.panel !== p || now > miss.until) continue;
      const mx = pos.x + miss.x + shake;
      const my = pos.y + miss.y;
      ctx.strokeStyle = BAD;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(mx - 12, my - 12); ctx.lineTo(mx + 12, my + 12);
      ctx.moveTo(mx + 12, my - 12); ctx.lineTo(mx - 12, my + 12);
      ctx.stroke();
    }
    // Keyboard crosshair.
    if (state.crosshair.visible && state.crosshair.panel === p && state.screen === 'play') {
      const cx = pos.x + state.crosshair.x + shake;
      const cy = pos.y + state.crosshair.y;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy); ctx.lineTo(cx - 8, cy);
      ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 24, cy);
      ctx.moveTo(cx, cy - 24); ctx.lineTo(cx, cy - 8);
      ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 24);
      ctx.stroke();
    }
  }
}

function drawHeader(ctx, state) {
  const level = LEVELS[state.levelIndex];
  const total = level.diffs.length;
  const foundCount = state.found.size;
  const left = total - foundCount;

  text(ctx, 'TWINVIEW DETECTIVE', 40, 34, 30, ACCENT);
  text(ctx, level.name, 40, 72, 20, INK);

  // The counter: how many differences remain. Big and unmissable.
  rr(ctx, 470, 16, 340, 76, 14);
  ctx.fillStyle = '#1b2637';
  ctx.fill();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, `${left} LEFT`, 640, 46, 36, ACCENT, 'center');
  text(ctx, `found ${foundCount} of ${total}`, 640, 76, 17, DIM, 'center');

  // Found dots.
  for (let i = 0; i < total; i += 1) {
    ctx.beginPath();
    ctx.arc(486 + i * 26, 104, 8, 0, Math.PI * 2);
    ctx.fillStyle = state.found.has(i) ? GOOD : '#31405c';
    ctx.fill();
  }

  // Timer: seconds plus a draining bar that turns red near the end.
  const seconds = Math.max(0, Math.ceil(state.timeLeft));
  const frac = Math.max(0, state.timeLeft / level.seconds);
  text(ctx, `${seconds}s`, 1240, 38, 32, seconds <= 15 ? BAD : INK, 'right');
  rr(ctx, 880, 58, 360, 14, 7);
  ctx.fillStyle = '#31405c';
  ctx.fill();
  rr(ctx, 880, 58, 360 * frac, 14, 7);
  ctx.fillStyle = seconds <= 15 ? BAD : GOOD;
  ctx.fill();
  text(ctx, `score ${state.score}   ·   hints ${state.hintsLeft}`, 1240, 90, 18, DIM, 'right');
}

function drawPlay(ctx, state, now) {
  drawHeader(ctx, state);
  drawPanels(ctx, state, now);
  // Message line above the buttons.
  if (state.message !== '') {
    text(ctx, state.message, 640, 604, 21, state.messageGood ? GOOD : BAD, 'center');
  } else {
    text(ctx, 'Click a difference in either picture. Wrong clicks cost 5 seconds.', 640, 604, 18, DIM, 'center');
  }
  for (const button of BUTTONS) {
    const active = button.id === `level${state.levelIndex}`;
    const disabled = button.id === 'hint' && state.hintsLeft <= 0;
    drawButton(ctx, button, active, disabled);
  }
}

function drawTitle(ctx, state, now) {
  drawPanels(ctx, state, now);
  ctx.fillStyle = 'rgba(10,14,24,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'TWINVIEW DETECTIVE', 640, 150, 64, ACCENT, 'center');
  text(ctx, 'Two pictures. Twelve lies. Find them all.', 640, 205, 26, INK, 'center');
  text(ctx, 'Compare the ORIGINAL and CHANGED pictures and click every difference', 640, 258, 20, DIM, 'center');
  text(ctx, 'before the timer runs out. Three scenes, each trickier than the last.', 640, 286, 20, DIM, 'center');

  const lines = [
    'Mouse: click a difference in either picture',
    'Keyboard: arrows move the ring, Tab switches picture, Enter marks it',
    'H hint  ·  R restart  ·  P pause  ·  M sound  ·  1/2/3 choose a scene',
    'Wrong clicks cost 5 seconds. Hints cost 10. Speed earns bonus points.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 352 + i * 32, 19, INK, 'center'));

  rr(ctx, 490, 500, 300, 64, 14);
  ctx.fillStyle = '#e4572e';
  ctx.fill();
  text(ctx, 'PLAY  (Enter)', 640, 533, 28, '#ffffff', 'center');
  text(ctx, state.best > 0 ? `best score ${state.best}` : 'no cases closed yet — good luck, detective', 640, 600, 19, DIM, 'center');
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,14,24,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, title, 640, 240, 54, accent, 'center');
  lines.forEach((line, i) => text(ctx, line, 640, 310 + i * 36, 22, INK, 'center'));
}

/** Paint the whole frame for the current state. */
export function draw(ctx, state, now) {
  ctx.fillStyle = '#101623';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (state.screen === 'title') {
    drawTitle(ctx, state, now);
    return;
  }
  drawPlay(ctx, state, now);
  if (state.screen === 'paused') {
    drawOverlay(ctx, 'PAUSED', ['Press P or click Pause to keep hunting.'], ACCENT);
  } else if (state.screen === 'complete') {
    const level = LEVELS[state.levelIndex];
    const next = state.levelIndex < LEVELS.length - 1 ? 'Press Enter for the next scene.' : 'Press Enter for the final report.';
    drawOverlay(ctx, 'CASE CLOSED!', [
      `${level.name} — all ${level.diffs.length} differences found`,
      `time left ${Math.max(0, Math.ceil(state.timeLeft))}s  ·  time bonus +${state.lastBonus}`,
      `score ${state.score}`,
      next,
    ], GOOD);
  } else if (state.screen === 'timeup') {
    const left = LEVELS[state.levelIndex].diffs.length - state.found.size;
    drawOverlay(ctx, "TIME'S UP", [
      `${left} difference${left === 1 ? '' : 's'} stayed hidden.`,
      `score ${state.score}`,
      'Press Enter or R to try this scene again.',
    ], BAD);
  } else if (state.screen === 'alldone') {
    drawOverlay(ctx, 'MASTER DETECTIVE', [
      'Every scene solved. Nothing escapes your eye.',
      `final score ${state.score}  ·  best ${state.best}`,
      'Press Enter to play again from the Cozy Room.',
    ], ACCENT);
  }
}

/** Which button (if any) contains a logical point; used by input handling. */
export function buttonAt(x, y) {
  for (const button of BUTTONS) {
    if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) return button.id;
  }
  return null;
}
