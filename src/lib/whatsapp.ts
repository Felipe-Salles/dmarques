import { stripControl } from './form-schema.ts';

export const WHATSAPP_NUMBER = '5516996111785';

export const GENERIC_WA_TEXT = 'Olá! Vim pelo site da Dmarques e quero pedir um orçamento.';

export function buildWaUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function serviceWaText(service: string): string {
  return `Olá! Vim pelo site e quero falar sobre ${service}.`;
}

export function fallbackWaText(nome?: string, tipoLabel?: string): string {
  const name = stripControl(nome ?? '').slice(0, 80);
  const tipo = stripControl(tipoLabel ?? '');
  if (name && tipo) return `Olá! Sou ${name}. Vim pelo site e quero falar sobre ${tipo}.`;
  if (name) return `Olá! Sou ${name}. Vim pelo site e quero pedir um orçamento.`;
  if (tipo) return `Olá! Vim pelo site e quero falar sobre ${tipo}.`;
  return 'Olá! Vim pelo site e quero pedir um orçamento.';
}
