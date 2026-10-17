# Phase 6: SEO / Metadata / Structured Data - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-17
**Phase:** 06-seo-metadata-structured-data
**Areas discussed:** NAP e endereço, Imagem de compartilhamento, Título e descrição, Dados extras do JSON-LD

---

## NAP e endereço

| Option | Description | Selected |
|--------|-------------|----------|
| Dmarques Soluções Web | Já no © do rodapé e no PROJECT.md | |
| Dmarques Desenvolvimento Web | No aria-label do logo | ✓ |
| Só "Dmarques" | Mais curto, genérico | |

| Option | Description | Selected |
|--------|-------------|----------|
| Só cidade + área atendida | Service-area business, sem rua | ✓ |
| Endereço completo com rua | Só se houver escritório | |

| Option | Description | Selected |
|--------|-------------|----------|
| Manter (16) 99611-1785 | Formato brasileiro | ✓ |
| +55 (16) 99611-1785 | Igual ao E.164 | |

**Google Business Profile:** já existe — https://share.google/5cU7xCYeXu5uWD9Yq, nome "Dmarques Desenvolvimento Web", área de atendimento Ibitinga, Araraquara, Matão, Itápolis, Iacanga, Bauru; categoria "Serviço de Informática".

---

## Imagem de compartilhamento

**Notes:** Felipe pediu esclarecimento sobre o que era o "card"; explicada a prévia de link (WhatsApp/LinkedIn). Primeira resposta ambígua ("só a logo em fundo escuro" + frase do hero) resolvida com pergunta de confirmação.

| Option | Description | Selected |
|--------|-------------|----------|
| Logo + frase no fundo escuro | Sem aurora | |
| Só o logo no fundo escuro | Sem frase | |
| Logo + frase + aurora | Brilho da aurora do hero ao fundo | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| A mesma chamada do topo do site | "Software sob medida, com acabamento de produto." | ✓ |
| Sites, sistemas e automações · Ibitinga/SP | Descritivo | |
| Você decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Eu gero automaticamente | Script HTML → PNG, regenerável | ✓ |
| Você desenha e me manda | Canva/Figma | |

---

## Título e descrição

| Option | Description | Selected |
|--------|-------------|----------|
| Serviço + cidade primeiro | "Sites, sistemas e automações em Ibitinga/SP \| Dmarques" | ✓ |
| Marca completa primeiro | "Dmarques Desenvolvimento Web — Sites, sistemas e automações" | |
| Só marca + cidade | "Dmarques Desenvolvimento Web \| Ibitinga/SP" | |

| Option | Description | Selected |
|--------|-------------|----------|
| Local + diferencial | "Criamos sites, sistemas sob medida e automações em Ibitinga/SP e região..." | ✓ |
| Local + chamada para orçamento | "...Respondemos no mesmo dia útil. Peça seu orçamento..." | |
| Você decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Iguais aos do Google | Fonte única | ✓ |
| Título de prévia só com a marca | | |

---

## Dados extras do JSON-LD

| Question | Selected |
|----------|----------|
| Horário de atendimento | Sim, igual ao GBP: seg–sex 7h–19h, sáb 9h–14h; só no JSON-LD, não no rodapé |
| Faixa de preço | Não informar |
| CNPJ / razão social | Ainda não tem CNPJ |
| Fundador | Só o nome |

---

## Claude's Discretion

- Favicon set details, sitemap filtering, robots.txt, Lighthouse SEO gate restore, JSON-LD @id structure, secondary-page titles.

## Deferred Ideas

- CNPJ/razão social quando TRUST-02 existir.
- Horário visível no site (recusado por ora).
