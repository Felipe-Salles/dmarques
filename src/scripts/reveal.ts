export function initReveal(reduced: boolean): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-r]')).filter(
    (el) => el.closest('.hero') === null,
  );
  if (reduced || !('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('in');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.add('in');
        io.unobserve(target);
        if (target.matches('.card')) setTimeout(() => target.classList.add('settled'), 1400);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  const photoIo = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        photoIo.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -15% 0px', threshold: 0.1 },
  );
  for (const el of els) {
    if (el.matches('[data-r="photo"]')) photoIo.observe(el);
    else io.observe(el);
  }
  setTimeout(() => {
    for (const el of els) {
      if (
        !el.classList.contains('in') &&
        !el.matches('[data-r="steps"]') &&
        el.getBoundingClientRect().top < innerHeight
      ) {
        el.classList.add('in');
        io.unobserve(el);
      }
    }
  }, 2500);
}
