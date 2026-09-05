# Phase 1: Foundation & CI Gate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-05
**Phase:** 1-foundation-ci-gate
**Areas discussed:** Host Git & branch de produção, Analytics: agora ou depois, O que o preview mostra, Formato do checklist SEC-07

---

## Host Git & branch de produção

### Q1 — Qual host Git?

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub | Recomendado. INFRA-08 pede GitHub Dependency Review nativo; integração Vercel↔GitHub mais direta; Lighthouse CI + GitHub Actions padrão. Conta GitHub já existe. | ✓ |
| GitLab | Vercel integra, mas Dependency Review teria de virar Renovate/OSV-Scanner e CI seria GitLab CI. | |
| Bitbucket | Suportado, porém o menos alinhado à stack. | |

**User's choice:** GitHub

### Q2 — Nome da branch de produção?

| Option | Description | Selected |
|--------|-------------|----------|
| Renomear para 'main' | Recomendado. Padrão GitHub/comunidade; ROADMAP e GSD já assumem 'main'. | ✓ |
| Manter 'master' | Funciona, mas foge da convenção. | |

**User's choice:** Renomear `master` → `main` antes do primeiro push

### Q3 — Quem cria o repo remoto e conecta a Vercel?

| Option | Description | Selected |
|--------|-------------|----------|
| Eu faço via gh CLI | Claude cria o repo, dá push, guia os passos Vercel no dashboard; aprovação antes de cada ação irreversível. | ✓ |
| Você cria, eu configuro | Felipe cria repo + projeto Vercel; Claude prepara o código e guia os cliques. | |
| Só planejar agora | Não mexer em conta; documentar passos manuais como checklist. | |

**User's choice:** Claude faz via `gh` CLI
**Notes:** `gh` verificado autenticado como `Felipe-Salles`, scopes `gist, read:org, repo`. Falta o scope `workflow` para dar push em `.github/workflows/*` — precisa `gh auth refresh -s workflow` no setup.

### Q4 — Repo público ou privado?

| Option | Description | Selected |
|--------|-------------|----------|
| Público | Recomendado. Libera branch protection + Dependency Review no plano free; combina com o discurso de site auditado; sem segredo no código. | ✓ |
| Privado | Código fechado, mas exige GitHub Pro ou substitutos para os mesmos portões. | |
| Privado, sem branch protection | Repo privado free; bloqueio 100% por cima do CI + revisão manual. | |

**User's choice:** Público — "pode ser publico, mas preciso que tire todos os comentários do código"
**Notes:** O pedido de remover comentários virou convenção global do projeto (ver Q5).

### Q5 — Abrangência de "tirar todos os comentários"?

| Option | Description | Selected |
|--------|-------------|----------|
| Zero comentários, sempre | Nenhum comentário em nenhum arquivo versionado (.astro, .ts, .css, .mjs, .json, YAML, workflows). Docs vão para .planning/ ou README. | ✓ |
| Sem comentários em src/, config pode | App code sem comentários; config na raiz pode ter comentários curtos. | |
| Só sem comentário 'óbvio'/explicativo | Remover narração do código; manter porquê não óbvio (workaround, ref a spec, aviso de segurança). | |

**User's choice:** Zero comentários, sempre
**Notes:** Salvo em memória do projeto como convenção durável para todas as fases e sessões futuras.

---

## Analytics: agora ou depois

### Q1 — Quando o analytics entra?

| Option | Description | Selected |
|--------|-------------|----------|
| Já na Fase 1 | Recomendado. Budget de JS (<20 KB) e Lighthouse do CI medem o peso real desde o primeiro deploy. | ✓ |
| Adiar para a Fase 6 | Entra com SEO/metadados. Risco: gate só vê o custo real lá na frente. | |
| Adiar para a Fase 5 | Entra com formulário/LGPD, onde já se verifica "zero cookies". | |

**User's choice:** Já na Fase 1

### Q2 — Qual ferramenta?

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Web Analytics | Recomendado. Sem cookies, beacon same-origin, sem origem nova na CSP, sem banner, zero config na Vercel. | ✓ |
| Plausible Cloud | Dashboard mais completo, ~US$9/mês, adiciona plausible.io na CSP. | |
| Nenhuma na v1 | Máxima privacidade, mas sem medição de visitas/conversão. | |

**User's choice:** Vercel Web Analytics

### Q3 — Adicionar Vercel Speed Insights também?

| Option | Description | Selected |
|--------|-------------|----------|
| Não na Fase 1 | Recomendado por ora. Mais um script + peso no budget, sem tráfego real ainda. Fácil ligar depois. | ✓ |
| Sim, junto | Mesmo perfil de privacidade; CWV de campo desde o lançamento ao custo de mais KB. | |

**User's choice:** Não na Fase 1

---

## O que o preview mostra

### Q1 — O que a página raiz renderiza no fim da Fase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder mínimo | Recomendado. BaseLayout + `<main>` com `<h1>` + tagline; tokens, fontes self-hosted, fundo escuro. Fase 3 substitui o miolo. | ✓ |
| Header/footer de esqueleto | BaseLayout já com header/nav/footer reais, só `<main>` placeholder. Mistura escopo, risco de retrabalho. | |
| Holding page 'em breve' | Página de espera com identidade visual. Útil só se o domínio for público; vira lixo na Fase 3. | |

**User's choice:** Placeholder mínimo

### Q2 — O domínio de produção fica público durante o desenvolvimento?

| Option | Description | Selected |
|--------|-------------|----------|
| Fechado até a v1 | Recomendado. Só a URL de preview (com Deployment Protection) roda; domínio real só apontado na aprovação da v1. | ✓ |
| Público desde já | Domínio real serve a branch main durante o dev; nesse caso reconsiderar holding page + noindex. | |
| Sem domínio ainda | Domínio próprio não definido; só *.vercel.app. | |

**User's choice:** Fechado até a v1

### Q3 — Já existe domínio próprio?

| Option | Description | Selected |
|--------|-------------|----------|
| Não / indefinido | Fase 1 usa *.vercel.app; escolha de domínio + DNS antes do lançamento. | |
| Sim, já registrado | O domínio existe; anotar nome + DNS no CONTEXT.md. | ✓ |
| Vou registrar em breve | Decisão iminente; registrar como pendência. | |

**User's choice:** Sim, já registrado
**Notes:** `agenciadmarques.com.br`, DNS na GoDaddy. CLAUDE.md/TRUST-01 citam `dmarques.com.br` como hipótese — domínio real é `agenciadmarques.com.br`; usar em canonical/OG/JSON-LD/`site`/Resend nas fases seguintes.

---

## Formato do checklist SEC-07

### Q1 — Organização do artefato no repo?

| Option | Description | Selected |
|--------|-------------|----------|
| Template + run por fase | Recomendado. Gabarito único em `.planning/security/SECURITY-CHECKLIST.md` + run datado por fase em `.planning/security/runs/phase-NN.md`. | ✓ |
| Arquivo copiado por fase | Checklist inteiro copiado para a pasta de cada fase. Duplica o gabarito 7x. | |
| Um arquivo append-only | Um SECURITY-LOG.md com seção nova por fase. Cresce muito, mistura gabarito e histórico. | |

**User's choice:** Template + run por fase

### Q2 — Automatizar as checagens mecânicas?

| Option | Description | Selected |
|--------|-------------|----------|
| Script + itens manuais | Recomendado. `scripts/security-check.sh` roda audit/grep inline/curl -I headers/scan de segredos/contagem de Functions/gate Lighthouse com PASS-FAIL; CI roda o mesmo script; run da fase anexa a saída + itens de julgamento à mão. | ✓ |
| Tudo manual via checklist | Sem script; comandos à mão a cada fase. Mais trabalho repetido, mais risco de esquecer passo. | |
| Script agora só do essencial | Script cobre só segredos + Functions + audit; resto manual. | |

**User's choice:** Script + itens manuais

### Q3 — Formato do registro de achados / campo responsável?

| Option | Description | Selected |
|--------|-------------|----------|
| Tabela com dono fixo | Recomendado. Tabela (ID, descrição, severidade, status, ação, data-alvo); responsável = Felipe Salles por padrão; regra "nenhuma fase fecha com High em aberto" no topo. | ✓ |
| Só lista de achados | Sem coluna de responsável; severidade + status + ação + data. | |
| Formato GSD padrão | Deixar o /gsd:secure-phase definir o formato quando rodar. | |

**User's choice:** Tabela com dono fixo

### Q4 — Itens do gabarito base?

| Option | Description | Selected |
|--------|-------------|----------|
| Exatamente o do REQUIREMENTS | Recomendado. Gabarito da Fase 1 implementa a lista do SEC-07 como está; fases seguintes acrescentam itens específicos. | ✓ |
| Adicionar itens agora | Incluir checagens extras já no gabarito base. | |
| Você decide | Claude monta a lista base a partir do SEC-07 + boas práticas. | |

**User's choice:** Exatamente o do REQUIREMENTS.md

---

## Claude's Discretion

- Exact pinned dependency versions (follow CLAUDE.md Technology Stack table).
- Lighthouse CI target: live Vercel preview URL vs local `astro preview` in CI
  (factor in Deployment Protection blocking an external runner).
- Design-token file scope beyond confirmed palette + fonts + `font-display` +
  fallback metrics.
- `pnpm` vs `npm` — default `pnpm` per roadmap success criteria.
- CI provider mechanics (GitHub Actions assumed), job matrix, caching.
- Exact spend-cap amount and env-var grouping (confirm number with Felipe at
  execution time).

## Deferred Ideas

- Skeleton header/nav/footer shells → Phase 3.
- "Em breve" holding page → not needed (domain closed during dev).
- Vercel Speed Insights → post-launch, optional.
- DNS TTL lowering + Resend SPF/DKIM/DMARC on `agenciadmarques.com.br` → Phase 5
  (SEC-08 / SEC-09).
- Domain cutover to Vercel → after Phase 7, at v1 approval.
- Re-scope `gh` token with `workflow` → setup prerequisite during execution.
