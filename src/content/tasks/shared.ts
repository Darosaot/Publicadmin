import { defineTask } from '../authoring';

/** Work that lands on every desk in the building, whatever your speciality. */
export const sharedTasks = [
  defineTask('task.shared.inbox', {
    title: 'Clear the inbox backlog',
    desc: 'Two hundred and forty unread messages, of which perhaps nine matter. Finding out which nine is the work.',
    departments: 'any',
    baseEffort: 4,
    deadlineRange: [2, 4],
    difficulty: 1,
    weight: 14,
  }),

  defineTask('task.shared.foi', {
    title: 'Transparency request',
    desc: 'A citizen has asked for every document relating to a decision taken four years ago. The clock started the moment it arrived.',
    departments: 'any',
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 11,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 }],
  }),

  defineTask('task.shared.committee_papers', {
    title: 'Committee papers',
    desc: 'The papers go out ten days before the meeting. They are, as always, not ready ten days before the meeting.',
    departments: 'any',
    baseEffort: 5,
    deadlineRange: [2, 3],
    difficulty: 1,
    weight: 12,
  }),

  defineTask('task.shared.appraisals', {
    title: 'Staff appraisal round',
    desc: 'Everyone in the unit needs a written assessment, a development objective, and half an hour of your undivided attention.',
    departments: 'any',
    minLevel: 2,
    baseEffort: 7,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 9,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.union_grievance', delayTurns: 2 }],
    },
  }),

  defineTask('task.shared.reorganisation', {
    title: 'Reorganisation consultation',
    desc: 'The structure is being redrawn again. Your department is asked to comment, which is not the same as being asked.',
    departments: 'any',
    baseEffort: 6,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 7,
  }),

  defineTask('task.shared.year_end_report', {
    title: 'Annual activity report',
    desc: 'Twelve months of work, compressed into a document that will be read by four people and cited by none.',
    departments: 'any',
    baseEffort: 8,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 8,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 2 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.reprimand', delayTurns: 1 }],
  }),
];
