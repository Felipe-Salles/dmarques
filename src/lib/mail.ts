import type { ProjectType } from '../content/project-types.ts';
import { PROJECT_TYPES } from '../content/project-types.ts';
import { escapeHtml } from './escape-html.ts';
import type { Submission } from './form-schema.server.ts';
import { CHANNEL_LABELS, type Channel, formatPhone, stripControl } from './form-schema.ts';

export type OutgoingEmail = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

function projectLabel(tipo: ProjectType): string {
  return PROJECT_TYPES.find((t) => t.value === tipo)?.label ?? '';
}

export function subjectFor(nome: string, canal: Channel, tipo?: ProjectType): string {
  let subject = `Novo orçamento: ${stripControl(nome).slice(0, 60)}`;
  if (tipo !== undefined) {
    const label = projectLabel(tipo);
    if (label) subject += ` — ${label}`;
  }
  subject += ` (${CHANNEL_LABELS[canal]})`;
  return stripControl(subject);
}

type Row = { label: string; text: string; html: string };

export function buildEmail(data: Submission, addr: { from: string; to: string }): OutgoingEmail {
  const nome = stripControl(data.nome);
  const rows: Row[] = [
    { label: 'Nome', text: nome, html: escapeHtml(nome) },
    {
      label: 'Contato preferido',
      text: CHANNEL_LABELS[data.canal],
      html: escapeHtml(CHANNEL_LABELS[data.canal]),
    },
  ];

  let replyTo: string | undefined;

  if (data.canal === 'whatsapp' && data.whatsapp) {
    const digits = data.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${digits}`;
    rows.push({
      label: 'WhatsApp',
      text: `${formatPhone(digits)}\n${url}`,
      html: `<a href="${escapeHtml(url)}">${escapeHtml(formatPhone(digits))}</a>`,
    });
  }

  if (data.canal === 'email' && data.email) {
    const email = stripControl(data.email);
    replyTo = email;
    rows.push({
      label: 'E-mail',
      text: email,
      html: `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
    });
  }

  if (data.tipoProjeto !== undefined) {
    const label = projectLabel(data.tipoProjeto);
    if (label) rows.push({ label: 'Tipo de projeto', text: label, html: escapeHtml(label) });
  }

  if (data.mensagem) {
    rows.push({
      label: 'Mensagem',
      text: data.mensagem,
      html: `<pre>${escapeHtml(data.mensagem)}</pre>`,
    });
  }

  const tableRows = rows
    .map((r) => `<tr><th align="left">${escapeHtml(r.label)}</th><td>${r.html}</td></tr>`)
    .join('');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Novo orçamento</title></head><body><table>${tableRows}</table></body></html>`;
  const text = rows.map((r) => `${r.label}: ${r.text}`).join('\n');

  const email: OutgoingEmail = {
    from: addr.from,
    to: addr.to,
    subject: subjectFor(data.nome, data.canal, data.tipoProjeto),
    html,
    text,
  };
  if (replyTo) email.replyTo = replyTo;
  return email;
}
