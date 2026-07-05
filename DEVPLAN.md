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
- Scaffolded from engine v2 (vanilla-JS canvas + standard DB client), old build's good parts
  ported in: flocking + charge/flee genes (`warrior.js`), band population + combat resolution +
  generational group-selection GA fused into one state owner (`world.js`), `RealGene` (`gene.js`).
- Runs in-browser (arena + HUD via `observer.js`) and headless (`smoketest.mjs`, `runner.mjs`)
  from the SAME `src/` core via `vm`.

## Not yet built
- War cries (H2) — no signalling channel yet.
- Decisive combat: current dynamics are **rout-dominated** (see Stage 1 open item).
- Baseline data run + analysis.

## Genome (current — 10 genes, control experiment)
| idx | gene | idx | gene |
|----|------|----|------|
| 0 | cohesionRadius | 5 | cohesionWeight |
| 1 | alignmentRadius | 6 | alignmentWeight |
| 2 | separationRadius | 7 | separationWeight |
| 3 | chargeRadius | 8 | chargeWeight |
| 4 | fleeRadius | 9 | fleeWeight |

Radii = gene·`radiusScale`; weights = gene·`weightScale` (see `params.js`).

## Stages

### Stage 1 — Control experiment: evolve bands to fight  [ TESTING ]
- [x] Port flocking + charge/flee as genes (`warrior.js`), no DOM / no self-draw
- [x] Band population, random pairing, combat resolution, generational GA (`world.js`)
- [x] Per-generation fitness metric + live graph + DB packet (`datamanager.js`)
- [x] `smoketest.mjs` asserts real invariants (GA advances, casualty accounting balances,
      history well-formed, combat occurs) — **PASS** (2026-07-04)
- [ ] **Make combat decisive.** Today warriors rout on the first hit (`aggression` fixed 0.5)
      and flee off-field before dying → ~0 deaths, fitness flat. Options: make **aggression a
      gene** (11th gene — lets fight-vs-flee evolve, arguably core to H1), raise contact
      lethality, shrink the arena, or add a "morale" that scales with local ally density.
- [ ] Baseline: `node runner.mjs --reps 30 --gens 200`; confirm mean fitness climbs and
      inspect the evolved genome (do chargers win?).
**Done when:** from random genomes, mean band fitness reliably rises over generations and the
evolved bands visibly close-and-fight (not just skirmish-and-scatter); a baseline batch is in Mongo.

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
