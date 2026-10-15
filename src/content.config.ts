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

const processCollection = defineCollection({
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

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: ({ image }) => {
    const proprio = z.strictObject({
      rotulo: z.literal('projeto próprio'),
      titulo: z.string().min(3).max(80),
      tipo: z.enum(PROJECT_TYPE_VALUES),
      url: z.string().min(4).max(60),
      cover: image(),
      coverAlt: z.string().min(5).max(160),
      resultados: z
        .array(
          z.strictObject({
            valor: z.string().min(1).max(12),
            legenda: z.string().min(3).max(60),
          }),
        )
        .length(3),
      problema: z.string().min(40).max(600),
      solucao: z.string().min(40).max(600),
      resultado: z.string().min(40).max(600),
      order: z.number().int().nonnegative(),
    });
    const exemplo = z.strictObject({
      rotulo: z.literal('exemplo de escopo'),
      titulo: z.string().min(3).max(80),
      descricao: z.string().min(20).max(200),
      tipo: z.enum(PROJECT_TYPE_VALUES),
      mock: z.enum(['agenda', 'clinica', 'pedidos']),
      order: z.number().int().nonnegative(),
    });
    return z.discriminatedUnion('rotulo', [proprio, exemplo]);
  },
});

export const collections = { services, process: processCollection, differentiators, cases };
