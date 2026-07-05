'use strict';
// The World holds ALL simulation state and advances it. It is an engine entity (has
// update) but draws nothing — rendering is the Observer's job. This is what lets the exact
// same file run headlessly via vm with no canvas.
//
// It fuses the three managers of the old build into one owner of state (conventions: "state
// has one owner"):
//   - a POPULATION of bands (each band = an array of genomes) — the unit of group selection
//   - the CURRENT MATCH: two bands instantiated as living Warriors that fight to a finish
//   - a GENERATION loop: every band fights once, is scored, and the elite reproduce
//
// Control experiment: bands start from random genomes. If fighting strategies (charge to
// contact, hold formation, rout the enemy) are selectable, mean fitness should climb.
var World = class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.dt = PARAMETERS.dt;

    this.generation = 0;
    this.history = [];          // one entry per completed generation (the plotted/saved metric)
    this.lastMatch = null;      // casualty tally of the most recent match (smoketest invariant)

    // seed the founding population: numBands bands of random genomes
    this.bands = [];
    for (let b = 0; b < PARAMETERS.numBands; b++) this.bands.push(this.makeRandomBand());

    this.warriors = [];
    this.combats = [];
    this.startGeneration();
  }

  // a band is an array of genomes. A founder genome seeds a mutational lineage so band
  // members are related-but-varied (as in the old createBand chain), not identical clones.
  makeRandomBand() {
    const band = [randomGenome()];
    for (let i = 1; i < PARAMETERS.bandSize; i++) band.push(mutatedClone(band[i - 1]));
    return band;
  }

  // offspring band: a mutated copy of every genome in the parent — keeps the band's genetic
  // profile while injecting variation (asexual group reproduction)
  reproduceBand(band) { return band.map((genome) => mutatedClone(genome)); }

  // ---- generation scheduling -------------------------------------------------------------
  startGeneration() {
    // random pairing: every band fights exactly once (odd band out gets a bye = 0 fitness)
    const order = shuffleArray(this.bands.map((_, i) => i));
    this.pairings = [];
    for (let i = 0; i + 1 < order.length; i += 2) this.pairings.push([order[i], order[i + 1]]);
    this.pairIndex = 0;
    this.fitness = new Array(this.bands.length).fill(0);
    this.survivorsArr = new Array(this.bands.length).fill(0);
    this.wins = new Array(this.bands.length).fill(0);
    this.startMatch(this.pairings[this.pairIndex]);
  }

  startMatch(pair) {
    this.activeA = pair[0];
    this.activeB = pair[1];
    this.matchTick = 0;
    this.warriors = [];
    this.combats = [];
    this.tally = {
      A: { alive: PARAMETERS.bandSize, dead: 0, fled: 0 },
      B: { alive: PARAMETERS.bandSize, dead: 0, fled: 0 },
    };
    for (const genome of this.bands[this.activeA]) this.spawn(genome, true);
    for (const genome of this.bands[this.activeB]) this.spawn(genome, false);
  }

  spawn(genome, team) {
    const w = new Warrior(genome);
    w.reset(team);
    this.warriors.push(w);
  }

  // ---- per-tick advance ------------------------------------------------------------------
  update(engine) {
    this.matchTick++;
    this.combats = [];

    for (const w of this.warriors) w.step(this);
    this.resolveCombats();

    // reap the fallen and the routed, keeping the team tallies exact
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

    if (this.matchOver()) this.endMatch();
  }

  // each contact pair: a coin-flip decides who takes the blow (as in the old CombatManager)
  resolveCombats() {
    shuffleArray(this.combats);
    for (const [a, b] of this.combats) {
      if (!a.removeFromWorld && !b.removeFromWorld) (randomInt(2) ? b : a).hit();
    }
  }

  matchOver() {
    return this.tally.A.alive <= 0 || this.tally.B.alive <= 0 ||
           this.matchTick >= PARAMETERS.matchTickCap;
  }

  // ---- match / generation resolution -----------------------------------------------------
  endMatch() {
    const A = this.tally.A, B = this.tally.B;
    this.lastMatch = { a: this.activeA, b: this.activeB, A: Object.assign({}, A), B: Object.assign({}, B) };

    // fitness = survivors, plus a decisive bonus for wiping the enemy (a win)
    this.fitness[this.activeA] = A.alive + (B.alive <= 0 && A.alive > 0 ? PARAMETERS.winBonus : 0);
    this.fitness[this.activeB] = B.alive + (A.alive <= 0 && B.alive > 0 ? PARAMETERS.winBonus : 0);
    this.survivorsArr[this.activeA] = A.alive;
    this.survivorsArr[this.activeB] = B.alive;
    if (A.alive > B.alive) this.wins[this.activeA] = 1;
    else if (B.alive > A.alive) this.wins[this.activeB] = 1;

    this.pairIndex++;
    if (this.pairIndex < this.pairings.length) this.startMatch(this.pairings[this.pairIndex]);
    else this.evolve();
  }

  // group selection: rank bands by fitness, let the elite fraction seed the next generation
  evolve() {
    const ranked = this.bands.map((_, i) => i).sort((p, q) => this.fitness[q] - this.fitness[p]);
    const eliteCount = Math.max(1, Math.floor(this.bands.length * PARAMETERS.eliteFraction));
    const elite = ranked.slice(0, eliteCount);

    const next = [];
    let k = 0;
    while (next.length < this.bands.length) {
      next.push(this.reproduceBand(this.bands[elite[k % elite.length]]));
      k++;
    }

    const best = this.fitness[ranked[0]];
    const mean = this.fitness.reduce((s, f) => s + f, 0) / this.fitness.length;
    const meanSurvivors = this.survivorsArr.reduce((s, v) => s + v, 0) / this.survivorsArr.length;
    this.history.push({
      generation: this.generation,
      bestFitness: best,
      meanFitness: mean,
      meanSurvivors: meanSurvivors,
      wins: this.wins.reduce((s, w) => s + w, 0),
    });

    this.bands = next;
    this.generation++;
    this.startGeneration();
  }

  // ---- read-only views (Observer + DataManager) ------------------------------------------
  fleeingCount(team) {
    let n = 0;
    for (const w of this.warriors) if (w.team === team && w.fleeing) n++;
    return n;
  }

  latest() { return this.history.length ? this.history[this.history.length - 1] : null; }
};
