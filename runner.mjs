// Headless batch runner. Loads the SAME browser sim files into one vm context (no fork),
// runs reps, and writes self-describing packets via the standard DB client (direct transport).
//   node runner.mjs [--reps N] [--gens N] [--db NAME] [--collection NAME]
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createDB } = require('./src/db.js');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const reps = parseInt(flag('reps', '1'), 10);
const gensOverride = parseInt(flag('gens', '0'), 10);

// load the DOM-free sim core into a shared vm context (browser globals become ctx props
// because everything is declared `var` / `var X = class X` — no const->var patch needed)
const ctx = { Math, console, Date };
vm.createContext(ctx);
for (const f of ['util.js', 'params.js', 'gene.js', 'engine.js', 'warrior.js', 'world.js']) {
  vm.runInContext(readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f });
}

const P = ctx.PARAMETERS;
const dbName = flag('db', P.db.db);
const collection = flag('collection', null);
const genLimit = gensOverride || P.epoch;
const tickCap = genLimit * Math.ceil(P.numBands / 2) * P.matchTickCap * 3; // generous safety

const db = createDB(Object.assign({}, P.db, { transport: 'direct', db: dbName }));
for (let r = 0; r < reps; r++) {
  const run = 'run_' + String(r).padStart(3, '0');
  db.config.run = run;
  const world = new ctx.World(P.worldWidth, P.worldHeight);
  const engine = new ctx.GameEngine();
  let t = 0;
  for (; t < tickCap && world.generation < genLimit; t++) { engine.tick = t + 1; world.update(engine); }
  const last = world.latest();
  const pkt = db.packet(P, { run, generations: world.history.length, history: world.history,
    finalMeanFitness: last ? last.meanFitness : 0 });
  const res = await db.insert(collection || run, pkt);
  console.log(run + ': gens=' + world.history.length + ' ticks=' + t +
    ' finalMeanFit=' + (last ? last.meanFitness.toFixed(1) : 'NA') +
    '  saved=' + JSON.stringify(res));
}
await db.close();
