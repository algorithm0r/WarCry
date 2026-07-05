'use strict';
// One head-to-head contest between two bands, fully self-contained: its own warriors, combat
// queue, centre of mass, and casualty tally, all in its own copy of the sim arena. Because
// each Match is isolated, the World can run all of a generation's matches at once (warriors
// only ever see opponents within their own Match). Declared `var X = class X` for the vm.
var Match = class Match {
  constructor(bandA, bandB, aIndex, bIndex) {
    this.aIndex = aIndex;
    this.bIndex = bIndex;
    this.width = PARAMETERS.worldWidth;
    this.height = PARAMETERS.worldHeight;
    this.tick = 0;
    this.done = false;
    this.result = null;
    this.warriors = [];
    this.combats = [];
    this.tally = {
      A: { alive: bandA.length, dead: 0, fled: 0 },
      B: { alive: bandB.length, dead: 0, fled: 0 },
    };
    for (const genome of bandA) this.spawn(genome, true);
    for (const genome of bandB) this.spawn(genome, false);
    this.computeCenterOfMass();
  }

  spawn(genome, team) {
    const w = new Warrior(genome);
    w.reset(team, this.width, this.height);
    this.warriors.push(w);
  }

  // centroid of all living warriors — the "battlefield centre of mass" bloodlust pulls toward
  computeCenterOfMass() {
    let sx = 0, sy = 0;
    const n = this.warriors.length;
    for (const w of this.warriors) { sx += w.x; sy += w.y; }
    this.centerOfMass = n ? { x: sx / n, y: sy / n } : { x: this.width / 2, y: this.height / 2 };
  }

  // advance one tick (no-op once finished, so the World can tick all matches uniformly)
  update() {
    if (this.done) return;
    this.tick++;
    this.combats = [];
    this.computeCenterOfMass();

    for (const w of this.warriors) w.step(this);
    this.resolveCombats();

    const survivors = [];
    for (const w of this.warriors) {
      if (w.removeFromWorld) {
        const t = w.team ? this.tally.A : this.tally.B;
        if (w.dead) { t.dead++; t.alive--; }
        else if (w.fled) { t.fled++; t.alive--; }
      } else {
        survivors.push(w);
      }
    }
    this.warriors = survivors;

    if (this.tally.A.alive <= 0 || this.tally.B.alive <= 0 || this.tick >= PARAMETERS.matchTickCap) {
      this.finish();
    }
  }

  // each contact pair: a coin-flip decides who takes the blow
  resolveCombats() {
    shuffleArray(this.combats);
    for (const [a, b] of this.combats) {
      if (!a.removeFromWorld && !b.removeFromWorld) (randomInt(2) ? b : a).hit();
    }
  }

  // decide the winner by damage inflicted (kills weighted above routs) and freeze the result
  finish() {
    const A = this.tally.A, B = this.tally.B;
    const kW = PARAMETERS.killWeight, rW = PARAMETERS.routWeight;
    const dmgA = B.dead * kW + B.fled * rW;   // damage A did to B
    const dmgB = A.dead * kW + A.fled * rW;   // damage B did to A
    const aWins = dmgA > dmgB || (dmgA === dmgB && randomInt(2) === 0);  // coin-flip a true draw
    this.result = {
      aIndex: this.aIndex, bIndex: this.bIndex,
      winner: aWins ? this.aIndex : this.bIndex,
      dmgA: dmgA, dmgB: dmgB,
      deaths: A.dead + B.dead,
      A: Object.assign({}, A), B: Object.assign({}, B),
    };
    this.done = true;
  }

  fleeingCount(team) {
    let n = 0;
    for (const w of this.warriors) if (w.team === team && w.fleeing) n++;
    return n;
  }
};
