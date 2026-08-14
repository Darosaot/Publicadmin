# Content Guide

How to add narrative content to the game without touching the engine. Everything in this guide is
enforced by `src/content/validate.ts`, which runs as part of `npm test` — if you get a key or an id
wrong, a test fails and tells you which one.

## How content and text fit together

Content is authored in one place — `src/content/`, where structure and English prose sit together
— and split at import time by the helpers in `src/content/authoring.ts`:

- the typed data the engine consumes (conditions, effects, weights), and
- a flat English dictionary, `EN_STRINGS`, keyed by ids derived from the content itself.

Writing an event and forgetting its text is therefore impossible, and no key is ever typed by
hand. English is simply the source language; a translation is a separate dictionary with the same
keys, registered in `src/i18n/index.tsx`.

## Naming

Ids are dotted, lowercase, and describe where the thing lives:

| Kind | Pattern | Example |
| --- | --- | --- |
| Task | `task.<department\|shared>.<name>` | `task.legal.contract_review` |
| Random event | `evt.<department\|common>.<name>` | `evt.common.press_call` |
| Milestone | `evt.milestone.<name>` | `evt.milestone.first_month` |
| Follow-up | `evt.followup.<name>` | `evt.followup.audit_letter` |
| Flag | `<verb>_<subject>` | `owes_favour_councillor` |

Text keys are generated from the id, so the string for a thing is always findable from the thing:

```
evt.common.press_call.title
evt.common.press_call.body
evt.common.press_call.choice.decline           // the button label
evt.common.press_call.choice.decline.out.0     // the outcome text
```

## Adding a random event

```ts
// src/content/events/common.ts
defineEvent('evt.common.press_call', {
  kind: 'random',
  title: 'A journalist has your number',
  body: 'She is polite, well-briefed, and asking about a decision your department signed off…',
  weight: 12,
  conditions: { minLevel: 1, maxLevel: 3 },
  choices: [
    {
      // A choice with one certain outcome: use `text` and `effects` directly.
      id: 'refer',
      label: 'Refer her to the press office',
      text: 'She writes the piece without you.',
      effects: [{ kind: 'stat', stat: 'reputation', delta: -1 }],
    },
    {
      // A choice that can land more than one way: use `outcomes` with weights.
      id: 'explain',
      label: 'Explain the file on the record',
      outcomes: [
        { weight: 3, text: 'The article is accurate…', effects: [/* … */] },
        { weight: 2, text: 'The subeditor cuts the explanation…', effects: [/* … */] },
      ],
    },
    // …2 to 4 choices total
  ],
});
```

**Weights** are relative within the eligible pool; 10 is the default, 20 is "this should come up
often", 3 is "rare colour". **Cooldown** defaults to 12 turns. Set `once: true` for an event that
should never repeat in a career.

## Conditional outcomes

An outcome may carry its own `conditions`. This is how a decision taken years earlier changes how
a later scene lands — the flag set back then gates the outcome now:

```ts
outcomes: [
  {
    // Only reachable if the player left a written note at the time.
    conditions: { forbiddenFlags: ['knows_contract_flaw'] },
    text: 'You produce the note, the date, and the person you gave it to…',
    effects: [{ kind: 'stat', stat: 'integrity', delta: 5 }],
  },
  {
    text: 'You say you raised it. There is no note…',
    effects: [{ kind: 'stat', stat: 'reputation', delta: -7 }],
  },
]
```

**At least one outcome per choice must be unconditional**, so a choice can never dead-end.
Validation enforces this.

## Conditions

The same shape gates events and individual choices:

```ts
{
  minLevel?: number;              maxLevel?: number;
  departments?: DepartmentId[];   minTurn?: number;
  minYearsElapsed?: number;        tracks?: TrackId[];
  minStat?: { reputation?: 40, politicalCapital?: 25, … };
  maxStat?: { integrity?: 30, … };
  requiredFlags?: string[];       forbiddenFlags?: string[];
  minFlag?: Record<string, number>;
  maxFlag?: Record<string, number>;
  requiresTeam?: boolean;         minStaffCount?: number;
  minTeamMorale?: number;         maxTeamMorale?: number;
}
```

A choice whose conditions fail is **rendered but disabled**, with a generated hint explaining what
you're missing. That's intentional — the player should see the option they can't afford.

**`minTurn` counts decision cycles; `minYearsElapsed` counts calendar years, and they stopped
being the same number once a senior cycle covered half a year.** Use `minTurn` when you mean "not
in the first few turns" and `minYearsElapsed` whenever the prose says how long ago something
happened. An event whose body opens "a case you handled two years ago" needs
`minYearsElapsed: 2`, or it will fire in the player's first year.

## Effects

The effect list is deliberately small. If you find yourself wanting a new effect kind, the answer
is almost always a flag plus a follow-up event.

| Effect | Shape | Notes |
| --- | --- | --- |
| Stat change | `{ kind: 'stat', stat, delta }` | Clamped to 0–100 automatically |
| Salary change | `{ kind: 'salary', delta }` | In euros per month |
| Set a flag | `{ kind: 'flag', flag, value? }` | `value` defaults to `true` |
| Move a numeric flag | `{ kind: 'flagDelta', flag, delta }` | Unset counts as 0, so the first delta sets it |
| Add a task | `{ kind: 'spawnTask', templateId }` | Lands on the board immediately |
| Schedule an event | `{ kind: 'queueEvent', eventId, delayTurns? }` | The consequence mechanism |
| End the game | `{ kind: 'endGame', ending }` | Short-circuits everything else |
| Team morale | `{ kind: 'teamMorale', delta }` | Every member of the unit |
| Team skill | `{ kind: 'teamSkill', delta }` | Every member of the unit |
| One-off money | `{ kind: 'budget', delta }` | Against this year's balance |
| Standing allocation | `{ kind: 'budgetMonthly', delta }` | Changes the monthly line itself |
| Lose someone | `{ kind: 'loseStaff' }` | The lowest morale in the unit walks |
| Gain someone | `{ kind: 'gainStaff', seniority }` | Arrives next month, no vacancy needed |

The six team effects are **no-ops for a player who has no unit yet**, so a common event can carry
one without needing a level gate. But an event whose *scene* only makes sense with staff in the
room should still be gated with `requiresTeam: true` — a no-op effect is not the same as a
sentence that reads as nonsense.

**Chains stay short.** A choice may schedule a follow-up, and that follow-up may resolve — two
steps. Longer chains are hard to test and harder to balance.

## Adding a task template

```ts
defineTask('task.legal.contract_review', {
  title: 'Contract review',
  desc: 'Forty pages of clauses drafted by the supplier’s lawyers…',
  departments: ['legal'],
  baseEffort: 6,                 // scaled by level at spawn time
  deadlineRange: [2, 4],         // months, rolled at spawn
  difficulty: 2,                 // 1–3; affects quality, not speed
  weight: 10,
  onComplete: {
    excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
    poor: [{ kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 2 }],
  },
  onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge' }],
});
```

Use `departments: 'any'` for shared work that lands on every desk. Use `minLevel` / `maxLevel` to
retire a template as you climb — but prefer letting `baseEffort` scale automatically over writing
a separate template per level. **Never write department-specific content per level**; that's a 7×5
matrix nobody can fill.

### Keeping the seven departments comparable

The task board is the biggest lever on how a career goes, and it is easy to make one department
harder than the others without noticing. Two numbers matter more than they look:

- **The tightest deadline.** A `deadlineRange` starting at 2 on a template with meaningful
  `baseEffort` is close to an automatic failure at low levels, and failures compound: they cost
  Performance, which costs quality, which costs more failures.
- **The cheapest template.** Every department needs one low-effort, low-difficulty, high-weight
  file. It is what keeps a completion rate up while the real work is in progress.

Procurement once had the tightest deadlines and no cheap template, and averaged nearly two career
levels below Policy for it. `tests/engine/autoplay.test.ts` now fails if the best and worst
departments drift more than 1.2 levels apart; `npm run balance` prints the real spread.

A third number matters just as much and lives in the event pool rather than the task board:

- **How much reputation the pool hands out.** Inspection shipped paying about +3.2 reputation per
  event where legal pays +1.9, and that alone made it a walkover — mean level 5.0, every career
  topping out. Reputation is the promotion currency, so a generous pool is a fast ladder. Before
  adding a department, total its stat deltas and compare the density against an existing pool.

### Adding a department

The cost is fixed and worth knowing before you start, because the tests enforce all of it:

| What | How much | Enforced by |
| --- | --- | --- |
| Own task templates | 10, banded across the tiers | `validate.ts` — `taskSlots + 2` eligible at every tier, ≥1 department-specific |
| Tier-4 templates | 2, appended to `tasks/senior.ts` | the same tier check, at the top |
| Own events | 14 (12 is the floor) | `content.test.ts` |
| Registration | `departments.ts`, `tasks/index.ts`, `events/index.ts`, `DepartmentId` | typecheck |
| Balance | inside the 1.2-level spread | `autoplay.test.ts` |

`departmentList` is derived from `DEPARTMENT_IDS`, so a department added to the record now appears
on the new-game screen automatically. It used to be a hand-written parallel array that nothing
validated, which meant a fully-written department could be invisible to the player and every test
would pass.

Write the department around **what its failure mode is**, not around its subject matter. Inspection
and social services justify their existence because failing at them means something different:
inspection's failure is a body that carries on unchallenged for two more years, social services'
is a person. That difference is what `onFail` should encode — social services weights integrity and
stress over performance for exactly this reason — and it is the only thing that stops a new
department being the same desk with different nouns.

## Adding a language

1. Get the full key list: `npm run docs:script` writes every string into
   `docs/narrative-script.md`, and `EN_STRINGS` holds them all at runtime.
2. Create `src/i18n/es/` with the same keys mapped to translated values, plus a translated copy of
   `src/i18n/en/ui.ts`.
3. Add the locale to the `locales` map in `src/i18n/index.tsx`.

Only names and numbers are interpolated (`{name}`, `{amount}`), so no sentence depends on English
grammar for its structure.

## Writing for a track

The career is a graph of **posts** grouped into **tiers**, and a tier is what `minLevel` and
`maxLevel` have always meant — so every existing gate still works untouched. What is new is
`tracks`, for content that only makes sense on one branch:

```ts
conditions: { tracks: ['oversight'], minLevel: 3 }
```

Use it when the *scene* would not happen elsewhere: an inspection, a reshuffle rumour, a question
put to you because nobody reports to you. Do not use it to make a track easier or harder — that is
a job for the post's numbers in `careers.ts`, where it can be measured.

Two things to keep in mind:

- **A post with no unit is not a lesser post.** The expert track has no staff and no budget, so
  management events (`requiresTeam: true`) simply never fire there. It needs its own material or
  it is the same game with fewer options.
- **`npm run balance` reports per track**, and `tests/engine/autoplay.test.ts` fails if the best
  and worst drift more than 1.2 mean levels apart. Adding a pile of content to one branch is
  exactly how that gap opens.
- **A track wants a home department.** `tracks` gates events, but the desk itself comes from the
  department, and oversight was a set of job titles with nobody's task board behind them until
  inspection existed. If a track has no department where its work is the everyday work, most of
  what you write for it will have to be an event, and events are the expensive way to say
  "this job is different".

One trap in the measurement, worth stating because it looked fine for a while: the balance bot
chases salary, so left to itself it takes the political fork from every start and the per-track
report prints the line track four times under four headings. `playCareer` takes a `preferredTrack`
for this, and a test asserts the four rows actually differ. A guardrail that measures nothing is
worse than none, because it reads as green.

## Writing for the cast

Eight people in `src/content/cast.ts` recur across a career. Each exports helpers that turn into
ordinary effects and conditions, so an event names them in the prose and gates on the relationship:

```ts
import { vasquez } from '../cast';

defineEvent('evt.cast.vasquez_panel', {
  conditions: { ...vasquez.known, minLevel: 4, minYearsElapsed: 12 },
  choices: [
    {
      id: 'lean',
      label: 'Remind her, gently, of the early years',
      conditions: vasquez.warm(20),        // → { requiredFlags, minFlag }
      text: 'You mention Alderford, and the supervisor you both had…',
      effects: [vasquez.standing(-14)],    // → { kind: 'flagDelta' }
    },
  ],
});
```

The helpers are `standing(n)`, `meet(n)`, `known`, `unknown`, `warm(n)` and `cold(n)`.

Four rules:

- **Names go in the prose, literally.** `EventModal` renders the body with no params, so there is
  no interpolation — and there does not need to be, since a cast member's name is fixed at
  authoring time. Write "Elena Vásquez" into the sentence.
- **Gate introductions `unknown` and everything else `known`**, or a career will be introduced to a
  twenty-year colleague in its final year.
- **Give the reappearances `minYearsElapsed`.** The point of a cast is time passing.
- **Use conditional outcomes, not separate events, for how they take it.** The same scene resolving
  differently against `warm` and `cold` is the whole mechanism; a `warm`-gated *event* would just
  hide content from most players.

## Flags, and keeping the promise

Setting a flag is a promise that the decision will matter later. It is very easy to make that
promise while writing a scene and never keep it — at one point **twenty-five of the twenty-seven
flags in the corpus were write-only**, which is a great deal of consequence no player could reach.

Validation now fails on a flag that is set but never read, so the payoff has to be written in the
same commit as the promise. The payoff usually belongs in `events/reckonings.ts`, where everything
is gated on a flag and nothing can fire unless it was earned.

Three things make a reckoning land:

- **Give it years.** Add `minYearsElapsed`. A consequence that arrives the following month is a
  puzzle; one that arrives a decade later is a memory.
- **Make it a decision, not a punishment.** The interesting part is being asked again, with more
  information and less room, about something you have not thought about since.
- **Use conditional outcomes for the second flag.** A choice gated on one flag can carry an
  outcome gated on another, which is how "you did this once before" gets written. Remember that
  every choice still needs one unconditional outcome.

Numeric flags exist for the things that are really quantities — standing with a person, how many
times you have taken the shortcut. Use `flagDelta` to move one and `minFlag` to gate on it.

## Adding a follow-up

A follow-up is never drawn at random, so writing one is only half the job: **something has to
schedule it**. Add the `queueEvent` effect to the choice, outcome or task result that earns it, in
the same commit. A follow-up nothing leads to is content no player can ever see, and validation
fails on it.

Give consequences room. A `delayTurns` of 4 to 8 is usually right for the slow ones — the audit,
the court, the letter from whoever has your old job now — so that when it lands the player has to
remember what they did rather than being told.

## Regenerating the script

`docs/narrative-script.md` is generated, not maintained:

```bash
npm run docs:script
```

Run it after any content change so the readable script keeps matching the game.

## What validation checks

`src/content/validate.ts`, run by `tests/engine/content.test.ts`:

- Every event and task id is unique
- Every generated string key resolves to real English text, and none of it is empty
- Every `spawnTask` template id and `queueEvent` event id refers to something that exists
- Every event has at most 4 choices, and every choice has at least one outcome
- Every outcome weight is greater than 0, and no choice has *only* conditional outcomes
- Every department has task templates and random events that can reach it
- Career levels are contiguous from 1, with rising salaries and real promotion requirements
- Every ending has closing text, and the Minister ending is actually reachable from content
