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

| Tier | Months per cycle |
| --- | --- |
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 | 6 |
| 5 | 6 |

The political track runs faster — three or four months a cycle rather than six — because a private
office genuinely does work in weeks.

Those numbers are not aesthetic. Simulated careers spend about 32 turns at level 1 and 41 at level
2 — most of a career is early, because most careers plateau — and the figures above are what that
distribution needs to land at **28.9 mean years of service**, which `npm run balance` reports and
`tests/engine/autoplay.test.ts` pins between 24 and 36.

It also says something true. A junior desk turns over monthly. A Director-General does not re-plan
a directorate every four weeks, and their files genuinely run for years rather than months.

**Deadlines stay in cycles**, which is why a task's `deadlineRange: [2, 4]` is two to four months
at the bottom of the tree and a year to two years at the top. That is the intended reading.

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

## 3a. The cast

Eight people recur across a whole career, and what they think of you decides what they do when
they next appear.

| Person | Who they are |
| --- | --- |
| **Elena Vásquez** | Joined the same week you did. The control group for your career. |
| **Rufus Halloran** | Your first director. Everything you believe about how this is done came from him, including the parts he got wrong. |
| **Marta Oyelaran** | The union representative — the only person who will tell you the truth about your own unit. |
| **Tomas Berg** | A journalist. Local paper, then the nationals. |
| **Inés Reyes** | A councillor who becomes rather more. |
| **Sofia Lindqvist** | The external auditor, who remembers every file of yours she has ever read. |
| **Jozef Nowak** | A supplier's account manager, and genuinely good company. |
| **Aurelia Kess** | The trainee who found something, and what you did about it. |

Each has an introduction, a reappearance in the middle of a career, and a late scene where the
relationship decides the outcome. In simulation, better than 84% of careers meet each of them, and
a career contains about **15 scenes involving somebody it already knows**.

### How they are stored, and why that matters

A person is **content, not state**. Names, roles and every line they speak are fixed prose written
at authoring time. The only thing a save carries is a number, kept in `flags` under `rel.<id>`.

> This section used to say the cast *had* to be authored prose "because event text cannot
> interpolate anything". That was wrong, and it went unchallenged for several releases.
> `translate` has interpolated `{name}` since the first commit and even translates a parameter
> whose value is itself a key; the event render path simply never passed any parameters. Threading
> a bag through `EventModal` was four lines, and it is what lets an event name a former colleague
> (§ 8b). The cast is still authored prose, but now because that is the better way to write a
> recurring character, not because the engine forbade the alternative.

Building the cast on flags rather than on a new `GameState` array was a deliberate choice and not
just an economy. `cloneState` hand-enumerates every mutable field and `applyEffects` mutates in
place, so a new object or array on the state would fall through the spread as a shared reference
and silently corrupt the pre-effect snapshot, with nothing to catch it at compile time. `flags` was
already cloned. This is why the flag type was widened to `boolean | number` first.

That trap is now a **tested invariant** rather than folklore. `tests/engine/effects.test.ts` builds
a fully populated `GameState`, walks every key, and fails with the field name if any object or
array survives the clone by reference. It has been checked by deletion twice — once when it was
written and once when `initiatives` was added — because a guard that has never fired is only an
assertion about the author's confidence.

**Standing does not decay.** Reputation and political capital fade because they measure how you are
doing lately; what a particular person thinks of you is not that. Elena remembers whose name went
on the correction whether or not you have spoken since — and a cast that forgets is not a cast.

The **People screen** shows who you know and how you stand, described rather than scored: putting a
figure on the page would invite optimising a relationship instead of having one.

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
| **Inspection** | Integrity +8, Political Capital −5 | On-site visits, findings, referrals, thematic reviews | A body you graded well turns out to have been managing its figures |
| **Social services** | Integrity +4, Stress +6, Reputation −2 | Assessments, placement panels, safeguarding, statutory reviews | A case you closed comes back, and the review is public |

The last two were added after the five above, and each was chosen because it breaks the loop in a
different direction rather than adding a third flavour of the same desk.

**Inspection** is the desk that arrives somewhere else. The subject of the work is another
administration, staffed by people doing the job the player has done, which lets the game look at
its own world from the other side of the table. Its failure mode is not a missed deadline in your
own building — it is a body that carries on doing the thing for another two years because nobody
wrote it down in time. It is also the oversight track's home department, so taking that fork
changes what is on the desk and not only the title above it.

Its economy is deliberately not the others'. Good inspection is admired by a small audience and
resented by a large one, so the pool pays in integrity and charges political capital, and the
reputation payouts are the thinnest of any department. That is the fix for the first balance pass,
where it came in as an outright walkover (see §11).

**Social services** is the desk where the file is a person. Mechanically this shows up in one
place and it is the important one: `onFail` here is weighted toward integrity and stress rather
than performance, because the cost of not getting to something is not mainly professional. It is
the only department where doing badly hurts you in a way that has nothing to do with your career.

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

241 events and 82 task templates. The events break down as 205 random, 21 follow-ups and 15
milestones, and the random pool splits roughly evenly between work that could happen in any
department and work that is specific to one of the seven:

| Pool | Events | What it covers |
| --- | --- | --- |
| Common | 38 | The building, the institution, your own life in it |
| Cast | 24 | Eight people who recur, and remember |
| Reckonings | 17 | Gated entirely on flags: the things that come back |
| Tracks | 8 | Leaving the ladder, and the top of each branch |
| Department | 98 | 14 each, across all seven departments |
| Management | 12 | Only reachable once you have a unit |
| Leadership | 14 | Only from level 4, where the decisions are institutional |
| Milestones | 10 | The guaranteed beats, including the confirmation arc |
| Follow-ups | 21 | Consequences, none of them ever drawn at random |

The department row is 14 each rather than "roughly 14 each" on purpose. A test asserts every
department has at least 12 of its own events, because the alternative is a department that is
nominally supported and actually plays as the common pool with a different name on the title
screen. The same guard exists on the task side: 10 department-specific templates each, plus 12
shared ones, banded so that no tier is ever short of eligible work.

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

Everyone starts at the same desk in Alderford. After that it forks, and posts sharing a **tier**
are alternatives rather than steps.

| Tier | Line (management) | Expert (specialist) | Political | Oversight |
| --- | --- | --- | --- | --- |
| 1 | Administrative Officer, Alderford | — | — | — |
| 2 | Senior Officer, Northbridge | — | — | Case Officer, Audit Authority |
| 3 | Head of Unit, the Region | Principal Specialist | Adviser, private office | Senior Auditor |
| 4 | Head of Department, the Agency | Chief Adviser | Head of the Private Office | Director of Inspection |
| 5 | Director-General, the Ministry | Chief Adviser to the Government | Special Adviser to the Cabinet | Ombudsman |
| — | **Minister** | — | — | — |

The four branches are meant to be different games, not four labels on the same one:

- **Line** is what the game already was: more people, more budget, more institution. A
  Director-General runs eight staff and €26,000 a month.
- **Expert** trades the unit away entirely. No staff, no budget, but a Chief Adviser to the
  Government has **29 effort points against four files** — and because per-file credit scales as
  `4 / taskSlots`, a short board pays far better per file. That is not a consolation: the first
  balance pass gave the specialist posts more files and made the track measurably *worse*.
- **Political** is fast, well paid and has no tenure. Cycles are three to four months rather than
  six because a private office works in weeks, and an event arc can end your post when your
  principal falls.
- **Oversight** turns the game around: you inspect the administrations the other three work inside.
  Its entry terms ask for reputation and performance and **never for political capital**, which is
  the mechanical statement of what the branch is for.

Tier 3 and up come with an establishment and a budget line — except on the expert track, where
there is deliberately none. **You arrive one post short**, because you always do.

### Edges, not rungs

Entry terms belong to the **move**, not to the destination: the same post is reachable from
different places on different terms, and a Head of Unit reaching the Agency is not doing the same
thing as a Senior Auditor reaching it. A move marked *sideways* is a step across rather than up,
and is exempt from the rule that a promotion must pay more — stepping off the line track onto the
expert one costs money, which is the point.

Each cycle the engine walks every edge out of your current post and rolls each one separately, so
a fork arrives as a real choice on the career screen. Only one new offer is created per cycle
though: being handed four posts in a month would read as a lottery rather than a career.

Minister is not a sixth playable tier; it is the ending. Reaching it requires being at tier 5 —
on any branch — with Reputation ≥ 88 and Political Capital ≥ 70, which triggers a three-event
confirmation arc you can still lose. In practice the political track gets there most easily and
the oversight track almost never, which is correct.

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

## 8a. Initiatives — the verb the game was missing

Everything else in the game **arrives**. Files refill by weight, events fire by condition, offers
appear when a die says so. An initiative is the one thing the player *starts*.

| | |
| --- | --- |
| Where it lives | `GameState.initiatives`, mirroring `tasks` |
| What it remembers | `init.done.<id>` / `init.lapsed.<id>` in `flags`, after the record is dropped |
| Cost | effort from the same monthly budget as the board |
| Concurrency | 1 below tier 3, 2 at and above |
| Per-cycle ceiling | `ceil(required / minCycles)` |
| Death | `INITIATIVE_LAPSE_CYCLES` (3) cycles with nothing put in; progress forfeit |

**The state is a hybrid on purpose.** The live record is first-class because it has a progress bar
and a delegate; the permanent memory is a flag. That split gates follow-on content for free
through `requiredFlags`, keeps a thirty-year save from carrying an archive of forty finished
projects, and leaves `pruneUnknownContent` one small list to clean.

**`minCycles` exists because the obvious defeat is otherwise available**: bank one quiet month,
dump twenty points, collect the payoff. Institutions do not move at the speed of your calendar.

**Payoffs are in kind, and `validate.ts` enforces it.** Offers key off reputation and reputation
decays 4.6% a month, so an initiative paying a lump of it would convert hoarded effort straight
into promotion velocity — the one payoff shape that makes initiatives dominant rather than a
choice. They pay in body condition, standing, flags and unlocked content. A reputation payoff
above 4 fails the build.

### What the balance sweep taught, in order

Three bot policies were wrong before one was right, and the sequence is the actual finding:

1. **Funding them before the board** — principled-sounding, and it ended careers at year fourteen
   on tier two. At tier one the board already wants more than the month holds.
2. **Restarting anything dropped** — 1,373 lapses against 343 completions across 84 careers.
   That is churn measured as commitment.
3. **Starting one below tier three** — starves every time. A unit to delegate to, or the expert
   track's larger personal budget, is what makes an undertaking affordable.

The third is the design finding hiding in the balance data: initiatives are the management layer,
arrived at from the other direction.

---

## 8b. The country

Fourteen named institutions with a condition (how well they are actually run), a standing (how they
regard you) and a drift (where they go on their own).

Stored in `flags` as **deviation from a baseline that lives in content**. `flagValue` reads an
unset flag as 0, so "nobody has touched this place" is exactly what 0 should mean — which is why
the country shipped with **no save migration, no clone edit and no new `Condition` surface**.

Two deliberate omissions:

- **No mean reversion.** An earlier draft pulled bodies back toward baseline so improvements
  decayed without maintenance. It simulates entropy nicely and plays terribly: the one thing a
  thirty-year career should leave is a mark, and a mark that fades is a mark you did not make.
  Places get worse on their own; they get better only because somebody did something.
- **No RNG.** Drift is a property of the institution. Making it random would mean two careers on
  the same seed could not be compared, which is the entire basis of the balance harness.

Drift runs in `beginNextTurn` scaled by `monthsPerTurn`, so a Director-General's cycle moves the
country half a year and a junior's moves it one month.

**Decay decelerates; improvement does not.** A place falling at −0.5 a month loses seventeen points
a decade, and over a forty-three-year career that outruns every rescue chain in the game — the
first version had Eastmoor fall 34 → 4 while the initiatives aimed at it topped out at +23, so the
content was unwinnable by construction and nothing said so. `decay()` therefore scales a body's
drift from 1 at its founding condition to 0 at `DRIFT_FLOOR`: an institution that has already lost
most of what it had has less left to lose. Upward drift is somebody else actively improving the
place and has no reason to slow down, so it is left alone.

Because deceleration is path-dependent, `driftWorld` steps **one month at a time** rather than
multiplying by `monthsPerTurn`. Otherwise a Director-General's six-month cycle would decay a place
further than six junior months, and the country would move at a speed that depended on the player's
rank.

### Attribution, not net movement

`contributionTo(state, registry, bodyId)` counts only what the player's **finished initiatives**
paid into a body's condition flag. The epilogue's "places you changed" is built on it.

The obvious implementation — list every body more than five points from its baseline — is wrong,
and shipped once. After forty-three years of drift that is most of the country, so a career that
had worked on two institutions was shown eight, six of them labelled "worse than you found it" for
decaying on their own while the player was somewhere else. It blamed people for entropy and called
it their record. It also *dropped* a place the player had genuinely rescued, because the rescue and
the drift had very nearly cancelled out.

The three outcomes the screen can report, and why the middle one matters most:

| Condition | Reads |
| --- | --- |
| contributed < 0 | left it worse than you found it |
| net ≥ 0 | left it better |
| contributed > 0, net < 0 | *still falling — N points slower for your work* |

The third is the honest and most common outcome of one career against thirty years of neglect. The
work landed and the place still ended below where it started. Reporting that as failure would be a
lie in the other direction.

**Discovery.** Bodies on your own department's beat are known from month one — dealing with them is
the job. Everything else has to be gone and looked at, which is what the `look → fix → finish`
initiative chains are for: you cannot work on somewhere you have never been, and you cannot finish
the job somewhere that has not started moving and does not yet trust you.

---

## 8c. Standing directives

Three questions every public manager answers whether or not they say so out loud. Set once, held
until changed, stored as a numeric flag per directive (0 undecided, 1 or 2 for a pole).

| Directive | Pole 1 | Pole 2 | Lever |
| --- | --- | --- | --- |
| Pressure | Take it yourself | Pass it down | ±1 your stress, ∓1 staff morale, monthly |
| Rigour | Document everything | Move fast | ±3 quality, ∓1 effort per file |
| Recruitment | Hire for potential | Hire for experience | ∓8 skill, ±6 morale on arrival |

Every hook is a small multiple of one helper that names the pole which should read positive, rather
than negating a shared result. That makes the poles symmetrical **by construction** — a directive
whose cost side is quietly also a benefit cannot be written — and there is a test asserting it.

**Pressure is inert without a unit**, and the balance sweep is why. Applied from month one it was
forty months of standing cost with nothing on the other side, and careers ended nine years early.
You cannot absorb your people's pressure when you have no people; the fix and the fiction agree.

---

## 8d. The office that lasts

Until v6 every post change destroyed the unit with one log line *after* the fact, which is not
notice.

- **You may bring two people**, intact — skill, morale and tenure. They fill establishment slots
  rather than adding to them.
- **Everybody else joins `GameState.alumni`**, capped at 12 and oldest-dropped. A save-size bound,
  not a simulation one, and roughly the number of former colleagues from a thirty-year career whose
  name a player could place.
- **Regard is derived from morale at departure** rather than tracked separately. How somebody felt
  about a job when they left it *is* what they say about you afterwards, and a second number would
  only drift out of step with the first.
- **Promotion from within** finally calls `promoteStaff`, which had existed unused since the office
  landed — and produces the `'promoted_away'` departure reason `TeamReport` had always declared.
  The other half of it is people good enough to have options leaving when the job stops being worth
  having: skill gives them the option, morale decides whether they use it.
- **`previewPostChange`** is pure and separate from `acceptOffer`, because the player is entitled
  to know before they decide.
- **The expert fork gets a scene.** Taking a post with no unit hands your whole office to somebody
  else; that used to be one log line after the fact. `setupTeamForPost` now sets
  `handed_over_unit` and content owns the meeting where you introduce your people to your
  successor — the engine states a fact, content decides what it means, the same arrangement
  `minister_track` has always used.

Event prose can name one of them, via `alum.spotlight` — a **1-based** index into `alumni`. The
1-based part is load-bearing: an unset flag reads as 0, so a 0-based index would make "the first
alumnus" and "nobody" the same value.

An event opts in with `namesAlumnus: 'warm' | 'cold'`, which both gates it on the roster being
non-empty and tells `drawEvents` which end to aim at. Eight events use it; they fire around ninety
times across seventy simulated careers.

> The first version of all this shipped with the machinery and **no content using it** — the
> spotlight, the param, the helpers, `nowAt`, all unreferenced, in a repository whose own content
> guide opens the corresponding section by describing twenty-five write-only flags as "a great deal
> of consequence no player could reach". Nothing in the build objected, because the guardrail that
> would have objected was one of three named in the plan and never written. `validate.ts` now
> refuses a corpus in which nothing names anybody, and `autoplay.test.ts` refuses one in which the
> events exist and never fire.

---

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
| Effort points, line track | 10 / 12 / 14 / 16 / 18 |
| Effort points, expert track | — / — / 21 / 25 / 29 |
| Task slots, line track | 4 / 4 / 6 / 7 / 8 |
| Task slots, expert track | — / — / 4 / 4 / 4 |
| Establishment, line track | — / — / 4 / 6 / 8 |
| Unit budget, line track | — / — / €11,500 / €18,500 / €26,000 a month |
| Posts in the tree | 15 across 4 tracks |
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

The numbers above were not guessed. `npm run balance` plays 280 careers — 40 seeds across all seven
departments — with a bot that plays about as well as an engaged player on a first run, and prints
the distribution. `tests/engine/autoplay.test.ts` asserts the shape of it so a future change to
`constants.ts` or to the content cannot quietly break the game.

Where it currently sits:

| Measure | Value |
| --- | --- |
| Mean years of service | 28.8 |
| Careers reaching a tier-5 post | 29% |
| Careers reaching tier 3 or above | 96% |
| Careers stuck at the starting post | 0.7% |
| Mean level, by track | line 4.4, expert 3.7, political 4.0, oversight 4.3 |
| Mean level, by department | 3.9 to 4.3 — a spread of 0.4 |
| Files finished on time | 98% |
| Initiatives started / finished, per career | 9.9 / 4.9 |
| Mean level reached | 4.1 |
| Mean Reputation at the end | 62 |
| Mean cycles survived | 118 of 120 |

The report also prints the **A side**: the same seeds played with initiatives switched off, which
is literally the game as it was before they existed. Level 4.2 against 4.1, 29.2 years against
28.8, reputation 64.9 against 62.0. Initiatives cost a career a little and are not the way to get
promoted, which is what "a choice rather than a tax or a dominant strategy" has to mean
numerically. Absolute bands could not have told those apart from any of the other tuning in the
same releases.

**One guardrail was rewritten rather than relaxed.** "The board must be tight enough that something
has to give" measured file completion alone, and sat exactly on its own bound the moment
promotion-from-within landed and the bot began running better units. That is the guardrail having
been written when the board was the only place pressure could show. It now asks the real question
over both channels: across a whole career, is there anything the player did not get to? Over 90% of
careers must fail a file or drop an initiative.

Endings, over those 280 careers: honoured retirement 50%, quiet retirement 46%, Minister 2.5%.
Burnout, disgrace and dismissal do not appear, because the balanced bot rests when tired and does
not take bribes — the first two are reached reliably by the `reckless` and `ruthless` bot
strategies, which exist precisely to prove that an ending is not unreachable. Burnout takes a
reckless player about 7 months; disgrace takes a ruthless one about 26.

The per-track line is the one to watch when adding content, and it needs a bot that *wants* a
particular branch — `preferredTrack` exists for exactly this. Without it the bot chases salary,
takes the political fork every time, and the report prints the line track four times under four
headings while looking perfectly healthy. There is now a test that the four rows genuinely differ,
because a guardrail that measures nothing is worse than no guardrail: it reads as green.

The "stayed on it" column is the honest part of that table. The expert and political tracks hold
85% and 78% of the bots that set out to walk them, because those forks are not always offered and
a bot that is never offered its branch takes what it is given. Oversight holds 96% now that
inspection exists as its home department — before that it was a title with no desk behind it.

### Two things the simulation caught

**Growing the corpus moves the balance.** The bot picks uniformly among the options open to it, so
the whole game is tuned against the *average* option in the pool. Adding 71 events without checking
that average dropped careers reaching the top from 57% to 26% — not because any new event was
harsh, but because the new ones were slightly less generous than the ones they diluted. The decay
rates were re-derived afterwards: both stats settle at `monthly gain ÷ decay rate`, so a corpus
whose average gain falls needs a lower rate to sit in the same place.

**The departments had drifted a long way apart.** Once each had its own task board and its own
event pool, a Policy career averaged level 4.8 and a Procurement one 3.0 — a gap the player could
neither see nor do anything about. The cause was almost entirely the task boards: Procurement's
files had the tightest deadlines in the game, which cost completions, which cost Performance, which
cost quality, which compounded over thirty years. The boards were levelled (comparable mean effort,
difficulty and deadline at every level) and the departments now sit between 3.9 and 4.5. A test
pins the spread so the next department to get new content cannot quietly run away from the others.

That test earned its keep twice. It caught Procurement the first time, and it caught **Inspection**
the second: the department shipped as an outright walkover at mean level 5.0, every simulated
career topping out. The task board was not the problem — the event pool was paying reputation for
work that in life makes enemies. An inspectorate that grades a body honestly under ministerial
pressure does not become popular for it. Nine reputation payouts were trimmed toward integrity and
political-capital costs, three task difficulties went up, and it came down to 4.5. The fix was a
content-truth fix rather than a numbers fix, which is the usual shape of these: the balance was
wrong because the fiction was wrong.

**Adding a department is the most expensive thing you can do to the balance.** Not because a
department is hard to write, but because the spread guard compares max minus min across *all* of
them, so every new one is a fresh chance to blow a bound that six other departments are currently
satisfying. This is why the expansion added two and not three. Communications — reputation as the
output rather than a side effect, which inverts the core loop — remains the strongest next
candidate, and should only be attempted with the spread as tight as it is now.

## 12. Deliberately out of scope for v1

Sound and music; multiple save slots and save export; Spanish content (the architecture supports it,
the dictionary isn't written yet); difficulty settings; changing department mid-career;
achievements.

Two things that were on this list have since been built and are documented above: **named NPCs
outside your unit** (§3a — eight of them, whose standing is tracked the way your staff's morale
already is) and a **career that branches** (§7 — four tracks rather than one ladder). The list is
shorter than it was, and the remaining item worth doing first is **Spanish**.

### Saving

Not out of scope, and not a feature you have to think about: the game writes to `localStorage`
after every action, so closing the tab and coming back resumes exactly where you were — including
the random stream, because the RNG cursor is part of the saved state rather than a global. A save
carries a version number, unknown content ids are pruned on load rather than crashing, and there is
one slot.
