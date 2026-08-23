import { bodies } from '../../content';
import type { Body } from '../../content/bodies';
import { bodyCondition, bodyKnown, bodyStanding } from '../../engine/world';
import type { GameState } from '../../engine/types';
import { useT, type Translate } from '../../i18n';

/**
 * Valmara, drawn.
 *
 * The country has had a condition, a standing and a drift per institution since v2, and was
 * rendered as a sorted list of cards — which could show you everything about the places you had
 * been and nothing at all about the one thing a list structurally cannot: that there is more of
 * this country than you have seen. The old screen tried, with a line reading "and 9 more you have
 * not run into yet", and a number is not a country.
 *
 * So every body is on the map from the first month. The ones you have never looked at are drawn
 * without a name and without a condition — present, placed, and blank. That is the whole argument
 * for the map: the fog is the feature, and the card list underneath is the detail.
 *
 * ### The layout is content, not decoration
 *
 * Coordinates live on each `Body` in `src/content/bodies.ts`. The capital sits north, the regional
 * tier across the middle, the councils south, so a career reads off the map as a walk inward and
 * upward — and Eastmoor being a long way from anybody who might have noticed is a fact you can
 * see rather than one the prose has to assert.
 */

/**
 * The body a post sits in, from the post's own id.
 *
 * Every post is `post.<body>.<role>` — `post.alderford.officer`, `post.ombudsman.office` — so the
 * institution is already written down and does not need a second field that could disagree with
 * it. `validate.ts` enforces the convention rather than leaving it as a thing that happens to be
 * true today.
 */
export function bodyOfPost(postId: string): string {
  return postId.split('.')[1] ?? '';
}

const BANDS = [
  { floor: 75, tone: 'strong' },
  { floor: 58, tone: 'sound' },
  { floor: 42, tone: 'strained' },
  { floor: 25, tone: 'failing' },
  { floor: 0, tone: 'collapsing' },
] as const;

export function bandFor(condition: number): (typeof BANDS)[number]['tone'] {
  return (BANDS.find((band) => condition >= band.floor) ?? BANDS[4]).tone;
}

/**
 * The coastline.
 *
 * Hand-drawn rather than generated, and irregular on purpose: a rectangle or an ellipse would read
 * as a diagram of a country rather than as one, and the whole point of the screen is that this is
 * a place.
 */
const COAST =
  'M 26 6 L 44 3 L 60 6 L 71 12 L 80 22 L 84 36 L 80 48 L 84 60 L 78 72 L 80 86 ' +
  'L 68 95 L 52 97 L 38 94 L 28 86 L 22 74 L 26 62 L 18 50 L 22 36 L 18 22 Z';

export function ValmaraMap({ game }: { game: GameState }) {
  const t = useT();
  const here = bodyOfPost(game.player.postId);

  return (
    <figure className="map">
      <svg
        className="map__svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label={t('map.alt')}
      >
        <path className="map__coast" d={COAST} />

        {bodies.map((body) => (
          <Place key={body.id} body={body} game={game} t={t} here={here === body.id} />
        ))}
      </svg>

      <figcaption className="map__legend">
        <span className="map__key map__key--here">{t('map.here')}</span>
        <span className="map__key map__key--strong">{t('country.state.strong')}</span>
        <span className="map__key map__key--strained">{t('country.state.strained')}</span>
        <span className="map__key map__key--collapsing">{t('country.state.collapsing')}</span>
        <span className="map__key map__key--unknown">{t('map.unvisited')}</span>
      </figcaption>
    </figure>
  );
}

function Place({
  body,
  game,
  t,
  here,
}: {
  body: Body;
  game: GameState;
  t: Translate;
  here: boolean;
}) {
  const known = bodyKnown(game, body);

  // A place you have never looked at gets a position and nothing else. No name, no condition, no
  // hint of whether it is worth going to — which is the honest rendering of not having been.
  if (!known) {
    return (
      <g className="place place--unknown">
        <circle cx={body.x} cy={body.y} r={1.4} />
      </g>
    );
  }

  const condition = bodyCondition(game, body);
  const tone = bandFor(condition);
  const standing = bodyStanding(game, body);

  return (
    <g className={`place place--${tone}${here ? ' place--here' : ''}`}>
      {here && <circle className="place__ring" cx={body.x} cy={body.y} r={3.6} />}
      <circle className="place__dot" cx={body.x} cy={body.y} r={2.1} />
      {/* Standing is a rim rather than a second mark: how a place regards you is a property of
          the place, not another thing sitting next to it. */}
      {standing >= 15 && <circle className="place__warm" cx={body.x} cy={body.y} r={2.9} />}
      {standing <= -15 && <circle className="place__cold" cx={body.x} cy={body.y} r={2.9} />}
      <text className="place__name" x={body.x} y={body.y - 4}>
        {body.short}
      </text>
      <title>
        {body.name} — {t(`country.state.${tone}`)}
      </title>
    </g>
  );
}

