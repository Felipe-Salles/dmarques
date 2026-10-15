export function initVisibility(): void {
  if (!('IntersectionObserver' in window)) return;

  const screens = document.querySelectorAll<HTMLElement>('.screen');
  if (screens.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle('run', entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    for (const el of screens) io.observe(el);
  }

  const hero = document.querySelector<HTMLElement>('.hero');
  const aurora = document.querySelector<HTMLElement>('.hero .aurora');
  if (hero && aurora) {
    new IntersectionObserver((entries) => {
      for (const entry of entries) aurora.classList.toggle('paused', !entry.isIntersecting);
    }).observe(hero);
  }

  const links = document.querySelectorAll<HTMLElement>('a[data-nav]');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]')).filter(
    (s) => document.querySelector(`a[data-nav="${s.id}"]`) !== null,
  );
  if (links.length > 0 && sections.length > 0) {
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const active = sections.find((s) => visible.has(s.id))?.id ?? null;
        for (const link of links) link.classList.toggle('on', link.dataset.nav === active);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const s of sections) io.observe(s);
  }

  for (const details of document.querySelectorAll<HTMLDetailsElement>('details.nav-toggle')) {
    details.addEventListener('click', (event) => {
      const target = event.target as Element | null;
      if (target?.closest('.nav-panel a')) details.removeAttribute('open');
    });
  }
}
