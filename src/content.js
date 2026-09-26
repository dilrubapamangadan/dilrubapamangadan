// Everything you'd want to edit lives here — text, links, projects, skills.

export const profile = {
  name: 'Mohammed Dilruba Pamangadan',
  first: 'DILRUBA',
  last: 'PAMANGADAN',
  monogram: 'MDP',
  role: 'Senior Java Developer · Backend Engineer · Technical Lead',
  headline: 'Building scalable backend systems today. Exploring intelligent software for tomorrow.',
  short:
    'Senior Java Backend Engineer with 8+ years of product-development experience, specializing in Spring Boot, microservices, AWS, databases, and scalable system architecture. Currently exploring AI/ML and Generative AI to build intelligent, production-ready applications.',
  email: 'dilrubapamangadan@gmail.com',
  // Leave a link empty ('') to hide its icon.
  links: {
    linkedin: '',
    github: 'https://github.com/dilrubapamangadan',
  },
  // Portrait: drop a transparent-background PNG at public/me.png.
  // Until then the silhouette in public/me.svg is shown.
  photo: 'me.png',
  photoFallback: 'me.svg',
  stats: [
    { value: 8, suffix: '+', label: 'Years in product engineering' },
    { value: 2018, suffix: '', label: 'Early engineer since' },
  ],
};

export const summary = [
  "I'm a Senior Java Developer with 8+ years of experience building and scaling product-based software, specializing in Java, Spring Boot, Dropwizard, microservices, REST APIs, AWS, and database architecture.",
  'I started my career in 2018 as one of the early engineers at a product-based startup, and have worked across the complete backend lifecycle — from designing systems and databases to development, deployment, CI/CD, cloud infrastructure, and technical leadership.',
];

// Callouts pinned to points on the portrait (x/y are % of the photo box).
export const spec = [
  { key: 'Role', value: 'Senior Java Developer', meta: 'Tech Lead', x: 50, y: 14, side: 'right' },
  { key: 'Core', value: 'Spring Boot · Dropwizard', meta: 'Microservices', x: 36, y: 42, side: 'left' },
  { key: 'Cloud', value: 'AWS ECS · Fargate · Lambda', meta: 'Infrastructure', x: 64, y: 52, side: 'right' },
  { key: 'Now', value: 'LLMs · RAG · Computer Vision', meta: 'AI / ML', x: 46, y: 76, side: 'left' },
];

export const experience = {
  company: 'Product-based startup',
  since: '2018 — Present',
  roles: [
    {
      title: 'Backend Developer',
      period: '2018',
      text: 'Joined as one of the early engineers. Built REST APIs and database schemas for the core product while the platform took shape.',
      points: ['REST APIs', 'MySQL schema design', 'PHP → Java foundations'],
    },
    {
      title: 'Java Developer',
      period: 'Growth',
      text: 'Migrated legacy PHP systems to Java, built reusable backend libraries and moved services onto AWS.',
      points: ['Legacy PHP → Java migration', 'Reusable backend libraries', 'DynamoDB · PostgreSQL'],
    },
    {
      title: 'Senior Java Developer · Tech Lead',
      period: 'Now',
      text: 'Own products from the ground up — backend architecture, technical decisions, delivery planning and production deployment — while leading a small engineering team.',
      points: ['Multi-tenant architecture', 'AWS ECS / Fargate · CI/CD', 'Team leadership'],
    },
  ],
};

export const duel = {
  left: { tag: 'Legacy', title: 'PHP MONOLITH', items: ['Tightly coupled modules', 'Single deploy unit', 'Hand-rolled auth'] },
  right: { tag: 'Modern', title: 'JAVA SERVICES', items: ['Spring Boot · Dropwizard', 'Containers on ECS / Fargate', 'Cognito · Keycloak (OIDC)'] },
  word: 'MIGRATE',
  counter: { from: 2018, to: 2026, label: 'From legacy code to cloud-native systems' },
};

export const projects = [
  {
    no: '01',
    title: 'Multi-tenant SaaS platform',
    text: 'Designed tenant isolation, onboarding and data partitioning for a product serving multiple customer organisations from one platform.',
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS'],
  },
  {
    no: '02',
    title: 'PHP → Java migration',
    text: 'Incrementally replaced legacy PHP modules with Java services without stopping the product — route by route, table by table.',
    stack: ['Dropwizard', 'MySQL', 'REST'],
  },
  {
    no: '03',
    title: 'Reusable backend libraries',
    text: 'Shared libraries for auth, persistence, logging and error handling so every new service starts production-ready.',
    stack: ['Java', 'Maven', 'JUnit'],
  },
  {
    no: '04',
    title: 'Identity & access',
    text: 'Authentication and authorisation with AWS Cognito and Keycloak over OAuth 2.0 / OIDC, including role-based access across services.',
    stack: ['Cognito', 'Keycloak', 'OIDC'],
  },
  {
    no: '05',
    title: 'Cloud delivery pipeline',
    text: 'Containerised services deployed to AWS ECS/Fargate through CI/CD, with Route53, SES and Lambda filling in the edges.',
    stack: ['Docker', 'ECS', 'Fargate', 'CI/CD'],
  },
];

export const skills = [
  { group: 'Languages', items: ['Java', 'Python', 'JavaScript', 'PHP'] },
  { group: 'Backend', items: ['Spring Boot', 'Dropwizard', 'REST APIs', 'Microservices'] },
  { group: 'Databases', items: ['MySQL', 'PostgreSQL', 'DynamoDB'] },
  { group: 'Cloud', items: ['ECS', 'Fargate', 'EC2', 'Lambda', 'Cognito', 'SES', 'Route53'] },
  { group: 'Security', items: ['Keycloak', 'AWS Cognito', 'OAuth / OIDC'] },
  { group: 'Frontend', items: ['Vue.js', 'Nuxt.js', 'jQuery'] },
  { group: 'DevOps', items: ['CI/CD', 'Docker', 'AWS infrastructure'] },
  { group: 'Testing', items: ['JUnit'] },
  { group: 'AI / ML', items: ['LLMs', 'RAG', 'LangChain', 'YOLO', 'ONNX'] },
  { group: 'Architecture', items: ['Multi-tenant', 'Distributed services', 'Reusable libraries', 'DB architecture'] },
];

export const aiJourney = [
  { title: 'Large Language Models', text: 'Prompting, evaluation and the trade-offs of putting an LLM behind a production API.' },
  { title: 'Retrieval-Augmented Generation', text: 'Embeddings, vector search and grounding answers in real company data.' },
  { title: 'LangChain', text: 'Chains, tools and agents for composing multi-step AI workflows.' },
  { title: 'Computer Vision', text: 'Object detection with YOLO and portable inference with ONNX runtimes.' },
  { title: 'AI × Java × Cloud', text: 'Bringing AI capabilities into Java services and AWS — where the real systems already live.' },
];

// Case-study diagrams: nodes on a 600×300 grid, edges as [from, to].
export const cases = [
  {
    title: 'Multi-tenant request flow',
    problem: 'Many customer organisations on one product, each needing isolated data and its own users.',
    approach: 'Tenant resolved at the edge, carried through every service call, enforced at the data layer.',
    stack: ['Route53', 'ALB', 'ECS Fargate', 'Cognito', 'PostgreSQL', 'DynamoDB'],
    outcome: 'New tenants onboard without new infrastructure; one codebase, one deploy.',
    nodes: {
      client: { x: 40, y: 150, label: 'Client' },
      dns: { x: 150, y: 150, label: 'Route53' },
      alb: { x: 260, y: 150, label: 'ALB' },
      auth: { x: 260, y: 50, label: 'Cognito' },
      svcA: { x: 390, y: 95, label: 'Service A' },
      svcB: { x: 390, y: 205, label: 'Service B' },
      pg: { x: 530, y: 95, label: 'Postgres' },
      ddb: { x: 530, y: 205, label: 'DynamoDB' },
    },
    edges: [['client', 'dns'], ['dns', 'alb'], ['alb', 'auth'], ['alb', 'svcA'], ['alb', 'svcB'], ['svcA', 'pg'], ['svcB', 'ddb'], ['svcA', 'svcB']],
  },
  {
    title: 'Strangler-fig migration',
    problem: 'A PHP monolith the business depended on daily — a big-bang rewrite was not an option.',
    approach: 'A routing layer sends migrated endpoints to new Java services while the rest stays on PHP.',
    stack: ['PHP', 'Dropwizard', 'Spring Boot', 'MySQL'],
    outcome: 'Legacy retired module by module with the product live the whole time.',
    nodes: {
      client: { x: 40, y: 150, label: 'Client' },
      router: { x: 180, y: 150, label: 'Router' },
      php: { x: 330, y: 60, label: 'PHP legacy' },
      java1: { x: 330, y: 150, label: 'Java svc' },
      java2: { x: 330, y: 240, label: 'Java svc' },
      db: { x: 510, y: 150, label: 'MySQL' },
    },
    edges: [['client', 'router'], ['router', 'php'], ['router', 'java1'], ['router', 'java2'], ['php', 'db'], ['java1', 'db'], ['java2', 'db']],
  },
  {
    title: 'Shared libraries & delivery',
    problem: 'Every new service re-implemented auth, persistence and logging slightly differently.',
    approach: 'Versioned internal libraries, consumed by each service and shipped through one CI/CD path.',
    stack: ['Java', 'Maven', 'JUnit', 'Docker', 'ECS'],
    outcome: 'New services start secure and observable by default; fixes land everywhere at once.',
    nodes: {
      lib: { x: 70, y: 150, label: 'Core libs' },
      s1: { x: 220, y: 60, label: 'Service' },
      s2: { x: 220, y: 150, label: 'Service' },
      s3: { x: 220, y: 240, label: 'Service' },
      ci: { x: 380, y: 150, label: 'CI/CD' },
      ecs: { x: 530, y: 150, label: 'ECS' },
    },
    edges: [['lib', 's1'], ['lib', 's2'], ['lib', 's3'], ['s1', 'ci'], ['s2', 'ci'], ['s3', 'ci'], ['ci', 'ecs']],
  },
];
