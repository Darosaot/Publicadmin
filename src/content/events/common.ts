import { defineEvent } from '../authoring';

/**
 * The cross-department pool. These carry most months of most careers, so they cover the widest
 * range of pressures: press, politics, colleagues, exhaustion, and the small compromises that
 * are only visible in retrospect.
 */
export const commonEvents = [
  defineEvent('evt.common.press_call', {
    kind: 'random',
    title: 'A journalist has your number',
    body: 'She is polite, well-briefed, and asking about a decision your department signed off three weeks ago. The press office is closed. She would like a comment before six.',
    weight: 12,
    choices: [
      {
        id: 'refer',
        label: 'Refer her to the press office',
        text: 'She writes the piece without you. It is not unfair, exactly, but the paragraph about your department reads as though nobody wanted to explain it.',
        effects: [{ kind: 'stat', stat: 'reputation', delta: -1 }],
      },
      {
        id: 'explain',
        label: 'Explain the file on the record',
        outcomes: [
          {
            weight: 3,
            text: 'You walk her through it. The article is accurate and quotes you twice as "an official familiar with the process". Two colleagues mention it approvingly.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'flag', flag: 'journalist_has_your_number' },
            ],
          },
          {
            weight: 2,
            text: 'You explain it well. The subeditor cuts the explanation and keeps the sentence that sounds worst. The director asks who authorised you to speak.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
              { kind: 'flag', flag: 'journalist_has_your_number' },
            ],
          },
        ],
      },
      {
        id: 'background',
        label: 'Talk on background, no attribution',
        text: 'The story runs with the context you gave and none of your name on it. She remembers. So do you.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'flag', flag: 'journalist_has_your_number' },
        ],
      },
    ],
  }),

  defineEvent('evt.common.councillor_favour', {
    kind: 'random',
    title: 'A small favour',
    body: 'A councillor stops you in the corridor. A constituent’s file has been sitting in the queue for five weeks, which is normal, and he would consider it a personal kindness if it moved to the front. He says "personal kindness" like a man making a note.',
    weight: 12,
    choices: [
      {
        id: 'refuse',
        label: 'Explain that the queue is the queue',
        text: 'He takes it well, in the way people take things well when they will remember. The file is processed in order. So is everyone else’s.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'expedite',
        label: 'Move it up the queue',
        text: 'It takes eleven minutes. He is genuinely grateful, and mentions your name approvingly in a meeting you are not in. Someone else’s file moved down by five weeks, and you will never know whose.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'flag', flag: 'owes_favour_councillor' },
        ],
      },
      {
        id: 'check',
        label: 'Check whether the delay is actually normal',
        text: 'It is not: the file was misrouted in week two. You fix the error, tell him exactly that, and copy the correction to the whole unit. He gets his answer, and the queue keeps its integrity.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.it_outage', {
    kind: 'random',
    title: 'The system is down',
    body: 'The case management system has been unavailable since Tuesday. IT say Thursday. IT said Thursday on Monday. Work is arriving and cannot be recorded, only remembered.',
    weight: 10,
    choices: [
      {
        id: 'paper',
        label: 'Run the week on paper',
        text: 'You improvise a paper register. It works, it is exhausting, and re-entering everything on Friday takes until nine in the evening.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 7 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'wait',
        label: 'Wait it out',
        text: 'The unit has a quiet week and a terrible following one. Two deadlines slip before anyone notices they were approaching.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: -3 },
        ],
      },
      {
        id: 'escalate',
        label: 'Escalate hard',
        text: 'You write to the IT director copying your own, in measured language that is unmistakably a complaint. The system is back on Wednesday. The IT director does not forget.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.stolen_credit', {
    kind: 'random',
    title: 'Someone else’s slide',
    body: 'In the management meeting, a colleague presents the analysis you spent three weeks on. He does not mention you. He does not not mention you either — he simply says "we", and everyone in the room hears one person.',
    weight: 11,
    choices: [
      {
        id: 'letit',
        label: 'Say nothing',
        text: 'The work speaks, eventually, to the two people who know whose it was. Neither of them is in the room that matters.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
      },
      {
        id: 'private',
        label: 'Raise it with him privately',
        outcomes: [
          {
            weight: 3,
            text: 'He is embarrassed and genuinely had not thought about it. At the next meeting he corrects the record unprompted, which costs him something and buys you more.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'politicalCapital', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'He explains, warmly, that the team’s work belongs to the team, and that he is surprised you would think in those terms. You have learned something about him, at the cost of him having learned something about you.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'public',
        label: 'Correct the record in the room',
        outcomes: [
          {
            weight: 2,
            text: 'You say it plainly and without heat. The director notes it. Two people tell you afterwards that they were glad you did, and one tells you that you should not have.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
            ],
          },
          {
            weight: 2,
            text: 'It lands badly. The room reads it as a squabble rather than a correction, and the analysis is now the thing that caused an awkward moment.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.common.budget_cut', {
    kind: 'random',
    title: 'Four per cent',
    body: 'A mid-year correction. Every department loses four per cent, effective immediately, and is asked to indicate where. The honest answer for your unit is that there is nothing left to cut that is not a person or a promise.',
    weight: 10,
    choices: [
      {
        id: 'honest',
        label: 'Say there is nothing left to cut',
        text: 'You send a one-page note setting out what four per cent actually means in service terms. It is not the answer anyone wanted. It is quoted, twice, in the meeting where the cut is reduced to two.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'comply',
        label: 'Find the four per cent',
        text: 'You defer two contracts and a piece of maintenance into next year, where they will cost more. The form is returned on time and marked as satisfactory.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'creative',
        label: 'Cut what the centre will not notice',
        text: 'Training, subscriptions, the small budget for the thing nobody has audited in years. It adds to four per cent on paper. Your team notices within a month.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: -1 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.strike_day', {
    kind: 'random',
    title: 'Strike day',
    body: 'The unions have called a stoppage over the pay settlement. Half the building will not be in. The work does not know that, and the statutory deadlines certainly do not.',
    weight: 9,
    choices: [
      {
        id: 'join',
        label: 'Join the stoppage',
        text: 'You stand outside with people you have worked beside for years and discover you like most of them more than you knew. A day’s pay, and a day’s work waiting on Wednesday.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: -2 },
        ],
      },
      {
        id: 'work',
        label: 'Work through it',
        text: 'The office is quiet enough to get more done than in any normal week. Two colleagues make a point of noticing that you were at your desk.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'minimum',
        label: 'Cover only the statutory minimum',
        text: 'You keep the legally-required service running and nothing else, which is both a defensible position and, everyone understands, a choice.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 2 }],
      },
    ],
  }),

  defineEvent('evt.common.new_director', {
    kind: 'random',
    title: 'A new director',
    body: 'The post has been filled from outside. She has spent twenty years in the private sector, uses the word "deliverables" without irony, and has asked each unit for a one-page account of what it does and why.',
    weight: 9,
    cooldown: 24,
    choices: [
      {
        id: 'impress',
        label: 'Write the page she is asking for',
        outcomes: [
          {
            weight: 3,
            text: 'You give her something clear, honest and short. She reads it, asks two good questions, and remembers your name for the rest of the year.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'You give her something clear and honest. She reads the honest part as defensiveness, and the unit spends a month proving a point it should not have had to prove.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'minimal',
        label: 'Send the standard description',
        text: 'The existing text, lightly updated. It is accurate and says nothing. She moves on to units that gave her something to hold.',
        effects: [{ kind: 'stat', stat: 'reputation', delta: -1 }],
      },
      {
        id: 'pitch',
        label: 'Use the page to pitch a change you want',
        text: 'You describe the unit, then describe what it could do with one more person and a decision that has been pending for two years. She does not grant it. She does put your name against it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.training_offer', {
    kind: 'random',
    title: 'Four days in the capital',
    body: 'A place has come up on a course — administrative procedure, taught by people who write the manuals. Four working days, at a moment when you have no four working days.',
    weight: 9,
    choices: [
      {
        id: 'go',
        label: 'Take the place',
        text: 'You come back knowing three things you did not know and holding six business cards, two of which will matter. Your desk has not forgiven you.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'decline',
        label: 'Give the place to someone in the unit',
        text: 'A junior colleague goes instead and returns visibly larger. She will remember who sent her.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
      {
        id: 'skip',
        label: 'Let the place go',
        text: 'The week proceeds. Nothing is lost that you can point to.',
        effects: [{ kind: 'stat', stat: 'stress', delta: -2 }],
      },
    ],
  }),

  defineEvent('evt.common.late_culture', {
    kind: 'random',
    title: 'The people who are still here at eight',
    body: 'It has become normal in your unit to still be at a desk at eight in the evening. Nobody asked for it. Nobody is being paid for it. It has simply become what people who are serious about the work are seen to do.',
    weight: 10,
    choices: [
      {
        id: 'match',
        label: 'Be one of them',
        text: 'The work gets done and you are seen doing it, which are two different currencies and you collect both.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'leave',
        label: 'Leave at five and mean it',
        text: 'You go home. Some weeks that is the whole of the achievement, and it is not nothing.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
        ],
      },
      {
        id: 'change',
        label: 'Send everyone home at six',
        text: 'You say it out loud, in a meeting, as a rule: nothing here is worth someone’s evening. Two people are relieved. One thinks you are managing decline.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: -1 },
        ],
        conditions: { minLevel: 2 },
      },
    ],
  }),

  defineEvent('evt.common.angry_citizen', {
    kind: 'random',
    title: 'At the counter',
    body: 'A man has been coming in for three weeks about a decision that will not be changed, because it cannot be changed, because the law does not permit it. Today he is shouting. He is also, on the merits, right that the outcome is unjust.',
    weight: 10,
    choices: [
      {
        id: 'procedure',
        label: 'Follow the procedure exactly',
        text: 'You explain the appeal route, in writing, calmly, for the fourth time. He leaves. The outcome remains unjust and correctly arrived at.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
      },
      {
        id: 'time',
        label: 'Sit down with him for an hour',
        text: 'You cannot fix it. You can explain it properly, find him the two things that might actually help, and treat him as a person for sixty minutes. He writes a letter to the director. It is not a complaint.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'escalate',
        label: 'Call security',
        text: 'He is escorted out. The incident is logged. Everything you did was permitted and nothing about it sits well.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.conference_invite', {
    kind: 'random',
    title: 'They want you to speak',
    body: 'A regional conference on administrative modernisation would like twenty minutes from someone who does the work rather than someone who manages it. Your director has forwarded the invitation with the single word "Interested?".',
    weight: 8,
    conditions: { minStat: { reputation: 30 } },
    choices: [
      {
        id: 'speak',
        label: 'Do it',
        outcomes: [
          {
            weight: 3,
            text: 'You speak plainly about something that actually works and something that actually does not. Three people find you afterwards. One of them runs a department twice the size of yours.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 1,
            text: 'It goes fine. The room is half-full and mostly checking its email, and the sandwiches are the memorable part.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 1 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline politely',
        text: 'Someone else goes. You have a quiet Thursday, which this month is worth more than a slide deck.',
        effects: [],
      },
    ],
  }),

  defineEvent('evt.common.junior_error', {
    kind: 'random',
    title: 'A mistake that has left the building',
    body: 'A junior colleague sent the wrong figures to an external body. He has just realised, is the colour of paper, and has come to you rather than to anyone else.',
    weight: 11,
    choices: [
      {
        id: 'cover',
        label: 'Fix it quietly and say nothing',
        outcomes: [
          {
            weight: 3,
            text: 'A corrected version goes out with an apology for the "formatting issue". Nobody asks. He will not make that mistake again, and he owes you.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
            ],
          },
          {
            weight: 1,
            text: 'The external body had already circulated the original. The correction arrives after the meeting that used the wrong figures, and now there are two problems.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'report',
        label: 'Report it properly, with him',
        text: 'You walk into the director’s office together and you do the talking. It is a bad twenty minutes and a clean file. He does not forget that you went in first.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'his_problem',
        label: 'Tell him to report it himself',
        text: 'He does, alone, badly. The error is corrected and something between the two of you is not.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: 1 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.old_irregularity', {
    kind: 'random',
    title: 'Something in an old file',
    body: 'Looking for something else, you find a file from before your time. A payment was authorised by someone who did not have authority to authorise it. The amount is not large. The person is now quite senior.',
    weight: 8,
    choices: [
      {
        id: 'report',
        label: 'Report it',
        outcomes: [
          {
            weight: 3,
            text: 'It goes to internal audit. There is a process, it takes four months, and the finding is "procedural irregularity, no loss to the administration". He knows it was you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'It goes to internal audit and lands in a year when someone wants a scalp. The consequences for him are severe and disproportionate, and you are not sure, afterwards, that you were wrong.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -7 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'file',
        label: 'Put the file back',
        text: 'You put it back. It is six years old, the money was properly spent, and you have eleven things to do today. The knowledge stays with you, which is its own small weight.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'flag', flag: 'knows_old_irregularity' },
        ],
      },
      {
        id: 'mention',
        label: 'Mention to him that you found it',
        text: 'He goes very still, then thanks you, warmly, twice. Nothing is reported. You now have something, and he knows you have it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'flag', flag: 'holds_leverage' },
        ],
      },
    ],
  }),

  defineEvent('evt.common.christmas_gift', {
    kind: 'random',
    title: 'A crate arrives in December',
    body: 'A supplier your department contracts with has sent a case of wine. There is a card. The value is somewhere just below the threshold in the code of conduct, which suggests someone checked the threshold.',
    weight: 10,
    choices: [
      {
        id: 'return',
        label: 'Send it back with a note',
        text: 'You return it with two polite lines citing the code. The supplier is embarrassed, the note goes in the file, and your unit spends December telling the story.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'declare',
        label: 'Declare it and put it in the staff raffle',
        text: 'Registered, declared, raffled. Entirely correct, mildly festive, and the register now shows you registering things.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: 3 }],
      },
      {
        id: 'keep',
        label: 'Take it home',
        text: 'It is under the threshold. It is also, unmistakably, a supplier buying goodwill for the price of six bottles, and the goodwill has been bought.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'flag', flag: 'accepted_supplier_gift' },
        ],
      },
    ],
  }),

  defineEvent('evt.common.reorg_rumour', {
    kind: 'random',
    title: 'The restructure everyone is discussing',
    body: 'There is a document. Nobody has seen the document. Everybody knows what is in the document. Your unit may be merged, split, moved under someone else, or left exactly as it is, and all four versions are being discussed as fact.',
    weight: 9,
    choices: [
      {
        id: 'lobby',
        label: 'Lobby quietly for your unit',
        outcomes: [
          {
            weight: 3,
            text: 'Three careful conversations with people who will be in the room. When the document appears, your unit is intact and one of the arguments in it is yours.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'Your lobbying is noticed and read as manoeuvring. The document lands unchanged and someone senior now thinks of you as a person who manoeuvres.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'work',
        label: 'Ignore it and do the work',
        text: 'The restructure happens or does not. Your files are in order either way, which turns out to be the thing that protects you.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 2 },
        ],
      },
      {
        id: 'calm',
        label: 'Tell your team what you actually know',
        text: 'Which is very little, and you say so. The rumours do not stop, but the unit stops running on them, and productivity quietly recovers.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.cover_colleague', {
    kind: 'random',
    title: 'Cover',
    body: 'A colleague is signed off for six weeks. Nobody is backfilling. Her caseload has been distributed by an email that used the phrase "as far as possible".',
    weight: 11,
    choices: [
      {
        id: 'absorb',
        label: 'Absorb the caseload',
        text: 'You take it. The work is done, at a cost that does not appear in any report and shows up entirely in you.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
      {
        id: 'triage',
        label: 'Take the urgent files only',
        text: 'You handle what has a legal deadline and let the rest wait for her return, in writing, so that the decision is visible and belongs to the organisation rather than to you.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
      {
        id: 'refuse',
        label: 'Say the unit cannot absorb it',
        text: 'You put the gap in writing to the director and decline to paper over it. It is the correct management response and it makes you, for a month, the difficult one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.mentor', {
    kind: 'random',
    title: 'Coffee with someone who has been here longer',
    body: 'A director two floors up, four years from retirement, asks you to coffee for no stated reason. Halfway through she says: "Can I tell you the thing nobody tells you?"',
    weight: 8,
    conditions: { maxLevel: 3 },
    choices: [
      {
        id: 'listen',
        label: 'Listen',
        text: '"The work is never the problem. The problem is that you will be asked to be useful to people whose purposes are not yours, and you will not always be able to tell which is which until afterwards." You think about it for a year.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
      {
        id: 'ask',
        label: 'Ask her how to get where she is',
        text: 'She tells you, specifically and without romance: two moves, one of which will feel like a step sideways, and the willingness to be the person who says the unwelcome thing early rather than late.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.photo_op', {
    kind: 'random',
    title: 'The mayor would like a photograph',
    body: 'A project of yours has finished, on time and slightly under budget. The mayor’s office would like to announce it on Thursday, with the mayor, at the site, in a hard hat.',
    weight: 9,
    choices: [
      {
        id: 'arrange',
        label: 'Arrange it and stand at the back',
        text: 'It goes well. The mayor’s office is grateful, the announcement is accurate, and you are the person who made someone else look good, which is a thing that gets remembered by exactly the right people.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'front',
        label: 'Make sure the team is in the photograph',
        text: 'You insist the people who did the work are in the frame. The mayor’s office finds this mildly inconvenient and complies. Your team notices for years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'correct',
        label: 'Point out the announcement overstates it',
        text: 'The draft claims a benefit the project does not deliver. You say so. The wording is fixed and the mayor’s office schedules its next announcement without consulting you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.leak_hunt', {
    kind: 'random',
    title: 'Someone talked',
    body: 'A draft document appeared in the local paper on Sunday. On Monday every person who had access is asked, individually and pleasantly, whether they know anything about it. You had access. You know who did it.',
    weight: 8,
    choices: [
      {
        id: 'silent',
        label: 'Say you know nothing',
        text: 'The investigation concludes without finding anyone. You have protected a colleague and lied to your employer, and both of those are true at once.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'name',
        label: 'Say what you know',
        text: 'She is moved to another department within a month. The leak was, on any honest reading, in the public interest. You did what the procedure required and the building is colder for a year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'principle',
        label: 'Refuse to answer at all',
        text: 'You say, on the record, that you will not participate in identifying a colleague, and that if that is a disciplinary matter you accept it. It is not, in the end. It is remembered.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.family_evening', {
    kind: 'random',
    title: 'The thing you said you would be at',
    body: 'The deadline is Friday and the work is not finished. The other thing is also Friday, and you have moved it twice, and the person concerned has stopped asking whether you will be there.',
    weight: 11,
    choices: [
      {
        id: 'work',
        label: 'Stay and finish it',
        text: 'The file goes out at eleven and is good. You send a message that is answered the next morning with a single word.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'go',
        label: 'Go',
        text: 'You go. The file goes out on Monday, two days late, with an apology that is accepted without comment. You are glad you went.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: -7 },
        ],
      },
      {
        id: 'delegate',
        label: 'Hand it to someone else and go',
        conditions: { minLevel: 2 },
        text: 'You brief a colleague properly, hand it over, and leave. It is finished on time and not quite as you would have done it, which turns out to be an acceptable price.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 1 },
          { kind: 'stat', stat: 'politicalCapital', delta: -1 },
        ],
      },
    ],
  }),
];
