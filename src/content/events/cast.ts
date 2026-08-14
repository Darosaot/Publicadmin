import { defineEvent } from '../authoring';
import { berg, halloran, kess, lindqvist, nowak, oyelaran, reyes, vasquez } from '../cast';

/**
 * The recurring cast.
 *
 * Eight people, each with three or four appearances spread across a career: an introduction early,
 * a reappearance in the middle where the relationship is worth something, and a late one where it
 * decides an outcome. What they do when they turn up is gated on `rel.<id>` — the number your
 * earlier choices moved — so the same scene lands differently depending on what you did to them
 * fifteen years ago.
 *
 * The introductions are gated `unknown` and the reappearances `known`, which is what stops a
 * career meeting somebody for the first time in its final year.
 */
export const castEvents = [
  /* ----------------------------------------------------------- Vásquez */

  defineEvent('evt.cast.vasquez_meet', {
    kind: 'random',
    title: 'The desk opposite',
    body: 'Elena Vásquez started the same week you did, at the desk facing yours, and has spent four days asking the questions you were too proud to ask. She has just found the answer to one of them and is deciding whether to tell you or the supervisor first.',
    weight: 14,
    conditions: { ...vasquez.unknown, maxLevel: 2 },
    choices: [
      {
        id: 'work_together',
        label: 'Suggest you work it out together',
        text: 'Two hours and a whiteboard and it is solved better than either of you would have managed. It becomes the arrangement for the next three years, and neither of you ever says so out loud.',
        effects: [
          ...vasquez.meet(18),
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'get_there_first',
        label: 'Get to the supervisor first',
        text: 'You take it in yourself, with a sentence about having discussed it with a colleague. It is not untrue. She works out what happened within the week and says nothing about it, then or ever.',
        effects: [
          ...vasquez.meet(-16),
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'let_her',
        label: 'Tell her to take it in herself',
        text: 'She does, nervously, and it goes well. She mentions your name in the meeting without being asked to, which you only learn about a fortnight later from somebody else.',
        effects: [
          ...vasquez.meet(12),
          { kind: 'stat', stat: 'integrity', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.vasquez_parallel', {
    kind: 'random',
    title: 'She has been promoted',
    body: 'Elena Vásquez has moved up, into something adjacent to what you do and slightly larger than what you have. The announcement is warm about her in a way announcements usually are not.',
    weight: 12,
    conditions: { ...vasquez.known, minYearsElapsed: 6 },
    choices: [
      {
        id: 'congratulate',
        label: 'Ring her and mean it',
        outcomes: [
          {
            weight: 3,
            text: 'Forty minutes on the phone, most of it about work and some of it not. You come away with a better picture of the whole administration than you had, and so does she.',
            effects: [
              vasquez.standing(10),
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'She is pleased and slightly wary, because the last time you had something she wanted it did not go well. The call is warm, short, and carefully about nothing.',
            effects: [vasquez.standing(4), { kind: 'stat', stat: 'politicalCapital', delta: 1 }],
            conditions: vasquez.cold(-10),
          },
        ],
      },
      {
        id: 'compete',
        label: 'Work out what she did that you did not',
        text: 'You reconstruct her last four years from the announcements and find that she took the harder post twice when you took the safer one. It is a useful and thoroughly unpleasant afternoon.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
          vasquez.standing(-4),
        ],
      },
      {
        id: 'nothing',
        label: 'Nothing. It is not about you.',
        text: 'You do not ring. There is no reason you should and there is no reason you did not, and the fact that you notice yourself not doing it is the interesting part.',
        effects: [vasquez.standing(-6)],
      },
    ],
  }),

  defineEvent('evt.cast.vasquez_panel', {
    kind: 'random',
    title: 'She is on the panel',
    body: 'The appointment you want is being decided by three people, and one of them sat opposite you in Alderford. Everything you have ever done to Elena Vásquez is in the room, and none of it is on the agenda.',
    weight: 13,
    conditions: { ...vasquez.known, minLevel: 4, minYearsElapsed: 12 },
    choices: [
      {
        id: 'straight',
        label: 'Interview as though she were a stranger',
        outcomes: [
          {
            weight: 4,
            text: 'You answer the questions as asked. She is scrupulously neutral throughout, and afterwards you learn she argued for you harder than either of the others — on the strength of the work, which is the only thing she was ever going to argue on.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 8 },
              { kind: 'stat', stat: 'politicalCapital', delta: 5 },
            ],
            conditions: vasquez.warm(15),
          },
          {
            weight: 4,
            text: 'You answer the questions as asked, and she asks the two that are hardest to answer, and neither of them is unfair. You do not get it. Reading the feedback later, you cannot find the sentence you would change.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'acknowledge',
        label: 'Say to her beforehand that you know how this looks',
        text: 'Ninety seconds in a corridor: you say that you would understand if she recused herself, and that you would rather she did not. She does not. Whatever happens next, it happens cleanly.',
        effects: [
          vasquez.standing(8),
          { kind: 'stat', stat: 'integrity', delta: 5 },
        ],
      },
      {
        id: 'lean',
        label: 'Remind her, gently, of the early years',
        conditions: vasquez.warm(20),
        text: 'You do not ask for anything. You mention Alderford, and the supervisor you both had, and the thing with the photocopier. It works, and it costs the friendship a piece you cannot put back.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          vasquez.standing(-14),
        ],
      },
    ],
  }),

  /* ---------------------------------------------------------- Halloran */

  defineEvent('evt.cast.halloran_meet', {
    kind: 'random',
    title: 'Your director reads your first real file',
    body: 'Rufus Halloran has your submission in front of him and a pencil in his hand, and has been going through it for eleven minutes without saying anything. There are a great many pencil marks.',
    weight: 14,
    conditions: { ...halloran.unknown, maxLevel: 2 },
    choices: [
      {
        id: 'ask',
        label: 'Ask him to take you through every mark',
        text: 'It takes an hour and it is the most useful hour of your first two years. Four of the marks are him being wrong, and he says so about three of them.',
        effects: [
          ...halloran.meet(16),
          { kind: 'stat', stat: 'performance', delta: 4 },
        ],
      },
      {
        id: 'defend',
        label: 'Defend the parts you got right',
        outcomes: [
          {
            weight: 3,
            text: 'You argue three of them and win two, which he enjoys considerably more than agreement. "Good," he says, which is the whole review.',
            effects: [...halloran.meet(12), { kind: 'stat', stat: 'reputation', delta: 3 }],
          },
          {
            weight: 2,
            text: 'You argue five and are wrong about four, having not read the guidance he was reading them against. He is patient about it in a way that is worse than impatience.',
            effects: [...halloran.meet(-8), { kind: 'stat', stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'take_it',
        label: 'Take it away and do it again',
        text: 'You rewrite the whole thing overnight against every mark. The second version comes back with two marks and a sentence at the bottom that you will still remember in twenty years.',
        effects: [
          ...halloran.meet(10),
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.halloran_retires', {
    kind: 'random',
    title: 'Halloran is retiring',
    body: 'There is a room booked and a card going round. He has been in the service for thirty-six years and is leaving on a Friday with a speech from somebody who has known him for eight months.',
    weight: 12,
    conditions: { ...halloran.known, minYearsElapsed: 8 },
    choices: [
      {
        id: 'speak',
        label: 'Say the thing about the pencil marks',
        outcomes: [
          {
            weight: 4,
            text: 'You tell the room about the eleven minutes and the sentence at the bottom, and half of them have their own version of the same story. He does not say anything afterwards, which from him is a great deal.',
            effects: [
              halloran.standing(12),
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: -6 },
            ],
            conditions: halloran.warm(5),
          },
          {
            weight: 3,
            text: 'You say it, accurately, and it lands as a generous thing said about a man you did not especially get on with. Both of you know which it is, and the room does not.',
            effects: [halloran.standing(6), { kind: 'stat', stat: 'integrity', delta: 2 }],
          },
        ],
      },
      {
        id: 'ask_him',
        label: 'Ask him what he would have done differently',
        text: 'He thinks about it for a long time and gives you three things, the third of which is about a decision he took the year you arrived and has evidently been carrying since. You had no idea.',
        effects: [
          halloran.standing(10),
          { kind: 'stat', stat: 'integrity', delta: 5 },
        ],
      },
      {
        id: 'sign_the_card',
        label: 'Sign the card and get back to the file',
        text: 'You write something warm and general and go back to the thing that is due Tuesday. He would have done exactly the same, which is either an excuse or the whole point.',
        effects: [halloran.standing(-3)],
      },
    ],
  }),

  defineEvent('evt.cast.halloran_board', {
    kind: 'random',
    title: 'He is on the other side of the table now',
    body: 'Halloran has turned up on the board of the body you are about to award a contract to, or take a decision about, or be inspected by. He is exactly as he always was, which is the problem.',
    weight: 11,
    conditions: { ...halloran.known, minLevel: 4, minYearsElapsed: 14 },
    choices: [
      {
        id: 'declare',
        label: 'Declare the relationship and step back',
        text: 'A paragraph on the file naming him, what he was to you, and why you are not taking the decision. Somebody else takes it, differently, and you never find out whether they were right.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          halloran.standing(4),
        ],
      },
      {
        id: 'proceed',
        label: 'Take the decision on the merits',
        outcomes: [
          {
            weight: 3,
            text: 'You take it as you would have taken it anyway, which happens to go against him. He rings afterwards to say it was the right call, and means it, and you spend the evening deciding whether that makes it better.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: -2 },
            ],
          },
          {
            weight: 2,
            text: 'You take it on the merits and it goes his way, and it is genuinely the right decision, and it is on a file that names a man who taught you how to write files. Nobody will ever be able to tell the difference and neither, entirely, can you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 6 },
              { kind: 'flag', flag: 'undeclared_interest' },
            ],
          },
        ],
      },
    ],
  }),

  /* ---------------------------------------------------------- Oyelaran */

  defineEvent('evt.cast.oyelaran_meet', {
    kind: 'random',
    title: 'The representative would like a word',
    body: 'Marta Oyelaran has been the union representative here for eleven years and has asked to see you about a rota change nobody thought was controversial. She is entirely calm and has brought a folder.',
    weight: 13,
    conditions: { ...oyelaran.unknown, minLevel: 2 },
    choices: [
      {
        id: 'listen',
        label: 'Read the folder properly',
        text: 'The folder contains four things you did not know, two of which change the decision. She notices that you read all of it, and files that away as carefully as she files everything else.',
        effects: [
          ...oyelaran.meet(16),
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'process',
        label: 'Tell her it has been through the proper process',
        text: 'It has. That is not the same as it being right, and both of you know it, and the meeting ends in nine minutes with everyone having behaved correctly.',
        effects: [...oyelaran.meet(-10)],
      },
      {
        id: 'trade',
        label: 'Offer something in exchange for the rota',
        text: 'You give away a thing you were going to lose anyway and get the rota through. She takes the deal without comment, and you have taught her exactly what kind of person she is dealing with.',
        effects: [
          ...oyelaran.meet(-4),
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.oyelaran_truth', {
    kind: 'random',
    title: 'She tells you what your unit actually thinks',
    body: 'Marta Oyelaran has asked for ten minutes, off the record, about your own department. What she says in those ten minutes is more accurate than anything in your last three staff surveys and considerably less comfortable.',
    weight: 12,
    conditions: { ...oyelaran.warm(10), requiresTeam: true, minYearsElapsed: 5 },
    choices: [
      {
        id: 'act',
        label: 'Act on it, and tell them you heard it from her',
        text: 'Three changes within the month, attributed. The unit learns that telling the representative something is a way of being heard, which is exactly what a representative is for and not what most managers want.',
        effects: [
          oyelaran.standing(12),
          { kind: 'teamMorale', delta: 12 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
        ],
      },
      {
        id: 'act_quietly',
        label: 'Act on it and say nothing about where it came from',
        text: 'The changes happen and appear to have come from you. Morale improves, your standing improves, and the one person who could have been strengthened by it was not.',
        effects: [
          { kind: 'teamMorale', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          oyelaran.standing(-6),
        ],
      },
      {
        id: 'find_out_who',
        label: 'Work out which of them said it',
        text: 'You can narrow it to two people within a day. She sees you doing it, from across an open-plan floor, and stops telling you things.',
        effects: [
          oyelaran.standing(-18),
          { kind: 'teamMorale', delta: -8 },
          { kind: 'stat', stat: 'integrity', delta: -6 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.oyelaran_dispute', {
    kind: 'random',
    title: 'A formal dispute, and she is running it',
    body: 'The restructure has gone to formal dispute. Marta Oyelaran is on the other side of it, professionally and completely, and the two of you have twenty years of dealing straight with each other behind you.',
    weight: 12,
    conditions: { ...oyelaran.known, minLevel: 4, minYearsElapsed: 12 },
    choices: [
      {
        id: 'straight',
        label: 'Deal with her the way you always have',
        outcomes: [
          {
            weight: 4,
            text: 'No games from either side. It is settled in five weeks on terms neither of you would have got by fighting, and the settlement holds because both sides believe the other meant it.',
            effects: [
              { kind: 'stat', stat: 'performance', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              oyelaran.standing(10),
            ],
            conditions: oyelaran.warm(10),
          },
          {
            weight: 3,
            text: 'You deal straight and she does not quite trust it, on the evidence of twenty years, and the process takes four months longer than it needed to. Both of you are being entirely reasonable.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 7 },
              { kind: 'stat', stat: 'performance', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'lawyers',
        label: 'Put it entirely in the hands of HR and the lawyers',
        text: 'Correct, defensible, and it converts a person you have known for two decades into a party. It is resolved in eleven months by people who have met neither of you.',
        effects: [
          oyelaran.standing(-12),
          { kind: 'teamMorale', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
      },
      {
        id: 'concede',
        label: 'Concede the part of it she is right about',
        text: 'You give her the two things you would have lost anyway and say plainly that they were right. The restructure goes through the rest of the way with the unit behind it rather than under it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'teamMorale', delta: 8 },
          oyelaran.standing(8),
        ],
      },
    ],
  }),

  /* -------------------------------------------------------------- Berg */

  defineEvent('evt.cast.berg_meet', {
    kind: 'random',
    title: 'A reporter from the local paper',
    body: 'Tomas Berg covers the council for a paper with a circulation of nine thousand. He is twenty-six, he has read the committee papers properly, and he has asked you a question the press office cannot answer.',
    weight: 13,
    conditions: { ...berg.unknown, maxLevel: 3 },
    choices: [
      {
        id: 'explain',
        label: 'Explain how it actually works',
        text: 'Twenty minutes on background about procedure, none of it quotable and all of it true. The piece he writes is the first accurate thing the paper has published about the council in years.',
        effects: [
          ...berg.meet(16),
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'flag', flag: 'journalist_has_your_number' },
        ],
      },
      {
        id: 'press_office',
        label: 'Refer him to the press office',
        text: 'They give him the line. He prints the line and, beside it, the fact that the officer responsible declined to comment, which is technically what happened.',
        effects: [...berg.meet(-8), { kind: 'stat', stat: 'reputation', delta: -2 }],
      },
      {
        id: 'off_record_dirt',
        label: 'Give him something better, off the record',
        text: 'You point him at a genuinely worse story in a department that is not yours. He runs it, gratefully, and now knows what you are useful for.',
        effects: [
          ...berg.meet(8),
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'flag', flag: 'journalist_has_your_number' },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.berg_story', {
    kind: 'random',
    title: 'He is writing about your department',
    body: 'Berg is at a national now and is writing something long about a decision of yours. He has rung you first, which he did not have to do, and he has three of the four facts right.',
    weight: 12,
    conditions: { ...berg.known, minYearsElapsed: 6 },
    choices: [
      {
        id: 'correct_him',
        label: 'Correct the fourth fact',
        outcomes: [
          {
            weight: 4,
            text: 'The piece runs accurate. It is not flattering — it was never going to be — but every number in it is right, and the two paragraphs of context you gave him are the reason anyone reading it understands why the decision was taken.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              berg.standing(8),
            ],
            conditions: berg.warm(10),
          },
          {
            weight: 3,
            text: 'He takes the correction and runs the piece with it, and also with a line about the department only engaging once it was clear the story was happening.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: -4 },
              berg.standing(3),
            ],
          },
        ],
      },
      {
        id: 'no_comment',
        label: 'Say nothing at all',
        text: 'He runs it with the fourth fact wrong, and the correction two weeks later is four lines on page nineteen. You were right that you did not have to talk to him.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -6 },
          berg.standing(-10),
        ],
      },
      {
        id: 'kill_it',
        label: 'Go over his head to the editor',
        conditions: { minStat: { politicalCapital: 40 } },
        text: 'The piece is spiked. It is spiked by somebody who owes somebody a favour, which is a currency Berg does not have and will remember that you do.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -12 },
          { kind: 'stat', stat: 'integrity', delta: -6 },
          berg.standing(-22),
        ],
      },
    ],
  }),

  defineEvent('evt.cast.berg_profile', {
    kind: 'random',
    title: 'He wants to write about you',
    body: 'Not about a decision — about you. Twenty-odd years, from Alderford to whatever you are now, as the spine of a piece about how the public service actually works. He says it will be fair. He has never once said that before.',
    weight: 11,
    conditions: { ...berg.known, minLevel: 4, minYearsElapsed: 15 },
    choices: [
      {
        id: 'yes',
        label: 'Let him do it properly',
        outcomes: [
          {
            weight: 4,
            text: 'Six meetings, your old files, three people who worked for you and one who did not enjoy it. What comes out is the best thing written about the service in a decade and you come out of it recognisably, warts included.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 10 },
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
            conditions: berg.warm(20),
          },
          {
            weight: 3,
            text: 'He is fair, which is not the same as kind. The piece is accurate about the two decisions you would rather it were not, and accurate about the rest, and you cannot object to any of it.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'someone_else',
        label: 'Point him at someone who deserves it more',
        text: 'You give him three names, all of them people who did the work and none of them you. He writes about the second one and it is a better piece than yours would have been.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          berg.standing(10),
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'no',
        label: 'No',
        text: 'He accepts it in one sentence and does not ask again. Somebody else’s career becomes the spine of the piece, and it is a good piece, and you read it twice.',
        effects: [berg.standing(-5), { kind: 'stat', stat: 'stress', delta: -3 }],
      },
    ],
  }),

  /* ------------------------------------------------------------- Reyes */

  defineEvent('evt.cast.reyes_meet', {
    kind: 'random',
    title: 'A councillor with a constituent',
    body: 'Councillor Inés Reyes has a constituent whose case has been sitting in a queue for five months. She is not asking you to break any rules. She is asking you to look at it, which is not quite the same as nothing.',
    weight: 13,
    conditions: { ...reyes.unknown, maxLevel: 3 },
    choices: [
      {
        id: 'look',
        label: 'Look at it, and explain the queue',
        text: 'You read it, find that the queue is right, and spend twenty minutes explaining to her exactly why — including what would have to change for it not to be. She listens to all of it.',
        effects: [
          ...reyes.meet(14),
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'move_it',
        label: 'Move it up the queue',
        text: 'Eleven minutes. She is genuinely grateful and mentions your name approvingly in a meeting you are not in. Someone else’s file moved down by five weeks and you will never know whose.',
        effects: [
          ...reyes.meet(20),
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'flag', flag: 'owes_favour_councillor' },
        ],
      },
      {
        id: 'refuse',
        label: 'Tell her the queue is the queue',
        text: 'Correct, final, and delivered in a way that makes clear you have not read the case. She does not push. She also does not forget, and she is thirty-four years old.',
        effects: [...reyes.meet(-14)],
      },
    ],
  }),

  defineEvent('evt.cast.reyes_rises', {
    kind: 'random',
    title: 'Reyes has a department now',
    body: 'The councillor who once asked you about a queue is a minister, or near enough, and your work is inside her responsibilities. The first submission you send up has her name on the top of it.',
    weight: 12,
    conditions: { ...reyes.known, minLevel: 3, minYearsElapsed: 8 },
    choices: [
      {
        id: 'same_as_ever',
        label: 'Write it exactly as you would for anyone',
        outcomes: [
          {
            weight: 4,
            text: 'It comes back annotated in a hand you recognise, with one question that shows she read all of it. Whatever else is true, she is going to be a serious minister and you have just found that out first.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 5 },
              reyes.standing(8),
            ],
            conditions: reyes.warm(10),
          },
          {
            weight: 3,
            text: 'It comes back cleared without comment, from a private office that does not know who you are. Whether she saw it at all is not a question you get to ask.',
            effects: [{ kind: 'stat', stat: 'performance', delta: 2 }],
          },
        ],
      },
      {
        id: 'remind',
        label: 'Attach a note recalling the constituent',
        text: 'A line at the bottom: you hope the family in question is well. It is charming, it is transparently a claim on the relationship, and she is now senior enough to recognise both.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          reyes.standing(-6),
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'harder',
        label: 'Make it harder than you would for anyone else',
        text: 'You put every caveat in, twice, so that nobody could ever say you went easy. The advice is worse for it, and the only person it protects is you.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
          reyes.standing(-4),
        ],
      },
    ],
  }),

  defineEvent('evt.cast.reyes_falls', {
    kind: 'random',
    title: 'She is finished',
    body: 'It is not a scandal about money and it is not really about her, but it has her name on it and by the end of the week she will be gone. Three people who spent four years agreeing with her have already explained to journalists that they had doubts.',
    weight: 12,
    conditions: { ...reyes.known, minLevel: 4, minYearsElapsed: 12 },
    choices: [
      {
        id: 'record',
        label: 'Put the accurate account on the file',
        text: 'You write down what actually happened, including the parts that are to her credit and the part that is not, and it goes on the record where the inquiry will find it. It changes nothing about the week and everything about the eventual history.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          reyes.standing(10),
        ],
      },
      {
        id: 'distance',
        label: 'Make sure your advice is on the record as having been ignored',
        outcomes: [
          {
            weight: 3,
            text: 'It was ignored, and the note proving it was written at the time, and producing it now is entirely fair. It is also, unmistakably, a man stepping back from a hole he is standing at the edge of.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              reyes.standing(-12),
            ],
          },
          {
            weight: 2,
            text: 'The note is produced and read, and one line in it is less clear-cut than you remembered. Now you are in the story too, in a small way, as the official who circulated his own file.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
              reyes.standing(-12),
            ],
          },
        ],
      },
      {
        id: 'ring_her',
        label: 'Ring her on the Friday',
        text: 'Nobody else does. There is nothing to say and you say it for half an hour. Four years later she is running something else and there is exactly one official whose call she takes.',
        effects: [
          reyes.standing(22),
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
    ],
  }),

  /* --------------------------------------------------------- Lindqvist */

  defineEvent('evt.cast.lindqvist_meet', {
    kind: 'random',
    title: 'The external auditor',
    body: 'Sofia Lindqvist has been given a desk in the corner and a list of forty files. She is polite, unhurried, and asks for things in an order that suggests she already knows what she will find.',
    weight: 13,
    conditions: { ...lindqvist.unknown, minLevel: 2 },
    choices: [
      {
        id: 'everything',
        label: 'Give her everything, indexed, including the bad ones',
        text: 'You hand over all forty plus three she did not ask for, two of which are the weakest files in the department. She reads all forty-three and her report says so.',
        effects: [
          ...lindqvist.meet(18),
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'exactly',
        label: 'Exactly the forty on the list',
        text: 'Precisely what was requested and nothing beside it. Entirely proper, and she notices the precision, and precision is a thing auditors notice for a living.',
        effects: [...lindqvist.meet(2)],
      },
      {
        id: 'manage',
        label: 'Order them so the strong ones come first',
        text: 'She reads the first six, forms a view, and reads the remaining thirty-four against it. It works, and she has been doing this for nineteen years and has seen the trick before.',
        effects: [
          ...lindqvist.meet(-10),
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.lindqvist_returns', {
    kind: 'random',
    title: 'She has read your files before',
    body: 'A different administration, a different post, and the same auditor in the corner. Sofia Lindqvist remembers the department you ran nine years ago in more detail than you do, including the two files you would rather she did not.',
    weight: 12,
    conditions: { ...lindqvist.known, minYearsElapsed: 8 },
    choices: [
      {
        id: 'raise_it',
        label: 'Raise the two files yourself, before she does',
        outcomes: [
          {
            weight: 4,
            text: 'You put them in front of her with what you now think about them. She had not in fact remembered those two, and the fact that you did is the finding she writes up.',
            effects: [
              lindqvist.standing(14),
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'She had remembered them, and had been waiting to see whether you would. You did. It is the shortest audit conversation either of you has ever had.',
            effects: [lindqvist.standing(10), { kind: 'stat', stat: 'integrity', delta: 6 }],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait and see whether she brings them up',
        text: 'She does, on the fourth day, having gone and found them. Nothing improper has happened and something has changed in how the rest of the week goes.',
        effects: [
          lindqvist.standing(-8),
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.lindqvist_hard_finding', {
    kind: 'random',
    title: 'She has found something real',
    body: 'It is not a technicality. Sofia Lindqvist has found a genuine failure in something you are responsible for, has understood it correctly, and has come to you before writing it up — which she is not required to do and has never done for you before.',
    weight: 12,
    conditions: { ...lindqvist.warm(15), minLevel: 4, minYearsElapsed: 10 },
    choices: [
      {
        id: 'accept',
        label: 'Accept it in full and fix it before the report lands',
        text: 'The finding stands and the remedy is already running by the time it is published, which turns a failure into the only worked example anyone has of a body fixing something on being told. It is quoted for years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 8 },
          lindqvist.standing(12),
        ],
      },
      {
        id: 'contest',
        label: 'Contest the finding',
        outcomes: [
          {
            weight: 2,
            text: 'You are right on one of the three limbs, which reduces the finding and delays it a quarter. The other two limbs are still true and you have spent nineteen years of goodwill on the one that was not.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -2 },
              lindqvist.standing(-14),
            ],
          },
          {
            weight: 3,
            text: 'She has the documents. She always has the documents. The finding is published in stronger terms than it was going to be, with a paragraph about the response of management.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -7 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
              lindqvist.standing(-18),
            ],
          },
        ],
      },
      {
        id: 'thank_her',
        label: 'Ask her to write it as hard as it deserves',
        text: 'You tell her not to soften it on account of the warning, because a soft finding will not move the money. She writes it hard. The money moves.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          lindqvist.standing(10),
        ],
      },
    ],
  }),

  /* ------------------------------------------------------------- Nowak */

  defineEvent('evt.cast.nowak_meet', {
    kind: 'random',
    title: 'The account manager',
    body: 'Jozef Nowak looks after this administration for a company you buy a great deal from. He is funny, he knows your sector better than most of your colleagues, and lunch is on him and always will be.',
    weight: 13,
    conditions: { ...nowak.unknown, minLevel: 2 },
    choices: [
      {
        id: 'useful_distance',
        label: 'Take the meeting, decline the lunch',
        text: 'An hour in a meeting room with the door open and a note on the file. He is exactly as useful as he would have been over lunch, which tells you something about lunch.',
        effects: [
          ...nowak.meet(6),
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'lunch',
        label: 'Go to lunch',
        text: 'It is a very good lunch and you learn three things you could not have learned anywhere else. Nothing is asked for. Nothing is ever asked for, for about four years.',
        effects: [
          ...nowak.meet(16),
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'flag', flag: 'supplier_familiarity' },
        ],
      },
      {
        id: 'nothing',
        label: 'Deal with the company through the contract only',
        text: 'Every contact in writing, every question through the contract manager. It is slower, it is duller, and eleven years later it is the reason one particular conversation never has to happen.',
        effects: [...nowak.meet(-6), { kind: 'stat', stat: 'integrity', delta: 5 }],
      },
    ],
  }),

  defineEvent('evt.cast.nowak_asks', {
    kind: 'random',
    title: 'He finally asks for something',
    body: 'Four years of lunches and useful information, and today Jozef Nowak would like to know, informally, roughly when the specification is likely to be published. It is not confidential. It is also not nothing.',
    weight: 12,
    conditions: { ...nowak.warm(10), minYearsElapsed: 4 },
    choices: [
      {
        id: 'no',
        label: 'Tell him you cannot, and why',
        text: 'You explain that it is not about whether the information is secret, it is about who has it first. He takes it well, because he already knew, and had asked anyway.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          nowak.standing(-6),
        ],
      },
      {
        id: 'tell_everyone',
        label: 'Publish the timetable to the whole market that afternoon',
        text: 'You answer his question by making it not worth asking: an indicative timetable to every supplier on the list, within the hour. Four of them thank you. He is the only one who understands what just happened.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 4 },
          nowak.standing(-2),
        ],
      },
      {
        id: 'tell_him',
        label: 'Give him the date',
        text: 'It is one date and it is going to be public in six weeks anyway. His company is ready on the day it publishes and two others are not, and the tender is won on preparation, which is the whole point of asking.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -7 },
          nowak.standing(14),
          { kind: 'flag', flag: 'undeclared_interest' },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.nowak_offer', {
    kind: 'random',
    title: 'There would be a job, if you wanted one',
    body: 'Nowak’s company is building an advisory arm and would like someone who understands how the public side actually decides things. The number he mentions is roughly double what you earn, and he mentions it exactly once.',
    weight: 12,
    conditions: { ...nowak.known, minLevel: 4, minYearsElapsed: 12 },
    choices: [
      {
        id: 'refuse',
        label: 'Say no, and write down that it was offered',
        text: 'You decline, and then put a note on the file recording the approach, the date, and the figure. The second part is the part almost nobody does.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'flag', flag: 'turned_down_the_money' },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
      {
        id: 'refuse_quietly',
        label: 'Say no and leave it there',
        text: 'A polite no over the phone and nothing on any file. It never happened, in the sense that there is no record that it happened, which are two different things you have just chosen between.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'flag', flag: 'turned_down_the_money' },
        ],
      },
      {
        id: 'consider',
        label: 'Ask what the arrangement would look like',
        text: 'One conversation about scope, notice periods and the conflict rules, all of it hypothetical. Nothing is agreed and something is now different about how you read that company’s bids.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: 5 },
          nowak.standing(10),
          { kind: 'flag', flag: 'undeclared_interest' },
        ],
      },
    ],
  }),

  /* -------------------------------------------------------------- Kess */

  defineEvent('evt.cast.kess_meet', {
    kind: 'random',
    title: 'The trainee has found something',
    body: 'Aurelia Kess is two years in and has spotted a problem in a document signed off long before she arrived. She is nervous, tentative, and — you check it twice — right.',
    weight: 14,
    conditions: { ...kess.unknown, minLevel: 2 },
    choices: [
      {
        id: 'back_her',
        label: 'Put her name on the correction',
        text: 'You have her write it up and take it in with her. It is taken well, mostly, and she is a different official from that week onward.',
        effects: [
          ...kess.meet(22),
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'teamMorale', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'own_name',
        label: 'Raise it under your own name',
        text: 'Safer for her and simpler for you. She notices, says nothing, and files it with everything else she is learning about how this works.',
        effects: [
          ...kess.meet(-8),
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'sit_on_it',
        label: 'Tell her these things are rarely worth reopening',
        text: 'Nothing has gone wrong yet. You watch her decide what kind of department this is, and she decides quickly, and she is right.',
        effects: [
          ...kess.meet(-18),
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'teamMorale', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.kess_grows', {
    kind: 'random',
    title: 'She runs something now',
    body: 'Aurelia Kess has a unit of her own in another administration, and has rung to ask how you would handle something. It is a good question. It is also, you notice, exactly the question you were asked at her age.',
    weight: 12,
    conditions: { ...kess.known, minYearsElapsed: 8 },
    choices: [
      {
        id: 'tell_her_properly',
        label: 'Tell her what you actually know, including the mistakes',
        text: 'An hour, and the useful half of it is the four things you got wrong. She takes notes on those and not on the rest, which is how you find out she has become good at this.',
        effects: [
          kess.standing(14),
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
      },
      {
        id: 'official_line',
        label: 'Give her the answer the guidance would give',
        text: 'Correct, complete, and available in a document she could have read herself. She thanks you and does not ring again for two years.',
        effects: [kess.standing(-6)],
      },
      {
        id: 'ask_for_something',
        label: 'Answer, and mention what you need from her administration',
        text: 'You help, thoroughly, and then raise the thing you have been unable to get out of her body for four months. It is the shape of every senior relationship and she has just learned that it is the shape of this one.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          kess.standing(-8),
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.cast.kess_above_you', {
    kind: 'random',
    title: 'She outranks you',
    body: 'The trainee who was nervous about a footnote is now senior to you, in a body that has some say over what you do. She has been in post a month and has asked to see you.',
    weight: 13,
    conditions: { ...kess.known, minLevel: 4, minYearsElapsed: 14 },
    choices: [
      {
        id: 'gracious',
        label: 'Turn up and be useful',
        outcomes: [
          {
            weight: 4,
            text: 'She wanted to say, before anything else happened between your two bodies, that the week you put her name on the correction is the reason she is in the chair. Then you both get on with the work, which is considerably easier than it would otherwise have been.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 12 },
              { kind: 'stat', stat: 'reputation', delta: 5 },
              kess.standing(8),
            ],
            conditions: kess.warm(15),
          },
          {
            weight: 4,
            text: 'She is correct, brisk and entirely professional, and at no point mentions the footnote. You spend the meeting waiting for her to and she never does, which is worse.',
            effects: [
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
            conditions: kess.cold(-5),
          },
          {
            weight: 3,
            text: 'A perfectly ordinary meeting between two officials with a lot of shared history and nothing in particular to say about it. You had both built it into something larger on the walk over.',
            effects: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
          },
        ],
      },
      {
        id: 'raise_it',
        label: 'Say plainly what you did and did not do for her',
        outcomes: [
          {
            weight: 3,
            text: 'You tell her you took her find and put your own name on it, twenty years too late to be an apology. She says she knew, and that she nearly left the service over it, and that she is glad she did not. Then the meeting starts.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 9 },
              kess.standing(12),
              { kind: 'stat', stat: 'stress', delta: -6 },
            ],
            conditions: kess.cold(-5),
          },
          {
            weight: 3,
            text: 'You say that backing her was the easiest good decision you ever took and that you have made far worse ones since. She laughs and tells you two of them, accurately.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              kess.standing(6),
            ],
          },
        ],
      },
    ],
  }),
];
