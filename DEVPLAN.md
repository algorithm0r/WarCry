# WarCry — DEVPLAN
*Living document, not frozen. Update as the design evolves.*

## The question
Two war bands of equal size collide. Flocking (cohesion/alignment/separation) plus
attraction/repulsion (charge/flee) drive the two clouds together; some warriors live, some
die. Every behavioural coefficient is a **gene**, and the **band is the unit of selection**
(group selection): bands that fight well reproduce.

- **H1 (control):** starting from random genomes, do effective fighting strategies — charge to
  contact, hold formation, rout the enemy — *evolve*? This is the baseline: no communication.
- **H2 (the point):** give each warrior the ability to emit a **binary war cry**, and let the
  *response* to heard cries be genetic (attract / repel / ignore, per ally vs enemy cry). Does
  group selection drive the emergence of a shared signalling **convention** — an arbitrary but
  band-consistent mapping from cry → behaviour, i.e. a proto-**language**?

## Built
- Scaffolded from engine v2 (vanilla-JS canvas + standard DB client). Control experiment (H1):
  12-gene warriors (flocking + charge/flee + aggression + bloodlust), band population, isolated
  `Match` contests run concurrently, head-to-head tournament group selection, per-gene histograms.
- Combat is decisive (kills/match ~40+); aggression and bloodlust both evolve upward.
- Runs in-browser (tiled multi-match arena + gene histograms + HUD) and headless
  (`smoketest.mjs`, `runner.mjs`) from the SAME `src/` core via `vm`.

## Not yet built
- War cries (H2) — no signalling channel yet.
- A multi-rep baseline batch in Mongo (single runs are noisy) + analysis.
- Visual confirmation of the browser layout (render unverified this session).

## Genome (current — 12 genes, control experiment)
| idx | gene | idx | gene |
|----|------|----|------|
| 0 | cohesionRadius | 6 | alignmentWeight |
| 1 | alignmentRadius | 7 | separationWeight |
| 2 | separationRadius | 8 | chargeWeight |
| 3 | chargeRadius | 9 | fleeWeight |
| 4 | fleeRadius | 10 | aggression (P stand & fight) |
| 5 | cohesionWeight | 11 | bloodlust (pull to melee centre) |

Radii = gene·`radiusScale`; weights = gene·`weightScale` (see `params.js`). Aggression is a raw
[0,1] probability. Bloodlust keeps warriors engaged **without** bounding the arena — so retreat
stays a real, evolvable option (essential for H2).

## Selection (current)
Head-to-head **tournament**, all matches of a generation run **concurrently** (each an isolated
`Match`): bands pair off, winner = more damage inflicted (`kills×killWeight + routs×routWeight`),
**loser band dies**, winner survives intact + spawns one mutated offspring into the vacated slot.
Per-gene value histograms are recorded each generation (`world.history[*].geneHists`).

## Stages

### Stage 1 — Control experiment: evolve bands to fight  [ TESTING ]
- [x] Port flocking + charge/flee as genes (`warrior.js`), no DOM / no self-draw
- [x] Head-to-head tournament selection: loser band dies, winner survives + reproduces (`world.js`)
- [x] All matches of a generation run concurrently, each an isolated `Match` (`match.js`)
- [x] Per-generation metrics + live graph + DB packet, incl. per-gene histograms (`datamanager.js`, `world.geneHistograms`)
- [x] `smoketest.mjs` asserts 5 real invariants (GA advances, casualty accounting balances,
      history well-formed, combat occurs, gene histograms well-formed) — **PASS** (2026-07-04)
- [x] **Made combat decisive:** `aggression` (gene 10) + `bloodlust` (gene 11) + `maxSpeed`
      65→30. Kills/match now ~40+ (was ~0); aggression/bloodlust both evolve up.
- [ ] Eyeball the browser layout (12-match grid, gene histograms, FPS) — render unverified.
- [ ] Baseline: `node runner.mjs --reps 30 --gens 200`; confirm trends hold across reps (single
      20-gen runs are noisy) and inspect the evolved genome via the histograms.
**Done when:** from random genomes, fighting drives reliably rise over generations across a
multi-rep batch (not one noisy run) and the bands visibly close-and-fight; batch is in Mongo.

### Stage 2 — War cries + evolved response (H2)  [ PLANNED ]
Add a signalling channel and make both ends genetic.
- [ ] **Emission:** each warrior emits `cry ∈ {0,1}` per tick. Start simple — a gene sets the
      state that triggers a cry (e.g. cry when charging / when hit / probabilistically).
- [ ] **Reception:** within a hearing radius, a warrior aggregates allied cries (and maybe
      enemy cries) and steers per **response genes** — attract toward / repel from criers.
      New genes (sketch): `cryEmitBias`, `hearingRadius`, `allyCryResponseWeight`
      (signed: +rally / −scatter), `enemyCryResponseWeight`.
- [ ] Keep H1 as the ablation: a `signalling: on/off` param so control vs treatment share code.
**Done when:** the treatment runs and we can measure whether cry-emission and cry-response
co-evolve within bands (emitter/receiver alignment) vs the no-cry control.

### Stage 3 — Does a "language" emerge? (analysis)  [ PLANNED ]
- [ ] Define measures: within-band signal→behaviour consistency; mutual information between a
      band's cries and its subsequent movement; does treatment beat control at equal compute?
- [ ] Group-selection controls: vary band size, migration/mixing, mutation rate.
- [ ] `runner/` batch + `FINDINGS.md` tying each figure to its regeneration command.
**Done when:** we can state, with data, whether group selection produced a shared, arbitrary,
band-consistent signalling convention — and under what conditions.
