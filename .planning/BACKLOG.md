# Pend?ncias ap?s v1.0

Encerramento em 2026-10-21 com status de auditoria `tech_debt`. Estes itens preservam pend?ncias e decis?es existentes; n?o s?o um plano novo nem nova aceita??o de risco.

| Item | Situa??o e pr?ximo passo |
|---|---|
| Depend?ncias | Gate high passa com allowlist; audit completo ainda aponta ocorr?ncias. Revisar transitivas e exclus?es em manuten??o, sem declarar audit limpo. |
| INP | Medi??o de campo pendente; TBT de laborat?rio n?o comprova INP. |
| Cloudflare | Milestone 2 planejado: WAF, rate limiting de borda, mitiga??o e Turnstile. N?o iniciado. Preservar todos os registros GoDaddy/MX/SPF/DKIM/DMARC/Resend numa eventual migra??o. |
| Vercel Hobby | Risco de uso comercial j? registrado/aceito na v1; revisar adequa??o antes da pr?xima expans?o. |
| D-29 | Publica??o da pol?tica/aviso detalhado removida por decis?o do Felipe; base legal e reten??o internas preservadas. Risco de transpar?ncia continua registrado. |
| Seguran?a residual | P05-008, P06-002, P07-001 e P07-003: consultar auditoria e verifica??o 07 antes de reclassificar; n?o presumir todos abertos nem resolvidos hoje. Submiss?o ? lista de preload HSTS adiada. |
| Feedback e manuten??o | Build local acima das antigas metas de lat?ncia Nyquist; formata??o preexistente do header e sugest?es de endurecimento/observabilidade continuam registradas. |

Fonte: [auditoria arquivada](milestones/v1.0-MILESTONE-AUDIT.md), verifica??es 05/06/07 e decis?es em PROJECT.md.
