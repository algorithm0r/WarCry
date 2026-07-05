# WarCry

Two war bands of equal size collide. Flocking + attraction/repulsion drive the clouds
together; some live, some die. Every behavioural coefficient is a **gene** and the **band is
the unit of selection** — so bands evolve to fight. The research question is whether adding a
**binary war cry** with a genetically-evolved *response* lets a shared signalling convention (a
proto-**language**) emerge under group selection. See `DEVPLAN.md` for the full design (H1/H2).

A browser-based agent-based simulation (vanilla JS + Canvas, no build step), scaffolded from
the shared engine v2.

## Run
- **Browser:** open `index.html`. Left panel tunes params live; the arena shows two bands
  fighting, the HUD shows per-band alive/dead/fleeing and the per-generation fitness graph.
- **Headless batch:** `node runner.mjs --reps 30 --gens 200` — runs the same sim core via `vm`
  and writes self-describing packets (full PARAMETERS + generation history) to MongoDB.
- **Smoke test:** `node smoketest.mjs` — no DB; asserts model invariants and prints metrics.

## Model at a glance
| thing | where |
|-------|-------|
| Tunables (PARAMETERS + control-panel schema) | `src/params.js` |
| Genome + mutation (`RealGene`, genome helpers) | `src/gene.js` |
| Warrior: boids + charge/flee, combat, no DOM | `src/warrior.js` |
| World: bands, matches, combat resolution, group-selection GA | `src/world.js` |
| Rendering (arena + HUD) — the only place that draws | `src/observer.js` |
| Per-generation fitness → graph + DB packet | `src/datamanager.js` |
| Engine loop (browser + headless) | `src/engine.js` |
| DOM / control panel (browser-only) | `src/ui.js`, `index.html`, `src/main.js` |
| Standard DB client (vendored) | `src/db.js` |

## Layout
- `src/` — sim core + `db.js` (vendored) + `ui.js`/`main.js` (browser-only, all DOM).
- `runner.mjs` / `smoketest.mjs` — headless entry points.
- `DEVPLAN.md` / `DEVLOG.md` / `STATUS.md` — plan (forward), log (backward, append-only),
  present-state snapshot.

See `~/.claude/conventions.md` for the shared standards this follows.
