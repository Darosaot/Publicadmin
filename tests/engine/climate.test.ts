import { describe, expect, it } from 'vitest';
import {
  CLIMATE_MAX,
  CLIMATE_MIN,
  ELECTION_TERM_MONTHS,
  STANCE_FISCAL_LEAN,
  STANCE_TRUST_LEAN,
} from '../../src/engine/constants';
import {
  ELECTION_EVENT_ID,
  bodyDriftFactor,
  budgetFactor,
  climateBand,
  climateOf,
  createClimate,
  driftClimate,
  initiativeEffortFactor,
  reputationDecayDelta,
} from '../../src/engine/climate';
import { applyEffects } from '../../src/engine/effects';
import { createGame } from '../../src/engine/newGame';
import { STANCES, type GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 3 }, registry);
  return { ...base, ...overrides };
}

function withClimate(state: GameState, fiscal: number, trust: number): GameState {
  return { ...state, climate: { ...climateOf(state), fiscal, trust } };
}

describe('a country to start in', () => {
  it('starts part way through a term rather than on day one of one', () => {
    // A player whose first election is always in exactly four years has been told something about
    // the shape of the game that is not true of any of the later ones.
    const terms = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => createClimate(s).climate.monthsToElection),
    );
    expect(terms.size).toBeGreaterThan(1);
    for (const t of terms) expect(t).toBeLessThanOrEqual(ELECTION_TERM_MONTHS);
  });
});

describe('the dials', () => {
  it('stay inside their range however hard they are pushed', () => {
    let state = withClimate(game(), CLIMATE_MAX, CLIMATE_MIN);
    for (let i = 0; i < 400; i += 1) state = driftClimate(state, 1);

    expect(state.climate!.fiscal).toBeGreaterThanOrEqual(CLIMATE_MIN);
    expect(state.climate!.fiscal).toBeLessThanOrEqual(CLIMATE_MAX);
    expect(state.climate!.trust).toBeGreaterThanOrEqual(CLIMATE_MIN);
    expect(state.climate!.trust).toBeLessThanOrEqual(CLIMATE_MAX);
  });

  /**
   * The rule the whole system rests on, and the one it failed on its first draft.
   *
   * A dial with a net drift is not weather — it is a difficulty setting applied to every other
   * guardrail at once, and they would move with it rather than catch it. The first version gave
   * every new government +12 trust; at 7.6 elections a career that made mean trust +4.00, trust
   * suppresses reputation decay, and the whole sweep came out four points of reputation ahead for
   * no reason anybody had chosen.
   */
  it('averages out over a career', () => {
    let fiscal = 0;
    let trust = 0;
    let months = 0;

    for (let seed = 1; seed <= 80; seed += 1) {
      let state: GameState = game({ ...createGame({ name: 'B', department: 'finance', seed }, registry) });
      for (let m = 0; m < 360; m += 1) {
        state = driftClimate(state, 1);
        fiscal += state.climate!.fiscal;
        trust += state.climate!.trust;
        months += 1;
      }
    }

    expect(Math.abs(fiscal / months)).toBeLessThan(3);
    expect(Math.abs(trust / months)).toBeLessThan(3);
  });

  /** Uniform stances mean a column's mean is the dial's resting point. It has to be nothing. */
  it('has stance leans that sum to zero, by construction', () => {
    const fiscal = STANCES.reduce((t, s) => t + (STANCE_FISCAL_LEAN[s] ?? 0), 0);
    const trust = STANCES.reduce((t, s) => t + (STANCE_TRUST_LEAN[s] ?? 0), 0);
    expect(fiscal).toBe(0);
    expect(trust).toBe(0);
  });

  /**
   * Mean reversion is multiplicative and therefore path-dependent, so the clock a player happens
   * to be on must not change how fast the country moves — only how often they look at it. This is
   * the same argument `driftWorld` makes for stepping a month at a time.
   */
  it('moves the same distance whether it is read monthly or per cycle', () => {
    const start = withClimate(game(), 40, -30);

    let monthly = start;
    for (let i = 0; i < 6; i += 1) monthly = driftClimate(monthly, 1);
    const atOnce = driftClimate(start, 6);

    expect(atOnce.climate).toEqual(monthly.climate);
  });
});

describe('an election', () => {
  it('changes the government and schedules the scene', () => {
    const eve = { ...game(), climate: { ...climateOf(game()), monthsToElection: 1 } };
    const after = driftClimate(eve, 1);

    expect(after.climate!.administration).toBe(eve.climate!.administration + 1);
    expect(after.climate!.monthsToElection).toBe(ELECTION_TERM_MONTHS);
    expect(after.scheduledEvents.some((s) => s.eventId === ELECTION_EVENT_ID)).toBe(true);
  });

  /** A government that has just arrived has not been believed or disbelieved. That is zero. */
  it('resets trust toward nothing rather than crediting goodwill nobody earned', () => {
    const eve = withClimate(game(), 0, 80);
    const after = driftClimate({ ...eve, climate: { ...eve.climate!, monthsToElection: 1 } }, 1);

    expect(after.climate!.trust).toBeLessThan(80);
    expect(after.climate!.trust).toBeGreaterThanOrEqual(0);
  });
});

describe('what the weather is worth', () => {
  it('reads neutral, and moves nothing, for a career that has none', () => {
    const none: GameState = { ...game(), climate: undefined };

    expect(budgetFactor(none)).toBe(1);
    expect(reputationDecayDelta(none)).toBeCloseTo(0);
    expect(initiativeEffortFactor(none)).toBe(1);
    expect(bodyDriftFactor(none)).toBe(1);
    expect(driftClimate(none, 12).climate).toBeUndefined();
  });

  it('funds a unit better in a generous year and worse in an austere one', () => {
    expect(budgetFactor(withClimate(game(), 100, 0))).toBeGreaterThan(1);
    expect(budgetFactor(withClimate(game(), -100, 0))).toBeLessThan(1);
  });

  it('eats reputation faster when nobody believes the administration', () => {
    expect(reputationDecayDelta(withClimate(game(), 0, -100))).toBeGreaterThan(0);
    expect(reputationDecayDelta(withClimate(game(), 0, 100))).toBeLessThan(0);
  });

  it('makes an undertaking dearer to move when nothing is being funded', () => {
    expect(initiativeEffortFactor(withClimate(game(), -100, 0))).toBeGreaterThan(1);
  });

  it('accelerates the country falling apart, without ever speeding a rescue up', () => {
    // Only the downward half is weather-sensitive: a place somebody else is improving has no
    // reason to improve faster because the settlement was generous.
    expect(bodyDriftFactor(withClimate(game(), -100, 0))).toBeGreaterThan(1);
  });

  it('describes a dial rather than scoring it', () => {
    expect(climateBand(-80)).toBe('low');
    expect(climateBand(0)).toBe('level');
    expect(climateBand(80)).toBe('high');
  });
});

describe('content moving the national mood', () => {
  it('applies, and clamps', () => {
    const moved = applyEffects(withClimate(game(), 0, 0), [{ kind: 'climate', dial: 'trust', delta: 9 }], registry);
    expect(moved.climate!.trust).toBe(9);

    const pinned = applyEffects(
      withClimate(game(), 0, CLIMATE_MAX),
      [{ kind: 'climate', dial: 'trust', delta: 50 }],
      registry,
    );
    expect(pinned.climate!.trust).toBe(CLIMATE_MAX);
  });

  /** A no-op without a climate, exactly as the management effects are without a unit. */
  it('is harmless for a career that has no weather', () => {
    const none: GameState = { ...game(), climate: undefined };
    expect(applyEffects(none, [{ kind: 'climate', dial: 'fiscal', delta: 20 }], registry).climate).toBeUndefined();
  });
});
