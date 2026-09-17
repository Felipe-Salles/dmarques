export function computePointCount(width: number, height: number): number {
  return Math.round(Math.min(90, Math.max(28, (width * height) / 11000)));
}

export function shouldReduceParticles(input: {
  viewportWidth: number;
  smallViewportBreakpoint: number;
  hardwareConcurrency: number | undefined;
  saveData: boolean | undefined;
}): boolean {
  const smallViewport = input.viewportWidth < input.smallViewportBreakpoint;
  const fewCores = typeof input.hardwareConcurrency === 'number' && input.hardwareConcurrency <= 4;
  return smallViewport || fewCores || input.saveData === true;
}
