# Retrospectiva do projeto

## Milestone v1.0 ? Site institucional

Entregue em 2026-10-21; oito fases e 65 planos.

### O que foi constru?do

Landing Aurora em Astro com conte?do tipado, formul?rio resiliente, identidade real, SEO e seguran?a com gates no CI.

### O que funcionou

HTML est?tico e enhancement pequeno mantiveram fallback e or?amento de JS. Checkpoints preservaram escolhas reais do Felipe; CI e provas de falha controlada verificaram gates. Revis?o final encontrou intera??o entre valida??o e antispam que mocks isolados n?o detectaram.

### O que gerou retrabalho

Mudan?as visuais deixaram metas antigas em documentos ativos. Alguns SUMMARYs n?o tinham requirements-completed; ferramentas contaram tarefas/IDs incorretamente. A regex antiga excluiu sete IDs A11Y; o SDK sinalizou resumos completos como ausentes. Build local excedeu metas antigas de feedback.

### Padr?es e li??es

- Manter requisitos, SUMMARY e VERIFICATION alinhados ao encerrar cada fase.
- Extrair IDs com n?meros no prefixo e conferir igualdade de conjuntos, n?o somente totais.
- Testar a intera??o entre valida??o e defesas antiabuso com o handler real; preservar POST nativo.
- Distinguir evid?ncia atual, mock e aprova??o hist?rica; registrar riscos sem transformar d?vida em resultado aprovado.
- Validar resultados de ferramentas contra arquivos reais antes de alterar fatos ou pedir nova aprova??o.

### Custos observados

Distribui??o de modelos e quantidade de sess?es n?o dispon?veis; n?o estimadas. Build local final medido em 3m13s; su?te de m?dulos r?pida, mas ciclo completo de CI/deploy leva minutos.

## Tend?ncias entre milestones

S? h? um milestone encerrado; ainda n?o h? tend?ncia compar?vel. Linha de base: 165 testes, 94 requisitos ativos atendidos, sem percentual de cobertura de linhas aferido.
