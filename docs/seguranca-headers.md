# Cabeçalhos de segurança e CSP

Cobre SEC-01 a SEC-06 e SEC-10 da Fase 7: cabeçalhos de segurança em todas as respostas, CSP por hash entregue como cabeçalho, promoção de Report-Only para enforcing, regra de SRI para assets externos e a decisão de não usar View Transitions.

## Onde cada cabeçalho nasce

| Cabeçalho | Valor | Origem |
|-----------|-------|--------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | `vercel.json` |
| X-Content-Type-Options | `nosniff` | `vercel.json` |
| X-Frame-Options | `DENY` | `vercel.json` |
| Referrer-Policy | `strict-origin-when-cross-origin` | `vercel.json` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | `vercel.json` |
| Cross-Origin-Opener-Policy | `same-origin` | `vercel.json` |
| Cross-Origin-Resource-Policy | `same-site` | `vercel.json` |
| Content-Security-Policy | ver a seção CSP | rota `/(.*)` em `.vercel/output/config.json`, escrita por `scripts/finalize-headers.mjs` depois do `astro build` |

O probe da 07-01 (PROBE_RESULT: merge-ok) confirmou que a Vercel mescla os cabeçalhos do `vercel.json` com a saída do adaptador, então nenhuma injeção extra foi necessária para os sete cabeçalhos não-CSP.

A CSP não pode viver no `vercel.json` porque os hashes de scripts e estilos só existem depois do build. O script de finalização substitui as rotas por página geradas pelo adaptador por uma única rota global `/(.*)`, que cobre também 404, variações com barra final, assets e a função `/api/orcamento`.

## CSP

Valor enforcing observado na preview (hashes substituídos por `<hashes>`):

```
default-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' <hashes>; style-src 'self' <hashes>; upgrade-insecure-requests
```

- `default-src 'self'`: base restritiva; tudo que não tem diretiva própria só carrega do próprio site.
- `img-src 'self'`: imagens só do próprio site, todas otimizadas no build.
- `font-src 'self'`: fontes self-hosted pela Fonts API do Astro.
- `connect-src 'self'`: fetch do formulário e beacon do Vercel Analytics (mesma origem).
- `frame-src 'none'`: o site não incorpora iframes.
- `worker-src 'none'`: sem service workers nem web workers.
- `object-src 'none'`: sem plugins.
- `base-uri 'none'`: impede troca da base de URLs por injeção de `<base>`.
- `form-action 'self'`: formulários só enviam para o próprio site, inclusive no POST nativo sem JS.
- `frame-ancestors 'none'`: ninguém embute o site (complementa X-Frame-Options).
- `script-src 'self'` mais hashes `sha256-`: só roda script do próprio site ou com hash calculado pelo Astro no build.
- `style-src 'self'` mais hashes `sha256-`: idem para `<style>` inline, como o emitido pela Fonts API.
- `upgrade-insecure-requests`: força https em qualquer subrecurso; só existe no modo enforcing.

## Decisões

1. SEC-02: `script-src 'self'` mais hashes `sha256-` calculados pelo Astro, sem `unsafe-inline` nem `unsafe-eval`, atende ao requisito. Um `'self'` puro é impossível porque a Fonts API do Astro emite `<style>` inline e o bootstrap `js-ready` precisa rodar antes da primeira pintura. O texto do `js-ready` vive em `src/lib/js-ready.ts` e o hash na CSP é derivado da mesma constante.
2. Report-Only primeiro: a CSP rodou em Report-Only na preview `51118ed` (07-04, run https://github.com/Felipe-Salles/dmarques/actions/runs/39260825312) sem nenhuma violação na carga nem no envio do formulário (REPORT_ONLY_CLEAN: yes). A promoção para enforcing está no commit `8ae55f2` (07-05). Rollback: definir `CSP_MODE=report-only` no ambiente do projeto na Vercel e refazer o deploy, ou reverter o commit de promoção.
3. securityheaders.com: o CI aplica os mesmos critérios de nota via `header-gates` e o passo `curl -I` cru do `headers.yml`. A varredura real em securityheaders.com é manual e fica registrada em `.planning/security/runs/phase-07.md`.
4. HSTS preload: o cabeçalho já sai com `preload`. O envio em hstspreload.org é uma decisão humana manual, depois de confirmar que não há subdomínio só http (conhecido: `www` na Vercel; `send`, `rsend`, `resend._domainkey`, `_dmarc` e MX são só DNS). A remoção da lista é na prática irreversível.
5. CORP `same-site` em tudo, em um único bloco `/(.*)`: crawlers sociais buscam as imagens pelo servidor, então não são bloqueados.
6. Sem Astro View Transitions na v1 (SEC-10): a CSP não é suportada com o `ClientRouter` e os listeners de script quebram na segunda navegação. A verificação 10 do `security-check.sh` bloqueia a introdução.
7. Sem endpoint de relatório: as violações são coletadas só pelo harness do Playwright, sem terceiros e sem dados pessoais.
8. `upgrade-insecure-requests` só no modo enforcing: dentro de Report-Only a diretiva é ignorada e registrada como erro.

## Regra de SRI para assets externos futuros

A v1 carrega zero assets de terceiros, e a verificação 11 do `security-check.sh` bloqueia qualquer carga de origem externa no HTML e CSS construídos. Se um asset externo (script, folha de estilo ou fonte) for realmente necessário:

1. Justificar nas notas da fase. Preferir self-host.
2. Usar `integrity="sha384-..."` e `crossorigin="anonymous"` com URL versionada e fixa.
3. Liberar a origem exata só na diretiva CSP relevante, via `security.csp` `resources`, nunca com `*`.
4. Atualizar a lista de operadores nos documentos de privacidade e de operação.
5. Acrescentar uma linha de julgamento SEC-07 em `.planning/security/SECURITY-CHECKLIST.md` referenciando este documento (`seguranca-headers.md`).

## Como verificar

- Local: `pnpm build && node scripts/verify/header-gates.mjs`
- Ao vivo: `PREVIEW_URL=<url> VERCEL_AUTOMATION_BYPASS_SECRET=<segredo> node scripts/verify/header-gates.mjs --live`
- Navegador: `node scripts/verify/browser-gates.mjs --check=csp`
- CI: workflow `headers.yml` (preview em todo push da branch, produção depois do deploy).
- A barra da Vercel em previews com login produz violações de `vercel.live` que não são do site.
