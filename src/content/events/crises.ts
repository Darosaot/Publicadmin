import { defineEvent } from '../authoring';

/**
 * How a crisis arrives.
 *
 * Not by the board refilling — crises are filtered out of that entirely — but through one of
 * these, which is the whole difference in feel. Ordinary work turns up at a rate the post is
 * designed to absorb. A crisis turns up because something has already gone wrong somewhere you
 * were not looking, and by the time you hear about it the decision is only about how you respond.
 *
 * Each arrival offers a real choice before the file lands, and neither option is free. You can
 * try to head it off — which costs favours and sometimes works — or you can accept it and start
 * from a better footing than somebody who spent a fortnight denying it.
 *
 * All four are gated to level 3 and up. A junior officer is not handed an inquiry; they are
 * handed a piece of one, which is what the ordinary board already models.
 */
export const crisisEvents = [
  defineEvent('evt.crisis.inquiry', {
    kind: 'milestone',
    once: true,
    weight: 8,
    title: 'A letter with a case number',
    body: 'A decision taken four years ago is being examined. You were not there, which will be established at length and will not help as much as you would like. The terms of reference arrive on Friday.',
    conditions: { minLevel: 3, minTurn: 24 },
    choices: [
      {
        id: 'cooperate',
        label: 'Open the files and say so',
        outcomes: [
          {
            weight: 1,
            text: 'You send everything, unprompted, with a covering note listing what is missing and why. It costs you a fortnight and buys you the only thing worth having here, which is that nobody later finds something you did not mention.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'spawnTask', templateId: 'task.crisis.inquiry' },
            ],
          },
        ],
      },
      {
        id: 'headoff',
        label: 'Find out who asked for it',
        conditions: { minStat: { politicalCapital: 25 } },
        outcomes: [
          {
            weight: 2,
            text: 'Three calls establish that this began as a complaint from somebody with a longer memory than a case. It does not go away, but it arrives narrowed to something a department can actually answer.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -14 },
              { kind: 'spawnTask', templateId: 'task.crisis.inquiry' },
            ],
          },
          {
            weight: 3,
            text: 'Three calls establish that everybody already knows, and that asking has been noted. The terms of reference arrive on Friday, slightly wider than they were on Tuesday.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -14 },
              { kind: 'stat', stat: 'reputation', delta: -3 },
              { kind: 'spawnTask', templateId: 'task.crisis.inquiry' },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.crisis.migration', {
    kind: 'milestone',
    once: true,
    weight: 8,
    title: 'The switch-off date',
    body: 'Eleven years of records sit on a system whose supplier has stopped answering, and somebody agreed in writing to a date that is now four months away. The person who agreed to it has retired.',
    conditions: { minLevel: 3, minTurn: 30 },
    choices: [
      {
        id: 'own',
        label: 'Take it on now, while there is time',
        outcomes: [
          {
            weight: 1,
            text: 'You put your name on it before anybody asks you to, which is the difference between a project and an incident. It is still going to be awful.',
            effects: [{ kind: 'spawnTask', templateId: 'task.crisis.migration' }],
          },
        ],
      },
      {
        id: 'escalate',
        label: 'Put it in writing to the board',
        outcomes: [
          {
            weight: 1,
            text: 'The board notes the risk, thanks you for raising it, and asks you to lead the response. This is what happens to people who raise risks, and you knew it when you wrote the paper.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 3 },
              { kind: 'stat', stat: 'stress', delta: 6 },
              { kind: 'spawnTask', templateId: 'task.crisis.migration' },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.crisis.safeguarding', {
    kind: 'milestone',
    once: true,
    weight: 8,
    title: 'The file that stopped',
    body: 'A case passed through three teams, including one of yours, and stopped somewhere it should not have. Everything about this is now urgent and nothing about it is now fixable.',
    conditions: { minLevel: 3, minTurn: 24, departments: ['social', 'inspection', 'legal'] },
    choices: [
      {
        id: 'front',
        label: 'Say plainly that it was ours',
        outcomes: [
          {
            weight: 1,
            text: 'You say it before anybody establishes it, which costs you the week and saves you the year. There is no version of this where anyone feels better.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 5 },
              { kind: 'stat', stat: 'stress', delta: 8 },
              { kind: 'spawnTask', templateId: 'task.crisis.safeguarding' },
            ],
          },
        ],
      },
      {
        id: 'establish',
        label: 'Establish the facts first',
        outcomes: [
          {
            weight: 1,
            text: 'Two days of careful reconstruction produce a timeline that is accurate, defensible, and two days later than the first press enquiry.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -4 },
              { kind: 'spawnTask', templateId: 'task.crisis.safeguarding' },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.crisis.clawback', {
    kind: 'milestone',
    once: true,
    weight: 8,
    title: 'The condition nobody read',
    body: 'A grant carried a condition about what the money could be spent on. Four years of spending happened. An auditor has now read the condition rather more closely than anybody did at the time.',
    conditions: { minLevel: 3, minTurn: 30, departments: ['finance', 'procurement', 'projects'] },
    choices: [
      {
        id: 'negotiate',
        label: 'Go and talk to the funder',
        conditions: { minStat: { politicalCapital: 20 } },
        outcomes: [
          {
            weight: 1,
            text: 'They are not unreasonable people and they are not going to write off four years. What you get is a process, which is better than a demand.',
            effects: [
              { kind: 'stat', stat: 'politicalCapital', delta: -10 },
              { kind: 'spawnTask', templateId: 'task.crisis.clawback' },
            ],
          },
        ],
      },
      {
        id: 'reconstruct',
        label: 'Rebuild the case from the records',
        outcomes: [
          {
            weight: 1,
            text: 'Somewhere in four years of files is the argument that most of this spending did meet the condition. Finding it is a job for somebody, and somebody is you.',
            effects: [{ kind: 'spawnTask', templateId: 'task.crisis.clawback' }],
          },
        ],
      },
    ],
  }),

  /* ------------------------------------------------- what missing one means */

  defineEvent('evt.crisis.inquiry_failed', {
    kind: 'followup',
    weight: 1,
    title: 'The findings',
    body: 'The report is published without your evidence in it, because your evidence did not arrive. It says so, in a paragraph that will be quoted for some years.',
    choices: [
      {
        id: 'accept',
        label: 'There is nothing to say',
        outcomes: [
          {
            weight: 1,
            text: 'There is nothing to say. You read it twice and put it in the drawer where that sort of thing goes.',
            effects: [{ kind: 'stat', stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'respond',
        label: 'Publish a response',
        outcomes: [
          {
            weight: 1,
            text: 'Your response is accurate, measured, and read by eleven people. It was still worth writing, mostly for you.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: 2 },
              { kind: 'stat', stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent('evt.crisis.safeguarding_failed', {
    kind: 'followup',
    weight: 1,
    title: 'The review',
    body: 'An independent review has been commissioned into how the case was handled, which is what happens when the internal one does not arrive in time. Your unit is named in the terms of reference.',
    choices: [
      {
        id: 'cooperate',
        label: 'Give them everything',
        outcomes: [
          {
            weight: 1,
            text: 'You give them everything, including the parts that make it worse. It is the only thing left that is yours to decide.',
            effects: [
              { kind: 'stat', stat: 'integrity', delta: 4 },
              { kind: 'teamMorale', delta: -8 },
            ],
          },
        ],
      },
      {
        id: 'protect',
        label: 'Protect the people who were carrying it',
        outcomes: [
          {
            weight: 1,
            text: 'You take the interviews yourself and keep two names out of the summary. Your unit notices, which is not nothing, and so does the review.',
            effects: [
              { kind: 'stat', stat: 'reputation', delta: -5 },
              { kind: 'teamMorale', delta: 10 },
            ],
          },
        ],
      },
    ],
  }),
];
