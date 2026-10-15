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
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );
  for (const el of els) io.observe(el);
  setTimeout(() => {
    for (const el of els) {
      if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight) {
        el.classList.add('in');
        io.unobserve(el);
      }
    }
  }, 2600);
}
