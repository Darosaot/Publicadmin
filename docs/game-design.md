# Public Service Story — Game Design Document

> This is the design specification. Every number the engine uses appears here, and every number
> here lives in exactly one place in the code: `src/engine/constants.ts`. If the two ever disagree,
> the code is wrong.

---

## 1. The pitch

You are a public official. The game covers your whole working life, one month at a time, starting
at a desk in a small city council and ending — depending on how you play — in burnout, in quiet
retirement, in disgrace, or in the Council of Ministers.

The central idea is that **competence, ethics and political skill are three separate things**. A
brilliant official with no allies stalls at Head of Unit. A well-connected one with no integrity
rises fast and then a journalist gets a phone call. The game tracks all three and lets you find
out which combination you actually want to play.

Nothing here maps onto a real country's administrative law. The setting is a fictional European
state — Valmara — with the familiar furniture of European public administration: EU-funded
projects, procurement directives, transparency requests, audit authorities, and councillors who
would like a word.

## 2. Core loop

One **turn** is one **month**. A turn runs in four phases:

| Phase | What happens | Who decides |
| --- | --- | --- |
| **Allocation** | Your task board holds active files with deadlines. You distribute effort points across them, plus two personal options: Rest and Networking. | Player |
| **Resolution** | Effort is applied. Completed tasks get a quality roll. Overdue tasks fail. Stress moves. | Engine |
| **Events** | One to three events fire. Each is a short scene with 2–4 choices. Some consequences land immediately; some are scheduled for months later. | Player chooses, engine resolves |
| **Report** | Salary is paid, the month is summarised, reviews and job offers are checked, and the game tests whether your career just ended. | Engine |

Then the board refills and the next month begins.

## 3. Stats

Five stats run 0–100 and are always clamped to that range. Salary is money and has no ceiling.

| Stat | Starts at | What it means | What moves it |
| --- | --- | --- | --- |
| **Reputation** | 20 | Your professional standing outside your own office. This is the stat that gates promotions and job offers. | Task quality, reviews, events; **decays 3% a month** |
| **Performance** | 50 | The rolling quality of your department's actual output. It feeds your reviews, which feed Reputation. | Completed and failed tasks; **reverts 5% a month toward 50** |
| **Political Capital** | 10 | Favours owed to you, and people who take your call. Spent to force decisions through and to survive scandals. | Networking, events; **decays 4% a month** |
| **Integrity** | 70 | Your ethical track record. High integrity closes off shortcuts but protects you when investigators arrive. Low integrity opens shortcuts and quietly accumulates risk. | Events, almost exclusively. Does not decay — a record does not fade |
| **Stress** | 20 | Accumulated load. At 100 you burn out and the game ends. | Every turn (+2), overtime, crises; reduced by Rest |
| **Salary** | €2,100/mo | Your pay. A progress marker, and a reason to take an offer you might otherwise refuse. | Promotions, reviews |

### Why three of them decay

Without decay every stat is a ratchet. A career completes a hundred files, each worth a point or
three of Reputation, and by year five every player is on 100 regardless of how they played — which
makes the promotion thresholds meaningless and the whole climb automatic. The first balance run
confirmed exactly that: 96% of simulated careers reached the top with an average Reputation of 95.

With decay, Reputation and Political Capital measure **how you are doing lately**. They settle
wherever your current work and current allies sustain them, so a threshold of 65 means "sustain
this standard", not "survive long enough". Performance reverts toward the middle in both
directions, which also stops the opposite failure: a bad month lowering Performance, which lowers
quality, which produces more bad months.

**Hidden state.** The engine also tracks *flags* — named booleans set by choices (`owes_favour_ruiz`,
`signed_off_irregular_invoice`, `journalist_has_your_number`). Flags gate later events, so a
decision in month 9 can produce a knock at the door in month 20. Flags are never shown directly;
you find out they existed when they fire.

## 4. Departments

You choose one at the start and keep it for the whole career. It determines which tasks land on
your desk, which events can fire, and which signature crisis is waiting for you.

| Department | Starting adjustment | The work | Signature crisis |
| --- | --- | --- | --- |
| **Legal** | Integrity +6, Political Capital −3 | Contract review, appeals, litigation deadlines, legal opinions | A contract you cleared is annulled and ends up in court |
| **Projects** | Political Capital +6, Integrity −3 | EU-funded project milestones, reporting, partner coordination | An audit finds ineligible expenditure in your flagship project |
| **Finance** | Performance +6, Reputation −3 | Budget cycle, invoices, treasury, closing the year | The year-end lands in deficit and the accounts go under intervention |
| **Procurement** | Reputation +6, Stress +3 | Tenders, evaluation committees, supplier relations | Two bidders in your tender turn out to share an address |
| **Policy** | Political Capital +4, Reputation +2, Performance −2 | Council briefs, reports, public consultations | Your draft leaks before the vote and the public reads it first |

## 5. Tasks

### The board

Your board holds a fixed number of slots (4 at the start, 6 at the top). At the end of each turn it
refills from the task templates available for your department and level. Each active task carries:

- **Required effort** — total points needed to finish it
- **Progress** — points invested so far
- **Deadline** — the turn by which it must be finished
- **Difficulty** — 1, 2 or 3; harder files are harder to do *well*, not slower to do

Required effort is scaled twice. A global multiplier sets how oversubscribed the board is, and a
level term makes the files bigger as you climb:

```
required = round(baseEffort × 1.35 × (1 + 0.08 × (level − 1)))
```

The multiplier is deliberately above 1: across a career it puts roughly 15–25% more work on the
board than there are points to do it with. **A player who can finish everything is never choosing
anything**, and choosing is the game. Simulated careers finish about 89% of their files on time.

### Effort

Each turn you have a pool of effort points determined by your level. You may also switch on
**overtime**, which adds 3 points and 5 stress. Points can go to:

- **Any active task** — 1 point = 1 progress
- **Rest** — 1 point = −3 stress
- **Networking** — 1 point = +2 political capital

Unspent points are simply lost, so the real question every month is not *whether* to spend but
whether this month's fire is worth more than your health or your allies.

### Completion and quality

When a task's progress reaches its required effort, it completes and is scored. The quality score
starts at a baseline and is adjusted:

```
qualityScore = 58
             + min(18, (deadlineTurn − currentTurn) × 6)     // finished early
             + min(16, (progress − required) × 4)            // extra care beyond the minimum
             + (performance − 50) × 0.2                      // your department's general form
             − (difficulty − 1) × 7                          // hard files are hard to nail
             − max(0, stress − 50) × 0.35                    // exhaustion shows in the work
             + random(−12 … +12)
```

The baseline of 58 is set so that finishing an average file on time, with exactly the effort it
needed, is **solid work rather than poor work** — earliness and extra care are what push it to
excellent. Setting it lower produced a death spiral in testing: with a tight board nothing is ever
early, so everything scored poor, which lowered Performance, which lowered quality further.

| Score | Result | Effect |
| --- | --- | --- |
| ≥ 75 | **Excellent** | Performance +4, Reputation +3 |
| 45–74 | **Good** | Performance +2, Reputation +1 |
| < 45 | **Poor** | Performance −2, Reputation −1 |

Some task templates attach extra effects to a given tier — an excellent tender evaluation might
earn political capital; a poor legal opinion might schedule a complaint two months out.

### Failure

A task still unfinished when its deadline passes is removed from the board:

**Performance −3, Reputation −2**, plus whatever that template's failure effects are — most often
a scheduled follow-up event: the audit letter, the angry supplier, the councillor's question.

The direct penalty is deliberately mild, because the board is oversubscribed by design and missing
something occasionally is the normal texture of the job rather than a punishment. The real sting is
in the consequences a missed deadline schedules.

### Stress each turn

```
stressDelta = +2                        // the baseline weight of the job
            + 5 if overtime was used
            − 3 × (points spent on Rest)
            + any event effects
```

Alongside it, the monthly drift described in §3:

```
reputation       −= round(reputation × 0.03)
politicalCapital −= round(politicalCapital × 0.04)
performance      −= round((performance − 50) × 0.05)
```

## 6. Events

Events are the narrative half of the game: a short scene, then 2–4 choices, then an outcome. There
are three kinds, and they are drawn differently on purpose.

| Kind | How it fires | Purpose |
| --- | --- | --- |
| **Random** | Weighted draw from the pool matching your department and level | The texture of the job — the month-to-month friction |
| **Milestone** | Queued explicitly by the career system; never randomly drawn | Guaranteed story beats: first day, arrival at a new post, the finale |
| **Follow-up** | Only reachable when another event or a failed task schedules it | Consequences. This is where past decisions come back |

Each turn the engine assembles up to **3** events in this priority order:

1. Every follow-up scheduled for this turn
2. At most one eligible milestone
3. One random event, plus a second with 35% probability

A random event that fires goes on a **12-turn cooldown**, and events marked `once` never repeat.

### Conditions

The same condition structure gates both whether an event can appear and whether an individual
choice is available to you. Conditions can require: a level range, specific departments, minimum
or maximum values on any stat, flags that must be set, flags that must *not* be set, and a minimum
turn number.

Choices you don't qualify for are **shown but disabled**, with the reason. Seeing the door you
can't open is part of the game — the councillor's offer you can't take because your political
capital is too thin tells you what you're missing.

### Outcomes

A choice can have several weighted outcomes, so the same decision doesn't always land the same way.
Taking the risk usually works. Usually.

## 7. Career

### The ladder

| Level | Post | Administration | Salary | Effort | Slots |
| --- | --- | --- | --- | --- | --- |
| 1 | Administrative Officer | Alderford City Council (pop. 18,000) | €2,100 | 10 | 4 |
| 2 | Senior Officer | Northbridge City Council (pop. 140,000) | €2,900 | 12 | 4 |
| 3 | Head of Unit | Regional Government of Valmara | €3,900 | 14 | 5 |
| 4 | Head of Department | National Agency for Public Investment | €5,200 | 16 | 5 |
| 5 | Director-General | Ministry of Territorial Administration | €6,800 | 18 | 6 |
| — | **Minister** | Government of Valmara | — | — | — |

Minister is not a sixth playable level; it is the ending. Reaching it requires being a
Director-General with Reputation ≥ 88 and Political Capital ≥ 70, which triggers a three-event
confirmation arc you can still lose.

### Requirements to be offered the next post

| To reach | Reputation | Performance | Political Capital | Months in post |
| --- | --- | --- | --- | --- |
| Level 2 | 35 | 50 | — | 8 |
| Level 3 | 50 | 55 | 25 | 10 |
| Level 4 | 65 | 60 | 40 | 12 |
| Level 5 | 78 | 65 | 55 | 12 |

Meeting the requirements does not hand you the job — it makes you *eligible*, and each month the
engine rolls for whether an offer actually materialises:

```
offerChance = min(0.80, 0.35 + (reputation − requiredReputation) × 0.01)
```

Offers appear on the Career screen and **expire after 3 months**. Accepting moves you to the new
administration: new salary, more effort points, more slots, a fresh task board, a wider pool of
events, and an arrival milestone. Your department comes with you.

### Performance reviews

Every **6 months** you are reviewed. The rating comes from your Performance stat, dropped one band
if you failed 3 or more tasks since the last review.

| Performance | Rating | Effect |
| --- | --- | --- |
| ≥ 75 | Outstanding | Reputation +6, salary +3% |
| 55–74 | Solid | Reputation +3, salary +1.5% |
| 40–54 | Adequate | — |
| < 40 | Concerning | Reputation −5 |

## 8. Endings

Checked at the end of every month, in this order — the first one that matches wins.

| Ending | Trigger | Tone |
| --- | --- | --- |
| **Burnout** | Stress reaches 100 | You are signed off sick and do not come back. The work continues without you, which is the part that stings. |
| **Disgrace** | Integrity falls to 8 or below | The file with your signature on it is now evidence. |
| **Dismissed** | Reputation ≤ 10 and Performance ≤ 25 | Not a scandal. Just a quiet conversation about how this isn't working. |
| **Minister** | The confirmation arc succeeds | Three variants depending on how you got there: the Reformer (high integrity), the Operator (high political capital), the Survivor (neither, but you're still standing). |
| **Honoured retirement** | Month 120 with Reputation ≥ 60 | Thirty years of files. A room full of people who mean it. |
| **Quiet retirement** | Month 120 with Reputation < 60 | Thirty years of files. A card, signed by the department. |

## 9. Balance reference

All of these live in `src/engine/constants.ts`.

| Constant | Value |
| --- | --- |
| Turn length | 1 month |
| Maximum campaign length | 120 turns |
| Starting stats | Rep 20, Perf 50, PC 10, Integrity 70, Stress 20 |
| Effort points by level | 10 / 12 / 14 / 16 / 18 |
| Task slots by level | 4 / 4 / 5 / 5 / 6 |
| Overtime | +3 points, +5 stress |
| Rest | −3 stress per point |
| Networking | +2 political capital per point |
| Baseline stress per turn | +2 |
| Task workload multiplier | ×1.35 |
| Task effort level scaling | ×(1 + 0.08 × (level − 1)) |
| Reputation decay | 3% a month |
| Political capital decay | 4% a month |
| Performance reversion | 5% a month toward 50 |
| Quality baseline | 58 |
| Quality thresholds | Excellent ≥ 75, Good ≥ 45 |
| Task failure | Performance −3, Reputation −2 |
| Events per turn | 1 guaranteed, 35% chance of a 2nd, hard cap 3 |
| Random event cooldown | 12 turns |
| Review interval | 6 turns |
| Offer base chance | 35%, +1% per point of reputation above the requirement, cap 80% |
| Offer expiry | 3 turns |

## 10. Measured balance

The numbers above were not guessed. `npm run balance` plays 200 careers — 40 seeds across all five
departments — with a bot that plays about as well as an engaged player on a first run, and prints
the distribution. `tests/engine/autoplay.test.ts` asserts the shape of it so a future change to
`constants.ts` cannot quietly break the game.

Where it currently sits:

| Measure | Value |
| --- | --- |
| Careers reaching Director-General | 42% |
| Careers reaching Head of Unit or above | 96% |
| Careers stuck at the starting post | 1% |
| Files finished on time | 89% |
| Mean Reputation at the end | 45 |
| Mean months survived | 118 of 120 |

Endings, over those 200 careers: quiet retirement 61%, honoured retirement 31%, dismissed 7%,
Minister 2.5%. Burnout and disgrace do not appear, because the balanced bot rests when tired and
does not take bribes — both are reached reliably by the `reckless` and `ruthless` bot strategies,
which exist precisely to prove that an ending is not unreachable. Burnout takes a reckless player
about 9 months; disgrace takes a ruthless one about 20.

Departments are not equally difficult, and that is intentional replay value rather than an
oversight: Policy averages level 4.8 and Procurement 3.0, because Procurement is the department
everyone watches. What matters is that every department is survivable and none is a walkover,
which the test suite checks per department.

## 11. Deliberately out of scope for v1

Sound and music; multiple save slots and save export; Spanish content (the architecture supports it,
the dictionary isn't written yet); difficulty settings; changing department mid-career; named NPCs
with persistent relationship tracking; a budget-management sub-game; achievements.

The two that are worth revisiting first, if this gets a v2, are **named NPCs** (a recurring boss,
rival and mentor whose opinion of you is tracked) and **Spanish**.
