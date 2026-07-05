# WarCry — Claude instructions

## Read first, every session
1. `STATUS.md` — where the system is right now (the 60-second orient)
2. `DEVLOG.md` — the top entry (what changed last)
3. `DEVPLAN.md` — the current `[ ACTIVE ]`/`[ TESTING ]` stage + the H1/H2 research design

## What this is
Evolutionary agent-based model: two war bands (flocking + charge/flee, every coefficient a
gene) fight; the **band is the unit of selection** (group selection). H1 (control): do fighting
strategies evolve from random genomes? H2 (the point): add a **binary war cry** with a
genetically-evolved response — does a shared signalling convention (a proto-language) emerge?

## Stack (never violate)
- Vanilla JS + Canvas. No build step, no framework, no modules. `<script>` tags load `src/` in
  dependency order (`main.js` last).
- **Shared things are top-level `var`** — including `var Foo = class Foo {}`. This is what lets
  the SAME `src/` files run in the browser AND headless via `vm` (a bare `class`/`const` is
  block-scoped and invisible in the vm context). Never fork the sim core.
- **All DOM lives in `ui.js` + `index.html`.** `warrior`, `world`, `observer`, `datamanager`
  touch zero DOM — that's what keeps them headless-safe.
- **Model/view split:** the `World` holds all state and never draws; the `Observer` renders it.
  Warriors do NOT draw themselves (the old build did — don't reintroduce it).
- **State has one owner:** the `World` owns bands, the current match, combat resolution, and the
  GA. Don't scatter that back into separate manager singletons hung off the engine.
- **Config:** one `PARAMETERS` global (`params.js`), serialized verbatim into every saved
  packet. `PARAM_SCHEMA` drives the control panel.
- **DB:** the vendored standard client `src/db.js` (see `~/.claude/conventions.md` §4). DB is
  `warcry`. Use `db.packet()`, and `db.scratch()` for throwaway work.

## Conventions
Follow `~/.claude/conventions.md`. STATUS is overwritten every close (present truth); DEVLOG is
append-only, newest on top (history); DEVPLAN stages carry `[ DONE ]/[ ACTIVE ]/[ TESTING ]/
[ PLANNED ]` tokens and a `**Done when:**` criterion. `/log-session` rewrites STATUS — don't
hand-edit its `Verified:` line (that moves only on a cold `/audit`).

## Run
- Browser: open `index.html`.
- Headless batch: `node runner.mjs --reps N --gens N` (writes to MongoDB via the Server).
- Smoke (no DB): `node smoketest.mjs` — prints the numbers that go in the DEVLOG entry.
