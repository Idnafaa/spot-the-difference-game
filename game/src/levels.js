// Level definitions for Twinview Detective: the three scenes, their timers,
// and the differences hidden in each one. Coordinates are panel-local pixels
// in a PANEL_W x PANEL_H picture; scenes.js draws both variants of a scene
// and changes exactly the spots listed here (variant 1 = the changed copy).

export const PANEL_W = 560;
export const PANEL_H = 470;

/**
 * Each difference: where it is (x, y, hit radius r) and what changed, in
 * words a player sees once it is found ("the clock shows a different time").
 */
export const LEVELS = [
  {
    id: 'room',
    name: 'Level 1 · The Cozy Room',
    tagline: 'A warm little room. Twelve things are not quite right.',
    seconds: 180,
    hints: 3,
    diffs: [
      { x: 105, y: 105, r: 34, label: 'the sun became the moon' },
      { x: 275, y: 95, r: 32, label: 'the picture changed' },
      { x: 400, y: 95, r: 30, label: 'the clock tells another time' },
      { x: 475, y: 112, r: 26, label: 'a book changed colour' },
      { x: 512, y: 182, r: 26, label: 'a book went missing' },
      { x: 212, y: 318, r: 34, label: 'the cat wandered off' },
      { x: 288, y: 318, r: 28, label: 'the cushion changed colour' },
      { x: 505, y: 252, r: 30, label: 'the lamp went out' },
      { x: 72, y: 288, r: 28, label: 'the flower changed colour' },
      { x: 378, y: 342, r: 26, label: 'the mug changed colour' },
      { x: 280, y: 428, r: 34, label: 'the rug lost a stripe' },
      { x: 185, y: 42, r: 26, label: 'a bunting flag changed colour' },
    ],
  },
  {
    id: 'garden',
    name: 'Level 2 · The Garden Picnic',
    tagline: 'Sunshine, sandwiches, and twelve sneaky changes.',
    seconds: 165,
    hints: 3,
    diffs: [
      { x: 80, y: 70, r: 32, label: 'the sun grew a ray' },
      { x: 300, y: 68, r: 32, label: 'the cloud changed shape' },
      { x: 402, y: 92, r: 28, label: 'the kite flew away' },
      { x: 472, y: 158, r: 28, label: 'an apple fell from the tree' },
      { x: 150, y: 242, r: 26, label: 'the bird flew off' },
      { x: 202, y: 198, r: 26, label: 'the butterfly changed colour' },
      { x: 382, y: 150, r: 26, label: 'a second butterfly appeared' },
      { x: 252, y: 368, r: 30, label: 'the basket lid opened' },
      { x: 342, y: 392, r: 28, label: 'an apple was eaten' },
      { x: 290, y: 408, r: 32, label: 'the blanket lost a stripe' },
      { x: 90, y: 418, r: 26, label: 'a flower changed colour' },
      { x: 498, y: 428, r: 26, label: 'a flower went missing' },
    ],
  },
  {
    id: 'harbor',
    name: 'Level 3 · The Harbor at Dusk',
    tagline: 'Last light over the water. The changes get subtle now.',
    seconds: 150,
    hints: 3,
    diffs: [
      { x: 90, y: 80, r: 30, label: 'the moon flipped' },
      { x: 300, y: 58, r: 32, label: 'a star went out' },
      { x: 490, y: 140, r: 30, label: 'the lighthouse went dark' },
      { x: 490, y: 222, r: 24, label: 'a lighthouse window lit up' },
      { x: 148, y: 322, r: 32, label: 'the sail changed colour' },
      { x: 148, y: 284, r: 24, label: 'the flag changed colour' },
      { x: 352, y: 356, r: 30, label: 'the little boat sailed away' },
      { x: 250, y: 118, r: 26, label: 'a gull flew off' },
      { x: 82, y: 388, r: 28, label: 'a crate vanished' },
      { x: 302, y: 398, r: 26, label: 'the buoy changed colour' },
      { x: 90, y: 316, r: 26, label: 'the moonlight moved' },
      { x: 478, y: 414, r: 26, label: 'the rope coil vanished' },
    ],
  },
];

export const BEST_KEY = 'twinview-detective-best';
export const MISS_PENALTY_SECONDS = 5;
export const HINT_PENALTY_SECONDS = 10;
export const POINTS_PER_FIND = 100;
export const POINTS_PER_SECOND_LEFT = 5;
