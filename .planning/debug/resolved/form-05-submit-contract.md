---
status: resolved
trigger: "pode seguir — corrigir FORM-05 após a verificação retroativa da Fase 05"
created: 2026-10-21
updated: 2026-10-21
goal: find_and_fix
---

# FORM-05 — validação e autoridade do servidor

## Symptoms

Expected: validação inline no blur e submit, nunca por tecla; erro local não impede o POST ao servidor. Servidor decide sucesso/erro e feedback acessível permanece.

Actual: form.ts revalida no input após attempted e retorna antes do fetch quando validateFields falha. O gate validacaoInline exige esse comportamento.

Errors: divergência documental confirmada em 05-VERIFICATION, sem exceção explícita que substitua REQUIREMENTS.

Timeline: plano 05-07 especificou o comportamento divergente; identificado na auditoria de 2026-10-21.

Reproduction: enviar vazio com JS; nenhuma requisição ocorre; digitar após o erro limpa aria-invalid antes do blur.

## Current Focus

hypothesis: plano e gate contradizem o contrato; código apenas segue o plano.
test: atualizar validacaoInline para exigir POST inválido com 400 mockado, ausência de revalidação por input, correção no blur e reenvio válido.
expecting: gate falha no build atual e passa com ajuste mínimo do enhancer.
next_action: publicar correção e documentação no PR #13; seguir com reconciliação Aurora e registros Nyquist restantes.

## Evidence

- REQUIREMENTS FORM-05 é o contrato vigente; usuário autorizou continuar o fechamento sem solicitar mudança desse contrato.
- 05-07-PLAN pede input após erro e retorno antes do envio; form.ts e gate reproduzem essa instrução.
- Gate alterado e executado contra build anterior: FAIL por POST inválido ausente, WhatsApp e nome revalidados durante input. Primeira execução esperou reenvio sem que o primeiro POST tivesse ocorrido; adicionada saída antecipada para apresentar os três diagnósticos, e o gate foi repetido antes da correção.
- Correção mínima: remover listener input; aplicar erros locais no submit e seguir para fetch; manter feedback de 400 e demais controles existentes.
- Testes de módulos: 160/160 após a correção. Biome dos dois arquivos alterados passou após ajustar somente a formatação do novo gate.
- O gate agora aguarda a resposta 400 e o retorno dos campos ao estado editável, evitando depender de uma espera fixa para processar a resposta do servidor.

## Resolution

root_cause: plano 05-07 e gate exigiam comportamento contraditório com FORM-05, sem decisão explícita que substituísse REQUIREMENTS.

fix: listener input removido; submit aplica erros locais e continua para fetch; resposta 400 do servidor mantém feedback acessível, foco e edição. Validação no blur e restrições de envio em trânsito permanecem.

commit: 8570396

verification: gate validacaoInline falhou no build anterior pelos três sintomas e passou após build novo. Suíte de formulário completa 16/16; altura 6/6; módulos 160/160; check zero erros/warnings e um hint existente; Biome dos dois arquivos aprovado; security-check 11 PASS/0 FAIL/2 SKIP; JS 9.146 bytes gzip (limite 20.480).

files_changed: src/scripts/form.ts; scripts/verify/form-gates.mjs; REQUIREMENTS, 05-VERIFICATION, 05-VALIDATION, auditoria e STATE reconciliados.

limits: API mockada no navegador; nenhum e-mail/lead real enviado. Preview/Lighthouse local não executados; evidências externas históricas preservadas. Nenhum merge na main.

## Continuidade

FORM-05 concluído, Fase 05 passou 20/20 e milestone passou a 69/87 requisitos ativos, 7/8 fases aprovadas. Cobertura Nyquist da Fase 05 reconciliada; latência completa local acima de 120 s registrada como desvio. Restam reconciliação Aurora e registros Nyquist das fases 01/02/03/04/06.
