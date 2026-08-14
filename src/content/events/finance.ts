import { defineEvent } from '../authoring';

const finance = { departments: ['finance' as const] };

export const financeEvents = [
  defineEvent('evt.finance.year_end_hole', {
    kind: 'random',
    title: 'The hole',
    body: 'Closing the year, the numbers come up four hundred thousand short. Not missing — committed, against a budget line that was overspent in March and papered over in April by someone who has since left.',
    weight: 11,
    conditions: finance,
    choices: [
      {
        id: 'declare',
        label: 'Declare it in the accounts',
        text: 'You write it up plainly. The accounts are qualified, there are two very bad meetings, and the administration begins the year knowing the truth about its own position.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'carry',
        label: 'Carry it into next year',
        text: 'A reclassification, defensible on a narrow reading, moves the problem twelve months. Next year’s finance officer will find it. This year you might be that person.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'flag', flag: 'carried_a_deficit' },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 6 },
        ],
      },
      {
        id: 'fix',
        label: 'Find the four hundred thousand',
        text: 'Six weeks of freezing everything that can be frozen. The year closes clean, three departments hate you, and nobody outside finance ever learns how close it was.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.jump_the_queue', {
    kind: 'random',
    title: 'A supplier who cannot wait',
    body: 'A small firm is owed eleven thousand euros and has been waiting ninety days, which is the normal cycle. The owner has phoned to say that without it he cannot make payroll on Friday. Moving him up means moving others down.',
    weight: 12,
    conditions: finance,
    choices: [
      {
        id: 'queue',
        label: 'The cycle is the cycle',
        text: 'You explain the payment run and offer nothing else, because there is nothing else you are authorised to offer. He is polite about it. Friday happens either way.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
      },
      {
        id: 'expedite',
        label: 'Expedite this one',
        text: 'It takes a signature and twenty minutes. Two other suppliers move down a week and never know. You would do it again and you are not entirely comfortable that you would.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'fix_system',
        label: 'Propose a hardship rule for small suppliers',
        text: 'You draft a short, general rule: firms under a size threshold get a shorter cycle, applied to everyone, published. It takes four months to approve and it outlives you in the post.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.reserves', {
    kind: 'random',
    title: 'The reserves',
    body: 'There is a plan to fund a new sports facility from the general reserve. It is legal. It is also the reserve, and the roof of the main administrative building has been on the deferred maintenance list for six years.',
    weight: 10,
    conditions: finance,
    choices: [
      {
        id: 'object',
        label: 'Put the risk in writing',
        text: 'A one-page note on reserve levels, the maintenance backlog, and what happens in a bad year. It is read, minuted, and overruled. When the roof fails, the note is what protects the department.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'facilitate',
        label: 'Make it work',
        text: 'You structure it well: phased, with a replenishment schedule that will probably be honoured. The facility gets built and is genuinely popular. The reserve is thinner than you would like.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'condition',
        label: 'Agree, on conditions',
        text: 'You will sign it if the maintenance backlog is funded in the same decision. It is a negotiation you should not have had to have, and you win about two thirds of it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.overtime_claims', {
    kind: 'random',
    title: 'A pattern in the overtime',
    body: 'One manager’s team claims consistently more overtime than any comparable unit — always just under the level that triggers a review. It could be a genuinely overloaded team. The pattern is too neat to be an accident.',
    weight: 10,
    conditions: finance,
    choices: [
      {
        id: 'analyse',
        label: 'Run the numbers properly and present them',
        text: 'You produce a clean comparison across all units, with no accusation in it at all. The pattern is visible to anyone who reads it. The claims normalise within two months without a single confrontation.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'report',
        label: 'Refer it as suspected abuse',
        outcomes: [
          {
            weight: 2,
            text: 'An investigation confirms it. Two people face disciplinary proceedings, one deservedly. The department is tense for a year.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'The investigation finds the team was genuinely overloaded and badly managed by the level above. You were right about the numbers and wrong about the cause, in public.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'It is within the rules',
        text: 'Every claim is individually authorised and individually compliant. You process them.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: -3 }],
      },
    ],
  }),

  defineEvent('evt.finance.windfall', {
    kind: 'random',
    title: 'Money that should not be there',
    body: 'A transfer of one hundred and eighty thousand euros has arrived from a regional body. Nobody can identify what it is for. It has been sitting in a suspense account for five months, and the regional body has not asked about it.',
    weight: 9,
    conditions: finance,
    choices: [
      {
        id: 'return',
        label: 'Write to them and ask',
        text: 'Three letters and a phone call. It was an error in their system. They reclaim it, gratefully, and mention your name to your director in terms that are worth more than the money.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'hold',
        label: 'Leave it in suspense',
        text: 'It is not yours to spend and not yours to return unasked. It sits there for another two years, an unexplained number in an account, quietly waiting for an auditor.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 6 },
        ],
      },
      {
        id: 'absorb',
        label: 'Recognise it as income',
        text: 'It clears the suspense account and improves the year-end position by one hundred and eighty thousand euros. Somebody, eventually, will want it back.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.optimistic_forecast', {
    kind: 'random',
    title: 'A more constructive presentation',
    body: 'Your three-year forecast shows a structural deficit from year two. The director would like it presented "less starkly" before it goes to the council, on the grounds that the council will panic and make things worse.',
    weight: 11,
    conditions: finance,
    choices: [
      {
        id: 'stark',
        label: 'Present it as it is',
        text: 'The council panics, briefly, and then does two of the three things the forecast implied were necessary. It is the most useful bad meeting of your career.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'soften',
        label: 'Soften the presentation',
        text: 'Same numbers, gentler framing, a chart that starts at a helpful point on the axis. Nobody panics. Nobody acts, either.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'scenarios',
        label: 'Give them three scenarios instead of one',
        text: 'Best case, central, worst. The central case is your original forecast and is now unarguable because it sits between two others. The director is satisfied and so is your conscience.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.no_purchase_order', {
    kind: 'random',
    title: 'The invoice with nothing behind it',
    body: 'An invoice for nineteen thousand euros has arrived for work that has already been done. There was no purchase order, no procurement, and no budget line. The head of the department concerned says it was urgent and that everyone agreed at the time.',
    weight: 11,
    conditions: finance,
    choices: [
      {
        id: 'refuse',
        label: 'Refuse payment until it is regularised',
        text: 'The supplier waits three months while the administration writes down, retrospectively, what it did and why. Everyone involved is embarrassed and the process is followed.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'pay',
        label: 'Pay it and raise the order afterwards',
        text: 'The supplier is paid, the paperwork is created to match, and the department learns that the rule is negotiable. The next one is twenty-eight thousand.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 4 },
        ],
      },
      {
        id: 'pay_and_report',
        label: 'Pay the supplier, report the breach',
        text: 'The firm did the work and should not suffer for the administration’s failure. You pay, and you write the breach up formally so it belongs to the organisation. Both halves are necessary.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.finance.rounding', {
    kind: 'random',
    title: 'Eleven euros',
    body: 'A reconciliation is out by eleven euros and forty cents. Finding it will take most of a day. Writing it off takes ninety seconds and is within your authority.',
    weight: 9,
    conditions: finance,
    choices: [
      {
        id: 'find',
        label: 'Find it',
        outcomes: [
          {
            weight: 2,
            text: 'Six hours later: a transposed figure in a batch of two hundred. Behind it, the same error repeated eleven times over two years, totalling nine thousand euros. The eleven euros was the loose thread.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'performance', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 3,
            text: 'Six hours later: a rounding difference in a currency conversion. Exactly what it appeared to be. A day gone, and the ledger balances.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: -1 },
              { kind: 'stat', stat: 'stress', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'writeoff',
        label: 'Write it off',
        text: 'Authorised, documented, closed. It is the proportionate decision and it is almost always right.',
        effects: [{ kind: 'stat', stat: 'performance', delta: 1 }],
      },
    ],
  }),
];
