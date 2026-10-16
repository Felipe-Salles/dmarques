# Operação do formulário de orçamento

## Variáveis de ambiente

Todas são server-only, em Production e Preview. Nenhum segredo vai para o repositório; `.env.local` é gitignored.

| Variável | Uso |
|----------|-----|
| `RESEND_API_KEY` | Chave só de envio, restrita ao domínio, de conta Resend separada (D-04) |
| `RATE_LIMIT_SALT` | 32 bytes aleatórios em base64url, usados para anonimizar o IP na chave de limite |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Injetadas pelo Marketplace |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Nomes alternativos; o código aceita qualquer um dos pares |
| `CONTACT_EMAIL` | Opcional; padrão `contato@agenciadmarques.com.br` |

## Resend e DNS na GoDaddy

D-04, D-05, SEC-09.

1. Criar conta Resend nova e adicionar o domínio `agenciadmarques.com.br`.
2. Copiar do painel os registros exatos:
   - TXT `resend._domainkey` (DKIM).
   - MX `send` e TXT `send` (SPF do return-path, `include:amazonses.com`).
3. Criar TXT `_dmarc` com `v=DMARC1; p=none;`, sem `rua=` (a caixa única seria inundada de relatórios).
4. TTL baixo (600 s).
5. NÃO alterar o MX nem o SPF da raiz (caixa GoDaddy).
6. Desligar open/click tracking do domínio no Resend.
7. Evolução: após cerca de 4 semanas sem falhas, trocar para `p=quarantine`.

Verificação:

```
nslookup -type=TXT resend._domainkey.agenciadmarques.com.br
nslookup -type=TXT _dmarc.agenciadmarques.com.br
nslookup -type=MX send.agenciadmarques.com.br
```

## Mail-tester (SEC-09)

1. Abrir mail-tester.com e copiar o endereço gerado.
2. Rodar:

```
node --env-file=.env.local scripts/mail-tester.mjs <endereco>
```

3. Exigir nota maior ou igual a 8.
4. Registrar a nota em `.planning/security/runs/phase-05.md`.

## Upstash pelo Vercel Marketplace

D-10.

1. Vercel Dashboard, Storage/Marketplace, Upstash Redis, plano free.
2. Região mais próxima disponível (preferir São Paulo, se existir).
3. Conectar ao projeto `dmarques` em Production e Preview.
4. Após o primeiro envio, conferir no Data Browser que as chaves `rl:*` têm TTL e que nenhuma chave contém IP em texto.

## Retenção e expurgo (6 meses)

D-15, LGPD-07.

- Lembrete mensal.
- Na caixa GoDaddy, apagar pedidos com mais de 6 meses de quem não virou cliente, inclusive da lixeira.
- Conferir no painel do Resend o período de retenção de logs do plano e registrá-lo na política de privacidade se mudar.

## Hobby e uso comercial

As Fair Use Guidelines da Vercel restringem o plano Hobby a uso não comercial. Isto é um risco para um site de agência. A decisão entre Hobby e Pro é do Felipe e é tomada no checkpoint do plano 05-14.

Runbook de flood: `docs/waf-rate-limit.md`.
