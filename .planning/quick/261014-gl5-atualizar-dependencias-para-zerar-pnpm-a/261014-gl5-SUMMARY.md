---
quick_id: 261014-gl5
slug: atualizar-dependencias-para-zerar-pnpm-a
date: 2026-10-14
status: complete
commit: 9227d3e
---

# Quick 261014-gl5: Atualizar dependências para zerar `pnpm audit` — SUMMARY

`pnpm audit --audit-level=high` voltou a exit 0. O check 1 do `security-check.sh` está PASS de novo.

## O que mudou

- Diretas (pins exatos): `astro` 7.3.1 → 7.3.8, `@astrojs/vercel` 11.0.10 → 11.0.14,
  `sharp` 0.35.4 → 0.35.5. Nenhum major.
- Transitivas atualizadas dentro do range: proxy-addr 2.0.8 (critical),
  devalue, brace-expansion, http-cache-semantics, source-map-js, compression.
- `pnpm-workspace.yaml` ganhou o override `'basic-ftp@<6.2.3': 6.2.3`. Até o get-uri mais
  recente (8.0.1) fixa `basic-ftp ^5.3.1`, e a correção do GHSA-c475-qrg2-pj4r só
  existe na 6.x. A única quebra da 6.0.0 é um endurecimento de segurança
  (`allowSeparateTransferHost` passa a ser false por padrão, contra FTP bounce), e a API é a mesma.
  O caminho é só de CI (@lhci/cli → proxy-agent → pac-proxy-agent → get-uri). Remover o
  override quando o get-uri aceitar a 6.x.

## Verificação

- `pnpm audit --audit-level=high`: exit 0 (restam só os 2 extract-zip já aceitos na Fase 1).
- `pnpm check` 0/0/0 · `pnpm test` 14/14 · `pnpm build` OK · `js-weight-check.sh` PASS ·
  `security-check.sh` 5 PASS / 0 FAIL / 2 SKIP (6 e 7 dependem de preview URL).

## Pendências

- 8 advisories **moderate** (fast-uri, ip-address, qs, smol-toml, sprintf-js, uuid) ficam
  abaixo do gate (high). Não bloqueiam. Reavaliar na revisão de segurança da Fase 7.
