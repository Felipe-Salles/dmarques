import process from 'node:process';
import { Resend } from 'resend';

const destino = process.argv[2];
const chave = process.env.RESEND_API_KEY;
const contato = process.env.CONTACT_EMAIL ?? 'contato@agenciadmarques.com.br';

if (!chave || !destino) {
  console.error('uso: node --env-file=.env.local scripts/mail-tester.mjs <endereco>');
  process.exit(1);
}

const texto = [
  'Novo pedido de orçamento',
  'Nome: Teste',
  'Tipo de projeto: Site institucional',
  'Canal: E-mail',
].join('\n');

const html = [
  '<table role="presentation" cellpadding="6" cellspacing="0" border="0">',
  '<tr><td colspan="2"><strong>Novo pedido de orçamento</strong></td></tr>',
  '<tr><td>Nome</td><td>Teste</td></tr>',
  '<tr><td>Tipo de projeto</td><td>Site institucional</td></tr>',
  '<tr><td>Canal</td><td>E-mail</td></tr>',
  '</table>',
].join('');

const resend = new Resend(chave);
const { data, error } = await resend.emails.send({
  from: `Site Dmarques <${contato}>`,
  to: destino,
  subject: 'Novo orçamento: Teste — Site institucional',
  html,
  text: texto,
});

if (error) {
  console.error(`falha: ${error.name}`);
  process.exit(1);
}

console.log(`enviado: ${data.id}`);
process.exit(0);
