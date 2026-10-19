import { initAuroraGL } from './aurora-gl.ts';
import { initForm } from './form.ts';
import { initHero } from './hero.ts';
import { initReveal } from './reveal.ts';
import { initScroll } from './scroll.ts';
import { initTilt } from './tilt.ts';
import { initTitleLight } from './title-light.ts';
import { initVisibility } from './visibility.ts';

document.documentElement.classList.add('fx');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initForm();
initHero(reduced);
initTitleLight(reduced);
initReveal(reduced);
initScroll(reduced);
initVisibility();
initTilt(reduced);
initAuroraGL(reduced);
