import { defineEvent } from '../authoring';

/**
 * The long tail.
 *
 * The first followup pool covers the consequences every administrator recognises: the audit, the
 * inquiry, the press. These are slower and more specific — the ones that arrive years after the
 * decision, from a direction you had stopped watching. None of them are drawn at random; each is
 * scheduled by a choice made somewhere in the department pools.
 */
export const followupExtraEvents = [
  defineEvent('evt.followup.ombudsman', {
    kind: 'followup',
    title: 'The ombudsman has taken the case',
    body: 'The complaint you closed has been escalated, and accepted. The ombudsman’s office writes with the particular courtesy of an institution that does not need your cooperation to reach a conclusion.',
    choices: [
      {
        id: 'concede_early',
        label: 'Concede the point now and remedy it',
        text: 'You put the remedy in place before the finding is written. The report records that the administration corrected itself once the matter was properly examined, which is the best sentence available at this stage.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend the original decision',
        outcomes: [
          {
            weight: 2,
            text: 'The decision holds. Maladministration is not found and the file closes with a note that the process was followed. It has cost four months of correspondence to prove.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 3,
            text: 'Maladministration is found, a remedy is recommended, and the report is published with the administration named. The paragraph about the original response to the complaint is the one that gets quoted.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'integrity', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'systemic',
        label: 'Treat it as a systemic question, not a single case',
        text: 'You go looking for the other cases handled the same way. There are nineteen. You put all nineteen in front of the ombudsman before being asked, and the finding becomes a recommendation the whole administration adopts.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.court_ruling', {
    kind: 'followup',
    title: 'The court has ruled',
    body: 'Eighteen months after the advice was given, the point has been decided. The judgment runs to forty pages and paragraph 61 describes the administration’s legal reasoning in terms that will be quoted by other courts.',
    choices: [
      {
        id: 'circulate',
        label: 'Circulate it internally with what it means for us',
        text: 'You write four pages: what the court decided, which of the department’s practices are now unlawful, and what has to change by when. It is unwelcome and it is used as the working document for two years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'narrow_reading',
        label: 'Advise that it is confined to its facts',
        outcomes: [
          {
            weight: 2,
            text: 'It is arguably confined to its facts, and the administration proceeds unchanged for three years without being contradicted.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
            ],
          },
          {
            weight: 3,
            text: 'It is not confined to its facts. A second claimant establishes that within the year, at greater cost, and your note advising the narrow reading is disclosed in those proceedings.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
              { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 3 },
            ],
          },
        ],
      },
      {
        id: 'appeal',
        label: 'Recommend an appeal',
        conditions: { minStat: { politicalCapital: 25 } },
        text: 'Another two years and a great deal of money to test a point the department has already lost once. It is refused on cost grounds and the refusal is the moment the practice actually changes.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.funder_suspension', {
    kind: 'followup',
    title: 'Payments are suspended',
    body: 'The managing authority has suspended all payments to the programme pending an examination of the certification process. The administration is carrying six months of costs it cannot claim, and the letter names your department.',
    choices: [
      {
        id: 'action_plan',
        label: 'Put a corrective action plan in within the month',
        outcomes: [
          {
            weight: 3,
            text: 'Sixty pages in three weeks: what failed, what has changed, and what has been re-checked. The suspension lifts in the summer with a partial correction, and the plan is circulated to other bodies as an example.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'performance', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 11 },
            ],
          },
          {
            weight: 2,
            text: 'The plan is accepted in principle and the suspension holds for another two quarters while the sample is extended. The administration borrows to cover the gap.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 10 },
              { kind: 'queueEvent', eventId: 'evt.followup.recovery_order', delayTurns: 3 },
            ],
          },
        ],
      },
      {
        id: 'contest',
        label: 'Contest the suspension as disproportionate',
        text: 'A well-argued letter about proportionality, which is answered four months later, in the negative, by people who suspend payments for a living. The delay costs more than the correction would have.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 7 },
          { kind: 'queueEvent', eventId: 'evt.followup.recovery_order', delayTurns: 2 },
        ],
      },
      {
        id: 'withdraw_claims',
        label: 'Withdraw the affected claims and re-certify from scratch',
        text: 'You give back the doubtful expenditure before anyone demands it and rebuild the certification trail over five months. The administration loses a substantial sum and keeps the programme.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.recovery_order', {
    kind: 'followup',
    title: 'A financial correction',
    body: 'The figure is set out in the second paragraph and it has a lot of zeros. It is a flat-rate correction applied to the whole programme, because the failure was found to be systemic rather than isolated.',
    choices: [
      {
        id: 'accept_and_reform',
        label: 'Accept it and rebuild the control system',
        text: 'You pay, and then spend a year on the controls that should have existed. The next programme period passes its audit with two observations, and somebody in the room remembers who did that.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'negotiate_rate',
        label: 'Negotiate the flat rate down',
        outcomes: [
          {
            weight: 3,
            text: 'You demonstrate, file by file, that the failure was confined to one measure. The rate drops from ten per cent to two, which is four months of work and an enormous amount of money.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 6 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
          {
            weight: 2,
            text: 'The sample they extend to prove your point proves the opposite. The rate goes up.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 10 },
              { kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'push_it_down',
        label: 'Recover it from the beneficiaries',
        text: 'The correction is passed on to forty organisations that followed the guidance you gave them. It is lawful, it is what the rules contemplate, and eleven of them will not survive it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.contractor_claim', {
    kind: 'followup',
    title: 'The claim',
    body: 'The contractor has submitted a compensation claim running to nine heads and a number roughly a third of the original contract value. Most of it is opportunistic. Two heads of it are entirely justified, and both arise from decisions taken in this department.',
    choices: [
      {
        id: 'split',
        label: 'Concede the two that are good, resist the rest',
        outcomes: [
          {
            weight: 3,
            text: 'Settled in eleven weeks at a fifth of the claim, with the justified heads paid in full and the rest abandoned. The negotiation is the cleanest thing you do that year.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'They will not split it, and the whole thing goes to adjudication. The award is close to what you offered and arrives fourteen months later, having cost most of the difference in fees.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 9 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'reject_all',
        label: 'Reject the claim in full',
        text: 'A robust letter that does not acknowledge the two good heads. It is the position the administration takes by default, and it converts a negotiation into litigation that it goes on to lose on those two heads.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 8 },
          { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 4 },
        ],
      },
      {
        id: 'pay_to_close',
        label: 'Settle the whole claim quickly',
        text: 'Paid in six weeks with a confidentiality clause, because the alternative is two years of the finance director asking about it. The contractor tells the rest of the market what happened here.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.team_exodus', {
    kind: 'followup',
    title: 'Three resignations in five weeks',
    body: 'The first was a surprise. The third was not. Between them they are taking eleven years of knowledge of how this administration actually works, and the exit interviews are being conducted by HR with a template.',
    choices: [
      {
        id: 'own_it',
        label: 'Do the exit conversations yourself and report what they say',
        outcomes: [
          {
            weight: 3,
            text: 'You ask, properly, and they tell you: two of the three are leaving because of decisions you made. You write it up, unedited, and put your name on it. It is the most useful document the directorate reads that year and it is about you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'teamMorale', delta: 8 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'They are leaving for money and a shorter commute, mostly, and one of them for reasons she will not give you. The report is honest and less dramatic than the corridor version.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'teamMorale', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'backfill',
        label: 'Say nothing and fill the posts fast',
        text: 'Three recruitment panels in eight weeks and the establishment is whole again by autumn. Nobody asks why they left, so the reason is still in the room with the new people.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'teamMorale', delta: -4 },
          { kind: 'gainStaff', seniority: 'junior' },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'ask_the_rest',
        label: 'Ask the ones who stayed what would make them stay',
        text: 'Eight conversations, an hour each, and a list of nine things. Four of them are within your gift and you do all four inside a month. It does not undo the three, and it stops the fourth.',
        effects: [
          { kind: 'teamMorale', delta: 12 },
          { kind: 'stat', stat: 'stress', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.whistleblower', {
    kind: 'followup',
    title: 'Somebody went outside',
    body: 'A protected disclosure has been made to the external authority. It concerns a decision of yours, it is accurate, and it was made by someone who sat twenty metres from you and did not come to you first.',
    choices: [
      {
        id: 'cooperate',
        label: 'Cooperate fully and protect the discloser',
        outcomes: [
          {
            weight: 3,
            text: 'You give the authority everything, and you make it unmistakably clear inside the building that anyone who goes looking for who made the disclosure will answer to you. The finding goes against you and the way you handled it does not.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'teamMorale', delta: 8 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
          {
            weight: 2,
            text: 'You cooperate fully, and the examination concludes that the decision was within your authority and poorly recorded. The discloser stays, and something between you does not recover.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: -1 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'find_them',
        label: 'Find out who it was',
        text: 'It takes four days and two conversations. You do nothing with it, which you tell yourself is the same as not having found out. Everyone in the unit knows you looked.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -7 },
          { kind: 'teamMorale', delta: -12 },
          { kind: 'stat', stat: 'stress', delta: 6 },
          { kind: 'flag', flag: 'hunted_a_discloser' },
        ],
      },
      {
        id: 'lawyer_up',
        label: 'Answer only through the administration’s lawyers',
        text: 'Correct, cautious, and it converts a disclosure into a dispute. The authority takes eleven months instead of three and the department spends the year being represented rather than explaining itself.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'teamMorale', delta: -5 },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.power_returns', {
    kind: 'followup',
    title: 'The power is being used for something else',
    body: 'The instrument drafted in a hurry during the emergency is being relied on for a purpose nobody in that room contemplated. It is, on the words, entirely capable of bearing that meaning. You know because you let the words go.',
    choices: [
      {
        id: 'say_so',
        label: 'Advise that it was never intended for this, in writing',
        text: 'You set out the drafting history, including your own part in it. The use is abandoned, the instrument is narrowed at the next opportunity, and your note is the reason both things happen.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
      {
        id: 'the_words_are_the_words',
        label: 'Advise that the words permit it',
        text: 'Which they do. It is the correct legal answer to the question asked, and it is not the answer to the question that matters, and you are the only person who can tell the difference.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 4 },
        ],
      },
      {
        id: 'sunset_now',
        label: 'Propose repealing it immediately',
        outcomes: [
          {
            weight: 2,
            text: 'You get it repealed within the year by making the case that the emergency ended. It is a small, unnoticed, entirely real piece of public service.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
          },
          {
            weight: 3,
            text: 'Nobody repeals a useful power. The proposal is noted, thanked, and not progressed, and it is still on the books when you retire.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.successor_letter', {
    kind: 'followup',
    title: 'A message from someone doing your old job',
    body: 'An officer you have never met has been through the archive and found the decision. They are not accusing you of anything. They would like to understand why it was done that way, because they have to do it again and the file does not say.',
    choices: [
      {
        id: 'tell_them',
        label: 'Tell them exactly what happened, including the part that was wrong',
        text: 'You write two pages you would not have written at the time: the pressure, the reasoning, the thing you would do differently. They put it on the file. It is the most useful document in it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'official_version',
        label: 'Give the version that is already on the record',
        text: 'Accurate, complete, and it explains nothing they could not read for themselves. They thank you politely and make the same decision for the same unexamined reasons.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -3 }],
      },
      {
        id: 'no_time',
        label: 'You do not have time for this',
        text: 'It is a courteous email from a stranger about something from years ago and there are forty in the inbox from today. You do not reply, and the institutional memory of that decision ends there.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: -1 },
        ],
      },
    ],
  }),
];
