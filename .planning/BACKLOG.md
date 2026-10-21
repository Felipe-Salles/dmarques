# Pendências após v1.0

Encerramento em 2026-10-21 com status de auditoria `tech_debt`. Estes itens preservam pendências e decisões existentes; não são um plano novo nem nova aceitação de risco.

| Item | Situação e próximo passo |
|---|---|
| Dependências | Gate high passa com allowlist; audit completo ainda aponta ocorrências. Revisar transitivas e exclusões em manutenção, sem declarar audit limpo. |
| INP | Medição de campo pendente; TBT de laboratório não comprova INP. |
| Cloudflare | Milestone 2 planejado: WAF, rate limiting de borda, mitigação e Turnstile. Não iniciado. Preservar todos os registros GoDaddy/MX/SPF/DKIM/DMARC/Resend numa eventual migração. |
| Vercel Hobby | Risco de uso comercial já registrado/aceito na v1; revisar adequação antes da próxima expansão. |
| D-29 | Publicação da política/aviso detalhado removida por decisão do Felipe; base legal e retenção internas preservadas. Risco de transparência continua registrado. |
| Segurança residual | P05-008, P06-002, P07-001 e P07-003: consultar auditoria e verificação 07 antes de reclassificar; não presumir todos abertos nem resolvidos hoje. Submissão à lista de preload HSTS adiada. |
| Feedback e manutenção | Build local acima das antigas metas de latência Nyquist; formatação preexistente do header e sugestões de endurecimento/observabilidade continuam registradas. |

Fonte: [auditoria arquivada](milestones/v1.0-MILESTONE-AUDIT.md), verificações 05/06/07 e decisões em PROJECT.md.
