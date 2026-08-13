import { defineEvent } from '../authoring';

const policy = { departments: ['policy' as const] };

export const policyEvents = [
  defineEvent('evt.policy.draft_leak', {
    kind: 'random',
    title: 'Your draft, on page four',
    body: 'The consultation draft appears in the regional paper eleven days before it was due to be published, with the two most contested paragraphs quoted and the context around them missing. Four people had the file. You were one.',
    weight: 11,
    conditions: policy,
    choices: [
      {
        id: 'publish_now',
        label: 'Publish the whole document immediately',
        text: 'The full text goes up within the hour, with the context restored. The story becomes a non-story by lunchtime. Two people above you are annoyed at being pre-empted and cannot say why that was wrong.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'no_comment',
        label: 'Say nothing and let it run',
        text: 'Four days of coverage based on two paragraphs. By the time the real document appears, everyone has decided what is in it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'water_down',
        label: 'Rewrite the contested paragraphs before publication',
        text: 'The published version no longer says the thing that caused the trouble. It also no longer says the thing you spent four months establishing was true.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.inconvenient_evidence', {
    kind: 'random',
    title: 'The evidence says otherwise',
    body: 'The measure has been announced. Your analysis, finished this morning, shows it will most likely have no effect on the problem it was announced to solve, and a small regressive effect on the people it was announced to help.',
    weight: 12,
    conditions: policy,
    choices: [
      {
        id: 'submit',
        label: 'Submit the analysis as written',
        outcomes: [
          {
            weight: 3,
            text: 'It is read properly. The measure is redesigned rather than abandoned, which is the best outcome available, and someone senior remembers that your analysis was the thing that made it work.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
            ],
          },
          {
            weight: 2,
            text: 'It is read, filed, and the measure proceeds unchanged. You are told, kindly, that the analysis was very thorough. Nothing else happens.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'bury',
        label: 'Move the finding to an annex',
        text: 'It is still in the document. It is on page fifty-one, in the technical annex, in a sentence that begins "It should be noted that". Nobody reads it, which was the point.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'flag', flag: 'buried_a_finding' },
        ],
      },
      {
        id: 'reframe',
        label: 'Lead with what would work instead',
        text: 'You keep the finding intact and put a workable alternative in front of it. The problem becomes a proposal, and the proposal is adopted in part, and the part is real.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.consultation_ignored', {
    kind: 'random',
    title: 'What the consultation said',
    body: 'Eleven hundred responses. The overwhelming majority oppose the proposal, for reasons that are specific, informed and largely correct. The decision to proceed was taken before the consultation opened.',
    weight: 11,
    conditions: policy,
    choices: [
      {
        id: 'report_faithfully',
        label: 'Report the responses faithfully',
        text: 'The summary says what people said, in the proportions they said it. The proposal proceeds anyway, and the published record shows that the administration knew exactly what it was doing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'balance',
        label: 'Present it as a balance of views',
        text: '"Respondents expressed a range of perspectives." Eleven hundred people said no and the sentence is not technically false. You have written it before and you will write it again.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'concessions',
        label: 'Use the responses to force changes',
        text: 'You find the four specific objections that cannot be answered and build them into a redesign. The proposal proceeds, altered, and eleven hundred people got something for their trouble.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.speech', {
    kind: 'random',
    title: 'Words for someone else’s mouth',
    body: 'You are asked to write the deputy mayor’s speech for the launch. The line she wants at the centre of it is one you spent last month demonstrating to be false.',
    weight: 11,
    conditions: policy,
    choices: [
      {
        id: 'refuse_line',
        label: 'Write the speech without the line',
        text: 'You deliver an excellent speech that does not contain the claim. She adds it back herself, on the day, from memory, slightly wrong. Your draft is on the file without it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'write_it',
        label: 'Write what she asked for',
        text: 'It is her speech and her claim and your sentence. It is quoted in two papers. You are the only person in the room who knows it is not true.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
        ],
      },
      {
        id: 'true_version',
        label: 'Find the true claim that is nearly as good',
        text: 'The real number is less dramatic and, framed properly, more persuasive because it can survive a question. She uses it. It survives a question.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.advocacy_group', {
    kind: 'random',
    title: 'They want the draft',
    body: 'A well-run advocacy organisation has asked for an early sight of the draft strategy. They are knowledgeable, their comments would genuinely improve it, and giving it to them before the other stakeholders would be exactly the kind of privileged access the process is supposed to prevent.',
    weight: 10,
    conditions: policy,
    choices: [
      {
        id: 'refuse',
        label: 'Everyone gets it at the same time',
        text: 'You say no and mean it. When the draft is published they submit their comments through the same door as everyone else, and the comments are as good as you expected.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'technical_group',
        label: 'Convene a technical group with all the stakeholders',
        text: 'Four weeks of extra work turns a private favour into a public process. Everyone with expertise gets early sight, on the record, together. The draft is materially better.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'quiet_share',
        label: 'Send it to them quietly',
        text: 'Their comments improve the draft considerably. Two other organisations find out eight months later, and the thing they remember is not the improvement.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.announcement_first', {
    kind: 'random',
    title: 'The announcement is Tuesday',
    body: 'The strategy will be announced on Tuesday. The analysis underpinning it will be finished, at the current rate, in about three weeks. You have been asked what can be said on Tuesday.',
    weight: 11,
    conditions: policy,
    choices: [
      {
        id: 'direction',
        label: 'Announce the direction, not the numbers',
        text: 'You write something that commits to the objective and to publishing the analysis in full when it is done. It is a smaller announcement and it is one nobody has to walk back.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'provisional',
        label: 'Use the provisional figures',
        outcomes: [
          {
            weight: 2,
            text: 'The provisional figures hold up. Nobody ever knows how close it was.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 3,
            text: 'The final analysis moves the headline figure by a third. The correction is published quietly and quoted loudly.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'three_weeks',
        label: 'Say the announcement should wait three weeks',
        text: 'You put it in writing and it is refused, which you expected. The refusal is now also in writing, which was the point.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.extra_author', {
    kind: 'random',
    title: 'A name to add',
    body: 'The strategy paper is finished. Your director suggests adding the name of a colleague from another unit who has not read it, on the grounds that it will help it land with a department whose support you need.',
    weight: 10,
    conditions: policy,
    choices: [
      {
        id: 'refuse',
        label: 'Refuse',
        text: 'You say that people who did not write it should not be on it. The paper goes out with the right names and lands slightly worse than it might have.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'genuinely',
        label: 'Ask him to actually review it',
        text: 'You send it to him with two weeks and a real request for comments. He gives you four, one of which is good. He earns the credit and the department’s support arrives with him.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'add',
        label: 'Add the name',
        text: 'It costs nothing visible and buys the support. Your team notices that their names are now on a list that includes someone who did not turn up.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.reversal', {
    kind: 'random',
    title: 'The opposite of last year',
    body: 'The administration has changed its mind. You are asked to write the paper arguing for the position you argued against, comprehensively, in a document with your name on it that is still on the website.',
    weight: 10,
    conditions: { ...policy, minLevel: 2 },
    choices: [
      {
        id: 'write_honestly',
        label: 'Write it, and say what changed',
        text: 'You make the new case properly and include a paragraph explaining which evidence changed and why the earlier view was reasonable at the time. It is the most respected thing you write that year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'write_silently',
        label: 'Write it as though the first paper never existed',
        text: 'Two documents, opposite conclusions, same author, no acknowledgement. Someone finds both eventually, because someone always does.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 4 },
        ],
      },
      {
        id: 'decline',
        label: 'Ask for it to be given to someone else',
        text: 'A reasonable request, reasonably granted, and quietly filed under things that are noted about people who will not turn.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
    ],
  }),
];
