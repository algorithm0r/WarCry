'use strict';
// The view. Reads World state and draws it; never mutates the model. Keeping all rendering
// here (instead of warriors drawing themselves) is what makes the World headless-safe.
var Observer = class Observer {
  constructor(world) { this.world = world; }

  update() {}

  draw(ctx) {
    const w = this.world;
    // arena boundary
    ctx.strokeStyle = '#222933';
    ctx.strokeRect(0.5, 0.5, w.width, w.height);

    // warriors
    for (const warrior of w.warriors) {
      ctx.beginPath();
      ctx.fillStyle = warrior.team
        ? (warrior.fleeing ? '#ff9a9a' : '#be0000')   // team A: blood red / pink when routed
        : (warrior.fleeing ? '#9ad0ff' : '#2b6cf6');  // team B: blue / light blue when routed
      ctx.arc(warrior.x, warrior.y, warrior.radius, 0, TAU, false);
      ctx.fill();

      const speed = length(warrior.velocity) || 1;    // heading tick
      ctx.strokeStyle = '#0b0e13';
      ctx.beginPath();
      ctx.moveTo(warrior.x, warrior.y);
      ctx.lineTo(warrior.x + warrior.velocity.x / speed * warrior.radius,
                 warrior.y + warrior.velocity.y / speed * warrior.radius);
      ctx.stroke();
    }

    this.drawHUD(ctx);
  }

  drawHUD(ctx) {
    const w = this.world, x = w.width + 20;
    ctx.fillStyle = '#cdd2da';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Generation ' + w.generation, x, 24);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#8a8f98';
    ctx.fillText('match band ' + w.activeA + ' vs band ' + w.activeB +
      '   (' + (w.pairIndex + 1) + '/' + w.pairings.length + ')   tick ' + w.matchTick, x, 42);

    this.drawTeam(ctx, x, 60, 'Band ' + w.activeA + ' (red)', w.tally.A, w.fleeingCount(true), '#be0000');
    this.drawTeam(ctx, x, 150, 'Band ' + w.activeB + ' (blue)', w.tally.B, w.fleeingCount(false), '#2b6cf6');

    const last = w.latest();
    if (last) {
      ctx.fillStyle = '#cdd2da';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('last gen  best ' + last.bestFitness.toFixed(0) +
        '   mean surv ' + last.meanSurvivors.toFixed(1) +
        '   wins ' + last.wins, x, 250);
    }
  }

  drawTeam(ctx, x, y, label, tally, fleeing, color) {
    const bandSize = PARAMETERS.bandSize, barW = 220, barH = 12, gap = 6;
    ctx.strokeStyle = color;
    ctx.strokeRect(x - 3, y - 4, barW + 6, barH * 4 + gap * 3 + 6);
    ctx.fillStyle = color;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(label, x, y + 8);
    this.bar(ctx, x, y + barH + gap * 0.5, barW, barH, tally.alive, bandSize, '#4fd28a', 'alive ' + tally.alive);
    this.bar(ctx, x, y + barH * 2 + gap * 1.5, barW, barH, tally.dead, bandSize, '#5a626e', 'dead ' + tally.dead);
    this.bar(ctx, x, y + barH * 3 + gap * 2.5, barW, barH, fleeing, bandSize, '#e6a15a', 'fleeing ' + fleeing);
  }

  bar(ctx, x, y, w, h, value, total, color, label) {
    ctx.fillStyle = '#161b22';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, (value / total) * w, h);
    ctx.fillStyle = '#cdd2da';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(label, x + 4, y + h - 2);
  }
};
