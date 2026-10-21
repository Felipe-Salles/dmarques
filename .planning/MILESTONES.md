# Milestones: Dmarques

## v1.0 ? Site institucional (entregue em 2026-10-21)

Landing Aurora em produ??o com capta??o de or?amentos por formul?rio e WhatsApp.

### Entregas

- Astro est?tico, uma Function Vercel, conte?do tipado e imagens/fontes locais.
- Aurora t?cnica, identidade e contato reais, navega??o acess?vel e efeitos progressivos.
- Formul?rio Resend/Upstash com POST nativo e fetch, defesas antiabuso e regress?es de valida??o.
- SEO t?cnico e dados estruturados com identidade em fonte ?nica.
- CSP enforcing, headers e CI com gates de qualidade, performance e seguran?a.
- Auditoria final e reconcilia??o Nyquist das oito fases; d?vidas explicitadas.

### Estat?sticas e evid?ncias

Oito fases, 65 planos/SUMMARYs e 164 tarefas declaradas nos blocos XML dos PLANs, incluindo checkpoints. O SDK contou 66 pelos SUMMARYs heterog?neos; essa estimativa foi substitu?da pela contagem dos planos. 383 arquivos alterados entre 0bd32fb e 9ab5e3a; 79 commits alcan??veis da main nesse ponto. 7.856 linhas sob src em Astro/TS/MJS/CSS/Markdown, incluindo testes/conte?do. Per?odo: 2026-09-05 a 2026-10-21 (46 dias).

94/94 requisitos ativos atendidos; 101 IDs no total, sete removidos/substitu?dos. Oito fases verificadas e oito registros Nyquist reconciliados. 165 testes; CI, Lighthouse e headers p?s-merge verdes. Produ??o 9ab5e3a (PR #13), HTTP 200. Runs: CI 39681218022, Lighthouse 39681256742 e headers 39681256522. Nenhum novo email real enviado no fechamento.

### D?vidas e decis?es preservadas

Auditoria tech_debt, sem lacunas ativas de requisito/integra??o/fluxo. [BACKLOG.md](BACKLOG.md) preserva depend?ncias, INP de campo, Cloudflare, Hobby, D-29 e demais riscos/limites. Nenhuma nova aceita??o de risco presumida. Auditoria de artefatos: zero itens abertos pelo scanner local atualizado; SDK desatualizado apresentou nove falsos positivos (oito SUMMARYs completos e uma UAT resolved com zero pend?ncias).

### Arquivos e pr?ximo passo

[Roadmap](milestones/v1.0-ROADMAP.md), [requisitos](milestones/v1.0-REQUIREMENTS.md), [auditoria](milestones/v1.0-MILESTONE-AUDIT.md), [contexto anterior](milestones/v1.0-PROJECT.md) e [estado anterior](milestones/v1.0-STATE.md). Fases preservadas no diret?rio original; limpeza opcional futura. Tag v1.0 local aponta para o commit de produ??o 9ab5e3a; publica??o remota pendente. O encerramento documental ? revisado em PR pr?pria, sem merge autom?tico.

Pr?ximo passo: `$gsd-new-milestone`; Cloudflare segue como inten??o anterior, sem escopo novo aprovado.
