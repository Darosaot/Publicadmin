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
a separate template per level. **Never write department-specific content per level**; that's a 5×5
matrix nobody can fill.

## Adding a language

1. Get the full key list: `npm run docs:script` writes every string into
   `docs/narrative-script.md`, and `EN_STRINGS` holds them all at runtime.
2. Create `src/i18n/es/` with the same keys mapped to translated values, plus a translated copy of
   `src/i18n/en/ui.ts`.
3. Add the locale to the `locales` map in `src/i18n/index.tsx`.

Only names and numbers are interpolated (`{name}`, `{amount}`), so no sentence depends on English
grammar for its structure.

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
