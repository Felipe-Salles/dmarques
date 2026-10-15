const MAX_DEG = 4.5;

export function initTilt(reduced: boolean): void {
  if (reduced || !matchMedia('(pointer: fine)').matches) return;

  for (const card of document.querySelectorAll<HTMLElement>('.card.tilt')) {
    let frame = 0;
    let rx = 0;
    let ry = 0;

    const write = () => {
      frame = 0;
      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    };

    card.addEventListener(
      'pointermove',
      (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        ry = Math.max(-MAX_DEG, Math.min(MAX_DEG, px * 2 * MAX_DEG));
        rx = Math.max(-MAX_DEG, Math.min(MAX_DEG, -py * 2 * MAX_DEG));
        if (frame === 0) frame = requestAnimationFrame(write);
      },
      { passive: true },
    );

    card.addEventListener('pointerleave', () => {
      rx = 0;
      ry = 0;
      if (frame === 0) frame = requestAnimationFrame(write);
    });

    card.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform' && card.classList.contains('in')) {
        card.classList.add('settled');
      }
    });
  }
}
