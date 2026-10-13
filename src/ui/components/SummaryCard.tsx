import { useEffect, useMemo, useRef, useState } from 'react';
import { endingCopy, registry } from '../../content';
import { useT, type Translate } from '../../i18n';
import {
  blockSpark,
  buildSummary,
  challengeLine,
  shareUrl,
  summaryText,
  type CareerSummary,
} from '../summary';
import type { GameState } from '../../engine/types';

const WIDTH = 1200;
const HEIGHT = 630;

// The card is an image people post elsewhere, so it carries its own palette rather than following
// the player's light or dark theme.
const INK = '#f2ecd8';
const NAVY = '#17306e';
const GOLD = '#f0dca8';
const BAR = '#b8791a';

const TITLE_FONT = '"Press Start 2P", "Courier New", monospace';
const BODY_FONT = '"Pixelify Sans", "Trebuchet MS", Verdana, sans-serif';

/** Shrinks a line until it fits, so a long name or a long Spanish title never runs off the card. */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, size: number, max: number) {
  let px = size;
  do {
    ctx.font = `${px}px ${family}`;
    if (ctx.measureText(text).width <= max || px <= 12) break;
    px -= 2;
  } while (px > 12);
}

export function drawCard(
  canvas: HTMLCanvasElement,
  summary: CareerSummary,
  t: Translate,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 8;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  const left = 72;
  const max = WIDTH - left * 2;
  ctx.textBaseline = 'top';

  ctx.fillStyle = GOLD;
  fit(ctx, t('app.title').toUpperCase(), TITLE_FONT, 20, max);
  ctx.fillText(t('app.title').toUpperCase(), left, 64);

  ctx.fillStyle = INK;
  fit(ctx, summary.name, TITLE_FONT, 40, max);
  ctx.fillText(summary.name, left, 120);

  ctx.fillStyle = GOLD;
  const ending = t(summary.endingKey);
  fit(ctx, ending, BODY_FONT, 48, max);
  ctx.fillText(ending, left, 192);

  ctx.fillStyle = INK;
  const meta = `${t(summary.departmentKey)} · ${t(`track.${summary.track}`)} · ${t('summary.years', { years: summary.years })}`;
  fit(ctx, meta, BODY_FONT, 30, max);
  ctx.fillText(meta, left, 262);

  const post = `${t(summary.finalPost.titleKey)}, ${t(summary.finalPost.orgKey)}`;
  fit(ctx, post, BODY_FONT, 30, max);
  ctx.fillText(post, left, 308);

  // The Record in miniature: reputation on its fixed 0 to 100 axis, one column per stretch of
  // career, so a flat career looks flat.
  const chartTop = 360;
  const chartHeight = 96;
  ctx.fillStyle = 'rgba(242, 236, 216, 0.12)';
  ctx.fillRect(left, chartTop, max, chartHeight);
  const rep = summary.reputation;
  if (rep.length > 0) {
    const columns = Math.min(60, rep.length);
    const colWidth = max / columns;
    ctx.fillStyle = BAR;
    for (let i = 0; i < columns; i += 1) {
      const from = Math.floor((i * rep.length) / columns);
      const to = Math.max(from + 1, Math.floor(((i + 1) * rep.length) / columns));
      const slice = rep.slice(from, to);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const h = Math.round((Math.min(100, Math.max(0, mean)) / 100) * chartHeight);
      ctx.fillRect(
        left + Math.floor(i * colWidth),
        chartTop + chartHeight - h,
        Math.ceil(colWidth) - 2,
        h,
      );
    }
  }
  ctx.fillStyle = GOLD;
  ctx.font = `20px ${BODY_FONT}`;
  ctx.fillText(t('stat.reputation'), left, chartTop + chartHeight + 8);

  ctx.fillStyle = INK;
  const rivalLine = summary.rival ? t(`summary.rival_${summary.rival}`) : '';
  if (rivalLine) {
    fit(ctx, rivalLine, BODY_FONT, 26, max);
    ctx.fillText(rivalLine, left, 498);
  }

  ctx.fillStyle = GOLD;
  const foot = challengeLine(summary, t) ?? `${t('summary.seed')} ${summary.seed}`;
  fit(ctx, foot, BODY_FONT, 24, max);
  ctx.fillText(foot, left, HEIGHT - 96);
}

/**
 * The shareable end of a career: an image to post and the same facts as text to paste.
 *
 * Built from the final state alone, so it is available on every ending — a burnout is as
 * shareable as a ministry, and rather more honest.
 */
export function SummaryCard({ game }: { game: GameState }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(
    () => buildSummary(game, registry, (ending) => endingCopy[ending].titleKey),
    [game],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !summary) return;
    let cancelled = false;

    // The pixel faces are web fonts; a canvas painted before they arrive would use the fallback
    // and keep it. Ask for them first, and draw regardless if the browser cannot say.
    const draw = () => {
      if (!cancelled) drawCard(canvas, summary, t);
    };
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts?.load) {
      void Promise.all([
        fonts.load('20px "Press Start 2P"'),
        fonts.load('30px "Pixelify Sans"'),
      ]).then(draw, draw);
    } else {
      draw();
    }
    return () => {
      cancelled = true;
    };
  }, [summary, t]);

  if (!summary) return null;

  const copy = async () => {
    const text = summaryText(summary, t, shareUrl(summary, window.location.href));
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'public-service-story.png';
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <section className="ending__panel summary">
      <h2 className="panel__title">{t('summary.heading')}</h2>
      <canvas
        ref={canvasRef}
        className="summary__canvas"
        role="img"
        aria-label={`${summary.name}: ${t(summary.endingKey)}. ${blockSpark(summary.reputation)}`}
      />
      <div className="summary__actions">
        <button type="button" className="btn" onClick={() => void copy()}>
          {t('summary.copy')}
        </button>
        <button type="button" className="btn" onClick={download}>
          {t('summary.download')}
        </button>
        <span className="muted summary__status" role="status">
          {status === 'copied' && t('summary.copied')}
          {status === 'failed' && t('summary.copy_failed')}
        </span>
      </div>
    </section>
  );
}
