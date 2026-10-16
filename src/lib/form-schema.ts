export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  phoneRawMax: 20,
  emailMax: 120,
  messageMax: 1000,
} as const;

export const HONEYPOT_FIELD = 'empresa-site';
export const ELAPSED_FIELD = 'elapsed-ms';

export const TIMING = { minMs: 3000, maxMs: 86400000 } as const;

export const EMAIL_RE = /^[^\s@<>,;"()[\]\\]+@[^\s@<>,;"()[\]\\.]+(?:\.[^\s@<>,;"()[\]\\.]+)*\.[^\s@<>,;"()[\]\\.]{2,}$/;

export const CHANNEL_FIELD = 'canal';
export const CHANNELS = ['whatsapp', 'email'] as const;
export type Channel = (typeof CHANNELS)[number];
export const DEFAULT_CHANNEL: Channel = 'whatsapp';
export const CHANNEL_LABELS = { whatsapp: 'WhatsApp', email: 'E-mail' } as const;

export function resolveChannel(value?: string): Channel {
  return (CHANNELS as readonly string[]).includes(value ?? '') ? (value as Channel) : DEFAULT_CHANNEL;
}

const CONTROL_RE = /[\u0000-\u001f\u007f\u2028\u2029]/g;
const CONTROL_KEEP_LF_RE = /[\u0000-\u0009\u000b-\u001f\u007f\u2028\u2029]/g;

export function stripControl(value: string): string {
  return value.replace(CONTROL_RE, ' ').trim();
}

export function cleanMultiline(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(CONTROL_KEEP_LF_RE, '').trim();
}

export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  if (digits.length >= 12) digits = digits.replace(/^0+/, '');
  if (!/^[1-9]{2}\d{8,9}$/.test(digits)) return null;
  if (digits.length === 11 && digits[2] !== '9') return null;
  return digits;
}

export function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

export type FieldError = 'nome' | 'whatsapp' | 'email' | 'mensagem';

export type FieldInput = {
  nome?: string;
  canal?: string;
  whatsapp?: string;
  email?: string;
  mensagem?: string;
};

export function validateFields(input: FieldInput): { ok: boolean; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const canal = resolveChannel(input.canal);
  const nome = stripControl(input.nome ?? '');
  if (nome.length < LIMITS.nameMin || nome.length > LIMITS.nameMax) errors.push('nome');

  if (canal === 'whatsapp') {
    const whatsapp = stripControl(input.whatsapp ?? '');
    if (
      whatsapp.length === 0 ||
      whatsapp.length > LIMITS.phoneRawMax ||
      normalizePhone(whatsapp) === null
    ) {
      errors.push('whatsapp');
    }
  } else {
    const email = stripControl(input.email ?? '');
    if (email.length === 0 || email.length > LIMITS.emailMax || !EMAIL_RE.test(email)) {
      errors.push('email');
    }
  }

  const mensagem = cleanMultiline(input.mensagem ?? '');
  if (mensagem.length > LIMITS.messageMax) errors.push('mensagem');

  return { ok: errors.length === 0, errors };
}
