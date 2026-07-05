'use strict';
// One combatant. Holds state + genome and advances itself within the World; it does NOT
// draw itself and touches zero DOM — the Observer renders it and the World owns all shared
// state (matches, combats, tallies). That split is what lets the sim run headless via vm.
//
// Behaviour is pure boids + attraction/repulsion, every coefficient a gene (see gene.js):
//   toward ALLIES  -> cohesion, alignment, separation   (hold formation)
//   toward ENEMIES -> charge (attract) when fighting, flee (repel) when routed
var Warrior = class Warrior {
  constructor(genome) {
    this.genome = genome;                 // array of RealGene (owned by this warrior)
    this.radius = PARAMETERS.radius;
    this.maxSpeed = PARAMETERS.maxSpeed;
    this.maxForce = PARAMETERS.maxForce;
    this.deriveTraits();
  }

  // decode the genome into perception radii + steering weights (genes don't change in life)
  deriveTraits() {
    const g = this.genome, R = PARAMETERS.radiusScale, W = PARAMETERS.weightScale;
    this.cohesionRadius   = g[0].value * R;
    this.alignmentRadius  = g[1].value * R;
    this.separationRadius = g[2].value * R;
    this.chargeRadius     = g[3].value * R;
    this.fleeRadius       = g[4].value * R;
    this.cohesionWeight   = g[5].value * W;
    this.alignmentWeight  = g[6].value * W;
    this.separationWeight = g[7].value * W;
    this.chargeWeight     = g[8].value * W;
    this.fleeWeight       = g[9].value * W;
  }

  // place this warrior on its team's start edge, facing the enemy — called each match
  reset(team) {
    this.team = team;                     // true = A (left, red), false = B (right, blue)
    this.health = PARAMETERS.health;
    this.target = null;
    this.fleeing = false;
    this.dead = false;
    this.fled = false;
    this.removeFromWorld = false;
    const W = PARAMETERS.worldWidth, H = PARAMETERS.worldHeight;
    const margin = Math.random() * W / 16;
    this.x = team ? margin : W - margin;
    this.y = Math.random() * H;
    this.velocity = {                     // an initial nudge toward the enemy line
      x: (team ? 1 : -1) * Math.random() * this.maxSpeed,
      y: Math.random() * this.maxSpeed / 2 * randomSign(),
    };
    limit(this.velocity, this.maxSpeed);
  }

  // take a blow. Death removes us; surviving a blow may rout us (flee) per aggression.
  hit() {
    this.health--;
    if (this.health <= 0) {
      this.dead = true;
      this.removeFromWorld = true;
      return;
    }
    if (!this.fleeing && Math.random() > PARAMETERS.aggression) this.fleeing = true;
  }

  outOfBounds() {
    return this.x < 0 || this.x > PARAMETERS.worldWidth ||
           this.y < 0 || this.y > PARAMETERS.worldHeight;
  }

  // advance one tick inside `world`. Reads world.warriors for neighbours; pushes contacts
  // into world.combats (deduped: only team-A members enqueue a pair) for the world to resolve.
  step(world) {
    const cohesion = { x: 0, y: 0 }, alignment = { x: 0, y: 0 };
    const separation = { x: 0, y: 0 }, charge = { x: 0, y: 0 };
    let cohesionCount = 0, alignmentCount = 0;
    this.target = null;

    const ws = world.warriors;
    for (let i = 0; i < ws.length; i++) {
      const ent = ws[i];
      if (ent === this) continue;
      const dist = distance(this, ent);

      if (dist < this.radius + ent.radius && ent.team !== this.team && this.team) {
        world.combats.push([this, ent]);   // contact -> a fight, resolved by the world
      }

      if (ent.team === this.team) {
        if (dist < this.cohesionRadius) { cohesionCount++; cohesion.x += ent.x; cohesion.y += ent.y; }
        if (dist < this.alignmentRadius) { alignmentCount++; alignment.x += ent.velocity.x; alignment.y += ent.velocity.y; }
        if (dist < this.separationRadius && dist > 0) {
          separation.x += (this.x - ent.x) / dist / dist;
          separation.y += (this.y - ent.y) / dist / dist;
        }
      } else {
        const reach = this.fleeing ? this.fleeRadius : this.chargeRadius;
        if (dist < reach && (!this.target || distance(this, this.target) > dist)) this.target = ent;
      }
    }

    if (cohesionCount > 0) { cohesion.x = cohesion.x / cohesionCount - this.x; cohesion.y = cohesion.y / cohesionCount - this.y; }
    if (alignmentCount > 0) { alignment.x = alignment.x / alignmentCount - this.velocity.x; alignment.y = alignment.y / alignmentCount - this.velocity.y; }
    if (this.target) {
      if (!this.fleeing) { charge.x = this.target.x - this.x; charge.y = this.target.y - this.y; }
      else { charge.x = this.x - this.target.x; charge.y = this.y - this.target.y; }
    }

    normalize(cohesion); normalize(alignment); normalize(separation); normalize(charge);

    // routed warriors are single-minded: run from the nearest enemy. Others blend all urges.
    const steer = this.fleeing
      ? { x: charge.x * this.fleeWeight, y: charge.y * this.fleeWeight }
      : {
          x: cohesion.x * this.cohesionWeight + alignment.x * this.alignmentWeight + separation.x * this.separationWeight + charge.x * this.chargeWeight,
          y: cohesion.y * this.cohesionWeight + alignment.y * this.alignmentWeight + separation.y * this.separationWeight + charge.y * this.chargeWeight,
        };

    normalize(steer);
    limit(steer, this.maxForce);
    this.velocity.x += steer.x;
    this.velocity.y += steer.y;
    limit(this.velocity, this.maxSpeed);

    this.x += this.velocity.x * world.dt;
    this.y += this.velocity.y * world.dt;

    if (this.outOfBounds()) { this.fled = true; this.removeFromWorld = true; }
  }
};
