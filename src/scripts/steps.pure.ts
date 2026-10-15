export function stepProgress(rectTop: number, vh: number): number {
  if (vh <= 0) return 1;
  const p = (vh * 0.85 - rectTop) / (vh * 0.55);
  return Math.min(1, Math.max(0, p));
}

export function litSteps(p: number, count: number): number {
  let lit = 0;
  for (let i = 0; i < count; i++) {
    if (p >= i / count + 0.02 || p >= 0.999) lit++;
  }
  return lit;
}
