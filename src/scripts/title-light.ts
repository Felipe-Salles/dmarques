export function initTitleLight(reduced: boolean): void {
  const title = document.querySelector<HTMLElement>('.hero-title');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!title || !hero) return;
  const chars = Array.from(title.querySelectorAll<HTMLElement>('.ch'));
  if (chars.length === 0) return;

  if (reduced) {
    title.classList.add('lit');
    return;
  }

  const ignite = () => {
    const box = title.getBoundingClientRect();
    const sweep = 1500;
    for (const ch of chars) {
      const r = ch.getBoundingClientRect();
      const x = (r.left + r.width / 2 - box.left) / Math.max(1, box.width);
      ch.style.setProperty('--t', `${Math.round(180 + x * sweep)}ms`);
    }
    requestAnimationFrame(() => title.classList.add('lit'));
  };

  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 700))]).then(ignite, ignite);

  if (!matchMedia('(pointer: fine)').matches || !('IntersectionObserver' in window)) return;

  let centers: { x: number; y: number }[] = [];
  const measure = () => {
    centers = chars.map((ch) => {
      const r = ch.getBoundingClientRect();
      return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
    });
  };

  const glow = new Array<number>(chars.length).fill(0);
  const pointer = { x: -1e4, y: -1e4 };
  const cur = { x: -1e4, y: -1e4 };
  let raf = 0;
  let active = false;
  let ready = false;

  const step = () => {
    raf = 0;
    if (cur.x < -1e3) {
      cur.x = pointer.x;
      cur.y = pointer.y;
    } else {
      cur.x += (pointer.x - cur.x) * 0.12;
      cur.y += (pointer.y - cur.y) * 0.12;
    }
    const radius = Math.max(140, title.clientHeight * 0.55);
    let moving = Math.abs(pointer.x - cur.x) + Math.abs(pointer.y - cur.y) > 0.5;
    for (let i = 0; i < chars.length; i++) {
      const c = centers[i];
      const dx = c.x - cur.x;
      const dy = (c.y - cur.y) * 1.6;
      const g = Math.round(Math.exp(-(dx * dx + dy * dy) / (radius * radius)) * 100) / 100;
      if (g !== glow[i]) {
        glow[i] = g;
        chars[i].style.setProperty('--g', String(g));
        moving = true;
      }
    }
    if (moving && active) raf = requestAnimationFrame(step);
  };

  const kick = () => {
    if (ready && active && !raf) raf = requestAnimationFrame(step);
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX + scrollX;
      pointer.y = e.clientY + scrollY;
      kick();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.x = -1e4;
    pointer.y = -1e4;
    kick();
  });
  addEventListener('resize', measure, { passive: true });

  new IntersectionObserver((entries) => {
    active = entries.some((e) => e.isIntersecting);
    kick();
  }).observe(hero);

  setTimeout(() => {
    measure();
    ready = true;
    kick();
  }, 2600);
}
