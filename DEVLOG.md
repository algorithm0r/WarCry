# WarCry — DEVLOG
Newest entry on top. **Append only — never edit past entries.**

<!-- append new entries above this line -->

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
