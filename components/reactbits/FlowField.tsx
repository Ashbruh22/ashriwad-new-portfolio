'use client';

import { memo, useEffect, useRef } from 'react';

interface Particle {
  path: number;
  t: number;
  size: number;
  tint: number;
}

interface FlowFieldProps {
  /** number of filaments streaming in from the edges */
  paths?: number;
  /** particles per filament */
  perPath?: number;
  /** faint dashed filament colour */
  lineColor?: string;
  /** particle colour */
  dotColor?: string;
  /** accent tint mixed into a few particles */
  accentColor?: string;
  /** px scrolled ↦ fraction of a filament travelled */
  flowPerPixel?: number;
}

const TWO_PI = Math.PI * 2;

/**
 * Edge-to-centre filament field. The dots ride the filaments, and their motion
 * is driven **only by scrolling** — scroll down and they stream **outward** from
 * the convergence point toward the edges, scroll up and they run back in; when
 * the page is still, the field is still. Pure canvas 2D, no deps, no pointer input.
 */
const FlowField = memo(function FlowField({
  paths = 54,
  perPath = 2,
  lineColor = 'rgba(139,143,153,0.27)',
  dotColor = 'rgba(255,255,255,0.65)',
  accentColor = 'rgba(255,255,255,0.65)',
  flowPerPixel = 0.00035,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ lineColor, dotColor, accentColor, flowPerPixel, paths, perPath });
  propsRef.current = { lineColor, dotColor, accentColor, flowPerPixel, paths, perPath };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    // cubic-bezier control points per filament, rebuilt on resize
    let curves: Array<[number, number, number, number, number, number, number, number]> = [];
    let particles: Particle[] = [];

    const scroll = { last: window.scrollY, vel: 0, smooth: 0 };

    function buildCurves() {
      const cx = w / 2;
      const cy = h / 2;
      const n = propsRef.current.paths;
      // scatter the convergence into a soft disc so the filaments don't all
      // collapse onto one hard knot
      const spread = Math.min(w, h) * 0.14;
      curves = new Array(n);
      for (let i = 0; i < n; i++) {
        const isLeft = i % 2 === 0;
        const startY = (i / n) * h * 1.4 - h * 0.2 + (Math.random() - 0.5) * 40;
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random()) * spread;
        const ex = cx + Math.cos(ang) * rad;
        const ey = cy + Math.sin(ang) * rad;
        const x0 = isLeft ? 0 : w;
        const x1 = isLeft ? cx * 0.5 : w - cx * 0.5;
        const x2 = isLeft ? cx * 0.82 : w - cx * 0.82;
        curves[i] = [x0, startY, x1, startY, x2, ey, ex, ey];
      }
    }

    function buildParticles() {
      const n = propsRef.current.paths;
      const per = propsRef.current.perPath;
      particles = [];
      for (let p = 0; p < n; p++) {
        for (let k = 0; k < per; k++) {
          particles.push({
            path: p,
            t: (k / per + Math.random() * 0.3) % 1,
            size: 1.3 + Math.random() * 1.1,
            tint: Math.random() < 0.14 ? 1 : 0,
          });
        }
      }
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCurves();
      buildParticles();
    }

    function bezier(c: number[], t: number) {
      const u = 1 - t;
      const uu = u * u;
      const tt = t * t;
      const a = uu * u;
      const b = 3 * uu * t;
      const d = 3 * u * tt;
      const e = tt * t;
      return {
        x: a * c[0] + b * c[2] + d * c[4] + e * c[6],
        y: a * c[1] + b * c[3] + d * c[5] + e * c[7],
      };
    }

    function onScroll() {
      const y = window.scrollY;
      scroll.vel += y - scroll.last;
      scroll.last = y;
    }

    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      const { lineColor: lc, dotColor: dc, accentColor: ac, flowPerPixel: fpp } = propsRef.current;

      // low-pass the scroll delta so the field eases in and out of motion
      scroll.smooth += (scroll.vel - scroll.smooth) * 0.12;
      scroll.vel *= 0.6;
      if (Math.abs(scroll.smooth) < 0.01) scroll.smooth = 0;

      // negative so scroll-down drives particles outward (centre → edge)
      const advance = -scroll.smooth * fpp;

      ctx!.clearRect(0, 0, w, h);

      // filaments
      ctx!.strokeStyle = lc;
      ctx!.lineWidth = 1;
      ctx!.setLineDash([1, 5]);
      ctx!.beginPath();
      for (const c of curves) {
        ctx!.moveTo(c[0], c[1]);
        ctx!.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]);
      }
      ctx!.stroke();
      ctx!.setLineDash([]);

      // particles
      for (const p of particles) {
        p.t += advance;
        if (p.t >= 1) p.t -= 1;
        else if (p.t < 0) p.t += 1;

        const pos = bezier(curves[p.path], p.t);
        // soft fade zones at the edge (t→0) and just inside the convergence
        // disc (t→1) — position-based, so it holds whichever way the dots travel
        const edge = Math.min(p.t / 0.08, (1 - p.t) / 0.22, 1);
        ctx!.globalAlpha = Math.max(0, edge);
        ctx!.fillStyle = p.tint ? ac : dc;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, p.size, 0, TWO_PI);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    resize();
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
});

export default FlowField;
