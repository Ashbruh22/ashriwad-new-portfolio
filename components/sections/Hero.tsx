'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, Mail } from 'lucide-react';
import SplitText from '@/components/reactbits/SplitText';
import StarBorder from '@/components/reactbits/StarBorder';
import GlareHover from '@/components/reactbits/GlareHover';
import NeuralVortexBackground from '@/components/ui/interactive-neural-vortex-background';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';
import { RESUME_DOWNLOAD_NAME, RESUME_PATH, SITE_NAME, SITE_ROLE, SITE_TAGLINE } from '@/lib/constants';

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { isReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
      if (isReducedMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  return (
    <section
      id="hero"
      ref={containerRef}
      aria-labelledby="hero-heading"
      className="hero-shell relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden text-center"
    >
      <NeuralVortexBackground />
      <div className="relative z-[1] mx-auto flex w-full max-w-[68rem] flex-col items-center">
        <h1
          id="hero-heading"
          data-hero-item
          className="font-display text-4xl font-medium tracking-tight [text-shadow:0_4px_32px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[4rem] lg:leading-[1.05]"
        >
          <span className="silver-text mr-2">{"Hi I'm"}</span>{' '}
          <span className="silver-text">{SITE_NAME}</span>
        </h1>

        <div data-hero-item className="mt-3">
          <SplitText
            as="p"
            text={SITE_ROLE}
            className="font-display text-xl font-medium tracking-tight text-[var(--text-primary)] [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] sm:text-2xl"
            stagger={0.018}
            yFrom={18}
            blur={5}
          />
        </div>

        <p
          data-hero-item
          className="mt-3 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]"
        >
          {SITE_TAGLINE}
        </p>

        <div data-hero-item className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <StarBorder>
            <a
              href="#featured-projects"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 text-sm font-medium text-[var(--bg-base)] transition-opacity hover:opacity-90"
            >
              View work
              <ArrowDown size={15} strokeWidth={2} />
            </a>
          </StarBorder>
          <GlareHover>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-secondary)]"
            >
              <Mail size={15} strokeWidth={2} />
              Get in touch
            </a>
          </GlareHover>
          <a
            href={RESUME_PATH}
            download={RESUME_DOWNLOAD_NAME}
            className="px-2 py-2.5 text-sm font-medium text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
          >
            Résumé
          </a>
        </div>
      </div>
    </section>
  );
}
