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
  requiresTeam?: boolean;         minStaffCount?: number;
  minTeamMorale?: number;         maxTeamMorale?: number;
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
a separate template per level. **Never write department-specific content per level**; that's a 5×5
matrix nobody can fill.

### Keeping the five departments comparable

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

## Adding a language

1. Get the full key list: `npm run docs:script` writes every string into
   `docs/narrative-script.md`, and `EN_STRINGS` holds them all at runtime.
2. Create `src/i18n/es/` with the same keys mapped to translated values, plus a translated copy of
   `src/i18n/en/ui.ts`.
3. Add the locale to the `locales` map in `src/i18n/index.tsx`.

Only names and numbers are interpolated (`{name}`, `{amount}`), so no sentence depends on English
grammar for its structure.

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
