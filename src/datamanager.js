'use strict';
// Samples the World's per-GENERATION fitness (not per tick — a generation spans many ticks),
// feeds the live graph, and ships a self-describing packet (full PARAMETERS + the generation
// history) to the DB once `epoch` generations have elapsed. packet() (db.js) embeds
// PARAMETERS verbatim so every run reconstructs from its own record.
//
// NOTE: in the browser this auto-flushes at epoch (fire-and-forget, errors logged). The
// headless runner (runner.mjs) drives generations and flushes explicitly so it can await.
var DataManager = class DataManager {
  constructor(world, db, graph) {
    this.world = world;
    this.db = db;
    this.graph = graph;
    this.run = (PARAMETERS.db && PARAMETERS.db.run) || 'run';
    this.seenGenerations = 0;
    this.flushed = false;
  }

  update(engine) {
    // pick up every generation the world has completed since we last looked
    while (this.seenGenerations < this.world.history.length) {
      const entry = this.world.history[this.seenGenerations++];
      if (this.graph) this.graph.push(entry.meanFitness);
    }
    if (!this.flushed && this.world.generation >= PARAMETERS.epoch) {
      this.flushed = true;
      this.flush();
    }
  }

  async flush() {
    if (!this.db) return { ok: false };
    const pkt = this.db.packet(PARAMETERS, {
      run: this.run,
      generations: this.world.history.length,
      history: this.world.history,
      finalMeanFitness: this.world.latest() ? this.world.latest().meanFitness : 0,
    });
    try {
      const res = await this.db.insert(this.run, pkt);
      if (typeof console !== 'undefined') console.log('[data] saved', JSON.stringify(res));
      return res;
    } catch (e) {
      if (typeof console !== 'undefined') console.error('[data] save failed:', e.message);
      return { ok: false, error: e.message };
    }
  }

  draw() {}
};
