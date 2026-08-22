import { vasquez } from '../cast';
import { defineEvent } from '../authoring';

/**
 * Elena Vásquez, now that her career is running.
 *
 * She has been in the corpus since the cast was written, in three scenes that asserted she was
 * keeping pace with you and had nothing behind the assertion. Her career is simulated now, so
 * these gate on `minRivalGap` / `maxRivalGap` — her tier minus yours — and the whole pool is
 * built on the observation that the gap, not her rank, is what any of this is about.
 *
 * Three registers, and they are deliberately different pieces of writing:
 *
 * - **She is ahead.** Not envy scenes. The interesting thing about being managed by somebody who
 *   started the week you did is how ordinary it is, and how completely it reorganises what you
 *   can say to them.
 * - **You are ahead.** Harder to write honestly, because the temptation is to make her gracious
 *   or bitter and she is neither. Mostly she is still doing the job.
 * - **Level.** The longest stretch of any career, and the one the original three scenes were
 *   already about.
 *
 * Her standing (`rel.vasquez`) is separate from the gap and always has been. How well she is
 * doing and what she thinks of you are different questions, and a pool that let one stand in for
 * the other would lose the only thing a recurring character is for.
 */
export const rivalEvents = [
  /* ------------------------------------------------------------ she is ahead */

  defineEvent('evt.rival.she_is_above_you', {
    kind: 'random',
    title: 'Her name is on the appointment notice',
    body: 'You read it twice, which is one more time than it needed. Elena Vásquez, effective the first of next month, in the post above yours. You joined the same week. There is a leaving-and-arriving thing on Thursday and you are expected at it.',
    weight: 14,
    once: true,
    conditions: { minRivalGap: 1, ...vasquez.known },
    choices: [
      {
        id: 'go_and_mean_it',
        label: 'Go, and be glad for her',
        text: 'You are, mostly, and the part of you that is not is not anybody else’s business. She spots you across the room and comes over rather than waiting to be come to, which tells you something about how the next two years are going to go.',
        effects: [vasquez.standing(8), { kind: 'stat', stat: 'politicalCapital', delta: 3 }],
      },
      {
        id: 'go_and_work_it',
        label: 'Go, and use the room',
        text: 'Four useful conversations and one genuinely valuable one, with somebody who did not know your name at the start of the evening. Elena watches you do it from across the room with an expression you decide not to interpret.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 7 },
          vasquez.standing(-4),
        ],
      },
      {
        id: 'send_apologies',
        label: 'Send apologies and clear your desk instead',
        text: 'The files get done. Nobody remarks on your absence, which is worse than if somebody had, and the next time you need something from that floor you go through three people who were at the party.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          vasquez.standing(-3),
        ],
      },
    ],
  }),

  defineEvent('evt.rival.asks_you_to_stay_late', {
    kind: 'random',
    title: 'She asks you the way she used to',
    body: 'Half six, everyone gone, and Elena is in your doorway with a file and the specific tone she has used since the second year — the one that is asking rather than instructing. She is entitled to instruct now. She has not.',
    weight: 12,
    conditions: { minRivalGap: 1, ...vasquez.known },
    choices: [
      {
        id: 'stay',
        label: 'Stay, and do it properly',
        text: 'Two hours you do not have on a problem that turns out to be worse than she thought. She writes it up herself and the note names you in the second paragraph, which she did not have to do.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          vasquez.standing(9),
        ],
      },
      {
        id: 'tomorrow',
        label: 'Tell her it will have to be tomorrow',
        text: 'She says of course, and means it, and by tomorrow it has been dealt with by somebody else. Nothing is said. The tone in the doorway is fractionally different the next time.',
        effects: [vasquez.standing(-4)],
      },
      {
        id: 'make_her_ask',
        label: 'Make her actually ask',
        text: 'You wait. She hears herself doing it and something closes behind her eyes, and then she asks, formally, in the register of somebody who has just been reminded which of you reports to the other. You get the evening back and you have spent something to have it.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          vasquez.standing(-12),
        ],
      },
    ],
  }),

  defineEvent('evt.rival.appraises_you', {
    kind: 'random',
    title: 'Your appraisal, signed by somebody who was there',
    body: 'The form is the same form. The difference is that the person filling it in remembers the year you both had, the thing you got wrong in the fourth month, and exactly how hard the file in your second year actually was.',
    weight: 11,
    conditions: { minRivalGap: 1, minYearsElapsed: 6 },
    choices: [
      {
        id: 'honest',
        label: 'Give her the honest version to write from',
        text: 'Including the parts that do not flatter you. She writes it up straight, which means the good paragraphs are believed by everybody who reads them, because the bad one is there too.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          vasquez.standing(7),
        ],
      },
      {
        id: 'manage_it',
        label: 'Manage the account of the year',
        outcomes: [
          {
            weight: 3,
            text: 'A tidier year than the one you had. She signs it, because it is not untrue, and the rating is a band higher than the year deserved.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 7 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
            ],
          },
          {
            weight: 2,
            text: 'She reads it, puts it down, and says a single sentence about the file in the fourth month. Then she writes the year as it happened. Neither of you refers to it again and both of you remember it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -3 },
              vasquez.standing(-10),
            ],
          },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------ you are ahead */

  defineEvent('evt.rival.you_are_above_her', {
    kind: 'random',
    title: 'She is on your establishment now',
    body: 'The reorganisation puts her unit under yours. Nobody consulted either of you and nobody thought it was worth mentioning, because on paper it is two boxes moving on a chart.',
    weight: 14,
    once: true,
    conditions: { maxRivalGap: -1, ...vasquez.known },
    choices: [
      {
        id: 'say_it_out_loud',
        label: 'Say the awkward thing first',
        text: 'You get to it before she has to, in your office with the door shut, in about ninety seconds. She is visibly relieved not to have had to open it herself and the two of you work well for four years.',
        effects: [
          vasquez.standing(12),
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'teamMorale', delta: 4 },
        ],
      },
      {
        id: 'strictly_professional',
        label: 'Treat her exactly like everybody else',
        text: 'Which is correct, and is not the same as right. She is treated like everybody else for four years and something that had lasted twenty is quietly not there at the end of them.',
        effects: [vasquez.standing(-6), { kind: 'stat', stat: 'performance', delta: 3 }],
      },
      {
        id: 'give_her_room',
        label: 'Give her the work she is best at and stay out of it',
        text: 'You hand her the thing you know she is better at than you and then genuinely leave it alone, which is harder than it sounds and is noticed by everybody on the floor.',
        effects: [
          vasquez.standing(9),
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'teamMorale', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.rival.she_asks_for_a_word', {
    kind: 'random',
    title: 'She asks whether she should stop trying',
    body: 'It is not put like that. It is put as a question about whether the specialist route is worth applying for at her age, asked in a corridor, in the tone people use for questions they have thought about for months.',
    weight: 10,
    conditions: { maxRivalGap: -1, minYearsElapsed: 12 },
    choices: [
      {
        id: 'tell_her_truth',
        label: 'Tell her what you actually think',
        text: 'Which takes twenty minutes and is not comfortable for either of you. She applies. Whether it works is not the point and you both know it; being told the truth by somebody who was there at the start is.',
        effects: [
          vasquez.standing(14),
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'encourage',
        label: 'Tell her to go for it',
        text: 'The kind thing, said quickly, in a corridor. She thanks you and does not apply, and you understand about a year later that she had been asking you to take the question seriously rather than to be nice about it.',
        effects: [vasquez.standing(-3)],
      },
      {
        id: 'open_a_door',
        label: 'Make a call on her behalf',
        conditions: { minStat: { politicalCapital: 25 } },
        text: 'You spend something real on somebody else’s career, which is the rarest transaction in this building. She finds out eventually, because these things are always found out eventually.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -18 },
          vasquez.standing(20),
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
    ],
  }),

  /* ---------------------------------------------------------------- level */

  defineEvent('evt.rival.same_rung_still', {
    kind: 'random',
    title: 'Twelve years, same grade, same canteen',
    body: 'You end up at the same table by accident and neither of you moves. Between you there are twenty-four years of service, two identical grades, and a running joke about the coffee that is older than most of the people in the room.',
    weight: 12,
    conditions: { minRivalGap: 0, maxRivalGap: 0, minYearsElapsed: 10, ...vasquez.known },
    choices: [
      {
        id: 'the_good_version',
        label: 'Have the conversation you always have',
        text: 'Nothing is decided and nothing needed to be. You go back up with the specific lightness of having spent forty minutes with somebody who requires no explaining to.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -8 },
          vasquez.standing(6),
        ],
      },
      {
        id: 'compare',
        label: 'Find out what she is being paid',
        outcomes: [
          {
            weight: 3,
            text: 'The same, to within forty euros. It is somehow both a relief and a disappointment, and you spend the afternoon working out which one is worse.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
          },
          {
            weight: 2,
            text: 'More than you. Not much more. She did not know that until you asked and now neither of you can un-know it, and the coffee joke does not come up again for a while.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 6 },
              vasquez.standing(-8),
            ],
          },
        ],
      },
      {
        id: 'talk_about_leaving',
        label: 'Admit you have been looking',
        text: 'She has too. Neither of you goes anywhere, that year or any other, but saying it out loud to the one person who would understand it changes something about being here.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -5 },
          vasquez.standing(10),
          { kind: 'flag', flag: 'admitted_to_looking' },
        ],
      },
    ],
  }),

  defineEvent('evt.rival.the_post_you_both_want', {
    kind: 'random',
    title: 'You are both on the list',
    body: 'One post, two names on the shortlist, and everybody on the panel knows exactly how long the two of you have known each other. Somebody in HR describes it as awkward, which is not the word.',
    weight: 11,
    once: true,
    conditions: { minRivalGap: 0, maxRivalGap: 0, minYearsElapsed: 8 },
    choices: [
      {
        id: 'run_clean',
        label: 'Run it straight and tell her so',
        text: 'You say it in advance and you hold to it, which costs you at least one advantage you could have taken. Whoever gets it, the friendship survives, and you find out later that she made the same decision on the same day without telling you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          vasquez.standing(15),
        ],
      },
      {
        id: 'work_the_panel',
        label: 'Work the panel',
        outcomes: [
          {
            weight: 3,
            text: 'Two conversations before the interview, neither of them improper and both of them decisive. You are appointable and you made sure the room already knew it.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 8 },
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
              vasquez.standing(-10),
            ],
          },
          {
            weight: 2,
            text: 'One of the two conversations gets back to her, in the way these things do, with the edges filed off in the wrong direction. She does not raise it. She does not have to.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              vasquez.standing(-20),
              { kind: 'flag', flag: 'worked_a_panel' },
            ],
          },
        ],
      },
      {
        id: 'withdraw',
        label: 'Withdraw',
        text: 'You take your name off it. There are three reasons and only one of them is about her, and you are honest enough with yourself to know it is the smallest of the three.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: -6 },
          vasquez.standing(18),
        ],
      },
    ],
  }),

  /* ---------------------------------------------------- what became of her */

  defineEvent('evt.rival.she_left', {
    kind: 'random',
    title: 'She handed in her notice on a Tuesday',
    body: 'No leaving do, at her request. There is a card going round the floor and about half the people signing it have never worked with her and are signing because a card came round.',
    weight: 16,
    once: true,
    conditions: { requiredFlags: [vasquez.metFlag] },
    choices: [
      {
        id: 'ask_why',
        label: 'Ask her, properly, why',
        text: 'The answer takes an hour and is not what the floor thinks it is. It is not one thing. It is eleven years of small things and one recent one, and she has clearly been rehearsing how to say it to somebody who would understand.',
        effects: [
          vasquez.standing(12),
          { kind: 'stat', stat: 'stress', delta: 4 },
          { kind: 'flag', flag: 'knows_why_she_left' },
        ],
      },
      {
        id: 'sign_the_card',
        label: 'Sign the card',
        text: 'You write three lines that are more than anybody else wrote and less than you meant. She keeps the card. You find that out fourteen years later, which is a long time to wait to find out you got something slightly right.',
        effects: [vasquez.standing(4)],
      },
      {
        id: 'ask_her_to_stay',
        label: 'Try to talk her out of it',
        outcomes: [
          {
            weight: 2,
            text: 'You make the case badly and she is kind about it. She goes anyway. What she takes with her is that somebody tried, which is not nothing.',
            effects: [vasquez.standing(8), { kind: 'stat', stat: 'stress', delta: 3 }],
          },
          {
            weight: 3,
            text: 'She listens to all of it and then asks whether you are arguing for her or against the idea that somebody could leave. You do not have an answer ready and the silence goes on slightly too long.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 7 },
              vasquez.standing(2),
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.rival.the_road_not_taken', {
    kind: 'random',
    title: 'The post you turned down has her name on it',
    body: 'You find out from an organisation chart, which is the least ceremonious way there is. The post you were offered and did not take was filled within the quarter, and it was filled by her.',
    weight: 13,
    conditions: { minRivalGap: 1, minYearsElapsed: 6 },
    choices: [
      {
        id: 'no_regrets',
        label: 'You had your reasons and they were good ones',
        text: 'They were. You go through them again anyway, on the way home, in order, the way you do with a decision that was right and is still sitting there.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'congratulate',
        label: 'Write to her about it',
        text: 'Four sentences, sent the same afternoon, before you have talked yourself out of it. She replies in six and one of them is about the job you turned it down for, which she had clearly gone and looked up.',
        effects: [vasquez.standing(11), { kind: 'stat', stat: 'politicalCapital', delta: 2 }],
      },
      {
        id: 'ask_what_it_is_like',
        label: 'Ask her what the job is actually like',
        text: 'She tells you, at length and without flattering it, and about a third of what she describes is the part you correctly guessed you would have hated.',
        effects: [
          vasquez.standing(7),
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
    ],
  }),

  /* ------------------------------------------------------ what came of it
   *
   * The corpus rule, and the reason `validate.ts` fails a build without these: a flag nothing
   * reads is a promise nobody can collect. Each of these is gated on something the pool above
   * can set, and most of them wait years.
   */

  defineEvent('evt.rival.neither_of_you_went', {
    kind: 'random',
    title: 'Neither of you ever went',
    body: 'It comes up again, years after the conversation where you both admitted you had been looking. Neither of you left. Between you there is most of a working life spent in a building you both talked about leaving.',
    weight: 14,
    once: true,
    conditions: { requiredFlags: ['admitted_to_looking'], minYearsElapsed: 20 },
    choices: [
      {
        id: 'no_regret',
        label: 'Say you are glad you stayed',
        text: 'And find, saying it, that it is true, and that it has been true for about eleven years without your having stopped to notice.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          vasquez.standing(8),
        ],
      },
      {
        id: 'the_other_life',
        label: 'Wonder about the other one out loud',
        text: 'She does the same, and the two of you build the alternative career in some detail over a long lunch, and it is agreed at the end that it would probably have been worse. Neither of you fully believes it.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 4 },
          vasquez.standing(10),
        ],
      },
    ],
  }),

  defineEvent('evt.rival.what_she_told_you', {
    kind: 'random',
    title: 'You are the only person who knows why she went',
    body: 'Somebody in the canteen is repeating the version the floor settled on years ago, which is wrong in the specific way that comfortable explanations are wrong, and you are the only person in the building who was told the real one.',
    weight: 13,
    once: true,
    conditions: { requiredFlags: ['knows_why_she_left'], minYearsElapsed: 4 },
    choices: [
      {
        id: 'keep_it',
        label: 'Let the floor keep its version',
        text: 'She told you and not them, which was a decision she made, and it is not yours to revisit because a story is going round a canteen.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          vasquez.standing(6),
        ],
      },
      {
        id: 'correct_it',
        label: 'Correct it',
        text: 'You say enough to stop the wrong version and not enough to replace it, which satisfies nobody at the table and is the best available handling of a thing that should not have been at the table at all.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'use_it',
        label: 'Fix what made her go',
        conditions: { requiresTeam: true },
        text: 'Not for her. She is gone and this does not reach her. But you know precisely what the eleven small things were, because she listed them, and four of them are inside your establishment and can be stopped this year.',
        effects: [
          { kind: 'teamMorale', delta: 10 },
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'performance', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.rival.the_panel_remembers', {
    kind: 'random',
    title: 'Somebody who was on that panel is on this one',
    body: 'Years later, a different competition, and one of the names on the panel was on the one where you had two conversations before the interview. They have never mentioned it. They have also never forgotten it.',
    weight: 12,
    once: true,
    conditions: { requiredFlags: ['worked_a_panel'], minYearsElapsed: 9 },
    choices: [
      {
        id: 'own_it',
        label: 'Raise it yourself, first',
        text: 'Before anybody else can, in the corridor, in about forty seconds. It is received with visible surprise and it costs you the appointment and buys you something that outlasts it.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -6 },
          { kind: 'stat', stat: 'integrity', delta: 10 },
          { kind: 'flag', flag: 'worked_a_panel', value: false },
        ],
      },
      {
        id: 'do_it_again',
        label: 'Do what worked last time',
        outcomes: [
          {
            weight: 2,
            text: 'It works again. It works every time until the time it does not, and each time it works you get slightly worse at telling the difference.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 6 },
              { kind: 'stat', stat: 'integrity', delta: -8 },
            ],
          },
          {
            weight: 3,
            text: 'They were waiting for it. The panel note that goes to HR is two lines long and one of them is a date, and the competition is rerun with a different chair.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -12 },
              { kind: 'stat', stat: 'integrity', delta: -6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'let_it_lie',
        label: 'Say nothing and run it straight',
        text: 'Scrupulously, visibly straight, for the whole process. They notice that too, and it is worth about half of what raising it would have been.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: 4 }],
      },
    ],
  }),
];
