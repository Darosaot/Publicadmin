import { defineEvent } from '../authoring';

/**
 * Leaving the ladder.
 *
 * The four arrival milestones in `milestones.ts` name Northbridge, the Region, the Agency and the
 * Ministry, which are line-track posts — so they are gated to that branch and everyone else needs
 * their own beat. These fire once, the first time a career finds itself somewhere other than the
 * management track, and they are about the trade rather than the promotion.
 *
 * There is also one per branch for the top of it, because arriving at the end of a road nobody
 * else took should not pass without comment.
 */
export const trackEvents = [
  /* -------------------------------------------------------------- expert */

  defineEvent('evt.track.expert_arrival', {
    kind: 'milestone',
    title: 'No one reports to you',
    body: 'The office is smaller and quieter than the one you left, and there is no establishment list on the wall because there is no establishment. What there is, on the desk, is the file three departments could not resolve between them.',
    weight: 10,
    once: true,
    conditions: { tracks: ['expert'] },
    choices: [
      {
        id: 'relief',
        label: 'You had forgotten what this felt like',
        text: 'Eleven consecutive hours on one question, uninterrupted, and an answer at the end of it that is right. You had been managing for so long that you had stopped noticing you missed it.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'stat', stat: 'performance', delta: 5 },
        ],
      },
      {
        id: 'exposed',
        label: 'There is nobody to hand it to',
        text: 'Every file on that desk is yours to the end. It is the thing you said you wanted and it is heavier than it looked from the other side of it.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'miss_them',
        label: 'Think about the people you handed over',
        conditions: { requiresTeam: false },
        text: 'Four of them wrote. Two of those are asking whether you are hiring, which you are not and will not be again. You reply to all four properly, which takes an evening and is the last management you will do.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.track.expert_top', {
    kind: 'milestone',
    title: 'The question comes to you now',
    body: 'A note arrives from the Council Office asking for your view. Not your department’s view, not a submission cleared by four people — yours, with your name on it, on a question the government has not been able to answer for two years.',
    weight: 10,
    once: true,
    conditions: { tracks: ['expert'], minLevel: 5 },
    choices: [
      {
        id: 'answer_plainly',
        label: 'Answer it in one page',
        text: 'One page, four paragraphs, no hedging and no annexes. It is the hardest thing you have ever written and it is read by everyone who matters within a fortnight, which is exactly what a page is for.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 8 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'set_out_options',
        label: 'Set out the options and their costs',
        text: 'Nine pages that refuse to choose, because choosing is not your job and you have spent thirty years being precise about that. It is respected, it is used, and it changes nothing on its own.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
    ],
  }),

  /* ----------------------------------------------------------- political */

  defineEvent('evt.track.political_arrival', {
    kind: 'milestone',
    title: 'The pass works on a different floor',
    body: 'The private office runs on a clock you have never worked to: things are decided in the corridor, minuted afterwards if at all, and the person you most need to speak to has four minutes between one meeting and the next. Nobody here has read a file to the end in months.',
    weight: 10,
    once: true,
    conditions: { tracks: ['political'] },
    choices: [
      {
        id: 'keep_the_file',
        label: 'Insist that things are written down',
        text: 'You start minuting decisions nobody asked you to minute. It makes you slower and slightly disliked, and eighteen months later it is the only reason anybody can reconstruct what was agreed.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
      {
        id: 'adapt',
        label: 'Work at the speed of the room',
        text: 'Within a month you are deciding things in corridors too, and you are good at it, and the part of you that spent a decade on procedure watches this happen with some interest.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 8 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'both',
        label: 'Move fast and keep a private record',
        text: 'You keep up, and you keep a notebook nobody sees. It is not quite honest and it is not quite dishonest, and it is the arrangement most people in that building have made with themselves.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
    ],
  }),

  defineEvent('evt.track.political_fragility', {
    kind: 'random',
    title: 'Your principal is in trouble',
    body: 'It is nothing to do with you or your work. It is a reshuffle rumour with enough substance that two people have quietly asked what your plans are, which is how you learn that your post is not a post at all — it is an attachment to a person.',
    weight: 13,
    conditions: { tracks: ['political'], minLevel: 4 },
    choices: [
      {
        id: 'loyal',
        label: 'Stay, and be useful',
        outcomes: [
          {
            weight: 3,
            text: 'They survive it. What you did during the six weeks it was uncertain is remembered precisely, and the relationship you have afterwards is worth more than the post.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 10 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'They do not survive it. You go with them, as everyone in a private office eventually does, and spend four months on a policy review nobody will read while you work out what comes next.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -12 },
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'hedge',
        label: 'Make yourself known to the likely successor',
        outcomes: [
          {
            weight: 3,
            text: 'Two careful conversations, neither of them disloyal on any reading you would have to defend. When the change comes you are the one person in the office who is kept.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 6 },
              { kind: 'stat', stat: 'integrity', delta: -6 },
            ],
          },
          {
            weight: 2,
            text: 'Your principal hears about the second conversation before the reshuffle happens, and then survives it. You are moved sideways within the month, courteously, to somewhere with no telephone.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -14 },
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'back_to_the_work',
        label: 'Do the job and let it happen',
        text: 'You finish the three things that were going to be finished and hand over the rest in a state somebody else can pick up. It is the least political thing anyone in that building does all quarter.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
    ],
  }),

  /* ----------------------------------------------------------- oversight */

  defineEvent('evt.track.oversight_arrival', {
    kind: 'milestone',
    title: 'You are the one who arrives now',
    body: 'The first inspection is at an administration much like the one you left. They have set aside a room, cleared a diary, and put out biscuits, and every person you meet is being very slightly more careful than they would normally be. You know exactly what that feels like from the other side.',
    weight: 10,
    once: true,
    conditions: { tracks: ['oversight'] },
    choices: [
      {
        id: 'remember',
        label: 'Inspect the way you wish you had been inspected',
        text: 'You ask what is hard rather than what is wrong, and you find more in two days than the last three inspections found in a fortnight. It turns out people tell you things if the question is answerable.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'by_the_book',
        label: 'Work strictly to the framework',
        text: 'Every question from the schedule, in order, recorded. It is fair, it is unarguable, and it produces a report that is accurate about everything except what is actually wrong there.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
        ],
      },
      {
        id: 'hard',
        label: 'Be harder on them than anyone was on you',
        text: 'You know where the bodies are because you buried some. The report is devastating and correct, and the head of department who receives it was doing the job you did with the resources you had.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
        ],
      },
    ],
  }),

  defineEvent('evt.track.oversight_independence', {
    kind: 'random',
    title: 'A call about the timing',
    body: 'A senior official you have known for twenty years rings about a report that is due out in three weeks. He is not asking you to change a word of it. He is asking, reasonably and as a friend, whether it has to come out before the funding decision.',
    weight: 12,
    conditions: { tracks: ['oversight'], minLevel: 3 },
    choices: [
      {
        id: 'publish',
        label: 'It comes out when it comes out',
        text: 'You tell him no, kindly, and publish on the date. The funding decision goes the other way because of it, which is either the system working or you costing an administration eleven million euros, depending on who is describing it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -8 },
        ],
      },
      {
        id: 'delay',
        label: 'Three weeks is not very much',
        text: 'It is not, and nothing in the report changes, and the decision is taken without it. You have done nothing improper and you have also learned exactly what your independence is worth to you, which is three weeks.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -7 },
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'flag', flag: 'softened_for_politics' },
        ],
      },
      {
        id: 'tell_them',
        label: 'Publish, and disclose that you were asked',
        text: 'The report comes out on time with a paragraph recording the request and who made it. He does not speak to you again. Nobody rings about timing for the rest of your career.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'stat', stat: 'reputation', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -12 },
        ],
      },
    ],
  }),

  defineEvent('evt.track.oversight_top', {
    kind: 'milestone',
    title: 'The complaints are addressed to you personally',
    body: 'Four thousand a year, and every one of them is somebody who has already tried everywhere else. The office can properly examine perhaps two hundred. Deciding which two hundred is the whole job, and it is yours.',
    weight: 10,
    once: true,
    conditions: { tracks: ['oversight'], minLevel: 5 },
    choices: [
      {
        id: 'systemic',
        label: 'Take the ones that stand for thousands more',
        text: 'You pick for pattern rather than for merit, and the cases you take change how whole administrations decide. Several hundred people with perfectly good individual complaints get a letter instead.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 7 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'worst_off',
        label: 'Take the ones where the harm is worst',
        text: 'Case by case, worst first, no regard for what it proves. Two hundred people are put right who would not have been, and the systems that produced them are untouched and will produce four thousand more next year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'say_so',
        label: 'Publish the fact that you can only take two hundred',
        text: 'The annual report opens with the arithmetic instead of burying it: four thousand, two hundred, and here is what happens to the rest. It is the single most quoted sentence the office produces in a decade.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
    ],
  }),
];
