import type { NextConfig } from 'next';

/**
 * Security headers (§10 of PROJECT_REQUIREMENTS.md).
 *
 * CSP origins are scoped to what this project actually uses:
 *  - fonts.googleapis.com / fonts.gstatic.com removed (next/font self-hosts fonts)
 *  - script-src: 'self' only — no external JS CDNs
 *  - style-src: 'self' 'unsafe-inline' — required for Tailwind CSS-in-JS and next-themes
 *
 * Update origins when analytics or third-party embeds are added (per §10 note).
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      // Next.js injects small inline bootstrap scripts for the App Router.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization config
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Strict mode for catching React issues early
  reactStrictMode: true,
};

export default nextConfig;
