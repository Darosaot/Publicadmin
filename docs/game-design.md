# Public Service Story — Game Design Document

> This is the design specification. Every number the engine uses appears here, and every number
> here lives in exactly one place in the code: `src/engine/constants.ts`. If the two ever disagree,
> the code is wrong.

---

## 1. The pitch

You are a public official. The game covers your whole working life, a decision at a time, starting
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

One **turn** is one **decision cycle**, and a cycle covers more calendar time the more senior the
post: a month at a junior desk, two at Senior Officer, a term as Head of Unit, half a year in a
directorate. A turn runs in four phases:

| Phase | What happens | Who decides |
| --- | --- | --- |
| **Allocation** | Your task board holds active files with deadlines. You distribute effort points across them, plus two personal options: Rest and Networking. | Player |
| **Resolution** | Effort is applied. Completed tasks get a quality roll. Overdue tasks fail. Stress moves. | Engine |
| **Events** | One to three events fire. Each is a short scene with 2–4 choices. Some consequences land immediately; some are scheduled for months later. | Player chooses, engine resolves |
| **Report** | Salary is paid, the month is summarised, reviews and job offers are checked, and the game tests whether your career just ended. | Engine |

Then the board refills and the next cycle begins.

### Why a cycle is not always a month

The game covers a working life, and the writing has always said so — the retirement endings are
titled "Thirty years", the Minister arc opens "twenty-two years ago you were three days into a job
in Alderford". For a long time none of it was true: at one month a turn, 120 turns was a decade.

Raising the turn count to 360 would have made it literal at the cost of three times the clicking,
for a stretch of career where the interesting decisions are not three times as many. So the clock
was split instead. `turn` counts decisions; `calendarMonth` counts elapsed time; each level carries
a `monthsPerTurn`:

| Level | Post | Months per cycle |
| --- | --- | --- |
| 1 | Administrative Officer | 1 |
| 2 | Senior Officer | 2 |
| 3 | Head of Unit | 4 |
| 4 | Head of Department | 6 |
| 5 | Director-General | 6 |

Those numbers are not aesthetic. Simulated careers spend about 32 turns at level 1 and 41 at level
2 — most of a career is early, because most careers plateau — and the figures above are what that
distribution needs to land at **28.9 mean years of service**, which `npm run balance` reports and
`tests/engine/autoplay.test.ts` pins between 24 and 36.

It also says something true. A junior desk turns over monthly. A Director-General does not re-plan
a directorate every four weeks, and their files genuinely run for years rather than months.

**Deadlines stay in cycles**, which is why a task's `deadlineRange: [2, 4]` is two to four months
at the bottom of the ladder and a year to two years at the top. That is the intended reading.

Content that depends on how long ago something happened uses `minYearsElapsed` rather than
`minTurn` — the milestone about "a woman you have not seen in twenty years" waits for twenty
actual years.

## 3. Stats

Five stats run 0–100 and are always clamped to that range. Salary is money and has no ceiling.

| Stat | Starts at | What it means | What moves it |
| --- | --- | --- | --- |
| **Reputation** | 20 | Your professional standing outside your own office. This is the stat that gates promotions and job offers. | Task quality, reviews, events; **decays 4.6% a cycle** |
| **Performance** | 50 | The rolling quality of your department's actual output. It feeds your reviews, which feed Reputation. | Completed and failed tasks; **reverts 5% a cycle toward 50** |
| **Political Capital** | 10 | Favours owed to you, and people who take your call. Spent to force decisions through and to survive scandals. | Networking, events; **decays 4.4% a cycle** |
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

**Hidden state.** The engine also tracks *flags* — named values set by choices
(`accepted_supplier_gift`, `journalist_has_your_number`, `holds_leverage`). Flags gate later
events, so a decision in your second year can produce a knock at the door in your twelfth. They are
never shown directly; you find out they existed when they fire.

A flag may be a boolean ("this happened") or a number, for the things that were always really a
quantity — how much someone owes you, how warm a relationship is. Both read as truthy, so
`requiredFlags` works on either, and `minFlag` / `maxFlag` compare numerically with an unset flag
reading as 0.

**A flag nothing reads is a dropped thread**, and the corpus had twenty-five of them: authored
consequence that no player could ever encounter, because the payoff had never been written. Content
validation now fails on any flag that is set but never gated on, and the *Reckonings* pool
(`src/content/events/reckonings.ts`) is where those twenty-five promises are kept — seventeen
events, every one of them unreachable unless you earned it, most waiting several years before they
arrive.

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

Your board holds a fixed number of slots (4 at the start, 8 at the top). At the end of each turn it
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
anything**, and choosing is the game. Simulated careers finish about 95% of their files on time — but the near-misses are where the
decisions are, and a senior desk is only survivable because a unit is carrying most of it.

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

**Credit is scaled by the size of the board.** A Director-General with eight slots and a unit of
eight finishes far more files a month than a level-1 officer, and if each paid the same Reputation
the top of the ladder would saturate at 100 no matter how it was played. So the per-file credit is
multiplied by `4 / taskSlots`: a director's standing is the record of the unit, not the sum of
forty signatures.

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
reputation       −= round(reputation × 0.046)
politicalCapital −= round(politicalCapital × 0.044)
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

### The corpus

182 events and 62 task templates. The events break down as 151 random, 21 follow-ups and 10
milestones, and the random pool splits roughly evenly between work that could happen in any
department and work that is specific to one of the five:

| Pool | Events | What it covers |
| --- | --- | --- |
| Common | 38 | The building, the institution, your own life in it |
| Reckonings | 17 | Gated entirely on flags: the things that come back |
| Department | 70 | 14 each for legal, projects, finance, procurement and policy |
| Management | 12 | Only reachable once you have a unit |
| Leadership | 14 | Only from level 4, where the decisions are institutional |
| Milestones | 10 | The guaranteed beats, including the confirmation arc |
| Follow-ups | 21 | Consequences, none of them ever drawn at random |

Because a follow-up can only arrive if something scheduled it, an unscheduled one is content no
player can ever reach. A test walks every choice, outcome and task result in the corpus and fails
if any follow-up has nothing that leads to it.

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

An individual outcome can also carry its own conditions, which is how a decision made years earlier
changes what a later scene can do. When the contract you quietly noticed a flaw in is annulled, the
outcome where you produce the note you wrote at the time is only available if you actually wrote
one — otherwise the same choice resolves into the version where there is no note, and the only
other person in that conversation remembers it differently. Every choice keeps at least one
unconditional outcome, so a decision can never dead-end.

## 7. Career

### The ladder

| Level | Post | Administration | Salary | Effort | Slots | Unit | Budget |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Administrative Officer | Alderford City Council (pop. 18,000) | €2,100 | 10 | 4 | — | — |
| 2 | Senior Officer | Northbridge City Council (pop. 140,000) | €2,900 | 12 | 4 | — | — |
| 3 | Head of Unit | Regional Government of Valmara | €3,900 | 14 | 6 | 4 | €11,500/mo |
| 4 | Head of Department | National Agency for Public Investment | €5,200 | 16 | 7 | 6 | €18,500/mo |
| 5 | Director-General | Ministry of Territorial Administration | €6,800 | 18 | 8 | 8 | €26,000/mo |
| — | **Minister** | Government of Valmara | — | — | — | — | — |

Levels 3 to 5 come with an establishment and a budget line. **You arrive one post short**, because
you always do.

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

## 8. The office

From Head of Unit upward you stop being the person who does the work and become the person who
decides who does it. The Team screen appears at level 3 and does not go away.

### Your people

Each member of your unit is a **junior**, **officer** or **senior**, with a **skill** and a
**morale** score, a salary, and a length of service. What they produce in a month is:

```
output = base(grade) × (0.6 + 0.8 × skill/100) × (0.7 + 0.6 × morale/100)
```

Base output is 3 / 5 / 7. A capable, well-treated senior therefore produces about ten points of
work a month; a demoralised junior produces two. **The spread is the point** — a manager whose
people are unhappy is doing the whole board personally.

### Delegation

Handing a file to someone costs you **1 effort point** to brief them, and they carry it from then
on. The quality roll on a delegated file is judged on *their* ability rather than yours:

```
qualityBase = skill × 0.75 + morale × 0.25
```

So delegation is not free output. Give a hard file to someone who cannot do it and it comes back
poor, with your name on it — and a failed file costs the person carrying it 6 morale, which is how
a unit starts to unravel.

### Attention

Three things you can spend a month's effort on instead of files:

| Action | Cost | Effect |
| --- | --- | --- |
| **One-to-one** | 1 point | +9 morale for that person |
| **Coaching** | 2 points | +4 skill, +3 morale |
| **Recruiting** | 2 points | Advances an open vacancy toward filling |

Morale drifts down 1 a month on its own, and below **30** people start looking for other jobs and
leave. Skill creeps up about 2 a year from experience alone.

### Money

Your unit has a **monthly budget**. Salaries come out of it automatically; what is left is
discretionary, and you can spend it on **training** (€1,500 for +6 skill) or **agency cover**
(€3,200 for +2 effort points this month, up to three at once — money for time, at a poor rate).

The budget year is judged as a whole, and **both directions cost you**:

- Overspending by more than 4%: **Reputation −6**
- Underspending by more than 12%: **Reputation −3**, and next year's allocation is cut 10%

Returning money you were given is not thrift; it is evidence you did not need it. Anyone who has
worked in a public body in December knows exactly why this is in the game.

### Hiring

You arrive one post below your establishment. Filling it takes 2 / 3 / 4 months for a junior /
officer / senior, plus 2 effort points a month spent pushing it along, and then you get a person
with rolled skill and no knowledge of your files.

## 9. Endings

Checked at the end of every month, in this order — the first one that matches wins.

| Ending | Trigger | Tone |
| --- | --- | --- |
| **Burnout** | Stress reaches 100 | You are signed off sick and do not come back. The work continues without you, which is the part that stings. |
| **Disgrace** | Integrity falls to 8 or below | The file with your signature on it is now evidence. |
| **Dismissed** | Reputation ≤ 10 and Performance ≤ 25 | Not a scandal. Just a quiet conversation about how this isn't working. |
| **Minister** | The confirmation arc succeeds | Three variants depending on how you got there: the Reformer (high integrity), the Operator (high political capital), the Survivor (neither, but you're still standing). |
| **Honoured retirement** | Cycle 120 with Reputation ≥ 60 | Thirty years of files. A room full of people who mean it. |
| **Quiet retirement** | Cycle 120 with Reputation < 60 | Thirty years of files. A card, signed by the department. |

## 10. Balance reference

All of these live in `src/engine/constants.ts`.

| Constant | Value |
| --- | --- |
| Turn length | 1 decision cycle: 1 / 2 / 4 / 6 / 6 months by level |
| Maximum campaign length | 120 turns, about 29 years |
| Starting stats | Rep 20, Perf 50, PC 10, Integrity 70, Stress 20 |
| Effort points by level | 10 / 12 / 14 / 16 / 18 |
| Task slots by level | 4 / 4 / 6 / 7 / 8 |
| Establishment by level | — / — / 4 / 6 / 8 |
| Unit budget by level | — / — / €11,500 / €18,500 / €26,000 a month |
| Overtime | +3 points, +5 stress |
| Rest | −3 stress per point |
| Networking | +2 political capital per point |
| Baseline stress per turn | +2 |
| Task workload multiplier | ×1.35 |
| Task effort level scaling | ×(1 + 0.08 × (level − 1)) |
| Reputation decay | 4.6% a cycle |
| Political capital decay | 4.4% a cycle |
| Performance reversion | 5% a cycle toward 50 |
| Quality baseline | 58 |
| Quality thresholds | Excellent ≥ 75, Good ≥ 45 |
| Task failure | Performance −3, Reputation −2 |
| Per-file credit scaling | × (4 ÷ task slots) |
| Staff base output | 3 / 5 / 7 by grade |
| Staff salaries | €1,800 / €2,600 / €3,600 a month |
| Delegation / one-to-one / coaching / recruiting | 1 / 1 / 2 / 2 effort points |
| One-to-one, coaching, training | +9 morale / +4 skill +3 morale / +6 skill for €1,500 |
| Morale drift | −1 a month; people leave below 30 |
| Agency cover | €3,200 for +2 effort, max 3 a month |
| Budget verdict | over 4% → Rep −6; under 12% → Rep −3 and a 10% cut |
| Events per turn | 1 guaranteed, 35% chance of a 2nd, hard cap 3 |
| Random event cooldown | 12 turns |
| Review interval | 6 turns |
| Offer base chance | 35%, +1% per point of reputation above the requirement, cap 80% |
| Offer expiry | 3 turns |

## 11. Measured balance

The numbers above were not guessed. `npm run balance` plays 200 careers — 40 seeds across all five
departments — with a bot that plays about as well as an engaged player on a first run, and prints
the distribution. `tests/engine/autoplay.test.ts` asserts the shape of it so a future change to
`constants.ts` or to the content cannot quietly break the game.

Where it currently sits:

| Measure | Value |
| --- | --- |
| Mean years of service | 28.9 |
| Careers reaching Director-General | 58% |
| Careers reaching Head of Unit or above | 82% |
| Careers stuck at the starting post | 3% |
| Files finished on time | 95% |
| Mean level reached | 4.1 |
| Mean Reputation at the end | 78 |
| Mean months survived | 119 of 120 |

Endings, over those 200 careers: honoured retirement 72%, quiet retirement 21%, Minister 7.5%.
Burnout, disgrace and dismissal do not appear, because the balanced bot rests when tired and does
not take bribes — the first two are reached reliably by the `reckless` and `ruthless` bot
strategies, which exist precisely to prove that an ending is not unreachable. Burnout takes a
reckless player about 9 months; disgrace takes a ruthless one about 21.

### Two things the simulation caught

**Growing the corpus moves the balance.** The bot picks uniformly among the options open to it, so
the whole game is tuned against the *average* option in the pool. Adding 71 events without checking
that average dropped careers reaching the top from 57% to 26% — not because any new event was
harsh, but because the new ones were slightly less generous than the ones they diluted. The decay
rates were re-derived afterwards: both stats settle at `monthly gain ÷ decay rate`, so a corpus
whose average gain falls needs a lower rate to sit in the same place.

**The five departments had drifted a long way apart.** Once each had its own task board and its own
event pool, a Policy career averaged level 4.8 and a Procurement one 3.0 — a gap the player could
neither see nor do anything about. The cause was almost entirely the task boards: Procurement's
files had the tightest deadlines in the game, which cost completions, which cost Performance, which
cost quality, which compounded over thirty years. The boards were levelled (comparable mean effort,
difficulty and deadline at every level) and the departments now sit between 4.0 and 4.3. A test
pins the spread so the next department to get new content cannot quietly run away from the others.

## 12. Deliberately out of scope for v1

Sound and music; multiple save slots and save export; Spanish content (the architecture supports it,
the dictionary isn't written yet); difficulty settings; changing department mid-career; named NPCs
with persistent relationship tracking beyond your own unit; achievements.

The two that are worth revisiting first, if this gets a v2, are **named NPCs outside your unit** (a
recurring boss, rival and mentor whose opinion of you is tracked the way your staff's morale
already is) and **Spanish**.

### Saving

Not out of scope, and not a feature you have to think about: the game writes to `localStorage`
after every action, so closing the tab and coming back resumes exactly where you were — including
the random stream, because the RNG cursor is part of the saved state rather than a global. A save
carries a version number, unknown content ids are pruned on load rather than crashing, and there is
one slot.
