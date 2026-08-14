import { defineEvent } from '../authoring';

/**
 * Consequences. Nothing here is ever drawn at random — every one of these is scheduled by an
 * earlier decision or a missed deadline, which is the whole point: the game remembers.
 */
export const followupEvents = [
  defineEvent('evt.followup.audit_letter', {
    kind: 'followup',
    title: 'A letter from the audit authority',
    body: 'Two pages, courteous, with a list of documents to be provided within twenty working days. They have selected a file you would not have chosen for them.',
    choices: [
      {
        id: 'full',
        label: 'Give them everything, properly indexed',
        outcomes: [
          {
            weight: 3,
            text: 'You spend a fortnight assembling a complete, indexed response. The finding is a minor observation with no financial correction. The auditor’s covering note uses the word "exemplary" about the file management.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'The file is as weak as you feared. A correction is proposed and the matter is referred onward for a fuller look.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 7 },
              { kind: 'queueEvent', eventId: 'evt.followup.investigation', delayTurns: 3 },
            ],
          },
        ],
      },
      {
        id: 'minimum',
        label: 'Answer exactly what was asked',
        outcomes: [
          {
            weight: 3,
            text: 'A narrow, correct response. They close the file with one observation. Nothing further is asked.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
          },
          {
            weight: 2,
            text: 'The narrowness is itself noticed. A second, longer list of documents arrives four weeks later.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
              { kind: 'queueEvent', eventId: 'evt.followup.investigation', delayTurns: 4 },
            ],
          },
        ],
      },
      {
        id: 'delay',
        label: 'Ask for an extension and hope it goes quiet',
        text: 'Granted once. Audits do not go quiet; they go slow. The same request arrives in the spring with a firmer sentence at the end.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.investigation', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.investigation', {
    kind: 'followup',
    title: 'This is now a formal matter',
    body: 'The file has been referred to a formal investigation. You are not the subject of it, in the sense that nobody has said you are. You have been asked to provide a written account of your involvement, and to keep the request confidential.',
    choices: [
      {
        id: 'full_account',
        label: 'Write a complete and honest account',
        outcomes: [
          {
            weight: 4,
            text: 'You set out what you knew, when, and what you did about it. The investigation concludes that the failures were systemic and predate you. Your account is quoted in the recommendations.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'Your account is complete, honest, and contains the sentence that establishes you knew. The finding is that you acted within your authority and below the standard expected.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 3 },
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'minimal',
        label: 'Give a careful, narrow account',
        outcomes: [
          {
            weight: 3,
            text: 'Accurate, unhelpful, and unimpeachable. The investigation moves on to people who wrote more freely.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'The narrowness is contrasted, in the report, with the accounts of two colleagues. Nothing is alleged. The contrast is the finding.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -4 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'lawyer',
        label: 'Take advice before answering anything',
        text: 'Sensible, expensive, and entirely proper. It also takes six weeks and everyone in the building knows you did it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.annulment', {
    kind: 'followup',
    title: 'The contract has been annulled',
    body: 'The clause you noticed has been noticed by someone else. The court has annulled the award. The works are two thirds complete, the contractor is claiming, and the file records that the flaw was identifiable from the start.',
    choices: [
      {
        id: 'own_it',
        label: 'State on the record that you identified it and what you did',
        outcomes: [
          {
            weight: 3,
            text: 'You produce the note, the date, and the person you gave it to. The failure is located where it belongs, which is not with you, and the administration learns something expensive.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
            conditions: { forbiddenFlags: ['knows_contract_flaw'] },
          },
          {
            weight: 3,
            text: 'You say you raised it. There is no note, because you were careful not to leave one, and the conversation you are describing is remembered differently by the only other person in it.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -7 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Say nothing about having seen it',
        text: 'The inquiry establishes that nobody in the legal department identified the flaw. That finding is now permanent, and it is not true, and you are the only person who knows both of those things.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -8 },
          { kind: 'stat', stat: 'stress', delta: 8 },
          { kind: 'flag', flag: 'lied_to_an_inquiry' },
        ],
      },
      {
        id: 'fix_forward',
        label: 'Focus entirely on limiting the damage',
        text: 'You spend two months on the settlement, the re-tender and the contractor’s claim, and reduce the cost to the administration by a very large number. Nobody asks who knew what, because you have made yourself indispensable to the clean-up.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 12 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.supplier_challenge', {
    kind: 'followup',
    title: 'A formal challenge',
    body: 'A supplier’s lawyers have written. They are contesting the procedure, they have identified a genuine irregularity, and they have asked for every document relating to the decision.',
    choices: [
      {
        id: 'concede',
        label: 'Concede the point and rerun',
        text: 'It costs eleven weeks and a modest amount of face, and it ends the matter completely. The re-run procedure is the cleanest one the department has produced in years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend the procedure',
        outcomes: [
          {
            weight: 2,
            text: 'The irregularity turns out to be immaterial and the challenge fails. The department’s decision stands and the supplier pays its own costs.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 3,
            text: 'The challenge succeeds. The award is set aside, damages are agreed, and the judgment contains three paragraphs about the administration’s evaluation practice.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
            ],
          },
        ],
      },
      {
        id: 'settle',
        label: 'Settle quietly',
        text: 'A payment, a confidentiality clause, and no admission of anything. It is over by the end of the month and it is on the file for ten years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.press_question', {
    kind: 'followup',
    title: 'A list of eleven questions',
    body: 'A journalist has sent eleven numbered questions to the press office. Nine are easy. Two are specific enough that somebody has been talking, and both are about a decision of yours.',
    choices: [
      {
        id: 'answer_fully',
        label: 'Answer all eleven properly',
        outcomes: [
          {
            weight: 3,
            text: 'The article is fair. The two difficult answers are quoted in full, which is what makes it fair, and the story dies in a week.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'The article is fair to the administration and hard on you personally, because the honest answer to question seven is that you made a judgement call and it was wrong.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'nine',
        label: 'Answer the nine, deflect the two',
        text: '"The administration does not comment on individual cases." He publishes the deflection verbatim, twice, which is more damaging than either answer would have been.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'nothing',
        label: 'Refer everything to the press office and go home',
        text: 'The press office answers, adequately, without knowing the two things that mattered. The article notes that the official responsible was not made available.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.councillor_question', {
    kind: 'followup',
    title: 'A question on the council agenda',
    body: 'Item fourteen: a written question about your department’s handling of the matter. It has been tabled by a councillor who has read the file more carefully than most people in the building.',
    choices: [
      {
        id: 'brief_fully',
        label: 'Brief the chair with the whole picture',
        text: 'You give them everything, including what went wrong. The answer given in the chamber is accurate and survives the follow-up question, which is the only test that matters.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'minimal_brief',
        label: 'Brief the minimum that answers the question',
        outcomes: [
          {
            weight: 3,
            text: 'The answer is technically complete and the follow-up question does not come. Item fifteen is reached at twenty past eight.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
          },
          {
            weight: 2,
            text: 'The follow-up question comes, and the chair does not have the answer, and finds out in public that they were not told everything.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'reputation', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'lobby',
        label: 'Get the question withdrawn',
        conditions: { minStat: { politicalCapital: 30 } },
        text: 'Two conversations and the item comes off the agenda before the meeting. It costs you a favour you would rather have kept, and the councillor knows exactly what happened.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -8 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.complaint', {
    kind: 'followup',
    title: 'A formal complaint',
    body: 'A citizen has complained, in writing, about how their case was handled. Reading it, most of it is a misunderstanding of the procedure and one paragraph of it is entirely correct.',
    choices: [
      {
        id: 'uphold_part',
        label: 'Uphold the part that is right',
        text: 'You explain the eight things that were correctly done and concede the one that was not, with an apology and a fix. They write back to say that nobody has ever done that before.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'reject',
        label: 'Reject it in full',
        text: 'A careful, defensible letter that does not concede the paragraph that was right. It is escalated to the ombudsman, where the same paragraph is found again, by someone with more authority.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'delegate',
        label: 'Pass it to the complaints unit',
        text: 'They handle it competently and generically. The correct paragraph is answered with a template. Nothing changes.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -2 },
          { kind: 'stat', stat: 'integrity', delta: -1 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.internal_review', {
    kind: 'followup',
    title: 'Internal review',
    body: 'Someone has asked the internal control unit to look at how the file was handled. This is routine, in the sense that nothing about it is unusual and everyone involved is behaving as though it is.',
    choices: [
      {
        id: 'cooperate',
        label: 'Cooperate fully and volunteer the weak points',
        text: 'You tell them what you would have done differently before they find it. The report contains three recommendations, all of which you had already made, and one sentence noting your candour.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend the handling as correct throughout',
        outcomes: [
          {
            weight: 3,
            text: 'It was, broadly, correct throughout. The review closes with no findings and you have spent three weeks proving something you knew.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 5 }],
          },
          {
            weight: 2,
            text: 'The review finds two things you had defended as correct and were not. A defence that fails costs more than an admission that was never made.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'integrity', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.reprimand', {
    kind: 'followup',
    title: 'A conversation with the door closed',
    body: 'Your director would like a word. The word is about the thing that was late, and it is being had formally enough that there will be a note.',
    choices: [
      {
        id: 'accept',
        label: 'Accept it and set out how it will not recur',
        text: 'You do not argue, you explain the cause, and you leave with a plan. The note records the plan alongside the failure, which is the best available version of this conversation.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -1 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'context',
        label: 'Explain the workload that caused it',
        outcomes: [
          {
            weight: 3,
            text: 'He listens, checks, and finds that the unit is carrying two vacancies. The note is written differently and one of the vacancies is filled within the quarter.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: -4 },
            ],
          },
          {
            weight: 2,
            text: 'He hears it as an excuse, says so, and the note is longer than it would have been.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Point at the department that held you up',
        text: 'It is true and it is unanswerable and it makes an enemy of a head of department who will be in your professional life for another decade.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 1 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.union_grievance', {
    kind: 'followup',
    title: 'A grievance',
    body: 'A member of your team has raised a formal grievance about the appraisal process. The union representative is calm, thorough, and has identified a procedural step that was, in fact, skipped.',
    choices: [
      {
        id: 'concede',
        label: 'Concede the procedural point and redo it',
        text: 'You run the step properly, with the representative present. The outcome is unchanged and the process is now sound, and the team saw that a complaint against you produced a fair result.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend the appraisal',
        text: 'The substance holds, the procedure does not, and the grievance is upheld on the technical ground alone. The team hears "upheld".',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'hr',
        label: 'Hand the whole thing to HR',
        text: 'It is resolved in four months by people who have never met either of you. Nobody is satisfied and nothing recurs, because nobody will risk an appraisal conversation again.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.minister_hearing', {
    kind: 'followup',
    title: 'The hearing',
    body: 'The parliamentary committee has three hours. They have your career in front of them: every file, every decision, every note you wrote and every one you did not. The questions are being asked by people who have prepared.',
    choices: [
      {
        id: 'record',
        label: 'Stand on your record',
        outcomes: [
          {
            weight: 4,
            text: 'You answer everything, including the two questions that hurt. The committee’s report notes that you did not evade, and that your account of the difficult decisions matched the documents.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'queueEvent', eventId: 'evt.followup.minister_appointment', delayTurns: 1 },
            ],
            conditions: { minStat: { integrity: 40 } },
          },
          {
            weight: 4,
            text: 'They have found three of them. Not the worst three, but three, and your answers are careful in a way that reads on television as careful.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
              { kind: 'stat', stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'allies',
        label: 'Let your allies manage the committee',
        conditions: { minStat: { politicalCapital: 60 } },
        text: 'The difficult questions are asked by people who have agreed in advance how they will be answered. It is an unedifying three hours and it works completely.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -12 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.minister_appointment', delayTurns: 1 },
        ],
      },
      {
        id: 'withdraw',
        label: 'Withdraw your name',
        text: 'You write two paragraphs saying that the department is better served by someone who has not made the decisions you have made. It is read as either dignity or fear, depending on who is reading.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'flag', flag: 'declined_the_ministry' },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.minister_appointment', {
    kind: 'followup',
    title: 'The appointment',
    body: 'It is done. The decree is signed on a Thursday and you are driven to a building you have visited fifty times and entered, until now, through a different door. There is a folder on the desk with eleven decisions in it that have been waiting for a minister.',
    choices: [
      {
        id: 'open_folder',
        label: 'Open the folder',
        text: 'You start at the top. Twenty-two years ago you were three days into a job in Alderford, wondering whether any of it mattered, and now the answer to that question is in your hands and it is heavier than you expected.',
        effects: [{ kind: 'endGame', ending: 'minister' }],
      },
    ],
  }),
];
