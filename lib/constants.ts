/**
 * Site-wide constants and shared content data.
 *
 * Content model: all shared metadata lives here so that changes
 * to name, role, links, etc. are a single data update — not a
 * JSX search-and-replace. Per requirements §6 / §11.
 *
 * TODO (Phase 6+): split experience, projects, skills into
 * their own typed files: lib/experience.ts, lib/projects.ts, lib/skills.ts
 */

// ─── Identity ─────────────────────────────────────────────────────────────

export const SITE_NAME = 'Ashriwad Behera';

export const SITE_ROLE = 'AI/ML Engineer & Full-Stack Builder';

export const SITE_TAGLINE =
  'Turning ideas into intelligent, useful, and well-built digital experiences.';

export const SITE_DESCRIPTION =
  'Ashriwad Behera — AI/ML Engineer & Full-Stack Builder. ' +
  'Final-year CS (AI & ML) student at SRM IST, Chennai. ' +
  'Specialising in production ML pipelines, agentic systems, and full-stack engineering.';

// ─── Contact / social ─────────────────────────────────────────────────────

export const CONTACT = {
  email:    'ashriwad.behera@gmail.com',
  github:   'https://github.com/Ashbruh22',
  linkedin: 'https://linkedin.com/in/ashriwad-behera',
  // TODO: placeholder handle — confirm/replace with the real profile before
  // deploying (same "placeholder, not verified" status as RESUME_PATH below).
  instagram: 'https://instagram.com/ashriwad_behera',
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────

// Nav is trimmed to the primary sections; Certifications and Contact stay on
// the page (linked from the hero "Get in touch" CTA, résumé link, and footer)
// but aren't in the top nav.
export const NAV_LINKS = [
  { href: '#about',      label: 'About'      },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects'   },
  { href: '#skills',     label: 'Skills'     },
] as const;

// ─── Asset paths ──────────────────────────────────────────────────────────

// The file at this path is the real résumé (phone number redacted) — the
// name is a holdover from when it was a 0-byte stub, kept as-is so the
// path doesn't need touching again.
export const RESUME_PATH = '/resume-placeholder.pdf';

// `download` attribute value on every résumé link (Hero, Nav, Contact) —
// without this the browser saves the file under RESUME_PATH's own
// basename ("resume-placeholder.pdf"), which is what the file is *named
// on disk*, not what a visitor should see in their downloads folder.
export const RESUME_DOWNLOAD_NAME = 'Ashriwad_Resume.pdf';

export const OG_IMAGE_PATH   = '/og-image.png';
export const POSTER_PATH     = '/poster.png';
export const FAVICON_PATH    = '/favicon.ico';

// ─── SEO ──────────────────────────────────────────────────────────────────

// Update again if/when a custom domain is attached in Vercel — this is the
// real assigned production alias as of the first deploy.
export const SITE_URL = 'https://portfoliowebsite-three-blush.vercel.app';

export const SEO = {
  title:       `${SITE_NAME} — AI/ML Engineer & Full-Stack Builder`,
  description: SITE_DESCRIPTION,
  ogImage:     OG_IMAGE_PATH,
  siteUrl:     SITE_URL,
} as const;

// ─── Experience ───────────────────────────────────────────────────────────

// Most recent first. Roles/companies/dates per PROJECT_REQUIREMENTS.md §4.4;
// `summary` is deliberately empty until the real achievement lines are
// supplied — the timeline renders without it rather than carrying invented copy.
export const EXPERIENCE = [
  {
    company: 'RideAbit',
    role: 'Backend Developer Intern',
    period: 'Apr – May 2026',
    location: 'Remote',
    summary: '',
  },
  {
    company: 'Happiest Minds Technologies',
    role: 'AI/ML & Product Engineering Intern',
    period: 'Jun – Jul 2025',
    location: 'Bangalore, India',
    summary: '',
  },
] as const;

// ─── Education ────────────────────────────────────────────────────────────

export const EDUCATION = {
  degree:      'B.Tech CSE (AI & ML)',
  institution: 'SRM Institute of Science and Technology',
  location:    'Chennai, India',
  period:      '2023 – 2027 (Expected)',
  cgpa:        '8.45 / 10.0',
} as const;
