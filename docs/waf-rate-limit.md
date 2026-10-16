# Rate limit no Vercel WAF e runbook de flood

Cobre FORM-11, D-13 e a declaração de risco residual SEC-08.

## Regra de rate limit em /api/*

O plano Hobby permite 1 regra de rate limit por projeto, com janela de 10 s a 10 min, algoritmo fixed window, chave por IP e contadores por região.

Configuração:

1. Vercel Dashboard, projeto `dmarques`, Firewall, Configure, New Rule.
2. Nome: `api-flood`.
3. Condição: Request Path, starts with, `/api/`.
4. Ação: Rate Limit, 10 requisições por 60 s, chave IP.
5. Ao exceder: primeiro `Log`, por pelo menos 24 h. Depois de revisar os eventos, trocar para `Too Many Requests (429)` (ou Deny).
6. Publicar (Review Changes, Publish).

Esta regra é mais frouxa que o limite do app (3 envios por 10 min por IP no Upstash). Ela serve só contra flood, não contra uso abusivo fino do formulário.

## Verificação

1. Com a ação já em 429, enviar uma rajada de 12 GETs a `/api/orcamento` em menos de 60 s. Cada um recebe 405 barato do app.
2. A partir da requisição 11, a resposta deve ser 429 vinda do edge.
3. Eventos aparecem em Firewall, Traffic (filtrar pela regra `api-flood`).

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
