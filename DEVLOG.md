# WarCry — DEVLOG
Newest entry on top. **Append only — never edit past entries.**

<!-- append new entries above this line -->

## 2026-07-04 — aggression + bloodlust genes, head-to-head tournament, concurrent matches, gene histograms

**Done:** Built the control experiment (H1) into a working evolutionary loop and made combat
decisive. Added two genes — **aggression** (gene 10: P(stand & fight) on being hit) and
**bloodlust** (gene 11: pull toward the battlefield centre of mass — engages the melee WITHOUT
bounding the arena, so retreat stays a real option for H2). Switched selection to a
**head-to-head tournament**: bands pair off, winner = more damage inflicted (kills×2 + routs×1),
loser band dies, winner survives + spawns one mutated offspring. Ran a generation's matches
**concurrently** (new `Match` class isolates each contest) — a generation resolves in one pass.
Restored the original build's **`Histogram`** class (generalized for `histBins`) for per-gene
value distributions over generations; `geneHists` recorded in history (saved to DB). Dropped
`maxSpeed` 65→30 (longer contact → lethal), raised `numBands` 20→24 (12 matches, 4×3), added an
FPS counter, and rebuilt the browser layout on a 1400×900 canvas (histograms in a tall right
column, labels in a gutter, HUD + graph below the arena).

**Changed:** New `src/match.js`, `src/histogram.js` (restored; replaces my throwaway
`genepanel.js`, deleted). Rewrote `src/world.js` (tournament, concurrent matches,
`geneHistograms`), `src/warrior.js` (2 new genes, `step(match)`, per-match arena),
`src/gene.js` (GENOME_LENGTH 10→12, `GENE_NAMES`), `src/params.js` (`killWeight`/`routWeight`
replace `winBonus`/`eliteFraction`; maxSpeed 30; numBands 24; histBins), `src/observer.js`
(tiled multi-match view, HUD below arena, FPS), `src/engine.js` (FPS), `src/main.js` +
`index.html` (layout). `smoketest.mjs`/`runner.mjs`: `match.js` added to the vm list +
per-generation semantics + a 5th invariant (histograms well-formed).

**State:** Headless **smoke PASS (5/5) @ 2026-07-04** (GA advances, casualty accounting
balances, history well-formed, combat occurs, gene histograms well-formed). 20 gens:
`meanKills/match 9.1→43.3`, `aggression 0.54→0.96`, `bloodlust 0.47→0.95` — combat now lethal
(was ~0 deaths before the speed drop), all combat drives clearly adaptive. Browser render
(12-match grid, gene histograms, FPS, 1400×900 layout) **UNVERIFIED** — no headless canvas;
needs Chris to open `index.html`. Histogram palette is the original's (light-canvas) — may read
pale on the dark theme.

**Next:** Eyeball the browser layout. Run `node runner.mjs --reps 30 --gens 200` to confirm
trends across reps — single 20-gen runs are noisy (chargeWt collapsed to 0.06 in one run, held
at 0.92 in others). Then H2 (DEVPLAN Stage 2): binary war cries + evolved response, with a
signalling on/off ablation against this control.

## 2026-07-04 — revived on engine v2; control experiment ported & running
**Done:** revived the dead WarCry build on the engine v2 scaffold. Kept the git history to
catalog the old build (removed its root `.js`/`.html`/`.css`; the good logic lives on, restructured).
Ported the control experiment (H1): flocking + charge/flee as a 10-gene genome, band population,
combat resolution, and a generational **group-selection GA** where the band is the unit of
selection. Wrote the two-hypothesis research design into DEVPLAN (H1 control, H2 war cries →
emergent signalling convention).
**Changed:** new `src/` — `params.js` (PARAMETERS+schema, db `warcry`), `util.js`, `gene.js`
(`RealGene`+genome helpers), `warrior.js` (actor: boids+charge/flee, no DOM/no self-draw),
`world.js` (owns bands/matches/combat/GA), `observer.js` (arena + team-bar HUD),
`datamanager.js` (per-generation fitness packet), `main.js`/`index.html` (wiring, wider canvas).
Rewrote `smoketest.mjs`/`runner.mjs` for the new file list + generation semantics. Old
`automata.js` (a foraging sim from another project) dropped as vestigial.
**State:** headless **smoke PASS @ scaffold (2026-07-04)** — `gens=5, ticks≈14.3k, meanFit
gen0≈55 → genN≈51`; all four invariants pass (GA advances, casualty accounting balances,
history well-formed, combat occurs). Browser render **unverified** (no headless canvas — needs
Chris to open `index.html`). Honest caveat: combat is **rout-dominated** — with fixed
`aggression=0.5` warriors flee on first hit and leave the field before dying (~0 deaths), so
fitness is flat/noisy. That's the top Stage 1 refinement, not a blocker.
**Next:** make combat decisive (make `aggression` an 11th gene and/or raise contact lethality /
shrink arena), then run a baseline batch (`node runner.mjs --reps 30 --gens 200`) and confirm
mean fitness climbs before starting H2 (war cries, DEVPLAN Stage 2).
