# Rate limit no Vercel WAF e runbook de flood

Cobre FORM-11, D-13 e a declaração de risco residual SEC-08.

## Regra de rate limit em /api/*

O plano Hobby permite 1 regra de rate limit por projeto, com janela de 10 s a 10 min, algoritmo fixed window, chave por IP e contadores por região.

Configuração:

1. Vercel Dashboard, projeto `dmarques`, Firewall, Configure, New Rule.
2. Nome: `api-flood`.
3. Condição: Request Path, starts with, `/api/`.
4. Ação: Rate Limit, 10 requisições por 60 s, chave IP.
5. Ao exceder: no Hobby só `Log` e `Deny` estão disponíveis. `Too Many Requests (429)` exige upgrade do plano. A ação atual é `Deny` (resposta 403 com `X-Vercel-Mitigated: deny`).
6. Publicar (Review Changes, Publish).

Estado atual (2026-10-16): regra `api-flood` ativa, path starts with `/api/`, fixed window de 60 s, limite 10, chave ip, ação deny. Vale também para deploys de preview.

Esta regra é mais frouxa que o limite do app (3 envios por 10 min por IP no Upstash). Ela serve só contra flood, não contra uso abusivo fino do formulário. O formulário trata 429 como limite do app; um 403 de borda cai no estado de falha genérico, que oferece o WhatsApp.

## Verificação

1. Esperar a janela zerar (61 s) e enviar uma rajada de 12 GETs a `/api/orcamento` em menos de 60 s (com o header de bypass de proteção do preview). Cada um dentro do limite recebe 405 barato do app.
2. A partir da requisição 11, a resposta deve ser 403 vinda do edge, com `Server: Vercel` e `X-Vercel-Mitigated: deny`, sem invocar a Function.
3. Eventos podem aparecer em Firewall, Traffic (filtrar pela regra `api-flood`), com atraso.

Medição de 2026-10-16 (04:15:48 UTC): `405 405 405 405 405 405 405 405 405 405 403 403`. A requisição seguinte na janela também devolveu 403.

## Runbook de flood

Sinais:

- Picos no Firewall ou em Usage.
- Alerta de 75% ou 100% do limite do Hobby.
- Resend chegando perto do teto diário.

Passos, em ordem:

1. Ativar Attack Challenge Mode no Firewall.
2. Apertar a regra `api-flood`: ação Deny e janela maior.
3. Bloquear IPs ou ASNs ofensores com regra custom (lembrar que o Hobby tem número limitado de regras).
4. Se persistir, acelerar o Milestone 2: Cloudflare na frente do site, com o DNS já preparado em TTL baixo.
5. Registrar o incidente em `.planning/security/runs/`.
