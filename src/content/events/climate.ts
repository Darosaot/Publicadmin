import { defineEvent } from '../authoring';

/**
 * The weather, when it is close enough to be a scene.
 *
 * Most of what the climate does is felt rather than seen: the settlement is tighter, the decay is
 * faster, the country falls apart at a different speed. These are the moments where it arrives at
 * your desk with a name on it.
 *
 * `evt.milestone.election` is **required by the engine** — `driftClimate` schedules it by id
 * whenever a government changes, and `validate.ts` fails the build if the corpus does not define
 * it. That is the same arrangement the Minister ending already uses: the engine states a fact and
 * content decides what it means.
 */
export const climateEvents = [
  defineEvent('evt.milestone.election', {
    kind: 'milestone',
    title: 'A government went, and another arrived',
    body: 'The building does not change. The letterhead changes, the priorities in the annual plan change, and about a third of the people you have spent two years building a working relationship with are cleaning out desks on the eleventh floor.',
    weight: 10,
    choices: [
      {
        id: 'carry_on',
        label: 'The work is the work',
        text: 'You carry on doing it, which is what the permanent half of a public administration is for and is the whole of the argument for having one. Nobody thanks you and the files keep moving.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
      {
        id: 'get_in_early',
        label: 'Get in front of the new people early',
        outcomes: [
          {
            weight: 3,
            text: 'Two meetings in the first fortnight, before the diary closes for a year. You are a known quantity by the time the first difficult submission goes up, which is worth more than the submission.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 9 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'You are one of eleven people who had the same idea in the same fortnight, and you are remembered as one of eleven.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'brief_them_straight',
        label: 'Put the real state of things in the first submission',
        text: 'Including the two paragraphs the last lot had been declining to read for three years. It is either the best thing you have ever done for this department or a career-shortening act of optimism, and it will be some months before anybody can tell which.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'queueEvent', eventId: 'evt.followup.new_ministers_verdict', delayTurns: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.new_ministers_verdict', {
    kind: 'followup',
    title: 'They read the paragraphs',
    body: 'Three months on, the submission comes back. The two paragraphs are underlined. There is a handwritten note in the margin and it is not from the private secretary.',
    weight: 10,
    choices: [
      {
        id: 'stand_by_it',
        label: 'Stand by every word',
        outcomes: [
          {
            weight: 3,
            text: 'They wanted somebody who would. The next four submissions from your department go up unredacted and one of them changes a policy that had been wrong since before you joined.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 10 },
              { kind: 'stat', stat: 'politicalCapital', delta: 8 },
              { kind: 'flag', flag: 'trusted_by_the_centre' },
            ],
          },
          {
            weight: 2,
            text: 'They did not. The note is polite and the effect of it is that your department’s submissions are now cleared two floors above you before they go anywhere.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -10 },
              { kind: 'stat', stat: 'reputation', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'soften_it',
        label: 'Offer a revised version',
        text: 'The revision is accurate and shorter and says less. It is accepted immediately and the thing it was about carries on being true and unaddressed for another six years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------- austerity */

  defineEvent('evt.climate.the_settlement', {
    kind: 'random',
    title: 'The settlement letter',
    body: 'Two pages. The second page is the one with the number on it, and the number is a real-terms reduction dressed as a nominal standstill, which everyone in the building can read and nobody in it is allowed to say.',
    weight: 13,
    conditions: { maxClimate: { fiscal: -25 }, requiresTeam: true },
    choices: [
      {
        id: 'salami',
        label: 'Take it evenly off everything',
        text: 'Nothing is cancelled and everything is slightly worse. It is the least visible way to do it and the least honest, and it is what almost everybody does.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'teamMorale', delta: -3 },
        ],
      },
      {
        id: 'stop_something',
        label: 'Stop one thing properly',
        text: 'You pick the thing, write down why, and tell the people it affects before they read it somewhere else. It is a bad month and the department comes out of the year in better shape than the ones that spread it thin.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -7 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'fight_it',
        label: 'Go back and argue the number',
        conditions: { minStat: { politicalCapital: 30 } },
        outcomes: [
          {
            weight: 2,
            text: 'You get about a third of it back, which nobody else got, and you spend everything you had on that floor to do it.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -22 },
              { kind: 'budgetMonthly', delta: 1800 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
            ],
          },
          {
            weight: 3,
            text: 'The number does not move. What moves is your reputation on the floor that set it, from somebody who delivers to somebody who negotiates.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -14 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.climate.nobody_believes_anything', {
    kind: 'random',
    title: 'Nobody believes the figure',
    body: 'It is the right figure. It has been checked three times and it is the right figure, and the reason nobody believes it is that two other administrations published wrong ones this year and the public has stopped distinguishing between institutions.',
    weight: 13,
    conditions: { maxClimate: { trust: -30 } },
    choices: [
      {
        id: 'publish_the_workings',
        label: 'Publish the workings alongside it',
        text: 'Forty pages of method nobody asked for, put out in full. Six people read it properly and two of them are journalists, and the story that runs is about an administration that showed its work.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'restate',
        label: 'Restate it more firmly',
        text: 'Saying a true thing louder to people who have stopped believing true things is a strategy with a long history and no successes in it.',
        effects: [{ kind: 'stat', stat: 'reputation', delta: -4 }],
      },
      {
        id: 'let_it_go',
        label: 'Let it go and get on with the work',
        text: 'A defensible use of a week you did not have. The figure stands, uncorrected in the public mind, and it turns up wrong in three later articles that all cite each other.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.climate.the_good_year', {
    kind: 'random',
    title: 'There is money this year',
    body: 'Not a lot. Enough that for the first time in four years the question in the planning meeting is what to do rather than what to stop, and nobody in the room quite knows how to hold that conversation any more.',
    weight: 12,
    conditions: { minClimate: { fiscal: 30 } },
    choices: [
      {
        id: 'fix_the_backlog',
        label: 'Spend it on the thing that has been broken for years',
        text: 'Unglamorous, invisible from outside, and the reason the next four years are easier than the last four. Nobody gets promoted for this.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 7 },
          { kind: 'teamMorale', delta: 5 },
        ],
      },
      {
        id: 'something_visible',
        label: 'Spend it on something that can be seen',
        text: 'It is announced, photographed and genuinely useful, in that order of emphasis. The backlog is still there and is now four years older.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 8 },
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
      {
        id: 'give_it_to_your_people',
        label: 'Spend it on the people',
        conditions: { requiresTeam: true },
        text: 'Training, two upgrades that were overdue, and one post that had been vacant so long it had stopped appearing on the establishment. It is the cheapest thing on the list and it outlasts everything else you could have bought.',
        effects: [
          { kind: 'teamSkill', delta: 5 },
          { kind: 'teamMorale', delta: 8 },
        ],
      },
    ],
  }),

  defineEvent('evt.climate.the_centre_calls', {
    kind: 'random',
    title: 'The centre asks you directly',
    body: 'Not through your director, not through the department. A note straight to you, from a private office that decided some years ago that you were the one who would tell them the actual position.',
    weight: 13,
    conditions: { requiredFlags: ['trusted_by_the_centre'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'answer_it',
        label: 'Answer it, straight, same day',
        text: 'Which is what the relationship is for and is the reason it exists. Your director finds out from the centre rather than from you, and is not entirely delighted about it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 10 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'route_it',
        label: 'Route it back through your own department',
        text: 'Correct, loyal, and about four days slower. The centre notes both facts and asks somebody else next time, which is either a loss or the end of an accident, depending on what you think this job is.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'flag', flag: 'trusted_by_the_centre', value: false },
        ],
      },
      {
        id: 'use_it',
        label: 'Answer it, and put something of your own in the reply',
        conditions: { minStat: { politicalCapital: 30 } },
        text: 'One paragraph, at the end, about a thing nobody has been willing to put in front of them. It is read. Whether it is acted on takes two years to find out and the answer is partly.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -10 },
          { kind: 'stat', stat: 'reputation', delta: 8 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'climate', dial: 'trust', delta: 6 },
        ],
      },
    ],
  }),
];
