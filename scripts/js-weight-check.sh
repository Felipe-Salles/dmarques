#!/usr/bin/env bash
set -euo pipefail

BUDGET_BYTES=20480

if [ "$#" -ge 1 ] && [ -n "$1" ]; then
  OUT_DIR="$1"
  if [ ! -f "$OUT_DIR/index.html" ]; then
    echo "FAIL: $OUT_DIR/index.html nao encontrado (diretorio de saida informado explicitamente)"
    exit 1
  fi
else
  OUT_DIR="${STATIC_DIR:-.vercel/output/static}"
  if [ ! -f "$OUT_DIR/index.html" ]; then
    for cand in .vercel/output/static dist; do
      if [ -f "$cand/index.html" ]; then
        OUT_DIR="$cand"
        break
      fi
    done
  fi
  if [ ! -f "$OUT_DIR/index.html" ]; then
    echo "FAIL: nenhum index.html em $OUT_DIR, .vercel/output/static ou dist (rode 'pnpm build' primeiro)"
    exit 1
  fi
fi

INDEX="$OUT_DIR/index.html"

echo "diretorio de saida: $OUT_DIR"

SCRIPTS=()
while IFS= read -r rel; do
  [ -n "$rel" ] && SCRIPTS+=("$rel")
done < <(grep -oE '<script[^>]+src="[^"]+\.js"' "$INDEX" | grep -oE 'src="[^"]+"' | sed -E 's/src="([^"]+)"/\1/' || true)

MODULEPRELOADS=()
while IFS= read -r rel; do
  [ -n "$rel" ] && MODULEPRELOADS+=("$rel")
done < <(grep -oE '<link[^>]+rel="modulepreload"[^>]+href="[^"]+"' "$INDEX" | grep -oE 'href="[^"]+"' | sed -E 's/href="([^"]+)"/\1/' || true)

total=0
ref_count=0
measured_count=0
for rel in ${SCRIPTS[@]+"${SCRIPTS[@]}"} ${MODULEPRELOADS[@]+"${MODULEPRELOADS[@]}"}; do
  ref_count=$((ref_count + 1))
  f="$OUT_DIR/${rel#/}"
  if [ ! -f "$f" ]; then
    echo "FAIL: script referenciado nao encontrado: $rel (resolvido para $f)"
    exit 1
  fi
  gz=$(gzip -c "$f" | wc -c)
  echo "  $rel  ${gz} B gz"
  total=$((total + gz))
  measured_count=$((measured_count + 1))
done

if [ "$ref_count" -gt 0 ] && [ "$measured_count" -eq 0 ]; then
  echo "FAIL: $ref_count scripts referenciados mas nenhum medido"
  exit 1
fi

inline_js=$(perl -0777 -ne 'while(/<script(?![^>]*\bsrc=)[^>]*>(.*?)<\/script>/gis){print $1}' "$INDEX")
if [ -n "$inline_js" ]; then
  inline_raw=$(printf '%s' "$inline_js" | wc -c | tr -d ' ')
  inline_gz=$(printf '%s' "$inline_js" | gzip -c | wc -c | tr -d ' ')
  echo "  <script> inline  ${inline_gz} B gz (${inline_raw} B bruto)"
  total=$((total + inline_gz))
else
  echo "  <script> inline  0 B"
fi

echo "JS da rota da landing (gzip): ${total} B  orcamento: ${BUDGET_BYTES} B"
if [ "$total" -gt "$BUDGET_BYTES" ]; then
  echo "FAIL: peso de JS acima do orcamento"
  exit 1
fi

node -e 'const p=require("./package.json");const d={...p.dependencies,...p.devDependencies};const re=/^(react|react-dom|preact|vue|svelte|@angular\/|solid-js|framer-motion|motion|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress\/)/;const bad=Object.keys(d).filter(k=>re.test(k));if(bad.length){console.error("FAIL: dependencias de UI/animacao proibidas: "+bad.join(", "));process.exit(1)}'

echo "PASS: nenhum framework de UI / biblioteca de animacao nas dependencias"
echo "PASS: peso de JS dentro do orcamento"
