import { initReveal } from './reveal.ts';
import { initScroll } from './scroll.ts';
import { initVisibility } from './visibility.ts';

document.documentElement.classList.add('fx');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initReveal(reduced);
initScroll(reduced);
initVisibility();
