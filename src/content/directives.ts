import { directiveFlag } from '../engine/directives';
import { text } from './authoring';

/**
 * How you run an office.
 *
 * Three questions every public manager answers, whether or not they ever say so out loud. The
 * game asks them explicitly, keeps the answer until it is changed, and never tells the player
 * which pole is correct — because neither is. Each has produced excellent offices and each has
 * produced disasters, usually the same one applied for too long.
 *
 * Stored as a numeric flag per directive: 0 undecided, 1 the first pole, 2 the second. The engine
 * reads them through `src/engine/directives.ts`; content gates on them with `minFlag`/`maxFlag`
 * exactly as it gates on anything else.
 */
export interface Directive {
  id: string;
  flag: string;
  nameKey: string;
  blurbKey: string;
  poles: [DirectivePole, DirectivePole];
}

export interface DirectivePole {
  /** 1 or 2 — the value written to the flag. */
  stance: 1 | 2;
  labelKey: string;
  effectKey: string;
}

function directive(
  id: string,
  name: string,
  blurb: string,
  first: { label: string; effect: string },
  second: { label: string; effect: string },
): Directive {
  return {
    id,
    flag: directiveFlag(id),
    nameKey: text(`directive.${id}.name`, name),
    blurbKey: text(`directive.${id}.blurb`, blurb),
    poles: [
      {
        stance: 1,
        labelKey: text(`directive.${id}.a`, first.label),
        effectKey: text(`directive.${id}.a_effect`, first.effect),
      },
      {
        stance: 2,
        labelKey: text(`directive.${id}.b`, second.label),
        effectKey: text(`directive.${id}.b_effect`, second.effect),
      },
    ],
  };
}

export const hours = directive(
  'hours',
  'Pressure',
  'A month’s load has to land somewhere. Nobody writes this policy down and everybody has one — it is set by what you do at seven in the evening, not by what you say at the away day.',
  {
    label: 'Take it yourself',
    effect: 'Your people keep their morale. You carry it.',
  },
  {
    label: 'Pass it down',
    effect: 'You carry less. They carry it, and eventually they leave.',
  },
);

export const rigour = directive(
  'rigour',
  'Rigour',
  'Whether a decision is finished when it is made or when it is written down. The answer determines what survives you and how much of it there is.',
  {
    label: 'Document everything',
    effect: 'Better work. Every file takes a point longer.',
  },
  {
    label: 'Move fast',
    effect: 'Every file takes a point less. The quality shows it.',
  },
);

export const hiring = directive(
  'hiring',
  'Recruitment',
  'Who you appoint when two candidates are equally plausible and one of them has done the job before.',
  {
    label: 'Hire for potential',
    effect: 'Keener, less able. They grow into it, over years.',
  },
  {
    label: 'Hire for experience',
    effect: 'Able on arrival, and about as good as they will get.',
  },
);

export const directives: Directive[] = [hours, rigour, hiring];
