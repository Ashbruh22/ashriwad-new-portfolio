'use client';

import { motion, type Variants } from 'framer-motion';
import { ArrowDown, ArrowUpRight, MousePointer2 } from 'lucide-react';
import CharacterGaze from '@/components/hero/CharacterGaze';
import { useReducedMotionPreference } from '@/components/ui/ReducedMotionProvider';
import { CONTACT, SITE_TAGLINE } from '@/lib/constants';

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

/**
 * Hero.
 *
 * Every layer sits in the same 1x1 grid cell (`.hero-stack > *`), so the copy,
 * the character and the two display words stack in z-order over one another
 * without any of the absolute-position guesswork that breaks at odd viewport
 * sizes: "AI / ML" renders behind the bust and "DEVELOPER" in front of it,
 * which is what gives the flat sprite its sense of depth.
 *
 * Both display words are aria-hidden — the h1 already carries the whole
 * sentence, and reading the two halves back out of separate layers would only
 * repeat it in the wrong order.
 *
 * Reduced motion collapses every duration to zero rather than dropping the
 * `initial` state: the server always renders the pre-animation markup (it
 * cannot know the preference), so an element with no animation to run would
 * simply stay invisible. Visitors with JS off are covered by the <noscript>
 * rule in app/layout.tsx.
 */
export default function Hero() {
  const { reduced } = useReducedMotionPreference();
  const seconds = (value: number) => (reduced ? 0 : value);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-20 pb-14 lg:px-12"
    >
      <div className="hero-stack mx-auto w-full max-w-[1400px]">
        {/* ── behind everything: the violet stage light ── */}
        <div className="hero-layer" aria-hidden="true">
          <div className="hero-glow" />
        </div>

        {/* ── behind the character ──
             The reveal lives on the wrapper, not on the word: framer-motion
             writes an inline `transform`, which would overwrite the
             character-relative placement the .hero-word-- rules apply. */}
        <div className="hero-layer hero-layer--back" aria-hidden="true">
          <motion.div
            className="hero-reveal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: seconds(0.7), delay: seconds(0.35), ease: EASE }}
          >
            <p className="hero-word hero-word--back">
              AI <span className="opacity-40">/</span> ML
            </p>
          </motion.div>
        </div>

        {/* ── the character ── */}
        <div className="hero-layer hero-layer--character">
          <motion.div
            className="hero-character hero-reveal"
            initial={{ opacity: 0, scale: 0.94, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: seconds(0.9), ease: EASE }}
          >
            <CharacterGaze label="A 3D illustration of Ashriwad Behera in a purple hoodie and cap, turning to follow your cursor." />
          </motion.div>
        </div>

        {/* ── in front of the character ── */}
        <div className="hero-layer hero-layer--front" aria-hidden="true">
          <motion.div
            className="hero-reveal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: seconds(0.7), delay: seconds(0.45), ease: EASE }}
          >
            <p className="hero-word hero-word--front">DEVELOPER</p>
          </motion.div>
        </div>

        {/* ── the copy, on top of the lot ── */}
        <div className="hero-layer hero-layer--copy">
          <motion.div
            className="hero-copy"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              className="hero-heading hero-reveal"
              variants={rise}
              transition={{ duration: seconds(0.55), ease: EASE }}
            >
              <span className="hero-eyebrow">Hi, I&apos;m</span>
              <span className="hero-name silver-text">
                Ashriwad
                <br />
                Behera
              </span>
              <span className="sr-only"> — an AI/ML developer.</span>
            </motion.h1>

            <motion.p
              className="hero-tagline hero-reveal"
              variants={rise}
              transition={{ duration: seconds(0.55), ease: EASE }}
            >
              {SITE_TAGLINE}
            </motion.p>

            <motion.div
              className="hero-actions hero-reveal"
              variants={rise}
              transition={{ duration: seconds(0.55), ease: EASE }}
            >
              <a href="#about" className="hero-cta hero-cta--solid">
                About me
                <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
              </a>
              <a href={`mailto:${CONTACT.email}`} className="hero-cta hero-cta--ghost">
                Get in touch
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── the one hint that the character is interactive ── */}
      <motion.p
        className="hero-hint hero-reveal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: seconds(1.4), duration: seconds(0.6) }}
      >
        <MousePointer2 size={14} strokeWidth={2} aria-hidden="true" />
        Move your cursor — he follows
      </motion.p>
    </section>
  );
}
