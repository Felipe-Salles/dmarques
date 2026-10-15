export function stepProgress(rectTop: number, vh: number): number {
  if (vh <= 0) return 1;
  const p = (vh * 0.85 - rectTop) / (vh * 0.55);
  return Math.min(1, Math.max(0, p));
}

export function litSteps(p: number, count: number): number {
  if (p <= 0) return 0;
  if (count <= 1) return count;
  return Math.min(count, Math.floor(p * (count - 1) + 1e-9) + 1);
}
