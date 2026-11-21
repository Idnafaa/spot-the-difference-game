// Sound for Twinview Detective: short tones generated with WebAudio, so the
// game needs no audio files. Everything is created lazily on the first user
// gesture (browsers block audio before that) and can be muted with M.

let context = null;
let muted = false;

function ensureContext() {
  if (context === null) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    context = new AudioCtor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

/** One enveloped oscillator note. */
function tone(freq, startOffset, duration, type, gainValue) {
  const ctx = ensureContext();
  if (ctx === null || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** A bright two-note pop when a difference is found. */
export function playFind() {
  tone(660, 0, 0.12, 'sine', 0.22);
  tone(990, 0.07, 0.18, 'sine', 0.2);
}

/** A low buzz when a click misses. */
export function playMiss() {
  tone(160, 0, 0.22, 'sawtooth', 0.12);
  tone(120, 0.05, 0.2, 'sawtooth', 0.1);
}

/** A soft blip for buttons and key presses. */
export function playClick() {
  tone(520, 0, 0.07, 'triangle', 0.14);
}

/** A rising sparkle when a hint fires. */
export function playHint() {
  tone(880, 0, 0.1, 'sine', 0.16);
  tone(1175, 0.08, 0.12, 'sine', 0.16);
  tone(1568, 0.16, 0.16, 'sine', 0.14);
}

/** A short fanfare arpeggio when a level is cleared. */
export function playWin() {
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i += 1) tone(notes[i], i * 0.11, 0.28, 'triangle', 0.2);
}

/** A falling pair of notes when the timer runs out. */
export function playLose() {
  tone(392, 0, 0.25, 'triangle', 0.18);
  tone(262, 0.18, 0.4, 'triangle', 0.18);
}

/** A tick for the last seconds on the clock. */
export function playTick() {
  tone(1100, 0, 0.05, 'square', 0.06);
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
