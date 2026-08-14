import { defineEvent } from '../authoring';

const legal = { departments: ['legal' as const] };

export const legalEvents = [
  defineEvent('evt.legal.opinion_pressure', {
    kind: 'random',
    title: 'The answer he wanted',
    body: 'Your opinion says the proposal cannot proceed in its current form. The director has read it, and asks — pleasantly, twice — whether there is "a way of writing this that gets us to yes".',
    weight: 12,
    conditions: legal,
    choices: [
      {
        id: 'hold',
        label: 'The opinion stands',
        text: 'You do not change a word. The proposal is redesigned over six weeks and proceeds lawfully. Nobody thanks you for the six weeks.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'soften',
        label: 'Soften the language',
        text: 'The conclusion survives; the emphasis does not. It now reads as a caution rather than a bar, and the proposal proceeds on the strength of your caution.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'flag', flag: 'softened_an_opinion' },
        ],
      },
      {
        id: 'route',
        label: 'Offer a lawful route to the same goal',
        text: 'You spend a weekend finding the version that works. It is slower, narrower, and legally solid. He gets most of what he wanted and knows exactly who found it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.fatal_flaw', {
    kind: 'random',
    title: 'A clause that should not be there',
    body: 'Reading a signed contract for an unrelated reason, you notice the award criteria were changed after the tender closed. It is not a grey area. If anyone challenges this, it will be annulled, and the works are half-built.',
    weight: 9,
    conditions: { ...legal, minLevel: 1 },
    choices: [
      {
        id: 'flag',
        label: 'Put it in writing immediately',
        text: 'You write the note. It is received the way such notes are received. The administration begins, painfully, to fix it before anyone outside notices — which is the best available outcome and feels like none.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'quiet',
        label: 'Mention it verbally to your director only',
        text: 'He thanks you and says he will look into it. Nothing enters the file. Whatever happens next, there is now no record that you knew.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'flag', flag: 'knows_contract_flaw' },
          { kind: 'queueEvent', eventId: 'evt.followup.annulment', delayTurns: 4 },
        ],
      },
      {
        id: 'ignore',
        label: 'It is not your file',
        text: 'You close it and go back to your own work. The works continue. The clause is still there.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'flag', flag: 'knows_contract_flaw' },
          { kind: 'queueEvent', eventId: 'evt.followup.annulment', delayTurns: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.statutory_clock', {
    kind: 'random',
    title: 'Twenty days',
    body: 'The appeal must be answered within twenty days or it succeeds by default. It is day fourteen, the file is incomplete, and the department that holds the missing evidence is not answering.',
    weight: 12,
    conditions: legal,
    choices: [
      {
        id: 'chase',
        label: 'Go and stand in their office',
        text: 'You walk two floors down and do not leave until you have the documents. It takes an afternoon and costs you a small amount of goodwill and nothing else.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -1 },
        ],
      },
      {
        id: 'partial',
        label: 'Answer on what you have',
        text: 'The response is filed on time and is weaker than it should be. It holds, narrowly, and you know exactly where it would not have.',
        effects: [{ kind: 'stat', stat: 'performance', delta: -1 }],
      },
      {
        id: 'extension',
        label: 'Apply for an extension',
        text: 'Granted, on the fourth attempt, with a note on the file about the administration’s internal coordination. The appellant’s lawyer now knows the department is disorganised.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.external_counsel', {
    kind: 'random',
    title: 'They have hired a firm',
    body: 'Without consulting you, the department has engaged an external law firm on a matter you have been handling for a year. Their first note restates your own advice, at four hundred euros an hour, with more confidence and less accuracy.',
    weight: 10,
    conditions: legal,
    choices: [
      {
        id: 'correct',
        label: 'Correct their note in writing',
        text: 'You identify three errors, courteously and unanswerably. The firm concedes two. Your director reads the exchange and draws the obvious conclusion.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'cooperate',
        label: 'Work with them',
        text: 'You brief them properly, and the joint advice is better than either would have been alone. The invoice is still absurd, and the credit is shared.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'step_back',
        label: 'Hand it over entirely',
        text: 'If they are paying for advice, they can have advice. You get four weeks of your life back and a quiet note in your file about disengagement.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -5 },
          { kind: 'stat', stat: 'reputation', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.precedent', {
    kind: 'random',
    title: 'The first of many',
    body: 'This is a small case with an unusual fact pattern. However you decide it, the decision will be cited internally for years, and applied to people whose circumstances you cannot currently imagine.',
    weight: 10,
    conditions: legal,
    choices: [
      {
        id: 'narrow',
        label: 'Decide it as narrowly as possible',
        text: 'You resolve this case and bind nothing else. It is disciplined lawyering, and in three years someone will complain that the department has no clear line.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: 1 },
        ],
      },
      {
        id: 'principle',
        label: 'Set out the general principle',
        outcomes: [
          {
            weight: 3,
            text: 'You write the reasoning properly and the department gets a rule it can apply. It is cited for a decade, correctly.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'performance', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'The principle is clean and, applied to a case you did not foresee, produces an outcome that is plainly unjust. It is cited at you, in a hearing, four years later.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.anonymous_letter', {
    kind: 'random',
    title: 'An anonymous letter',
    body: 'Two pages, unsigned, alleging that a manager in another department has been approving invoices from a company owned by his brother-in-law. It is detailed enough to be either well-informed or malicious, and it has been sent only to you.',
    weight: 9,
    conditions: legal,
    choices: [
      {
        id: 'formal',
        label: 'Register it and refer it formally',
        text: 'You log it, refer it to internal audit, and step back. The process grinds forward. Whatever happens is at least the organisation’s decision and not yours.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'verify',
        label: 'Check the company register first',
        text: 'Fifteen minutes of public records. The ownership claim is true; the approvals are not his. You refer a much narrower and much better-founded concern, and nobody’s life is destroyed by an unsigned letter.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'bin',
        label: 'Anonymous letters go in the bin',
        text: 'It is a defensible policy, consistently applied. It is also, this once, wrong.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.hearing', {
    kind: 'random',
    title: 'You are the one who goes',
    body: 'The administrative court wants a representative who can answer questions about the decision. That is you. The judge has a reputation for asking the question the file does not answer.',
    weight: 10,
    conditions: { ...legal, minLevel: 2 },
    choices: [
      {
        id: 'prepare',
        label: 'Prepare for three days',
        outcomes: [
          {
            weight: 4,
            text: 'She asks the question. You have the answer, with the document, tabbed. The administration wins and the judgment quotes your evidence.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'performance', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 1,
            text: 'She asks a different question, about a decision taken before you arrived, and the honest answer is that nobody knows why. The administration loses on that point alone.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'wing',
        label: 'Read the file on the train',
        outcomes: [
          {
            weight: 2,
            text: 'You are quick on your feet and it very nearly shows. The case survives. You spend the return journey listing what you would have said.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 4 }],
          },
          {
            weight: 3,
            text: 'You are caught not knowing something you should have known, in public, on the record. It is a bad twenty minutes that follows you home.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.legal.verbal_cover', {
    kind: 'random',
    title: '"Just tell me it’s fine"',
    body: 'A head of department catches you by the lift. He needs to know whether he can do something today. He does not want a note, he wants you to say yes, and he is explicit that he is asking informally so that there is nothing on paper.',
    weight: 11,
    conditions: legal,
    choices: [
      {
        id: 'written',
        label: 'Offer to put it in writing this afternoon',
        text: 'He does not want that and says so. You send the note anyway, short and neutral. He proceeds, correctly, and finds you slightly exhausting.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'verbal_yes',
        label: 'Tell him it is probably fine',
        text: 'It probably is. If it is not, there is no record of the advice, which protects you and leaves him exposed — and you both knew that when you said it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
      {
        id: 'refuse',
        label: 'Decline to advise informally at all',
        text: 'You tell him, without edge, that informal legal advice is how administrations end up in court. He waits two days for the note. He is right that it was inconvenient; you are right that it was necessary.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),
];
