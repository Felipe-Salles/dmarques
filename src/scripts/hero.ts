export function initHero(reduced: boolean): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  const heroAurora = document.querySelector<HTMLElement>('.hero .aurora');
  const contact = document.querySelector<HTMLElement>('#contato');
  const contactAurora = document.querySelector<HTMLElement>('#contato .aurora');

  if (hero && heroAurora) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        heroAurora.classList.add('lit');
        if (!reduced) heroAurora.classList.add('drift');
        setTimeout(() => hero.classList.add('in'), reduced ? 0 : 250);
      }),
    );
  }

  if (contact && contactAurora) {
    if (!('IntersectionObserver' in window)) {
      contactAurora.classList.add('lit');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          contactAurora.classList.add('lit');
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(contact);
  }
}
