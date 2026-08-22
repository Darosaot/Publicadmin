/**
 * The weather over the whole country.
 *
 * Everything else in this game is something the player does, or something done to the player. The
 * climate is neither. It is the conditions the work happens in — whether there is money, whether
 * anybody believes the administration, who is in government — and it moves whether or not anybody
 * is looking at it.
 *
 * It is the answer to the one thing every city builder puts on screen and never lets you hide: a
 * permanent, legible signal of what the world currently wants, which you can read and cannot
 * argue with. Before this, two careers in the same department differed only by dice. An austere
 * year and a generous one now play differently, and the player can see which one they are in.
 *
 * ### Why it runs on the state's own RNG cursor
 *
 * `driftWorld` is deliberately RNG-free, because a body's tendencies are a property of the
 * institution and randomising them would mean two careers on the same seed could not be compared.
 * That argument does not transfer. Weather genuinely is stochastic, and running it through
 * `state.rngState` — the same cursor everything else uses, saved with the game — keeps the
 * property that actually matters: the same seed produces the same weather, every time.
 *
 * ### The rule that keeps the sweep meaningful
 *
 * **Both dials must average out over a career.** A dial with a net drift is not weather; it is a
 * difficulty setting applied to every other guardrail simultaneously, and they would move with it
 * rather than catch it. That is what the mean reversion in `driftClimate` is for, and there is a
 * test asserting a career's mean climate comes out near zero.
 *
 * ### It is also what finally makes the country responsive
 *
 * For three versions `bodyStanding` had no mechanical consequence anywhere, and no engine
 * mechanic read a body's condition at all: the country was a screen. Austerity now accelerates
 * the decline the bodies were already written to have, which makes the two systems one.
 */

import {
  CLIMATE_BODY_DRIFT_SWING,
  CLIMATE_BUDGET_SWING,
  CLIMATE_INITIATIVE_EFFORT_SWING,
  CLIMATE_MAX,
  CLIMATE_MIN,
  CLIMATE_REVERSION_RATE,
  CLIMATE_SHOCK_MAX,
  CLIMATE_TRUST_DECAY_SWING,
  ELECTION_FISCAL_SWING,
  ELECTION_TERM_MONTHS,
  ELECTION_TRUST_RESET,
  STANCE_FISCAL_LEAN,
  STANCE_TRUST_LEAN,
} from './constants';
import { nextInt, nextRange, pick } from './rng';
import { STANCES, type ClimateState, type GameState, type Stance } from './types';

/** The milestone a change of government fires. `validate.ts` insists the corpus defines it. */
export const ELECTION_EVENT_ID = 'evt.milestone.election';

/**
 * What every hook reads when a career has no weather.
 *
 * Zero on both dials is not a placeholder: the dials are centred on zero precisely so that "an
 * ordinary year under an ordinary government" is a real reading rather than an arbitrary number
 * in the middle. A career without a climate therefore behaves exactly as it did before the
 * climate existed, with no branch anywhere except this one.
 */
const NEUTRAL: ClimateState = {
  fiscal: 0,
  trust: 0,
  administration: 1,
  stance: 'consolidating',
  monthsToElection: ELECTION_TERM_MONTHS,
};

export function climateOf(state: GameState): ClimateState {
  return state.climate ?? NEUTRAL;
}

export function clampClimate(value: number): number {
  return Math.max(CLIMATE_MIN, Math.min(CLIMATE_MAX, value));
}

/**
 * A country to start in.
 *
 * The term is part-served rather than fresh, because a career does not begin the day a government
 * does, and a player whose first election is always in exactly four years has been told something
 * about the shape of the game that is not true of any of the later ones.
 */
export function createClimate(rngState: number): { climate: ClimateState; rngState: number } {
  const stanceRoll = pick(rngState, STANCES);
  const termRoll = nextInt(stanceRoll.rngState, 6, ELECTION_TERM_MONTHS);
  const fiscalRoll = nextRange(termRoll.rngState, -12, 12);
  const trustRoll = nextRange(fiscalRoll.rngState, -12, 12);

  return {
    climate: {
      fiscal: Math.round(fiscalRoll.value),
      trust: Math.round(trustRoll.value),
      administration: 1,
      stance: stanceRoll.value ?? 'consolidating',
      monthsToElection: termRoll.value,
    },
    rngState: trustRoll.rngState,
  };
}

/**
 * Moves the country on by the months just worked.
 *
 * One month at a time, for the same reason `driftWorld` steps monthly: mean reversion is
 * multiplicative and therefore path-dependent, so applying six months in one step would move the
 * climate further than six separate months would. The clock a player happens to be on must not
 * change the weather — only how often they look at it.
 *
 * Returns the state with an election queued if one fell in this stretch, so the government
 * changing is a scene rather than a number quietly moving on the stats bar.
 */
export function driftClimate(state: GameState, months: number): GameState {
  if (months <= 0 || !state.climate) return state;

  let climate = { ...state.climate };
  let rngState = state.rngState;
  let elected = false;

  for (let month = 0; month < months; month += 1) {
    // Where the government of the day is pulling, plus a shock nobody planned.
    const fiscalPull = (STANCE_FISCAL_LEAN[climate.stance] ?? 0) - climate.fiscal;
    const trustPull = (STANCE_TRUST_LEAN[climate.stance] ?? 0) - climate.trust;

    const fiscalShock = nextRange(rngState, -CLIMATE_SHOCK_MAX, CLIMATE_SHOCK_MAX);
    const trustShock = nextRange(fiscalShock.rngState, -CLIMATE_SHOCK_MAX, CLIMATE_SHOCK_MAX);
    rngState = trustShock.rngState;

    climate.fiscal = clampClimate(
      climate.fiscal + fiscalPull * CLIMATE_REVERSION_RATE + fiscalShock.value,
    );
    climate.trust = clampClimate(
      climate.trust + trustPull * CLIMATE_REVERSION_RATE + trustShock.value,
    );

    climate.monthsToElection -= 1;
    if (climate.monthsToElection > 0) continue;

    // An election. A new government arrives with a swing in the money and a bounce in the
    // benefit of the doubt, and then has to spend both.
    const stanceRoll = pick(rngState, STANCES);
    const swingRoll = nextRange(stanceRoll.rngState, -ELECTION_FISCAL_SWING, ELECTION_FISCAL_SWING);
    rngState = swingRoll.rngState;

    climate = {
      fiscal: clampClimate(climate.fiscal + swingRoll.value),
      // Toward nothing, not upward. A government that has just arrived has not been believed or
      // disbelieved yet, and crediting it with goodwill it has not earned put a permanent
      // discount on reputation decay for every career in the game.
      trust: clampClimate(climate.trust * (1 - ELECTION_TRUST_RESET)),
      administration: climate.administration + 1,
      stance: stanceRoll.value ?? climate.stance,
      monthsToElection: ELECTION_TERM_MONTHS,
    };
    elected = true;
  }

  const next: GameState = { ...state, climate, rngState };
  if (!elected) return next;

  return {
    ...next,
    scheduledEvents: [...next.scheduledEvents, { eventId: ELECTION_EVENT_ID, onTurn: next.turn }],
  };
}

/* ------------------------------------------------------------------- hooks
 *
 * Every one of these is a small multiple of a dial at full deflection, and "small" is load-bearing.
 * They sit on the two things the whole game is tuned against — the decay rates and the unit
 * budget. The climate is meant to change which years are hard, not which careers are possible.
 */

/** What a unit's monthly allocation is actually worth this year. */
export function budgetFactor(state: GameState): number {
  return 1 + (climateOf(state).fiscal / CLIMATE_MAX) * CLIMATE_BUDGET_SWING;
}

/**
 * How much faster reputation fades when nobody believes the administration.
 *
 * Added to `REPUTATION_DECAY_RATE`, so a trusted year makes standing keep a little better and a
 * distrusted one eats it. Public trust is what a reputation inside the public service is
 * denominated in; when the currency is weak, so is the holding.
 */
export function reputationDecayDelta(state: GameState): number {
  return -(climateOf(state).trust / CLIMATE_MAX) * CLIMATE_TRUST_DECAY_SWING;
}

/** What an undertaking costs to move: more, in a year when nothing is being funded. */
export function initiativeEffortFactor(state: GameState): number {
  return 1 - (climateOf(state).fiscal / CLIMATE_MAX) * CLIMATE_INITIATIVE_EFFORT_SWING;
}

/**
 * How much faster the country falls apart on its own this month.
 *
 * Multiplies only *negative* drift, so austerity accelerates decline without a generous year
 * spontaneously improving institutions nobody has touched. Places get worse on their own; they
 * still get better only because somebody did something.
 */
export function bodyDriftFactor(state: GameState): number {
  return 1 - (climateOf(state).fiscal / CLIMATE_MAX) * CLIMATE_BODY_DRIFT_SWING;
}

/** The band a dial is currently in, for a screen that describes rather than scores. */
export function climateBand(value: number): 'low' | 'below' | 'level' | 'above' | 'high' {
  if (value <= -45) return 'low';
  if (value <= -15) return 'below';
  if (value < 15) return 'level';
  if (value < 45) return 'above';
  return 'high';
}

export function stanceOf(state: GameState): Stance {
  return climateOf(state).stance;
}
