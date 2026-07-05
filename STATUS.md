# WarCry — STATUS
*One screen. The current pulse. Overwritten, never appended — for history read DEVLOG.*

**Updated:** 2026-07-04 (revival) — refreshed every session close; may carry unverified claims
**Verified:** never — no cold `/audit` yet; trust the State section only as far as the provenance below

## Stage
DEVPLAN Stage 1 — Control experiment (evolve bands to fight)  `[ TESTING ]`

## State
- Revived on engine v2. Control experiment (H1) ported and running: 10-gene flocking+charge/flee
  warriors, band population, combat resolution, generational **group-selection GA**.
- Headless **smoke PASS @ 2026-07-04** (gens=5, meanFit gen0≈55→genN≈51; all 4 invariants pass).
- Browser (`index.html`) **unverified** — needs Chris to open it and watch a few generations.
- Known limitation: **combat is rout-dominated** (fixed aggression → warriors flee before dying,
  ~0 deaths, flat fitness). Expected; it's the next tuning step, not a bug.

## Metrics
- gen0 meanFitness ≈ 55, gen5 ≈ 51 (noisy/flat — pre-tuning); lastMatch casualties ~all fled.

## Branches
- `main`

## Open
- Make combat decisive (aggression-as-gene / lethality / arena size).
- Baseline batch to Mongo (`runner.mjs --reps 30 --gens 200`); confirm fitness climbs.
- Then Stage 2: war cries (H2).

## Next action
Make `aggression` an 11th gene (let fight-vs-flee evolve), re-run smoke, then a baseline batch.

## Blockers
- none
