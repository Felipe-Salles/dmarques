#!/usr/bin/env bash
set -uo pipefail

CI_MODE=0
for arg in "$@"; do
  case "$arg" in
    --ci) CI_MODE=1 ;;
  esac
done

STATIC_DIR="${STATIC_DIR:-.vercel/output/static}"
PREVIEW_URL="${PREVIEW_URL:-}"
BYPASS="${VERCEL_AUTOMATION_BYPASS_SECRET:-}"

pass_count=0
fail_count=0
skip_count=0

pass() { echo "PASS: $1"; pass_count=$((pass_count + 1)); }
fail() { echo "FAIL: $1"; fail_count=$((fail_count + 1)); }
skip() { echo "SKIP: $1"; skip_count=$((skip_count + 1)); }

echo "== SEC-07 verificacoes mecanicas =="
if [ "$CI_MODE" -eq 1 ]; then
  echo "modo: ci"
fi
echo "STATIC_DIR: $STATIC_DIR"

audit_out=$(pnpm audit --audit-level=high 2>&1)
audit_rc=$?
if [ "$audit_rc" -eq 0 ]; then
  pass "verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical"
else
  fail "verificacao 1 - pnpm audit --audit-level=high retornou $audit_rc (advisories high/critical ou erro de execucao)"
  echo "$audit_out" | grep -E 'vulnerabilit|Severity:|advisor' | sed 's/^/  /'
fi

if [ -d src ]; then
  style_hits=$(grep -rn 'style="' src/ 2>/dev/null)
  if [ -n "$style_hits" ]; then
    fail "verificacao 2 - atributos style= encontrados em src/"
    echo "$style_hits" | head -n 20
  else
    pass "verificacao 2 - nenhum atributo style= em src/"
  fi
else
  skip "verificacao 2 - diretorio src/ ausente"
fi

html_files=$(find "$STATIC_DIR" -type f -name '*.html' 2>/dev/null)
if [ -z "$html_files" ]; then
  skip "verificacao 3 - nenhum HTML construido em $STATIC_DIR"
else
  total_style=0
  total_fontface=0
  total_inline_script=0
  offending=0
  offending_detail=""
  while IFS= read -r hf; do
    [ -n "$hf" ] || continue
    ns=$(grep -oE '<style[ >]' "$hf" 2>/dev/null | wc -l | tr -d ' ')
    nf=$(grep -oE '@font-face' "$hf" 2>/dev/null | wc -l | tr -d ' ')
    nst=$(grep -oiE '<script[^>]*>' "$hf" 2>/dev/null | wc -l | tr -d ' ')
    nssrc=$(grep -oiE '<script[^>]+src=' "$hf" 2>/dev/null | wc -l | tr -d ' ')
    total_style=$((total_style + ns))
    total_fontface=$((total_fontface + nf))
    total_inline_script=$((total_inline_script + nst - nssrc))
    remain=$(grep -oE '<style[^>]*>.*</style>' "$hf" 2>/dev/null \
      | sed -E 's/@font-face\{[^}]*\}//g; s/:root\{--font-[^}]*\}//g; s/<[^>]*>//g' \
      | tr -d '[:space:]')
    if [ -n "$remain" ]; then
      offending=$((offending + 1))
      offending_detail="$offending_detail $hf"
    fi
  done <<< "$html_files"
  echo "  <style> inline: $total_style  |  blocos @font-face: $total_fontface  |  <script> inline sem src: $total_inline_script"
  if [ "$offending" -gt 0 ]; then
    fail "verificacao 3 - CSS de pagina/token/bundle inline em$offending_detail (apenas blocos @font-face da Fonts API sao permitidos)"
  else
    pass "verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline"
  fi
fi

scan_targets=()
[ -d "$STATIC_DIR" ] && scan_targets+=("$STATIC_DIR")
[ -d .vercel/output ] && scan_targets+=(".vercel/output")
if [ "${#scan_targets[@]}" -eq 0 ]; then
  skip "verificacao 4 - nenhum diretorio de build presente para varredura de segredos"
else
  secret_files=$(grep -rIlE 'RESEND_API_KEY|re_[A-Za-z0-9]{20,}' "${scan_targets[@]}" 2>/dev/null | sort -u)
  if [ -n "$secret_files" ]; then
    fail "verificacao 4 - possivel segredo na saida de build ($(echo "$secret_files" | tr '\n' ' '))"
  else
    pass "verificacao 4 - nenhum nome de variavel de segredo ou chave na saida de build"
  fi
fi

func_count=$(find .vercel/output/functions -maxdepth 1 -name '*.func' 2>/dev/null | wc -l | tr -d ' ')
if [ "$func_count" -gt 1 ]; then
  fail "verificacao 5 - contagem de Functions = $func_count (esperado no maximo 1)"
else
  pass "verificacao 5 - contagem de Functions = $func_count (no maximo 1)"
fi

if [ -z "$PREVIEW_URL" ]; then
  skip "verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada"
else
  echo "  cabecalhos de $PREVIEW_URL:"
  if [ -n "$BYPASS" ]; then
    curl -sI -H "x-vercel-protection-bypass: $BYPASS" "$PREVIEW_URL" 2>/dev/null | sed 's/^/    /'
  else
    curl -sI "$PREVIEW_URL" 2>/dev/null | sed 's/^/    /'
  fi
  pass "verificacao 6 - cabecalhos do preview registrados (baseline da Fase 1; assercoes valem a partir da Fase 7)"
fi

if [ -z "$PREVIEW_URL" ]; then
  skip "verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado"
else
  lhci_args=(--collect.url="$PREVIEW_URL" --config=./lighthouserc.json)
  if [ -n "$BYPASS" ]; then
    lhci_args+=(--collect.settings.extraHeaders="{\"x-vercel-protection-bypass\":\"$BYPASS\"}")
  fi
  if pnpm exec lhci autorun "${lhci_args[@]}"; then
    pass "verificacao 7 - gate do Lighthouse aprovado"
  else
    fail "verificacao 7 - gate do Lighthouse reprovado"
  fi
fi

echo "== resumo: ${pass_count} PASS / ${fail_count} FAIL / ${skip_count} SKIP =="
if [ "$fail_count" -eq 0 ]; then
  exit 0
fi
exit 1
