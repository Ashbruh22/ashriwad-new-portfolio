/**
 * Projects data — typed content model.
 * Source: Ashriwad Behera's resume (verbatim copy & exact metrics).
 */

export type ProjectTier = 'featured' | 'grid';

export interface ProjectMetric {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  highlightText?: string;
}

export interface Project {
  id:           string;
  tier:         ProjectTier;
  title:        string;
  tagline:      string;
  description:  string;
  bullets:      string[];
  metrics:      ProjectMetric[];
  technologies: string[];
  links: {
    github?:     string;
    demo?:       string;
    paper?:      string;
  };
  publication?: string;
  date?:        string;
  /** short display name for compact UI (e.g. the project carousel); falls
   * back to `title` when absent */
  shortTitle?:  string;
  /** one-line category tag, e.g. "AI/ML · Full-Stack" */
  category?:    string;
  image?:       { src: string; alt: string };
}

export const projects: Project[] = [
  // ── Featured Projects ──────────────────────────────────────────────────

  {
    id:          'crm-sales-intelligence',
    tier:        'featured',
    title:       'AI-Driven CRM Sales Intelligence System',
    tagline:     'Real-time predictive pipeline with dual-model ML, SHAP explainability, and agentic orchestration',
    description: 'Peer-reviewed and presented at ICIDS 2026. Architected an end-to-end sales intelligence system delivering real-time predictive lead scoring, win-probability forecasting, and automated next-best actions.',
    date:        'May 2026',
    publication: 'Peer-Reviewed at ICIDS 2026',
    bullets: [
      'Engineered a 5-layer real-time data architecture processing lead telemetry, customer interactions, and pipeline stages via REST APIs, webhooks, and Apache Kafka for decoupled ingestion.',
      'Implemented dual-model ML pipeline: an XGBoost classifier for win probability (87.3% accuracy, 0.92 AUC-ROC) and an LSTM regressor for deal cycle duration (4.2-day MAE).',
      'Integrated Redis low-latency caching achieving single-deal inference latencies under 180ms.',
      'Incorporated TreeSHAP explainability to attribute top positive/negative drivers, coupled with an agentic hierarchical decision-tree engine suggesting automated next-best actions.',
      'Completed a 90-day pilot execution generating 1,840 automated workflow actions, accelerating sales velocity by 6.2 days, and raising deal conversion from 57% to 72%.',
    ],
    metrics: [
      { label: 'Model Accuracy', value: 87.3, suffix: '%', decimals: 1 },
      { label: 'Inference Latency', value: 180, suffix: 'ms', decimals: 0 },
      { label: 'Conversion Lift', value: 72, suffix: '%', decimals: 0, prefix: '57% → ' },
      { label: 'Pilot Actions', value: 1840, decimals: 0, prefix: '' },
    ],
    technologies: [
      'Deep Learning',
      'Explainable AI (SHAP)',
      'Agentic Orchestration',
      'Apache Kafka',
      'Redis',
      'XGBoost',
      'LSTM',
      'Python',
    ],
    links: {
      github: 'https://github.com/Ashbruh22',
      paper: '#',
    },
    shortTitle: 'CRM AI Core',
    category:   'AI/ML · Full-Stack',
    image:      { src: '/projects/crm-ai-core.png', alt: 'CRM AI Core pipeline overview dashboard' },
  },

  {
    id:          'clindocmicro',
    tier:        'featured',
    title:       'ClinDocMicro',
    tagline:     'Offline, privacy-first clinical document intelligence microservice with quantized LLMs',
    description: 'Containerized offline NLP microservice designed for zero-internet healthcare environments, enabling local chart review summarization and medical entity extraction with strict privacy compliance.',
    date:        '2025',
    bullets: [
      'Containerized a 6.2GB Docker microservice engineered to execute entirely offline on standard 4-core/8GB CPU infrastructure without cloud dependencies.',
      'Architected a 4-stage document processing pipeline utilizing PaddleOCR, Otsu binarization, Hough transform deskewing, and CLAHE contrast enhancement.',
      'Achieved a weighted F1-score of 0.887 on clinical named entity recognition (NER), matching cloud-hosted BioBERT benchmarks while running locally.',
      'Deployed a 4-bit quantized Microsoft Phi-3-Mini model via llama-cpp-python enforced with strict XML schema constraints, reducing output hallucination rates from 14.7% down to 2.1%.',
      'Implemented a FHIR R4-compliant FastAPI architecture adhering to DPDP Act 2023 zero-data-at-rest principles, reducing clinician chart-review time by 71.2% across 200 validated records.',
    ],
    metrics: [
      { label: 'Entity Extraction F1', value: 0.887, decimals: 3 },
      { label: 'Chart Review Saved', value: 71.2, suffix: '%', decimals: 1 },
      { label: 'Hallucination Rate', value: 2.1, suffix: '%', decimals: 1, prefix: '14.7% → ' },
      { label: 'Docker Footprint', value: 6.2, suffix: 'GB', decimals: 1 },
    ],
    technologies: [
      'Python',
      'Docker',
      'FastAPI',
      'PaddleOCR',
      'Phi-3-Mini',
      'Llama.cpp',
      'FHIR R4',
      'DPDP Act 2023',
    ],
    links: {
      github: 'https://github.com/Ashbruh22',
    },
    category: 'AI/ML · Offline Microservice',
    image:    { src: '/projects/clindocmicro.png', alt: 'ClinDocMicro clinical document intelligence landing page' },
  },

  // ── Grid Projects ──────────────────────────────────────────────────────

  {
    id:          'enginuity-360',
    tier:        'grid',
    title:       'Enginuity 360',
    tagline:     'Smart engineering dashboard for AI-driven analytics and visualization',
    description: 'Spring Boot and PostgreSQL backend for AI-driven analytics and visualization, with Dockerized services orchestrated through Apache Airflow.',
    bullets:     [
      'Built a Spring Boot and PostgreSQL backend for AI-driven analytics and visualization.',
      'Dockerized services and orchestrated workflows with Apache Airflow.',
    ],
    metrics:     [],
    technologies:['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Apache Airflow'],
    links:       { github: 'https://github.com/Ashbruh22' },
  },

  {
    id:          'mental-health-insight',
    tier:        'grid',
    title:       'Mental Health Insight',
    tagline:     'NLP sentiment analysis pipeline for mental health insight',
    description: 'NLP pipeline using TF-IDF vectorization and NLTK-style lexicons for sentiment analysis, with a logistic regression classifier evaluated through F1 and accuracy.',
    bullets:     [
      'Applied TF-IDF vectorization and NLTK-style lexicons for sentiment analysis.',
      'Evaluated a scikit-learn logistic regression classifier with F1 and accuracy metrics using Pandas preprocessing.',
    ],
    metrics:     [],
    technologies:['Python', 'Pandas', 'NLTK', 'Scikit-learn', 'TF-IDF'],
    links:       { github: 'https://github.com/Ashbruh22' },
  },

  {
    id:          'facial-age-gender',
    tier:        'grid',
    title:       'Facial Age & Gender Prediction',
    tagline:     'Real-time computer vision model for facial attribute classification',
    description: 'Deep learning model for facial age and gender classification using OpenCV for real-time capture and preprocessing, CNN techniques, and image augmentation.',
    bullets:     [
      'Built a deep learning model for facial age and gender prediction with CNN techniques.',
      'Used OpenCV for real-time capture and preprocessing with image augmentation.',
    ],
    metrics:     [],
    technologies:['OpenCV', 'Python', 'CNN', 'Image Augmentation'],
    links:       { github: 'https://github.com/Ashbruh22' },
  },
];

export const featuredProjects = projects.filter((p) => p.tier === 'featured');
export const gridProjects     = projects.filter((p) => p.tier === 'grid');
