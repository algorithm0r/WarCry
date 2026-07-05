'use strict';
// Single source of truth for every tunable. Serialized verbatim into every saved data
// packet (see datamanager.js) so any run reconstructs from its stored parameters.
// Declared `var` so it's a global in the browser AND in the headless vm context.
var PARAMETERS = {
  // --- arena ---
  worldWidth: 800,       // combat arena width  (px); HUD is drawn to the right of this
  worldHeight: 600,      // combat arena height (px)
  dt: 0.09,              // fixed timestep — identical in browser and headless (reproducible)

  // --- population (GROUP SELECTION: the band is the unit of selection) ---
  numBands: 20,          // bands per generation (population size)
  bandSize: 30,          // warriors per band (both teams are one band each)

  // --- warrior ---
  radius: 5,             // body radius (px) — also the collision/contact distance
  health: 10,            // hits absorbed before death
  maxSpeed: 65,          // px/sec cap on velocity
  maxForce: 6,           // px/sec^2 cap on steering acceleration
  aggression: 0.5,       // on being hit: P(stand & fight); else switch to fleeing
  radiusScale: 200,      // genes[0..4] * this  -> perception radii (px)
  weightScale: 10,       // genes[5..9] * this  -> steering weights

  // --- combat / evolution ---
  matchTickCap: 1200,    // a match is called a draw if it runs this long (pacifist stalemate)
  eliteFraction: 0.5,    // top fraction of bands (by fitness) that seed the next generation
  winBonus: 100,         // fitness added for wiping the enemy band (dominates survivor count)

  // --- engine ---
  updatesPerDraw: 4,     // fast-forward: sim updates per rendered frame

  // --- data collection (sampled PER GENERATION, not per tick) ---
  epoch: 200,            // a headless run ends (ships a packet) after this many generations

  // --- database (the standard vendored client, src/db.js) ---
  db: {
    transport: 'socket',
    server: 'https://research.climbinggiants.com:8888',
    mongoUrl: 'mongodb://127.0.0.1:27017',
    db: 'warcry',
    run: 'run',
  },
};

// Schema drives the auto-generated control panel (ui.js). One entry per live-tunable.
// `resets: true` rebuilds the world on change (structural params can't be changed live).
var PARAM_SCHEMA = [
  { key: 'numBands', label: 'Bands', min: 2, max: 80, step: 2, resets: true },
  { key: 'bandSize', label: 'Band size', min: 5, max: 120, step: 5, resets: true },
  { key: 'maxSpeed', label: 'Max speed', min: 10, max: 150, step: 5 },
  { key: 'aggression', label: 'Aggression', min: 0, max: 1, step: 0.05 },
  { key: 'updatesPerDraw', label: 'Speed', min: 1, max: 400, step: 1 },
];
