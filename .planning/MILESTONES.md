# Milestones: Dmarques

## v1.0 — Site institucional (entregue em 2026-10-21)

Landing Aurora em produção com captação de orçamentos por formulário e WhatsApp.

### Entregas

- Astro estático, uma Function Vercel, conteúdo tipado e imagens/fontes locais.
- Aurora técnica, identidade e contato reais, navegação acessível e efeitos progressivos.
- Formulário Resend/Upstash com POST nativo e fetch, defesas antiabuso e regressões de validação.
- SEO técnico e dados estruturados com identidade em fonte única.
- CSP enforcing, headers e CI com gates de qualidade, performance e segurança.
- Auditoria final e reconciliação Nyquist das oito fases; dívidas explicitadas.

### Estatísticas e evidências

Oito fases, 65 planos/SUMMARYs e 164 tarefas declaradas nos blocos XML dos PLANs, incluindo checkpoints. O SDK contou 66 pelos SUMMARYs heterogêneos; essa estimativa foi substituída pela contagem dos planos. 383 arquivos alterados entre 0bd32fb e 9ab5e3a; 79 commits alcançáveis da main nesse ponto. 7.856 linhas sob src em Astro/TS/MJS/CSS/Markdown, incluindo testes/conteúdo. Período: 2026-09-05 a 2026-10-21 (46 dias).

94/94 requisitos ativos atendidos; 101 IDs no total, sete removidos/substituídos. Oito fases verificadas e oito registros Nyquist reconciliados. 165 testes; CI, Lighthouse e headers pós-merge verdes. Produção 9ab5e3a (PR #13), HTTP 200. Runs: CI 39681218022, Lighthouse 39681256742 e headers 39681256522. Nenhum novo email real enviado no fechamento.

### Dívidas e decisões preservadas

Auditoria tech_debt, sem lacunas ativas de requisito/integração/fluxo. [BACKLOG.md](BACKLOG.md) preserva dependências, INP de campo, Cloudflare, Hobby, D-29 e demais riscos/limites. Nenhuma nova aceitação de risco presumida. Auditoria de artefatos: zero itens abertos pelo scanner local atualizado; SDK desatualizado apresentou nove falsos positivos (oito SUMMARYs completos e uma UAT resolved com zero pendências).

### Arquivos e próximo passo

[Roadmap](milestones/v1.0-ROADMAP.md), [requisitos](milestones/v1.0-REQUIREMENTS.md), [auditoria](milestones/v1.0-MILESTONE-AUDIT.md), [contexto anterior](milestones/v1.0-PROJECT.md) e [estado anterior](milestones/v1.0-STATE.md). Fases preservadas no diretório original; limpeza opcional futura. Tag v1.0 local aponta para o commit de produção 9ab5e3a; publicação remota pendente. O encerramento documental é revisado em PR própria, sem merge automático.

Próximo passo: `$gsd-new-milestone`; Cloudflare segue como intenção anterior, sem escopo novo aprovado.
