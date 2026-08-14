import { defineEvent } from '../authoring';

/**
 * Scripted beats. These are never drawn at random — the career system makes them eligible and the
 * engine takes at most one per month, so the arc of a career is guaranteed to happen even in a
 * run where the dice are unkind.
 */
export const milestoneEvents = [
  defineEvent('evt.milestone.first_month', {
    kind: 'milestone',
    title: 'One month in',
    body: 'Four weeks. You have learned where the good coffee is, which of the three printers works, and that roughly a third of what the department does exists because of a decision nobody present can explain. Your line manager asks how you are finding it.',
    conditions: { minTurn: 2, maxLevel: 1 },
    choices: [
      {
        id: 'honest',
        label: 'Tell her what does not make sense',
        text: 'You list four things. She agrees with three, explains the fourth in a way that makes it obviously correct, and asks you to write up the other three. It is the first work anybody asked for rather than assigned.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'keen',
        label: 'Say it is going well and ask for more',
        text: 'She gives you more. It is a compliment and it is also more, and both of those turn out to be true for the next twenty years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'careful',
        label: 'Say very little until you understand the place',
        text: 'A reasonable instinct. You spend three more months watching, and by the time you speak you are right about everything and nobody has been waiting to hear it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.arrive_2', {
    kind: 'milestone',
    title: 'Northbridge',
    body: 'A hundred and forty thousand people instead of eighteen thousand. The building has a lift, the department has a structure chart, and on your second day someone asks your opinion in a meeting because of the post you now hold rather than because they know you.',
    conditions: { minLevel: 2, maxLevel: 2 },
    choices: [
      {
        id: 'listen',
        label: 'Spend the first month listening',
        text: 'You meet everyone, ask what is broken, and write nothing down publicly for four weeks. When you do speak, the room has already decided you are worth hearing.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'move_fast',
        label: 'Fix the obvious thing immediately',
        outcomes: [
          {
            weight: 3,
            text: 'There is an obvious thing, and you fix it in three weeks, and it has been annoying people for four years. It is the fastest reputation anyone in the department has built.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'The obvious thing was obvious to the four people who tried before you, each of whom discovered the reason it is like that. You find the reason in week five.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 6 },
              { kind: 'stat', stat: 'performance', delta: 1 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.arrive_3', {
    kind: 'milestone',
    title: 'The Region',
    body: 'Regional government. Your unit has eleven people in it and you are responsible for what all eleven of them do, which is a different job from the one you have been good at. Your first decision is how to spend your own week.',
    conditions: { minLevel: 3, maxLevel: 3 },
    choices: [
      {
        id: 'do_the_work',
        label: 'Keep doing the technical work yourself',
        text: 'You are still the best in the unit at it, and the work is excellent, and in eighteen months you will realise that nobody else got better while you were proving that.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 7 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'build_team',
        label: 'Spend it on the eleven people',
        text: 'Two months of slower output and then a unit that does not need you in the room. It is the first time the work has been better because of you rather than by you.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'build_outward',
        label: 'Spend it on everyone outside the unit',
        text: 'You become the person other departments call first. The unit runs itself adequately, the region runs slightly better, and you are in more rooms than you have ever been in.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'stat', stat: 'performance', delta: -1 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.arrive_4', {
    kind: 'milestone',
    title: 'The Agency',
    body: 'National level. The decisions have a nought on the end that was not there before, and the distance between you and the person affected by them is now four organisations and a data table. Somebody asks you to sign something on your third day that would have taken you a fortnight to check in Alderford.',
    conditions: { minLevel: 4, maxLevel: 4 },
    choices: [
      {
        id: 'check',
        label: 'Take the fortnight',
        text: 'You hold it up and read it properly. Three people are irritated and one clause is wrong. You establish, in your first week, what kind of signature yours is.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'trust',
        label: 'Sign it — the system checked it already',
        text: 'The system had checked it. That is what the system is for, and you cannot personally verify everything at this level, and both of those things are true and neither of them is entirely comfortable.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'system',
        label: 'Ask who checked it, and how',
        text: 'It takes an afternoon and produces a one-page note on the assurance chain, which turns out to have a gap in it that nobody had looked at in six years. You sign, and then you fix the gap.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.arrive_5', {
    kind: 'milestone',
    title: 'The Ministry',
    body: 'Director-General. There is a car, which you did not ask for, and a private office, which you did not know was a thing. On the first morning the outgoing DG tells you the only thing worth knowing: "Everything that reaches this desk has already been decided by someone. Your job is to find out by whom, and whether they were entitled to."',
    conditions: { minLevel: 5, maxLevel: 5 },
    choices: [
      {
        id: 'trace',
        label: 'Start tracing decisions back',
        text: 'Within six weeks you can name, for every significant decision in the directorate, the person who actually made it. About a third of them should not have been the ones making it. You start moving the third.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'agenda',
        label: 'Pick two things and change them',
        text: 'You choose the two that will still matter in ten years and put everything into those. The rest of the directorate runs as it ran. Two things change, permanently, which is more than most people manage.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'steady',
        label: 'Keep the machine running',
        text: 'Nothing breaks on your watch. It is a genuine achievement, invisible by design, and it is not what you thought you would be doing when you were twenty-six and furious about a filing system.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.comfortable_plateau', {
    kind: 'milestone',
    title: 'You could stay here',
    body: 'It occurs to you, in an unremarkable week, that you are good at this job and that you could do it until you retire. The work is real, the hours are survivable, and nobody who matters to you would think less of you for it.',
    conditions: { minTurn: 30, maxLevel: 2 },
    choices: [
      {
        id: 'stay',
        label: 'That would be enough',
        text: 'You stop reading the vacancy bulletins. The relief is immediate and considerable, and the work — which was always the point — gets better almost at once.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'flag', flag: 'chose_the_plateau' },
        ],
      },
      {
        id: 'more',
        label: 'It would not',
        text: 'You do not know whether what you want is influence or just the next thing. You update your CV that evening either way.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.why_you_started', {
    kind: 'milestone',
    title: 'The reason',
    body: 'A new joiner, three weeks in, asks why you did this rather than the private sector, where you would have earned considerably more. She is not being rude; she genuinely wants to know, and you find you have to think about it.',
    conditions: { minTurn: 45 },
    choices: [
      {
        id: 'public_good',
        label: 'Tell her the true version',
        text: 'You tell her about the one decision, years ago, that changed something for people you never met and never will. She writes it down. You realise you had not said it out loud in a decade and that it is still true.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: -6 },
        ],
      },
      {
        id: 'honest_now',
        label: 'Tell her what keeps you here now',
        text: '"The pension, the people, and the fact that on a good day I can stop something stupid from happening to eleven thousand households." She thinks that is the best answer she has had.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
      {
        id: 'deflect',
        label: 'Say you fell into it',
        text: 'Which is also true, and much easier, and closes the conversation. You think about the real answer on the way home.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 2 }],
      },
    ],
  }),

  defineEvent('evt.milestone.old_colleague', {
    kind: 'milestone',
    title: 'Someone from Alderford',
    body: 'At a conference, a woman you have not seen in twenty years — she sat opposite you in your first office — tells you that the thing you set up back then is still running, essentially unchanged, and still working.',
    conditions: { minTurn: 66 },
    choices: [
      {
        id: 'proud',
        label: 'Let yourself be pleased',
        text: 'Twenty years, and the most durable thing you have made is a procedure in a town of eighteen thousand people that nobody has ever needed to fix.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'ask',
        label: 'Ask what happened to everyone else',
        text: 'Two retired, one is a mayor, one left after the thing in 2013 that you have never had explained. She explains it. It changes how you remember your first four years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.reckoning', {
    kind: 'milestone',
    title: 'The version of you that exists in the files',
    body: 'You are asked to give a talk to a group of new entrants on ethics in public administration. Preparing it, you go back through your own decisions, and there are several you would prefer the audience not to hear about.',
    conditions: { maxStat: { integrity: 30 }, minTurn: 24 },
    choices: [
      {
        id: 'honest_talk',
        label: 'Give the talk about your own worst decisions',
        text: 'You describe three of them, plainly, and what each one cost and who paid it. It is the most useful hour of training anyone in that room receives, and it costs you something to give.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 12 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'standard_talk',
        label: 'Give the standard talk',
        text: 'Codes of conduct, declaration thresholds, the four questions to ask yourself. It is fine. Two of them will remember it for a fortnight.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -3 }],
      },
      {
        id: 'decline_talk',
        label: 'Find a reason not to do it',
        text: 'A diary conflict, genuine enough to be defensible. Someone else gives the talk. You go back to your office and do not think about it again for some time.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.milestone.minister_call', {
    kind: 'milestone',
    title: 'The call',
    body: 'The Prime Minister’s chief of staff would like twenty minutes. There is a reshuffle in nine days, the Ministry needs someone who understands it from the inside, and your name has been put forward by three people, at least one of whom you would not have expected.',
    conditions: { requiredFlags: ['minister_track'] },
    choices: [
      {
        id: 'accept',
        label: 'Let your name go forward',
        text: 'You say yes, and the machine starts moving around you immediately: the vetting, the committee, the questions. Twenty-two years of files are about to be read by people looking for a reason.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 10 },
          { kind: 'queueEvent', eventId: 'evt.followup.minister_hearing', delayTurns: 1 },
        ],
      },
      {
        id: 'decline',
        label: 'Say no',
        text: 'You tell him, truthfully, that you are more use where you are, and that ministers last four years and directorates last forty. He is surprised. So, slightly, are you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'flag', flag: 'declined_the_ministry' },
        ],
      },
      {
        id: 'conditions',
        label: 'Ask what you would be allowed to do',
        conditions: { minStat: { politicalCapital: 75 } },
        text: 'You name the two things you would want a free hand on. He does not agree to either, and does not say no, and the fact that you asked is reported upward and read as seriousness rather than presumption.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'queueEvent', eventId: 'evt.followup.minister_hearing', delayTurns: 1 },
        ],
      },
    ],
  }),
];
