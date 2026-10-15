---
quick_id: 261015-2fr
slug: aplicar-foto-real-do-fundador-e-e-mail-c
date: 2026-10-15
status: complete
commit: a71a82e
---

# Quick 261015-2fr — SUMMARY

- Foto real do Felipe (1086×1448 PNG, 1,9 MB) em `src/assets/founder/felipe-salles.png`. O `<Picture>` gera
  AVIF de 14–33 kB e WebP de 23–57 kB em 480/768/960w, com fallback JPG de 39–137 kB (o fallback padrão
  seria PNG de até 3,1 MB). `object-position: 50% 20%` mantém o rosto no enquadramento 4:5.
- O e-mail `contato@agenciadmarques.com.br` substituiu o @hotmail no contato e no rodapé. Não sobrou nenhuma ocorrência em `src/`.
- O placeholder `founder-portrait-placeholder.webp` foi removido (não tinha outro uso).
- Verificação: `astro check` 0/0, build OK, js-weight PASS, security-check 5 PASS / 0 FAIL / 2 SKIP, Prettier OK;
  screenshots da seção Sobre em 1440 e 390 conferidos (AVIF servido, e-mail novo no rodapé).
- Também aplicado no sketch 001 (commits a9c122b e d77f2a0).
