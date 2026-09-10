# Dmarques — Soluções Web

Site institucional one-page da Dmarques Soluções Web, agência de desenvolvimento
web de Felipe Salles (Ibitinga, SP). O site apresenta os serviços, o método de
trabalho e o fundador, e converte visitantes em contato via formulário e WhatsApp.

## Stack

- **Astro 7** com `output: 'static'` e o adapter `@astrojs/vercel` — o site sai
  como HTML pré-renderado; apenas o endpoint do formulário (a partir da Fase 5)
  roda como função serverless.
- **Fontes self-hosted** (Outfit + DM Sans) via a Fonts API do Astro — nenhuma
  requisição a Google Fonts em produção.
- **Vercel Web Analytics** (`@vercel/analytics`) — sem cookies, beacon
  same-origin, sem banner de consentimento.
- **pnpm** como gerenciador de pacotes, **TypeScript** em modo strict,
  **Biome** + **Prettier** para formatação, **Lighthouse CI** como gate de
  performance (mobile ≥ 95 nas quatro categorias).
- Deploy contínuo na **Vercel** pela integração Git; branch de produção `main`
  protegida por checks obrigatórios de CI.

## Comandos

| Comando        | Ação                                              |
| -------------- | ------------------------------------------------- |
| `pnpm install` | Instala as dependências                           |
| `pnpm dev`     | Sobe o servidor de desenvolvimento em `localhost` |
| `pnpm build`   | Gera o build estático em `.vercel/output/static`  |
| `pnpm check`   | Roda `astro sync` e a checagem de tipos           |
| `pnpm lint`    | Roda o Biome sobre o projeto                      |
| `pnpm format`  | Formata `.astro` com Prettier e o resto com Biome |

## Planejamento

O histórico de decisões, fases e requisitos vive em `.planning/`. A revisão de
segurança por fase fica em `.planning/security/`.
