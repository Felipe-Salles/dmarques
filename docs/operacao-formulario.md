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

1. Criar conta Resend nova e adicionar o domínio `agenciadmarques.com.br`, região `sa-east-1` (São Paulo), em setup manual (sem Auto configure/Domain Connect, para não dar escrita no DNS a terceiros).
2. Copiar do painel os 3 registros exatos e criá-los na GoDaddy:
   - TXT `resend._domainkey` (DKIM, valor `p=MIGf...`).
   - CNAME `send` apontando para `send.forge.rmta.net`.
   - CNAME `rsend` apontando para `rsend-sae1.forge.rmta.net`.
   Os alvos dos CNAMEs publicam o próprio SPF; não há MX nem TXT SPF `send` a criar.
3. DMARC: a GoDaddy já publica `_dmarc` com `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`. NÃO criar um segundo registro `_dmarc` (dois registros DMARC invalidam ambos). O existente já está no estágio final e o alinhamento relaxado cobre o DKIM `d=agenciadmarques.com.br`.
4. TTL baixo (600 s).
5. NÃO alterar o MX nem o SPF da raiz (caixa GoDaddy): MX `smtp.secureserver.net` (0) e `mailstore1.secureserver.net` (10); TXT `v=spf1 include:secureserver.net -all`.
6. Desligar open/click tracking do domínio no Resend.

Verificação:

```
nslookup -type=TXT resend._domainkey.agenciadmarques.com.br 8.8.8.8
nslookup -type=CNAME send.agenciadmarques.com.br 8.8.8.8
nslookup -type=CNAME rsend.agenciadmarques.com.br 8.8.8.8
nslookup -type=TXT _dmarc.agenciadmarques.com.br 8.8.8.8
nslookup -type=MX agenciadmarques.com.br 8.8.8.8
nslookup -type=TXT agenciadmarques.com.br 8.8.8.8
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
2. Região mais próxima disponível (São Paulo, usada).
3. Conectar ao projeto `dmarques` em Production e Preview.
4. Após o primeiro envio, conferir no Data Browser que as chaves `rl:*` têm TTL e que nenhuma chave contém IP em texto.

## Estado atual

Provisionado em 2026-10-15.

- Variáveis em Production e Preview (todas Sensitive): `RESEND_API_KEY`, `RATE_LIMIT_SALT`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`. O Marketplace também injeta `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL` e `REDIS_URL`, que o código não usa.
- Upstash Redis: plano Free, região São Paulo, conectado a Production e Preview.
- Resend: região `sa-east-1` (São Paulo), domínio `agenciadmarques.com.br` verificado em 2026-10-15.
- Mail-tester: nota 10/10 em 2026-10-15.
- `_dmarc`: o `p=quarantine` pré-existente da GoDaddy foi mantido.

## Build local no Windows

O hook do `@astrojs/vercel` cria symlinks ao empacotar a Function. No Windows, ative o Modo de Desenvolvedor (Configurações, Para desenvolvedores); sem ele o `pnpm build` falha com EPERM. Ao encerrar, o Node pode imprimir `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` (bug do libuv no Windows); é inofensivo.

## Retenção e expurgo (6 meses)

D-15, LGPD-07.

- Lembrete mensal.
- Na caixa GoDaddy, apagar pedidos com mais de 6 meses de quem não virou cliente, inclusive da lixeira.
- Conferir no painel do Resend o período de retenção de logs do plano e registrá-lo no bloco "Como usamos seus dados" do formulário se mudar.

## Hobby e uso comercial

As Fair Use Guidelines da Vercel restringem o plano Hobby a uso não comercial. Isto é um risco para um site de agência. A decisão entre Hobby e Pro é do Felipe e é tomada no checkpoint do plano 05-14.

Runbook de flood: `docs/waf-rate-limit.md`.
