'use strict';
// Distribution-over-time heatmap — restored from the original WarCry build (the `Histogram`
// class), generalized for an arbitrary bin count and modernised for engine v2. Browser-only
// view (drawing); reads its data via a `getColumns()` callback and never mutates the model.
//
//   x = time (one column per generation, scrolling window of the last `w` columns)
//   y = value bin, low at the bottom
//   colour = fraction of the column's mass in that bin (original log-scaled palette:
//            sparse -> light, concentrated -> deep blue)
//
// getColumns() returns an array of columns, each a `bins`-length array of counts/fractions.
// For a gene g: () => world.history.map(h => h.geneHists[g]).
//
// (x, y, w, h) is the HEATMAP rectangle; the label is drawn in the gutter to its LEFT (the
// caller leaves room there), so it never overlaps the data.
var Histogram = class Histogram {
  constructor(x, y, w, h, bins, label, getColumns) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.bins = bins; this.label = label; this.getColumns = getColumns;
  }

  update() {}

  draw(ctx) {
    const data = this.getColumns();
    const total = data.length;
    const shown = total > this.w ? this.w : total;      // scrolling window (≤ w columns)
    const start = total > this.w ? total - this.w : 0;
    const colW = this.w / (shown || 1);
    const binH = this.h / this.bins;

    ctx.fillStyle = '#0b0e13';
    ctx.fillRect(this.x, this.y, this.w, this.h);

    for (let i = 0; i < shown; i++) {
      const column = data[i + start];
      let sum = 0;
      for (let j = 0; j < column.length; j++) sum += column[j];
      if (sum <= 0) continue;
      for (let j = 0; j < this.bins; j++) {
        this.fill(ctx, column[j] / sum,
          this.x + i * colW, this.y + (this.bins - 1 - j) * binH, colW, binH);
      }
    }

    ctx.strokeStyle = '#2b3440';
    ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w, this.h);

    // label + value axis in the gutter to the LEFT of the heatmap (off the data)
    ctx.fillStyle = '#cdd2da';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x - 8, this.y + this.h / 2);
    ctx.fillStyle = '#5a626e';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText('1', this.x - 8, this.y + 5);
    ctx.fillText('0', this.x - 8, this.y + this.h - 5);
    ctx.textBaseline = 'alphabetic';
  }

  // original WarCry colour map: log-scaled so small fractions stay visible; sparse cells are
  // light, concentrated cells deepen to blue.
  fill(ctx, value, x, y, w, h) {
    let c = value * 99 + 1;
    c = 511 - Math.floor(Math.log(c) / Math.log(100) * 512);
    if (c > 255) { c = c - 256; ctx.fillStyle = rgb(c, c, 255); }
    else { ctx.fillStyle = rgb(0, 0, c); }
    ctx.fillRect(x, y, w + 0.5, h + 0.5);
  }
};
