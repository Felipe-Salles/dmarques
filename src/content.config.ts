import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PROJECT_TYPE_VALUES } from './content/project-types';

const SERVICE_ICONS = ['sites', 'sistemas', 'solucoes-web', 'automacoes'] as const;

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    titulo: z.string().min(3).max(60),
    descricao: z.string().min(20).max(180),
    icon: z.enum(SERVICE_ICONS),
  }),
});

const process = defineCollection({
  loader: glob({ base: './src/content/process', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    numero: z.string().regex(/^\d{2}$/),
    titulo: z.string().min(3).max(60),
    descricao: z.string().min(20).max(200),
  }),
});

const differentiators = defineCollection({
  loader: glob({ base: './src/content/differentiators', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    titulo: z.string().min(3).max(80),
    descricao: z.string().min(10).max(160),
  }),
});

const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    pergunta: z.string().min(8).max(160),
    resposta: z.string().min(20).max(600),
  }),
});

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.strictObject({
      titulo: z.string().min(3).max(80),
      rotulo: z.enum(['projeto próprio', 'demo']),
      tipo: z.enum(PROJECT_TYPE_VALUES),
      cover: image(),
      coverAlt: z.string().min(5).max(160),
      problema: z.string().min(40).max(600),
      solucao: z.string().min(40).max(600),
      resultado: z.string().min(40).max(600),
      order: z.number().int().nonnegative(),
    }),
});

export const collections = { services, process, differentiators, faq, cases };
