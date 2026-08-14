import { defineEvent } from '../authoring';

const social = { departments: ['social' as const] };

/**
 * Social services.
 *
 * The department where the file is a person, which changes what a dilemma is. Everywhere else the
 * cost of a wrong decision is money, standing or a paragraph in an audit report. Here it is
 * somebody specific, and the writing has to hold that without becoming misery for its own sake —
 * so the choices are usually between two defensible answers with different people behind them.
 */
export const socialEvents = [
  defineEvent('evt.social.threshold_case', {
    kind: 'random',
    title: 'Just under the threshold',
    body: 'The assessment scores him at a point below the line for support. The line is where it is because of a budget decision taken two years ago in a different building. He is seventy-nine and lives alone.',
    weight: 13,
    conditions: social,
    choices: [
      {
        id: 'apply',
        label: 'Apply the threshold',
        text: 'You write the letter that says no, and the reasons are accurate. Eleven weeks later he is in hospital after a fall, at a cost to the state of about forty times what the support would have been.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 7 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'find_a_way',
        label: 'Find the reading of the assessment that gets him over',
        text: 'There is one, it is defensible, and you both know what you have done. He gets four hours a week. So, from now on, does everyone whose assessor is willing to read it that way, which is not everyone.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: -2 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'escalate',
        label: 'Refuse, and put the case up as evidence the line is wrong',
        text: 'He still gets the letter. His case, anonymised, becomes one of nine in a paper that moves the threshold eight months later. Nine people got a letter to produce that paper.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.caseload', {
    kind: 'random',
    title: 'Forty-one open cases',
    body: 'The safe caseload is twenty-eight. Yours is forty-one, has been for five months, and the only way anybody knows how to bring it down is to close cases that are not finished.',
    weight: 13,
    conditions: social,
    choices: [
      {
        id: 'report_it',
        label: 'Put the number in writing, to everyone who should see it',
        text: 'An email that names the figure and says plainly what will happen at forty-one. It makes you unpopular for a quarter and it exists, dated, when somebody eventually asks what was known.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
      {
        id: 'triage',
        label: 'Triage honestly and let the bottom ones drift',
        text: 'You rank all forty-one and give the bottom nine the minimum the law requires. It is the only sane response and it means nine people are now receiving a service designed by arithmetic.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'absorb',
        label: 'Carry all forty-one properly',
        text: 'Evenings, weekends, and every case getting what it needs for about four months. Then something in you gives out, quietly, in a car park, and the caseload is still forty-one.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 14 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.family_complaint', {
    kind: 'random',
    title: 'The family are certain you are wrong',
    body: 'They have written to the director, the councillor and the paper. They are angry, articulate and mistaken about the central fact — and underneath the mistake there is something real that nobody has ever explained to them.',
    weight: 12,
    conditions: social,
    choices: [
      {
        id: 'sit_down',
        label: 'Sit down with them for as long as it takes',
        outcomes: [
          {
            weight: 3,
            text: 'Two hours and the central fact finally lands, because you brought the documents and went through them in order. They are not happy. They are no longer fighting the wrong thing.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'Two hours in which nothing lands, because what they cannot accept is not a fact but an outcome. You have given them everything you have and they leave exactly as they arrived.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'formal',
        label: 'Answer through the complaints process',
        text: 'A correct letter in thirty working days that answers every point and explains nothing. It goes to the ombudsman, where the process is found to have been followed impeccably.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'queueEvent', eventId: 'evt.followup.ombudsman', delayTurns: 3 },
        ],
      },
      {
        id: 'reallocate',
        label: 'Move the case to another worker',
        text: 'A fresh start for everyone, and the new worker spends four months rebuilding a relationship that took you two years, and the family learn that complaining changes who but not what.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.provider_cheap', {
    kind: 'random',
    title: 'The cheapest provider',
    body: 'Their price is a third below anyone else and their care plans are template documents with names changed. Awarding elsewhere means the budget does not cover the caseload. Awarding here means two hundred people get whatever that price buys.',
    weight: 12,
    conditions: social,
    choices: [
      {
        id: 'refuse',
        label: 'Refuse to award to them, and say why the budget will not stretch',
        text: 'You put the arithmetic in front of the committee: this budget covers this number of people at a price that is not this one. It is an uncomfortable meeting and the money moves by eleven per cent.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
        ],
      },
      {
        id: 'award_and_watch',
        label: 'Award, and monitor them harder than anyone has been monitored',
        outcomes: [
          {
            weight: 3,
            text: 'Monthly visits, unannounced, for a year. They improve, genuinely, because somebody finally made them. It costs you a great deal of time and it works.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'You monitor them thoroughly and document a decline you cannot stop, because the price was always the reason and monitoring does not change a price.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 9 },
              { kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 3 },
            ],
          },
        ],
      },
      {
        id: 'award',
        label: 'Award it. The budget is the budget.',
        text: 'Two hundred people at a third below the market rate. Every step of the procurement is impeccable and you already know roughly what the review in two years will say.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'flag', flag: 'buried_a_finding' },
        ],
      },
    ],
  }),

  defineEvent('evt.social.press_case', {
    kind: 'random',
    title: 'The case is in the paper',
    body: 'A family have gone to the press. The story is one-sided because the only side that can speak is theirs — everything that would explain the department’s decision is confidential and about a child.',
    weight: 12,
    conditions: social,
    choices: [
      {
        id: 'stay_silent',
        label: 'Say nothing, and take it',
        text: 'The department is described for four days as heartless and incompetent by people who have been told a version of events that leaves out the reason. You cannot correct any of it and you never will be able to.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'general_terms',
        label: 'Explain, in general terms, how decisions like this are taken',
        text: 'No detail about the case, a great deal about the framework. It is duller than their story and about a tenth as widely read, and it is the most you can honestly do.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -2 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'brief_out',
        label: 'Let a journalist understand the missing piece',
        text: 'Nothing on the record and nothing written down, but afterwards he knows why. The coverage turns within two days. You have also just disclosed something about a child to make your department look better.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: -9 },
          { kind: 'flag', flag: 'journalist_has_your_number' },
        ],
      },
    ],
  }),

  defineEvent('evt.social.worker_leaving', {
    kind: 'random',
    title: 'Your best social worker is leaving',
    body: 'Agency work pays her forty per cent more for the same job, with none of the caseload responsibility and none of the panels. She has eleven years here and has cried in the car park twice this month.',
    weight: 12,
    conditions: { ...social, requiresTeam: true },
    choices: [
      {
        id: 'be_honest',
        label: 'Tell her to take it',
        text: 'You say, as her manager, that you cannot match it and that she should go, and mean it. She goes. Three months later she is back on your caseload as an agency worker at forty per cent more, which the budget somehow finds.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'teamMorale', delta: 4 },
          { kind: 'loseStaff' },
        ],
      },
      {
        id: 'fight',
        label: 'Fight for a retention case',
        outcomes: [
          {
            weight: 2,
            text: 'Four weeks, three meetings and a business case comparing her salary to what agency cover costs. It is approved. She stays, and so do two others who were watching to see whether it was worth asking.',
            effects: [
              { kind: 'teamMorale', delta: 12 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 3,
            text: 'Four weeks, three meetings, refused on the grounds that it would set a precedent. She leaves, the precedent is set anyway, and everyone who was watching saw exactly how that went.',
            effects: [
              { kind: 'teamMorale', delta: -10 },
              { kind: 'loseStaff' },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'guilt',
        label: 'Talk about the families who depend on her',
        text: 'It works, which is the problem. She stays for another eighteen months out of an obligation you put there, and leaves at the end of them in a considerably worse state.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'teamMorale', delta: -4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.review_blame', {
    kind: 'random',
    title: 'The review wants a name',
    body: 'The serious case review is nearly finished. What it has found is a system in which eleven people each did something slightly wrong under impossible pressure. What everyone reading it will want is one person who did something very wrong.',
    weight: 11,
    conditions: { ...social, minLevel: 3 },
    choices: [
      {
        id: 'systemic',
        label: 'Write it as the systemic failure it was',
        outcomes: [
          {
            weight: 3,
            text: 'Eleven small failures and the conditions that produced them, named in order, with the resourcing decision at the top. It is harder to read and it is the only version anybody can learn from.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
          },
          {
            weight: 2,
            text: 'You write it systemically and it is reported as a report that blamed nobody, which is treated as the same thing as a whitewash by people who have not read it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
            ],
          },
        ],
      },
      {
        id: 'name_someone',
        label: 'Let the account settle on the worker who was closest to it',
        text: 'She was closest to it and she did get it wrong, and she was carrying forty-one cases at the time, and the review does not say the second part with any force. She leaves the profession within the year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -9 },
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'teamMorale', delta: -12 },
          { kind: 'flag', flag: 'blamed_a_predecessor' },
        ],
      },
    ],
  }),

  defineEvent('evt.social.good_outcome', {
    kind: 'random',
    title: 'A letter from someone who came through it',
    body: 'A young man of twenty-three has written to the department. He was in your caseload eleven years ago and would like somebody to know that he is all right, and specifically why.',
    weight: 11,
    conditions: { ...social, minYearsElapsed: 6 },
    choices: [
      {
        id: 'reply',
        label: 'Write back properly',
        text: 'An hour on a letter to somebody you last saw as a twelve-year-old. You do not tell anyone at work about it, and you keep his letter in a drawer for the rest of your career.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -12 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'share_it',
        label: 'Read it out at the team meeting',
        text: 'Nine people who have not had a good week hear that it sometimes works. Two of them are still in the profession three years later and one of them says, much later, that it was because of a Tuesday morning.',
        effects: [
          { kind: 'teamMorale', delta: 14 },
          { kind: 'stat', stat: 'stress', delta: -8 },
        ],
      },
      {
        id: 'use_it',
        label: 'Send it up as evidence of what the service achieves',
        text: 'It goes into the annual report, anonymised, beside a chart. It is genuinely useful in the funding round and something about it being useful is not quite right.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  /* ------------------------------- a second pass, once the job is familiar */

  defineEvent('evt.social.the_one_you_remember', {
    kind: 'random',
    title: 'You are still carrying one of them',
    body: 'There is a case from your third year that you think about. Nothing about it was found to be wrong. You have read the file since and cannot see what you would have done differently, and you think about it anyway.',
    weight: 11,
    conditions: { ...social, minYearsElapsed: 5 },
    choices: [
      {
        id: 'talk_to_someone',
        label: 'Say it out loud to somebody who would understand',
        text: 'Twenty minutes with a colleague who has one of her own. Neither of you offers the other any reassurance, because that is not what it is for, and both of you sleep better that week.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -12 },
          { kind: 'teamMorale', delta: 5 },
        ],
      },
      {
        id: 'use_it',
        label: 'Turn it into training',
        text: 'You build a session around it, anonymised, for people three years in. It is the best training the department runs and giving it costs you something every single time.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'nothing',
        label: 'Put it back where you keep it',
        text: 'You have a place for it and it goes back there, and this has worked for eleven years in the sense that you are still working.',
        effects: [{ kind: 'stat', stat: 'stress', delta: 5 }],
      },
    ],
  }),

  defineEvent('evt.social.data_request', {
    kind: 'random',
    title: 'She wants to read her own file',
    body: 'A woman of thirty-one has asked for the records the department holds about her childhood. She is entitled to almost all of it. Some of it is other people’s accounts of her mother, written in the language of the time.',
    weight: 11,
    conditions: social,
    choices: [
      {
        id: 'sit_with_her',
        label: 'Give her all of it, and offer to go through it with her',
        text: 'Four hundred pages and an afternoon. She reads sentences about herself written by people who never asked her anything, and at the end says that having it is better than not, and means it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'post_it',
        label: 'Redact what you must and post it',
        text: 'Compliant, timely, and it arrives on a Tuesday in a jiffy bag with no warning about what is on page one hundred and nine.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
        ],
      },
      {
        id: 'over_redact',
        label: 'Redact generously, to spare her',
        text: 'You take out more than the law requires because some of it is cruel. It is kindly meant and it is you deciding what she is allowed to know about her own life.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: -2 },
          { kind: 'queueEvent', eventId: 'evt.followup.ombudsman', delayTurns: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.cut_the_service', {
    kind: 'random',
    title: 'Which of the three',
    body: 'The saving has to come from somewhere and there are three candidates: the day centre, the respite nights, or the early-help team. Each of them is somebody’s only thing.',
    weight: 12,
    conditions: { ...social, minLevel: 3 },
    choices: [
      {
        id: 'early_help',
        label: 'The early-help team — the harm is furthest away',
        text: 'It is the right answer for three years and the wrong one for the following ten, and everybody in the room knows both halves and takes it anyway because the saving is this year.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'respite',
        label: 'The respite nights — the fewest people',
        text: 'Forty families, each of whom was getting two nights a month, which was the two nights that made the other twenty-eight possible. Eleven of them are in crisis within the year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'refuse_to_choose',
        label: 'Send it back with the consequences of each attached',
        outcomes: [
          {
            weight: 3,
            text: 'You put all three options up with the ten-year cost of each written beside the one-year saving. The saving is found elsewhere. It takes four months and two extremely bad meetings.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
          },
          {
            weight: 2,
            text: 'You send it back, and it comes down again with the choice made for you and your analysis attached to it as an annex. The early-help team goes.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.social.court', {
    kind: 'random',
    title: 'Giving evidence',
    body: 'Four hours in a witness box being taken through your own case notes by a barrister whose job is to find the sentence you wrote at eleven at night after a fourteen-hour day.',
    weight: 12,
    conditions: social,
    choices: [
      {
        id: 'concede',
        label: 'Concede the sentence and explain the decision anyway',
        text: 'You say the note was poor and that the decision was right, and set out why, and the distinction survives twenty minutes of pressure because it is a real one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 8 },
        ],
      },
      {
        id: 'defend_everything',
        label: 'Defend every word of the file',
        text: 'You defend the sentence written at eleven at night, and spend forty minutes doing it, and by the end the court is thinking about the sentence rather than the child.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 10 },
        ],
      },
      {
        id: 'fix_recording',
        label: 'Go back and change how the whole team records',
        text: 'Afterwards, not during. A new recording standard, written by somebody who has been cross-examined on their own notes, and adopted across the service within the year.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'teamMorale', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.social.colleague_struggling', {
    kind: 'random',
    title: 'He is not all right',
    body: 'One of your team has been sharp with a family, twice, and has filed nothing for three weeks. He is one of the best people you have and something has plainly happened.',
    weight: 12,
    conditions: { ...social, requiresTeam: true },
    choices: [
      {
        id: 'take_the_cases',
        label: 'Take his caseload off him for a month',
        text: 'You redistribute nineteen cases, mostly to yourself, and tell him to go to the doctor. It is a bad month for everyone and he is still in the profession in ten years.',
        effects: [
          { kind: 'teamMorale', delta: 10 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 10 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
        ],
      },
      {
        id: 'performance_manage',
        label: 'Start the performance process',
        text: 'It is the correct procedure for the facts as recorded. He is signed off within a fortnight and resigns from the process, and from the profession, in the spring.',
        effects: [
          { kind: 'teamMorale', delta: -14 },
          { kind: 'loseStaff' },
          { kind: 'stat', stat: 'integrity', delta: -5 },
        ],
      },
      {
        id: 'ask_him',
        label: 'Ask him what has happened',
        outcomes: [
          {
            weight: 3,
            text: 'It is a case from last year and it is also his father. He has told nobody. Between the two of you there is a plan by the end of the afternoon.',
            effects: [
              { kind: 'teamMorale', delta: 8 },
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
          {
            weight: 2,
            text: 'He says he is fine in a tone that means the opposite, and you have asked, which is not nothing and is also not enough.',
            effects: [
              { kind: 'teamMorale', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.social.numbers_look_better', {
    kind: 'random',
    title: 'The waiting list has halved',
    body: 'The figure going to the committee is genuinely half what it was. It is half because the definition of what counts as waiting changed in April, and the paper does not mention April.',
    weight: 12,
    conditions: { ...social, minLevel: 3 },
    choices: [
      {
        id: 'add_the_note',
        label: 'Add the paragraph about April',
        text: 'One paragraph and the achievement evaporates. The committee asks a much better question than the one it was going to ask, and the answer to that one changes something.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'both_figures',
        label: 'Show both definitions side by side',
        text: 'Two lines on one chart, old basis and new. It is the honest presentation and it takes an extra afternoon and nobody who reads it can be misled.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'let_it_stand',
        label: 'It is the figure the system produces',
        text: 'It is. The committee is pleased, the service is unchanged, and next year somebody will build a plan on a trend that does not exist.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'flag', flag: 'signed_off_inflated_figure' },
        ],
      },
    ],
  }),
];
