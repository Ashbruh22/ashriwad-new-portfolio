'use client';

// React Bits — PillNav. Vendored from https://reactbits.dev/r/PillNav-TS-TW.json
// Adaptations:
//   • dropped the `react-router-dom` dep — this is a Next.js app and every nav
//     href here is a hash link, which upstream already routes through a plain
//     <a>, so the <Link> branch was dead code.
//   • 'use client', and the site's reduced-motion toggle disables the GSAP
//     hover timelines + the initial-load width animation (renders static).
//   • responsive switch moved md: → lg: (long labels need the room), the outer
//     wrapper is `relative` (the parent <header> owns fixed positioning), and
//     `logoHref` / `logoBg` let the logo point somewhere other than items[0].
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  logoHref?: string;
  logoBg?: string;
  /** background of the desktop pill-row container (default = baseColor) */
  navItemsBg?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  logoHref,
  logoBg,
  navItemsBg,
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const { isReducedMotion } = useReducedMotion();
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation, isReducedMotion]);

  // Intro reveal — runs once on mount. Deliberately kept out of the layout
  // effect above, whose `items` dep gets a new reference on every parent
  // re-render (e.g. the scroll-spy in Nav.tsx), which used to replay this
  // reveal on every section change while scrolling.
  useEffect(() => {
    if (!initialLoadAnimation || isReducedMotion) return;

    const logoEl = logoRef.current;
    const navItems = navItemsRef.current;

    if (logoEl) {
      gsap.set(logoEl, { scale: 0 });
      gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' });
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease,
        // hand sizing back to the layout once revealed — a measured px width
        // can end a hair short and clip the last pill
        onComplete: () => gsap.set(navItems, { clearProps: 'width,overflow' })
      });
    }
  }, []);

  const handleEnter = (i: number) => {
    if (isReducedMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLeave = (i: number) => {
    if (isReducedMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
  };

  const handleLogoEnter = () => {
    if (isReducedMotion) return;
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: '40px',
    ['--logo']: '36px',
    ['--pill-pad-x']: '16px',
    ['--pill-gap']: '3px'
  } as React.CSSProperties;

  const logoTarget = logoHref ?? items?.[0]?.href ?? '#';

  return (
    <div className={`relative w-full lg:w-auto ${className}`}>
      <nav
        className="flex w-full items-center justify-between box-border lg:w-max lg:justify-start"
        aria-label="Primary"
        style={cssVars}
      >
        <a
          href={logoTarget}
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
          className="inline-flex items-center justify-center overflow-hidden rounded-full p-2"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: logoBg ?? 'var(--base, #000)'
          }}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} className="block h-full w-full object-contain" />
        </a>

        <div
          ref={navItemsRef}
          className="relative ml-2 hidden items-center rounded-full lg:flex"
          style={{ height: 'var(--nav-h)', background: navItemsBg ?? 'var(--base, #000)' }}
        >
          <ul
            role="menubar"
            className="m-0 flex h-full list-none items-stretch p-[3px]"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;
              const pillStyle: React.CSSProperties = {
                background: 'var(--pill-bg, #fff)',
                // faded to match the glass fill — a full-strength border
                // read as a hard edge around an otherwise soft, blurred pill
                borderColor: 'color-mix(in oklab, var(--border-subtle) 35%, transparent)',
                color: 'var(--pill-text, var(--base, #000))',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              };
              // hairline keeps the pills reading as pills when the row
              // container is transparent (they sit on same-coloured page).
              // `backdrop-blur` is what actually makes `pillColor` read as
              // glass rather than a flat translucent color — it blurs the
              // page content scrolling underneath the pill, not just dims it.
              // Border colour itself comes from `pillStyle.borderColor`
              // above (inline, so it overrides this class's border-color)
              // rather than a Tailwind arbitrary-value class — `color-mix()`
              // with internal commas/spaces doesn't escape cleanly into
              // Tailwind's `[...]` bracket syntax.
              const basePillClasses =
                'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border border font-semibold text-[12px] leading-[0] uppercase tracking-[0.4px] whitespace-nowrap cursor-pointer px-0 backdrop-blur-md';

              return (
                <li key={item.href} role="none" className="flex h-full">
                  <a
                    role="menuitem"
                    href={item.href}
                    className={basePillClasses}
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    aria-current={isActive ? 'location' : undefined}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 z-[1] block rounded-full pointer-events-none"
                      style={{ background: 'var(--base, #000)', willChange: 'transform' }}
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack relative z-[2] inline-block leading-[1]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: 'transform' }}>
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                        style={{ color: 'var(--hover-text, #fff)', willChange: 'transform, opacity' }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        className="absolute left-1/2 -bottom-[6px] z-[4] h-2 w-2 -translate-x-1/2 rounded-full"
                        style={{ background: 'var(--base, #000)' }}
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          // glass, matching the desktop nav-link pills (basePillClasses
          // above) instead of the flat solid circle this used to be —
          // was the most obviously "primitive"-looking piece of the nav
          // next to everything else's frosted-glass treatment.
          className="relative flex flex-col items-center justify-center gap-1 rounded-full border p-0 cursor-pointer backdrop-blur-md lg:hidden"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--pill-bg, #fff)',
            borderColor: 'color-mix(in oklab, var(--border-subtle) 35%, transparent)',
          }}
        >
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--base, #000)' }}
          />
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--base, #000)' }}
          />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        // frosted panel (blur + a light tint of `--base`, independent of
        // whatever `pillColor` the caller chose for individual pills) so the
        // dropdown reads as one glass sheet with pill buttons floating on
        // it, rather than the flat opaque card it used to be — matches the
        // desktop pill row's treatment instead of looking like a leftover
        // from before that pass.
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-[998] origin-top rounded-[24px] border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] lg:hidden"
        style={{
          ...cssVars,
          background: 'color-mix(in oklab, var(--base) 10%, transparent)',
          borderColor: 'color-mix(in oklab, var(--border-subtle) 35%, transparent)',
        }}
      >
        <ul className="m-0 flex list-none flex-col gap-[3px] p-[3px]">
          {items.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block rounded-[50px] px-4 py-3 text-[13px] font-medium uppercase tracking-[0.4px] transition-colors duration-200"
                style={{ background: 'var(--pill-bg, #fff)', color: 'var(--pill-text, #fff)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
