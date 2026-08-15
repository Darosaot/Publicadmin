import { alderford, eastmoor, kesswater } from './bodies';
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
];

export const initiativeRegistry: Record<string, InitiativeTemplate> = Object.fromEntries(
  initiatives.map((initiative) => [initiative.id, initiative]),
);
