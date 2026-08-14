import { defineEvent } from '../authoring';

const procurement = { departments: ['procurement' as const] };

export const procurementEvents = [
  defineEvent('evt.procurement.shared_address', {
    kind: 'random',
    title: 'Two bidders, one address',
    body: 'Checking the paperwork on a four-hundred-thousand-euro tender, you notice that two of the three bidders are registered at the same address. Their bids are different enough to look competitive and similar enough to have been written by the same person.',
    weight: 11,
    conditions: procurement,
    choices: [
      {
        id: 'suspend',
        label: 'Suspend the procedure and refer it',
        text: 'You stop the tender and report suspected collusion to the competition authority. It takes fourteen months, the works are delayed a year, and two people you will never meet are eventually fined.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'exclude',
        label: 'Exclude both and award to the third',
        text: 'Clean, quick, and defensible under the exclusion grounds. The third bid is nine per cent more expensive. Nobody investigates the other two, who bid again next year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'proceed',
        label: 'Note it and proceed',
        text: 'Shared addresses are not proof of anything, and the deadline is Friday. You write a line in the file recording that you noticed, which is the part you will think about later.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'flag', flag: 'ignored_collusion_signal' },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.tailored_spec', {
    kind: 'random',
    title: 'A very specific requirement',
    body: 'The technical department has sent their requirements for the new system. One of them — a particular certification held, as far as you can establish, by a single supplier in the country — is not obviously necessary for anything.',
    weight: 12,
    conditions: procurement,
    choices: [
      {
        id: 'strip',
        label: 'Remove it and ask them to justify it',
        text: 'They cannot justify it. It came from the supplier’s own brochure, copied in good faith by someone who did not know better. Four bidders now qualify instead of one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'equivalent',
        label: 'Add "or equivalent" and move on',
        text: 'The standard fix, correctly applied. In practice bidders read the requirement and not the qualifier, and two of them decide not to bid.',
        effects: [{ kind: 'stat', stat: 'performance', delta: 1 }],
      },
      {
        id: 'keep',
        label: 'Publish it as they wrote it',
        text: 'They are the technical experts and it is their specification. One bid is received. It is compliant, and it is expensive.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.committee_pressure', {
    kind: 'random',
    title: 'A member of the committee has a view',
    body: 'In the evaluation meeting, one member is arguing hard for a bid that scored third on quality. His arguments are not unreasonable. He is also, you happen to know, a former colleague of their project director.',
    weight: 11,
    conditions: procurement,
    choices: [
      {
        id: 'declare',
        label: 'Ask everyone to restate their conflicts of interest',
        text: 'You put it to the whole committee, neutrally, as a procedural step. He declares the connection. He also recuses himself, angrily, and the scoring stands.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'record',
        label: 'Record his arguments in the minutes verbatim',
        text: 'Every word, attributed. The committee votes on the scores as they stand. He stops arguing the moment he sees the minute-taker writing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -1 },
        ],
      },
      {
        id: 'concede',
        label: 'Let the committee be persuaded',
        text: 'The scores are revisited "for consistency" and the third bid becomes the first. Everything is documented. Nothing is defensible if anyone ever reads it properly.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.genuine_emergency', {
    kind: 'random',
    title: 'The heating has failed',
    body: 'In a residential care facility, in January. A full tender takes eleven weeks. The emergency provisions allow a direct award, and the only contractor who can start on Monday is one the administration has used, without tendering, three times before.',
    weight: 11,
    conditions: procurement,
    choices: [
      {
        id: 'direct',
        label: 'Direct award, fully documented',
        text: 'You write the justification carefully — the emergency, the timeline, the absence of alternatives — and award it. It is exactly what the exception is for, and the file proves it.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'quotes',
        label: 'Three quotes in forty-eight hours',
        text: 'You spend a weekend on the phone. Two other contractors can start Wednesday. It costs the facility three cold days and produces a procedure nobody can criticise, and a price twelve per cent lower.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'usual',
        label: 'Call the usual contractor',
        text: 'They start on Monday. The justification is written afterwards, thinly. It is the fourth direct award to the same company and the pattern is now a pattern.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.incumbent', {
    kind: 'random',
    title: 'The incumbent knows the building',
    body: 'The current supplier has held this contract for nine years. They know every quirk of the system, which makes them genuinely better at the job and makes their bid genuinely better informed than anyone else’s could be.',
    weight: 10,
    conditions: procurement,
    choices: [
      {
        id: 'level',
        label: 'Publish everything the incumbent knows',
        text: 'You spend two weeks documenting the system properly and put it all in the tender pack. Five bidders instead of two. The incumbent still wins, on merit, at a price eight per cent lower.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'standard',
        label: 'Run the standard procedure',
        text: 'Two bids. The incumbent wins. Everything was correct and the outcome was known in advance by everyone including the other bidder.',
        effects: [{ kind: 'stat', stat: 'performance', delta: 1 }],
      },
      {
        id: 'handicap',
        label: 'Weight the scoring against incumbency',
        text: 'A defensible attempt to open the market that produces a new supplier, a difficult transition, and eighteen months of problems the old one would not have had.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.lunch', {
    kind: 'random',
    title: 'Just lunch',
    body: 'A supplier’s regional manager suggests lunch to "understand the administration’s direction better". There is no live tender. He is good company and genuinely knowledgeable, and in eight months there will be a live tender.',
    weight: 12,
    conditions: procurement,
    choices: [
      {
        id: 'decline',
        label: 'Decline',
        text: 'You suggest that anything he wants to tell you can be said in the office, with a note on the file. He does not follow up. Neither, later, does his company’s bid.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'office',
        label: 'Meet in the office and minute it',
        text: 'A recorded meeting, a note in the file, a copy to the other suppliers on request. He is slightly deflated and you learn everything useful he had to say.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'go',
        label: 'Go to lunch',
        text: 'It is genuinely useful and entirely pleasant and he pays. In eight months, reading his company’s bid, you will notice that you are working slightly harder to be fair to it than to the others.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'flag', flag: 'supplier_familiarity' },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.late_bid', {
    kind: 'random',
    title: 'Four minutes',
    body: 'The best bid by a distance arrived four minutes after the deadline, because their courier was held at the security desk downstairs. The rule is that late bids are excluded. The rule does not have an exception for the security desk.',
    weight: 11,
    conditions: procurement,
    choices: [
      {
        id: 'exclude',
        label: 'Exclude it',
        text: 'You exclude it, and award to a bid that is worse and cheaper by nothing. It is the correct decision under the rules, and the rules exist precisely so that this decision does not depend on how you feel about it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: -1 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'accept',
        label: 'Accept it — the delay was the administration’s fault',
        outcomes: [
          {
            weight: 2,
            text: 'You document the security desk delay and admit it. Nobody challenges. The administration gets the better bid, and you have created a precedent you cannot control.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: -2 },
            ],
          },
          {
            weight: 2,
            text: 'A losing bidder challenges within the week. The award is annulled, the process runs again, and the four minutes cost eleven weeks.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
              { kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 },
            ],
          },
        ],
      },
      {
        id: 'cancel',
        label: 'Cancel and rerun the tender',
        text: 'Nobody is excluded on a technicality and nobody is favoured. It costs seven weeks and a great deal of goodwill from every bidder, and it is unimpeachable.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.procurement.local_firm', {
    kind: 'random',
    title: 'The local firm',
    body: 'A company that employs forty people in the town has bid against a multinational. The multinational’s bid is better on every published criterion and eleven per cent cheaper. Three councillors have separately mentioned "supporting local business" this week.',
    weight: 11,
    conditions: procurement,
    choices: [
      {
        id: 'award',
        label: 'Award on the published criteria',
        text: 'The multinational wins because the criteria say so. The local firm loses nine jobs over the following year. You did the only thing the law allowed and it is not a comfortable month.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'future',
        label: 'Award correctly, and change the next specification',
        text: 'This one goes to the multinational. You then rewrite the framework to include lawful social and environmental criteria, published in advance, applying to everyone. The next contract is genuinely competitive on the things the town cares about.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'bend',
        label: 'Find a way to the local firm',
        text: 'A generous reading of one qualitative criterion closes an eleven per cent gap. Forty jobs stay in the town. The scoring sheet will not survive a challenge and everyone hopes there is not one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 2 },
        ],
      },
    ],
  }),
];
