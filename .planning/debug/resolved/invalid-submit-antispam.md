---
status: resolved
trigger: PR #13 review P2
created: 2026-10-21
---

# Submit inv?lido e filtro de tempo

Sintoma reproduzido: payload inv?lido com elapsed=1000 retorna 200 e zero emails; com elapsed=4000 retorna 400. Causa: filtro temporal antecede schema, e cliente passou a enviar dados inv?lidos conforme FORM-05.

Hip?tese de corre??o: manter descarte imediato do honeypot; validar schema antes do filtro temporal; manter descarte temporal para payload v?lido. Regress?es devem cobrir JSON e POST nativo, tempo curto/expirado/inv?lido, zero rate limit/email e preserva??o do honeypot.

## Resolu??o

Honeypot permanece antes do schema. Schema precede somente o filtro temporal, agora chamado hasInvalidTiming. Payload inv?lido recebe 400/fields em JSON ou 303 para /erro-envio/invalido no POST nativo, inclusive com tempo curto, expirado, n?o num?rico e negativo. Payload v?lido mant?m descarte temporal silencioso e aus?ncia de tempo continua aceita por D-27.

RED: quatro regress?es falharam com 200 em vez de 400 antes da altera??o. GREEN: 165/165 testes passaram; cinco testes novos cobrem os quatro tempos nos dois modos e honeypot inv?lido. Rate limit e envio n?o s?o chamados nesses casos. Biome aprovado ap?s normalizar a formata??o dos dois arquivos. Check e CI final acompanhados na PR #13. Nenhum email real enviado.
