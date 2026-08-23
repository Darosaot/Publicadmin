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
/** The three tiers of Valmara, from the desk you start at to the room you might end in. */
export type Region = 'local' | 'regional' | 'national';

export interface Body {
  id: string;
  /** A proper noun, so a literal string rather than a key — translating it would be wrong. */
  name: string;
  /**
   * What it is called on a map, where "National Agency for Public Investment" is a smear.
   *
   * Authored rather than derived. The first version trimmed the full name with a regex and
   * produced "Ministry of" and "Government of" — which is what happens every time a proper noun
   * is treated as a pattern. These are also what people actually call these places, and they
   * match the `org_short` the career tree already uses for the same institutions.
   */
  short: string;
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

  /**
   * Where it is, on a 0–100 map of Valmara.
   *
   * Content rather than engine: nothing in the simulation reads these, and nothing should. They
   * exist so the country can be drawn as a country instead of listed as a sorted set of cards,
   * which is what it was for three versions — fourteen institutions with a condition, a standing
   * and a drift, rendered as a list that could not show you the one thing a list cannot: that
   * there is more of this place than you have been to.
   *
   * The layout is not decorative. The capital sits north, the regional tier across the middle,
   * the councils south — so the shape of a career reads off the map as a walk inward and upward,
   * and Eastmoor being a long way from anybody who might have noticed is a fact you can see.
   */
  x: number;
  y: number;
  /** Which tier of the state it belongs to. Drives the map's legend and its grouping. */
  region: Region;

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
  short: string,
  kind: string,
  blurb: string,
  baselineCondition: number,
  drift: number,
  beat: DepartmentId,
  where: { x: number; y: number; region: Region },
): Body {
  const conditionFlag = `body.${id}.cond`;
  const standingFlag = `body.${id}.stand`;
  const knownFlag = `body.${id}.known`;

  return {
    id,
    name,
    short,
    kindKey: text(`body.${id}.kind`, kind),
    blurbKey: text(`body.${id}.blurb`, blurb),
    baselineCondition,
    drift,
    beat,
    x: where.x,
    y: where.y,
    region: where.region,

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
  'Alderford',
  'City council, eighteen thousand people',
  // Written in the present, because Alderford is on the legal beat and so is on screen from the
  // player's first month — when they are sitting in it. An earlier draft said "since you left",
  // which the header directly above it contradicted in January of year one.
  'Where every career in this country starts. Small enough that one competent person changes it and one bad appointment breaks it, and it has had plenty of both.',
  52,
  -0.04,
  'legal',
  { x: 30, y: 76, region: 'local' },
);

export const northbridge = body(
  'northbridge',
  'Northbridge City Council',
  'Northbridge',
  'City council, a hundred and forty thousand people',
  'Big enough to have a structure chart and small enough that the structure chart is not the whole truth. Competently run, in the way a place is when nobody has had a reason to look closely.',
  58,
  -0.02,
  'policy',
  { x: 55, y: 68, region: 'local' },
);

export const eastmoor = body(
  'eastmoor',
  'Eastmoor District Council',
  'Eastmoor',
  'District council, and struggling',
  'Three chief executives in six years. Everyone in the region knows it is in trouble and nobody has been able to say precisely what the trouble is, which is usually the trouble.',
  34,
  -0.09,
  'inspection',
  { x: 68, y: 81, region: 'local' },
);

export const kesswater = body(
  'kesswater',
  'Kesswater Care Trust',
  'Kesswater',
  'Adult social care, eleven sites',
  'Two hundred people depend on it and it has been cheap for four years running. Both of those facts are in the same sentence for a reason.',
  41,
  -0.07,
  'social',
  { x: 42, y: 88, region: 'local' },
);

/* --------------------------------------------------------------- regional */

export const region = body(
  'region',
  'Regional Government of Valmara',
  'The Region',
  'The regional tier',
  'Where policy stops being an argument and starts being a budget line. Large, slow, and the place most careers in this country pass through at least once.',
  60,
  0.0,
  'policy',
  { x: 46, y: 49, region: 'regional' },
);

export const transport = body(
  'transport',
  'Valmara Transport Authority',
  'Transport',
  'Regional transport',
  'Runs on capital projects that outlast the people who approved them, which means its real condition is always about eight years behind what its reports say.',
  48,
  -0.03,
  'projects',
  { x: 63, y: 53, region: 'regional' },
);

export const housing = body(
  'housing',
  'Valmara Housing Agency',
  'Housing',
  'Social housing',
  'A waiting list, a maintenance backlog, and a board that has been asking the same question about both for a decade without ever quite writing it down.',
  44,
  -0.05,
  'finance',
  { x: 32, y: 56, region: 'regional' },
);

/* --------------------------------------------------------------- national */

export const agency = body(
  'agency',
  'National Agency for Public Investment',
  'The Agency',
  'Capital programmes',
  'Where the money for everything visible comes from. Reasonably well run and permanently one reorganisation behind what it has been asked to do.',
  62,
  -0.01,
  'projects',
  { x: 36, y: 33, region: 'national' },
);

export const procurementService = body(
  'procurement_service',
  'National Procurement Service',
  'Procurement',
  'Framework agreements',
  'Buys on behalf of everyone so that nobody has to buy badly on their own. Whether that has worked is the sort of question its own annual report is not designed to answer.',
  55,
  -0.02,
  'procurement',
  { x: 62, y: 31, region: 'national' },
);

export const ministry = body(
  'ministry',
  'Ministry of Territorial Administration',
  'The Ministry',
  'The department',
  'The centre. Its condition is mostly the condition of whoever is running it, which is why the number moves more here than anywhere else in the country.',
  63,
  0.0,
  'policy',
  { x: 44, y: 22, region: 'national' },
);

export const audit = body(
  'audit',
  'National Audit Authority',
  'Audit',
  'External audit',
  'Reads everything, changes little directly, and changes a great deal by existing. The one institution whose condition nobody outside it thinks about until it slips.',
  71,
  -0.01,
  'finance',
  { x: 70, y: 21, region: 'national' },
);

export const inspectorate = body(
  'inspectorate',
  'Public Services Inspectorate',
  'Inspectorate',
  'Inspection',
  'Arrives, looks, writes it down. Its findings are only worth what its own rigour is worth, which makes it the one body in the country that has to be better run than the ones it judges.',
  68,
  -0.02,
  'inspection',
  { x: 29, y: 16, region: 'national' },
);

export const ombudsman = body(
  'ombudsman',
  'Office of the Ombudsman',
  'Ombudsman',
  'The last resort',
  'Four thousand complaints a year from people who have already tried everywhere else. It can examine perhaps two hundred properly, and deciding which two hundred is the whole institution.',
  66,
  -0.02,
  'social',
  { x: 75, y: 38, region: 'national' },
);

export const cabinet = body(
  'cabinet',
  'Office of the Council of Ministers',
  'Cabinet Office',
  'The centre of government',
  'Small, fast, and staffed by people who will not be there in three years. Everything that reaches it has already been decided by somebody; its condition is how well it knows by whom.',
  59,
  0.0,
  'legal',
  { x: 58, y: 12, region: 'national' },
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
