---
quick_id: 261014-gfb
slug: aplicar-logotipo-e-simbolo-novos-no-head
date: 2026-10-14
mode: quick
---

# Quick 261014-gfb: Aplicar logotipo e símbolo novos

## Objetivo

Substituir a marca provisória (quadrado "D" + texto em CSS) pela identidade visual
nova enviada por Felipe em `src/assets/brand/`, no header, no footer e no favicon.

## Insumos

- `Simbolo.png` (291×269, RGBA): "D" com parte branca + parte azul `#29a9e1`.
- `Logotipo dmarques.png` (895×204, RGBA): barra branca vertical + "dmarques" em
  gradiente ciano→azul + "DESENVOLVIMENTO WEB" branco. Foi desenhado para ficar à
  direita do símbolo (a barra é o separador do lockup). Partes brancas → só funciona
  em fundo escuro (o site é dark).

## Tarefas

1. Renomear os arquivos para `simbolo.png` / `logotipo.png` (sem espaço, minúsculas).
2. Header (`SiteHeader.astro`): lockup símbolo + logotipo via `<Image>` de
   `astro:assets` (WebP gerado no build, `densities` 1x/2x, width/height explícitos
   → sem CLS). Link com `aria-label="Dmarques — página inicial"`, imagens com
   `alt=""`. Remove `.logo-mark`, `.logo-text`, `.logo-sub`.
3. Footer (`SiteFooter.astro`): mesmo lockup, um pouco maior. Remove
   `.site-footer-logo-mark` / `.site-footer-logo-text`.
4. Favicon: gerar em `public/` (script de scratchpad, não versionado) a partir do
   símbolo sobre quadrado arredondado `--color-bg` (#0a0a12), para a parte branca
   aparecer em abas claras: `favicon.ico` (16/32/48), `favicon-32x32.png`,
   `apple-touch-icon.png` (180). Links em `BaseLayout.astro`.
5. Validar: `pnpm build`, `astro check`, `scripts/js-weight-check.sh`,
   `scripts/security-check.sh` (sem `style=` inline, zero JS novo).

## Fora de escopo

- Web manifest / ícones 192/512 e og:image → Fase 6 (SEO).
- Vetorização (SVG) da marca — usar SVG oficial se Felipe enviar depois.
