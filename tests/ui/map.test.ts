import { describe, expect, it } from 'vitest';
import { bodies } from '../../src/content';
import { registry } from '../../src/content';
import { createGame } from '../../src/engine/newGame';
import { bodyKnown } from '../../src/engine/world';
import { bandFor, bodyOfPost } from '../../src/ui/components/ValmaraMap';
import { DEPARTMENT_IDS } from '../../src/engine/types';

describe('placing a post on the map', () => {
  /**
   * The convention every post id has followed since the career tree was a ladder, and which
   * nothing read until the map went in. `validate.ts` enforces it; this checks the reader agrees
   * with the enforcement.
   */
  it('finds the institution for every post in the tree', () => {
    for (const post of registry.posts) {
      const id = bodyOfPost(post.id);
      expect(bodies.some((b) => b.id === id), `no body for ${post.id}`).toBe(true);
    }
  });

  it('is harmless on an id that is not one', () => {
    expect(bodyOfPost('nonsense')).toBe('');
  });
});

describe('reading a condition as a colour', () => {
  it('bands the whole range without a gap', () => {
    expect(bandFor(100)).toBe('strong');
    expect(bandFor(75)).toBe('strong');
    expect(bandFor(74)).toBe('sound');
    expect(bandFor(58)).toBe('sound');
    expect(bandFor(57)).toBe('strained');
    expect(bandFor(42)).toBe('strained');
    expect(bandFor(41)).toBe('failing');
    expect(bandFor(25)).toBe('failing');
    expect(bandFor(24)).toBe('collapsing');
    expect(bandFor(0)).toBe('collapsing');
  });
});

describe('what a new career can already see', () => {
  /**
   * The bug the map exposed and nothing else could: a Special Adviser at the Council of Ministers
   * was shown their own workplace as a blank dot marked "never been", because the Cabinet Office
   * is on the legal beat and they were on the policy one. Nobody has to go and look at their own
   * desk.
   */
  it('knows the building it is sitting in, whatever the department', () => {
    for (const department of DEPARTMENT_IDS) {
      const game = createGame({ name: 'T', department, seed: 3 }, registry);
      const here = bodies.find((b) => b.id === bodyOfPost(game.player.postId));

      expect(here, `no body for the starting post on ${department}`).toBeDefined();
      expect(bodyKnown(game, here!), `${department} does not know its own office`).toBe(true);
    }
  });

  /** And not the whole country, which is the other half of what the fog is for. */
  it('does not know the country it has never been to', () => {
    const game = createGame({ name: 'T', department: 'finance', seed: 3 }, registry);
    const unknown = bodies.filter((b) => !bodyKnown(game, b));
    expect(unknown.length).toBeGreaterThan(bodies.length / 2);
  });
});

describe('the map as a drawing', () => {
  it('gives every institution somewhere to be, and a name that fits', () => {
    for (const body of bodies) {
      expect(body.x).toBeGreaterThan(0);
      expect(body.y).toBeGreaterThan(0);
      expect(body.short.length).toBeGreaterThan(0);
      // Long enough to be a name, short enough not to be a smear at map scale.
      expect(body.short.length).toBeLessThanOrEqual(16);
      expect(['local', 'regional', 'national']).toContain(body.region);
    }
  });

  /** The layout is meant to read as a country: capital north, councils south. */
  it('puts the tiers where the fiction says they are', () => {
    const mean = (r: string) => {
      const set = bodies.filter((b) => b.region === r);
      return set.reduce((t, b) => t + b.y, 0) / set.length;
    };
    expect(mean('national')).toBeLessThan(mean('regional'));
    expect(mean('regional')).toBeLessThan(mean('local'));
  });
});
