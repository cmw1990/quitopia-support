import { CMSConfig } from './types';

export const cmsConfigs: CMSConfig[] = [
  {
    name: 'TinaCMS',
    description: 'Git-based CMS with real-time visual editing',
    route: '/tools/cms/tina',
    enabled: true,
  },
  {
    name: 'Sanity',
    description: 'Real-time collaborative CMS with GROQ',
    route: '/tools/cms/sanity',
    enabled: true,
  },
  {
    name: 'Payload CMS',
    description: 'Self-hosted TypeScript CMS',
    route: '/tools/cms/payload',
    enabled: true,
  },
  {
    name: 'Strapi',
    description: 'Open-source headless CMS',
    route: '/tools/cms/strapi',
    enabled: true,
  },
  {
    name: 'Keystone',
    description: 'TypeScript-first CMS with GraphQL',
    route: '/tools/cms/keystone',
    enabled: true,
  },
  {
    name: 'Builder.io',
    description: 'Visual CMS with drag-and-drop',
    route: '/tools/cms/builder',
    enabled: true,
  },
  {
    name: 'Decap CMS',
    description: 'Git-based CMS (formerly Netlify CMS)',
    route: '/tools/cms/decap',
    enabled: true,
  },
  {
    name: 'Storyblok',
    description: 'Component-based visual CMS',
    route: '/tools/cms/storyblok',
    enabled: true,
  },
];
