// Scene painting for Twinview Detective. Every picture is drawn with plain
// canvas shapes (no image files), so both panels render identically except
// for the deliberate changes: drawScene(ctx, levelId, variant) paints the
// original when variant is 0 and the changed copy when variant is 1. The
// changed spots are the ones listed in levels.js.

import { PANEL_W, PANEL_H } from './levels.js';

/** Small drawing helpers shared by the three scenes. */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}
function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function tri(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
}
function fill(ctx, color) {
  ctx.fillStyle = color;
  ctx.fill();
}

/* ------------------------------------------------------------------ room */

function drawRoom(ctx, v) {
  // Wall and floor.
  fill(ctx, '#f3e3c8');
  ctx.fillRect(0, 0, PANEL_W, 330);
  fill(ctx, '#b9834f');
  ctx.fillRect(0, 330, PANEL_W, PANEL_H - 330);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let x = 0; x < PANEL_W; x += 70) ctx.fillRect(x, 330, 3, PANEL_H - 330);
  fill(ctx, '#e8d5ae');
  ctx.fillRect(0, 322, PANEL_W, 8);

  // Bunting across the top; one flag changes colour in the copy.
  const flagColors = ['#e4572e', '#f2a03d', '#2e86ab', '#7fb069', '#bc4b8c', '#e4572e', '#f2a03d', '#2e86ab'];
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(PANEL_W / 2, 52, PANEL_W, 18);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const fx = 30 + i * 64;
    const fy = 24 + Math.sin((i / 7) * Math.PI) * 14;
    let color = flagColors[i];
    if (v === 1 && i === 2) color = '#bc4b8c'; // diff: bunting flag (185, 42)
    tri(ctx, fx, fy, fx + 34, fy + 4, fx + 17, fy + 30);
    fill(ctx, color);
  }

  // Window with sun (original) or moon (copy).
  rr(ctx, 40, 50, 130, 140, 6);
  fill(ctx, '#8ecae6');
  ctx.save();
  rr(ctx, 46, 56, 118, 128, 4);
  ctx.clip();
  if (v === 0) {
    circle(ctx, 105, 105, 24);
    fill(ctx, '#ffd93d');
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(105 + Math.cos(a) * 30, 105 + Math.sin(a) * 30);
      ctx.lineTo(105 + Math.cos(a) * 40, 105 + Math.sin(a) * 40);
      ctx.stroke();
    }
    ellipse(ctx, 70, 150, 26, 10);
    fill(ctx, '#ffffff');
    ellipse(ctx, 140, 158, 30, 11);
    fill(ctx, '#ffffff');
  } else {
    fill(ctx, '#1d3557');
    ctx.fillRect(46, 56, 118, 128);
    circle(ctx, 105, 105, 22);
    fill(ctx, '#f1fa8c');
    circle(ctx, 114, 98, 18);
    fill(ctx, '#1d3557');
    fill(ctx, '#ffffff');
    circle(ctx, 66, 76, 2.5); ctx.fill();
    circle(ctx, 140, 140, 2.5); ctx.fill();
    circle(ctx, 78, 160, 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 6;
  rr(ctx, 40, 50, 130, 140, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(105, 50); ctx.lineTo(105, 190);
  ctx.moveTo(40, 120); ctx.lineTo(170, 120);
  ctx.stroke();
  // Curtains.
  fill(ctx, '#bc4b8c');
  rr(ctx, 32, 44, 22, 150, 6); ctx.fill();
  rr(ctx, 156, 44, 22, 150, 6); ctx.fill();

  // Picture frame: mountains (original) or a sailboat (copy).
  rr(ctx, 230, 60, 90, 70, 4);
  fill(ctx, '#a8dadc');
  ctx.save();
  rr(ctx, 236, 66, 78, 58, 3);
  ctx.clip();
  if (v === 0) {
    tri(ctx, 236, 124, 262, 84, 288, 124); fill(ctx, '#457b9d');
    tri(ctx, 268, 124, 292, 92, 314, 124); fill(ctx, '#1d3557');
    circle(ctx, 300, 78, 8); fill(ctx, '#ffd93d');
  } else {
    fill(ctx, '#2a9d8f');
    ctx.fillRect(236, 104, 78, 20);
    tri(ctx, 275, 78, 275, 102, 292, 102); fill(ctx, '#ffffff');
    tri(ctx, 272, 84, 272, 102, 260, 102); fill(ctx, '#f4a261');
    rr(ctx, 258, 102, 36, 7, 3); fill(ctx, '#7a4a21');
    circle(ctx, 248, 76, 7); fill(ctx, '#ffd93d');
  }
  ctx.restore();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 5;
  rr(ctx, 230, 60, 90, 70, 4);
  ctx.stroke();

  // Wall clock; the hands show a different time in the copy.
  circle(ctx, 400, 95, 30);
  fill(ctx, '#ffffff');
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#3d405b';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 400 + Math.sin(a) * 22, 95 - Math.cos(a) * 22, 2);
    ctx.fill();
  }
  const hourA = v === 0 ? (3 / 12) * Math.PI * 2 : (7 / 12) * Math.PI * 2;
  const minA = v === 0 ? (0 / 60) * Math.PI * 2 : (35 / 60) * Math.PI * 2;
  ctx.strokeStyle = '#e4572e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(400, 95);
  ctx.lineTo(400 + Math.sin(hourA) * 14, 95 - Math.cos(hourA) * 14);
  ctx.stroke();
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(400, 95);
  ctx.lineTo(400 + Math.sin(minA) * 20, 95 - Math.cos(minA) * 20);
  ctx.stroke();
  circle(ctx, 400, 95, 3.5);
  fill(ctx, '#e4572e');

  // Bookshelf with two rows of books.
  fill(ctx, '#7a4a21');
  ctx.fillRect(448, 58, 100, 196);
  fill(ctx, '#96602f');
  ctx.fillRect(454, 64, 88, 184);
  const shelfRows = [132, 198];
  for (const sy of shelfRows) {
    fill(ctx, '#7a4a21');
    ctx.fillRect(454, sy, 88, 6);
  }
  const bookColors = ['#e4572e', '#2e86ab', '#f2a03d', '#7fb069', '#bc4b8c', '#3d405b', '#e4572e', '#f2a03d'];
  for (let row = 0; row < 3; row += 1) {
    const baseY = 132 + row * 66 - 6;
    for (let i = 0; i < 6; i += 1) {
      if (v === 1 && row === 1 && i === 4) continue; // diff: missing book (512, 182)
      let color = bookColors[(row * 3 + i) % bookColors.length];
      if (v === 1 && row === 0 && i === 2) color = '#7fb069'; // diff: book colour (475, 112)
      const bw = 11 + ((row + i) % 3) * 2;
      rr(ctx, 458 + i * 14, baseY - 42, bw, 42, 2);
      fill(ctx, color);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(458 + i * 14 + 2, baseY - 36, bw - 4, 3);
    }
  }

  // Rug; one stripe is missing in the copy.
  ellipse(ctx, 280, 428, 150, 34);
  fill(ctx, '#bc4b8c');
  ellipse(ctx, 280, 428, 118, 25);
  fill(ctx, '#f2a03d');
  if (v === 0) {
    ellipse(ctx, 280, 428, 84, 17);
    fill(ctx, '#2e86ab');
  }
  ellipse(ctx, 280, 428, 48, 10);
  fill(ctx, '#f3e3c8');

  // Sofa with cushions; the cat sits here in the original only.
  rr(ctx, 120, 268, 210, 66, 14);
  fill(ctx, '#2e86ab');
  rr(ctx, 108, 300, 234, 58, 14);
  fill(ctx, '#2e86ab');
  rr(ctx, 108, 296, 34, 70, 12);
  fill(ctx, '#256d8f');
  rr(ctx, 308, 296, 34, 70, 12);
  fill(ctx, '#256d8f');
  rr(ctx, 150, 300, 70, 44, 8);
  fill(ctx, '#3d9bc4');
  rr(ctx, 228, 300, 70, 44, 8);
  fill(ctx, v === 1 ? '#f2a03d' : '#3d9bc4'); // diff: cushion colour (288, 318)
  fill(ctx, '#5a3a1a');
  ctx.fillRect(126, 364, 12, 16);
  ctx.fillRect(312, 364, 12, 16);
  if (v === 0) {
    // Cat curled on the left cushion.
    ellipse(ctx, 212, 326, 30, 15);
    fill(ctx, '#f4a261');
    circle(ctx, 188, 312, 13);
    fill(ctx, '#f4a261');
    tri(ctx, 178, 304, 182, 292, 188, 302); fill(ctx, '#f4a261');
    tri(ctx, 192, 302, 198, 292, 200, 304); fill(ctx, '#f4a261');
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(238, 322, 12, -0.6, 1.6);
    ctx.stroke();
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(182, 312); ctx.lineTo(188, 312);
    ctx.moveTo(192, 312); ctx.lineTo(198, 312);
    ctx.stroke();
  }

  // Coffee table with a mug whose colour changes.
  fill(ctx, '#7a4a21');
  rr(ctx, 330, 356, 120, 12, 4); ctx.fill();
  ctx.fillRect(342, 368, 10, 30);
  ctx.fillRect(428, 368, 10, 30);
  rr(ctx, 366, 332, 24, 24, 4);
  fill(ctx, v === 1 ? '#7fb069' : '#e4572e'); // diff: mug colour (378, 342)
  ctx.strokeStyle = v === 1 ? '#7fb069' : '#e4572e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(394, 344, 7, -1.2, 1.2);
  ctx.stroke();
  rr(ctx, 404, 344, 34, 12, 2);
  fill(ctx, '#3d405b');

  // Plant with a flower that changes colour.
  fill(ctx, '#bc4b8c');
  tri(ctx, 42, 356, 96, 356, 88, 402);
  ctx.lineTo(50, 402);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2d6a4f';
  ctx.lineWidth = 5;
  for (const [lx, ly] of [[54, 300], [72, 286], [86, 306]]) {
    ctx.beginPath();
    ctx.moveTo(69, 356);
    ctx.quadraticCurveTo(69 + (lx - 69) * 0.4, 326, lx, ly);
    ctx.stroke();
    ellipse(ctx, lx, ly, 13, 7);
    fill(ctx, '#40916c');
  }
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, 72 + Math.cos(a) * 9, 288 + Math.sin(a) * 9, 7);
    fill(ctx, v === 1 ? '#ffd93d' : '#e4572e'); // diff: flower colour (72, 288)
  }
  circle(ctx, 72, 288, 5);
  fill(ctx, '#fff3b0');

  // Floor lamp; lit in the original, dark in the copy.
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(505, 400);
  ctx.lineTo(505, 276);
  ctx.stroke();
  ellipse(ctx, 505, 402, 24, 6);
  fill(ctx, '#3d405b');
  if (v === 0) {
    const glow = ctx.createRadialGradient(505, 252, 6, 505, 252, 58);
    glow.addColorStop(0, 'rgba(255,217,61,0.55)');
    glow.addColorStop(1, 'rgba(255,217,61,0)');
    circle(ctx, 505, 252, 58);
    ctx.fillStyle = glow;
    ctx.fill();
  }
  tri(ctx, 482, 276, 528, 276, 516, 228);
  ctx.lineTo(494, 228);
  ctx.closePath();
  fill(ctx, v === 0 ? '#ffd93d' : '#9aa5b1'); // diff: lamp on/off (505, 252)
}

/* ---------------------------------------------------------------- garden */

function drawGarden(ctx, v) {
  // Sky and grass.
  const sky = ctx.createLinearGradient(0, 0, 0, 270);
  sky.addColorStop(0, '#7ec8e3');
  sky.addColorStop(1, '#cdeffd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 270);
  fill(ctx, '#7fb069');
  ctx.fillRect(0, 270, PANEL_W, PANEL_H - 270);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 270, PANEL_W, 6);

  // Sun; the copy has one extra ray.
  ctx.strokeStyle = '#ffb703';
  ctx.lineWidth = 5;
  const rays = v === 0 ? 8 : 9;
  for (let i = 0; i < rays; i += 1) {
    const a = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(a) * 34, 70 + Math.sin(a) * 34);
    ctx.lineTo(80 + Math.cos(a) * 48, 70 + Math.sin(a) * 48);
    ctx.stroke();
  }
  circle(ctx, 80, 70, 28);
  fill(ctx, '#ffd93d');

  // Clouds; the middle one changes shape in the copy.
  function cloud(x, y, s) {
    ellipse(ctx, x, y, 34 * s, 14 * s); fill(ctx, '#ffffff');
    ellipse(ctx, x - 22 * s, y + 4 * s, 22 * s, 11 * s); fill(ctx, '#ffffff');
    ellipse(ctx, x + 24 * s, y + 4 * s, 24 * s, 12 * s); fill(ctx, '#ffffff');
  }
  cloud(170, 52, 0.8);
  if (v === 0) cloud(300, 68, 1);
  else { ellipse(ctx, 300, 68, 46, 12); fill(ctx, '#ffffff'); ellipse(ctx, 300, 60, 24, 12); fill(ctx, '#ffffff'); }
  cloud(470, 120, 0.7);

  // Kite, only in the original.
  if (v === 0) {
    tri(ctx, 402, 60, 432, 92, 402, 124);
    ctx.lineTo(372, 92);
    ctx.closePath();
    fill(ctx, '#e4572e');
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(372, 92); ctx.lineTo(432, 92);
    ctx.moveTo(402, 60); ctx.lineTo(402, 124);
    ctx.stroke();
    ctx.strokeStyle = '#3d405b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(402, 124);
    ctx.quadraticCurveTo(392, 152, 404, 180);
    ctx.stroke();
  }

  // Butterflies.
  function butterfly(x, y, color) {
    ellipse(ctx, x - 11, y - 3, 12, 8); fill(ctx, color);
    ellipse(ctx, x + 11, y - 3, 12, 8); fill(ctx, color);
    ellipse(ctx, x - 9, y + 6, 9, 6); fill(ctx, color);
    ellipse(ctx, x + 9, y + 6, 9, 6); fill(ctx, color);
    ellipse(ctx, x, y, 3.5, 10); fill(ctx, '#3d405b');
  }
  butterfly(202, 198, v === 1 ? '#bc4b8c' : '#f2a03d'); // diff: butterfly colour
  if (v === 1) butterfly(382, 150, '#2e86ab'); // diff: second butterfly appears

  // Fence with a bird on it (original only).
  fill(ctx, '#c89b6a');
  for (let x = 6; x < PANEL_W; x += 42) {
    rr(ctx, x, 248, 26, 46, 3);
    ctx.fill();
  }
  ctx.fillStyle = '#b9834f';
  ctx.fillRect(0, 262, PANEL_W, 8);
  if (v === 0) {
    ellipse(ctx, 150, 240, 13, 9);
    fill(ctx, '#2e86ab');
    circle(ctx, 160, 232, 7);
    fill(ctx, '#2e86ab');
    tri(ctx, 166, 232, 174, 235, 166, 237);
    fill(ctx, '#f2a03d');
    circle(ctx, 161, 231, 1.8);
    fill(ctx, '#101623');
  }

  // Tree with apples; one falls in the copy.
  fill(ctx, '#7a4a21');
  rr(ctx, 472, 210, 24, 110, 6);
  ctx.fill();
  circle(ctx, 485, 165, 52); fill(ctx, '#40916c');
  circle(ctx, 448, 192, 34); fill(ctx, '#40916c');
  circle(ctx, 522, 192, 34); fill(ctx, '#40916c');
  const apples = [[462, 148], [500, 138], [486, 182], [452, 200], [516, 206]];
  apples.forEach(([ax, ay], i) => {
    if (v === 1 && i === 2) return; // diff: apple fell (472, 158 area)
    circle(ctx, ax, ay, 7);
    fill(ctx, '#e4572e');
  });
  if (v === 1) { circle(ctx, 486, 312, 7); fill(ctx, '#e4572e'); }

  // Picnic blanket; one stripe is missing in the copy.
  rr(ctx, 180, 350, 220, 100, 8);
  fill(ctx, '#e4572e');
  ctx.save();
  rr(ctx, 180, 350, 220, 100, 8);
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i += 1) {
    if (v === 1 && i === 2) continue; // diff: blanket stripe (290, 408)
    ctx.fillRect(180, 362 + i * 24, 220, 10);
  }
  ctx.restore();

  // Basket; the lid is open in the copy.
  rr(ctx, 222, 372, 60, 36, 5);
  fill(ctx, '#c89b6a');
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(222, 384); ctx.lineTo(282, 384);
  ctx.moveTo(222, 396); ctx.lineTo(282, 396);
  ctx.stroke();
  if (v === 0) {
    rr(ctx, 220, 360, 64, 14, 6);
    fill(ctx, '#a9713a');
  } else {
    ctx.save();
    ctx.translate(224, 372);
    ctx.rotate(-0.7);
    rr(ctx, 0, -12, 60, 13, 6);
    fill(ctx, '#a9713a');
    ctx.restore();
    circle(ctx, 246, 368, 8); fill(ctx, '#ffd93d');
    circle(ctx, 262, 366, 8); fill(ctx, '#f4a261');
  }
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(252, 362, 20, Math.PI, 0);
  ctx.stroke();

  // Plate with apples; one is eaten in the copy.
  ellipse(ctx, 342, 398, 34, 12);
  fill(ctx, '#ffffff');
  circle(ctx, 330, 388, 9); fill(ctx, '#e4572e');
  circle(ctx, 348, 386, 9); fill(ctx, '#e4572e');
  if (v === 0) { circle(ctx, 339, 380, 9); fill(ctx, '#e4572e'); }

  // Drinks jug and cups (same in both).
  rr(ctx, 306, 362, 18, 26, 4);
  fill(ctx, '#2e86ab');
  rr(ctx, 368, 378, 14, 12, 3);
  fill(ctx, '#bc4b8c');

  // Flowers along the bottom; one changes colour, one vanishes.
  const flowerSpots = [[40, 432], [90, 418], [140, 436], [440, 420], [498, 428], [530, 442]];
  flowerSpots.forEach(([fx, fy], i) => {
    if (v === 1 && i === 4) return; // diff: missing flower (498, 428)
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 18);
    ctx.lineTo(fx, fy + 4);
    ctx.stroke();
    const petal = v === 1 && i === 1 ? '#ffd93d' : '#bc4b8c'; // diff: flower colour (90, 418)
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 5.5);
      fill(ctx, petal);
    }
    circle(ctx, fx, fy, 4);
    fill(ctx, '#fff3b0');
  });

  // Grass tufts (same in both).
  ctx.strokeStyle = '#40916c';
  ctx.lineWidth = 3;
  for (const gx of [30, 120, 220, 420, 520]) {
    ctx.beginPath();
    ctx.moveTo(gx, 330); ctx.lineTo(gx - 5, 316);
    ctx.moveTo(gx + 6, 330); ctx.lineTo(gx + 8, 314);
    ctx.stroke();
  }
}

/* ---------------------------------------------------------------- harbor */

function drawHarbor(ctx, v) {
  // Dusk sky and water.
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#2b2d5c');
  sky.addColorStop(0.6, '#7b4b94');
  sky.addColorStop(1, '#e76f51');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 280);
  const sea = ctx.createLinearGradient(0, 280, 0, PANEL_H);
  sea.addColorStop(0, '#264653');
  sea.addColorStop(1, '#1d3557');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 280, PANEL_W, PANEL_H - 280);

  // Stars; one goes out in the copy.
  const stars = [[40, 40], [150, 30], [210, 66], [300, 58], [360, 34], [420, 70], [520, 44], [250, 100], [130, 120], [390, 110]];
  stars.forEach(([sx, sy], i) => {
    if (v === 1 && i === 3) return; // diff: star out (300, 58)
    circle(ctx, sx, sy, 2.2);
    fill(ctx, '#ffffff');
  });

  // Moon; the crescent flips in the copy.
  circle(ctx, 90, 80, 24);
  fill(ctx, '#f1fa8c');
  circle(ctx, v === 0 ? 102 : 78, 72, 20);
  fill(ctx, '#3a3568');

  // Gulls; one flies off in the copy.
  function gull(x, y) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 9, y, 9, Math.PI * 1.15, Math.PI * 1.9);
    ctx.arc(x + 9, y, 9, Math.PI * 1.1, Math.PI * 1.85);
    ctx.stroke();
  }
  gull(180, 90);
  if (v === 0) gull(250, 118); // diff: gull gone
  gull(330, 96);

  // Lighthouse on the right; lamp lit in the original, dark in the copy.
  fill(ctx, '#5a3a1a');
  tri(ctx, 440, 330, 545, 330, 520, 292);
  ctx.lineTo(465, 292);
  ctx.closePath();
  ctx.fill();
  // Tower with stripes.
  ctx.save();
  tri(ctx, 468, 300, 516, 300, 506, 158);
  ctx.lineTo(478, 158);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(462, 150, 60, 155);
  ctx.fillStyle = '#e4572e';
  ctx.fillRect(462, 186, 60, 26);
  ctx.fillRect(462, 240, 60, 26);
  ctx.restore();
  // Window on the tower; lit only in the copy.
  rr(ctx, 484, 214, 12, 16, 3);
  fill(ctx, v === 1 ? '#ffd93d' : '#3d405b'); // diff: window lit (490, 222)
  // Lamp room.
  rr(ctx, 476, 128, 32, 30, 4);
  fill(ctx, '#3d405b');
  if (v === 0) {
    const beam = ctx.createRadialGradient(492, 143, 4, 492, 143, 60);
    beam.addColorStop(0, 'rgba(255,217,61,0.7)');
    beam.addColorStop(1, 'rgba(255,217,61,0)');
    circle(ctx, 492, 143, 60);
    ctx.fillStyle = beam;
    ctx.fill();
    tri(ctx, 492, 143, 330, 110, 330, 180);
    ctx.fillStyle = 'rgba(255,217,61,0.18)';
    ctx.fill();
    rr(ctx, 482, 134, 20, 18, 3);
    fill(ctx, '#ffd93d');
  } else {
    rr(ctx, 482, 134, 20, 18, 3);
    fill(ctx, '#9aa5b1');
  }
  tri(ctx, 470, 128, 514, 128, 492, 104);
  fill(ctx, '#e4572e');

  // Big boat; sail and flag colours change in the copy.
  ctx.strokeStyle = '#f3e3c8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(148, 336);
  ctx.lineTo(148, 262);
  ctx.stroke();
  tri(ctx, 152, 268, 152, 326, 196, 326);
  fill(ctx, v === 1 ? '#2a9d8f' : '#f4a261'); // diff: sail colour (148, 322)
  tri(ctx, 144, 278, 144, 326, 112, 326);
  fill(ctx, '#f3e3c8');
  tri(ctx, 148, 262, 168, 270, 148, 278);
  fill(ctx, v === 1 ? '#ffd93d' : '#e4572e'); // diff: flag colour (148, 284)
  tri(ctx, 96, 336, 204, 336, 186, 362);
  ctx.lineTo(114, 362);
  ctx.closePath();
  fill(ctx, '#7a4a21');
  fill(ctx, '#5a3a1a');
  ctx.fillRect(96, 336, 108, 6);

  // Little boat, only in the original.
  if (v === 0) {
    tri(ctx, 352, 356, 352, 322, 376, 356);
    fill(ctx, '#ffffff');
    tri(ctx, 326, 356, 384, 356, 372, 374);
    ctx.lineTo(338, 374);
    ctx.closePath();
    fill(ctx, '#bc4b8c');
  }

  // Waves (same in both).
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [wx, wy] of [[60, 320], [230, 350], [420, 330], [180, 386], [470, 380]]) {
    ctx.beginPath();
    ctx.arc(wx, wy, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Moonlight on the water; it shifts in the copy.
  ctx.fillStyle = 'rgba(241,250,140,0.5)';
  const mx = v === 0 ? 90 : 118; // diff: moonlight moved (90, 382)
  for (let i = 0; i < 4; i += 1) {
    rr(ctx, mx - 18 + (i % 2) * 8, 292 + i * 22, 36 - i * 4, 5, 2);
    ctx.fill();
  }

  // Buoy; its colour changes in the copy.
  tri(ctx, 302, 386, 318, 410, 286, 410);
  fill(ctx, v === 1 ? '#ffd93d' : '#e4572e'); // diff: buoy colour (302, 398)
  circle(ctx, 302, 382, 5);
  fill(ctx, '#ffffff');

  // Pier along the bottom.
  fill(ctx, '#7a4a21');
  ctx.fillRect(0, 424, PANEL_W, 14);
  ctx.fillStyle = '#5a3a1a';
  for (let x = 0; x < PANEL_W; x += 46) ctx.fillRect(x, 424, 3, 14);
  for (const px of [40, 180, 320, 460]) ctx.fillRect(px, 438, 14, 32);

  // Crates on the pier; one vanishes in the copy.
  rr(ctx, 56, 392, 34, 32, 3); fill(ctx, '#c89b6a');
  rr(ctx, 92, 392, 34, 32, 3); fill(ctx, '#b9834f');
  if (v === 0) { rr(ctx, 74, 362, 34, 30, 3); fill(ctx, '#c89b6a'); } // diff: crate (82, 388)
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 392, 34, 32);
  ctx.strokeRect(92, 392, 34, 32);

  // Rope coil, only in the original.
  if (v === 0) {
    ctx.strokeStyle = '#d9c7a7';
    ctx.lineWidth = 5;
    circle(ctx, 478, 414, 13); ctx.stroke();
    circle(ctx, 478, 414, 7); ctx.stroke();
  }

  // Lantern post on the pier (same in both).
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(210, 424);
  ctx.lineTo(210, 384);
  ctx.stroke();
  rr(ctx, 200, 368, 20, 18, 3);
  fill(ctx, '#ffd93d');
}

/** Paint one scene variant onto a 2D context sized PANEL_W x PANEL_H. */
export function drawScene(ctx, levelId, variant) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  if (levelId === 'room') drawRoom(ctx, variant);
  else if (levelId === 'garden') drawGarden(ctx, variant);
  else drawHarbor(ctx, variant);
}

/** Render both variants of a level to offscreen canvases, once per level. */
export function renderPanels(levelId) {
  const panels = [];
  for (const variant of [0, 1]) {
    const canvas = document.createElement('canvas');
    canvas.width = PANEL_W;
    canvas.height = PANEL_H;
    drawScene(canvas.getContext('2d'), levelId, variant);
    panels.push(canvas);
  }
  return panels;
}
