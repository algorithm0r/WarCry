'use strict';
// Browser entry + wiring (not loaded headlessly). reset() rebuilds the world from the
// current PARAMETERS. The World is constructed with the ARENA size (params), not the canvas
// size — the canvas is wider to leave room for the HUD the Observer draws to the right.
var gameEngine, world, dataManager, db;

function reset() {
  gameEngine.clear();
  world = new World(PARAMETERS.worldWidth, PARAMETERS.worldHeight);
  const graph = new LineGraph(PARAMETERS.worldWidth + 20, 470, 220, 110, 'mean fitness / gen');
  db = createDB(PARAMETERS.db);
  dataManager = new DataManager(world, db, graph);
  gameEngine.add(world);
  gameEngine.add(new Observer(world));
  gameEngine.add(dataManager);
  gameEngine.add(graph);
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
