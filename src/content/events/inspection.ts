import { defineEvent } from '../authoring';

const inspection = { departments: ['inspection' as const] };

/**
 * Inspection.
 *
 * The department that looks at the others. Almost every dilemma here is the same one seen from an
 * unfamiliar side: the player has spent a career being the body with the cleared diary and the
 * biscuits, and now they are the one asking. What that does to the writing is that the sympathetic
 * character is usually the person being inspected.
 */
export const inspectionEvents = [
  defineEvent('evt.inspection.the_good_manager', {
    kind: 'random',
    title: 'She is doing an impossible job well',
    body: 'The service is failing against four of the seven standards. It is also being run by somebody who has been carrying two vacancies for a year, has raised it in writing five times, and is the only reason it is failing against four rather than seven.',
    weight: 12,
    conditions: inspection,
    choices: [
      {
        id: 'name_the_cause',
        label: 'Report the failures, and where they come from',
        text: 'Four findings against the service and one against the body that would not fill the posts. The second one is the finding that changes anything, and it is the one they did not expect.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -6 },
        ],
      },
      {
        id: 'standards_are_standards',
        label: 'Report against the standards and nothing else',
        text: 'Four findings, correctly evidenced, against a manager who did everything she could. The report is unarguable and reads, to anyone who was there, as a document written by someone who has never done the job.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
      {
        id: 'soften',
        label: 'Find three rather than four',
        text: 'One of them was arguable and you argue it her way. She knows exactly what you did, which puts her in the position of owing an inspector something, which is the last thing she needed.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 3 },
          { kind: 'flag', flag: 'buried_a_finding' },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.old_colleague_body', {
    kind: 'random',
    title: 'You know this administration',
    body: 'The body on next month’s schedule is one you worked in, and two of the people who will be across the table from you were colleagues. You know where the weaknesses are before you arrive, which is either the most useful thing about you or a reason to send somebody else.',
    weight: 12,
    conditions: inspection,
    choices: [
      {
        id: 'declare_and_go',
        label: 'Declare it and lead the inspection anyway',
        text: 'A paragraph on the file, agreed with your director, and then the best-targeted inspection the office runs that year — because you know which cupboard the problem is in.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'step_aside',
        label: 'Hand it to someone else',
        text: 'A colleague takes it, without your knowledge of the place, and produces a competent report that misses the two things you would have gone straight to.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
      {
        id: 'quiet_word',
        label: 'Give them a fortnight’s warning about the cupboard',
        text: 'One phone call and they have two weeks to put it right before you arrive. The service is better for it and the inspection is now a piece of theatre that you wrote.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -7 },
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'flag', flag: 'tipped_off_a_colleague' },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.grade_pressure', {
    kind: 'random',
    title: 'One grade either way',
    body: 'The evidence puts the body on the boundary between two overall grades. The lower one triggers intervention, funding conditions and a change of leadership. The higher one triggers a letter.',
    weight: 13,
    conditions: inspection,
    choices: [
      {
        id: 'evidence',
        label: 'Let the evidence decide it, and say it was marginal',
        text: 'You grade it and then write, in the report, that it was a marginal call and exactly which way the evidence tipped. Nobody does this, and it is the reason your gradings are the ones people trust.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'lower',
        label: 'Take the lower grade; the intervention is what they need',
        outcomes: [
          {
            weight: 3,
            text: 'The intervention arrives, and eighteen months later the service is genuinely better under people who could not have been brought in any other way.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: 2 },
              { kind: 'stat', stat: 'politicalCapital', delta: -4 },
            ],
          },
          {
            weight: 2,
            text: 'The intervention arrives, costs eleven months of everyone’s attention, and replaces a struggling leadership team with a struggling interim one. The service is not better. Your grading was defensible.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'higher',
        label: 'Take the higher grade; they are on the way up',
        text: 'They probably are. You have also just made the judgement that trajectory counts, which is not in the framework, and which somebody less scrupulous than you will cite next year.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.whistleblower_call', {
    kind: 'random',
    title: 'Somebody inside has called you',
    body: 'A member of staff at a body you inspect has rung the office directly. What they describe is serious, they are plainly frightened, and they will not put it in writing.',
    weight: 12,
    conditions: inspection,
    choices: [
      {
        id: 'protect_and_pursue',
        label: 'Find it another way, so they never have to be named',
        text: 'You go looking for the same thing in the documents, and it takes three weeks and you find it. The finding stands on paper nobody can trace back to a phone call.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'need_it_written',
        label: 'Tell them you can act only on something in writing',
        text: 'True, procedurally. They do not put it in writing, and the thing they described goes on for another two years, and you were entirely correct about the procedure.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
      {
        id: 'go_now',
        label: 'Bring the inspection forward without explaining why',
        outcomes: [
          {
            weight: 3,
            text: 'You arrive four months early on a pretext. It is obvious to everyone that something prompted it, and within a fortnight the body has worked out how many people could have made that call.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'integrity', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
            ],
          },
          {
            weight: 2,
            text: 'You arrive early, find it in two days, and the speed is itself the protection: nobody has time to work out where it came from before the report is public.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'integrity', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.same_finding_again', {
    kind: 'random',
    title: 'The same finding, for the fourth time',
    body: 'You have written this recommendation about this body three times. It has been accepted in full three times. Nothing has happened three times, and the person who accepted it each time is genuinely sincere.',
    weight: 12,
    conditions: inspection,
    choices: [
      {
        id: 'escalate',
        label: 'Report that acceptance has become meaningless',
        text: 'You write, in terms, that this body accepts recommendations as a substitute for implementing them, and that the office should stop treating acceptance as an outcome. It is quoted in the annual report.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
          { kind: 'stat', stat: 'politicalCapital', delta: -8 },
        ],
      },
      {
        id: 'help_them',
        label: 'Work out with them why it never happens',
        text: 'Two days that are not an inspection at all, spent finding the actual obstacle, which turns out to be a finance rule in a different body entirely. The recommendation is implemented within the quarter.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'repeat',
        label: 'Make it for the fourth time',
        text: 'Recommendation four, identical to recommendations one to three, accepted in full. The report is accurate, the process has been followed, and you have written the same paragraph for four years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.press_leak', {
    kind: 'random',
    title: 'The draft is in the paper',
    body: 'A journalist has three paragraphs of your draft report, verbatim, four weeks before publication. They did not get it from your office, which leaves the body being inspected — and it is the three paragraphs that are least bad.',
    weight: 11,
    conditions: inspection,
    choices: [
      {
        id: 'publish_early',
        label: 'Publish the whole thing immediately',
        text: 'You bring the date forward and the full report goes out, findings and all, three days later. Whoever leaked it got two days of favourable coverage in exchange for the rest of it arriving early.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'complain',
        label: 'Complain formally to the body about the leak',
        text: 'A letter, an apology, an internal inquiry that finds nothing. It is entirely correct and it occupies six weeks that would otherwise have gone on the report.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'performance', delta: -2 },
        ],
      },
      {
        id: 'harden',
        label: 'Go back and harden the findings',
        text: 'You reread every finding asking whether you softened it, and toughen two that you had. Both are better for it. Neither of you will ever be sure whether they would have been toughened anyway.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.own_house', {
    kind: 'random',
    title: 'The inspectorate is being inspected',
    body: 'A peer review of your own office. The reviewers are competent, they have asked for the file on a case you handled, and the standard you are being held to is one you wrote.',
    weight: 11,
    conditions: { ...inspection, minLevel: 3 },
    choices: [
      {
        id: 'open',
        label: 'Give them the worst file first',
        text: 'You hand over the one you are least proud of, unprompted, at the start. The review finds three things and the covering letter says the office was more open with them than any body it inspects.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 8 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'normal',
        label: 'Cooperate exactly as you would expect a body to',
        text: 'Everything asked for, on time, nothing volunteered. It is precisely the behaviour you write findings about when you see it, and you notice that on about the third day.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.minister_wants_a_grade', {
    kind: 'random',
    title: 'A view has been expressed about the outcome',
    body: 'Nobody has asked you to change anything. What has happened is that a minister’s office has let it be known, twice, that a poor grade for this body would be unhelpful at this particular moment.',
    weight: 12,
    conditions: { ...inspection, minLevel: 3 },
    choices: [
      {
        id: 'ignore_and_record',
        label: 'Grade it as it is, and put the approach on the file',
        text: 'The grade stands and a note records who let what be known and when. The note is the part that costs you, and it is the part that means it will not be tried again.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 9 },
          { kind: 'stat', stat: 'politicalCapital', delta: -10 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'flag', flag: 'recorded_the_pressure' },
        ],
      },
      {
        id: 'ignore',
        label: 'Grade it as it is and say nothing about the approach',
        text: 'The right grade and no record of the pressure. You have protected the judgement and left the pressure available to be applied to somebody less able to ignore it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'timing',
        label: 'Grade it as it is and move the publication date',
        text: 'Not a word of the report changes. It comes out five weeks later, after the moment that would have been unhelpful, and everyone involved understands that this is what was actually being asked for.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'politicalCapital', delta: 7 },
          { kind: 'flag', flag: 'softened_for_politics' },
        ],
      },
    ],
  }),

  /* ------------------------------- a second pass, once the job is familiar */

  defineEvent('evt.inspection.captured', {
    kind: 'random',
    title: 'You have inspected them eleven times',
    body: 'You know the chief executive’s children’s names. You know which of the findings she can move and which she cannot. It has made your inspections sharper every year for a decade, and this year you notice you have stopped looking in one particular direction.',
    weight: 11,
    conditions: { ...inspection, minYearsElapsed: 6 },
    choices: [
      {
        id: 'hand_over',
        label: 'Ask to be taken off the body',
        text: 'You write that you have been inspecting them too long to be sure you are still seeing it. Your successor finds two things in her first visit that were in front of you for three years. Nobody outside the office ever hears about any of it.',
        effects: [{ kind: 'stat', stat: 'integrity', delta: 8 }],
      },
      {
        id: 'look_there',
        label: 'Go and look in that direction, hard',
        outcomes: [
          {
            weight: 3,
            text: 'There is nothing there. You had simply stopped checking, which is not the same as having been captured, and knowing the difference costs you a week and is worth it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
          {
            weight: 2,
            text: 'There is something there, and it has been there a while, and you are the inspector of record for every year it was.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'stat', stat: 'stress', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'carry_on',
        label: 'You are the reason that body is as good as it is',
        text: 'Which is true, and is the sentence every captured inspector in history has said to themselves, and both of those facts are now in the room with you.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.methodology_attacked', {
    kind: 'random',
    title: 'They are attacking the method, not the finding',
    body: 'A well-resourced body has engaged consultants to write a critique of your inspection methodology. It is forty pages, it is not stupid, and it does not contest a single one of your findings.',
    weight: 11,
    conditions: inspection,
    choices: [
      {
        id: 'engage',
        label: 'Answer it in public, point by point',
        text: 'Six weeks and a document that concedes the three points that are right and dismantles the other twenty-nine. The methodology is stronger afterwards and everyone can see what the exercise was.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'stress', delta: 7 },
        ],
      },
      {
        id: 'refuse',
        label: 'Decline to be drawn, and republish the findings',
        text: 'You say only that the findings stand and that none of them is contested. It is the right answer strategically and it lets forty unanswered pages sit on their website for four years.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'quiet_revision',
        label: 'Quietly adopt the three points they got right',
        text: 'The methodology changes at the next revision, without acknowledgement. It is better. They know exactly why it changed and have learned that forty pages works.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 4 },
          { kind: 'stat', stat: 'integrity', delta: -3 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.no_evidence_but', {
    kind: 'random',
    title: 'You are sure and you cannot prove it',
    body: 'Everything about this body says the figures are being managed. Four inspectors have felt it. Nothing in three years of documents will support a finding, and a finding you cannot support is worse than no finding at all.',
    weight: 12,
    conditions: inspection,
    choices: [
      {
        id: 'say_what_you_can',
        label: 'Report exactly what you can evidence, and nothing more',
        text: 'Three thin findings and a paragraph about the limits of what an inspection can see. It is the honest document and it will not stop anything.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'change_the_method',
        label: 'Change what you ask for next time',
        text: 'You redesign the evidence request around the thing you cannot prove, and come back in eighteen months, and this time the documents that would show it either exist or conspicuously do not.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 5 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'imply',
        label: 'Write it so a reader draws the conclusion',
        text: 'No finding, but an arrangement of facts from which one is unavoidable. It is effective, it is not evidence, and it is precisely what you would criticise a body for doing to a member of staff.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'integrity', delta: -6 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.small_body', {
    kind: 'random',
    title: 'Four staff and a framework built for four hundred',
    body: 'The body has four employees and delivers one service well. The inspection framework asks them for nineteen policies, a risk register and a workforce strategy, none of which they have and none of which would improve anything.',
    weight: 11,
    conditions: inspection,
    choices: [
      {
        id: 'proportionate',
        label: 'Inspect what matters and record why you did not ask for the rest',
        text: 'You look at the service, which is good, and write down that the framework is disproportionate for bodies of this size. The office changes the framework the following year for everyone.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
        ],
      },
      {
        id: 'full_framework',
        label: 'Apply the framework as written',
        text: 'Nineteen findings against a body that does its actual job well, all of them accurate. They spend the next year producing documents and the service gets slightly worse.',
        effects: [
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -4 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.recruit_from_them', {
    kind: 'random',
    title: 'The best person you have met this year works for them',
    body: 'She took you through their weakest area with complete candour, including two things you would not have found. The office has a vacancy and she would be extraordinary in it.',
    weight: 10,
    conditions: { ...inspection, minLevel: 3 },
    choices: [
      {
        id: 'after_publication',
        label: 'Wait until the report is published, then approach her',
        text: 'Eleven weeks of not saying anything, and then a conversation that is above suspicion. She takes the job and is extraordinary in it.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'mention_now',
        label: 'Mention it now, while you are still there',
        text: 'She is flattered and the report is not yet written, and the two facts are in the same room. Nothing improper happens and there is now a version of events in which something did.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'leave_her',
        label: 'Leave her where she is',
        text: 'The body needs her more than the office does, and you say so to nobody. She is still there four years later, still candid, still the reason the weakest area is not worse.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'reputation', delta: -1 },
        ],
      },
    ],
  }),

  defineEvent('evt.inspection.consequence_of_a_finding', {
    kind: 'random',
    title: 'The service closed',
    body: 'Your report was accurate. The funder read it, withdrew, and the service closed in March. Two hundred people used it and there is nothing else in that district.',
    weight: 11,
    conditions: { ...inspection, minYearsElapsed: 4 },
    choices: [
      {
        id: 'stand_by_it',
        label: 'Stand by the report and say what it was for',
        text: 'The service was unsafe and the report said so. That it was also the only service is a fact about the district and not a reason to have written something untrue, and you say both halves out loud.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 7 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
      {
        id: 'change_practice',
        label: 'Change how the office reports when there is no alternative provision',
        text: 'Findings stay as they are; the covering advice now says explicitly what exists instead, so a funder withdrawing has to do it knowingly. Two closures are prevented in the following three years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 6 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'performance', delta: 3 },
        ],
      },
      {
        id: 'softer_next_time',
        label: 'Be more careful about how hard you write it next time',
        text: 'The next borderline report is a shade gentler. Nothing closes. Something else, in a place you never inspect, goes on being unsafe for another two years.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -6 },
          { kind: 'stat', stat: 'stress', delta: -4 },
          { kind: 'flag', flag: 'buried_a_finding' },
        ],
      },
    ],
  }),
];
