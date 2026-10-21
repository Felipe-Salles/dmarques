# Revis?o da PR #13

Data: 2026-10-21. Head revisado: d7d1fc8. Base: origin/main. Profundidade: standard. Fluxo gsd-code-review adaptado ao escopo expl?cito da PR, executado inline.

## Resultado

Um achado P2; recomendo corrigir antes do merge. Nenhuma corre??o aplicada nesta revis?o.

### P2 ? Submit inv?lido pode encerrar o formul?rio como sucesso pelo filtro de tempo

Local: src/scripts/form.ts:268?279 (remo??o do retorno para resultado inv?lido).

Antes da PR, um formul?rio vazio era interceptado localmente. Agora segue ao servidor. Em src/lib/submit.ts, isBot ? avaliado antes de parseSubmission: elapsed inferior a 3 segundos ou superior a 24 horas recebe 200 com ok true, sem envio. O cliente interpreta qualquer 200 como sucesso, adiciona done e anuncia pedido enviado. Assim, abrir a p?gina e submeter vazio rapidamente (ou tentar corrigir um formul?rio aberto h? mais de 24 horas) pode ocultar o formul?rio e anunciar um pedido inexistente, em vez de apresentar os erros. O filtro j? existia; a nova remo??o do bloqueio exp?e esse caminho tamb?m aos dados inv?lidos.

Reprodu??o direta do handler com payload vazio, honeypot vazio e depend?ncias sem efeitos externos: elapsed=1000 retornou 200/ok true e zero emails; elapsed=4000 retornou 400/invalid. O gate novo usa resposta 400 mockada incondicional e n?o verifica essa intera??o.

Recomenda??o: preservar o requisito de n?o bloquear o POST e garantir que dados inv?lidos recebam tratamento de valida??o antes de uma resposta interpretada como sucesso. Acrescentar regress?o para payload inv?lido com tempo curto e expirado, mantendo a defesa antispam para dados v?lidos.

## Verifica??es

Diff funcional completo: form.ts, form-gates.mjs, SiteHeader.astro e .gitignore. Conferidos contratos de schema/handler, estados/foco, coleta de FormData antes de desabilitar radios, token opaco do menu e documenta??o de cobertura/exclus?es. Matriz atual possui 101 IDs, 94 ativos e sete exclu?dos; evid?ncias hist?ricas e mocks s?o identificados separadamente. N?o encontrei outro defeito concreto introduzido no escopo.

Form gates executados nesta revis?o: 16 PASS / 0 FAIL. CI do head revisado: verify, dependency-review, Lighthouse, headers-preview e Vercel aprovados; jobs de produ??o pulados como esperado. Nenhum email real enviado, altera??o de DNS, merge ou nova aprova??o humana presumida. A revis?o foi feita pelo mesmo agente que implementou as mudan?as; n?o representa revis?o independente por outro autor.

## Resolu??o autorizada ap?s a revis?o

P2 corrigido em src/lib/submit.ts: schema antes do filtro temporal; honeypot continua primeiro. Quatro regress?es falharam antes e passaram depois, mais preserva??o do honeypot. Suite completa: 165/165. Revis?o do diff corretivo confirmou que guardas de corpo/Origin, rate limit, envio e respostas permanecem preservados; n?o identificado novo achado. Registro: ../debug/resolved/invalid-submit-antispam.md.
