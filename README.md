# Public Service Story

**▶ Play it: [publicadminsim.netlify.app](https://publicadminsim.netlify.app)**

A public administration career simulator. You join a small city council as a junior official in
the department of your choice, manage the work that lands on your desk each month, and build (or
burn) a reputation. Do it well enough and other administrations start calling — a bigger city, the
regional government, a national agency, a ministry. Do it *very* well, and play the politics right,
and one day the ministerial car is yours.

Competence, ethics and political skill are three different things in this game. You can rise by
being brilliant, by being well-connected, or by cutting corners — and the game remembers which.

## How to play

1. **Pick a department.** Legal, Projects, Finance, Procurement or Policy. Each has its own work,
   its own kinds of trouble, and its own signature crisis waiting for you somewhere down the line.
2. **Each turn is one decision cycle** — a month at a junior desk, half a year once you run a
   directorate. Tasks arrive with deadlines, difficulty and consequences, and you have a limited
   pool of effort points to spread across them.
3. **Choose where the effort goes.** Spread thin and everything is mediocre; go deep on one file
   and something else misses its deadline. Leaving slack lets you recover from stress; working
   overtime buys points you pay for later.
4. **Then things happen to you.** A journalist calls. A councillor asks for a favour. An audit
   letter arrives. Each event is a decision, and decisions move your stats — sometimes months later.
5. **Reputation opens doors.** Meet the thresholds and job offers appear on your Career screen.
   Accept, and everything gets bigger: the salary, the effort you command, and the trouble.

Six stats decide how it goes: **Reputation**, **Performance**, **Political Capital**,
**Integrity**, **Stress** and your **Salary**. There are six ways it can end, from burnout to the
Council of Ministers.

The setting is a fictional European country — EU-funded projects, procurement directives,
transparency requests and audits — so nothing here maps onto any real administration's law.

## Documentation

| Document | What's in it |
| --- | --- |
| [`docs/game-design.md`](docs/game-design.md) | The full design: stats, formulas, turn loop, career ladder, balance tables, endings |
| [`docs/narrative-script.md`](docs/narrative-script.md) | The complete script — every event, choice and outcome |
| [`docs/content-guide.md`](docs/content-guide.md) | Content schemas: how to add an event, a task, or a new language |

## Running it

```bash
npm install
npm run dev        # dev server
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Add `?seed=42` to the URL to start a run with a fixed random seed — the same seed and the same
decisions always produce the same game, which is how the tests work too.

## Tests

```bash
npm run typecheck  # TypeScript, strict
npm test           # engine unit tests + content validation + autoplay simulation
npm run test:e2e   # Playwright browser smoke test
```

## Architecture in one paragraph

The game engine (`src/engine/`) is pure TypeScript with no React imports: a `GameState` plus an
action goes in, a new `GameState` comes out. All randomness runs through a seeded generator whose
cursor lives inside the state, so runs are reproducible and tests are deterministic. Narrative
content (`src/content/`) is typed data with every player-visible string stored as an i18n key,
looked up from dictionaries in `src/i18n/`. React (`src/ui/`, `src/state/`) is a thin rendering
layer over the engine, and saves go to `localStorage` — there is no backend.

## Deployment

Static build, no server required. Deployed on Netlify at
[publicadminsim.netlify.app](https://publicadminsim.netlify.app) from `main`
(`netlify.toml`: `npm run build` → `dist/`). Pull requests get their own deploy preview.
