---
phase: quick-261015-rhm
plan: 01
status: complete
completed: 2026-10-15
commits: [a85bec5, 7f6d437, aaf8734]
---

# Quick 261015-rhm: acabamento da Fase 04.1 alinhado ao sketch

Os 9 itens foram aplicados e conferidos lado a lado com o sketch (variante A) a 1440 e 390 px.

## Commits

- a85bec5: grain em camada unica (`.site::after`, `grain.svg` do sketch), linha da prova em gradiente, paddings das secoes
- 7f6d437: icones de Servicos do sketch, botao `.arrow` no card destacado, `proj-head`, Metodo, Sobre sem Instagram, WhatsApp com sub-texto, rodape sem frase e sem Instagram, gate `contact` invertido para o footer
- aaf8734: `background` em `.site` e line-height dos titulos e canais

## Desvios

- [Rule 1] O overlay do grain clareava a pagina porque `.site` nao tinha fundo. Adicionei `background: var(--color-bg)` ao `.site`, como no sketch.
- [Rule 1] O sketch nao define line-height no body (usa `normal`) e o site usa 1.6. Remover o line-height de `.svc h3` e `.step h3` fazia os titulos herdarem 1.6. Usei 1.26 nesses titulos e 1.2 em `.channel div`. Resultado: canais com 66 px, igual ao sketch.
- Erro meu durante a execucao: rodei `git checkout HEAD~2 -- .` por engano, o que reverteu os arquivos rastreados. Restaurei com `git checkout HEAD -- .` e refiz as 4 edicoes ainda nao commitadas. O estado final foi verificado por build, gates e medicoes.

## Medicoes (site vs sketch)

- Paddings: 144/0 em Servicos, Projetos, Metodo e Sobre; 144/144 em Contato (88 px a 390). Iguais.
- Grain: `.site::after` com `/grain.svg` e zero `.grain`. Sem degrau no fim do hero nem no topo do Contato.
- `.proof::before`: gradiente transparente nas pontas.
- `.svc svg`: 30x30 a 1440 e 26x26 a 390. Iguais.
- H2 do Metodo: 2 linhas a 1440, 3 linhas a 390, como no sketch.
- `.arrow`: 44x44. No hover do card o fundo inverte e o transform fica `rotate(-45deg)`.
- Canais: 511x66 a 1440 e 358x66 a 390, `.ic` 40x40. Iguais.

## O que ainda difere do sketch

- Altura de `.step`: 179 contra 156 px a 1440 e 101 contra 96 a 390. O copy do passo 2 no site e mais longo (4 linhas contra 2). Isso e conteudo, nao CSS.
- Lista de 3 itens no Contato: o site tem espacamento um pouco maior (34 contra 29 px). Vem do line-height 1.6 do body, que mantive.
- `.proj-head p` e `.card h3/p` ficam com line-height 1.6 do body, contra `normal` no sketch. Mantido por legibilidade. A diferenca e de alguns pixels em uma linha.
- Contato mantem o Instagram, como o plano pede. O sketch so tem WhatsApp e e-mail.
- Copy, cover do card destacado e campos do formulario diferem do sketch por decisao anterior (conteudo real, Fase 5). O formulario nao foi tocado.
- Hero: 649 contra 650 px a 1440 e 578 contra 569 a 390, por diferenca de copy/fonte.

## Verificacao

- `pnpm build`, `pnpm verify:gates` (13/13), `pnpm verify:browser` (10/10), `pnpm check` (0 erros) e `js-weight-check` (2729 B gzip) passam.
- `pnpm lint` falha por 2 avisos de `organizeImports` em `scripts/capture-site.mjs` e `scripts/verify/browser-gates.mjs`, mais avisos `noImportantStyles` no bloco reduced-motion de `base.css`. Nenhum foi introduzido por este plano. Ficam adiados.
- Nenhum comentario adicionado. `src/scripts/form.ts` intocado. PNGs das capturas apagados, nada commitado.
