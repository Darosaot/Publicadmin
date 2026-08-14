import { defineEvent } from '../authoring';

/**
 * The things that come back.
 *
 * Every event here is gated on a flag set by a decision the player actually took, often many
 * years earlier, and none of them can fire otherwise. Twenty-five flags in the corpus were being
 * written and never read — a great deal of authored consequence that no player could reach — and
 * this pool is where that promise is kept.
 *
 * Two rules held throughout. Consequences take time, so almost everything here waits several
 * years. And the reckoning is rarely a punishment: it is usually a second decision, taken with
 * more information and less room, about something you have not thought about in a decade.
 */
export const reckoningEvents = [
  /* ------------------------------------------------------ what you took */

  defineEvent('evt.reckon.gift_register', {
    kind: 'random',
    title: 'The hospitality register',
    body: 'Internal audit is reconciling the gifts and hospitality register against supplier records, going back six years. The register does not contain everything the supplier records contain.',
    weight: 11,
    conditions: { requiredFlags: ['accepted_supplier_gift'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'declare_late',
        label: 'Declare it now, late, in writing',
        outcomes: [
          {
            weight: 3,
            text: 'A late declaration is a bad look and a closed matter. You write the entry, date it honestly as retrospective, and explain why it was not made at the time. Nobody enjoys the conversation and nobody has to have it twice.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'The late entry is one of four from the same supplier, and yours is the only one declared. The other three belong to people who will now be asked, and who will know exactly why they were asked.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
            conditions: { requiredFlags: ['supplier_familiarity'] },
          },
        ],
      },
      {
        id: 'nothing',
        label: 'It was under the threshold',
        text: 'It was, and the reconciliation is a sampling exercise, and yours is not in the sample. What the audit produces is a recommendation that the register be kept properly. You read it twice.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'fix_the_system',
        label: 'Rebuild the register process instead',
        text: 'You do not declare the six bottles. You do design the process that would have caught them, and it catches nine things in its first year, none of them yours. It is a strange kind of restitution and it is not nothing.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -1 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.undeclared_interest', {
    kind: 'random',
    title: 'The declaration of interests form',
    body: 'The annual form has a new question, phrased precisely enough that the thing you did not declare years ago is now unambiguously within scope. It also asks whether your previous declarations were complete.',
    weight: 11,
    conditions: { requiredFlags: ['undeclared_interest'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'declare_and_correct',
        label: 'Declare it, and correct the earlier forms',
        text: 'Two sentences that cost you an uncomfortable meeting and end a thing you have carried for years. The corrected forms go on file. Nobody ever mentions it again, and you stop checking whether they will.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
        ],
      },
      {
        id: 'declare_only_now',
        label: 'Declare it now and leave the old forms alone',
        text: 'Correct going forward, silent going backward. It is the answer most people give, and it leaves a documented inconsistency that only matters if somebody ever lines the forms up.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 1 },
          { kind: 'stat', stat: 'stress', delta: 2 },
        ],
      },
      {
        id: 'no_again',
        label: 'Answer no, again',
        text: 'The fourth consecutive year. It gets marginally easier each time, which is the part that ought to worry you and does, briefly, on the drive home.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  /* --------------------------------------------------- what you buried */

  defineEvent('evt.reckon.page_fifty_one', {
    kind: 'random',
    title: 'Somebody read page fifty-one',
    body: 'A researcher writing about the policy has read the technical annex — all of it — and has quoted the sentence beginning "It should be noted that" in a paper that is about to be published. Her reading of it is correct.',
    weight: 11,
    conditions: { requiredFlags: ['buried_a_finding'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'confirm',
        label: 'Confirm her reading publicly',
        text: 'You say, on the record, that the finding was in the document, that it was in the annex, and that the annex is where things go when nobody wants to argue about them. It is the most useful thing you say that year and it is not free.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -7 },
        ],
      },
      {
        id: 'context',
        label: 'Offer her the full context privately',
        text: 'An hour on the phone in which you explain what the finding meant, what was done about it, and what was not. She publishes a fairer paper than she would have, and a footnote thanking an unnamed official.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'nothing_to_add',
        label: '"The department has nothing to add to the published report"',
        text: 'Which is true, in the sense that everything is technically published. The paper runs with the sentence and the department’s non-answer beside it, and the non-answer is what gets quoted.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.small_error_traced', {
    kind: 'random',
    title: 'A reconciliation has found it',
    body: 'The error you decided was small, untraceable and nobody’s business has been traced, by a system that did not exist when you made that decision. It is still small. It now has your name on it and a date.',
    weight: 11,
    conditions: { requiredFlags: ['buried_own_error'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'own_it',
        label: 'Say plainly that you knew at the time',
        outcomes: [
          {
            weight: 3,
            text: 'You could have said you had not noticed. Instead you say you noticed and decided it was too small to raise, and that you were wrong about the second part. The note on the file is short and it is yours.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'You own it, and the person reviewing it has spent two years reading files in which nobody owns anything. She writes that down as well.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'not_noticed',
        label: 'Say you did not notice at the time',
        text: 'Unfalsifiable, entirely ordinary, and accepted without a second question. You have converted a small error into a small lie, which is a worse trade than it looked from here.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.transcript', {
    kind: 'random',
    title: 'The transcript',
    body: 'A related matter has reopened, and the account you gave under the last one is in the bundle. Reading it now, in the calm of your own office, you can see exactly which sentence will be put to you.',
    weight: 10,
    conditions: { requiredFlags: ['lied_to_an_inquiry'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'correct_it',
        label: 'Correct the record before you are asked',
        outcomes: [
          {
            weight: 3,
            text: 'You write to the inquiry secretary saying that one part of your earlier account was wrong and setting out the true version. It ends your prospects at the level above and it ends the sentence that was going to be put to you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 10 },
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: -8 },
            ],
          },
          {
            weight: 2,
            text: 'The correction arrives before anyone had spotted the discrepancy, which the secretary notes, and which turns a finding into a paragraph about a witness who came back of their own accord.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 10 },
              { kind: 'stat', stat: 'reputation', delta: -1 },
              { kind: 'stat', stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold the line you took',
        text: 'You hold it, because the alternative is admitting the first one. The sentence is put to you, you answer it consistently, and you spend the following four years being consistent about it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 10 },
        ],
      },
      {
        id: 'find_who',
        label: 'Find out who reopened it',
        conditions: { requiredFlags: ['hunted_a_discloser'] },
        text: 'You did this once before and told yourself it was only curiosity. It was not then and it is not now, and this time the person who notices you looking is the one who reopened the matter.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -8 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------ what you signed off */

  defineEvent('evt.reckon.deficit_matured', {
    kind: 'random',
    title: 'The reclassification comes due',
    body: 'The problem you moved twelve months has been moved twelve months four more times by four more people, and has arrived back on your desk considerably larger, wearing a different account code.',
    weight: 12,
    conditions: { requiredFlags: ['carried_a_deficit'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'stop_it',
        label: 'Recognise the whole thing this year',
        outcomes: [
          {
            weight: 3,
            text: 'You take the entire accumulated hit in one set of accounts, with a note explaining how it got that big. It is the worst year-end in a decade and the last one of its kind.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'You recognise it, and the note explaining how it got that big names the years rather than the people, which is generous and which everyone involved understands precisely.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'again',
        label: 'It can go one more year',
        outcomes: [
          {
            weight: 3,
            text: 'It can. It does. You are now the person who did this five times, which is a different thing from the person who did it once.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'The external auditors, who have been reading the same accounts for five years, ask the question directly this time. There is no version of the answer that does not include the word deferred.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 },
            ],
            conditions: { requiredFlags: ['creative_accounting'] },
          },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.inflated_figure', {
    kind: 'random',
    title: 'The number is in the evaluation',
    body: 'The figure you signed off, which was optimistic in a way you understood at the time, has been used as the baseline for a national evaluation. Everything downstream of it is wrong by exactly the amount you know about.',
    weight: 11,
    conditions: { requiredFlags: ['signed_off_inflated_figure'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'correct_baseline',
        label: 'Correct the baseline and let the evaluation redo its work',
        text: 'Nine months of somebody else’s analysis has to be redone, and you are the reason. You are also the reason the conclusions are true, which is a harder thing to put in an email but is the thing that matters.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'flag_privately',
        label: 'Tell the lead evaluator quietly',
        text: 'She adjusts the baseline without a public correction and without naming where the adjustment came from. The evaluation is right and the record of how it got there is not.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'leave_it',
        label: 'The figure was signed off. It stands.',
        outcomes: [
          {
            weight: 3,
            text: 'It stands, and so does everything built on it, and the policy that follows is designed for a country slightly different from the real one.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'performance', delta: -2 },
            ],
          },
          {
            weight: 2,
            text: 'It stands until a second dataset contradicts it in public, at which point everyone traces the baseline back to a signature that is yours.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'reputation', delta: -6 },
            ],
            conditions: { requiredFlags: ['reported_incomplete_milestone'] },
          },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.collusion_confirmed', {
    kind: 'random',
    title: 'It was what you thought it was',
    body: 'The competition authority has fined a cartel. Two of the names are the firms that shared an address in your tender, and the infringement period covers the year you noticed and proceeded.',
    weight: 11,
    conditions: { requiredFlags: ['ignored_collusion_signal'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'volunteer',
        label: 'Volunteer the file, including your own note',
        text: 'You send them everything, including the line recording that you noticed. It strengthens their case and weakens your position, and the second of those is the smaller number by a very long way.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'respond_if_asked',
        label: 'Wait to be asked',
        text: 'They do not ask. The file stays where it is, the fine is levied without it, and the sentence you wrote at the time stays unread in a folder you could find in ninety seconds.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'recover',
        label: 'Pursue the administration’s losses',
        text: 'You spend eight months building a damages claim against the cartel, which is both the right thing and a use of your time that nobody will ask awkward questions about. It recovers a great deal of money.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.opinion_as_precedent', {
    kind: 'random',
    title: 'Your opinion is being relied on',
    body: 'The opinion you softened is now the department’s settled position, cited in three later decisions by people who assume the softening was legal judgement rather than a Thursday afternoon and a difficult conversation.',
    weight: 11,
    conditions: { requiredFlags: ['softened_an_opinion'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'reopen',
        label: 'Reopen it and give the unsoftened view',
        outcomes: [
          {
            weight: 3,
            text: 'You write the opinion you should have written, note that it supersedes the earlier one, and set out what changed — which was you. Three decisions have to be revisited and all three end up correct.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'You reopen it and are told, politely and finally, that the position is settled and that reopening it would call three decisions into question. The unsoftened opinion exists now, on the file, unread.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
            ],
            conditions: { requiredFlags: ['softened_for_politics'] },
          },
        ],
      },
      {
        id: 'let_it_stand',
        label: 'It has held for years. Let it stand.',
        text: 'It has, and it will, and every year that passes makes it harder to say that the reasoning was never quite the reasoning. This is how a department comes to believe something.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------- and the people */

  defineEvent('evt.reckon.favour_called', {
    kind: 'random',
    title: 'He remembers the eleven minutes',
    body: 'The councillor whose file you moved up the queue is now considerably more senior, and has asked for a meeting. He is warm, he remembers your name, and he has something he would like handled.',
    weight: 12,
    conditions: { requiredFlags: ['owes_favour_councillor'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'pay_it',
        label: 'Handle it',
        text: 'It is smaller than the favour he thinks he is calling in, and you do it in an afternoon, and the ledger between you is now clear in his mind and not in yours.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 8 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
        ],
      },
      {
        id: 'refuse_warmly',
        label: 'Decline, and explain why',
        text: 'You tell him you moved a file once and have thought about whose file moved down ever since, and that you are not doing it again. He takes it better than you expect and does not call again.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
      },
      {
        id: 'route_it',
        label: 'Put it through the proper channel, personally',
        text: 'You take it, log it, and give it exactly the priority the rules give it — then tell him that is what you have done. It costs you the relationship in exchange for a file that can survive being looked at.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.leverage_spent', {
    kind: 'random',
    title: 'The thing you both know',
    body: 'The man who went very still and thanked you twice is now on the panel for something you want. Neither of you has ever mentioned it again. Both of you have thought about it this week.',
    weight: 11,
    conditions: { requiredFlags: ['holds_leverage'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'release',
        label: 'Tell him it was never leverage',
        text: 'You say, plainly, that you did not report it because it did not need reporting, and that he owes you nothing, and that you would like the panel to be a panel. He does not entirely believe you. He behaves as though he does, which turns out to be the same thing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
      },
      {
        id: 'let_it_work',
        label: 'Say nothing and let it work',
        outcomes: [
          {
            weight: 3,
            text: 'It works. It was always going to work. You will never know whether you would have got it anyway, and that is the price, and it is charged every time you think about the appointment afterwards.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: -6 },
            ],
          },
          {
            weight: 2,
            text: 'It works, and a second member of the panel notices that it worked, and files away a small observation about how you get things.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'withdraw',
        label: 'Withdraw from the process',
        conditions: { requiredFlags: ['knows_old_irregularity'] },
        text: 'You take yourself out of it rather than find out. It costs you the post. It also ends a decade of carrying two people’s old paperwork around in your head, and you sleep properly for the first time in a while.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: -12 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.journalist_returns', {
    kind: 'random',
    title: 'The same number, years later',
    body: 'He has your number because you gave it to him. He is more senior now, writing something longer, and he is not asking about a decision — he is asking whether you would talk about how the place actually works.',
    weight: 12,
    conditions: { requiredFlags: ['journalist_has_your_number'], minYearsElapsed: 4 },
    choices: [
      {
        id: 'on_record',
        label: 'Talk to him, on the record',
        outcomes: [
          {
            weight: 3,
            text: 'Three hours across two meetings, all of it attributable. The piece is the fairest account of public administration anyone has published in a decade, and about a third of your colleagues stop speaking to you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -10 },
            ],
          },
          {
            weight: 2,
            text: 'You are careful, accurate and quotable, and the sentence he leads with is the one you were least careful about. It is not unfair. It is just the one that reads best.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'background',
        label: 'Help him on background only',
        text: 'You explain the machinery without ever being the source of anything. The piece is better for it, nobody knows you helped, and you have made yourself useful to a journalist for the third time, which is a thing you now are.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'decline',
        label: 'Tell him you cannot',
        text: 'He accepts it immediately and without resentment, which is worse than an argument. The piece runs without a single official voice in it, and reads exactly like that.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.the_peer', {
    kind: 'random',
    title: 'The person you moved past',
    body: 'The colleague whose position you quietly weakened has been appointed to something that has you inside its remit. The appointment was announced this morning. Your inbox has been very quiet since.',
    weight: 11,
    conditions: { requiredFlags: ['undermined_a_peer'], minYearsElapsed: 3 },
    choices: [
      {
        id: 'go_and_say_it',
        label: 'Go and say what you did',
        outcomes: [
          {
            weight: 3,
            text: 'You say it without softening it and without asking for anything. He listens, says that he had always known, and that he had wondered whether you did. The working relationship that follows is oddly one of the better ones you have.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: -6 },
            ],
          },
          {
            weight: 2,
            text: 'He listens, thanks you for coming, and does not forgive you. It was not the price of forgiveness; it was the price of him not having to wonder. You both work with what is left.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'professional',
        label: 'Be impeccably professional and say nothing',
        text: 'Every meeting is correct, every paper is early, and neither of you refers to it once in four years. It is a great deal of work, sustained indefinitely, to avoid a conversation lasting ten minutes.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'get_ahead',
        label: 'Get to the people around him first',
        conditions: { requiredFlags: ['tipped_off_a_colleague'] },
        text: 'You did this before and it worked, so you do it again: a version of the history reaches his new colleagues before he does. It works again, and each time it works you get slightly better at it.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -7 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.predecessor_returns', {
    kind: 'random',
    title: 'The predecessor you blamed',
    body: 'The mess you inherited and said so about, loudly, turns out to have been created two posts before the person you named. She has been carrying it publicly for years. You have known for two of them.',
    weight: 10,
    conditions: { requiredFlags: ['blamed_a_predecessor'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'correct_publicly',
        label: 'Correct it as publicly as you said it',
        text: 'The same forum, the same audience, and a plain statement that you got it wrong and who actually did it. It takes four minutes. She writes to you afterwards and the letter is shorter and kinder than you deserve.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'tell_her',
        label: 'Tell her privately',
        text: 'She is gracious about it. The public version is unchanged, so the correction exists only between the two of you, which helps exactly one of you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -2 },
        ],
      },
      {
        id: 'let_it_lie',
        label: 'It was years ago',
        text: 'It was, and nobody is asking, and she has stopped explaining it to people. That is what it looks like when a thing has settled: not resolution, just everyone getting tired.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
        ],
      },
    ],
  }),

  /* ------------------------------------------- and the things you did not do */

  defineEvent('evt.reckon.the_plateau_held', {
    kind: 'random',
    title: 'The bulletins you stopped reading',
    body: 'Someone who joined the year you decided to stop climbing is now two levels above you and has just been in the news, competently. You notice that the feeling this produces is very mild.',
    weight: 10,
    conditions: { requiredFlags: ['chose_the_plateau'], minYearsElapsed: 6 },
    choices: [
      {
        id: 'still_true',
        label: 'It was the right call and it still is',
        text: 'You have done the work, all of it, properly, for years, and the people who depend on it have never once had to think about you. That was the entire ambition and it has been met.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
      {
        id: 'reconsider',
        label: 'Read the bulletins again',
        text: 'One evening, then most evenings. Whatever you settled a decade ago is unsettled now, and it turns out the settling was the part that was doing the work.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.what_you_refused', {
    kind: 'random',
    title: 'The offer you turned down',
    body: 'The private firm you said no to has been in the papers, and not well. Two of the people who took the money are named. You are not, because you are not on any of the documents, because you said no.',
    weight: 10,
    conditions: { requiredFlags: ['turned_down_the_money'], minYearsElapsed: 4 },
    choices: [
      {
        id: 'say_nothing',
        label: 'Say nothing at all about it',
        text: 'Not to colleagues, not at home, not to the one person who would enjoy hearing it. You simply get to know that you did not, which is the only form the reward was ever going to take.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: -8 },
        ],
      },
      {
        id: 'use_it',
        label: 'Let it be known, gently',
        text: 'You mention it once, in the right room, in a way that sounds like context rather than a claim. It does exactly what you wanted it to do, and cheapens the thing itself by a small and permanent amount.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
      {
        id: 'the_note',
        label: 'Go and find the note you wrote at the time',
        conditions: { requiredFlags: ['recorded_the_pressure'] },
        text: 'It is where you left it, dated, describing exactly what was said to you and by whom. You send it to the investigators without being asked. It is the single most useful document they receive.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'stat', stat: 'reputation', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.reckon.after_the_withdrawal', {
    kind: 'random',
    title: 'The person who took it instead',
    body: 'The ministry you withdrew your name from has been run for two years by someone else. They have done some of it well. The two decisions you withdrew rather than defend have both been taken, differently.',
    weight: 10,
    conditions: { requiredFlags: ['declined_the_ministry'], minYearsElapsed: 2 },
    choices: [
      {
        id: 'no_regret',
        label: 'You would do it again',
        text: 'You wrote that the department was better served by someone who had not made your decisions. Watching those decisions be taken by someone who had not made them, you find that you were right and that being right is not especially warming.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: -6 },
        ],
      },
      {
        id: 'advise',
        label: 'Offer them what you know',
        text: 'You write four pages on the eleven decisions in the folder, unasked, with no expectation of a reply. You get one, and it is a good deal longer than four pages, and a working relationship starts that outlasts both of your posts.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'watch',
        label: 'Watch, and say nothing',
        text: 'You read every announcement and comment on none of them. It is a peculiar way to spend two years, and it is entirely your own business, and nobody notices you doing it.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
      },
    ],
  }),
];
