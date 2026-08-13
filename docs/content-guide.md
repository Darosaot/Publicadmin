# Content Guide

How to add narrative content to the game without touching the engine. Everything in this guide is
enforced by `src/content/validate.ts`, which runs as part of `npm test` — if you get a key or an id
wrong, a test fails and tells you which one.

## The two-file rule

Every piece of content is split across two places:

1. **The data** — `src/content/…`, typed TypeScript. Structure, numbers, conditions, effects. No
   prose whatsoever, only **keys**.
2. **The text** — `src/i18n/en/…`, flat dictionaries mapping those keys to English strings.

This is what makes translation mechanical: to add Spanish you copy `src/i18n/en/` to
`src/i18n/es/`, translate the right-hand side of every entry, and register the locale. Nothing in
`src/content/` changes.

## Naming

Ids are dotted, lowercase, and describe where the thing lives:

| Kind | Pattern | Example |
| --- | --- | --- |
| Task | `task.<department\|shared>.<name>` | `task.legal.contract_review` |
| Random event | `evt.<department\|common>.<name>` | `evt.common.press_call` |
| Milestone | `evt.milestone.<name>` | `evt.milestone.first_day` |
| Follow-up | `evt.followup.<name>` | `evt.followup.audit_letter` |
| Flag | `<verb>_<subject>` | `owes_favour_ruiz` |

Text keys are the id plus a suffix, so you can always find the string for a thing from the thing:

```
evt.common.press_call.title
evt.common.press_call.body
evt.common.press_call.choice.decline           // the button label
evt.common.press_call.choice.decline.out.0     // the outcome text
```

## Adding a random event

```ts
// src/content/events/common.ts
{
  id: 'evt.common.press_call',
  kind: 'random',
  titleKey: 'evt.common.press_call.title',
  bodyKey: 'evt.common.press_call.body',
  weight: 10,
  conditions: { minLevel: 1, maxLevel: 3 },
  choices: [
    {
      id: 'decline',
      labelKey: 'evt.common.press_call.choice.decline',
      outcomes: [
        {
          weight: 1,
          textKey: 'evt.common.press_call.choice.decline.out.0',
          effects: [{ kind: 'stat', stat: 'reputation', delta: -1 }],
        },
      ],
    },
    // …2 to 4 choices total
  ],
}
```

Then add the four strings to `src/i18n/en/events/common.ts`.

**Weights** are relative within the eligible pool; 10 is the default, 20 is "this should come up
often", 3 is "rare colour". **Cooldown** defaults to 12 turns. Set `once: true` for an event that
should never repeat in a career.

## Conditions

The same shape gates events and individual choices:

```ts
{
  minLevel?: number;              maxLevel?: number;
  departments?: DepartmentId[];   minTurn?: number;
  minStat?: { reputation?: 40, politicalCapital?: 25, … };
  maxStat?: { integrity?: 30, … };
  requiredFlags?: string[];       forbiddenFlags?: string[];
}
```

A choice whose conditions fail is **rendered but disabled**, with a generated hint explaining what
you're missing. That's intentional — the player should see the option they can't afford.

## Effects

The effect list is deliberately small. If you find yourself wanting a new effect kind, the answer
is almost always a flag plus a follow-up event.

| Effect | Shape | Notes |
| --- | --- | --- |
| Stat change | `{ kind: 'stat', stat, delta }` | Clamped to 0–100 automatically |
| Salary change | `{ kind: 'salary', delta }` | In euros per month |
| Set a flag | `{ kind: 'flag', flag, value? }` | `value` defaults to `true` |
| Add a task | `{ kind: 'spawnTask', templateId }` | Lands on the board immediately |
| Schedule an event | `{ kind: 'queueEvent', eventId, delayTurns? }` | The consequence mechanism |
| End the game | `{ kind: 'endGame', ending }` | Short-circuits everything else |

**Chains stay short.** A choice may schedule a follow-up, and that follow-up may resolve — two
steps. Longer chains are hard to test and harder to balance.

## Adding a task template

```ts
{
  id: 'task.legal.contract_review',
  titleKey: 'task.legal.contract_review.title',
  descKey: 'task.legal.contract_review.desc',
  departments: ['legal'],
  baseEffort: 6,                 // scaled by level at spawn time
  deadlineRange: [2, 4],         // months, rolled at spawn
  difficulty: 2,                 // 1–3; affects quality, not speed
  weight: 10,
  onComplete: {
    excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
    poor: [{ kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 2 }],
  },
  onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.missed_deadline' }],
}
```

Use `departments: 'any'` for shared work that lands on every desk. Use `minLevel` / `maxLevel` to
retire a template as you climb — but prefer letting `baseEffort` scale automatically over writing
a separate template per level. **Never write department-specific content per level**; that's a 5×5
matrix nobody can fill.

## Adding a language

1. `cp -r src/i18n/en src/i18n/es`
2. Translate the values. Leave the keys and `{placeholders}` alone.
3. Register it in the locale map in `src/i18n/index.tsx`.

Only names and numbers are interpolated (`{name}`, `{amount}`), so no sentence depends on English
grammar for its structure.

## What validation checks

`src/content/validate.ts`, run by `tests/engine/content.test.ts`:

- Every id is unique across the registry
- Every `titleKey`, `bodyKey`, `descKey`, `labelKey` and `textKey` exists in the English dictionary
- Every `spawnTask` template id and `queueEvent` event id refers to something that exists
- Every event has between 2 and 4 choices, and every choice has at least one outcome
- Every outcome weight is greater than 0
- Every department has at least one task template and one event
- Every `endGame` ending id is a real ending
