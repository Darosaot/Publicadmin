import { defineEvent } from '../authoring';

/** Only reachable once there is a unit under you. */
const managing = { requiresTeam: true as const };

/**
 * Running an office.
 *
 * The through-line of this pool is that management decisions are rarely about the work. They are
 * about people who are tired, budgets that must be spent by December, posts that will not be
 * filled, and the difference between what is fair and what is possible.
 */
export const managementEvents = [
  defineEvent('evt.mgmt.underperformer', {
    kind: 'random',
    title: 'The one who is struggling',
    body: 'One of your officers has been slower and looser than the rest for four months. Everyone in the unit knows. Nobody has said it to them, including you, and the longer that stays true the harder it gets.',
    weight: 12,
    conditions: { ...managing, minStaffCount: 2 },
    choices: [
      {
        id: 'honest',
        label: 'Tell them plainly, and offer a plan',
        outcomes: [
          {
            weight: 3,
            text: 'It is a difficult hour and the right one. You set out what has to change, in writing, with support attached. Within two months they are visibly better and the unit has learned that you say things.',
            effects: [
              { kind: 'teamSkill', delta: 3 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'They hear it as an attack, and it becomes a formal process that takes seven months and ends where it started. You were right to raise it and it cost more than it should have.',
            effects: [
              { kind: 'teamMorale', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'redistribute',
        label: 'Quietly move the work to others',
        text: 'The files go to the people who will finish them. Output holds up for a while. The people carrying the extra notice long before you acknowledge it, and they draw the obvious conclusion about what happens to good work here.',
        effects: [
          { kind: 'teamMorale', delta: -7 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
      {
        id: 'find_fit',
        label: 'Find out what they are actually good at',
        outcomes: [
          {
            weight: 3,
            text: 'An hour of genuine conversation establishes that they are in the wrong job, not a bad officer. Reshaped around what they can do, they become the most reliable person in the unit at it.',
            effects: [
              { kind: 'teamMorale', delta: 6 },
              { kind: 'teamSkill', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'You find nothing they are markedly better at. The conversation was kind and changed nothing, and you have spent your goodwill on a problem that is still there.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 5 }],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.star_leaving', {
    kind: 'random',
    title: 'Your best officer has an offer',
    body: 'She tells you before she tells anyone, which is a courtesy. It is more money and a bigger title in an agency two streets away. She is asking, without asking, whether there is a reason to stay.',
    weight: 12,
    conditions: { ...managing, minStaffCount: 2 },
    choices: [
      {
        id: 'fight',
        label: 'Fight to keep her',
        conditions: { minStat: { politicalCapital: 25 } },
        outcomes: [
          {
            weight: 3,
            text: 'You spend real capital on a regrade that HR said was impossible. She stays, and the whole unit watches you spend it on her.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
              { kind: 'teamMorale', delta: 9 },
            ],
          },
          {
            weight: 2,
            text: 'The regrade is refused at the third attempt and she goes anyway. You are left having publicly failed to deliver something you publicly tried to deliver.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'loseStaff' },
              { kind: 'teamMorale', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'bless',
        label: 'Tell her to take it',
        text: 'You say what is true: it is a better job and she has earned it. She leaves well, recommends the unit to two people, and calls you twice a year for the rest of your career.',
        effects: [
          { kind: 'loseStaff' },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'teamMorale', delta: 2 },
        ],
      },
      {
        id: 'guilt',
        label: 'Remind her what the unit has invested in her',
        outcomes: [
          {
            weight: 2,
            text: 'She stays, out of obligation, and is a different colleague afterwards — present, competent, and gone in every way that matters.',
            effects: [{ kind: 'teamMorale', delta: -8 }, { kind: 'stat', stat: 'integrity', delta: -4 }],
          },
          {
            weight: 3,
            text: 'She goes, and tells people why. It is a small profession and the story travels further than you would like.',
            effects: [
              { kind: 'loseStaff' },
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.headcount_freeze', {
    kind: 'random',
    title: 'The post will not be filled',
    body: 'The vacancy you have been recruiting to has been frozen centrally, along with every other vacancy in the directorate. The work it was going to do has not been frozen.',
    weight: 11,
    conditions: managing,
    choices: [
      {
        id: 'absorb',
        label: 'Ask the unit to absorb it',
        text: 'You explain it honestly and they take it on, because they always do. Three months later the effect is visible in the quality of everything and in the faces at the Monday meeting.',
        effects: [
          { kind: 'teamMorale', delta: -8 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'stop_doing',
        label: 'Decide publicly what the unit will stop doing',
        outcomes: [
          {
            weight: 3,
            text: 'You write down what will no longer be done and who is affected, and send it upward. It is uncomfortable, it is unanswerable, and the freeze is lifted for your unit within the quarter.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'teamMorale', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
            ],
          },
          {
            weight: 2,
            text: 'The list is read as a threat rather than a plan. The freeze stays, and so does the list, in a file with your name on it.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'teamMorale', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'agency',
        label: 'Cover it with agency staff',
        text: 'Permitted, because it comes from a different budget line, and roughly twice the cost of the person you were not allowed to hire. The work gets done. The accounts record the whole absurdity faithfully.',
        effects: [
          { kind: 'budget', delta: -9000 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.december_underspend', {
    kind: 'random',
    title: 'December',
    body: 'The unit is going to end the year underspent by a sum that will be noticed. Everyone knows what happens to a budget that was not needed. Your finance business partner has sent a cheerfully worded list of things that could be bought before the thirty-first.',
    weight: 12,
    conditions: managing,
    choices: [
      {
        id: 'spend',
        label: 'Spend it before the year ends',
        text: 'Laptops eighteen months early, a piece of consultancy nobody will read, and a training package booked for people who have not asked for it. The allocation is protected. You know precisely what you have just done.',
        effects: [
          { kind: 'budget', delta: -14000 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'teamSkill', delta: 2 },
        ],
      },
      {
        id: 'return',
        label: 'Hand it back',
        outcomes: [
          {
            weight: 2,
            text: 'You return it with a note explaining why it was not needed. Somebody senior reads the note, quotes it approvingly, and your allocation survives intact.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
            ],
          },
          {
            weight: 3,
            text: 'You return it, and next year’s allocation arrives lower by exactly that amount. Nobody reads the note. The lesson lands on your whole team.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'budgetMonthly', delta: -900 },
              { kind: 'teamMorale', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'invest',
        label: 'Spend it on something the unit actually needs',
        text: 'You find the thing that has been on the "when there is money" list for three years, and buy that. It is defensible, it is useful, and it took a weekend to work out.',
        effects: [
          { kind: 'budget', delta: -11000 },
          { kind: 'teamSkill', delta: 4 },
          { kind: 'teamMorale', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.two_staff_feud', {
    kind: 'random',
    title: 'Two of them will not work together',
    body: 'It started with a disagreement about a file eight months ago and is now a fact of the office that everyone routes around. Meetings are arranged so they do not overlap. Work is duplicated to avoid a handover.',
    weight: 11,
    conditions: { ...managing, minStaffCount: 3 },
    choices: [
      {
        id: 'mediate',
        label: 'Put them in a room and stay in it',
        outcomes: [
          {
            weight: 3,
            text: 'Ninety minutes, most of it unpleasant, and it turns out to be about credit for a piece of work in the spring. Named, it deflates. They will never be friends and they are colleagues again.',
            effects: [
              { kind: 'teamMorale', delta: 7 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'Ninety minutes establishes that it is not about a file at all, and that one of them has a case the other cannot answer. You now have a formal problem you cannot un-know.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'teamMorale', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'separate',
        label: 'Restructure around it',
        text: 'You split the work so their paths never cross. It costs efficiency, it works, and the unit reads it correctly as management declining to manage.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'teamMorale', delta: -3 },
          { kind: 'queueEvent', eventId: 'evt.followup.team_exodus', delayTurns: 6 },
        ],
      },
      {
        id: 'ignore',
        label: 'Leave it; adults sort themselves out',
        text: 'They do not. Six weeks later a handover fails in a way that is visible outside the unit, and the cause is obvious to everyone who has been watching.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'teamMorale', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.burnt_out_officer', {
    kind: 'random',
    title: 'Someone is running on empty',
    body: 'He has covered two vacancies for five months, answers email at eleven at night, and told you last week that he is fine in a tone that meant the opposite.',
    weight: 12,
    conditions: { ...managing, maxTeamMorale: 65 },
    choices: [
      {
        id: 'take_load',
        label: 'Take the load off him yourself',
        text: 'You pick up two of his files and finish them personally. It costs you a fortnight of evenings. He notices, and so does everyone else.',
        effects: [
          { kind: 'teamMorale', delta: 8 },
          { kind: 'stat', stat: 'stress', delta: 10 },
        ],
      },
      {
        id: 'leave_time',
        label: 'Order him to take his leave',
        text: 'Three weeks, enforced, with his files formally reassigned so there is nothing to come back to at midnight. The unit is slower for a month and he is a different person in September.',
        effects: [
          { kind: 'teamMorale', delta: 6 },
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'ride',
        label: 'He says he is fine',
        outcomes: [
          {
            weight: 3,
            text: 'He is not fine. He is signed off in March for two months, and the work he was holding is discovered, in pieces, by people who did not know it existed.',
            effects: [
              { kind: 'loseStaff' },
              { kind: 'stat', stat: 'performance', delta: -4 },
              { kind: 'teamMorale', delta: -8 },
              { kind: 'queueEvent', eventId: 'evt.followup.team_exodus', delayTurns: 4 },
            ],
          },
          {
            weight: 2,
            text: 'He gets through it, because people mostly do, and something in how he talks to you is different afterwards.',
            effects: [{ kind: 'teamMorale', delta: -4 }],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.restructure_proposal', {
    kind: 'random',
    title: 'Redraw the unit',
    body: 'You have been invited to propose a structure for your own area. Genuine freedom, once, with the understanding that whatever you propose you will be held to for years.',
    weight: 9,
    conditions: { ...managing, minLevel: 4 },
    choices: [
      {
        id: 'specialise',
        label: 'Specialise: deep expertise, narrow posts',
        outcomes: [
          {
            weight: 3,
            text: 'People become genuinely expert in their patch and the quality of the work rises noticeably. The unit is also now four single points of failure, which you will discover the first time someone is ill.',
            effects: [
              { kind: 'teamSkill', delta: 8 },
              { kind: 'stat', stat: 'performance', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'Two of the new posts turn out to be nobody’s idea of a career. They are filled reluctantly and vacated within a year.',
            effects: [{ kind: 'teamMorale', delta: -6 }, { kind: 'teamSkill', delta: 3 }],
          },
        ],
      },
      {
        id: 'generalise',
        label: 'Generalise: everyone can cover everyone',
        text: 'Resilient, flexible, and slightly worse at everything. Nothing ever stops because one person is away, and nothing is ever quite as good as it was when someone owned it.',
        effects: [
          { kind: 'teamMorale', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: -1 },
        ],
      },
      {
        id: 'flatten',
        label: 'Flatten it and push decisions down',
        outcomes: [
          {
            weight: 3,
            text: 'You give away most of your sign-off. Decisions get faster, your people grow visibly, and you spend the year being asked by other directors what happened to your unit.',
            effects: [
              { kind: 'teamMorale', delta: 9 },
              { kind: 'teamSkill', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: -5 },
            ],
          },
          {
            weight: 2,
            text: 'Two decisions are taken badly by people who were not ready for them, and both land on your desk anyway, later and worse.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.promotion_request', {
    kind: 'random',
    title: 'She wants your job, eventually',
    body: 'Your strongest officer asks, directly, what it would take to be promoted. She is ready for more than she has. There is no vacancy above her and there will not be one for two years.',
    weight: 11,
    conditions: { ...managing, minStaffCount: 2 },
    choices: [
      {
        id: 'honest_no',
        label: 'Tell her the truth about the timing',
        text: 'No vacancy, no promise, and a straight account of what would need to happen. She is disappointed and she believes you, which is worth more over five years than a comfortable answer.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'teamMorale', delta: -2 },
        ],
      },
      {
        id: 'build_case',
        label: 'Build the case for a regrade',
        conditions: { minStat: { politicalCapital: 20 } },
        outcomes: [
          {
            weight: 3,
            text: 'Four months of paperwork and two awkward meetings, and the post is regraded. It costs you capital and it tells everyone in the unit exactly what ambition gets here.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -7 },
              { kind: 'teamMorale', delta: 8 },
              { kind: 'budget', delta: -6000 },
            ],
          },
          {
            weight: 2,
            text: 'Refused, on grounds that are entirely procedural and completely final. She saw you try, which helps, and she starts looking, which does not.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'teamMorale', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stretch',
        label: 'Give her the work of the job she wants',
        text: 'No title, no money, and every piece of work that would come with both. It is what you would have wanted at her grade, and it is also, viewed unkindly, unpaid promotion.',
        effects: [
          { kind: 'teamSkill', delta: 6 },
          { kind: 'teamMorale', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.grievance_against_you', {
    kind: 'random',
    title: 'The complaint is about you',
    body: 'A member of your unit has raised a formal grievance naming you. Reading it, the account of the meeting is not how you remember it, and it is not obviously wrong either.',
    weight: 9,
    conditions: { ...managing, maxTeamMorale: 60 },
    choices: [
      {
        id: 'engage',
        label: 'Engage with it properly and concede what is fair',
        outcomes: [
          {
            weight: 3,
            text: 'You accept two of the four points, apologise for one of them specifically, and change how the meeting is run. The grievance is withdrawn. The unit watched all of it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'teamMorale', delta: 7 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'You concede in good faith and it is taken as an admission of the whole. The process runs for five months and finds partly against you.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'defend',
        label: 'Defend yourself completely',
        outcomes: [
          {
            weight: 2,
            text: 'The grievance is not upheld. You were, on the documents, entirely correct, and the unit is noticeably careful around you for a year.',
            effects: [
              { kind: 'teamMorale', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'It is partly upheld, and a defence that conceded nothing reads badly in the findings.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'teamMorale', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'step_back',
        label: 'Ask for someone else to handle the relationship',
        text: 'Their reporting line moves. It is the sensible administrative answer and it ends any chance of the underlying thing being resolved.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -4 },
          { kind: 'teamMorale', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.credit_upward', {
    kind: 'random',
    title: 'The director praises your unit’s work',
    body: 'In a meeting of directors, a piece of work your unit produced is singled out. The praise is directed at you, by name, in front of people whose opinion decides your next post. Two of your officers did all of it.',
    weight: 12,
    conditions: managing,
    choices: [
      {
        id: 'name_them',
        label: 'Name the people who did it',
        text: 'You say the two names and what each of them contributed. It costs you nothing you can measure, it costs some of the shine, and it comes back to you through four separate people within a fortnight.',
        effects: [
          { kind: 'teamMorale', delta: 9 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'accept',
        label: 'Accept it on the unit’s behalf',
        text: '"The team worked hard on it." True, generic, and it leaves the room believing it was yours. Your officers hear about the meeting, as people always do.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'teamMorale', delta: -4 },
        ],
      },
      {
        id: 'redirect',
        label: 'Send them to present it themselves next time',
        outcomes: [
          {
            weight: 3,
            text: 'You arrange for the two of them to take the next paper to the board in person. One of them is offered a secondment out of it, which is a loss you should be pleased about.',
            effects: [
              { kind: 'teamMorale', delta: 10 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
            ],
          },
          {
            weight: 1,
            text: 'They present it, nervously and well. The board is faintly puzzled about why you were not there, and says so to someone who tells you.',
            effects: [
              { kind: 'teamMorale', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -1 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.remote_working', {
    kind: 'random',
    title: 'Where the work happens',
    body: 'A directive requires everyone back in the building four days a week. Your unit has worked well on two, three of them arranged childcare around it, and one moved sixty kilometres away on the strength of it.',
    weight: 10,
    conditions: managing,
    choices: [
      {
        id: 'enforce',
        label: 'Apply the directive',
        text: 'You apply it as written. Two people begin looking for other jobs within a month and the person who moved does the arithmetic in front of you.',
        effects: [
          { kind: 'teamMorale', delta: -10 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'interpret',
        label: 'Interpret it as generously as it will bear',
        outcomes: [
          {
            weight: 3,
            text: 'You read "four days" as a unit average and document the reasoning carefully. Nobody above you ever queries it, and your unit becomes the one people apply to.',
            effects: [
              { kind: 'teamMorale', delta: 8 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
            ],
          },
          {
            weight: 2,
            text: 'It is queried in month three, and your interpretation does not survive the conversation. You have to reverse it publicly, which is worse than never having offered it.',
            effects: [
              { kind: 'teamMorale', delta: -6 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'argue',
        label: 'Make the case against the directive',
        text: 'You send the evidence: output, sickness, retention, all of it better under the current arrangement. It does not change the directive. It is quoted, eighteen months later, when the directive is reversed.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'teamMorale', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.mgmt.inherited_mess', {
    kind: 'random',
    title: 'What your predecessor left',
    body: 'Three months in, you find the reason the unit has a reputation: a body of work that was reported as done and was not. It predates you entirely, and correcting the record will cost the unit its standing before it costs anyone else anything.',
    weight: 9,
    conditions: { ...managing, minLevel: 3 },
    choices: [
      {
        id: 'declare',
        label: 'Correct the record',
        text: 'You set out what is actually true and what it will take to fix. The unit takes a public hit for something it did not do on your watch, and every number it reports afterwards is believed.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'teamMorale', delta: 5 },
        ],
      },
      {
        id: 'fix_quietly',
        label: 'Fix it quietly over a year',
        text: 'No announcement, no correction, and a year of doing the work twice. It is genuinely fixed by the following autumn. The record still says it was fine all along.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 8 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'blame',
        label: 'Make sure everyone knows whose it was',
        text: 'You name your predecessor, accurately, in a note that circulates further than intended. He has friends, and one of them will be interviewing you in four years.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
          { kind: 'flag', flag: 'blamed_a_predecessor' },
        ],
      },
    ],
  }),
];
