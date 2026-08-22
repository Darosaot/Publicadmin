/**
 * The perk tree: three ways of becoming good at this job, and not enough points for all of them.
 *
 * Three columns, four rows, and each row costs its own number — so a thirty-year career affords
 * fourteen points against a tree that costs thirty. A player who wants the capstone of one branch
 * gives up most of another, and two careers of the same length end up different people. That
 * scarcity is the whole design; a tree you can complete is a checklist.
 *
 * The prose describes the person, not the modifier. "You have sat through enough recruitment
 * rounds to know who is worth waiting for" and "-1 month hiring time" are the same mechanic and a
 * different game, and the number is printed on the card underneath in either case.
 */

import { definePerk } from './authoring';
import type { PerkTemplate } from '../engine/types';

export const perks: PerkTemplate[] = [
  /* ------------------------------------------------------------- the unit */

  definePerk('open_door', {
    name: 'Open door',
    desc: 'You stopped treating the one-to-one as a form to be completed. People tell you things a month before they would otherwise have told you, which is usually just enough time.',
    branch: 'people',
    tier: 1,
    minLevel: 1,
  }),
  definePerk('mentor', {
    name: 'Mentor',
    desc: 'You have taught somebody this job from nothing, and it turns out the second time is far easier than the first. Your coaching is worth more than the hour it takes.',
    branch: 'people',
    tier: 2,
    requires: 'open_door',
    minLevel: 2,
  }),
  definePerk('delegator', {
    name: 'Delegator',
    desc: 'The hard part was never handing the file over. It was not asking about it afterwards. You have finally learned to do the second part, and it costs you less of the month than it used to.',
    branch: 'people',
    tier: 3,
    requires: 'mentor',
    minLevel: 3,
  }),
  definePerk('talent_magnet', {
    name: 'Somewhere worth joining',
    desc: 'People who have worked for you say so to other people. Vacancies fill faster than the grade would suggest, and the ones who arrive have already decided to like it here.',
    branch: 'people',
    tier: 4,
    requires: 'delegator',
    minLevel: 4,
  }),

  /* ------------------------------------------------------------- the work */

  /*
   * Ordered by what the balance sweep said each is worth, not by the order they were written.
   *
   * `methodical` began this branch at tier 1 and was, on measurement, the strongest perk in the
   * game: burnout is what actually ends a career, and a third more relief from every evening off
   * compounds over three hundred months into nearly two extra years of service. Isolating it
   * showed it accounted for half of this branch's advantage on its own. It is priced at 3 now
   * rather than weakened, because an anti-burnout perk is exactly right for this game — it was
   * simply the cheapest thing on the board.
   */
  definePerk('finisher', {
    name: 'Finisher',
    desc: 'Anyone can carry a file to ninety per cent. You have learned what the last ten per cent is actually made of, and everything that leaves your desk is better for it.',
    branch: 'craft',
    tier: 1,
    minLevel: 1,
  }),
  definePerk('systems_thinker', {
    name: 'Systems thinker',
    desc: 'You can hold the shape of something that will take six years in your head while doing something else, and pick it up in the same place each time. Long undertakings move faster for you than they should.',
    branch: 'craft',
    tier: 2,
    requires: 'finisher',
    minLevel: 2,
  }),
  definePerk('methodical', {
    name: 'Methodical',
    desc: 'You have stopped taking the week home with you on Friday. An evening off is now genuinely an evening off, which is a skill and not a temperament.',
    branch: 'craft',
    tier: 3,
    requires: 'systems_thinker',
    minLevel: 3,
  }),
  definePerk('institutional_memory', {
    name: 'Institutional memory',
    desc: 'You are the person who remembers why the rule exists. Standing earned this way fades more slowly than standing earned any other way, because enough people can say what you did.',
    branch: 'craft',
    tier: 4,
    requires: 'methodical',
    minLevel: 4,
  }),

  /* ---------------------------------------------------------- the corridor */

  definePerk('corridor_sense', {
    name: 'Corridor sense',
    desc: 'You know which conversation is the one that matters, and it is rarely the meeting. The same hour spent talking to people is worth more to you than it is to your colleagues.',
    branch: 'politics',
    tier: 1,
    minLevel: 1,
  }),
  definePerk('budget_hawk', {
    name: 'Budget hawk',
    desc: 'You have defended a line in front of people who wanted it gone, and won, and been remembered for it. Money arrives where you are.',
    branch: 'politics',
    tier: 2,
    requires: 'corridor_sense',
    minLevel: 2,
  }),
  definePerk('thick_skin', {
    name: 'Thick skin',
    desc: 'The letter that would have ruined your week in year three is now a letter. Nothing about the job got easier; you did.',
    branch: 'politics',
    tier: 3,
    requires: 'budget_hawk',
    minLevel: 3,
  }),
  definePerk('kingmaker', {
    name: 'Kingmaker',
    desc: 'Two of the people who decide things owe their posts partly to you. Favour spent from that account replenishes itself in a way nobody has ever written down.',
    branch: 'politics',
    tier: 4,
    requires: 'thick_skin',
    minLevel: 4,
  }),
];
