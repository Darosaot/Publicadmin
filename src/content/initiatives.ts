import {
  alderford,
  eastmoor,
  housing,
  inspectorate,
  kesswater,
  northbridge,
  ombudsman,
  procurementService,
  transport,
} from './bodies';
import { defineInitiative } from './authoring';
import type { InitiativeTemplate } from '../engine/types';

/**
 * The things a career decides to do.
 *
 * Everything else in the corpus arrives at the player: files by weight, events by condition,
 * offers by a die. These are chosen. They cost effort for years, nobody chases them, and they pay
 * off into the country rather than into the player's own numbers.
 *
 * ### Three stages, and why
 *
 * Each place runs **look → fix → finish**, and the stages gate on each other through the body's
 * own flags: you cannot work on somewhere you have never been, and you cannot finish the job
 * somewhere that has not started moving and does not yet trust you. That chain is the open-world
 * loop written in the vocabulary of public administration — and it is also what keeps every flag
 * these initiatives write read by something, which `validate.ts` insists on.
 *
 * ### Paying in kind
 *
 * Not one of these pays reputation. Offers key off reputation and reputation decays 4.6% a month,
 * so an initiative paying a lump of it converts hoarded effort straight into promotion velocity —
 * the one payoff shape that would make initiatives the dominant strategy rather than a choice.
 * They pay in condition and standing: the country changes, and the country remembers, and neither
 * shows up on your own record unless somebody writes an event that notices.
 */

/* --------------------------------------------------------------- alderford */

export const alderfordVisit = defineInitiative('init.alderford_visit', {
  title: 'Go back to Alderford',
  desc: 'You could find a reason to be there for a fortnight. Nobody would stop you, and nobody would understand why you wanted to.',
  complete:
    'Two weeks of sitting in on things you were not invited to. Alderford is smaller than you remember and worse run than you remember, and those turn out to be the same fact.',
  lapse: 'You never found the fortnight.',
  required: 16,
  minCycles: 4,
  available: { maxLevel: 3, ...alderford.unknown },
  onComplete: alderford.visit(),
});

export const alderfordRecords = defineInitiative('init.alderford_records', {
  title: 'Alderford’s records',
  desc: 'Four filing systems, none of them wrong, none of them agreeing. Everything difficult there is downstream of it.',
  complete:
    'One system. It took eleven months and the argument was never about filing. Alderford will not notice this for about two years, at which point they will not remember it was you.',
  lapse: 'The fourth filing system is still there. So is the person who wanted it.',
  required: 22,
  minCycles: 5,
  available: { ...alderford.known },
  onComplete: [alderford.improve(7), alderford.regard(12)],
});

export const alderfordRebuild = defineInitiative('init.alderford_rebuild', {
  title: 'Rebuild Alderford properly',
  desc: 'They are listening to you now, and they are moving. That combination does not last, and it will not come round again.',
  complete:
    'A council that works. Not a famous one and not a model for anything — just eighteen thousand people whose bins are collected and whose planning applications are answered, which was always the entire job.',
  lapse:
    'You had their attention and you spent it on something else. They noticed which, and so did you.',
  required: 34,
  minCycles: 7,
  available: {
    minLevel: 3,
    minFlag: { [alderford.conditionFlag]: 5, [alderford.standingFlag]: 10 },
  },
  onComplete: [alderford.improve(11), alderford.regard(8)],
  onLapse: [alderford.regard(-9)],
});

/* ---------------------------------------------------------------- eastmoor */

export const eastmoorVisit = defineInitiative('init.eastmoor_visit', {
  title: 'Find out what is wrong at Eastmoor',
  desc: 'Everyone in the region agrees Eastmoor is in trouble. Nobody can say what the trouble is, which is a finding in itself.',
  complete:
    'Three chief executives in six years, and every one of them arrived to fix the last one’s mistake. Nothing there is more than eighteen months old. That is the trouble.',
  lapse: 'Somebody else will look eventually. Probably.',
  required: 18,
  minCycles: 4,
  available: { minLevel: 2, ...eastmoor.unknown },
  onComplete: eastmoor.visit(),
});

export const eastmoorSteady = defineInitiative('init.eastmoor_steady', {
  title: 'Hold Eastmoor still',
  desc: 'It does not need a plan. It needs eighteen months in which nobody arrives with one.',
  complete:
    'Nothing was reformed, nothing was launched, and nothing was announced. Two directorates finished something they had started. It is the most useful year Eastmoor has had in a decade and there is no way to write it up.',
  lapse: 'The next plan arrived on schedule.',
  required: 30,
  minCycles: 6,
  available: { minLevel: 2, ...eastmoor.known },
  onComplete: [eastmoor.improve(10), eastmoor.regard(10)],
});

export const eastmoorRebuild = defineInitiative('init.eastmoor_rebuild', {
  title: 'Finish the job at Eastmoor',
  desc: 'It has stopped falling. Stopping falling is not the same as standing up, and the window between the two is where everyone before you gave up.',
  complete:
    'A district council nobody has heard of, doing unremarkable work, for the first time in nine years. The regional press ran forty column inches on the crisis and none on this.',
  lapse: 'It was standing up when you left it. It is not now.',
  required: 40,
  minCycles: 8,
  available: {
    minLevel: 3,
    minFlag: { [eastmoor.conditionFlag]: 6, [eastmoor.standingFlag]: 8 },
  },
  onComplete: [eastmoor.improve(13), eastmoor.regard(8)],
  onLapse: [eastmoor.regard(-10)],
});

/* --------------------------------------------------------------- kesswater */

export const kesswaterVisit = defineInitiative('init.kesswater_visit', {
  title: 'Visit all eleven homes',
  desc: 'The trust reports monthly and the reports are fine. Eleven buildings, two hundred residents, and a set of numbers that has been fine for four years.',
  complete:
    'Nine of them are what the reports say. Two are not, and the difference between the nine and the two is not in any return the trust has ever submitted.',
  lapse: 'You read the returns instead. They were fine.',
  required: 18,
  minCycles: 4,
  available: { minLevel: 2, ...kesswater.unknown },
  onComplete: kesswater.visit(),
});

export const kesswaterStaffing = defineInitiative('init.kesswater_staffing', {
  title: 'Kesswater’s staffing',
  desc: 'Cheap for four years running. Two hundred people depend on it. Those two facts are the same fact and somebody has to write that down.',
  complete:
    'Rotas that a person could actually work, and a cost that is no longer the trust’s best feature. Two of the eleven managers left over it. They were the right two.',
  lapse: 'The rota stayed. So did the cost, which was the point of the rota.',
  required: 28,
  minCycles: 6,
  available: { minLevel: 2, ...kesswater.known },
  onComplete: [kesswater.improve(9), kesswater.regard(11)],
});

export const kesswaterRebuild = defineInitiative('init.kesswater_rebuild', {
  title: 'Rebuild the Kesswater trust',
  desc: 'The staffing was the symptom. What produced it is a governance structure in which nobody is responsible for the residents and everybody is responsible for the budget.',
  complete:
    'A board that can be held to something, and a chair who understands what she is now on the hook for. It will hold as long as she does, which is the most any structure ever promises.',
  lapse: 'The board minutes still record unanimous approval of everything.',
  required: 38,
  minCycles: 8,
  available: {
    minLevel: 3,
    minFlag: { [kesswater.conditionFlag]: 6, [kesswater.standingFlag]: 8 },
  },
  onComplete: [kesswater.improve(12), kesswater.regard(8)],
  onLapse: [kesswater.regard(-9)],
});


/* ------------------------------------------------------------- northbridge */

export const northbridgeVisit = defineInitiative('init.northbridge_visit', {
  title: 'Look at Northbridge properly',
  desc: 'Competently run, everyone says. Nobody has had a reason to check what they mean by that.',
  complete:
    'Well run in the parts anyone has ever measured. Three services have never been looked at by anybody, and two of them are the ones a hundred and forty thousand people actually touch.',
  lapse: 'It has a good reputation. That will do.',
  required: 20,
  minCycles: 5,
  available: { minLevel: 2, ...northbridge.unknown },
  onComplete: northbridge.visit(),
});

export const northbridgeMeasure = defineInitiative('init.northbridge_measure', {
  title: 'Measure what Northbridge does not',
  desc: 'You cannot fix the two services nobody looks at until somebody looks at them, and looking at them is a year of work that will make nobody happy.',
  complete:
    'Two services with numbers on them for the first time. The numbers are worse than anybody hoped and better than the worst case, which is the usual answer and was worth the year.',
  lapse: 'They went back to being well run.',
  required: 30,
  minCycles: 6,
  available: { minLevel: 2, ...northbridge.known },
  onComplete: [northbridge.improve(9), northbridge.regard(10)],
});

export const northbridgeEmbed = defineInitiative('init.northbridge_embed', {
  title: 'Make it stick at Northbridge',
  desc: 'A measurement that depends on you is a measurement that ends when you leave. What it needs is somebody there whose job it is.',
  complete:
    'A post, a budget line and a person in it who is good. The three things that turn an intervention into an institution, and the reason nobody will remember this was ever a project.',
  lapse: 'The reporting stopped about four months after you did.',
  required: 36,
  minCycles: 7,
  available: {
    minLevel: 3,
    minFlag: { [northbridge.conditionFlag]: 5, [northbridge.standingFlag]: 8 },
  },
  onComplete: [northbridge.improve(11), northbridge.regard(8)],
  onLapse: [northbridge.regard(-8)],
});

/* ----------------------------------------------------------------- housing */

export const housingVisit = defineInitiative('init.housing_visit', {
  title: 'Read the housing waiting list',
  desc: 'Not the summary. The list. Eleven thousand rows, and nobody in the agency has read it end to end in six years.',
  complete:
    'Four hundred people on it twice. Two hundred who have been housed and never removed. And a category, invented in 2011 for a reason nobody can now recall, that a thousand people are stuck in.',
  lapse: 'The summary said much the same thing.',
  required: 22,
  minCycles: 5,
  available: { minLevel: 2, ...housing.unknown },
  onComplete: housing.visit(),
});

export const housingBacklog = defineInitiative('init.housing_backlog', {
  title: 'The maintenance backlog',
  desc: 'A decade of deferred repairs, priced once, four years ago, by somebody who was told what the answer had to be.',
  complete:
    'A real number, and it is very large. Publishing it cost somebody their job and it was not you, and the following year’s allocation was the first honest one in a decade.',
  lapse: 'The four-year-old figure is now an eight-year-old figure.',
  required: 34,
  minCycles: 7,
  available: { minLevel: 3, ...housing.known },
  onComplete: [housing.improve(10), housing.regard(9)],
});

export const housingRebuild = defineInitiative('init.housing_rebuild', {
  title: 'Fix how housing decides',
  desc: 'The list and the backlog are both outputs of the same thing: an allocation policy nobody has revisited since it was written to solve a different problem.',
  complete:
    'A policy that says what it does and does what it says. It will be unpopular with everybody who understood the old one well enough to work it, which is the clearest sign it was needed.',
  lapse: 'The policy stands. So does everything downstream of it.',
  required: 40,
  minCycles: 8,
  available: {
    minLevel: 4,
    minFlag: { [housing.conditionFlag]: 6, [housing.standingFlag]: 8 },
  },
  onComplete: [housing.improve(13), housing.regard(8)],
  onLapse: [housing.regard(-10)],
});

/* --------------------------------------------------------------- transport */

export const transportVisit = defineInitiative('init.transport_visit', {
  title: 'Find out what transport actually built',
  desc: 'Its condition reports run about eight years behind its capital programme, which means nobody currently working there knows the real state of anything.',
  complete:
    'Two schemes finished and never inspected. One cancelled in 2019 that is still being maintained. And a bridge whose file says two different things, both signed.',
  lapse: 'The condition reports remain reassuring.',
  required: 24,
  minCycles: 6,
  available: { minLevel: 3, ...transport.unknown },
  onComplete: transport.visit(),
});

export const transportBaseline = defineInitiative('init.transport_baseline', {
  title: 'A real asset register',
  desc: 'You cannot plan a capital programme against assets you cannot list. Everyone knows this. Nobody has had three uninterrupted years.',
  complete:
    'Every asset, its actual condition, and what it will cost to keep. It is dull, it took three years, and it will quietly save more money than anything else in this building.',
  lapse: 'The register is about a third done and will not be finished.',
  required: 38,
  minCycles: 7,
  available: { minLevel: 3, ...transport.known },
  onComplete: [transport.improve(10), transport.regard(10)],
});

export const transportProgramme = defineInitiative('init.transport_programme', {
  title: 'Rebuild the capital programme',
  desc: 'With a register you can finally ask the question the programme has never been asked: is this the right list of things to build?',
  complete:
    'A programme built on what exists rather than on what was announced. Two schemes died and four that nobody had heard of moved up, and the ones that died had constituencies.',
  lapse: 'The programme was approved unchanged, as it is every year.',
  required: 44,
  minCycles: 8,
  available: {
    minLevel: 4,
    minFlag: { [transport.conditionFlag]: 6, [transport.standingFlag]: 8 },
  },
  onComplete: [transport.improve(12), transport.regard(9)],
  onLapse: [transport.regard(-10)],
});

/* ------------------------------------------------------- procurement service */

export const procurementVisit = defineInitiative('init.procurement_visit', {
  title: 'Test whether the frameworks work',
  desc: 'It buys on behalf of everybody so that nobody has to buy badly alone. Whether that has worked is exactly the question its annual report is not built to answer.',
  complete:
    'On the big frameworks, plainly yes. On the small ones, no — and the small ones are where two thirds of the transactions are.',
  lapse: 'The annual report was published as usual.',
  required: 24,
  minCycles: 6,
  available: { minLevel: 3, ...procurementService.unknown },
  onComplete: procurementService.visit(),
});

export const procurementSmall = defineInitiative('init.procurement_small', {
  title: 'The small frameworks',
  desc: 'Two thirds of the transactions, a fraction of the attention, and every one of them a place where a bad supplier can sit for years.',
  complete:
    'Nine frameworks closed, four rebuilt, and a rule about which is which. The savings are unglamorous and the removed suppliers have written to their members of parliament.',
  lapse: 'They are still there, and so are the suppliers.',
  required: 36,
  minCycles: 7,
  available: { minLevel: 4, ...procurementService.known },
  onComplete: [procurementService.improve(10), procurementService.regard(8)],
});

export const procurementRebuild = defineInitiative('init.procurement_rebuild', {
  title: 'Rebuild how the service buys',
  desc: 'Fixing nine frameworks is nine fixes. What produced nine bad frameworks is a way of working, and that is a harder thing to put in a submission.',
  complete:
    'Category management that means something, and buyers who are allowed to say no. The service will be slower and better, and it will be judged on the first of those.',
  lapse: 'It buys the way it always has.',
  required: 42,
  minCycles: 8,
  available: {
    minLevel: 4,
    minFlag: {
      [procurementService.conditionFlag]: 6,
      [procurementService.standingFlag]: 6,
    },
  },
  onComplete: [procurementService.improve(12), procurementService.regard(8)],
  onLapse: [procurementService.regard(-8)],
});

/* ------------------------------------------------------------ inspectorate */

export const inspectorateVisit = defineInitiative('init.inspectorate_visit', {
  title: 'Inspect the inspectorate',
  desc: 'It judges everybody else. The one organisation in the country that has to be better run than the bodies it grades, and the one nobody grades.',
  complete:
    'Its methodology has not been revised in eleven years, and two of its five judgement criteria no longer describe anything that happens in the sector.',
  lapse: 'Somebody senior would have to want this. Nobody does.',
  required: 26,
  minCycles: 6,
  available: { minLevel: 4, ...inspectorate.unknown },
  onComplete: inspectorate.visit(),
});

export const inspectorateMethod = defineInitiative('init.inspectorate_method', {
  title: 'Rewrite the methodology',
  desc: 'Eleven years of drift between what it measures and what matters. Every inspector knows. Saying so in writing is a different matter.',
  complete:
    'Five criteria that describe the present. The first round of judgements under it moved fourteen bodies, in both directions, and every one of those moves was defensible.',
  lapse: 'The old criteria are applied for another year.',
  required: 38,
  minCycles: 7,
  available: { minLevel: 4, ...inspectorate.known },
  onComplete: [inspectorate.improve(9), inspectorate.regard(10)],
});

export const inspectorateIndependence = defineInitiative('init.inspectorate_independence', {
  title: 'Put the inspectorate beyond reach',
  desc: 'A methodology can be rewritten again by whoever comes next. What protects it is where the inspectorate sits, who appoints its head, and how hard it is to lean on.',
  complete:
    'A fixed term, a published appointment process, and a duty to report that cannot be waived. It will annoy every minister for the next thirty years, which is what it is for.',
  lapse:
    'It remains exactly as independent as whoever is in charge feels like allowing this year.',
  required: 46,
  minCycles: 8,
  available: {
    minLevel: 5,
    minFlag: { [inspectorate.conditionFlag]: 6, [inspectorate.standingFlag]: 8 },
  },
  onComplete: [inspectorate.improve(12), inspectorate.regard(10)],
  onLapse: [inspectorate.regard(-9)],
});

/* --------------------------------------------------------------- ombudsman */

export const ombudsmanVisit = defineInitiative('init.ombudsman_visit', {
  title: 'Sit with the ombudsman’s post',
  desc: 'Four thousand complaints a year from people who have already tried everything else. It can examine perhaps two hundred properly.',
  complete:
    'How it picks the two hundred is not written down anywhere. It is one very experienced person’s judgement, exercised well, and it retires in three years.',
  lapse: 'Four thousand a year, and none of them yours.',
  required: 22,
  minCycles: 5,
  available: { minLevel: 3, ...ombudsman.unknown },
  onComplete: ombudsman.visit(),
});

export const ombudsmanTriage = defineInitiative('init.ombudsman_triage', {
  title: 'Write down how it chooses',
  desc: 'The judgement is good and it lives in one head. Getting it onto paper without flattening it into a checklist is most of the difficulty.',
  complete:
    'Eleven pages that a new person could actually use, with the hard cases worked through rather than defined away. She read it and changed four things, which is how you know it is right.',
  lapse: 'It is still in her head, and she still retires in three years.',
  required: 30,
  minCycles: 6,
  available: { minLevel: 4, ...ombudsman.known },
  onComplete: [ombudsman.improve(9), ombudsman.regard(11)],
});

export const ombudsmanReach = defineInitiative('init.ombudsman_reach', {
  title: 'Make the findings bite',
  desc: 'It examines two hundred cases well and then recommends. Recommendations are complied with about half the time, and nobody counts which half.',
  complete:
    'A published compliance record, body by body. Nothing was made compulsory and compliance went to eighty per cent inside two years, because being on a list is worse than being asked.',
  lapse: 'Half, still. Nobody counting.',
  required: 40,
  minCycles: 8,
  available: {
    minLevel: 5,
    minFlag: { [ombudsman.conditionFlag]: 6, [ombudsman.standingFlag]: 8 },
  },
  onComplete: [ombudsman.improve(11), ombudsman.regard(8)],
  onLapse: [ombudsman.regard(-9)],
});

/**
 * The menu, in the order it is offered.
 *
 * Deliberately grouped by place rather than by department: the player is choosing somewhere to
 * spend a decade, and the screen should read as a list of places rather than a list of tasks.
 */
export const initiatives: InitiativeTemplate[] = [
  alderfordVisit,
  alderfordRecords,
  alderfordRebuild,
  eastmoorVisit,
  eastmoorSteady,
  eastmoorRebuild,
  kesswaterVisit,
  kesswaterStaffing,
  kesswaterRebuild,
  northbridgeVisit,
  northbridgeMeasure,
  northbridgeEmbed,
  housingVisit,
  housingBacklog,
  housingRebuild,
  transportVisit,
  transportBaseline,
  transportProgramme,
  procurementVisit,
  procurementSmall,
  procurementRebuild,
  inspectorateVisit,
  inspectorateMethod,
  inspectorateIndependence,
  ombudsmanVisit,
  ombudsmanTriage,
  ombudsmanReach,
];

export const initiativeRegistry: Record<string, InitiativeTemplate> = Object.fromEntries(
  initiatives.map((initiative) => [initiative.id, initiative]),
);
