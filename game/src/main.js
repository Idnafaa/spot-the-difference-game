// Boot and game logic for Twinview Detective: the state machine (title,
// play, paused, case closed, time up, all scenes done), the countdown
// timer, hit-testing clicks against the hidden differences, hints, score,
// and the keyboard ring. Rendering lives in render.js, scenes in scenes.js.
//
// ?shot=title|play|harbor|win stages a screenshot scene (see shots.js) and
// sets window.__shotReady once it has been painted twice.

import {
  LEVELS, PANEL_W, PANEL_H, BEST_KEY,
  MISS_PENALTY_SECONDS, HINT_PENALTY_SECONDS,
  POINTS_PER_FIND, POINTS_PER_SECOND_LEFT,
} from './levels.js';
import { renderPanels } from './scenes.js';
import { draw, buttonAt, PANEL_POS, VIEW_W, VIEW_H } from './render.js';
import { createInput } from './input.js';
import { stageShot } from './shots.js';
import {
  playFind, playMiss, playClick, playHint, playWin, playLose, playTick,
  toggleMute, isMuted,
} from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const state = {
  screen: 'title',
  levelIndex: 0,
  panels: renderPanels(LEVELS[0].id),
  found: new Set(),
  foundAt: {},
  timeLeft: LEVELS[0].seconds,
  score: 0,
  hintsLeft: LEVELS[0].hints,
  hintPulse: null,
  misses: [],
  crosshair: { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false },
  message: '',
  messageGood: true,
  messageUntil: 0,
  shakeUntil: 0,
  lastBonus: 0,
  best: readBest(),
  lastTickSecond: -1,
};

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest() {
  if (state.score <= state.best) return;
  state.best = state.score;
  try {
    window.localStorage.setItem(BEST_KEY, String(state.best));
  } catch {
    // Storage can be off (private windows): the best then lasts this visit only.
  }
}

function announce(text) {
  status.textContent = text;
}

function say(message, good, now) {
  state.message = message;
  state.messageGood = good;
  state.messageUntil = now + 3200;
  announce(message);
}

/** Reset the state for a fresh attempt at level `index`. */
function startLevel(index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.panels = renderPanels(level.id);
  state.found = new Set();
  state.foundAt = {};
  state.timeLeft = level.seconds;
  state.hintsLeft = level.hints;
  state.hintPulse = null;
  state.misses = [];
  state.crosshair = { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
  state.message = '';
  state.lastBonus = 0;
  state.lastTickSecond = -1;
  state.screen = 'play';
  announce(`${level.name}. ${level.diffs.length} differences to find.`);
}

/** Panel-local coordinates for a logical point, or null outside the panels. */
function panelPoint(x, y) {
  for (let p = 0; p < 2; p += 1) {
    const pos = PANEL_POS[p];
    const lx = x - pos.x;
    const ly = y - pos.y;
    if (lx >= 0 && lx < PANEL_W && ly >= 0 && ly < PANEL_H) return { panel: p, x: lx, y: ly };
  }
  return null;
}

/** Try to mark a difference at panel-local (x, y) on either picture. */
function markAt(x, y, now) {
  const level = LEVELS[state.levelIndex];
  for (let i = 0; i < level.diffs.length; i += 1) {
    if (state.found.has(i)) continue;
    const diff = level.diffs[i];
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(i);
      state.foundAt[i] = now;
      state.score += POINTS_PER_FIND;
      if (state.hintPulse !== null && state.hintPulse.index === i) state.hintPulse = null;
      playFind();
      const left = level.diffs.length - state.found.size;
      say(`Found: ${diff.label}! ${left} to go.`, true, now);
      if (left === 0) completeLevel(now);
      return true;
    }
  }
  return false;
}

function missAt(point, now) {
  state.misses.push({ panel: point.panel, x: point.x, y: point.y, until: now + 900 });
  state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY_SECONDS);
  state.shakeUntil = now + 260;
  playMiss();
  say(`Not there. -${MISS_PENALTY_SECONDS} seconds.`, false, now);
}

function completeLevel(now) {
  state.lastBonus = Math.floor(state.timeLeft) * POINTS_PER_SECOND_LEFT;
  state.score += state.lastBonus;
  state.screen = 'complete';
  playWin();
  saveBest();
  announce(`Case closed. Score ${state.score}.`);
}

function useHint(now) {
  if (state.screen !== 'play' || state.hintsLeft <= 0) return;
  const level = LEVELS[state.levelIndex];
  const unfound = level.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
  if (unfound.length === 0) return;
  const index = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintPulse = { index, until: now + 2400 };
  state.hintsLeft -= 1;
  state.timeLeft = Math.max(0, state.timeLeft - HINT_PENALTY_SECONDS);
  playHint();
  say(`Hint: watch the dashed ring. -${HINT_PENALTY_SECONDS} seconds.`, true, now);
}

function togglePause() {
  if (state.screen === 'play') {
    state.screen = 'paused';
    playClick();
  } else if (state.screen === 'paused') {
    state.screen = 'play';
    playClick();
  }
}

function advance() {
  if (state.screen === 'title') {
    state.score = 0;
    startLevel(0);
    playClick();
  } else if (state.screen === 'complete') {
    if (state.levelIndex < LEVELS.length - 1) {
      startLevel(state.levelIndex + 1);
    } else {
      state.screen = 'alldone';
      saveBest();
    }
    playClick();
  } else if (state.screen === 'timeup') {
    startLevel(state.levelIndex);
    playClick();
  } else if (state.screen === 'alldone') {
    state.score = 0;
    startLevel(0);
    playClick();
  }
}

function runButton(id, now) {
  if (id === 'hint') useHint(now);
  else if (id === 'restart') { startLevel(state.levelIndex); playClick(); }
  else if (id === 'pause') togglePause();
  else if (id === 'sound') { toggleMute(); say(isMuted() ? 'Sound off.' : 'Sound on.', true, now); }
  else if (id.startsWith('level')) { startLevel(Number(id.slice(5))); playClick(); }
}

function onClick(x, y) {
  const now = performance.now();
  if (state.screen === 'title') {
    if (x >= 490 && x <= 790 && y >= 500 && y <= 564) advance();
    return;
  }
  if (state.screen === 'complete' || state.screen === 'timeup' || state.screen === 'alldone') {
    advance();
    return;
  }
  const button = buttonAt(x, y);
  if (button !== null) {
    runButton(button, now);
    return;
  }
  if (state.screen !== 'play') return;
  const point = panelPoint(x, y);
  if (point === null) return;
  state.crosshair = { panel: point.panel, x: point.x, y: point.y, visible: false };
  if (!markAt(point.x, point.y, now)) missAt(point, now);
}

function onMove() {
  // The mouse needs no hover state; the keyboard ring hides while it moves.
  if (state.crosshair.visible) state.crosshair.visible = false;
}

function onKey(key) {
  const now = performance.now();
  const lower = key.toLowerCase();
  if (key === 'Enter' || key === ' ') {
    if (state.screen === 'play') {
      const point = { panel: state.crosshair.panel, x: state.crosshair.x, y: state.crosshair.y };
      if (!markAt(point.x, point.y, now)) missAt(point, now);
    } else {
      advance();
    }
    return;
  }
  if (key === 'Tab') {
    state.crosshair.panel = 1 - state.crosshair.panel;
    state.crosshair.visible = true;
    return;
  }
  const step = 18;
  if (key.startsWith('Arrow') || 'wasd'.includes(lower)) {
    state.crosshair.visible = true;
    if (key === 'ArrowLeft' || lower === 'a') state.crosshair.x -= step;
    if (key === 'ArrowRight' || lower === 'd') state.crosshair.x += step;
    if (key === 'ArrowUp' || lower === 'w') state.crosshair.y -= step;
    if (key === 'ArrowDown' || lower === 's') state.crosshair.y += step;
    state.crosshair.x = Math.min(PANEL_W - 4, Math.max(4, state.crosshair.x));
    state.crosshair.y = Math.min(PANEL_H - 4, Math.max(4, state.crosshair.y));
    return;
  }
  if (lower === 'h') useHint(now);
  else if (lower === 'r') { startLevel(state.levelIndex); playClick(); }
  else if (lower === 'p' || key === 'Escape') togglePause();
  else if (lower === 'm') { toggleMute(); say(isMuted() ? 'Sound off.' : 'Sound on.', true, now); }
  else if (key === '1' || key === '2' || key === '3') { startLevel(Number(key) - 1); playClick(); }
}

function update(dt, now) {
  if (state.message !== '' && now > state.messageUntil) state.message = '';
  if (state.screen !== 'play') return;
  state.timeLeft -= dt;
  const second = Math.ceil(state.timeLeft);
  if (second <= 10 && second > 0 && second !== state.lastTickSecond) {
    state.lastTickSecond = second;
    playTick();
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'timeup';
    playLose();
    saveBest();
    announce("Time's up.");
  }
}

function runGame() {
  createInput(canvas, { onClick, onMove, onKey });
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    update(dt, now);
    draw(ctx, state, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runShot(name) {
  stageShot(name, state, startLevel);
  let painted = 0;
  function paint() {
    draw(ctx, state, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot !== null) runShot(shot);
else runGame();
