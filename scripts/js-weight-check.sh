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
for rel in ${SCRIPTS[@]+"${SCRIPTS[@]}"} ${MODULEPRELOADS[@]+"${MODULEPRELOADS[@]}"}; do
  f="$OUT_DIR/${rel#/}"
  [ -f "$f" ] || continue
  gz=$(gzip -c "$f" | wc -c)
  echo "  $rel  ${gz} B gz"
  total=$((total + gz))
done

echo "JS da rota da landing (gzip): ${total} B  orcamento: ${BUDGET_BYTES} B"
if [ "$total" -gt "$BUDGET_BYTES" ]; then
  echo "FAIL: peso de JS acima do orcamento"
  exit 1
fi

node -e 'const p=require("./package.json");const d={...p.dependencies,...p.devDependencies};const re=/^(react|react-dom|preact|vue|svelte|@angular\/|solid-js|framer-motion|motion|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress\/)/;const bad=Object.keys(d).filter(k=>re.test(k));if(bad.length){console.error("FAIL: dependencias de UI/animacao proibidas: "+bad.join(", "));process.exit(1)}'

echo "PASS: nenhum framework de UI / biblioteca de animacao nas dependencias"
echo "PASS: peso de JS dentro do orcamento"
