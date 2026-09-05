import type { Config } from 'tailwindcss';

/**
 * Minimal / Vercel-like. The legacy accent tokens (violet/cyan/pink/indigo/
 * amber) are all remapped to a single muted grey so existing utility classes
 * across the sections resolve to a restrained monochrome look without editing
 * every file. `accent` stays the one blue, used deliberately in a few places.
 */
const MUTED = '#8b8f99';

const config: Config = {
  darkMode: ['class', '.dark'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        indigo: MUTED,
        violet: MUTED,
        cyan: MUTED,
        pink: MUTED,
        amber: MUTED,
      },
      fontFamily: {
        display: ['var(--font-geist-sans)'],
        body: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
