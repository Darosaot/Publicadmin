import { defineEvent } from '../authoring';

/** The senior pool: decisions that are about the organisation rather than about a file. */
const senior = { minLevel: 4 as const };

export const leadershipEvents = [
  defineEvent('evt.lead.whistleblower', {
    kind: 'random',
    title: 'Somebody has come to you directly',
    body: 'A middle manager three levels down has asked to see you alone. What she describes, if true, is a serious and sustained problem in a part of the organisation run by a colleague of yours. She has documents. She is frightened.',
    weight: 12,
    conditions: senior,
    choices: [
      {
        id: 'protect_and_act',
        label: 'Protect her and act on it',
        outcomes: [
          {
            weight: 3,
            text: 'You put her under formal protection the same day and refer the substance without her name attached to it. The investigation finds most of what she described. She is still in post two years later, which is the part you are proudest of.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'You do everything correctly and it leaks anyway. She is identified within a month, the investigation stalls, and you spend a year being the person who could not keep a promise.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
              { kind: 'stat', stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'proper_channel',
        label: 'Direct her to the formal channel',
        text: 'It is the correct advice, procedurally. She uses it, the process handles it slowly and adequately, and she tells you afterwards that she had come to you because she did not trust the process.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'warn_colleague',
        label: 'Give your colleague a chance to explain first',
        text: 'You tell him what has been alleged. He is grateful, and by the time anything formal happens the documents she referred to have been "archived in line with the retention schedule".',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -8 },
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'flag', flag: 'tipped_off_a_colleague' },
          { kind: 'queueEvent', eventId: 'evt.followup.investigation', delayTurns: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.cuts_allocation', {
    kind: 'random',
    title: 'Somebody has to lose',
    body: 'The directorate must find eight per cent. You are in a room with four other directors, each with a defensible case, and the decision will be made this afternoon whether or not anyone volunteers.',
    weight: 12,
    conditions: senior,
    choices: [
      {
        id: 'volunteer',
        label: 'Put your own area forward first',
        outcomes: [
          {
            weight: 3,
            text: 'You go first with a real, costed offer. It reframes the room from defence to problem-solving, the total is found in ninety minutes, and your share ends up smaller than it would have been.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'teamMorale', delta: -3 },
            ],
          },
          {
            weight: 2,
            text: 'You go first and are taken at your word. Nobody follows, your offer is accepted in full, and you explain to your unit why the department that volunteered is the department that lost.',
            effects: [
              { kind: 'budgetMonthly', delta: -1800 },
              { kind: 'teamMorale', delta: -8 },
              { kind: 'stat', stat: 'reputation', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'defend',
        label: 'Defend your area',
        text: 'You make the strongest case in the room and win. The eight per cent is found from a colleague’s area, which serves twelve thousand people slightly worse from April. You did your job.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'teamMorale', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
      {
        id: 'challenge',
        label: 'Challenge the eight per cent itself',
        conditions: { minStat: { politicalCapital: 40 } },
        outcomes: [
          {
            weight: 2,
            text: 'You ask what the eight per cent is actually for, and keep asking, and it emerges that the figure came from a spreadsheet error two levels up. It becomes three per cent.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 7 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
            ],
          },
          {
            weight: 3,
            text: 'The eight per cent is real, well-founded, and yours to deliver. You have spent an afternoon and a good deal of credit establishing that.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
              { kind: 'budgetMonthly', delta: -1500 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.appointment_panel', {
    kind: 'random',
    title: 'You are chairing the panel',
    body: 'Two candidates for a senior post. One is excellent on the day and unknown. The other is competent, internal, has waited four years, and is expected by everyone in the building to get it.',
    weight: 12,
    conditions: senior,
    choices: [
      {
        id: 'best_candidate',
        label: 'Appoint the better candidate',
        outcomes: [
          {
            weight: 3,
            text: 'You appoint on merit and document why. The internal candidate is devastated, stays, and is a better colleague to the new arrival than anyone expected. The precedent that this administration appoints on merit outlives all three of you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 6 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
          },
          {
            weight: 2,
            text: 'You appoint on merit. The internal candidate resigns within the quarter, taking nine years of institutional knowledge, and the external appointment leaves after fourteen months.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'performance', delta: -3 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'internal',
        label: 'Appoint the one everybody expects',
        text: 'Defensible on paper — the scoring is close enough to justify. The building reads it correctly as buggins’ turn, and every ambitious person in it updates their view of how this place works.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'teamMorale', delta: -4 },
        ],
      },
      {
        id: 'reopen',
        label: 'Appoint neither and readvertise',
        text: 'Neither is quite right for what the post actually needs, and you say so. It costs four months and a great deal of irritation, and the third round produces someone better than either.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.political_pressure', {
    kind: 'random',
    title: 'A conversation with no witnesses',
    body: 'A political adviser explains, pleasantly and without ever quite saying it, that the analysis your directorate is about to publish would be more helpful with a different conclusion, and that people notice who is helpful.',
    weight: 12,
    conditions: senior,
    choices: [
      {
        id: 'publish',
        label: 'Publish it as it stands',
        outcomes: [
          {
            weight: 3,
            text: 'It goes out unchanged. There is no retaliation you can point to, and for the next two years you are not in rooms you used to be in.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -8 },
            ],
          },
          {
            weight: 2,
            text: 'It goes out unchanged, is quoted in a debate within a fortnight, and the adviser who leaned on you is gone by the summer. Your standing is permanently different afterwards.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 7 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'note_it',
        label: 'Publish it, and record the conversation',
        text: 'You send yourself and the permanent head a factual note of the conversation the same afternoon. Nothing comes of it for three years, and then it matters enormously.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -5 },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
      {
        id: 'soften',
        label: 'Find a form of words',
        text: 'The finding survives; the emphasis does not. It is published, it is technically complete, and the sentence that would have caused trouble is now a subordinate clause on page thirty-one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -7 },
          { kind: 'stat', stat: 'politicalCapital', delta: 7 },
          { kind: 'flag', flag: 'softened_for_politics' },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.crisis_weekend', {
    kind: 'random',
    title: 'It happens on a Friday evening',
    body: 'Something has failed badly enough to be on the news by morning. You are the senior person contactable. The facts are incomplete, three versions are circulating internally, and a statement is expected within the hour.',
    weight: 12,
    conditions: senior,
    choices: [
      {
        id: 'facts_only',
        label: 'Say only what is established',
        text: 'A short statement containing three verified facts and a commitment to say more when there is more. It is criticised overnight as thin and is, by Tuesday, the only statement anybody made that did not have to be corrected.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 9 },
        ],
      },
      {
        id: 'reassure',
        label: 'Reassure the public',
        outcomes: [
          {
            weight: 2,
            text: 'The reassurance turns out to be justified. It calms a genuinely frightening weekend and you were, in fairness, guessing.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 3,
            text: 'By Sunday the reassurance is untrue. The story stops being about the failure and becomes about the statement.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -8 },
              { kind: 'stat', stat: 'integrity', delta: -4 },
              { kind: 'stat', stat: 'stress', delta: 12 },
              { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Say nothing until Monday',
        text: 'The vacuum is filled by everyone else. By Monday the account that has settled is the one told by the people least equipped to tell it, and correcting it now looks like a response to criticism.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.legacy_decision', {
    kind: 'random',
    title: 'A decision that outlives you',
    body: 'The directorate must choose a standard — a way of doing something — that every administration in the country will follow for the next twenty years. Two options. One is better; the other is what three quarters of them already use.',
    weight: 11,
    conditions: senior,
    choices: [
      {
        id: 'better',
        label: 'Choose the better standard',
        outcomes: [
          {
            weight: 3,
            text: 'Eight years of migration pain and then a generation of getting it right. You are retired before anyone acknowledges it was the correct call.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 4 },
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'Adoption stalls at forty per cent. The country runs two standards for a decade, which is worse than either, and the decision is taught as a cautionary example.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -6 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'common',
        label: 'Choose the one everyone already uses',
        text: 'Adopted within eighteen months with almost no friction. It is, and remains, slightly the wrong answer, in a way that costs a small amount every year forever.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.peer_failing', {
    kind: 'random',
    title: 'A colleague is not coping',
    body: 'Another director, someone you have known for fifteen years, is visibly failing. Deadlines, meetings, the quality of everything. People below him are carrying it and beginning to say so.',
    weight: 11,
    conditions: senior,
    choices: [
      {
        id: 'talk_to_him',
        label: 'Talk to him yourself, privately',
        outcomes: [
          {
            weight: 3,
            text: 'It is the hardest conversation of your year and he takes it. Six weeks of leave, a reduced portfolio, and a colleague who is still in the service and still speaking to you.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'He denies all of it, sharply, and does not forgive the conversation. Nothing changes except that you now cannot raise it again.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'escalate',
        label: 'Raise it with the permanent head',
        text: 'It is handled formally, correctly, and without kindness. He is moved sideways within two months. The people below him are relieved and something between you is finished.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'cover',
        label: 'Quietly absorb some of his work',
        text: 'You take two of his files and have your people pick up a third. It holds for about seven months, which is long enough for the eventual failure to be much larger and to include you.',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 9 },
          { kind: 'teamMorale', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.eu_negotiation', {
    kind: 'random',
    title: 'Three days in a room in another country',
    body: 'You are leading the national position in a negotiation where twenty-six other people are doing the same. Your instruction has two red lines, one of which is going to fall.',
    weight: 11,
    conditions: senior,
    choices: [
      {
        id: 'hold_both',
        label: 'Hold both lines',
        outcomes: [
          {
            weight: 2,
            text: 'You hold, and the text goes to a further round rather than collapsing. Two other delegations privately thank you for making the argument they could not.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 3,
            text: 'You hold and are isolated. The text passes without you, on worse terms than the compromise available on the second morning.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'trade',
        label: 'Trade the weaker line for the stronger',
        text: 'You give up the one that mattered less, loudly, in exchange for the one that mattered more. It is exactly what the instruction meant and not what it said, and you write the note explaining that on the flight home.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'refer',
        label: 'Refer back for instructions',
        text: 'Correct, cautious, and by the time the answer arrives the room has moved on and settled the point without you.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: -3 },
          { kind: 'stat', stat: 'integrity', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.successor', {
    kind: 'random',
    title: 'Who comes after you',
    body: 'You will not be in this post forever. Two of the people below you could do it in five years, and only one of them knows it. What you do this year decides which of them is ready.',
    weight: 11,
    conditions: { ...senior, requiresTeam: true },
    choices: [
      {
        id: 'develop_both',
        label: 'Develop both, openly',
        text: 'You tell them both what you are doing and why, and split the stretching work between them. One thrives, one discovers they do not want it, and both are better off knowing.',
        effects: [
          { kind: 'teamSkill', delta: 6 },
          { kind: 'teamMorale', delta: 7 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
        ],
      },
      {
        id: 'pick_one',
        label: 'Pick the obvious one and back them hard',
        text: 'Concentrated investment produces a genuinely ready successor in three years. The other one, who was never told they were being weighed, leaves in eighteen months.',
        effects: [
          { kind: 'teamSkill', delta: 8 },
          { kind: 'loseStaff' },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'no_successor',
        label: 'Keep the job indispensable',
        text: 'You do not develop either. When you eventually move, the post is filled from outside and the directorate loses two years relearning what you knew. Nobody ever says this was your doing.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'teamMorale', delta: -6 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.merger', {
    kind: 'random',
    title: 'Two directorates, one director',
    body: 'A merger has been announced. Your directorate and another become one, and there is one post at the top of it. You and your counterpart are both in the building, both know, and have a meeting scheduled about something else.',
    weight: 10,
    conditions: senior,
    choices: [
      {
        id: 'compete_clean',
        label: 'Compete openly and well',
        outcomes: [
          {
            weight: 2,
            text: 'You both put in serious proposals for how the merged body should work, and yours is better. You get it, and you keep him, because you never said a word about him to anyone.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 6 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'stat', stat: 'stress', delta: 8 },
            ],
          },
          {
            weight: 2,
            text: 'His proposal is better. You are offered a deputy role, take it, and are professionally and privately fine about it in a way that surprises you.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'politicalCapital', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'undermine',
        label: 'Make sure the right people know his weaknesses',
        outcomes: [
          {
            weight: 3,
            text: 'It works. You get the post, he leaves within the year, and four people who watched how you got it will remember when it is your turn to be evaluated.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 5 },
              { kind: 'stat', stat: 'integrity', delta: -8 },
              { kind: 'flag', flag: 'undermined_a_peer' },
            ],
          },
          {
            weight: 2,
            text: 'It is traced back to you within a fortnight. He gets the post, you report to him, and the first conversation is one of the worst of your career.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -8 },
              { kind: 'stat', stat: 'integrity', delta: -8 },
              { kind: 'stat', stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'propose_joint',
        label: 'Propose the structure jointly with him',
        text: 'You write it together, including an honest account of which of you should lead which part. The people deciding have never seen this before. One of you gets it and the merged directorate works from the first week.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.public_appointment', {
    kind: 'random',
    title: 'A name has been suggested to you',
    body: 'You are appointing to a board that oversees part of your own directorate. A name has been suggested from above — well qualified, entirely appointable, and a personal friend of the person suggesting them.',
    weight: 11,
    conditions: senior,
    choices: [
      {
        id: 'open_competition',
        label: 'Run an open competition',
        text: 'Advertised, scored, and the suggested name applies and comes third. You appoint the first. The person who suggested them says nothing at all about it, ever, which is its own kind of message.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
      {
        id: 'appoint',
        label: 'Appoint them',
        text: 'They are genuinely well qualified, which is what makes it easy. The board minutes for the next four years contain nothing improper and the appointment is on file.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 6 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 6 },
        ],
      },
      {
        id: 'invite_apply',
        label: 'Invite them to apply, with everyone else',
        text: 'You take the suggestion as a suggestion and open the process. It is the answer that costs least and satisfies nobody, which usually means it was right.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.evidence_ignored', {
    kind: 'random',
    title: 'The policy is not working',
    body: 'Three years of data on a programme you did not design and now own. It does not work. It is popular, it is associated with people still in office, and stopping it would be an admission.',
    weight: 11,
    conditions: senior,
    choices: [
      {
        id: 'publish_and_stop',
        label: 'Publish the evaluation and recommend stopping',
        outcomes: [
          {
            weight: 3,
            text: 'It is a difficult six months and the programme is closed. The money goes to something that works, and the precedent — that this administration stops things — is worth more than the money.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 7 },
              { kind: 'stat', stat: 'reputation', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -7 },
            ],
          },
          {
            weight: 2,
            text: 'The evaluation is published, accepted, and the programme continues unchanged for political reasons that are never written down.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'redesign',
        label: 'Keep the name, rebuild the programme underneath it',
        text: 'The brand survives; almost everything under it is replaced over two years. It is intellectually dishonest and it is the version that actually improves outcomes for the people involved.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'inherit',
        label: 'It was not your design; leave it running',
        text: 'You inherited it and you will hand it on. Three more years of a programme that does not work, and no fingerprints.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.honour_offered', {
    kind: 'random',
    title: 'A letter marked private',
    body: 'You have been proposed for a state honour, for services to public administration. The letter asks, in careful language, whether you would accept if it were offered.',
    weight: 9,
    conditions: { ...senior, minStat: { reputation: 65 }, minTurn: 60 },
    choices: [
      {
        id: 'accept',
        label: 'Accept',
        text: 'Your mother comes to the ceremony. It is, unexpectedly, one of the better days of your life, and you spend the following week slightly embarrassed about how much it meant.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: -6 },
        ],
      },
      {
        id: 'decline',
        label: 'Decline',
        text: 'You write two lines saying the work was done by a great many people and you would rather not be singled out for it. It is true. It is also, you admit privately, a little bit of a pose.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'redirect',
        label: 'Ask whether it could go to someone else',
        text: 'You propose the officer who actually built the thing being honoured. The system is not designed for this and, remarkably, agrees. She is the first person in her family to enter that building.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'teamMorale', delta: 12 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.lead.private_offer', {
    kind: 'random',
    title: 'Three times the salary',
    body: 'A firm that advises administrations on exactly what you do would like you to run their public sector practice. The number is roughly three times what you earn. They can wait for an answer until Friday.',
    weight: 10,
    conditions: { ...senior, minStat: { reputation: 60 } },
    choices: [
      {
        id: 'stay',
        label: 'Stay',
        text: 'You say no on Thursday, having thought about it properly rather than reflexively. The number stops being a question, and the job you have becomes something you chose rather than something you ended up in.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: -6 },
          { kind: 'flag', flag: 'turned_down_the_money' },
        ],
      },
      {
        id: 'leverage',
        label: 'Use it to negotiate here',
        outcomes: [
          {
            weight: 2,
            text: 'They cannot match it and they find something: a wider portfolio, a title, and a rise the pay framework technically does not allow. You stay, better placed than you were.',
            effects: [
              { kind: 'salary', delta: 900 },
              { kind: 'stat', stat: 'politicalCapital', delta: 3 },
            ],
          },
          {
            weight: 3,
            text: 'They cannot match it and do not try. You stay anyway, and everyone now knows you were looking.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -5 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'ask_what_for',
        label: 'Ask what exactly they want you for',
        text: 'The honest answer, when you press, is your contacts and your knowledge of how decisions get made in the building you would be leaving. Which is a description of selling something that is not yours.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
    ],
  }),
];
