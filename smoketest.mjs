// No-DB sanity run. Verifies model invariants and prints the numbers that belong in the
// DEVLOG entry (proof coupled to log). Exits non-zero on failure.
//   node smoketest.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import vm from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ctx = { Math, console, Date };
vm.createContext(ctx);
// same DOM-free sim core the browser loads (order matters: util -> params -> gene -> ... )
for (const f of ['util.js', 'params.js', 'gene.js', 'engine.js', 'warrior.js', 'match.js', 'world.js']) {
  vm.runInContext(readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f });
}

const P = ctx.PARAMETERS;
const world = new ctx.World(P.worldWidth, P.worldHeight);
const engine = new ctx.GameEngine();

const TARGET_GENS = 20;
const tickCap = TARGET_GENS * Math.ceil(P.numBands / 2) * P.matchTickCap * 2;
let t = 0;
for (; t < tickCap && world.generation < TARGET_GENS; t++) { engine.tick = t + 1; world.update(engine); }

// --- invariants ---------------------------------------------------------------------------
const checks = [];
// 1. the generational GA actually advanced
checks.push(['evolution ran (>=' + TARGET_GENS + ' gens)', world.generation >= TARGET_GENS]);
// 2. casualty conservation: every warrior is alive, dead, or fled — none lost
const lm = world.lastMatch;
const consA = lm && lm.A.alive + lm.A.dead + lm.A.fled === P.bandSize;
const consB = lm && lm.B.alive + lm.B.dead + lm.B.fled === P.bandSize;
checks.push(['casualty accounting balances (band = alive+dead+fled)', !!(consA && consB)]);
// 3. history is well-formed: finite fitness, survivors within [0, bandSize]
const wellFormed = world.history.every((h) =>
  Number.isFinite(h.bestFitness) && Number.isFinite(h.meanFitness) &&
  h.meanSurvivors >= 0 && h.meanSurvivors <= P.bandSize);
checks.push(['generation history well-formed', wellFormed]);
// 4. combat actually happens (some generation took casualties)
const fought = world.history.some((h) => h.meanSurvivors < P.bandSize);
checks.push(['combat occurs (casualties taken)', fought]);
// 5. gene histograms recorded correctly (12 genes x histBins rows, each summing to ~1)
const histsOk = world.history.every((h) => Array.isArray(h.geneHists) &&
  h.geneHists.length === ctx.GENOME_LENGTH &&
  h.geneHists.every((row) => row.length === P.histBins &&
    Math.abs(row.reduce((s, v) => s + v, 0) - 1) < 1e-9));
checks.push(['gene histograms well-formed (12 x ' + P.histBins + ', normalised)', histsOk]);

const first = world.history[0], last = world.history[world.history.length - 1];
const trend = (key) => (first ? first[key].toFixed(2) : 'NA') + ' -> ' + (last ? last[key].toFixed(2) : 'NA');
console.log('smoke: gens=' + world.generation + ' ticks=' + t);
console.log('  meanDamage     ' + trend('meanFitness'));
console.log('  meanKills/match ' + trend('meanKills'));
console.log('  meanSurvivors  ' + trend('meanSurvivors'));
console.log('  meanAggression ' + trend('meanAggression') + '   (gene 10: 1=never routs)');
console.log('  meanChargeWt   ' + trend('meanChargeWeight'));
console.log('  meanBloodlust  ' + trend('meanBloodlust') + '   (gene 11: pull to melee centre)');
console.log('  lastMatch A(a/d/f)=' + (lm ? lm.A.alive + '/' + lm.A.dead + '/' + lm.A.fled : 'NA') +
  ' B=' + (lm ? lm.B.alive + '/' + lm.B.dead + '/' + lm.B.fled : 'NA'));
for (const [name, ok] of checks) console.log('  [' + (ok ? 'PASS' : 'FAIL') + '] ' + name);

const ok = checks.every(([, v]) => v);
console.log('smoke: ' + (ok ? 'PASS' : 'FAIL'));
process.exit(ok ? 0 : 1);
