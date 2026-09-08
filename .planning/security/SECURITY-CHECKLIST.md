# Gabarito de revisão de segurança (SEC-07)

> **Nenhuma fase fecha com achado High em aberto.**

Este é o gabarito reutilizável e versionado da revisão de segurança. Ele roda ao
fim de cada fase. Cada execução gera um arquivo datado em
`.planning/security/runs/phase-NN.md`, que anexa a saída de
`scripts/security-check.sh` e responde à mão os itens de julgamento.

A Fase 1 implementa exatamente a lista de itens do SEC-07 de `REQUIREMENTS.md`.
Fases posteriores acrescentam itens específicos da fase ao final desta lista, sem
remover nenhum destes sete.

## Itens mecânicos (respondidos por script)

Todos os itens abaixo são verificados por `scripts/security-check.sh`, executado
de forma idêntica por uma pessoa localmente e pelo CI (D-11). Cada item nomeia o
número da verificação correspondente dentro do script.

1. `pnpm audit` limpo no limiar `--audit-level=high`; advisories de severidade menor são registrados como achados na tabela abaixo, com responsável e prazo, nunca ignorados em silêncio. Mecânico — `scripts/security-check.sh` verificação 1.
2. grep por nova superfície inline: atributos `style="` em `src/` e blocos `<script>` / `<style>` inline no HTML construído; blocos `@font-face` da Fonts API são permitidos e apenas contados, enquanto qualquer CSS de página, token ou bundle inline reprova. Mecânico — `scripts/security-check.sh` verificações 2 e 3.
3. inspeção `curl -I` dos cabeçalhos de resposta do preview implantado: a Fase 1 apenas registra a baseline; as asserções sobre os cabeçalhos passam a valer na Fase 7. Mecânico — `scripts/security-check.sh` verificação 6.
4. varredura de segredos na saída de build: nomes das variáveis declaradas mais o padrão `re_[A-Za-z0-9]{20,}`, contra `STATIC_DIR` e `.vercel/output`, sem nenhum resultado. Mecânico — `scripts/security-check.sh` verificação 4.
5. contagem de Functions serverless `<= 1` (Fase 1: 0; a Fase 5 leva a exatamente 1). Mecânico — `scripts/security-check.sh` verificação 5.
6. gate do Lighthouse: mobile `>= 95` nas quatro categorias (Performance, SEO, Best Practices, Accessibility) contra o preview. Mecânico — `scripts/security-check.sh` verificação 7.
7. achados registrados na tabela com severidade, responsável e prazo; nenhuma fase fecha com achado High em aberto. Julgamento — `scripts/security-check.sh` produz o resumo PASS/FAIL/SKIP que alimenta a triagem, mas o preenchimento e a decisão de aceite são manuais.

## Itens de julgamento (respondidos à mão)

Registrados no arquivo de execução da fase, com base nas notas da fase:

- Toda dependência nova está justificada nas notas da fase?
- Todo asset de terceiros novo é self-hosted ou tem integridade verificável e justificativa documentada?
- Todo segredo novo foi declarado em `astro:env` com `access: 'secret'` e comprovadamente fica fora do bundle do cliente?
- Cada achado de severidade menor tem responsável e prazo, e nenhum achado High permanece em aberto no fechamento da fase?

## Tabela de achados

Convenção de ID: `P<NN>-NNN`, onde `NN` é o número da fase. Vocabulário de
severidade: `Low` / `Med` / `High`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P00-000 | linha de exemplo (substituir por achados reais no arquivo de execução da fase) | Low | Open | descrever a ação corretiva | 2026-01-01 | Felipe Salles |

## Como executar

Rode `bash scripts/security-check.sh --ci`. O CI roda o comando idêntico como
checagem bloqueante. Anexe a saída completa em
`.planning/security/runs/phase-NN.md`, responda à mão os itens de julgamento e
transcreva os achados para a tabela acima. O arquivo de execução de cada fase é
criado no fechamento daquela fase, não aqui.
