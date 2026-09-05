import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider';
import { ReducedMotionProvider } from '@/components/ui/ReducedMotionProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import DotBackground from '@/components/ui/DotBackground';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import SocialDock from '@/components/ui/social-dock';
import { SEO, SITE_NAME, SITE_URL, OG_IMAGE_PATH, SITE_ROLE, CONTACT } from '@/lib/constants';
import './globals.css';
import { cn } from "@/lib/utils";

// ─── Fonts via next/font/google (self-hosted) ─────────────────────────────
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default:  SEO.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO.description,
  metadataBase: new URL(SITE_URL),

  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       SEO.title,
    description: SEO.description,
    images: [
      {
        url:    OG_IMAGE_PATH,
        width:  1200,
        height: 630,
            alt:    `${SITE_NAME} — ${SITE_ROLE}`,
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       SEO.title,
    description: SEO.description,
    images:      [OG_IMAGE_PATH],
  },

  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon.ico',
    apple:       '/apple-touch-icon.png',
  },
};

// ─── Viewport ─────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
  ],
};

// ─── JSON-LD Structured Data Schema ───────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      jobTitle: SITE_ROLE,
      url: SITE_URL,
      image: `${SITE_URL}${OG_IMAGE_PATH}`,
      sameAs: [CONTACT.github, CONTACT.linkedin],
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'SRM Institute of Science and Technology',
      },
      knowsAbout: [
        'Artificial Intelligence',
        'Machine Learning',
        'Explainable AI',
        'Natural Language Processing',
        'Full-Stack Web Development',
        'FastAPI',
        'Next.js',
        'Docker',
        'Apache Kafka',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: `${SITE_NAME} — Portfolio`,
      description: SEO.description,
      publisher: {
        '@id': `${SITE_URL}/#person`,
      },
      inLanguage: 'en-US',
    },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistSans.variable, geistMono.variable, 'font-sans')}
    >
      <head>
        {/* The hero character's 3x3 sprite sheet is the page's hero image —
            start it in parallel with the CSS that references it. */}
        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/hero/character-poster.webp"
          fetchPriority="high"
        />

        {/* Without JS the hero's entrance animations never run, so the markup
            framer-motion server-renders (opacity 0, pre-transform) would be all
            a visitor ever sees. Only the reveal wrappers are reset — the words'
            own placement transforms live on the elements inside them. */}
        <noscript>
          <style>{'.hero-reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>

        {/* Inject JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen text-[var(--text-primary)] antialiased">
        <ThemeProvider>
          <ReducedMotionProvider>
            <SmoothScrollProvider>
              {/* Accessibility: skip link is the first focusable element */}
              <a href="#main" className="skip-link">
                Skip to content
              </a>

              {/* Interactive dot field, fixed behind everything */}
              <DotBackground />

              <Nav />

              <main id="main" tabIndex={-1}>
                {children}
              </main>

              <Footer />

              <SocialDock />
            </SmoothScrollProvider>
          </ReducedMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
