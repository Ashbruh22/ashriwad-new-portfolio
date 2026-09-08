/**
 * Skills data — typed content model.
 * Source: Ashriwad Behera's resume (verbatim).
 */

export interface SkillGroup {
  id:     string;
  label:  string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id:     'languages',
    label:  'Languages',
    skills: ['Python', 'TypeScript', 'Java', 'C', 'C++'],
  },
  {
    id:     'frameworks',
    label:  'Frameworks',
    skills: ['React', 'React Native', 'Spring Boot', 'FastAPI'],
  },
  {
    id:     'ai-ml',
    label:  'AI / ML & Data Science',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Scikit-learn',
      'TF-IDF',
      'NLTK',
      'OpenCV',
      'NumPy',
      'Pandas',
      'Logistic Regression',
      'Sentiment Analysis',
      'Image Processing',
      'F1 Score Evaluation',
    ],
  },
  {
    id:     'backend-db',
    label:  'Backend & Databases',
    skills: [
      'PostgreSQL',
      'Supabase',
      'SQL',
      'REST APIs',
      'Next.js (Server Actions)',
      'Apache Airflow',
      'Spring Batch',
      'pg_cron',
    ],
  },
  {
    id:     'cloud-devops',
    label:  'Cloud & DevOps',
    skills: [
      'Docker',
      'Kubernetes',
      'Jenkins',
      'SonarQube',
      'Red Hat OpenShift',
      'Podman',
    ],
  },
  {
    id:     'security-practices',
    label:  'Security & Practices',
    skills: [
      'OWASP Standards',
      'Secure Development',
      'Agile',
      'Defensive Programming',
      'API Integration',
    ],
  },
];

export interface Certification {
  id:       string;
  title:    string;
  issuer:   string;
  type:     'cert' | 'hackathon' | 'club';
}

export const certifications: Certification[] = [
  { id: 'sap-genai',       title: 'SAP Certified - SAP Generative AI Developer', issuer: 'SAP', type: 'cert' },
  { id: 'mathworks-1',     title: 'Artificial Intelligence and Deep Learning Techniques', issuer: 'MathWorks', type: 'cert' },
  { id: 'mathworks-2',     title: 'Machine Learning Onramp', issuer: 'MathWorks', type: 'cert' },
  { id: 'meta-databases',  title: 'Introduction to Databases', issuer: 'Meta', type: 'cert' },
  { id: 'redhat-openshift',title: 'Red Hat OpenShift Development I: Introduction to Containers with Podman', issuer: 'Red Hat', type: 'cert' },
  { id: 'cisco-networking',title: 'Networking Basics', issuer: 'Cisco Networking Academy', type: 'cert' },
  { id: 'c-bootcamp',      title: 'C Programming Bootcamp', issuer: 'C Programming Bootcamp', type: 'cert' },
  { id: 'dayzero',         title: 'DAYZERO Hackathon (Team Lead)',    issuer: 'DAYZERO',      type: 'hackathon' },
  { id: 'centinels',       title: 'Centinels Cyber Security Club',    issuer: 'SRM IST',      type: 'club'      },
];

export const leadership = [
  {
    id: 'dayzero-lead',
    role: 'Team Lead - AI & Machine Learning Track',
    event: 'DAYZERO Hackathon',
    description: 'Led team building a sentiment analysis backend and designed the ML pipeline: Pandas preprocessing, logistic regression via scikit-learn, and F1 evaluation.',
    type: 'hackathon' as const,
  },
  {
    id: 'centinels-club',
    role: 'Member',
    event: 'Centinels Cyber Security Club, SRM University Chennai',
    description: 'Member of Centinels Cyber Security Club, SRM University Chennai (Nov 2024).',
    type: 'club' as const,
  },
];
