# Revisão de segurança SEC-07 — Fase 07 — Cabeçalhos de segurança e CSP

## Cabeçalho

- **Fase:** `Fase 07 — Security headers finalize`
- **Data da execução:** 2026-10-19
- **Commit revisado (MERGE_SHA do PR #9):** `98a0dbfe96fc4c37c8f0b11378652e81207022e0` — `Fase 7: cabeçalhos de segurança e CSP (#9)`
- **URL revisada:** `https://agenciadmarques.com.br/` (produção)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado)
- **Como foi gerado:** `pnpm install --frozen-lockfile`, `pnpm build` e `PREVIEW_URL=https://agenciadmarques.com.br bash scripts/security-check.sh --ci` rodados localmente contra a produção (pública, sem bypass); sondas `curl` e jobs `headers-production` e `lhci-production` do GitHub Actions; nota do securityheaders.com e prévias sociais conferidas por Felipe.

## Saída completa e verbatim de `scripts/security-check.sh --ci` (build local, `PREVIEW_URL` = produção)

Códigos de cor ANSI removidos da saída do Lighthouse; nenhuma linha foi alterada ou omitida.

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 21  |  blocos @font-face: 70  |  <script> inline sem src: 15
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 1 (exatamente 1)
  cabecalhos de https://agenciadmarques.com.br:
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Access-Control-Allow-Origin: *
    Age: 31043
    Cache-Control: public, max-age=0, must-revalidate
    Content-Disposition: inline
    Content-Length: 50944
    Content-Security-Policy: default-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'sha256-tuIU1AzinXXFwvirj5zOPmWp+jY3/gZn/LNq1H5E3BY=' 'sha256-QTnIWwm5hechX/39gN8K42M4UOmUXUMl3j9uemlwIgk=' 'sha256-xIb/Pa7FUshAu4ihwjchYcQpyCI8eS8kt40GpOAYCz8=' 'sha256-1BvDVWLr3QCC20uHhUDi27eDFVJpk1uMQJGIWKUks2I=' 'sha256-kmZE/W8I1iuTnl1b3yqzv9/DQZenPngd3NjSKMQl7y0=' 'sha256-Y8t0ntteBwH+PqGKUyjWW3CAk+BNJKSoQc0xZ68FjhM=' 'sha256-0O7iB6zr9x0r6X6eWYITC9V5q+yWCGAoFvcysBGbY9Q='; style-src 'self' 'sha256-l3/s7JflW7ZVN7qxAXN6Anfb6PDzRz7di6mfLq4fvic=' 'sha256-4H71YEhutOtLVTMJUOqYG3yt6bK8pLGyghZ9XamI7ac=' 'sha256-oq15KZw15VK+dRhwpRTP+UCzMJ18NfjwBY9LMutyqrY=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='; upgrade-insecure-requests
    Content-Type: text/html; charset=utf-8
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Resource-Policy: same-site
    Date: Mon, 19 Oct 2026 23:04:51 GMT
    Etag: "65adeefebadaa6a444f1551942dbdee4"
    Last-Modified: Mon, 19 Oct 2026 14:27:27 GMT
    Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
    Referrer-Policy: strict-origin-when-cross-origin
    Server: Vercel
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    X-Vercel-Cache: HIT
    X-Vercel-Id: gru1::jm9wr-1792451091316-f1d2d3e3f21e
PASS: verificacao 6 - conjunto de cabecalhos de seguranca presente em https://agenciadmarques.com.br
✅  .lighthouseci/ directory writable
✅  Configuration file found
✅  Chrome installation found
Healthcheck passed!

Running Lighthouse 3 time(s) on https://agenciadmarques.com.br
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!

Checking assertions against 1 URL(s), 3 total run(s)

3 result(s) for https://agenciadmarques.com.br/ :

  ×  categories.performance failure for minScore assertion
        expected: >=0.95
           found: 0.87
      all values: 0.83, 0.86, 0.87


  ×  largest-contentful-paint failure for maxNumericValue assertion
       Largest Contentful Paint
       https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint/

        expected: <=2500
           found: 3376.0600000000004
      all values: 3376.0600000000004, 3416.7650000000003, 3408.2969999999996


  ×  resource-summary.script.size failure for maxNumericValue assertion
       Resources Summary

        expected: <=20480
           found: 174500
      all values: 174500, 174500, 174500

Assertion failed. Exiting with status code 1.

assert command failed. Exiting with status code 1.
FAIL: verificacao 7 - gate do Lighthouse reprovado
PASS: verificacao 8 - nenhum console.* no codigo do servidor
PASS: verificacao 9 - nenhum .map nem sourceMappingURL na saida servida
PASS: verificacao 10 - nenhum ClientRouter ou astro:transitions em src/
PASS: verificacao 11 - nenhuma carga de recurso de origem externa no HTML e CSS construidos
PASS: verificacao 12 - nenhum meta http-equiv CSP no HTML construido
PASS: verificacao 13 - paginas 404, 500 e erro-envio/falha sem texto de diagnostico
== resumo: 12 PASS / 1 FAIL / 0 SKIP ==
EXIT 1
```

Código de saída: **1** (uma verificação reprovada, a 7, por causa do ambiente local; ver a análise abaixo).

### Primeira execução e correção de defeito no script

A primeira execução (antes da correção) reprovou a verificação 6 nos oito cabeçalhos mesmo com todos presentes na resposta impressa. Causa: a linha `tr -d` de `scripts/security-check.sh` continha uma quebra de linha literal entre as aspas e apagava as quebras de linha em vez do retorno de carro, de modo que as âncoras `^` dos padrões nunca casavam. A verificação 6 nunca tinha rodado de verdade com `PREVIEW_URL` definido. Corrigido para `tr -d '\r'` (único arquivo de código alterado neste PR); a saída acima é da segunda execução, com a correção.

### Verificação 7 (Lighthouse local) reprovada por injeção do antivírus

A verificação 7 reprovou: performance 0,86, LCP 3406 ms e 174 499 B de scripts. O relatório do Lighthouse (`network-requests`) lista os scripts carregados: `https://gc.kis.v2.scr.kaspersky-labs.com/.../main.js` (162 983 B, injetado pelo Kaspersky desta máquina), o módulo do site (9 026 B) e o script same-origin da Vercel (2 491 B). Sem o script do antivírus a soma fica em cerca de 11,5 KB, abaixo do limite de 20 480 B, o que é consistente com os 6115 B gzip medidos na Fase 6. É o mesmo antivírus que impediu `networkidle` em `form-gates --live` (07-06). **Isto não foi aprovado localmente.** A prova do Lighthouse >= 95 vem do job `lhci-production` do CI (abaixo), que roda em runner limpo.

## Evidências (produção)

- **Cabeçalhos da apex (`curl -I`, 07-06 e novamente nesta execução, bloco impresso pela verificação 6):** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`, `Content-Security-Policy` enforcing com `frame-ancestors 'none'`, `script-src 'self'` com 7 hashes e `style-src 'self'` com 4 hashes, sem `unsafe-inline`, sem `Report-Only` e sem `X-Powered-By`.
- **header-gates live (07-06, `--expect=enforce`):** `RESUMO: 6 PASS / 0 FAIL (live)` cobrindo `/`, `/obrigado`, `/obrigado/`, `/nao-existe` (404), um arquivo de `/_astro/`, `/og-image.jpg` e `/api/orcamento` (405), todos com o conjunto completo. Job `headers-production`: https://github.com/Felipe-Salles/dmarques/actions/runs/39268752469 (success). O `headers.yml` também roda `form-gates --live` e `form-gates --live --check=cspCarga,cookiesZero,terceiros` em produção; esse run foi verde.
- **form-gates live local:** `--check=cspCarga,cookiesZero,terceiros` estourou `Timeout 30000ms` nesta máquina (o Kaspersky impede `networkidle`; registrado em 07-06). Não aprovado localmente; a cobertura vem do `headers-production` acima.
- **Lighthouse de produção:** job `lhci-production`, run https://github.com/Felipe-Salles/dmarques/actions/runs/39268752412 (success). Asserções em nível `error`: performance, seo, best-practices e accessibility com `minScore` 0,95, LCP <= 2500 ms, CLS <= 0,05, TBT <= 200 ms e `resource-summary:script:size` <= 20480 B; todas passaram. O log não imprime as notas individuais (P06-002).
- **Report-Only (plano 07-04):** run https://github.com/Felipe-Salles/dmarques/actions/runs/39260825312 (success); `REPORT_ONLY_CLEAN: yes`.
- **Promoção para enforcing (plano 07-05):** commit `8ae55f2` (correção de workflow `3297832`, docs `9080377`); run https://github.com/Felipe-Salles/dmarques/actions/runs/39261830281 (success; header-gates live 6 PASS, form-gates live 4 PASS incluindo `cspCarga` e `cspEnvio`).
- **Merge e produção (plano 07-06):** PR #9 integrado por squash em `98a0dbf` com aprovação explícita de Felipe; `PRODUCTION_HEADERS: ok`.
- **securityheaders.com (SEC-06), 2026-10-19:** nota **A+**, informada por Felipe (resposta literal: "A+, previews ok").
- **Prévias sociais após COOP/CORP, 2026-10-19:** LinkedIn Post Inspector e WhatsApp mostram a imagem de compartilhamento (mesma resposta de Felipe).
- **Preload do HSTS:** decisão de Felipe em 2026-10-19: **adiar** ("defer"). Evidência apresentada: `curl -sI http://agenciadmarques.com.br/` retorna HTTP/1.0 308 com `Location: https://agenciadmarques.com.br/`; `curl -sI https://www.agenciadmarques.com.br/` retorna HTTP/1.1 308 para a apex, com `Strict-Transport-Security: max-age=63072000` (padrão da Vercel no redirect, sem `includeSubDomains`/`preload`); a apex serve `max-age=63072000; includeSubDomains; preload`. Risco aceito (T-07-34): a primeira visita fica sujeita a downgrade até o HSTS ser visto; reavaliar o preload junto com o marco 2 (Cloudflare).

## Itens mecânicos do gabarito

1. **Audit limpo:** PASS (verificação 1).
2. **Sem `style=` em `src/` e sem CSS inline de página:** PASS (verificações 2 e 3). Inline: 21 `<style>`, 70 blocos `@font-face`, 15 `<script>` sem `src`.
3. **Cabeçalhos por `curl -I`:** PASS (verificação 6) contra a produção, após a correção do script (P07-002).
4. **Segredos fora do bundle:** PASS (verificação 4).
5. **Exatamente 1 Function:** PASS (verificação 5, `/api/orcamento`).
6. **Lighthouse >= 95:** a verificação 7 reprovou localmente por injeção de script do antivírus (análise acima); PASS em produção pelo job `lhci-production` (run 39268752412). Registrado como P07-001.
7. **Achados com responsável, prazo e sem High:** ver a tabela.
8. **Sem `console.*` no servidor:** PASS (verificação 8).
9. **Sem `.map` nem `sourceMappingURL`:** PASS (verificação 9).
10. **Sem `ClientRouter`/`astro:transitions`:** PASS (verificação 10).
11. **Sem carga de recurso de origem externa:** PASS (verificação 11).
12. **Sem `meta http-equiv` de CSP:** PASS (verificação 12); a CSP vai por cabeçalho.
13. **Sem texto de diagnóstico em 404/500/`erro-envio/falha`:** PASS (verificação 13).

## Itens de julgamento

- **Dependência nova justificada?** Nenhuma dependência de runtime nova nesta fase.
- **Asset de terceiros novo?** Não. A CSP permite apenas `'self'`; nenhum asset externo foi adicionado.
- **SRI para assets externos futuros?** Sim: a regra está em `docs/seguranca-headers.md` (seção "Regra de SRI para assets externos futuros"), e a verificação 11 barra qualquer carga externa hoje. Não há asset externo, portanto não há SRI a aplicar.
- **Segredo novo?** Não.
- **Achados com responsável e prazo, sem High aberto?** Sim, tabela abaixo.

## Itens específicos da fase

- **Report-Only antes de enforcing:** cumprido (07-04 com `REPORT_ONLY_CLEAN: yes`, promoção em 07-05).
- **CSP por cabeçalho, por hash, sem `unsafe-inline` em `script-src`:** confirmado na produção.
- **Roteiro de rollback:** `CSP_MODE=report-only` no projeto Vercel mais redeploy, ou reverter o merge `98a0dbf`.

## Tabela de achados (esquema D-12)

Convenção de ID: `P07-NNN`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P06-003 | Produção mostrava só HSTS no `curl -I`. Agora a apex serve o conjunto completo (HSTS com includeSubDomains e preload, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, CSP enforcing), comprovado pelo `curl -I` do 07-06, pela verificação 6 desta execução e pela nota A+ do securityheaders.com. | Low | Fechado | Evidência acima. | 2026-10-19 | Felipe Salles |
| P07-001 | Verificação 7 (Lighthouse) e `form-gates --live` de carga não passam localmente: o Kaspersky injeta `main.js` (163 KB) e impede `networkidle`. Passam no CI (`lhci-production`, `headers-production`). | Low | Aberto | Repetir `security-check.sh` e `form-gates --live` numa máquina sem antivírus que injete scripts. | 2026-12-31 | Felipe Salles |
| P07-002 | `security-check.sh` verificação 6 apagava quebras de linha em vez de `\r` e reprovava todos os cabeçalhos com `PREVIEW_URL` definido. | Low | Fechado | Corrigido neste PR (verificação 6 PASS). | 2026-10-19 | Felipe Salles |
| P07-003 | Preload do HSTS adiado; a primeira visita fica sujeita a downgrade (T-07-34). O redirect `www` serve HSTS só com `max-age`. | Low | Aceito | Reavaliar o preload com o marco 2 (Cloudflare) e conferir os subdomínios na GoDaddy antes de submeter. | 2026-12-31 | Felipe Salles |
| P06-002 (carregado) | Lighthouse de produção sem números exatos (`uploadArtifacts: false`). | Low | Aberto | Avaliar `uploadArtifacts: true` numa fase de observabilidade (mesmo item que P03-006). | 2026-12-31 | Felipe Salles |
| P05-008 (carregado) | Dependabot em `main`: `extract-zip` (2 high, dev via lhci, ignoradas), `smol-toml`, `sprintf-js`, `ip-address`, `uuid` (moderate). Pré-existentes. | Med | Aberto | Atualizar quando astro e `@lhci/cli` permitirem. | 2026-12-31 | Felipe Salles |
| P05-003 (carregado) | Vercel Hobby em uso comercial; reavaliar Pro antes de divulgar o domínio. | Med | Aceito | Reavaliar a migração. | 2026-12-31 | Felipe Salles |

**Nenhum achado High em aberto.**

## Linha de fechamento — regra dura

Nenhuma linha é `High` e `Aberto`. Verificações mecânicas 1 a 6 e 8 a 13 passam; a 7 reprova só localmente por injeção do antivírus (P07-001) e passa em produção no CI. Nota do securityheaders.com: A+ (Felipe, 2026-10-19). Prévias sociais conferidas. Preload do HSTS adiado por decisão de Felipe. Fase apta ao fechamento.
