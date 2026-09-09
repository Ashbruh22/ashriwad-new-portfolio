'use client';

// React Bits — ProfileCard (JS-TW variant). Vendored from
// https://reactbits.dev/r/ProfileCard-JS-TW.json
// Adaptations:
//   • 'use client' + full TypeScript — refs, the pointer-tracking "tilt
//     engine" closure, and every style object with CSS custom properties
//     (`--pointer-x` etc., not part of React.CSSProperties) are typed via a
//     small `CSSVars` helper instead of the original's untyped JS objects.
//   • the source's module-level `document.head` keyframe injection was
//     dropped — `@keyframes pc-holo-bg` lives in globals.css instead (same
//     place every other reactbits keyframe lives), and the shine layer's
//     `animation` moved from an inline style to a `.pc-shine` class so the
//     site's `[data-reduced-motion='true']` guard can kill it like every
//     other looping animation.
//   • tilt (pointer-tracked 3D rotation + the holo shine loop) is fully
//     disabled under the site's reduced-motion toggle — `tiltActive` gates
//     both the tilt engine's construction and the mount effect that wires
//     pointer/device-orientation listeners, so a reduced-motion visitor gets
//     a flat, static card (mirrors Magnet.tsx's `isDisabled` pattern).
//   • `avatarUrl`/`iconUrl`/`grainUrl` no longer default to the upstream demo's
//     placeholder strings (`'<Placeholder for avatar URL>'` etc.) — those
//     would've produced a broken `url(...)` in the CSS custom properties.
//     `avatarUrl` is required; `iconUrl`/`grainUrl` are optional and correctly
//     resolve to `none` when omitted.
//   • `--card-opacity` (drives the behind-glow's opacity) defaulted to `0` in
//     the source with no rule ever setting it to `1` in this CSS-free JS-TW
//     variant — the glow would never actually show. Defaulted to `1` instead.
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180,
};

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

interface TiltEngine {
  setImmediate(x: number, y: number): void;
  setTarget(x: number, y: number): void;
  toCenter(): void;
  beginInitial(durationMs: number): void;
  getCurrent(): { x: number; y: number; tx: number; ty: number };
  cancel(): void;
}

export interface ProfileCardProps {
  /** required — the upstream placeholder default produced a broken url() */
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  /** card width — height is derived from the fixed 0.718 aspect ratio. The
   * upstream source hardcoded `height: 80svh` (a full-viewport hero card);
   * driving size from width instead makes it a well-behaved block in a
   * normal content column (no intrinsic-width overflow on narrow screens). */
  maxWidth?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  /** the name/title text overlaid on the portrait — off by default is not
   * upstream behaviour, but some avatars (or a name already shown elsewhere
   * on the page) read better without it. Defaults to `true` to match source. */
  showDetails?: boolean;
  /** the 6 colours the holographic shine layer sweeps through. Upstream
   * hardcodes a fixed rainbow (`hsl(2,100%,73%)` … `hsl(283,100%,73%)`) with
   * no way to override it; exposed as a prop so a caller can go monochrome
   * (or any other palette) instead. Defaults to the original rainbow. */
  holoColors?: [string, string, string, string, string, string];
  /** the diagonal holo-stripe "shine" sweep + cursor-tracked glare highlight
   * — both rely on `mix-blend-mode` (`color-dodge` / `overlay`) to read as a
   * glossy metallic sheen. On a plain photograph (rather than the upstream
   * demo's flat-colour card) `color-dodge` amplifies whatever isn't quite
   * pure black in the image into a visible grey cast — no `holoColors`
   * choice fixes that, since a second, non-prop-driven grey stripe layer is
   * baked into the shine's own gradient. Defaults to `true` to match
   * upstream; a photo-avatar card should pass `false`. */
  shineEnabled?: boolean;
  onContactClick?: () => void;
}

const DEFAULT_HOLO_COLORS: [string, string, string, string, string, string] = [
  'hsl(2, 100%, 73%)',
  'hsl(53, 100%, 69%)',
  'hsl(93, 100%, 69%)',
  'hsl(176, 100%, 76%)',
  'hsl(228, 100%, 74%)',
  'hsl(283, 100%, 73%)',
];

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const ProfileCardComponent = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  maxWidth = '340px',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Javi A. Torres',
  title = 'Software Engineer',
  handle = 'javicodes',
  status = 'Online',
  contactText = 'Contact',
  showUserInfo = true,
  showDetails = true,
  holoColors = DEFAULT_HOLO_COLORS,
  shineEnabled = true,
  onContactClick,
}: ProfileCardProps) => {
  const { isReducedMotion } = useReducedMotion();
  const tiltActive = enableTilt && !isReducedMotion;
  const mobileTiltActive = enableMobileTilt && !isReducedMotion;

  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const tiltEngine = useMemo<TiltEngine | null>(() => {
    if (!tiltActive) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`,
      };

      for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
    };

    const step = (ts: number) => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);

      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      setVarsFromXY(currentX, currentY);

      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x, y) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x, y) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      },
    };
  }, [tiltActive]);

  const getOffsets = (evt: PointerEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine],
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove('entering');
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine],
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;

    tiltEngine.toCenter();

    const checkSettle = () => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      const settled = Math.hypot(tx - x, ty - y) < 0.6;
      if (settled) {
        shell.classList.remove('active');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      const { beta, gamma } = event;
      if (beta == null || gamma == null) return;

      const centerX = shell.clientWidth / 2;
      const centerY = shell.clientHeight / 2;
      const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
      const y = clamp(
        centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        0,
        shell.clientHeight,
      );

      tiltEngine.setTarget(x, y);
    },
    [tiltEngine, mobileTiltSensitivity],
  );

  useEffect(() => {
    if (!tiltActive || !tiltEngine) return;

    const shell = shellRef.current;
    if (!shell) return;

    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    const handleClick = () => {
      if (!mobileTiltActive || location.protocol !== 'https:') return;
      // iOS 13+ gates DeviceMotionEvent behind a user-gesture permission
      // prompt — not in the standard DOM lib types, so a narrow cast here.
      const motionEvent = window.DeviceMotionEvent as
        | (typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> })
        | undefined;
      if (motionEvent && typeof motionEvent.requestPermission === 'function') {
        motionEvent
          .requestPermission()
          .then((state) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
    shell.addEventListener('click', handleClick);

    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
      shell.removeEventListener('click', handleClick);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }, [
    tiltActive,
    mobileTiltActive,
    tiltEngine,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleDeviceOrientation,
  ]);

  const cardRadius = '30px';

  const cardStyle = useMemo<CSSVars>(
    () => ({
      '--icon': iconUrl ? `url(${iconUrl})` : 'none',
      '--grain': grainUrl ? `url(${grainUrl})` : 'none',
      '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
      '--behind-glow-color': behindGlowColor ?? 'rgba(125, 190, 255, 0.67)',
      '--behind-glow-size': behindGlowSize ?? '50%',
      '--pointer-x': '50%',
      '--pointer-y': '50%',
      '--pointer-from-center': '0',
      '--pointer-from-top': '0.5',
      '--pointer-from-left': '0.5',
      '--card-opacity': '1',
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
      '--background-x': '50%',
      '--background-y': '50%',
      '--card-radius': cardRadius,
      '--sunpillar-1': holoColors[0],
      '--sunpillar-2': holoColors[1],
      '--sunpillar-3': holoColors[2],
      '--sunpillar-4': holoColors[3],
      '--sunpillar-5': holoColors[4],
      '--sunpillar-6': holoColors[5],
      '--sunpillar-clr-1': 'var(--sunpillar-1)',
      '--sunpillar-clr-2': 'var(--sunpillar-2)',
      '--sunpillar-clr-3': 'var(--sunpillar-3)',
      '--sunpillar-clr-4': 'var(--sunpillar-4)',
      '--sunpillar-clr-5': 'var(--sunpillar-5)',
      '--sunpillar-clr-6': 'var(--sunpillar-6)',
    }),
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize, holoColors],
  );

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  const shineStyle: CSSVars = {
    maskImage: 'var(--icon)',
    maskMode: 'luminance',
    maskRepeat: 'repeat',
    maskSize: '150%',
    maskPosition: 'top calc(200% - (var(--background-y) * 5)) left calc(100% - var(--background-x))',
    filter: 'brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5)',
    animationPlayState: 'running',
    mixBlendMode: 'color-dodge',
    '--space': '5%',
    '--angle': '-45deg',
    transform: 'translate3d(0, 0, 1px)',
    overflow: 'hidden',
    zIndex: 3,
    background: 'transparent',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        var(--sunpillar-clr-1) calc(var(--space) * 1),
        var(--sunpillar-clr-2) calc(var(--space) * 2),
        var(--sunpillar-clr-3) calc(var(--space) * 3),
        var(--sunpillar-clr-4) calc(var(--space) * 4),
        var(--sunpillar-clr-5) calc(var(--space) * 5),
        var(--sunpillar-clr-6) calc(var(--space) * 6),
        var(--sunpillar-clr-1) calc(var(--space) * 7)
      ),
      repeating-linear-gradient(
        var(--angle),
        #0e0e0e 0%,
        hsl(0, 0%, 60%) 3.8%,
        hsl(0, 0%, 66%) 4.5%,
        hsl(0, 0%, 60%) 5.2%,
        #0e0e0e 10%,
        #0e0e0e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--pointer-x) var(--pointer-y),
        hsla(0, 0%, 0%, 0.1) 12%,
        hsla(0, 0%, 0%, 0.15) 20%,
        hsla(0, 0%, 0%, 0.25) 120%
      )
    `.replace(/\s+/g, ' '),
    gridArea: '1 / -1',
    borderRadius: cardRadius,
    pointerEvents: 'none',
  };

  const glareStyle: React.CSSProperties = {
    transform: 'translate3d(0, 0, 1.1px)',
    overflow: 'hidden',
    backgroundImage: `radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsl(0, 0%, 80%) 12%,
      hsla(0, 0%, 30%, 0.8) 90%
    )`,
    mixBlendMode: 'overlay',
    filter: 'brightness(0.8) contrast(1.2)',
    zIndex: 4,
    gridArea: '1 / -1',
    borderRadius: cardRadius,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={wrapRef}
      className={`relative touch-none ${className}`.trim()}
      style={{
        // definite width so the section's `width: 100%` below has a real
        // containing block to resolve against — without this, a block child
        // of an unsized flex item collapses to 0 (found via Playwright: the
        // card rendered with width:0 until this was added)
        width: `min(100%, ${maxWidth})`,
        perspective: '500px',
        transform: 'translate3d(0, 0, 0.1px)',
        ...cardStyle,
      }}
    >
      {behindGlowEnabled && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 ease-out"
          style={{
            background:
              'radial-gradient(circle at var(--pointer-x) var(--pointer-y), var(--behind-glow-color) 0%, transparent var(--behind-glow-size))',
            filter: 'blur(50px) saturate(1.1)',
            opacity: 'calc(0.8 * var(--card-opacity))',
          }}
        />
      )}
      <div ref={shellRef} className="relative z-[1] group">
        <section
          className="grid relative overflow-hidden backface-hidden"
          style={{
            width: '100%',
            maxWidth,
            aspectRatio: '0.718',
            borderRadius: cardRadius,
            backgroundBlendMode: 'color-dodge, normal, normal, normal',
            boxShadow:
              'rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px) calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px',
            transition: 'transform 1s ease',
            transform: 'translateZ(0) rotateX(0deg) rotateY(0deg)',
            background: 'rgba(0, 0, 0, 0.98)',
          }}
          onMouseEnter={(e) => {
            if (!tiltActive) return;
            e.currentTarget.style.transition = 'none';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x))';
          }}
          onMouseLeave={(e) => {
            if (!tiltActive) return;
            const shell = shellRef.current;
            e.currentTarget.style.transition = shell?.classList.contains('entering')
              ? 'transform 180ms ease-out'
              : 'transform 1s ease';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'var(--inner-gradient)',
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
              borderRadius: cardRadius,
              display: 'grid',
              gridArea: '1 / -1',
            }}
          >
            {shineEnabled && (
              <>
                <div className="pc-shine" style={shineStyle} />
                <div style={glareStyle} />
              </>
            )}

            <div
              className="overflow-visible backface-hidden"
              style={{
                mixBlendMode: 'luminosity',
                transform: 'translateZ(2px)',
                gridArea: '1 / -1',
                borderRadius: cardRadius,
                pointerEvents: 'none',
              }}
            >
              <img
                className="w-full absolute left-1/2 bottom-[-1px] backface-hidden will-change-transform transition-transform duration-[120ms] ease-out"
                src={avatarUrl}
                alt={`${name || 'User'} avatar`}
                loading="lazy"
                style={{
                  transformOrigin: '50% 100%',
                  transform:
                    'translateX(calc(-50% + (var(--pointer-from-left) - 0.5) * 6px)) translateZ(0) scaleY(calc(1 + (var(--pointer-from-top) - 0.5) * 0.02)) scaleX(calc(1 + (var(--pointer-from-left) - 0.5) * 0.01))',
                  borderRadius: cardRadius,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {showUserInfo && (
                <div
                  className="absolute z-[2] flex items-center justify-between backdrop-blur-[30px] border border-white/10 pointer-events-auto"
                  style={
                    {
                      '--ui-inset': '20px',
                      '--ui-radius-bias': '6px',
                      bottom: 'var(--ui-inset)',
                      left: 'var(--ui-inset)',
                      right: 'var(--ui-inset)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'calc(max(0px, var(--card-radius) - var(--ui-inset) + var(--ui-radius-bias)))',
                      padding: '12px 14px',
                    } as CSSVars
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full overflow-hidden border border-white/10 flex-shrink-0"
                      style={{ width: '48px', height: '48px' }}
                    >
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={miniAvatarUrl || avatarUrl}
                        alt={`${name || 'User'} mini avatar`}
                        loading="lazy"
                        style={{ display: 'block', borderRadius: '50%', pointerEvents: 'auto' }}
                        onError={(e) => {
                          e.currentTarget.style.opacity = '0.5';
                          e.currentTarget.src = avatarUrl;
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="text-sm font-medium text-white/90 leading-none">@{handle}</div>
                      <div className="text-sm text-white/70 leading-none">{status}</div>
                    </div>
                  </div>
                  <button
                    className="border border-white/10 rounded-lg px-4 py-3 text-xs font-semibold text-white/90 cursor-pointer backdrop-blur-[10px] transition-all duration-200 ease-out hover:border-white/40 hover:-translate-y-px"
                    onClick={handleContactClick}
                    style={{ pointerEvents: 'auto', borderRadius: '8px' }}
                    type="button"
                    aria-label={`Contact ${name || 'user'}`}
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>

            {showDetails && (
              <div
                className="max-h-full overflow-hidden text-center relative z-[5]"
                style={{
                  transform:
                    'translate3d(calc(var(--pointer-from-left) * -6px + 3px), calc(var(--pointer-from-top) * -6px + 3px), 0.1px)',
                  mixBlendMode: 'luminosity',
                  gridArea: '1 / -1',
                  borderRadius: cardRadius,
                  pointerEvents: 'none',
                }}
              >
                <div className="w-full absolute flex flex-col" style={{ top: '3em' }}>
                  <h3
                    className="font-semibold m-0"
                    style={{
                      fontSize: 'min(5svh, 3em)',
                      backgroundImage: 'linear-gradient(to bottom, #fff, #9a9a9a)',
                      backgroundSize: '1em 1.5em',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      pointerEvents: 'auto',
                    }}
                  >
                    {name}
                  </h3>
                  <p
                    className="font-semibold whitespace-nowrap mx-auto w-min"
                    style={{
                      position: 'relative',
                      top: '-12px',
                      fontSize: '16px',
                      margin: '0 auto',
                      backgroundImage: 'linear-gradient(to bottom, #fff, #6b6b6b)',
                      backgroundSize: '1em 1.5em',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      pointerEvents: 'auto',
                    }}
                  >
                    {title}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
