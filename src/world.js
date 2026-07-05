'use strict';
// The World holds ALL simulation state and advances it. It is an engine entity (has update)
// but draws nothing — rendering is the Observer's job. This is what lets the exact same file
// run headlessly via vm with no canvas.
//
// It owns:
//   - a POPULATION of bands (each band = an array of genomes) — the unit of group selection
//   - a GENERATION of Matches run CONCURRENTLY (every band fights one head-to-head contest at
//     the same time; each Match is isolated so warriors only fight their own opponent)
//   - the tournament: when all matches finish, each LOSER band dies and each WINNER band
//     survives intact + spawns a mutated offspring into the vacated slot.
var World = class World {
  constructor(width, height) {
    this.width = width;         // display region (Observer tiles the matches into this)
    this.height = height;

    this.generation = 0;
    this.history = [];          // one entry per completed generation (the plotted/saved metric)
    this.lastMatch = null;      // a representative match result (smoketest invariant + HUD)

    this.bands = [];
    for (let b = 0; b < PARAMETERS.numBands; b++) this.bands.push(this.makeRandomBand());

    this.startGeneration();
  }

  // a band is an array of genomes. A founder genome seeds a mutational lineage so band
  // members are related-but-varied (as in the old createBand chain), not identical clones.
  makeRandomBand() {
    const band = [randomGenome()];
    for (let i = 1; i < PARAMETERS.bandSize; i++) band.push(mutatedClone(band[i - 1]));
    return band;
  }

  // offspring band: a mutated copy of every genome in the parent
  reproduceBand(band) { return band.map((genome) => mutatedClone(genome)); }

  // ---- generation scheduling -------------------------------------------------------------
  startGeneration() {
    // random pairing; each pair becomes a Match that runs concurrently this generation.
    // numBands is even by schema, so no byes in practice.
    const order = shuffleArray(this.bands.map((_, i) => i));
    this.matches = [];
    for (let i = 0; i + 1 < order.length; i += 2) {
      this.matches.push(new Match(this.bands[order[i]], this.bands[order[i + 1]], order[i], order[i + 1]));
    }
  }

  // ---- per-tick advance: step every unfinished match; evolve when all are done ------------
  update(engine) {
    let allDone = true;
    for (const m of this.matches) {
      m.update();
      if (!m.done) allDone = false;
    }
    if (allDone) this.evolve();
  }

  // group selection, head-to-head: for every match the LOSER band dies and the WINNER band
  // both survives (carried over intact) and reproduces a mutated offspring into the vacated
  // slot. Population size is conserved; only winning lineages persist.
  evolve() {
    const next = [];
    const dmgs = [], survs = [];
    let deaths = 0;
    for (const m of this.matches) {
      const r = m.result;
      const winnerBand = this.bands[r.winner];
      next.push(winnerBand);                       // winner lives on (elitism)
      next.push(this.reproduceBand(winnerBand));   // + offspring fills the dead loser's slot
      dmgs.push(r.dmgA, r.dmgB);
      survs.push(r.A.alive, r.B.alive);
      deaths += r.deaths;
    }
    // safety for an odd population (schema keeps numBands even, so normally a no-op)
    while (next.length < this.bands.length) next.push(this.reproduceBand(next[randomInt(next.length)]));
    next.length = this.bands.length;

    this.lastMatch = this.matches[0].result;
    const best = Math.max.apply(null, dmgs);
    const meanDamage = dmgs.reduce((s, v) => s + v, 0) / dmgs.length;
    const meanSurvivors = survs.reduce((s, v) => s + v, 0) / survs.length;
    this.history.push({
      generation: this.generation,
      bestFitness: best,                    // best single-band damage this generation
      meanFitness: meanDamage,              // mean damage inflicted (the plotted metric)
      meanSurvivors: meanSurvivors,
      meanKills: deaths / Math.max(1, this.matches.length),  // avg deaths per match
      meanAggression: this.meanGene(10),    // watch fight-vs-flee evolve
      meanChargeWeight: this.meanGene(8),    // ...and the will to close to contact
      meanBloodlust: this.meanGene(11),      // ...and the pull into the melee
      wins: this.matches.length,             // one winner per match
      geneHists: this.geneHistograms(),      // full per-gene distributions this generation
    });

    this.bands = next;
    this.generation++;
    this.startGeneration();
  }

  // ---- read-only views (Observer + DataManager) ------------------------------------------
  // mean value of gene `index` across every warrior genome in the current population
  meanGene(index) {
    let sum = 0, n = 0;
    for (const band of this.bands) for (const genome of band) { sum += genome[index].value; n++; }
    return n ? sum / n : 0;
  }

  // per-gene value distribution across the whole population: returns GENOME_LENGTH rows, each
  // a `histBins`-length array of fractions summing to 1. Recorded each generation so we can
  // watch selection sculpt each gene's distribution over time (saved to DB + drawn in-browser).
  geneHistograms() {
    const bins = PARAMETERS.histBins;
    const hists = [];
    for (let g = 0; g < GENOME_LENGTH; g++) {
      const row = new Array(bins).fill(0);
      let n = 0;
      for (const band of this.bands) for (const genome of band) {
        let b = Math.floor(genome[g].value * bins);
        if (b >= bins) b = bins - 1; else if (b < 0) b = 0;
        row[b]++; n++;
      }
      if (n) for (let b = 0; b < bins; b++) row[b] /= n;
      hists.push(row);
    }
    return hists;
  }

  latest() { return this.history.length ? this.history[this.history.length - 1] : null; }
};
