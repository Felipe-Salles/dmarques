import { z } from 'zod';
import { PROJECT_TYPE_VALUES, type ProjectType } from '../content/project-types.ts';
import {
  CHANNELS,
  type Channel,
  cleanMultiline,
  EMAIL_RE,
  LIMITS,
  normalizePhone,
  stripControl,
} from './form-schema.ts';

export type Submission = {
  nome: string;
  canal: Channel;
  whatsapp?: string;
  email?: string;
  tipoProjeto?: ProjectType;
  mensagem?: string;
};

export type ParseResult = { ok: true; data: Submission } | { ok: false; fields: string[] };

export const submissionSchema = z
  .object({
    nome: z
      .string()
      .transform(stripControl)
      .pipe(z.string().min(LIMITS.nameMin).max(LIMITS.nameMax)),
    canal: z.enum(CHANNELS),
    whatsapp: z
      .string()
      .transform(stripControl)
      .pipe(z.string().max(LIMITS.phoneRawMax))
      .optional(),
    email: z
      .string()
      .transform(stripControl)
      .pipe(z.string().max(LIMITS.emailMax).regex(EMAIL_RE))
      .optional(),
    'tipo-projeto': z.enum(PROJECT_TYPE_VALUES).optional(),
    mensagem: z
      .string()
      .transform(cleanMultiline)
      .pipe(z.string().max(LIMITS.messageMax))
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.canal === 'whatsapp') {
      if (value.whatsapp === undefined || normalizePhone(value.whatsapp) === null) {
        ctx.addIssue({ code: 'custom', path: ['whatsapp'] });
      }
    } else if (value.email === undefined) {
      ctx.addIssue({ code: 'custom', path: ['email'] });
    }
  });

export function parseSubmission(form: Record<string, string>): ParseResult {
  const input: Record<string, string> = {};
  for (const [key, value] of Object.entries(form)) {
    if (typeof value === 'string' && value.trim() !== '') input[key] = value;
  }
  if (input.canal === 'whatsapp') delete input.email;
  else if (input.canal === 'email') delete input.whatsapp;

  const result = submissionSchema.safeParse(input);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    return { ok: false, fields };
  }

  const v = result.data;
  const data: Submission = { nome: v.nome, canal: v.canal };
  if (v.canal === 'whatsapp' && v.whatsapp !== undefined) {
    data.whatsapp = normalizePhone(v.whatsapp) ?? undefined;
  }
  if (v.canal === 'email') data.email = v.email;
  if (v['tipo-projeto'] !== undefined) data.tipoProjeto = v['tipo-projeto'];
  if (v.mensagem !== undefined) data.mensagem = v.mensagem;
  return { ok: true, data };
}
