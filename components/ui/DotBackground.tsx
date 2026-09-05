/**
 * Fixed, purely decorative page ground: a hairline dot grid plus a soft violet
 * wash bled in from the top. Static CSS — no canvas, no listeners, nothing to
 * turn off for reduced motion.
 */
export default function DotBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in oklab, var(--text-secondary) 45%, transparent) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)',
        }}
      />
      <div
        className="absolute -top-1/4 left-1/2 aspect-square w-[120vw] max-w-[70rem] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--hero-accent) 22%, transparent) 0%, transparent 65%)',
        }}
      />
    </div>
  );
}
