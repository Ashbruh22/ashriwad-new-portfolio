'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotionPreference } from '@/components/ui/ReducedMotionProvider';

const SPRITE_SRC = '/hero/character-sprite.webp';
const POSTER_SRC = '/hero/character-poster.webp';

/**
 * The sheet is a 3x3 grid of the same character looking in nine directions,
 * row-major (see scripts/build-character-sprite.py):
 *
 *     up-left      up        up-right
 *     left         centre    right
 *     down-left    down      down-right
 *
 * so cell (col, row) is reached with `background-position: col*50% row*50%`
 * at `background-size: 300% 300%`.
 */
const GRID = 3;
const CELLS = Array.from({ length: GRID * GRID }, (_, i) => ({
  col: i % GRID,
  row: Math.floor(i / GRID),
}));

/** Half-extent of the pointer travel that reaches a full turn, in viewport units. */
const REACH_X = 0.42;
const REACH_Y = 0.42;
/** Fraction of the box height the head sits at — the gaze origin, not the centroid. */
const HEAD_Y = 0.3;
/** Idle for this long and the character starts looking around on its own. */
const IDLE_AFTER_MS = 2600;

/**
 * How far past a cell boundary the gaze has to travel before the pose switches.
 * Without it a gaze parked on a boundary flickers between two poses on every
 * sub-pixel pointer jitter.
 */
const HYSTERESIS = 0.14;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Nearest cell along one axis, given the one currently held.
 *
 * The nine poses are real renders of a head at nine different angles, not
 * frames of one continuous turn, so cross-dissolving between neighbours leaves
 * two faces visible at half strength — which is what a bilinear blend across
 * the grid looks like at rest. Snapping to the nearest pose and letting CSS run
 * a short opacity transition through the change keeps every resting frame
 * clean, and the parallax on the stage supplies the continuous motion.
 */
function snap(value: number, held: number): number {
  const g = ((clamp(value, -1, 1) + 1) / 2) * (GRID - 1);
  const nearest = Math.round(g);
  return Math.abs(g - held) > 0.5 + HYSTERESIS ? nearest : held;
}

type CharacterGazeProps = {
  className?: string;
  /** Described to assistive tech — the sprite stack itself is decorative. */
  label: string;
};

const CharacterGaze: React.FC<CharacterGazeProps> = ({ className, label }) => {
  const { reduced } = useReducedMotionPreference();
  const [spriteReady, setSpriteReady] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCellRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      cellRefs.current[index] = node;
    },
    [],
  );

  // The sheet is also the cells' CSS background-image, so this is one fetch,
  // not two. It is decoded up front rather than read off an <img onLoad>: the
  // background request often finishes before hydration attaches a handler, and
  // a load event that already fired never arrives.
  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    const image = new window.Image();
    image.src = SPRITE_SRC;
    image
      .decode()
      .catch(() => {}) // a decode failure still reveals the stack; the cells
      .finally(() => { // just fall back to whatever the browser managed
        if (!cancelled) setSpriteReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;

    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const held = { col: 1, row: 1 };
    let painted = 4;

    // getBoundingClientRect is a layout read, so it is cached and only
    // refreshed when scroll/resize can actually have moved the box.
    let origin = { x: 0, y: 0 };
    let originStale = true;
    const refreshOrigin = () => {
      const box = root.getBoundingClientRect();
      origin = { x: box.left + box.width / 2, y: box.top + box.height * HEAD_Y };
      originStale = false;
    };

    let lastPointerAt = 0;
    let pointerSeen = false;

    const onPointerMove = (event: PointerEvent) => {
      if (originStale) refreshOrigin();
      target.x = clamp((event.clientX - origin.x) / (window.innerWidth * REACH_X), -1, 1);
      target.y = clamp((event.clientY - origin.y) / (window.innerHeight * REACH_Y), -1, 1);
      lastPointerAt = performance.now();
      pointerSeen = true;
    };

    const onPointerLeave = () => {
      lastPointerAt = 0; // hand straight back to the idle drift
    };

    const invalidate = () => {
      originStale = true;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      // Idle: a slow two-frequency drift so the loop never lines up and the
      // character reads as looking around rather than cycling a pattern.
      if (!pointerSeen || now - lastPointerAt > IDLE_AFTER_MS) {
        target.x = 0.52 * Math.sin(now * 0.00042) + 0.18 * Math.sin(now * 0.00097);
        target.y = 0.34 * Math.sin(now * 0.00061 + 1.1);
      }

      // Frame-rate independent approach to the target, capped so a backgrounded
      // tab returning after seconds doesn't teleport the head.
      const dt = Math.min(64, now - previous);
      previous = now;
      const k = 1 - Math.exp(-dt / 105);
      eased.x += (target.x - eased.x) * k;
      eased.y += (target.y - eased.y) * k;

      held.col = snap(eased.x, held.col);
      held.row = snap(eased.y, held.row);
      const active = held.row * GRID + held.col;
      if (active !== painted) {
        cellRefs.current[painted]?.style.setProperty('opacity', '0');
        cellRefs.current[active]?.style.setProperty('opacity', '1');
        painted = active;
      }

      // A little parallax on top of the pose swap: the whole bust shifts and
      // yaws toward the cursor, which is what sells the nine stills as depth.
      stage.style.transform =
        `translate3d(${(eased.x * 16).toFixed(2)}px, ${(eased.y * 10).toFixed(2)}px, 0) ` +
        `rotateY(${(eased.x * 7).toFixed(2)}deg) rotateX(${(-eased.y * 4).toFixed(2)}deg)`;
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className={cn('gaze', className)}
      role="img"
      aria-label={label}
    >
      {/* Sits under the sprite stack: it is 22 KB against the sheet's 186 KB,
          so it paints first, and it is the whole thing under reduced motion
          or with JS off. */}
      <img
        src={POSTER_SRC}
        alt=""
        aria-hidden="true"
        className="gaze__poster"
        style={{ opacity: spriteReady ? 0 : 1 }}
        width={620}
        height={620}
        fetchPriority="high"
        draggable={false}
      />

      {!reduced && (
        <>
          <div
            ref={stageRef}
            className="gaze__stage"
            style={{ opacity: spriteReady ? 1 : 0 }}
            aria-hidden="true"
          >
            {CELLS.map(({ col, row }, index) => (
              <div
                key={`${col}-${row}`}
                ref={setCellRef(index)}
                className="gaze__cell"
                style={{
                  backgroundPosition: `${col * 50}% ${row * 50}%`,
                  // Centre cell only until the first frame runs, so hydration
                  // matches the poster underneath.
                  opacity: index === 4 ? 1 : 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CharacterGaze;
