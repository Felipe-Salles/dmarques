import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

export const collections = { services, process, differentiators, faq };
