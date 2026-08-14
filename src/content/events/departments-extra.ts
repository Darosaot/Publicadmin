import { defineEvent } from '../authoring';

/**
 * A second pass over the five departments.
 *
 * The first pool established each department's character. This one deepens it, and reaches into
 * the parts of each speciality that only show up after a few years in it.
 */
export const departmentExtraEvents = [
  /* ---------------------------------------------------------------- legal */

  defineEvent('evt.legal.retrospective', {
    kind: 'random',
    title: 'Make it lawful from last March',
    body: 'A scheme has been operating for eleven months without the legal basis anyone assumed existed. You are asked whether it can be regularised retrospectively.',
    weight: 11,
    conditions: { departments: ['legal'] },
    choices: [
      {
        id: 'can_be_done',
        label: 'Set out precisely what retrospection can and cannot fix',
        text: 'Two pages distinguishing what can be validated from what cannot. Half the problem dissolves; the other half becomes a decision for somebody more senior, correctly.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'just_do_it',
        label: 'Draft the validating instrument and move on',
        text: 'It is signed in six weeks and nobody examines the eleven months. Somewhere there are people who were affected by a scheme that had no basis, and no record that anyone considered them.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'refuse',
        label: 'Advise that it must stop until it is lawful',
        text: 'The scheme pauses for nine weeks and four hundred people are inconvenienced by your advice being correct. You are not thanked and you were right.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.junior_counsel', {
    kind: 'random',
    title: 'The junior has found something',
    body: 'A trainee two years in has spotted a problem in an opinion signed off by the head of legal four years ago. She is nervous, tentative, and — you check twice — right.',
    weight: 11,
    conditions: { departments: ['legal'] },
    choices: [
      {
        id: 'back_her',
        label: 'Put her name on the correction',
        text: 'You have her write it up and take it in with her. The head of legal takes it well, mostly, and she is a different lawyer from that week onward.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'teamMorale', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'own_name',
        label: 'Raise it under your own name',
        text: 'Safer for her and simpler for you. She notices, says nothing, and files it away with everything else she has learned about how this works.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'teamMorale', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'sit_on_it',
        label: 'Four years is four years',
        text: 'Nothing has gone wrong yet. You tell her it is a good catch and that these things are rarely worth reopening, and watch her decide what kind of department this is.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'teamMorale', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.whistleblower', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.settle_or_fight', {
    kind: 'random',
    title: 'Settle or fight',
    body: 'The administration will probably win, at a cost of nine months and a great deal of officer time. The claimant will accept a fifth of what they asked for, today.',
    weight: 12,
    conditions: { departments: ['legal'] },
    choices: [
      {
        id: 'settle',
        label: 'Settle',
        text: 'Cheaper than winning, which is the arithmetic that decides most litigation. It also means the point is never tested, and the next claimant has the same argument.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'fight',
        label: 'Fight it',
        outcomes: [
          {
            weight: 3,
            text: 'Nine months and a judgment that settles the point for every future case. Expensive, correct, and it saves a fortune over the following decade.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'Nine months and a loss on a point nobody anticipated. The settlement offer was a fifth of what the administration ends up paying.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.plain_language', {
    kind: 'random',
    title: 'Nobody understands the letters',
    body: 'The standard decision letter is legally impeccable and, on the evidence of four hundred phone calls a month, incomprehensible. Rewriting it means accepting slightly more legal risk in exchange for people knowing what has happened to them.',
    weight: 10,
    conditions: { departments: ['legal'] },
    choices: [
      {
        id: 'rewrite',
        label: 'Rewrite them in plain language',
        text: 'Six weeks of work and the calls halve. Two years later a tribunal criticises a phrase you simplified, and you would still make the same trade.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'keep',
        label: 'Keep the wording that has never lost',
        text: 'Defensible, unchanged, and four hundred calls a month from people trying to find out whether they have been refused.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
      },
      {
        id: 'both',
        label: 'Send both versions',
        text: 'The formal decision, and a plain covering note that explains it. Twice the paper, half the confusion, and legally unimpeachable because nothing was removed.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.conflicting_advice', {
    kind: 'random',
    title: 'External counsel disagrees with you',
    body: 'A firm has advised the opposite of your opinion on a live matter. One of you is wrong. They cost four hundred an hour and they are not obviously better than you.',
    weight: 10,
    conditions: { departments: ['legal'] },
    choices: [
      {
        id: 'test_it',
        label: 'Set out both positions for the decision-maker',
        text: 'You write the honest version: here is my view, here is theirs, here is where they diverge and what turns on it. The decision-maker chooses with their eyes open, which is the whole job.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'defer',
        label: 'Defer to the firm',
        text: 'They are the specialists and it is the safe institutional answer. Eighteen months later the point is litigated and your original view is the one the court takes.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.court_ruling', delayTurns: 5 },
        ],
      },
      {
        id: 'insist',
        label: 'Insist on your own view',
        outcomes: [
          {
            weight: 3,
            text: 'You hold, in writing, with reasons. You are right, and the department stops instructing that firm on this class of question.',
            effects: [{ kind: 'stat', stat: 'reputation', delta: 5 }],
          },
          {
            weight: 2,
            text: 'You hold and you are wrong, in writing, at length. It is a specific and memorable kind of embarrassment.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 5 },
              { kind: 'queueEvent', eventId: 'evt.followup.court_ruling', delayTurns: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.emergency_powers', {
    kind: 'random',
    title: 'The powers are broader than they need to be',
    body: 'An emergency instrument is being drafted in a hurry. As written, the power it creates is considerably wider than the emergency requires, and nobody in the room is arguing for narrowing it.',
    weight: 10,
    conditions: { departments: ['legal'], minLevel: 3 },
    choices: [
      {
        id: 'narrow',
        label: 'Insist on narrowing it, with a sunset clause',
        text: 'You add the limits and the expiry date, over the objections of people who point out, correctly, that it is slower. The power expires on schedule two years later, which almost never happens.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'as_drafted',
        label: 'Let it go as drafted; it is an emergency',
        text: 'It is an emergency, and the power is used proportionately, and it is still on the statute book eleven years later being used for things nobody in that room imagined.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'queueEvent', eventId: 'evt.followup.power_returns', delayTurns: 7 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------- projects */

  defineEvent('evt.projects.partner_collapse', {
    kind: 'random',
    title: 'A partner has gone into administration',
    body: 'The organisation delivering a third of the project stopped trading on Tuesday. Their work package is half finished, their staff are gone, and the funder’s deadline has not moved.',
    weight: 11,
    conditions: { departments: ['projects'] },
    choices: [
      {
        id: 'absorb',
        label: 'Take the work package in-house',
        text: 'You rebuild a third of the project inside your own administration in four months. It is the hardest thing you do that year and the project lands.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 11 },
        ],
      },
      {
        id: 'descope',
        label: 'Formally reduce the project',
        text: 'You negotiate a reduced scope with the funder, honestly and early. The project delivers two thirds of what it promised, on time, with nobody surprised.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'report_late',
        label: 'Report it at the next scheduled milestone',
        text: 'Eleven weeks later, when the report is due. By then the options have narrowed to one, and the funder’s first question is when you knew.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.funder_suspension', delayTurns: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.evaluation_inconvenient', {
    kind: 'random',
    title: 'The evaluation is not flattering',
    body: 'The independent evaluation of your flagship project finds it achieved about half of what was claimed, for reasons that are mostly outside anyone’s control. Publication is at your discretion.',
    weight: 11,
    conditions: { departments: ['projects'] },
    choices: [
      {
        id: 'publish',
        label: 'Publish it in full',
        text: 'It is uncomfortable for a fortnight. It is also cited by three other administrations designing similar things, none of whom now make the same mistake.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'summary',
        label: 'Publish a summary',
        text: 'The summary is accurate and contains none of the numbers that matter. Somebody requests the full report under transparency law in about four months.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 4 },
        ],
      },
      {
        id: 'shelve',
        label: 'Do not publish',
        text: 'It sits on a shared drive. The next project is designed by people who never read it and repeats two of the three failures.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.successor_letter', delayTurns: 8 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.beneficiary_fraud', {
    kind: 'random',
    title: 'The receipts are too neat',
    body: 'A beneficiary’s claim is immaculate: sequential invoice numbers, round figures, a supplier registered three weeks before the first invoice. Nothing is provably wrong.',
    weight: 11,
    conditions: { departments: ['projects'] },
    choices: [
      {
        id: 'investigate',
        label: 'Refer it for investigation',
        outcomes: [
          {
            weight: 3,
            text: 'It is fraud, and a fairly amateur version. Recovery takes two years and the referral is exactly what the anti-fraud framework exists for.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'It is a small organisation with a bookkeeper who does everything in round numbers. The investigation nearly closes them and finds nothing.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'query',
        label: 'Query it directly with them first',
        text: 'You ask for the underlying documentation before referring anything. What comes back settles it either way in a fortnight, without destroying anyone who did nothing wrong.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'certify',
        label: 'Nothing is provably wrong',
        text: 'You certify it. The claim is one of six hundred and you have four days. It is the reasonable decision and you do not entirely believe it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.funder_suspension', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.co_financing_gap', {
    kind: 'random',
    title: 'The match funding has not appeared',
    body: 'The programme pays sixty per cent; the administration was to find the rest. The rest has been quietly removed from next year’s budget by somebody who did not realise it was load-bearing.',
    weight: 11,
    conditions: { departments: ['projects'] },
    choices: [
      {
        id: 'escalate',
        label: 'Escalate immediately and loudly',
        text: 'You make it unambiguous, in writing, that removing the match forfeits four times as much external money. The line is restored in a fortnight and somebody is embarrassed.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'find_it',
        label: 'Find the money somewhere else',
        text: 'Three departments contribute a share in exchange for a mention in the outputs. It is held together with goodwill and it works.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'shrink',
        label: 'Reduce the project to what can be matched',
        text: 'Honest, orderly, and the administration returns two million euros it could have spent. The decision is correct and reads badly in the annual report.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.visibility_rules', {
    kind: 'random',
    title: 'The logo is the wrong size',
    body: 'The programme’s visibility requirements specify the funder’s emblem at a defined proportion on every output. An auditor has found eleven breaches across two years, all trivial, all technically ineligible expenditure.',
    weight: 10,
    conditions: { departments: ['projects'] },
    choices: [
      {
        id: 'contest',
        label: 'Contest the proportionality',
        outcomes: [
          {
            weight: 3,
            text: 'You argue proportionality with evidence of the actual visibility achieved. The correction is reduced to nothing. It takes five months of correspondence about a logo.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'The rule is the rule. The correction stands, and the file is passed to the people who apply corrections to whole programmes rather than single outputs.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'queueEvent', eventId: 'evt.followup.recovery_order', delayTurns: 4 },
            ],
          },
        ],
      },
      {
        id: 'accept',
        label: 'Accept the correction and fix the templates',
        text: 'You pay it, then spend an afternoon making the templates impossible to get wrong. Nobody in the department ever breaches it again, which is worth more than the correction cost.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'budget', delta: -4000 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.pilot_scaling', {
    kind: 'random',
    title: 'The pilot worked',
    body: 'A small pilot has produced genuinely good results in one town. Everyone wants it scaled nationally by spring. The results depended substantially on one exceptional person who ran it.',
    weight: 11,
    conditions: { departments: ['projects'], minLevel: 3 },
    choices: [
      {
        id: 'honest_caveat',
        label: 'Scale it, and say publicly what it depended on',
        text: 'You scale with the caveat attached to every document. Two regions replicate the conditions properly and get the results; the others do not and know why.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
        ],
      },
      {
        id: 'scale_fast',
        label: 'Scale it as fast as they want',
        text: 'Nationally by spring, and by autumn the results are a third of the pilot’s everywhere except the original town. The evaluation blames implementation fidelity, which is a phrase meaning this.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
      {
        id: 'second_pilot',
        label: 'Run a second pilot somewhere ordinary first',
        text: 'Six months of delay to find out whether it works without an exceptional person. It half works, which is the most useful finding anyone produces that year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  /* -------------------------------------------------------------- finance */

  defineEvent('evt.finance.creative_classification', {
    kind: 'random',
    title: 'Capital or revenue',
    body: 'Nine hundred thousand euros of spending could, on a generous reading, be classified as capital. Classified as revenue it breaches a limit. The generous reading is not obviously wrong.',
    weight: 12,
    conditions: { departments: ['finance'] },
    choices: [
      {
        id: 'revenue',
        label: 'Classify it as what it is',
        text: 'Revenue, breach declared, an uncomfortable meeting, and an accounts set that means what it says.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'capital',
        label: 'Take the generous reading',
        text: 'It survives the external audit, because it is defensible. It is also the first of a series of generous readings that will be taken by people who learned it from this one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'flag', flag: 'creative_accounting' },
          { kind: 'queueEvent', eventId: 'evt.followup.whistleblower', delayTurns: 6 },
        ],
      },
      {
        id: 'ask',
        label: 'Ask the auditors in advance',
        text: 'You put the question to them before deciding, in writing. They say revenue. It costs you the option and buys a file nobody can ever criticise.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.grant_clawback', {
    kind: 'random',
    title: 'The association cannot repay it',
    body: 'A community organisation must return forty thousand euros of misapplied grant. They did not steal it; they spent it on the wrong line of an over-complicated form. Recovering it will close them.',
    weight: 11,
    conditions: { departments: ['finance'] },
    choices: [
      {
        id: 'recover',
        label: 'Recover it as the rules require',
        text: 'They close in September. Eleven part-time jobs and a service for about two hundred people, ended by a form. Every step you took was correct.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
        ],
      },
      {
        id: 'reschedule',
        label: 'Find a lawful way to soften it',
        text: 'A four-year repayment schedule, a small write-off within your delegated authority, and a rewritten form. It takes a fortnight of ingenuity and they survive.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'quietly_drop',
        label: 'Let it lapse',
        text: 'You allow the recovery to time out without a decision anyone signed. They survive, the money is gone, and there is no record of why.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.pension_liability', {
    kind: 'random',
    title: 'The number at the back of the accounts',
    body: 'The pension liability has been restated and is now considerably larger than the administration’s annual budget. It is a real obligation, it is decades away, and nobody wants it in the summary.',
    weight: 10,
    conditions: { departments: ['finance'], minLevel: 3 },
    choices: [
      {
        id: 'front',
        label: 'Put it in the summary with an explanation',
        text: 'One paragraph explaining what the number is and is not. Two councillors understand it for the first time in a decade, and the panic that everyone predicted does not happen.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
        ],
      },
      {
        id: 'note',
        label: 'Leave it in note 27 where it belongs',
        text: 'Technically correct placement, entirely conventional, and it is note 27 precisely because nobody reads note 27.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
      },
    ],
  }),

  defineEvent('evt.finance.late_payment_penalty', {
    kind: 'random',
    title: 'Interest is accruing',
    body: 'The administration is paying so many invoices late that statutory interest has become a budget line. Fixing it means the payments team doubling its throughput or the approval chain losing two steps.',
    weight: 11,
    conditions: { departments: ['finance'] },
    choices: [
      {
        id: 'cut_approvals',
        label: 'Remove two approval steps',
        outcomes: [
          {
            weight: 3,
            text: 'Payment times halve, interest disappears, and nothing bad happens because the two steps were checking things that had already been checked.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'Payment times halve and a duplicate payment of sixty thousand euros goes out four months later, because one of those steps was doing something after all.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'more_people',
        label: 'Bid for more people in the payments team',
        text: 'A costed case showing the interest exceeds the salary. It takes nine months to be approved and it is approved, which almost never happens to a bid for back-office posts.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'budgetMonthly', delta: 2200 },
        ],
      },
      {
        id: 'absorb',
        label: 'Budget for the interest',
        text: 'You put it in the budget as a line called "statutory interest" and it is approved without comment, which tells you something about how budgets are read.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.reserves_raid_again', {
    kind: 'random',
    title: 'The third year of using reserves for running costs',
    body: 'The budget balances only because reserves are covering ordinary spending for the third consecutive year. At the current rate the reserves are exhausted in about four years, and nobody wants that sentence in a public document.',
    weight: 11,
    conditions: { departments: ['finance'], minLevel: 2 },
    choices: [
      {
        id: 'state_it',
        label: 'Put the four-year figure in the budget report',
        text: 'One sentence, one chart. It causes a genuinely difficult debate and the following year’s budget is the first in a decade that does not rely on reserves.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
      {
        id: 'technical_note',
        label: 'Include it as a technical annex',
        text: 'It is disclosed, formally and completely, in a place calibrated to be disclosed rather than read. You have covered yourself and changed nothing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'silent',
        label: 'Balance the budget and say nothing',
        text: 'It balances. The reserves position is in the accounts for anyone who looks. Four years is four years away and you may not be here.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.systems_migration', {
    kind: 'random',
    title: 'The new ledger goes live on Monday',
    body: 'Two years of implementation. The testing was adequate rather than good, the fallback plan is "revert", and reverting after the first month of postings is not actually possible.',
    weight: 10,
    conditions: { departments: ['finance'] },
    choices: [
      {
        id: 'delay',
        label: 'Delay it a quarter',
        text: 'You take the criticism for a three-month slip and use the time on the testing that should have happened. It goes live in April without incident, which nobody notices.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'go',
        label: 'Go live as planned',
        outcomes: [
          {
            weight: 2,
            text: 'It works. Two difficult weeks and then a better system, on schedule, and you never mention how thin the testing was.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 3,
            text: 'Six weeks in which the administration cannot reliably say what it has spent. It is fixed by August at a cost that exceeds the implementation.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -7 },
              { kind: 'stat', stat: 'performance', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'parallel',
        label: 'Run both systems in parallel for a quarter',
        text: 'Double the work for three months, and every discrepancy caught before it matters. The team is exhausted and the migration is the only one anybody remembers going smoothly.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'teamMorale', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
    ],
  }),

  /* ---------------------------------------------------------- procurement */

  defineEvent('evt.procurement.single_bid', {
    kind: 'random',
    title: 'One bid',
    body: 'The tender closed with a single response, from the incumbent, at a price eleven per cent above the estimate. It is compliant. Awarding it is lawful and awarding it says something.',
    weight: 12,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'award',
        label: 'Award it',
        text: 'Compliant, defensible, and eleven per cent above estimate. The market has learned that this administration will award to a single bid, which is the expensive part.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 1 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'find_out_why',
        label: 'Find out why nobody else bid',
        outcomes: [
          {
            weight: 3,
            text: 'Six phone calls establish that the timetable was impossible over the summer and two requirements were incomprehensible. You rerun it properly and get four bids, the cheapest nine per cent below estimate.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'The market is simply thin: three firms nationally, two of them busy. You award to the single bid, having established that it was the only bid available.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 3 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'negotiate',
        label: 'Negotiate the price down first',
        text: 'Permitted in the circumstances, and it takes four per cent off. They knew they were the only bid and you both knew they knew.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.abnormally_low', {
    kind: 'random',
    title: 'Forty per cent below everyone else',
    body: 'The lowest bid is forty per cent under the next one. Either they have found something everyone else missed, or they intend to make it up in variations. The law requires you to ask.',
    weight: 11,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'interrogate',
        label: 'Interrogate the price properly',
        outcomes: [
          {
            weight: 3,
            text: 'Their explanation does not survive four questions. You exclude the bid, document why, and the contract goes to a price that will actually be the price.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'Their explanation is excellent: a genuinely better method. You award, and they deliver at the price, and the sector talks about it for a year.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'performance', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'take_it',
        label: 'Take the saving',
        text: 'The headline saving is announced. Eighteen months and nine variations later the final cost is above the second bid, and the announcement is what everyone remembers.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.contractor_claim', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.contract_management', {
    kind: 'random',
    title: 'Nobody is managing the contract',
    body: 'The eleven-million-euro contract you awarded two years ago has no named manager. The supplier has been invoicing against milestones nobody verifies. They may well be doing everything right.',
    weight: 11,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'assign',
        label: 'Assign a manager and audit the last two years',
        outcomes: [
          {
            weight: 3,
            text: 'The audit finds three hundred thousand euros of milestones invoiced and not delivered. It is recovered. The contract runs properly for its remaining three years.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'The audit finds the supplier has been scrupulous throughout. Two months of work to establish that nothing was wrong, which is what assurance costs.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'from_now',
        label: 'Assign a manager going forward only',
        text: 'Sensible, forward-looking, and it draws a line under two years nobody will now examine. The supplier notices the line exactly as clearly as you do, and prices the rest of the contract accordingly.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'queueEvent', eventId: 'evt.followup.contractor_claim', delayTurns: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.social_value', {
    kind: 'random',
    title: 'Ten per cent for social value',
    body: 'The evaluation includes ten per cent for social value. Every bidder has promised apprenticeships. None of the promises are contractually binding, and the last three winners delivered none of them.',
    weight: 10,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'make_binding',
        label: 'Write the promises into the contract',
        text: 'The commitments become deliverables with remedies attached. Two bidders reduce their offers to something they can actually do, which is the first honest social value scoring anyone here has seen.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'score_as_is',
        label: 'Score them as submitted',
        text: 'Ten per cent of a major contract decided by promises nobody will check. It is what the framework says to do.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -4 }],
      },
      {
        id: 'drop',
        label: 'Remove the criterion as unmeasurable',
        text: 'Defensible and slightly cowardly. The evaluation becomes honest by becoming narrower, and the apprenticeships that were never going to happen stop being pretended about.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.framework_expiry', {
    kind: 'random',
    title: 'The framework expires in six weeks',
    body: 'Eleven services are bought through it. Replacing it properly takes five months. The options are an unlawful extension, an emergency direct award, or eleven services stopping.',
    weight: 11,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'emergency',
        label: 'Emergency awards, fully documented, with an end date',
        text: 'Six months of properly justified direct awards while the replacement runs. It is the honest use of the exception, it is expensive, and every step is on the file.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'extend',
        label: 'Extend the framework',
        text: 'A variation nobody will query, which is not the same as lawful. Eleven services continue and there is now a document with your name on it that would not survive a challenge.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 4 },
        ],
      },
      {
        id: 'blame_upward',
        label: 'Report that the department failed to plan for this',
        text: 'True — it was known eighteen months ago and nobody acted. You put that in writing alongside the options, which makes the emergency a decision rather than an accident.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.debrief', {
    kind: 'random',
    title: 'The losing bidder wants to know why',
    body: 'A small firm has asked for a debrief. They came fourth of four and their bid was genuinely poor. A full and frank explanation would be useful to them and would give them everything they need to challenge.',
    weight: 10,
    conditions: { departments: ['procurement'] },
    choices: [
      {
        id: 'full',
        label: 'Give them a real debrief',
        text: 'An hour, specific, and occasionally blunt. They bid again in eighteen months, much better, and win. They tell people the administration is worth bidding to.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'minimum',
        label: 'The statutory minimum',
        text: 'Scores, headline reasons, nothing actionable. Entirely compliant, and they do not bid again, and neither do the two firms they talk to. One of them takes it to the ombudsman instead.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.ombudsman', delayTurns: 4 },
        ],
      },
    ],
  }),

  /* --------------------------------------------------------------- policy */

  defineEvent('evt.policy.commissioned_research', {
    kind: 'random',
    title: 'The research you commissioned disagrees with you',
    body: 'The institute you funded to examine the question has answered it, at length, in the opposite direction to the department’s established position. Their methodology is sound.',
    weight: 12,
    conditions: { departments: ['policy'] },
    choices: [
      {
        id: 'publish_engage',
        label: 'Publish it and engage with the finding',
        text: 'You publish alongside a response setting out what the department accepts and what it disputes, with reasons. It is a model of how this should work and it is genuinely uncomfortable.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'methodology',
        label: 'Commission a critique of the methodology',
        text: 'A second institute finds three arguable weaknesses. Both reports exist, neither prevails, and the question is now contested rather than answered.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'budget', delta: -18000 },
        ],
      },
      {
        id: 'change_position',
        label: 'Change the department’s position',
        outcomes: [
          {
            weight: 2,
            text: 'You take the finding seriously enough to move, and bring the department with you over eight months. It is the most consequential thing you ever do.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 6 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 3,
            text: 'You propose the change and are overruled by people for whom the established position is now a commitment. The research is published and the position does not move.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.select_committee_request', {
    kind: 'random',
    title: 'The committee wants the submissions',
    body: 'A committee has asked for every submission received during a consultation, including four from companies that wrote on the express understanding that their responses were confidential.',
    weight: 11,
    conditions: { departments: ['policy'] },
    choices: [
      {
        id: 'provide_all',
        label: 'Provide everything',
        text: 'The committee has the power and you comply in full. Four companies will never again write candidly to this department, and the next consultation is noticeably emptier.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'negotiate',
        label: 'Provide them, having told the four first',
        text: 'You warn each of them, explain that you have no choice, and give them a week. Two withdraw and resubmit in a form they can live with. It costs a week and preserves the relationship.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'redact',
        label: 'Provide them redacted',
        text: 'The redactions are queried within a fortnight and mostly overturned. You have delayed the disclosure and added a story about the department withholding things.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.two_ministers', {
    kind: 'random',
    title: 'Two political principals, one policy',
    body: 'Two parts of government want opposite things from the same measure, and each believes the department is working to their version. A single document has to go to both.',
    weight: 11,
    conditions: { departments: ['policy'], minLevel: 3 },
    choices: [
      {
        id: 'name_it',
        label: 'Write the disagreement down and put it to both',
        text: 'One page setting out the two positions and what turns on the difference. It forces a decision that has been avoided for four months, and both offices are briefly furious with you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
      {
        id: 'ambiguous',
        label: 'Draft it so both can read it their way',
        text: 'A genuinely skilful piece of writing that resolves nothing. It is agreed in a fortnight and the contradiction surfaces at implementation, where it costs ten times as much.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 4 },
        ],
      },
      {
        id: 'pick_a_side',
        label: 'Draft for the one with more authority',
        text: 'You back the stronger office, which is how these things usually resolve, and the other one remembers. It is settled quickly and one relationship is spent.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.lived_experience', {
    kind: 'random',
    title: 'The people it applies to',
    body: 'The consultation has produced eleven hundred organisational responses and almost nothing from the people the policy actually affects, who are not organised and do not read consultation documents.',
    weight: 11,
    conditions: { departments: ['policy'] },
    choices: [
      {
        id: 'go_out',
        label: 'Go and talk to them',
        text: 'Four weeks, six locations, and about ninety conversations. Two of the policy’s central assumptions turn out to be wrong in ways no organisation had mentioned.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'proxy',
        label: 'Rely on the organisations that represent them',
        text: 'They are well-informed, professional, and represent the members they have. The policy is designed around the people organised enough to be represented.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
      },
      {
        id: 'commission',
        label: 'Commission research into their views',
        text: 'Eleven months and thirty thousand euros to produce a report that arrives after the decision. It is excellent and it informs the review in four years.',
        effects: [
          { kind: 'budget', delta: -30000 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.announcement_reversal', {
    kind: 'random',
    title: 'They want to un-announce it',
    body: 'A measure announced eight weeks ago is to be dropped. You are asked to draft the communication, and to do it in a way that does not read as a reversal.',
    weight: 11,
    conditions: { departments: ['policy'] },
    choices: [
      {
        id: 'plain',
        label: 'Say it has been dropped, and why',
        text: 'Four sentences: what was announced, what changed, what happens now. It is reported as a U-turn for two days and then as a department that says what it is doing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'evolved',
        label: '"The approach has evolved"',
        text: 'A masterpiece of the form. Nobody is deceived, several journalists quote it as an example, and the phrase attaches itself to the department for a year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'bury',
        label: 'Publish it the afternoon of something bigger',
        text: 'It is out, technically, on a day nobody is looking. Two years later somebody assembles a list of things published on such afternoons, and this is on it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.policy.long_grass', {
    kind: 'random',
    title: 'A review would be helpful',
    body: 'A politically awkward question has arrived. The suggested response is a review, reporting in eighteen months, by which time the question will belong to somebody else.',
    weight: 11,
    conditions: { departments: ['policy'] },
    choices: [
      {
        id: 'real_review',
        label: 'Set up a review that will actually decide it',
        text: 'Six months, a named chair with a reputation to protect, and terms of reference that require a recommendation. It reports on time and the recommendation is acted on.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'long_grass',
        label: 'Eighteen months it is',
        text: 'You write the terms of reference so that reporting in eighteen months is unavoidable. It is a professional piece of work in the service of nothing happening.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'queueEvent', eventId: 'evt.followup.successor_letter', delayTurns: 9 },
        ],
      },
      {
        id: 'answer_now',
        label: 'Advise that the question can be answered now',
        text: 'You set out the answer, the evidence for it, and the fact that a review would establish nothing new. It is refused, and the note is on the file when the review reports exactly that in eighteen months.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),
];
