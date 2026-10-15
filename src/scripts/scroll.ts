import { litSteps, stepProgress } from './steps.pure.ts';

export function initScroll(reduced: boolean): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  const steps = document.querySelector<HTMLElement>('.steps');
  if (!header && !steps) return;
  const items = steps ? Array.from(steps.querySelectorAll<HTMLElement>('.step')) : [];
  let ticking = false;
  let last = '';

  const frame = (): void => {
    ticking = false;
    if (header) header.classList.toggle('scrolled', scrollY > 24);
    if (steps && !reduced) {
      const p = stepProgress(steps.getBoundingClientRect().top, innerHeight);
      const value = p.toFixed(3);
      if (value !== last) {
        last = value;
        steps.style.setProperty('--p', value);
        const lit = litSteps(p, items.length);
        items.forEach((item, i) => {
          item.classList.toggle('lit', i < lit);
        });
      }
    }
  };

  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    },
    { passive: true },
  );
  frame();
}
