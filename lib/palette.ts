/**
 * Single source of truth for colour — consumed by the CSS token layer
 * (app/globals.css), Tailwind (tailwind.config.ts), and the 3D scene.
 *
 * Direction: minimal, Vercel-like. Near-monochrome on a near-black ground,
 * with a single restrained blue accent used only for links, focus rings and
 * the character's laptop screen.
 */

export const PALETTE = {
  // dark (primary)
  bgDark: '#0a0a0a',
  bgElevatedDark: '#111111',
  textDark: '#ededed',
  textDarkMuted: '#a1a1a1',
  borderDark: '#262626',

  // light
  bgLight: '#ffffff',
  bgElevatedLight: '#fafafa',
  textLight: '#0a0a0a',
  textLightMuted: '#666666',
  borderLight: '#ebebeb',

  // the one accent
  accent: '#3291ff',
  accentStrong: '#0070f3',

  // 3D chrome orb — anchor tones the procedural matcap ramps between
  // (built in components/three/orbMatcap.ts). Near-monochrome; the accent tint
  // is the single point of colour, a faint blue bounce on the lower-right.
  orbMatcapHi: '#f6f6f7',
  orbMatcapMid: '#9c9ca1',
  orbMatcapLo: '#0b0b0c',
  orbAccentTint: '#5a82be',
} as const;
