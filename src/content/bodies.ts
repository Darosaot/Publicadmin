import type { Condition, DepartmentId, Effect } from '../engine/types';
import { text } from './authoring';

/**
 * The country you work in.
 *
 * The career tree already names nine organisations, but only as the place your desk happens to be.
 * These are the same institutions treated as **places that exist** — each with a condition that
 * says how well it is actually run, a standing that says how it regards you, and a drift that
 * moves both whether or not you are looking at them.
 *
 * Stored the way the cast is stored, and for the same reason: `flags` is already cloned by
 * `cloneState`, already gated by `minFlag`/`maxFlag`, and already persisted. A `bodies` record on
 * `GameState` would buy type safety over two numbers in exchange for a migration, a clone line and
 * a second gating vocabulary in `Condition`.
 *
 * **Flags hold deviation, not the absolute.** `flagValue` reads an unset flag as 0, so an unset
 * body is one nobody has touched — exactly as founded. That is what lets this ship without a save
 * migration: every career saved before the country existed is already correct.
 */
export interface Body {
  id: string;
  /** A proper noun, so a literal string rather than a key — translating it would be wrong. */
  name: string;
  kindKey: string;
  blurbKey: string;
  /** Where in the state this body sits when nobody has touched it. */
  baselineCondition: number;
  /**
   * Where it drifts on its own, per calendar month.
   *
   * Not every institution is stable. A body with a negative drift is quietly getting worse while
   * you are busy elsewhere, which is the whole argument for going to look.
   */
  drift: number;
  /** Which department is most likely to deal with it. Used to weight where you hear about it. */
  beat: DepartmentId;

  /** Where the two scores live. */
  conditionFlag: string;
  standingFlag: string;
  knownFlag: string;

  /* ------------------------------------------------- effects, for content */

  /** Moves how well the place is run. */
  improve(delta: number): Effect;
  /** Moves how it regards you. */
  regard(delta: number): Effect;
  /** Records that you have actually looked at it. */
  visit(): Effect[];

  /* ---------------------------------------------- conditions, for content */

  known: Condition;
  unknown: Condition;
  /** Running better than it was founded at, by `margin` or more. */
  improved(margin?: number): Condition;
  /** Running worse. The reason most initiatives exist. */
  failing(margin?: number): Condition;
  /** They would take your call. */
  friendly(threshold?: number): Condition;
  /** They would not. */
  hostile(threshold?: number): Condition;
}

function body(
  id: string,
  name: string,
  kind: string,
  blurb: string,
  baselineCondition: number,
  drift: number,
  beat: DepartmentId,
): Body {
  const conditionFlag = `body.${id}.cond`;
  const standingFlag = `body.${id}.stand`;
  const knownFlag = `body.${id}.known`;

  return {
    id,
    name,
    kindKey: text(`body.${id}.kind`, kind),
    blurbKey: text(`body.${id}.blurb`, blurb),
    baselineCondition,
    drift,
    beat,

    conditionFlag,
    standingFlag,
    knownFlag,

    improve: (delta) => ({ kind: 'flagDelta', flag: conditionFlag, delta }),
    regard: (delta) => ({ kind: 'flagDelta', flag: standingFlag, delta }),
    visit: () => [{ kind: 'flag', flag: knownFlag }],

    known: { requiredFlags: [knownFlag] },
    unknown: { forbiddenFlags: [knownFlag] },
    improved: (margin = 8) => ({ minFlag: { [conditionFlag]: margin } }),
    failing: (margin = -8) => ({ maxFlag: { [conditionFlag]: margin } }),
    friendly: (threshold = 15) => ({ minFlag: { [standingFlag]: threshold } }),
    hostile: (threshold = -15) => ({ maxFlag: { [standingFlag]: threshold } }),
  };
}

/* ------------------------------------------------------------------ local */

export const alderford = body(
  'alderford',
  'Alderford City Council',
  'City council, eighteen thousand people',
  'Where you started. Small enough that one competent person changes it and one bad appointment breaks it, and it has had both since you left.',
  52,
  -0.04,
  'legal',
);

export const northbridge = body(
  'northbridge',
  'Northbridge City Council',
  'City council, a hundred and forty thousand people',
  'Big enough to have a structure chart and small enough that the structure chart is not the whole truth. Competently run, in the way a place is when nobody has had a reason to look closely.',
  58,
  -0.02,
  'policy',
);

export const eastmoor = body(
  'eastmoor',
  'Eastmoor District Council',
  'District council, and struggling',
  'Three chief executives in six years. Everyone in the region knows it is in trouble and nobody has been able to say precisely what the trouble is, which is usually the trouble.',
  34,
  -0.09,
  'inspection',
);

export const kesswater = body(
  'kesswater',
  'Kesswater Care Trust',
  'Adult social care, eleven sites',
  'Two hundred people depend on it and it has been cheap for four years running. Both of those facts are in the same sentence for a reason.',
  41,
  -0.07,
  'social',
);

/* --------------------------------------------------------------- regional */

export const region = body(
  'region',
  'Regional Government of Valmara',
  'The regional tier',
  'Where policy stops being an argument and starts being a budget line. Large, slow, and the place most careers in this country pass through at least once.',
  60,
  0.0,
  'policy',
);

export const transport = body(
  'transport',
  'Valmara Transport Authority',
  'Regional transport',
  'Runs on capital projects that outlast the people who approved them, which means its real condition is always about eight years behind what its reports say.',
  48,
  -0.03,
  'projects',
);

export const housing = body(
  'housing',
  'Valmara Housing Agency',
  'Social housing',
  'A waiting list, a maintenance backlog, and a board that has been asking the same question about both for a decade without ever quite writing it down.',
  44,
  -0.05,
  'finance',
);

/* --------------------------------------------------------------- national */

export const agency = body(
  'agency',
  'National Agency for Public Investment',
  'Capital programmes',
  'Where the money for everything visible comes from. Reasonably well run and permanently one reorganisation behind what it has been asked to do.',
  62,
  -0.01,
  'projects',
);

export const procurementService = body(
  'procurement_service',
  'National Procurement Service',
  'Framework agreements',
  'Buys on behalf of everyone so that nobody has to buy badly on their own. Whether that has worked is the sort of question its own annual report is not designed to answer.',
  55,
  -0.02,
  'procurement',
);

export const ministry = body(
  'ministry',
  'Ministry of Territorial Administration',
  'The department',
  'The centre. Its condition is mostly the condition of whoever is running it, which is why the number moves more here than anywhere else in the country.',
  63,
  0.0,
  'policy',
);

export const audit = body(
  'audit',
  'National Audit Authority',
  'External audit',
  'Reads everything, changes little directly, and changes a great deal by existing. The one institution whose condition nobody outside it thinks about until it slips.',
  71,
  -0.01,
  'finance',
);

export const inspectorate = body(
  'inspectorate',
  'Public Services Inspectorate',
  'Inspection',
  'Arrives, looks, writes it down. Its findings are only worth what its own rigour is worth, which makes it the one body in the country that has to be better run than the ones it judges.',
  68,
  -0.02,
  'inspection',
);

export const ombudsman = body(
  'ombudsman',
  'Office of the Ombudsman',
  'The last resort',
  'Four thousand complaints a year from people who have already tried everywhere else. It can examine perhaps two hundred properly, and deciding which two hundred is the whole institution.',
  66,
  -0.02,
  'social',
);

export const cabinet = body(
  'cabinet',
  'Office of the Council of Ministers',
  'The centre of government',
  'Small, fast, and staffed by people who will not be there in three years. Everything that reaches it has already been decided by somebody; its condition is how well it knows by whom.',
  59,
  0.0,
  'legal',
);

export const bodies: Body[] = [
  alderford,
  northbridge,
  eastmoor,
  kesswater,
  region,
  transport,
  housing,
  agency,
  procurementService,
  ministry,
  audit,
  inspectorate,
  ombudsman,
  cabinet,
];

export const bodyRegistry: Record<string, Body> = Object.fromEntries(
  bodies.map((entry) => [entry.id, entry]),
);
