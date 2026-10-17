---
status: complete
phase: 05-form-backend-enhancement-lgpd
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md, 05-06-SUMMARY.md, 05-07-SUMMARY.md, 05-08-SUMMARY.md, 05-09-SUMMARY.md, 05-10-SUMMARY.md, 05-11-SUMMARY.md, 05-12-SUMMARY.md, 05-13-SUMMARY.md, 05-14-SUMMARY.md]
started: 2026-10-17T12:00:00Z
updated: 2026-10-17T12:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Seletor "Prefiro contato por"
expected: Em https://agenciadmarques.com.br/#contato, o formulário mostra o grupo "Prefiro contato por" com as pílulas WhatsApp e E-mail. Só um campo de contato aparece por vez: com WhatsApp marcado aparece o campo de telefone; ao trocar para E-mail, aparece o campo de e-mail no lugar. O card não pula de altura de forma estranha.
result: pass

### 2. Validação inline
expected: Clicar em "Enviar pedido de orçamento" com o nome vazio e um telefone inválido (ex. "123") não envia nada. Os campos com problema ficam marcados em vermelho com mensagem abaixo, o foco vai para o primeiro campo errado e aparece/é anunciado "Há 2 campos para corrigir.". Ao corrigir um campo, o erro dele some.
result: pass

### 3. Envio real pelo canal WhatsApp
expected: Preenchendo nome, um tipo de projeto, WhatsApp válido e mensagem opcional, o botão mostra "Enviando pedido…" e depois o formulário exibe o estado de sucesso ("Pedido enviado. Respondemos no mesmo dia útil."). Em poucos segundos chega na sua caixa um e-mail de notificação com assunto identificando o pedido e os dados enviados (sem o campo de e-mail).
result: pass

### 4. Envio real pelo canal E-mail
expected: Repetindo com "E-mail" selecionado e um endereço seu, o sucesso aparece igual e o e-mail de notificação chega; ao clicar em Responder no seu cliente de e-mail, o destinatário preenchido é o endereço digitado no formulário (reply-to).
result: pass

### 5. Aviso "Como usamos seus dados"
expected: Abaixo do formulário há um bloco recolhível "Como usamos seus dados". Clicar abre um texto curto explicando para que os dados servem; funciona com teclado (Tab + Enter). O rodapé não tem mais link para política de privacidade e https://agenciadmarques.com.br/politica-de-privacidade dá 404.
result: skipped
reason: "Felipe removeu o bloco \'Como usamos seus dados\'; não faz mais parte do escopo (extensão de D-29). 404 de /politica-de-privacidade já verificado em produção no 05-14."

### 6. Links de WhatsApp pré-preenchidos
expected: Em cada card de serviço há um link de WhatsApp; ao clicar abre o WhatsApp (wa.me) com uma mensagem pronta citando aquele serviço. O link do rodapé e o botão flutuante também abrem o WhatsApp já com texto pré-preenchido.
result: pass

### 7. Envio sem JavaScript
expected: Com o JavaScript desativado no navegador, o formulário continua utilizável (troca de canal funciona por CSS) e o envio leva à página /obrigado com a confirmação e uma alternativa de WhatsApp. Se não quiser gerar outro e-mail, pode só abrir https://agenciadmarques.com.br/obrigado e conferir o visual.
result: pass

### 8. Limite de envios
expected: Depois de 3 envios bem-sucedidos do mesmo aparelho em 10 minutos, a próxima tentativa não envia: aparece o alerta "Muitos envios em pouco tempo. Use o WhatsApp." com o botão de WhatsApp, e o botão de enviar fica com "Tente novamente em alguns minutos".
result: pass

### 9. Páginas de erro sem JS
expected: https://agenciadmarques.com.br/erro-envio/limite, /erro-envio/invalido e /erro-envio/falha abrem páginas no visual do site, cada uma explicando o problema em pt-BR e oferecendo o WhatsApp como alternativa. Qualquer outro motivo (ex. /erro-envio/xyz) dá 404.
result: pass

## Summary

total: 9
passed: 8
issues: 0
pending: 0
skipped: 1
blocked: 0

## Gaps

[none yet]
