'use strict';
// Pure helpers — no DOM, no globals beyond these. Safe to load in the browser AND in the
// headless vm context (declared as `var`/`function` so they attach to either global).
var TAU = Math.PI * 2;

// --- randomness ---
function randomInt(n) { return Math.floor(Math.random() * n); }
function randomBit() { return randomInt(2); }
function randomSign() { return randomInt(2) ? 1 : -1; }

// Box–Muller normal sample
function normalSample(mean, sd) {
  mean = mean || 0; sd = (sd == null) ? 1 : sd;
  const u = 1 - Math.random(), v = Math.random();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

// --- arrays ---
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- scalars ---
function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

// --- 2D vectors (plain {x,y}) ---
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function length(a) { return Math.hypot(a.x, a.y); }
function normalize(a) {
  const m = length(a);
  if (m !== 0) { a.x /= m; a.y /= m; }
}
function limit(a, max) {
  const m = length(a);
  if (m > max) { a.x *= max / m; a.y *= max / m; }
}

// --- color ---
function rgb(r, g, b) { return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; }
function hsl(h, s, l) { return 'hsl(' + (h | 0) + ',' + (s | 0) + '%,' + (l | 0) + '%)'; }
