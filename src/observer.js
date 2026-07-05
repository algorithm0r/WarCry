'use strict';
// The view. Reads World state and draws it; never mutates the model. All of a generation's
// matches run at once, so the arena region is tiled into a grid — one cell per contest, each
// match's full sim arena scaled down into its cell. HUD (generation + aggregates) on the right.
var Observer = class Observer {
  constructor(world) { this.world = world; }

  update() {}

  draw(ctx) {
    const w = this.world;
    const n = w.matches.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const tileW = w.width / cols, tileH = w.height / rows;

    for (let i = 0; i < n; i++) {
      const m = w.matches[i];
      const ox = (i % cols) * tileW, oy = Math.floor(i / cols) * tileH;
      this.drawMatch(ctx, m, ox, oy, tileW, tileH);
    }
    this.drawHUD(ctx);
  }

  drawMatch(ctx, m, ox, oy, tileW, tileH) {
    const sx = tileW / m.width, sy = tileH / m.height;
    // cell border (dimmed once the contest is decided)
    ctx.strokeStyle = m.done ? '#1b2028' : '#2b3440';
    ctx.strokeRect(ox + 0.5, oy + 0.5, tileW - 1, tileH - 1);

    const r = Math.max(1, 5 * Math.min(sx, sy));  // warrior dot, scaled to the cell
    for (const warrior of m.warriors) {
      ctx.fillStyle = warrior.team
        ? (warrior.fleeing ? '#ff9a9a' : '#be0000')
        : (warrior.fleeing ? '#9ad0ff' : '#2b6cf6');
      ctx.beginPath();
      ctx.arc(ox + warrior.x * sx, oy + warrior.y * sy, r, 0, TAU, false);
      ctx.fill();
    }

    if (m.done) {   // mark the winner
      ctx.fillStyle = m.result.winner === m.aIndex ? '#be0000' : '#2b6cf6';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('band ' + m.result.winner + ' wins', ox + 4, oy + tileH - 5);
    }
  }

  drawHUD(ctx) {
    // drawn in the open space BELOW the arena (the right column is the gene histograms now)
    const w = this.world, x = 16, y0 = w.height + 26;
    const done = w.matches.filter((m) => m.done).length;
    const fps = (typeof gameEngine !== 'undefined' && gameEngine.fps) ? gameEngine.fps : 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#cdd2da';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Generation ' + w.generation, x, y0);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#8a8f98';
    ctx.fillText(w.matches.length + ' contests — ' + done + ' decided', x, y0 + 20);
    ctx.fillText('fps ' + fps + '   (×' + PARAMETERS.updatesPerDraw + ' updates/frame)', x, y0 + 36);

    const last = w.latest();
    if (last) {
      const lines = [
        'last generation:',
        '  kills/match  ' + last.meanKills.toFixed(2),
        '  mean dmg     ' + last.meanFitness.toFixed(1),
        '  mean surv    ' + last.meanSurvivors.toFixed(1),
      ];
      ctx.fillStyle = '#cdd2da';
      for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y0 + 60 + i * 16);
    }
  }
};
