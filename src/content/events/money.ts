import { nowak } from '../cast';
import { defineEvent } from '../authoring';

/**
 * What the job pays, and what it costs to have taken it.
 *
 * This corpus has been full of people offering officials money since the first release, and
 * nobody has ever had a reason to take one. `Condition.minSalary` went unused in two hundred and
 * fifty events; the `salary` effect was used once. Money existed as a number on the stats bar and
 * as nothing else, which meant the game could describe temptation and never actually apply any.
 *
 * `maxSavings` is what these events are for. A choice gated on being short is not a worse version
 * of a choice gated on integrity — it is a different question, asked of a different player, and
 * the honest answer to it is not always the same one.
 *
 * The rule these must not break, enforced in `validate.ts`: **money never pays reputation.**
 * Offers key off reputation, so a scene paying it for being poor would convert hardship into
 * promotion velocity, and every career would learn to be poor on purpose.
 */
export const moneyEvents = [
  defineEvent('evt.money.the_month_it_does_not_reach', {
    kind: 'random',
    title: 'The month does not reach the end of itself',
    body: 'You do the arithmetic twice at the kitchen table, which is not a thing you have had to do for a while, and it comes out the same way both times. There is a letter about the boiler and it can wait, and a second one about something that cannot.',
    weight: 14,
    conditions: { maxSavings: 0 },
    choices: [
      {
        id: 'overtime',
        label: 'Take everything going',
        text: 'You put your name down for every hour the department will pay for, for four months. It works. The four months are not ones you get back and something in the second one goes quiet and stays quiet.',
        effects: [
          { kind: 'savings', delta: 4200 },
          { kind: 'stat', stat: 'stress', delta: 12 },
        ],
      },
      {
        id: 'borrow',
        label: 'Borrow it and say nothing',
        text: 'From a brother, at no interest, with the specific awkwardness that arrangement carries into every family occasion for the next two years. It is dealt with and it is not resolved.',
        effects: [
          { kind: 'savings', delta: 3000 },
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'flag', flag: 'owes_family_money' },
        ],
      },
      {
        id: 'ride_it_out',
        label: 'Ride it out',
        text: 'The second letter is answered in the way those letters get answered by people who are answering them for the first time, which is to say badly and late. It is survivable. You are not sure, afterwards, what it cost.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 9 },
          { kind: 'stat', stat: 'performance', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.money.nowak_notices', {
    kind: 'random',
    title: 'Jozef notices, which is his job',
    body: 'He is good company and he has been good company for eleven years, and he is also an account manager for a firm that bids for your work. Tonight he mentions, in passing and with real warmth, that his company runs a consultancy panel and the day rate is what it is.',
    weight: 12,
    conditions: { maxSavings: 2500, requiredFlags: [nowak.metFlag] },
    choices: [
      {
        id: 'decline_flat',
        label: 'Say no before he finishes the sentence',
        text: 'He takes it well, because he expected it, and the evening carries on. What stays with you is that you had to think about it for slightly longer than you would have two years ago.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          nowak.standing(4),
        ],
      },
      {
        id: 'declare_and_refuse',
        label: 'Write it down and then say no',
        text: 'A note to the register the following morning, dated, naming him, describing the conversation. Nobody asks about it for nine years and then somebody does, and it is the most useful piece of paper you have ever filed.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'flag', flag: 'declared_the_offer' },
          nowak.standing(-3),
        ],
      },
      {
        id: 'take_it',
        label: 'Ask him what the day rate is',
        outcomes: [
          {
            weight: 3,
            text: 'Two days a month, on subjects carefully unrelated to anything you decide. It is legal, it is undeclared, and it closes the gap at the kitchen table inside a year.',
            effects: [
              { kind: 'savings', delta: 14000 },
              { kind: 'stat', stat: 'integrity', delta: -12 },
              { kind: 'flag', flag: 'undeclared_interest' },
              nowak.standing(10),
            ],
          },
          {
            weight: 2,
            text: 'Two days a month for eight months, and then a tender lands on your desk with his firm on the list and no way to be in the room and no way to explain leaving it.',
            effects: [
              { kind: 'savings', delta: 9000 },
              { kind: 'stat', stat: 'integrity', delta: -16 },
              { kind: 'flag', flag: 'undeclared_interest' },
              { kind: 'queueEvent', eventId: 'evt.followup.the_panel_you_cannot_sit_on', delayTurns: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.followup.the_panel_you_cannot_sit_on', {
    kind: 'followup',
    title: 'The list has his firm on it',
    body: 'You are chairing. The list is in front of you and the fourth name on it is the company that has been paying you for eight months, and there is no version of the next ten minutes that is clean.',
    weight: 10,
    choices: [
      {
        id: 'recuse',
        label: 'Recuse yourself and give the real reason',
        text: 'You say it out loud, to four colleagues, and hand the chair over. It is the worst professional morning of your life and it is the only reason there is a career left afterwards.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 10 },
          { kind: 'stat', stat: 'reputation', delta: -14 },
          { kind: 'flag', flag: 'undeclared_interest', value: false },
          { kind: 'flag', flag: 'came_clean' },
        ],
      },
      {
        id: 'recuse_vaguely',
        label: 'Recuse yourself and give a reason that is not the reason',
        text: 'A personal connection, unspecified, minuted in six words. It holds. It holds for a long time, and it is sitting there the whole while, in six words, with a date on it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'flag', flag: 'holds_leverage' },
        ],
      },
      {
        id: 'sit_it_out',
        label: 'Chair it and be scrupulously fair',
        text: 'And you are. His firm comes fourth of four on a scoring you would defend to anybody, which is exactly what you would say either way, and that is the whole problem with having sat in the chair at all.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -14 },
          { kind: 'flag', flag: 'sat_on_a_tainted_panel' },
        ],
      },
    ],
  }),

  defineEvent('evt.money.the_job_that_pays_less', {
    kind: 'random',
    title: 'The job you actually want pays less',
    body: 'It is the work, exactly the work, on the thing you have been complaining nobody does properly for six years. It is also two grades of salary below where you are and there is no version of the form where that is not the first thing anybody notices.',
    weight: 11,
    conditions: { minSavings: 30_000, minYearsElapsed: 8 },
    choices: [
      {
        id: 'take_it',
        label: 'You can afford to. Take it.',
        text: 'Which is a sentence available to almost nobody in this building, and you are aware while you say it of exactly how much of it was luck. The work is as good as you thought.',
        effects: [
          { kind: 'salary', delta: -900 },
          { kind: 'stat', stat: 'performance', delta: 9 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'flag', flag: 'took_the_smaller_job' },
        ],
      },
      {
        id: 'stay',
        label: 'Stay where the money is',
        text: 'A defensible decision made for defensible reasons. You keep the file about it in a drawer for eleven years, which tells you something the decision did not.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.money.helping_someone', {
    kind: 'random',
    title: 'Somebody on your floor is in trouble',
    body: 'You find out the way you find these things out, which is sideways and late: an officer three desks down has been doing every hour of overtime going for five months and it is not ambition.',
    weight: 12,
    conditions: { minSavings: 20_000, requiresTeam: true },
    choices: [
      {
        id: 'quiet_loan',
        label: 'Sort it out yourself, quietly',
        text: 'No paperwork, no conditions, and one conversation that is over in four minutes because you both want it to be. They pay it back over two years and neither of you mentions it again.',
        effects: [
          { kind: 'savings', delta: -6000 },
          { kind: 'teamMorale', delta: 9 },
          { kind: 'stat', stat: 'integrity', delta: 6 },
        ],
      },
      {
        id: 'find_the_scheme',
        label: 'Find out what the organisation is actually for',
        text: 'There is a hardship fund. There has always been a hardship fund and nobody on this floor has heard of it, and getting one person through it means the next four people find it in a week.',
        effects: [
          { kind: 'teamMorale', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'not_your_business',
        label: 'It is not yours to know about',
        text: 'Which is true, and is the reason nobody found out for five months. They transfer out in the spring.',
        effects: [
          { kind: 'teamMorale', delta: -4 },
          { kind: 'loseStaff' },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------ what came of it */

  defineEvent('evt.money.paying_it_back', {
    kind: 'random',
    title: 'The last of it goes back to your brother',
    body: 'A transfer, on a Tuesday, for the remainder. He does not acknowledge it, which is his way of saying it was never the point, and the two years it sat between you do not un-happen because the number reached zero.',
    weight: 14,
    once: true,
    conditions: { requiredFlags: ['owes_family_money'], minSavings: 8000 },
    choices: [
      {
        id: 'say_thank_you',
        label: 'Say the thing out loud',
        text: 'Badly, on the phone, in a family that does not do this. It is over in ninety seconds and something that had been slightly wrong at Christmas for two years is not wrong at the next one.',
        effects: [
          { kind: 'savings', delta: -3000 },
          { kind: 'stat', stat: 'stress', delta: -9 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'flag', flag: 'owes_family_money', value: false },
        ],
      },
      {
        id: 'just_the_money',
        label: 'Send the money and leave it there',
        text: 'The debt is discharged. The other thing is not a debt and does not discharge, and it stays roughly where it has been for two years.',
        effects: [
          { kind: 'savings', delta: -3000 },
          { kind: 'stat', stat: 'stress', delta: -4 },
          { kind: 'flag', flag: 'owes_family_money', value: false },
        ],
      },
    ],
  }),

  defineEvent('evt.money.the_note_you_filed', {
    kind: 'random',
    title: 'Somebody has asked about that firm',
    body: 'A review of contacts between the department and its suppliers, going back a decade. Everybody on the floor is going through diaries and trying to remember dinners. You are not, because there is a note, dated, in the register.',
    weight: 15,
    once: true,
    conditions: { requiredFlags: ['declared_the_offer'], minYearsElapsed: 7 },
    choices: [
      {
        id: 'produce_it',
        label: 'Produce the note',
        text: 'One page, nine years old, naming him and describing the conversation and recording that it was declined. It takes about four minutes to deal with what took two colleagues four months.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 10 },
          { kind: 'stat', stat: 'reputation', delta: 8 },
          { kind: 'flag', flag: 'clean_on_the_record' },
        ],
      },
      {
        id: 'and_say_so',
        label: 'Produce it, and say why everyone should have one',
        text: 'You use the four minutes to make an argument about the register that three people have been making for a decade with less standing than you now have. It is adopted, unglamorously, in a procedure note nobody reads.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'flag', flag: 'clean_on_the_record' },
        ],
      },
    ],
  }),

  defineEvent('evt.money.the_one_you_told', {
    kind: 'random',
    title: 'The morning you handed over the chair',
    body: 'It comes back around, as these do, in a room where somebody is deciding whether you are the sort of person who can be relied on. One of them was in the room the morning you recused yourself and gave the actual reason.',
    weight: 14,
    once: true,
    conditions: { requiredFlags: ['came_clean'], minYearsElapsed: 6 },
    choices: [
      {
        id: 'let_them_say_it',
        label: 'Let them tell it',
        text: 'They tell it better than you would have. What they remember is not the eight months; it is the four colleagues and the ten minutes, and the fact that nobody made you.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 12 },
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
        ],
      },
      {
        id: 'add_the_rest',
        label: 'Add the part they do not know',
        text: 'That there were eight months before the ten minutes. Saying it costs you the room and it is the only version you can live with having said.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'stat', stat: 'reputation', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.money.the_scoring_is_reopened', {
    kind: 'random',
    title: 'They are looking at that scoring again',
    body: 'Four years on, a routine review of awards over a threshold. The panel you chaired is in the sample. The scoring was fair. You would defend it to anybody. You have also known for four years exactly what you did not say that morning.',
    weight: 15,
    once: true,
    conditions: { requiredFlags: ['sat_on_a_tainted_panel'], minYearsElapsed: 4 },
    choices: [
      {
        id: 'volunteer_it',
        label: 'Tell them before they find it',
        outcomes: [
          {
            weight: 3,
            text: 'It is a bad fortnight and a formal warning and an entry on a file. It is also, and everybody involved understands this, the reason it ends in a fortnight rather than in an inquiry.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -10 },
              { kind: 'stat', stat: 'integrity', delta: 8 },
              { kind: 'flag', flag: 'sat_on_a_tainted_panel', value: false },
              { kind: 'flag', flag: 'came_clean' },
            ],
          },
          {
            weight: 2,
            text: 'The reviewer is new, thorough, and has no interest at all in the difference between telling them and being caught. It goes up.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -18 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'sit_tight',
        label: 'The scoring was fair. Sit tight.',
        outcomes: [
          {
            weight: 3,
            text: 'It was, and the sample moves on, and nothing happens. Nothing continues to happen for the rest of your career and you think about it more often than nothing warrants.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 8 }],
          },
          {
            weight: 2,
            text: 'The reviewer pulls the declarations register alongside the scoring, which is a thing reviewers started doing about two years ago, and the eight months are not in it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -12 },
              { kind: 'stat', stat: 'reputation', delta: -16 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.money.worth_it', {
    kind: 'random',
    title: 'You have been doing the smaller job for a decade',
    body: 'A former colleague, now two grades above where you would have been, asks the question over lunch and asks it kindly, which is worse. Whether you regret it.',
    weight: 13,
    once: true,
    conditions: { requiredFlags: ['took_the_smaller_job'], minYearsElapsed: 10 },
    choices: [
      {
        id: 'no',
        label: 'No',
        text: 'One word, and then the rest of the lunch is about something else, because there was not any more to say and both of you can hear that there was not.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'stress', delta: -8 },
        ],
      },
      {
        id: 'sometimes',
        label: 'Sometimes, in November',
        text: 'Which is the honest answer and is much longer, and it turns out that they wanted the honest one, because they have a version of the same November.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.money.never_a_question', {
    kind: 'random',
    title: 'Thirty years and never a question about you',
    body: 'A trainee asks how you do it — meaning the register, the notes, the declarations nobody else files — with the specific scepticism of somebody who has decided it is theatre. It is a fair question and it deserves the real answer.',
    weight: 12,
    once: true,
    conditions: { requiredFlags: ['clean_on_the_record'], minYearsElapsed: 15 },
    choices: [
      {
        id: 'tell_them_the_boring_truth',
        label: 'Tell them it is mostly boring',
        text: 'Because it is. It is four minutes a year and it has, twice, been the only reason a career survived a fortnight. You show them the nine-year-old note. They start filing.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'teamMorale', delta: 4 },
        ],
      },
      {
        id: 'tell_them_the_other_truth',
        label: 'Tell them about the people who did not',
        text: 'Names you do not use and cases they will have heard of. It lands harder than the boring version and is a slightly worse thing to have done, because it teaches fear rather than the habit.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'teamMorale', delta: -2 },
        ],
      },
    ],
  }),
];
