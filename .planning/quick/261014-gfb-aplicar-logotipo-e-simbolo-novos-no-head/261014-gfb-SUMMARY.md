---
quick_id: 261014-gfb
slug: aplicar-logotipo-e-simbolo-novos-no-head
date: 2026-10-14
status: complete
commits: [d6912da, 963e593]
---

# Quick 261014-gfb: Aplicar logotipo e símbolo novos — SUMMARY

Marca provisória em CSS (quadrado "D" + texto) substituída pela identidade nova de
Felipe: lockup símbolo + logotipo no header e no footer, e favicon gerado a partir
do símbolo.

## O que mudou

- `src/assets/brand/simbolo.png` e `logotipo.png` (renomeados de `Simbolo.png` /
  `Logotipo dmarques.png`). Servidos via `<Image>` de `astro:assets` → WebP 1x/2x no
  build (símbolo ~1 kB, logotipo 4–12 kB), `width`/`height` explícitos (sem CLS).
- `SiteHeader.astro`: lockup a 32px (36px a partir de 860px), `loading="eager"`.
  Abaixo de 480px só o símbolo aparece — o lockup completo (~183px) + menu + CTA
  "Pedir orçamento" não cabem em 360–460px.
- `SiteFooter.astro`: lockup a 44px.
- Acessibilidade: no header o link tem `aria-label="Dmarques Desenvolvimento Web —
  página inicial"` e as duas imagens `alt=""` (963e593) — o nome se mantém mesmo
  abaixo de 480px, quando o logotipo fica `display:none`. No footer o nome vem do
  `alt` do logotipo (sempre visível).
- `public/favicon.ico` (16/32/48), `public/favicon-32x32.png`,
  `public/apple-touch-icon.png` (180): símbolo sobre quadrado `#0a0a12` (cantos
  arredondados no favicon) para a parte branca aparecer em abas claras. Gerados por
  script de scratchpad (não versionado). Links em `BaseLayout.astro`.

## Verificação

- `astro check`: 0 erros / 0 warnings. `pnpm build`: OK.
- `js-weight-check.sh`: PASS (2645 B gzip, zero JS novo).
- `security-check.sh`: checks 2–5 PASS (sem `style=` inline); check 1 (audit) FAIL —
  pré-existente, ver abaixo.
- Screenshots headless (Chrome) em 1440px, 414/390/360px (via iframe) e do footer:
  lockup legível, header sem overflow no mobile.

## Pendências

- **`pnpm audit` com High/Critical novos (não causados por esta task — árvore de
  dependências inalterada):** proxy-addr (critical), devalue, sharp (<0.35.5),
  brace-expansion, basic-ftp, http-cache-semantics, source-map-js, compression.
  O job `verify` do CI vai falhar no próximo PR até isso ser tratado. Recomendado:
  quick task de atualização de dependências.
- SVG oficial da marca, se existir, deve substituir os PNGs (nitidez + peso).
