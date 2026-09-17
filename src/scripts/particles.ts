import { computePointCount, shouldReduceParticles } from './particles.pure.ts';

interface NetworkInformationLike {
  saveData?: boolean;
}

export function initParticles(): void {
  const cv = document.querySelector<HTMLCanvasElement>('.hero-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent')
    .trim();
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(accent);
  const [r, g, b] = match
    ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
    : [108, 76, 255];
  const strokeColor = `rgb(${r}, ${g}, ${b})`;
  const accentFill = `rgba(${r}, ${g}, ${b}, 0.75)`;
  const whiteFill = 'rgba(255, 255, 255, 0.3)';

  const dpr = Math.min(1.5, window.devicePixelRatio || 1);

  let w = 0;
  let h = 0;
  let pts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

  const seed = () => {
    const rect = cv.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = computePointCount(w, h);
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike })
      .connection;
    const reduce = shouldReduceParticles({
      viewportWidth: window.innerWidth,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: connection?.saveData,
    });
    const n = reduce ? Math.round(base / 2) : base;
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.5 + 0.5,
    }));
  };

  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 108) {
          ctx.globalAlpha = 0.16 * (1 - d / 108);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = i % 4 === 0 ? accentFill : whiteFill;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    seed();
    tick();
    return;
  }

  let inView = false;
  let pageVisible = !document.hidden;
  let rafId: number | null = null;

  const syncLoop = () => {
    const shouldRun = inView && pageVisible;
    if (shouldRun && rafId === null) {
      const loop = () => {
        tick();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    } else if (!shouldRun && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      syncLoop();
    },
    { threshold: 0 },
  ).observe(cv);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    syncLoop();
  });

  seed();
  syncLoop();

  const ro = new ResizeObserver(seed);
  ro.observe(cv);
}
