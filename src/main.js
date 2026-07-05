'use strict';
// Browser entry + wiring (not loaded headlessly). reset() rebuilds the world from the
// current PARAMETERS. The World is constructed with the ARENA size (params), not the canvas
// size — the canvas is wider to leave room for the HUD the Observer draws to the right.
var gameEngine, world, dataManager, db;

function reset() {
  gameEngine.clear();
  world = new World(PARAMETERS.worldWidth, PARAMETERS.worldHeight);
  // fitness graph lives in the open space below the arena (HUD is drawn there too by Observer)
  const graph = new LineGraph(430, 632, 340, 150, 'mean damage / gen');
  db = createDB(PARAMETERS.db);
  dataManager = new DataManager(world, db, graph);
  gameEngine.add(world);
  gameEngine.add(new Observer(world));
  gameEngine.add(dataManager);
  gameEngine.add(graph);

  // one gene-distribution-over-generations heatmap per gene: a tall right-hand column, each
  // heatmap wide (time on x) with its label in the gutter to the left.
  const gutter = 56;
  const hx = PARAMETERS.worldWidth + 20 + gutter;   // heatmap left edge
  const hw = 1400 - hx - 14;                         // heatmap width (~510)
  const rowH = 884 / GENOME_LENGTH;                  // ~73 per gene
  for (let g = 0; g < GENOME_LENGTH; g++) {
    const gene = g;   // capture per iteration
    gameEngine.add(new Histogram(hx, 8 + g * rowH, hw, rowH - 14, PARAMETERS.histBins, GENE_NAMES[g],
      function () {
        const cols = [], H = world.history;
        for (let i = 0; i < H.length; i++) cols.push(H[i].geneHists[gene]);
        return cols;
      }));
  }
  if (typeof setStatus === 'function') {
    setStatus(PARAMETERS.numBands + ' bands × ' + PARAMETERS.bandSize + ' warriors');
  }
}

window.onload = function () {
  const canvas = document.getElementById('gameWorld');
  gameEngine = new GameEngine();
  gameEngine.init(canvas.getContext('2d'));
  buildControls();
  reset();
  gameEngine.start();
};
