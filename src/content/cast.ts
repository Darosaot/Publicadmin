import type { Condition, Effect } from '../engine/types';
import { text } from './authoring';

/**
 * The people who keep turning up.
 *
 * A person here is **content, not state**. Their name, their arc and everything they ever say is
 * fixed prose written at authoring time, so events name them directly — which they have to, since
 * event text cannot interpolate anything. The only thing the save carries is a number.
 *
 * That number lives in `flags`, under `rel.<id>`, which is why the flag type was widened from
 * boolean to `boolean | number` first. Building the cast on flags rather than on a new `GameState`
 * array avoids the expansion's nastiest trap: `cloneState` hand-enumerates every mutable field and
 * `applyEffects` mutates in place, so a new object on the state would silently share a reference
 * and corrupt the pre-effect snapshot with no compiler warning. `flags` is already cloned.
 *
 * **Standing does not decay.** Reputation and political capital fade because they measure how you
 * are doing lately; what a particular person thinks of you is not that. Elena remembers whose name
 * went on the correction in 2011 whether or not you have spoken since, and the whole reason for
 * having a cast is that somebody remembers.
 */

export interface Person {
  id: string;
  /** A proper noun, so a literal string rather than a key — translating it would be wrong. */
  name: string;
  roleKey: string;
  blurbKey: string;
  /** Where the relationship score is kept. */
  flag: string;
  /** Set once you have actually met, so "never met" is distinguishable from "met, neutral". */
  metFlag: string;

  /** Moves how they regard you. */
  standing(delta: number): Effect;
  /** First contact: records the meeting and sets the initial standing in one go. */
  meet(delta: number): Effect[];

  /** Only if you have met them at all. */
  known: Condition;
  /** Only if you have not. */
  unknown: Condition;
  /** They think well of you. */
  warm(threshold?: number): Condition;
  /** They do not. */
  cold(threshold?: number): Condition;
}

function person(id: string, name: string, role: string, blurb: string): Person {
  const flag = `rel.${id}`;
  const metFlag = `met.${id}`;

  return {
    id,
    name,
    roleKey: text(`cast.${id}.role`, role),
    blurbKey: text(`cast.${id}.blurb`, blurb),
    flag,
    metFlag,

    standing: (delta) => ({ kind: 'flagDelta', flag, delta }),
    meet: (delta) => [
      { kind: 'flag', flag: metFlag },
      { kind: 'flagDelta', flag, delta },
    ],

    known: { requiredFlags: [metFlag] },
    unknown: { forbiddenFlags: [metFlag] },
    warm: (threshold = 15) => ({ requiredFlags: [metFlag], minFlag: { [flag]: threshold } }),
    cold: (threshold = -15) => ({ requiredFlags: [metFlag], maxFlag: { [flag]: threshold } }),
  };
}

/* ------------------------------------------------------------------- cast */

export const vasquez = person(
  'vasquez',
  'Elena Vásquez',
  'Joined the same week you did',
  'The control group for your career. She sat opposite you in Alderford, and wherever you end up she will have ended up somewhere too — above you, below you, or in the same room on the other side of the table.',
);

export const halloran = person(
  'halloran',
  'Rufus Halloran',
  'Your first director',
  'He signed off your first file and told you what he thought of it. Everything you believe about how this is supposed to be done, you got from him, including the parts he got wrong.',
);

export const oyelaran = person(
  'oyelaran',
  'Marta Oyelaran',
  'Union representative',
  'She is across the table from you in every formal process and is the only person in the building who will tell you the truth about your own unit.',
);

export const berg = person(
  'berg',
  'Tomas Berg',
  'Journalist',
  'Local paper, then the nationals. He has your number because at some point you gave it to him, and whether a story about you is fair turns out to be a relationship rather than a roll of the dice.',
);

export const reyes = person(
  'reyes',
  'Inés Reyes',
  'Councillor, then rather more',
  'Her rise and yours are entangled whether you like it or not. On the political track you are attached to her; everywhere else she is weather.',
);

export const lindqvist = person(
  'lindqvist',
  'Sofia Lindqvist',
  'External auditor',
  'She turns up every few years, reads your files, and remembers all of them. Nobody in your career will ever know your work in as much detail or care about it as little.',
);

export const nowak = person(
  'nowak',
  'Jozef Nowak',
  'Account manager',
  'The friendly face of a company you buy from, regulate, or both. He is genuinely good company, which is the entire professional skill.',
);

export const kess = person(
  'kess',
  'Aurelia Kess',
  'The trainee',
  'Two years in and nervous, and right about the thing she found. What you did next decided a great deal about her career and, it turns out, about yours.',
);

export const cast: Person[] = [
  vasquez,
  halloran,
  oyelaran,
  berg,
  reyes,
  lindqvist,
  nowak,
  kess,
];
