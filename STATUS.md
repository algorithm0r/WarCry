# WarCry — STATUS
*One screen. The current pulse. Overwritten, never appended — for history read DEVLOG.*

**Updated:** 2026-07-04 (aggression/bloodlust + tournament + concurrent matches + histograms) —
refreshed every session close; may carry unverified claims
**Verified:** never — no cold `/audit` yet; trust the State section only as far as the provenance below

## Stage
DEVPLAN Stage 1 — Control experiment (evolve bands to fight)  `[ TESTING ]`

## State
- Control experiment (H1) is a working evolutionary loop. 12-gene warriors (flocking +
  charge/flee + **aggression** + **bloodlust**); head-to-head **tournament** selection (loser
  band dies, winner survives + reproduces); all matches of a generation run **concurrently**
  (isolated `Match` objects); per-gene value histograms recorded each generation.
- Headless **smoke PASS (5/5) @ 2026-07-04** (0.x, untagged).
- Combat is now **decisive** — the `maxSpeed` 65→30 drop plus the aggression/bloodlust genes
  turned ~0 deaths into ~40+ kills/match.
- Browser render (12-match grid, gene histograms, FPS, 1400×900 layout) **UNVERIFIED** — needs
  Chris to open `index.html`. Histogram palette is the original's (light-canvas), may read pale.

## Metrics
- 20-gen smoke @ 2026-07-04: `kills/match 9.1→43.3`, `aggression 0.54→0.96`, `bloodlust
  0.47→0.95`. Single runs are noisy (chargeWt has ranged 0.06–0.92 run-to-run) — needs a batch.

## Branches
- `main` (remote: `origin` = github.com/algorithm0r/WarCry)

## Open
- Eyeball the browser layout; fix palette/clipping if needed.
- Multi-rep baseline batch (`node runner.mjs --reps 30 --gens 200`) to confirm trends.
- Then Stage 2: war cries (H2) with a signalling on/off ablation.

## Next action
Open `index.html` to verify the layout, then run a `runner.mjs` batch to confirm the evolution
trends hold across reps.

## Blockers
- none
