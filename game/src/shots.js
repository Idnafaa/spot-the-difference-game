// Screenshot scenes behind ?shot=title|play|harbor|win. Each one puts the
// real game state into a representative moment — mid-hunt with several
// differences found and several still hiding, the title screen, the third
// scene, and a cleared case — so a screenshot shows what playing looks like.

/**
 * Set `state` to the named scene. `startLevel(index)` resets the state for
 * a fresh attempt at that level; this function then marks some differences
 * found and sets the clock and score to believable mid-game values.
 */
export function stageShot(name, state, startLevel) {
  if (name === 'harbor') {
    startLevel(2);
    state.screen = 'play';
    for (const i of [0, 2, 4, 8]) {
      state.found.add(i);
      state.foundAt[i] = 0;
    }
    state.timeLeft = 71;
    state.score = 400;
    state.hintsLeft = 2;
    state.message = 'Found: the sail changed colour!';
    state.messageGood = true;
    state.crosshair = { panel: 1, x: 490, y: 222, visible: true };
    return;
  }
  if (name === 'garden') {
    startLevel(1);
    state.screen = 'play';
    for (const i of [0, 3, 6, 9]) {
      state.found.add(i);
      state.foundAt[i] = 0;
    }
    state.timeLeft = 118;
    state.score = 400;
    state.hintsLeft = 3;
    state.message = 'Found: the blanket lost a stripe!';
    state.messageGood = true;
    return;
  }
  if (name === 'win') {
    startLevel(0);
    state.screen = 'complete';
    state.levelIndex = 0;
    for (let i = 0; i < 12; i += 1) {
      state.found.add(i);
      state.foundAt[i] = 0;
    }
    state.timeLeft = 84;
    state.lastBonus = 420;
    state.score = 1620;
    return;
  }
  if (name === 'play') {
    startLevel(0);
    state.screen = 'play';
    for (const i of [0, 2, 5, 7, 9]) {
      state.found.add(i);
      state.foundAt[i] = 0;
    }
    state.timeLeft = 96;
    state.score = 500;
    state.hintsLeft = 3;
    state.message = 'Found: the lamp went out!';
    state.messageGood = true;
    state.crosshair = { panel: 1, x: 275, y: 95, visible: true };
    return;
  }
  // title (and anything unknown)
  startLevel(0);
  state.screen = 'title';
}
