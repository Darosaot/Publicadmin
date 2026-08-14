import { defineEvent } from '../authoring';

/**
 * More of the texture of the job.
 *
 * The original common pool leaned on press, politics and ethics. This one widens it: the physical
 * office, the systems, the public, the profession, and the parts of a working life that have
 * nothing to do with the work.
 */
export const commonExtraEvents = [
  defineEvent('evt.common.freedom_request_bulk', {
    kind: 'random',
    title: 'Forty-one requests from one address',
    body: 'A campaigner has submitted forty-one transparency requests in a fortnight, each individually reasonable and collectively equal to a full-time post. The law does not care that they arrived together.',
    weight: 10,
    choices: [
      {
        id: 'answer_all',
        label: 'Answer every one on time',
        text: 'It consumes the department for five weeks. Every deadline is met, nothing else is, and the campaigner publishes a piece praising the administration’s transparency.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'vexatious',
        label: 'Refuse them as a vexatious pattern',
        outcomes: [
          {
            weight: 2,
            text: 'The refusal holds on review. It is the correct use of a provision that exists precisely for this, and it saves five weeks.',
            effects: [{ kind: 'stat', stat: 'performance', delta: 2 }],
          },
          {
            weight: 3,
            text: 'The refusal is overturned, the deadlines restart, and the administration is now the body that tried to call transparency vexatious.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'publish',
        label: 'Publish the underlying data instead',
        text: 'You put the whole dataset online and answer all forty-one with a link. It takes three weeks, it answers every future request as well, and nobody had thought of it in eleven years.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.legacy_system', {
    kind: 'random',
    title: 'The system nobody understands',
    body: 'The application that runs the core of your department was written in 1997 by a contractor who has since died. It works. Nobody knows how. The supplier who maintains it has just quoted a renewal figure with an extra digit.',
    weight: 10,
    choices: [
      {
        id: 'pay',
        label: 'Pay it',
        text: 'You pay, because the alternative is the department stopping. The supplier learns exactly what you will pay, which is the number they will start from next time.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 1 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'replace',
        label: 'Start the replacement programme',
        outcomes: [
          {
            weight: 2,
            text: 'Three years, over budget, and at the end of it the department has a system it understands. You are not there to see it finished, and your name is on the business case that made it possible.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 3,
            text: 'Eighteen months in, the programme is cancelled after a change of leadership. The old system is still running. So is the maintenance contract, at the higher price.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'document',
        label: 'Have someone document it first',
        text: 'Four months of a junior officer sitting with the system and writing down what it does. Deeply unglamorous, and it halves the quoted figure at the next renewal because you can finally describe what you are buying.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.office_move', {
    kind: 'random',
    title: 'The building is being consolidated',
    body: 'Your department is moving to an open-plan floor with fewer desks than people, on the reasoning that not everyone is in on the same day. The reasoning is correct and everyone hates it.',
    weight: 10,
    choices: [
      {
        id: 'accept',
        label: 'Accept the plan and make it work',
        text: 'You spend a fortnight on seating, storage and the small things that make a floor bearable. It is fine. Nobody thanks you for the fortnight, and it would have been much worse without it.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'fight',
        label: 'Fight for the space',
        outcomes: [
          {
            weight: 2,
            text: 'You win four extra desks and a quiet room by being tediously persistent with an estates team that had assumed nobody would be.',
            effects: [
              { kind: 'teamMorale', delta: 6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
            ],
          },
          {
            weight: 3,
            text: 'You lose, having spent six weeks and a measurable amount of goodwill on furniture.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.common.audit_of_you', {
    kind: 'random',
    title: 'Internal audit would like a word about process',
    body: 'Not about a decision — about how you work. They have noticed that your department closes files faster than any comparable one and would like to understand why, in a tone that could mean either of the two possible things.',
    weight: 10,
    choices: [
      {
        id: 'open',
        label: 'Show them everything, including the shortcuts',
        outcomes: [
          {
            weight: 3,
            text: 'The shortcuts turn out to be good practice nobody had written down. The audit report recommends them to every other department, with your name in it.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'Two of the shortcuts turn out to be shortcuts. The report is measured, the recommendations are fair, and the department is slower by a third for the following year.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: -3 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'formal',
        label: 'Answer strictly what is asked',
        text: 'A correct, narrow, unhelpful engagement. The audit closes with a recommendation about "documentation of working practices" and a note about the department’s cooperation.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.mistake_yours', {
    kind: 'random',
    title: 'It was you',
    body: 'A decision going out under the department’s name is wrong, and tracing it back, the error is yours. Nobody has noticed. It will affect about two hundred people, none of whom will know why.',
    weight: 12,
    choices: [
      {
        id: 'own',
        label: 'Report it immediately',
        text: 'You write it up before anyone asks, with the correction attached. It is a bad morning and a short one, and it is the single most useful thing you do for your reputation that year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'fix_silently',
        label: 'Correct it without telling anyone',
        outcomes: [
          {
            weight: 3,
            text: 'Fixed in a fortnight, quietly, at some personal cost. Two hundred people get the right outcome. The record shows nothing ever went wrong.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'The correction is spotted by someone reconciling the numbers, and the question is no longer about the error but about the fortnight.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -4 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 1 },
            ],
          },
        ],
      },
      {
        id: 'nothing',
        label: 'Leave it',
        text: 'It is small, it is untraceable, and nobody will ever connect it to you. You are right about all three, which is not the same as it being nothing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'flag', flag: 'buried_own_error' },
        ],
      },
    ],
  }),

  defineEvent('evt.common.professional_body', {
    kind: 'random',
    title: 'A seat on the professional body',
    body: 'The national association for your discipline is looking for a council member. Unpaid, six meetings a year, and every person who has ever held it seems to be well connected.',
    weight: 9,
    conditions: { minLevel: 2 },
    choices: [
      {
        id: 'stand',
        label: 'Stand for it',
        outcomes: [
          {
            weight: 3,
            text: 'Elected. Six evenings a year among people who do your job elsewhere, and a slow accumulation of the kind of contact that turns into a job offer four years later.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'You lose to a better-known candidate from a bigger administration. It costs an evening and a small amount of pride.',
            effects: [{ kind: 'stat', stat: 'politicalCapital', delta: 1 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Leave it to someone else',
        text: 'Six evenings a year is six evenings a year. You keep them.',
        effects: [{ kind: 'stat', stat: 'stress', delta: -3 }],
      },
    ],
  }),

  defineEvent('evt.common.data_breach', {
    kind: 'random',
    title: 'The spreadsheet had a hidden tab',
    body: 'A file published on the website last week contained, in a tab nobody checked, the personal details of three hundred applicants. It has been downloaded eleven times.',
    weight: 10,
    choices: [
      {
        id: 'full_disclosure',
        label: 'Notify everyone affected and the regulator',
        text: 'Three hundred letters, a regulator notification within seventy-two hours, and a genuinely unpleasant fortnight. The regulator’s finding notes the speed of the response as mitigation.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
      {
        id: 'quiet_pull',
        label: 'Pull the file and assess whether notification is required',
        outcomes: [
          {
            weight: 2,
            text: 'The assessment concludes the risk is low and documents why. It is a defensible judgement, properly recorded, and it holds.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 5 },
              { kind: 'stat', stat: 'performance', delta: 1 },
            ],
          },
          {
            weight: 3,
            text: 'One of the eleven downloads was a journalist. The story is not the breach; the story is the eleven days.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -7 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.common.secondment_offer', {
    kind: 'random',
    title: 'Six months somewhere else',
    body: 'A secondment has come up: six months in a different administration, doing adjacent work, returning to your post afterwards. Your director is neutral in a way that means it is entirely your decision.',
    weight: 9,
    conditions: { minLevel: 2 },
    choices: [
      {
        id: 'go',
        label: 'Take it',
        outcomes: [
          {
            weight: 3,
            text: 'Six months of seeing how a competent organisation does the same job differently. You come back with three things worth stealing and a network in a building you had never entered.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'Six months of being the outsider in a place with its own way of doing things. You learn what you do not want to be, which is worth something, and your own department has reorganised without you.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'performance', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay where the work is',
        text: 'You have three things in flight that would not survive your absence. It is a good reason, and it is also the reason you will give the next time.',
        effects: [{ kind: 'stat', stat: 'performance', delta: 2 }],
      },
    ],
  }),

  defineEvent('evt.common.new_minister', {
    kind: 'random',
    title: 'Everything is a priority again',
    body: 'A change at the political level has produced a new set of priorities, delivered as a list of eleven items, of which four contradict each other and two are already department policy under different names.',
    weight: 11,
    conditions: { minLevel: 2 },
    choices: [
      {
        id: 'map',
        label: 'Map them honestly against what exists',
        text: 'A one-page table showing which are new, which are already happening, and which cannot both be done. It is exactly what was needed and nobody enjoys receiving it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'rename',
        label: 'Rename existing work to match the new list',
        text: 'By Friday the department is delivering nine of the eleven priorities, having changed nothing but the headings. Everyone is pleased. Two of the genuinely new things quietly never start.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
        ],
      },
      {
        id: 'pick',
        label: 'Pick the two that matter and do them properly',
        outcomes: [
          {
            weight: 3,
            text: 'You choose the two that would still be worth doing in five years and put the department behind them. Both land. Nobody asks about the other nine.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'performance', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'You choose two and are asked, in a meeting, about the other nine, by someone holding the list.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.common.long_service', {
    kind: 'random',
    title: 'Someone is retiring after thirty-eight years',
    body: 'She has been in the building since before the department existed in its current form. There is a cake at three. Nobody has written anything down about what she knows.',
    weight: 10,
    conditions: { minTurn: 24 },
    choices: [
      {
        id: 'capture',
        label: 'Spend her last month recording what she knows',
        text: 'Four sessions and a document. It reads like nothing and it answers, over the following three years, about sixty questions that would otherwise have had no answer.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'send_off',
        label: 'Give her a proper send-off instead',
        text: 'A real speech, people invited who left years ago, and an afternoon that means something to her. The knowledge goes with her. You do not regret the choice.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
      {
        id: 'cake',
        label: 'Cake at three',
        text: 'Cake at three. She leaves at five. Six weeks later somebody asks why the process works the way it does, and the honest answer is that nobody left knows.',
        effects: [{ kind: 'stat', stat: 'performance', delta: -3 }],
      },
    ],
  }),

  defineEvent('evt.common.consultant_report', {
    kind: 'random',
    title: 'The consultants have reported',
    body: 'Four months and a substantial fee have produced a document whose central recommendation is the thing your department proposed, in writing, two years ago, and which was refused.',
    weight: 10,
    choices: [
      {
        id: 'gracious',
        label: 'Support it without mentioning the history',
        text: 'It gets done, which was the point. Someone senior privately remembers that you did not say the obvious thing, which is worth more than saying it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'point_out',
        label: 'Point out that this was your proposal',
        outcomes: [
          {
            weight: 2,
            text: 'You attach the original note. The room reads it, is briefly embarrassed, and your department is asked to lead the implementation.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
            ],
          },
          {
            weight: 3,
            text: 'It reads as sour, whatever the merits. The recommendation proceeds under the consultants’ name and you have spent capital being right in public.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'improve',
        label: 'Use the moment to get more than they recommended',
        conditions: { minStat: { politicalCapital: 25 } },
        text: 'With the door open you push through the recommendation and the two things it would need to actually work, which the consultants had not identified. It is the best use of somebody else’s fee you will ever make.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.public_meeting', {
    kind: 'random',
    title: 'A hall with two hundred angry people in it',
    body: 'The public meeting about the decision is tonight. The decision is correct, it is final, and the two hundred people are correct that nobody explained it to them before it was made.',
    weight: 10,
    choices: [
      {
        id: 'attend',
        label: 'Go and answer questions for two hours',
        outcomes: [
          {
            weight: 3,
            text: 'It is bruising for forty minutes and then, gradually, it becomes a conversation. Nothing changes about the decision. About thirty people leave understanding it, which is thirty more than this morning.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'It does not become a conversation. Two hours of being shouted at by people who have every right to be angry and no way to change anything.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 11 },
            ],
          },
        ],
      },
      {
        id: 'send',
        label: 'Send the communications team',
        text: 'They handle it professionally and cannot answer a single substantive question, because they do not know the answers. The room concludes, reasonably, that nobody who mattered came.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'written',
        label: 'Publish a full written explanation instead',
        text: 'Eleven pages, plainly written, published the morning of the meeting. Forty people read it properly. The meeting is still difficult and is at least about the actual decision.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.former_colleague_supplier', {
    kind: 'random',
    title: 'Someone you trained now sells to you',
    body: 'He left four years ago for a firm that supplies the administration. He is good, the product is genuinely appropriate, and he is on the other side of a table you used to sit at together.',
    weight: 10,
    choices: [
      {
        id: 'declare',
        label: 'Declare the relationship and step back',
        text: 'You register it and hand the decision to a colleague. The firm may or may not win. Nobody will ever be able to ask the question.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'declare_stay',
        label: 'Declare it and stay in the room',
        text: 'Registered, disclosed to the panel, and you take part anyway because there is nobody else who understands the technical requirement. It is defensible and it will be questioned if the firm wins.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 1 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'nothing',
        label: 'It was four years ago',
        text: 'You say nothing, because it genuinely does not affect your judgement. That is probably true. It is not the test, and you know what the test is.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'flag', flag: 'undeclared_interest' },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.ombudsman', {
    kind: 'random',
    title: 'The ombudsman has an opinion',
    body: 'A case you handled two years ago has reached the ombudsman, who has found maladministration — not in the decision, which was right, but in taking eleven months to communicate it.',
    weight: 9,
    conditions: { minTurn: 18 },
    choices: [
      {
        id: 'accept_fix',
        label: 'Accept it and fix the process',
        text: 'You accept the finding without qualification and change the process so it cannot take eleven months again. The ombudsman’s annual report cites it as an example of good response.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'context',
        label: 'Accept it, with context about the resourcing',
        text: 'You accept and explain the two vacancies that caused it. The explanation is true and reads, in print, as an excuse.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'contest',
        label: 'Contest the finding',
        text: 'The finding stands, as ombudsman findings generally do, and the file now contains both the maladministration and the argument about it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.pay_freeze', {
    kind: 'random',
    title: 'The pay settlement',
    body: 'This year’s settlement is below inflation for the fourth consecutive year. You are asked to communicate it to your colleagues as though it were news about something else.',
    weight: 10,
    choices: [
      {
        id: 'straight',
        label: 'Tell them exactly what it is',
        text: 'You say the number, say what it means in real terms, and do not dress it. People are angry about the settlement rather than about you, which is the most that was available.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'teamMorale', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'positive',
        label: 'Use the framing you were given',
        text: '"A settlement that reflects the fiscal position while recognising the contribution of colleagues." Nobody in the room is fooled, and something small is spent that you cannot get back.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'teamMorale', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.union_rep_request', {
    kind: 'random',
    title: 'The union rep wants a standing meeting',
    body: 'She proposes half an hour a month, before problems become grievances. It is an entirely reasonable request from someone whose job is to make your job harder in specific and legitimate ways.',
    weight: 9,
    choices: [
      {
        id: 'agree',
        label: 'Agree to it',
        text: 'Half an hour a month, and over two years perhaps four things that would have become formal never do. It is impossible to prove and obviously true.',
        effects: [
          { kind: 'teamMorale', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: -2 },
        ],
      },
      {
        id: 'ad_hoc',
        label: 'Offer to meet whenever there is an issue',
        text: 'Which sounds identical and is not: by the time there is an issue there is an issue. The first grievance of the year arrives in March.',
        effects: [{ kind: 'queueEvent', eventId: 'evt.followup.union_grievance', delayTurns: 3 }],
      },
    ],
  }),

  defineEvent('evt.common.small_kindness', {
    kind: 'random',
    title: 'A letter from someone you helped',
    body: 'A handwritten letter, forwarded through three internal addresses. Eighteen months ago you spent an afternoon getting a case unstuck for a woman whose name you do not remember. She writes to say what it changed.',
    weight: 9,
    conditions: { minTurn: 18 },
    choices: [
      {
        id: 'keep',
        label: 'Keep it in your desk drawer',
        text: 'You read it twice and put it in the drawer, where it stays for the rest of your career and gets taken out on the worst days.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'share',
        label: 'Read it out at the team meeting',
        text: 'You read it to a room that has spent the month on process. It is the only agenda item anyone remembers, and two people ask afterwards for the case reference.',
        effects: [
          { kind: 'teamMorale', delta: 8 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
      },
    ],
  }),

  defineEvent('evt.common.election_period', {
    kind: 'random',
    title: 'Purdah',
    body: 'The pre-election period has started. Nothing may be announced, published, or decided that could be read as influencing the outcome, which turns out to describe most of what the department was going to do this month.',
    weight: 10,
    choices: [
      {
        id: 'strict',
        label: 'Apply it strictly',
        text: 'Everything stops that could conceivably be questioned. Six weeks of backlog, no criticism, and a department that has learned to hold its breath every four years.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'judgement',
        label: 'Apply judgement, case by case',
        outcomes: [
          {
            weight: 3,
            text: 'You separate what is genuinely sensitive from what is merely scheduled, and keep two thirds of the work moving. Nobody queries any of it.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 2 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
          {
            weight: 2,
            text: 'One publication is queried by a candidate. It was defensible, the answer is accepted, and the fortnight it consumes is not returned to you.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'prepare',
        label: 'Use the six weeks on everything that has been deferred',
        text: 'The department spends purdah doing the internal work it never has time for. It emerges in better shape than it went in, which nobody has ever managed before.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'teamMorale', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),
];
