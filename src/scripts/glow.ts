export function initGlow(): void {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!fine || !motionOk) return;

  const glow = document.querySelector<HTMLElement>('.cursor-glow');
  if (!glow) return;

  let pending = false;
  window.addEventListener(
    'pointermove',
    (event) => {
      if (pending) return;
      pending = true;
      const x = event.clientX;
      const y = event.clientY;
      requestAnimationFrame(() => {
        pending = false;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    },
    { passive: true },
  );
}
