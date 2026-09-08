/**
 * Experience data — typed content model.
 * Source: Ashriwad Behera's resume (exact copy & metrics).
 */

export interface ExperienceEntry {
  id:           string;
  role:         string;
  company:      string;
  type:         string;
  location:     string;
  period:       string;
  startDate:    string;
  endDate:      string | null;
  /** one-line condensed pitch for the timeline view — the full detail lives
   * in `bullets` below (kept for potential reuse, e.g. a future /resume page). */
  summary:      string;
  bullets:      string[];
  technologies: string[];
  link?:        string;
}

export const experience: ExperienceEntry[] = [
  {
    id:           'rideabit',
    role:         'Backend Developer Intern (SDE Intern)',
    company:      'RideAbit',
    type:         'Internship — Remote',
    location:     'Remote, India',
    period:       'Apr 2026 – May 2026',
    startDate:    '2026-04-01',
    endDate:      '2026-05-31',
    summary:
      'Engineered secure, low-latency backend systems for a ridesharing platform — coin-ledger schemas and fraud-resistant transaction logic, built with Next.js Server Actions, Supabase, and PostgreSQL.',
    bullets:      [
      'Engineered secure, low-latency backend architectures for a ridesharing platform using Next.js Server Actions and Supabase/PostgreSQL adhering to OWASP security standards.',
      'Designed coin/rewards ledger schema (user_coin_balances, coin_transactions) with strict ACID transactions to ensure auditability and prevent concurrency issues.',
      'Implemented defensive business logic preventing refund exploits and race conditions on cancelled rides.',
      'Replaced external worker queue infrastructure (BullMQ) with native Supabase pg_cron scheduled jobs, reducing overhead and infrastructure dependency.',
      'Redesigned referral and onboarding flow, decoupling referral code validation from the OTP step to eliminate signup drop-offs.',
    ],
    technologies: [
      'Next.js Server Actions',
      'Supabase',
      'PostgreSQL',
      'pg_cron',
      'OWASP Security',
      'TypeScript',
    ],
  },
  {
    id:           'happiest-minds',
    role:         'AI/ML & Product Engineering Intern',
    company:      'Happiest Minds Technologies',
    type:         'Internship — On-site',
    location:     'Bangalore, India',
    period:       'Jun 2025 – Jul 2025',
    startDate:    '2025-06-01',
    endDate:      '2025-07-31',
    summary:
      'Built REST APIs, automated data pipelines, and CI/CD quality gates for an internal analytics platform, working with Spring Boot, PostgreSQL, and Apache Airflow.',
    bullets:      [
      'Developed Spring Boot REST APIs and optimized PostgreSQL database schemas for the internal Enginuity 360 platform.',
      'Engineered automated Spring Batch jobs for large-scale GitHub repository and developer analytics data ingestion.',
      'Configured Apache Airflow DAGs to orchestrate multi-step data extraction workflows targeting OpenCost APIs.',
      'Integrated automated test suites into Jenkins and SonarQube CI/CD pipelines to enforce code quality and coverage thresholds.',
      'Collaborated within an Agile product team alongside senior engineers to design robust enterprise services.',
    ],
    technologies: [
      'Spring Boot',
      'Java',
      'Spring Batch',
      'PostgreSQL',
      'Apache Airflow',
      'OpenCost API',
      'Jenkins',
      'SonarQube',
    ],
  },
];
