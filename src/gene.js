'use strict';
// A real-valued gene in [0,1]. Mutation is a small bounded random walk. crossover/blend are
// available for sexual reproduction (not used yet — bands currently reproduce asexually as
// mutated clones). Declared `var X = class X` so it lives in the browser + headless vm.
var RealGene = class RealGene {
  constructor(gene) { this.value = gene ? gene.value : Math.random(); }

  clamp() { this.value = this.value > 1 ? 1 : (this.value < 0 ? 0 : this.value); }

  mutate() {
    const range = 0.08;
    this.value += Math.random() * range - range / 2;
    this.clamp();
  }

  crossover(other) { if (randomBit()) this.value = other.value; }
  blend(other) { this.value = (this.value + other.value) / 2; }
};

// A genome is a plain array of RealGene. These helpers keep band-building in one place.
// GENOME LAYOUT (control experiment — 12 genes):
//   0 cohesionRadius   1 alignmentRadius  2 separationRadius  3 chargeRadius  4 fleeRadius
//   5 cohesionWeight   6 alignmentWeight  7 separationWeight  8 chargeWeight  9 fleeWeight
//   10 aggression      (P(stand & fight) on being hit; 1 = never routs, 0 = flees on any hit)
//   11 bloodlustWeight (pull toward the battlefield centre of mass — keeps the melee engaged
//                       WITHOUT bounding the arena, so retreat stays a real option)
var GENOME_LENGTH = 12;

// short labels for the 12 genes (for histograms / readouts), in genome order
var GENE_NAMES = [
  'cohR', 'alnR', 'sepR', 'chgR', 'fleeR',
  'cohW', 'alnW', 'sepW', 'chgW', 'fleeW',
  'aggr', 'blood',
];

function randomGenome() {
  const g = [];
  for (let i = 0; i < GENOME_LENGTH; i++) g.push(new RealGene());
  return g;
}

// deep copy + mutate every gene — the atom of reproduction
function mutatedClone(genome) {
  return genome.map((gene) => {
    const c = new RealGene(gene);
    c.mutate();
    return c;
  });
}
