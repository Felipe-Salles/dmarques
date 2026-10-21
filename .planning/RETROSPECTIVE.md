# Retrospectiva do projeto

## Milestone v1.0 — Site institucional

Entregue em 2026-10-21; oito fases e 65 planos.

### O que foi construído

Landing Aurora em Astro com conteúdo tipado, formulário resiliente, identidade real, SEO e segurança com gates no CI.

### O que funcionou

HTML estático e enhancement pequeno mantiveram fallback e orçamento de JS. Checkpoints preservaram escolhas reais do Felipe; CI e provas de falha controlada verificaram gates. Revisão final encontrou interação entre validação e antispam que mocks isolados não detectaram.

### O que gerou retrabalho

Mudanças visuais deixaram metas antigas em documentos ativos. Alguns SUMMARYs não tinham requirements-completed; ferramentas contaram tarefas/IDs incorretamente. A regex antiga excluiu sete IDs A11Y; o SDK sinalizou resumos completos como ausentes. Build local excedeu metas antigas de feedback.

### Padrões e lições

- Manter requisitos, SUMMARY e VERIFICATION alinhados ao encerrar cada fase.
- Extrair IDs com números no prefixo e conferir igualdade de conjuntos, não somente totais.
- Testar a interação entre validação e defesas antiabuso com o handler real; preservar POST nativo.
- Distinguir evidência atual, mock e aprovação histórica; registrar riscos sem transformar dívida em resultado aprovado.
- Validar resultados de ferramentas contra arquivos reais antes de alterar fatos ou pedir nova aprovação.

### Custos observados

Distribuição de modelos e quantidade de sessões não disponíveis; não estimadas. Build local final medido em 3m13s; suíte de módulos rápida, mas ciclo completo de CI/deploy leva minutos.

## Tendências entre milestones

Só há um milestone encerrado; ainda não há tendência comparável. Linha de base: 165 testes, 94 requisitos ativos atendidos, sem percentual de cobertura de linhas aferido.
