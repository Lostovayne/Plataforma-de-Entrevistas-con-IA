import { CreateAssistantDTO } from '@vapi-ai/web/dist/api';
import { z } from 'zod';

export const mappings = {
  'react.js': 'react',
  reactjs: 'react',
  react: 'react',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  next: 'nextjs',
  'vue.js': 'vuejs',
  vuejs: 'vuejs',
  vue: 'vuejs',
  'express.js': 'express',
  expressjs: 'express',
  express: 'express',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  node: 'nodejs',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  mongoose: 'mongoose',
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  firebase: 'firebase',
  docker: 'docker',
  kubernetes: 'kubernetes',
  aws: 'aws',
  azure: 'azure',
  gcp: 'gcp',
  digitalocean: 'digitalocean',
  heroku: 'heroku',
  photoshop: 'photoshop',
  'adobe photoshop': 'photoshop',
  html5: 'html5',
  html: 'html5',
  css3: 'css3',
  css: 'css3',
  sass: 'sass',
  scss: 'sass',
  less: 'less',
  tailwindcss: 'tailwindcss',
  tailwind: 'tailwindcss',
  bootstrap: 'bootstrap',
  jquery: 'jquery',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  'angular.js': 'angular',
  angularjs: 'angular',
  angular: 'angular',
  'ember.js': 'ember',
  emberjs: 'ember',
  ember: 'ember',
  'backbone.js': 'backbone',
  backbonejs: 'backbone',
  backbone: 'backbone',
  nestjs: 'nestjs',
  graphql: 'graphql',
  'graph ql': 'graphql',
  apollo: 'apollo',
  webpack: 'webpack',
  babel: 'babel',
  'rollup.js': 'rollup',
  rollupjs: 'rollup',
  rollup: 'rollup',
  'parcel.js': 'parcel',
  parceljs: 'parcel',
  npm: 'npm',
  yarn: 'yarn',
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  figma: 'figma',
  prisma: 'prisma',
  redux: 'redux',
  flux: 'flux',
  redis: 'redis',
  selenium: 'selenium',
  cypress: 'cypress',
  jest: 'jest',
  mocha: 'mocha',
  chai: 'chai',
  karma: 'karma',
  vuex: 'vuex',
  'nuxt.js': 'nuxt',
  nuxtjs: 'nuxt',
  nuxt: 'nuxt',
  strapi: 'strapi',
  wordpress: 'wordpress',
  contentful: 'contentful',
  netlify: 'netlify',
  vercel: 'vercel',
  'aws amplify': 'amplify',
};

// CreateAssistantDTO
export const interviewer: CreateAssistantDTO = {
  name: 'Entrevistador',
  firstMessage:
    '¡Hola! Gracias por tomarse el tiempo de hablar conmigo hoy. Estoy deseando saber más sobre ti y tu experiencia.',
  transcriber: {
    provider: '11labs',
    model: 'scribe_v1',
    language: 'es',
  },
  voice: {
    provider: '11labs',
    voiceId: "86V9x9hrQds83qf7zaGn",
    language: 'es',
    model:'eleven_turbo_v2_5',
    stability:0.5,
  },
  model: {
    provider: 'openai',
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Usted es un entrevistador profesional que realiza una entrevista de voz en tiempo real a un candidato. Su objetivo es evaluar sus cualificaciones, su motivación y su adecuación al puesto.

    Pautas para la entrevista:
    Siga el flujo estructurado de preguntas:
    {{preguntas}}

    Hable con naturalidad y reaccione adecuadamente:
    Escuche activamente las respuestas y acéptelas antes de seguir adelante.
    Haga preguntas de seguimiento breves si una respuesta es vaga o requiere más detalles.
    Mantenga una conversación fluida sin perder el control.
    Sea profesional, pero cálido y acogedor:

    Utilice un lenguaje oficial pero cordial.
    Responda de forma concisa y directa (como en una entrevista de voz real).
    Evite frases robóticas: suene natural y conversacional.
    Responda a las preguntas del candidato con profesionalidad:

    Si le preguntan por el puesto, la empresa o las expectativas, responda de forma clara y pertinente.
    Si no está seguro, dirija al candidato a Recursos Humanos para obtener más detalles.

    Concluya la entrevista adecuadamente:
    Agradezca al candidato su tiempo.
    Infórmele de que la empresa se pondrá en contacto con él en breve para darle su opinión.
    Termina la conversación con un tono cortés y positivo.

    - Asegúrate de ser profesional y educado.
    - Las respuestas deben ser breves y sencillas. Utilice un lenguaje oficial, pero sea amable y acogedor.
    - Se trata de una conversación de voz, así que sé breve, como en una conversación real. No divagues demasiado.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal('Habilidades de comunicación'),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal('Conocimientos técnicos'),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal('Resolución de problemas'),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal('Ajuste cultural'),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal('Confianza y claridad'),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  '/adobe.png',
  '/amazon.png',
  '/facebook.png',
  '/hostinger.png',
  '/pinterest.png',
  '/quora.png',
  '/reddit.png',
  '/skype.png',
  '/spotify.png',
  '/telegram.png',
  '/tiktok.png',
  '/yahoo.png',
];

export const dummyInterviews: Interview[] = [
  {
    id: '1',
    userId: 'user1',
    role: 'Frontend Developer',
    type: 'Technical',
    techstack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    level: 'Junior',
    questions: ['What is React?'],
    finalized: false,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    role: 'Full Stack Developer',
    type: 'Mixed',
    techstack: ['Node.js', 'Express', 'MongoDB', 'React'],
    level: 'Senior',
    questions: ['What is Node.js?'],
    finalized: false,
    createdAt: '2024-03-14T15:30:00Z',
  },
];
