import { defineEvent } from '../authoring';

const projects = { departments: ['projects' as const] };

export const projectsEvents = [
  defineEvent('evt.projects.milestone_fiction', {
    kind: 'random',
    title: 'Substantially complete',
    body: 'The milestone report is due on Friday. The milestone is about seventy per cent done. The partner who is late has asked you to report it as complete, "because it will be by the time anyone checks".',
    weight: 12,
    conditions: projects,
    choices: [
      {
        id: 'honest',
        label: 'Report it as it is',
        text: 'You report seventy per cent and explain why. The programme officer is unimpressed and entirely reasonable about it. The payment is delayed one quarter.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
          { kind: 'stat', stat: 'reputation', delta: 1 },
        ],
      },
      {
        id: 'complete',
        label: 'Report it as complete',
        outcomes: [
          {
            weight: 3,
            text: 'It is complete four weeks later and nobody ever looks. The payment arrives on schedule, the partner is grateful, and the file contains a statement that was untrue when you signed it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -5 },
              { kind: 'stat', stat: 'politicalCapital', delta: 4 },
              { kind: 'flag', flag: 'reported_incomplete_milestone' },
            ],
          },
          {
            weight: 2,
            text: 'The programme selects your project for a spot check in the following quarter. It is complete by then. The dates in the file are not.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: -5 },
              { kind: 'flag', flag: 'reported_incomplete_milestone' },
              { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 },
            ],
          },
        ],
      },
      {
        id: 'delay',
        label: 'Ask the programme for a formal extension',
        text: 'Two weeks of forms to buy six weeks of honesty. Granted. The partner is annoyed at the paperwork and the file is clean.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.partner_costs', {
    kind: 'random',
    title: 'Sixty hours in one week',
    body: 'A partner’s timesheet shows a researcher working sixty hours in a week that contained a public holiday. It might be sloppy record-keeping. It might be a claim for hours nobody worked. Verifying it means accusing someone.',
    weight: 11,
    conditions: projects,
    choices: [
      {
        id: 'query',
        label: 'Query it formally',
        text: 'You ask, in writing, for the underlying records. They arrive, corrected, with an explanation about a data entry error. Perhaps it was. The claim is now defensible.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'pass',
        label: 'Pass it through',
        text: 'It is one line in a claim of four hundred. You certify the lot. Somewhere in the file there is now a number you did not believe.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 4 },
        ],
      },
      {
        id: 'exclude',
        label: 'Exclude the line and pay the rest',
        text: 'Quiet, proportionate, and it costs the partner nine hundred euros they may well have been owed. They do not raise it, which tells you something.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 1 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.underspend', {
    kind: 'random',
    title: 'Use it or lose it',
    body: 'Eighty thousand euros of the grant will be lost at year end if it is not committed. There are two months. Nothing on the work plan can absorb it, but three suppliers could invoice for "consultancy" by December.',
    weight: 11,
    conditions: projects,
    choices: [
      {
        id: 'return',
        label: 'Let it go back',
        text: 'You write the underspend into the report with the reasons. The finance director is unhappy, the programme officer notes it as good practice, and eighty thousand euros returns to the fund.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
        ],
      },
      {
        id: 'spend',
        label: 'Commit it before December',
        text: 'Three contracts, all technically eligible, none of which anyone had wanted in October. The money is spent, the target is met, and you know exactly what you did.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
        ],
      },
      {
        id: 'reallocate',
        label: 'Find something the project actually needs',
        text: 'Two weeks of hunting produces one genuine, eligible, useful piece of work worth fifty-one thousand. The rest goes back. It is the harder answer and the right one.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'performance', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 6 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.rejected_applicant', {
    kind: 'random',
    title: 'The association that missed by one point',
    body: 'A small community association scored 59 where the threshold was 60. They have written to say the project will not happen without the grant, which is true, and that the scoring was unfair, which it was not.',
    weight: 10,
    conditions: projects,
    choices: [
      {
        id: 'uphold',
        label: 'Uphold the score',
        text: 'You explain the methodology in detail and offer to walk them through their application for next round. They do not apply next round.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
      {
        id: 'rescore',
        label: 'Find the point',
        text: 'You re-read it looking for a reason, and reasons are always findable. They get the grant. The applicant who scored 59 last round and was refused does not know.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'stat', stat: 'politicalCapital', delta: 2 },
        ],
      },
      {
        id: 'alternative',
        label: 'Find them another route',
        text: 'An hour on the phone locates a smaller regional fund with a rolling deadline. They apply and succeed. It is not your job and it took an hour.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.scope_creep', {
    kind: 'random',
    title: 'Could it also do this?',
    body: 'A deputy mayor has seen the project and would like it to include her neighbourhood. It is outside the approved scope, outside the eligible area, and would take four months to get approved if it could be approved at all.',
    weight: 11,
    conditions: projects,
    choices: [
      {
        id: 'no',
        label: 'Explain why it cannot',
        text: 'You set out the eligibility rules clearly and offer to look at the next call. She accepts it and remembers the department as the one that says no.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'amend',
        label: 'Apply for a scope amendment',
        outcomes: [
          {
            weight: 2,
            text: 'Four months of paperwork and it is approved. The neighbourhood gets the work, the deputy mayor gets the ribbon, and you get a reputation for making things possible.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: 5 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
          {
            weight: 2,
            text: 'Four months of paperwork and it is refused. The deputy mayor concludes the department is ineffective rather than that the rules are strict.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -3 },
              { kind: 'stat', stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'quietly',
        label: 'Include it and describe it differently',
        text: 'A generous reading of "pilot area" and it fits. Nobody queries it. The wording is doing a great deal of work and everyone who reads it carefully will see that.',
        effects: [
          { kind: 'stat', stat: 'politicalCapital', delta: 5 },
          { kind: 'stat', stat: 'integrity', delta: -5 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 5 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.auditors_on_site', {
    kind: 'random',
    title: 'Three auditors and a checklist',
    body: 'The programme’s audit authority is here for two days. They are professional, unhurried, and will look at whatever they look at. Your project files are good but not perfect, and you know which two folders are the weak ones.',
    weight: 10,
    conditions: projects,
    choices: [
      {
        id: 'open',
        label: 'Give them everything, including the weak folders',
        outcomes: [
          {
            weight: 3,
            text: 'They find the two gaps, you explain them honestly, and both are recorded as minor observations with no financial correction. Openness read as competence.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: 3 },
            ],
          },
          {
            weight: 2,
            text: 'They find the two gaps and one of them is worse than you thought. A correction of eleven thousand euros is proposed. Your honesty is noted and does not reduce it.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'stat', stat: 'reputation', delta: -2 },
              { kind: 'stat', stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'manage',
        label: 'Give them what they ask for and nothing more',
        text: 'They ask well, but not about the two folders. The audit closes clean. You spend the following year hoping the next one asks the same questions.',
        effects: [
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'stat', stat: 'integrity', delta: -2 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.related_subcontractor', {
    kind: 'random',
    title: 'The same address',
    body: 'A partner has subcontracted twenty-two thousand euros of work to a company that shares its registered address and one of its directors. It was disclosed, in a footnote, in an annex.',
    weight: 10,
    conditions: projects,
    choices: [
      {
        id: 'escalate',
        label: 'Refer it to the programme',
        text: 'You report the related-party transaction as the rules require. The partner is furious, the programme investigates for eight months, and the finding is that it was permissible but should have been declared properly.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 5 },
          { kind: 'stat', stat: 'politicalCapital', delta: -4 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
      },
      {
        id: 'require_evidence',
        label: 'Demand evidence the price was competitive',
        text: 'You require three comparable quotes before certifying. They produce them, grudgingly, and the price turns out to be reasonable. The file is now sound and the relationship is not.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'performance', delta: 2 },
          { kind: 'stat', stat: 'politicalCapital', delta: -2 },
        ],
      },
      {
        id: 'noted',
        label: 'It was disclosed; certify it',
        text: 'Disclosure is not the same as justification, and you know the difference. The claim is certified.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 3 },
        ],
      },
    ],
  }),

  defineEvent('evt.projects.case_study', {
    kind: 'random',
    title: 'A success story',
    body: 'The communications team needs a two-page case study for the programme’s annual publication. They have drafted it. It says the project created ninety jobs. The evaluation says it created between thirty and forty, and that attribution is uncertain.',
    weight: 11,
    conditions: projects,
    choices: [
      {
        id: 'correct',
        label: 'Insist on the real figure',
        text: 'The published version says "thirty to forty, alongside wider effects that are difficult to attribute". It is a duller page and a true one. Communications find you difficult.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 4 },
          { kind: 'stat', stat: 'politicalCapital', delta: -3 },
        ],
      },
      {
        id: 'sign',
        label: 'Let it go out',
        text: 'Ninety jobs. It is repeated in a speech, then in a press release, then cited back to you in a meeting eighteen months later as an established fact.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: -4 },
          { kind: 'stat', stat: 'politicalCapital', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 2 },
          { kind: 'flag', flag: 'signed_off_inflated_figure' },
        ],
      },
      {
        id: 'rewrite',
        label: 'Rewrite it so the truth is the story',
        text: 'You spend an evening finding the version where thirty-five real jobs and one genuinely transferable method are more interesting than ninety invented ones. Communications prefer it. So does the programme.',
        effects: [
          { kind: 'stat', stat: 'integrity', delta: 3 },
          { kind: 'stat', stat: 'reputation', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: 4 },
        ],
      },
    ],
  }),
];
