import { defineEvent } from '../authoring';

/**
 * The people who used to work for you, turning up again.
 *
 * The one pool in the corpus whose prose does not know who it is about. `{alum}` is filled at
 * render time from `GameState.alumni`, and `namesAlumnus` decides which end of the roster the
 * engine points at: `'warm'` for whoever thought best of you, `'cold'` for whoever thought worst.
 *
 * That declaration is not optional decoration. It makes the event ineligible when the roster is
 * empty — an unfilled `{alum}` is a sentence with a hole in it — and `validate.ts` checks it in
 * both directions, so prose that names somebody cannot forget to declare it and a declaration
 * cannot sit on prose that never uses it. The second check exists because the interpolation
 * channel was once built, documented, tested, and then used by absolutely nothing.
 *
 * ### Writing these
 *
 * The player does not choose who appears, so the prose cannot depend on anything about them
 * except which end of the roster they came from. Nothing here may say what grade they were, how
 * good they were, or how long ago they left. What it can rely on is the one fact the engine
 * guarantees: a `warm` alumnus is glad to see you and a `cold` one is not.
 *
 * They are gated on `minYearsElapsed` rather than a turn count, because the whole point is that
 * enough time has passed for somebody to have gone somewhere and become somebody.
 */
export const alumniEvents = [
  /* ------------------------------------------------------------- hand-over */

  /**
   * The expert fork hands your whole unit to somebody else.
   *
   * `handed_over_unit` is set by `setupTeamForPost` and read only here — the engine states the
   * fact, content decides what it means, the same arrangement `minister_track` uses. It fires
   * once, on the cycle after the move, because it is the meeting rather than the decision.
   *
   * Not gated on `namesAlumnus`: the whole unit went at once, so pointing at one of them would be
   * arbitrary. The scene is about all of them.
   */
  defineEvent('evt.handover', {
    kind: 'milestone',
    title: 'The introduction',
    body: 'Eleven o’clock, and you introduce your people to the person who will be doing your job. Two of your officers ask good questions. One does not look up. The rest worked out what this meant a fortnight ago and are being polite about it, which is worse than if they were not.',
    weight: 30,
    once: true,
    conditions: { requiredFlags: ['handed_over_unit'] },
    choices: [
      {
        id: 'true',
        label: 'Say something true',
        text: 'You tell them what each of them is good at, by name, in front of the person taking over, which is the only useful thing you have left to give them and takes four minutes. Somebody writes it down. You find out years later that it was the reference that mattered.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
      {
        id: 'usual',
        label: 'Say the usual thing',
        text: 'You say the usual thing about a strong team and an exciting new chapter. It is over in ninety seconds and everybody is grateful, and you think about it in the car and again about six years later.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
      },
      {
        id: 'protect',
        label: 'Spend your last hour on them',
        text: 'You do not go to your own leaving drinks. You spend the hour with your successor going through which of them is about to be badly managed and how, and they listen, and about half of it takes.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------------ warm */

  defineEvent('evt.alum.other_side', {
    kind: 'random',
    title: 'The other side of the table',
    body: 'The panel you have come to give evidence to is chaired by {alum}, who used to work for you and now, plainly, does not. They run the introductions without a flicker and then ask you the hardest question on the list first, which is either a courtesy or the opposite.',
    weight: 8,
    cooldown: 30,
    namesAlumnus: 'warm',
    conditions: { minYearsElapsed: 8, minLevel: 3 },
    choices: [
      {
        id: 'straight',
        label: 'Answer it straight',
        text: 'You give them the real answer, including the part that does not help you. They write it down without comment and move to the next question, and afterwards, in the corridor, they say it was good to see you doing that still.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'manage',
        label: 'Manage the answer',
        text: 'You give them the version that lands well. They accept it, because it is defensible, and something goes out of their face that you have seen go out of other people’s faces and never theirs.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.alum.asks_a_favour', {
    kind: 'random',
    title: 'A call you were not expecting',
    body: '{alum} needs somebody senior to say, in writing, that a thing they are proposing is reasonable. It is reasonable. It is also going to annoy people who can reach you and cannot reach them, which is presumably why they called you and not somebody nearer.',
    weight: 9,
    cooldown: 28,
    namesAlumnus: 'warm',
    conditions: { minYearsElapsed: 6, minLevel: 3 },
    choices: [
      {
        id: 'sign',
        label: 'Put your name to it',
        outcomes: [
          {
            weight: 3,
            text: 'You write the letter. It works, and nobody comes for you about it, and eighteen months later somebody in another building mentions that {alum} has been telling people you are the reason that thing exists.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'You write the letter, and the people you expected to be annoyed are annoyed, and they are annoyed with you rather than with {alum}, which is exactly the trade you agreed to when you signed it.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -7 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'advise',
        label: 'Give them the advice instead',
        text: 'You spend an hour on the phone telling them exactly who to ask and what to say, which is more useful than the letter and costs you nothing, and both of you know which of those facts decided it.',
        effects: [{ kind: 'stat', stat: 'politicalCapital', delta: 1 }],
      },
      {
        id: 'decline',
        label: 'Say you cannot',
        text: 'You explain about the position you are in. They say of course, immediately, the way people do when they had already worked out the answer and rang anyway.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
      },
    ],
  }),

  defineEvent('evt.alum.recommends_you', {
    kind: 'random',
    title: 'A name that came up',
    body: 'You find out, third hand, that your name came up for something and that the person who put it there was {alum}. Nothing follows from it immediately. It is simply a thing that happened in a room you were not in.',
    weight: 7,
    cooldown: 36,
    namesAlumnus: 'warm',
    conditions: { minYearsElapsed: 10, minLevel: 4 },
    choices: [
      {
        id: 'thank',
        label: 'Ring and say thank you',
        text: 'They are embarrassed about it, which is how you know it was not a favour being banked. You talk about nothing for twenty minutes and it is the best twenty minutes of the week.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'nothing',
        label: 'Let it lie',
        text: 'You do not mention it, because mentioning it would mean explaining how you found out. It sits with you for a fortnight anyway.',
        effects: [{ kind: 'stat', stat: 'reputation', delta: 2 }],
      },
    ],
  }),

  defineEvent('evt.alum.wants_you_back', {
    kind: 'random',
    title: 'An approach',
    body: '{alum} is building something and wants you in it. The salary is not the argument and they have not made it. The argument is that they have seen you run an office and would like to be in one you ran again.',
    weight: 6,
    cooldown: 40,
    namesAlumnus: 'warm',
    conditions: { minYearsElapsed: 12, minLevel: 4 },
    choices: [
      {
        id: 'flattered',
        label: 'Say you are flattered',
        text: 'Which you are, and which is also the word people use when the answer is no. They hear it correctly and do not push.',
        effects: [{ kind: 'stat', stat: 'stress', delta: -4 }],
      },
      {
        id: 'consider',
        label: 'Actually think about it',
        text: 'You think about it for three weeks. You do not go — the thing you are in the middle of will not survive you leaving it — but you spend those three weeks knowing you had somewhere else to be, and it changes how the meetings feel.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: -8 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------------ cold */

  defineEvent('evt.alum.long_memory', {
    kind: 'random',
    title: 'Somebody with a long memory',
    body: 'The consultation responses are in and one of them is signed by {alum}. It is not unfair. It is comprehensive, and specific, and it is about a weakness in your proposal that only somebody who watched you work would know to look for.',
    weight: 9,
    cooldown: 30,
    namesAlumnus: 'cold',
    conditions: { minYearsElapsed: 7, minLevel: 3 },
    choices: [
      {
        id: 'concede',
        label: 'Concede the point',
        text: 'You change the proposal, and it is better, and you say in the response document that the change came from their submission. They never acknowledge it and the proposal survives contact with the world, which it would not have otherwise.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend what you wrote',
        text: 'You answer every point and win on most of them. The one you lose is the one that matters, and it surfaces two years later in a form nobody can quietly fix.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: -5 },
        ],
      },
    ],
  }),

  defineEvent('evt.alum.says_something', {
    kind: 'random',
    title: 'What people are saying',
    body: 'You are being considered for something, and somebody rang round. One of the people they rang was {alum}. You are told what was said in the careful, non-specific way people use when they want you to know the shape of it without being quotable.',
    weight: 8,
    cooldown: 34,
    namesAlumnus: 'cold',
    conditions: { minYearsElapsed: 9, minLevel: 3 },
    choices: [
      {
        id: 'accept',
        label: 'Accept that it was earned',
        text: 'You go back through it, honestly, and most of what they said is true, and the part that is not true is a reasonable thing to have believed from where they were sitting. That is worse than if they had simply been wrong.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'discredit',
        label: 'Explain what they were like to manage',
        text: 'You give your side, and it is plausible, and it works. It also gets back to them, because these things do, and whatever was left of it is not left any more.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
        ],
      },
      {
        id: 'silent',
        label: 'Say nothing at all',
        text: 'You let it stand. The thing you were being considered for goes to somebody else, and you never find out whether that was why.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.alum.now_senior', {
    kind: 'random',
    title: 'Reporting to you no longer',
    body: '{alum} is now senior enough that your two organisations have to agree on something, and the agreeing has been assigned to the pair of you. They are perfectly professional about it in a way that takes visible effort.',
    weight: 7,
    cooldown: 36,
    namesAlumnus: 'cold',
    conditions: { minYearsElapsed: 11, minLevel: 4 },
    choices: [
      {
        id: 'address',
        label: 'Say the thing out loud',
        outcomes: [
          {
            weight: 2,
            text: 'You say you know how it ended and that you have thought about it since. They are quiet for a while and then say something they have obviously had ready for eleven years. The agreement gets signed the following week.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 6 },
              { kind: 'stat', stat: 'stress', delta: -5 },
            ],
          },
          {
            weight: 2,
            text: 'You say you know how it ended. They say that they would rather keep this to the agreement, thank you, and they are entirely within their rights, and the meeting runs another two hours.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'business',
        label: 'Keep it to the business',
        text: 'You both keep it to the business. It takes four meetings instead of two and produces an agreement that neither organisation is happy with, which is the usual outcome and would have been the usual outcome anyway.',
        effects: [{ kind: 'stat', stat: 'performance', delta: -2 }],
      },
    ],
  }),

  defineEvent('evt.alum.warned_them', {
    kind: 'random',
    title: 'A candidate who withdrew',
    body: 'The best candidate for your vacancy has withdrawn, politely and without a reason. The recruiter, who should not tell you this and does, mentions that they were seen having coffee with {alum} last week.',
    weight: 6,
    cooldown: 40,
    namesAlumnus: 'cold',
    conditions: { minYearsElapsed: 8, minLevel: 3, requiresTeam: true },
    choices: [
      {
        id: 'ask',
        label: 'Ask {alum} directly',
        text: 'They tell you, without heat, exactly what they said, and it is a fair account of working for you at the time. You cannot argue with any of it and you do not try.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'move_on',
        label: 'Appoint the second choice',
        text: 'The second choice is fine. They are fine for six years. You think about the first one occasionally, usually in meetings where the difference would have shown.',
        effects: [{ kind: 'teamSkill', delta: -3 }],
      },
    ],
  }),
];
