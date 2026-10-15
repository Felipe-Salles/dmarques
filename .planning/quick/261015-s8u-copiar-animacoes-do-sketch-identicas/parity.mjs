import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser, startStaticServer } from '../../../scripts/verify/static-server.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const sketchUrl = pathToFileURL(resolve(here, '../../sketches/001-aurora-landing/index.html')).href;
const viewport = { width: 1280, height: 900 };
const failures = [];
const rows = [];

const readTimings = (target) => {
  const { sel, idx, pseudo, sub } = target;
  let el = document.querySelectorAll(sel)[idx ?? 0];
  if (el && sub) el = el.querySelector(sub);
  if (!el) return null;
  const cs = getComputedStyle(el, pseudo || null);
  const list = (v) => v.split(/,(?![^(]*\))/).map((x) => x.trim());
  const ms = (v) => {
    const n = Number.parseFloat(v);
    return v.endsWith('ms') ? n : n * 1000;
  };
  const props = list(cs.transitionProperty);
  const durs = list(cs.transitionDuration);
  const delays = list(cs.transitionDelay);
  const fns = list(cs.transitionTimingFunction);
  const transitions = {};
  props.forEach((p, i) => {
    transitions[p] = [
      Math.round(ms(durs[i % durs.length])),
      Math.round(ms(delays[i % delays.length])),
      fns[i % fns.length],
    ];
  });
  const animations = {};
  if (cs.animationName !== 'none') {
    const names = list(cs.animationName);
    const ad = list(cs.animationDuration);
    const adl = list(cs.animationDelay);
    const af = list(cs.animationTimingFunction);
    const ai = list(cs.animationIterationCount);
    const adir = list(cs.animationDirection);
    names.forEach((n, i) => {
      animations[n] = [
        Math.round(ms(ad[i % ad.length])),
        Math.round(ms(adl[i % adl.length])),
        af[i % af.length],
        ai[i % ai.length],
        adir[i % adir.length],
      ];
    });
  }
  return { transitions, animations };
};

const pairs = [
  {
    name: 'hero palavra 5',
    site: { sel: '.hero-title .w > span', idx: 4 },
    sketch: { sel: '.hero [data-r=words] .w > span', idx: 4 },
    hero: true,
  },
  { name: 'hero lead', site: { sel: '.hero .lead' }, sketch: { sel: '.hero .lead' }, hero: true },
  { name: 'hero ctas', site: { sel: '.hero-ctas' }, sketch: { sel: '.hero-ctas' }, hero: true },
  {
    name: 'proof li 1',
    site: { sel: '.proof > li', idx: 1 },
    sketch: { sel: '.proof > *', idx: 1 },
    hero: true,
  },
  {
    name: 'proof before',
    site: { sel: '.proof', pseudo: '::before' },
    sketch: { sel: '.proof', pseudo: '::before' },
    hero: true,
  },
  {
    name: 'aurora hero',
    site: { sel: '.hero .aurora' },
    sketch: { sel: '.hero .aurora' },
    hero: true,
  },
  {
    name: 'svc 1 h3',
    site: { sel: '.svc', idx: 1, sub: 'h3' },
    sketch: { sel: '.svc', idx: 1, sub: 'h3' },
    map: { transform: 'translate' },
  },
  {
    name: 'svc 1 p',
    site: { sel: '.svc', idx: 1, sub: 'p' },
    sketch: { sel: '.svc', idx: 1, sub: 'p' },
    map: { transform: 'translate' },
  },
  {
    name: 'svc 1 after',
    site: { sel: '.svc', idx: 1, pseudo: '::after' },
    sketch: { sel: '.svc', idx: 1, pseudo: '::after' },
  },
  {
    name: 'svc 1 svg *',
    site: { sel: '.svc', idx: 1, sub: 'svg *' },
    sketch: { sel: '.svc', idx: 1, sub: 'svg *' },
  },
  {
    name: 'card 2',
    site: { sel: '.card[data-r]', idx: 2 },
    sketch: { sel: '.card[data-r]', idx: 2 },
  },
  {
    name: 'card 3',
    site: { sel: '.card[data-r]', idx: 3 },
    sketch: { sel: '.card[data-r]', idx: 3 },
  },
  {
    name: 'card 0 sweep',
    site: { sel: '.card[data-r]', idx: 0, sub: '.browser', pseudo: null },
    sketch: { sel: '.card[data-r]', idx: 0, sub: '.browser', pseudo: null },
    pseudoOf: true,
  },
  { name: 'scroller', site: { sel: '.scroller' }, sketch: { sel: '.scroller' } },
  {
    name: 'step 1 knot',
    site: { sel: '.step', idx: 1, sub: '.knot' },
    sketch: { sel: '.step', idx: 1, sub: '.knot' },
  },
  {
    name: 'step 1 div',
    site: { sel: '.step', idx: 1, sub: ':scope > div' },
    sketch: { sel: '.step', idx: 1, sub: ':scope > div' },
    only: ['transform'],
  },
  {
    name: 'step 1 h3 cor',
    site: { sel: '.step', idx: 1, sub: 'h3' },
    sketch: { sel: '.step', idx: 1, sub: ':scope > div' },
    map: { opacity: 'color' },
    only: ['opacity'],
  },
  { name: 'portrait', site: { sel: '.portrait' }, sketch: { sel: '.portrait' } },
  { name: 'portrait img', site: { sel: '.portrait img' }, sketch: { sel: '.portrait img' } },
  {
    name: 'portrait figcaption',
    site: { sel: '.portrait figcaption' },
    sketch: { sel: '.portrait figcaption' },
  },
  {
    name: 'diffs li 1',
    site: { sel: '.diffs > li', idx: 1 },
    sketch: { sel: '.diffs > *', idx: 1 },
  },
  { name: 'next li 1', site: { sel: '.next > li', idx: 1 }, sketch: { sel: '.next > *', idx: 1 } },
  {
    name: 'channel 1',
    site: { sel: '.channels > .channel', idx: 1 },
    sketch: { sel: '.channels > *', idx: 1 },
  },
  { name: 'form', site: { sel: '.form[data-r]' }, sketch: { sel: '.form[data-r]' } },
  {
    name: 'aurora contato',
    site: { sel: '.contact .aurora' },
    sketch: { sel: '.contact .aurora' },
  },
];

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

const measure = async (page, target, scroll) => {
  if (scroll) {
    await page.evaluate(({ sel, idx, sub }) => {
      let el = document.querySelectorAll(sel)[idx ?? 0];
      if (el && sub && !sub.startsWith(':scope')) el = el.querySelector(sub) || el;
      if (el) el.scrollIntoView({ block: 'center' });
    }, target);
    await settle(2600);
  }
  return page.evaluate(readTimings, target);
};

const sweepTiming = async (page, target) =>
  page.evaluate(({ sel, idx }) => {
    const el = document.querySelectorAll(sel)[idx ?? 0].querySelector('.browser');
    const cs = getComputedStyle(el, '::after');
    return [
      cs.animationName !== 'none',
      cs.animationDuration,
      cs.animationDelay,
      cs.animationTimingFunction,
      cs.animationIterationCount,
    ];
  }, target);

const compare = (pair, a, b) => {
  const only = pair.only;
  const map = pair.map || {};
  const sk = { ...b.transitions };
  const st = { ...a.transitions };
  for (const [p, v] of Object.entries(sk)) {
    if (only && !only.includes(p)) continue;
    const key = map[p] || p;
    const got = st[key];
    const label = `${pair.name} ${p}${key === p ? '' : `->${key}`}`;
    const same = got && got[0] === v[0] && got[1] === v[1] && got[2] === v[2];
    rows.push([label, got ? got.join(' ') : '-', v.join(' '), same ? 'OK' : 'DIFF']);
    if (!same) failures.push(`${label}: site ${got ? got.join(' ') : '-'} sketch ${v.join(' ')}`);
  }
  for (const [n, v] of Object.entries(b.animations)) {
    const match = Object.values(a.animations).find(
      (x) => x[0] === v[0] && x[1] === v[1] && x[2] === v[2] && x[3] === v[3] && x[4] === v[4],
    );
    const label = `${pair.name} anim ${n}`;
    rows.push([label, match ? match.join(' ') : '-', v.join(' '), match ? 'OK' : 'DIFF']);
    if (!match) failures.push(`${label}: sketch ${v.join(' ')} sem equivalente no site`);
  }
};

const main = async () => {
  const { base, close } = await startStaticServer();
  const browser = await launchBrowser();
  const urls = { site: `${base}/`, sketch: sketchUrl };

  const sampleAurora = async (which) => {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(urls[which], { waitUntil: 'domcontentloaded' });
    const out = [];
    for (const t of [3000, 12000, 26000]) {
      await page.waitForFunction((x) => performance.now() >= x, t, { polling: 50 });
      out.push(
        await page.evaluate(() => {
          const m = new DOMMatrix(
            getComputedStyle(document.querySelector('.hero .aurora')).transform,
          );
          return [m.m41, m.m42];
        }),
      );
    }
    await ctx.close();
    return out;
  };

  const [siteA, sketchA] = await Promise.all([sampleAurora('site'), sampleAurora('sketch')]);
  const expected = [
    [1, -1],
    [46, -16],
    [-35, 10],
  ];
  [3, 12, 26].forEach((t, i) => {
    const dx = Math.abs(siteA[i][0] - sketchA[i][0]);
    const dy = Math.abs(siteA[i][1] - sketchA[i][1]);
    const ok = dx <= 3 && dy <= 3;
    rows.push([
      `aurora hero t=${t}s`,
      siteA[i].map((n) => n.toFixed(1)).join(','),
      sketchA[i].map((n) => n.toFixed(1)).join(','),
      ok ? 'OK' : 'DIFF',
    ]);
    if (!ok) failures.push(`aurora t=${t}s site ${siteA[i]} sketch ${sketchA[i]}`);
    const sane =
      Math.abs(sketchA[i][0] - expected[i][0]) <= 6 &&
      Math.abs(sketchA[i][1] - expected[i][1]) <= 6;
    if (!sane)
      failures.push(`medicao do sketch t=${t}s fora do esperado ${expected[i]}: ${sketchA[i]}`);
  });

  const measureAll = async (which) => {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(urls[which], { waitUntil: 'load' });
    await settle(1800);
    const result = {};
    for (const pair of pairs) {
      const target = pair[which];
      if (pair.pseudoOf) {
        result[pair.name] = {
          transitions: {},
          animations: {},
          sweep: await (async () => {
            await page.evaluate(
              ({ sel, idx }) =>
                document.querySelectorAll(sel)[idx ?? 0].scrollIntoView({ block: 'center' }),
              target,
            );
            await settle(2600);
            return sweepTiming(page, target);
          })(),
        };
        continue;
      }
      result[pair.name] = await measure(page, target, !pair.hero);
    }
    await ctx.close();
    return result;
  };

  const [siteM, sketchM] = await Promise.all([measureAll('site'), measureAll('sketch')]);
  for (const pair of pairs) {
    const a = siteM[pair.name];
    const b = sketchM[pair.name];
    if (pair.pseudoOf) {
      const same = JSON.stringify(a.sweep) === JSON.stringify(b.sweep) && a.sweep[0];
      rows.push([`${pair.name}`, a.sweep.join(' '), b.sweep.join(' '), same ? 'OK' : 'DIFF']);
      if (!same) failures.push(`${pair.name}: site ${a.sweep} sketch ${b.sweep}`);
      continue;
    }
    if (!a || !b) {
      failures.push(`${pair.name}: elemento ausente (site ${!!a}, sketch ${!!b})`);
      continue;
    }
    compare(pair, a, b);
  }

  const rctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const rpage = await rctx.newPage();
  await rpage.goto(urls.site, { waitUntil: 'load' });
  await settle(500);
  const reduced = await rpage.evaluate(() => {
    const out = {};
    const a = getComputedStyle(document.querySelector('.hero .aurora'));
    const m = new DOMMatrix(a.transform);
    out.heroAnim = a.animationName;
    out.heroIdentity = m.isIdentity;
    out.heroOpacity = Number.parseFloat(a.opacity);
    const c = new DOMMatrix(getComputedStyle(document.querySelector('.contact .aurora')).transform);
    out.contactScaleY = c.d;
    out.hidden = [
      ...document.querySelectorAll('.w > span, .hero .lead, .hero-ctas, .proof > li, [data-r]'),
    ]
      .filter((e) => {
        const s = getComputedStyle(e);
        return Number.parseFloat(s.opacity) < 1 || s.filter !== 'none';
      })
      .map((e) => e.className || e.tagName);
    return out;
  });
  const redOk =
    reduced.heroAnim === 'none' &&
    reduced.heroIdentity &&
    reduced.heroOpacity > 0 &&
    reduced.contactScaleY === -1 &&
    reduced.hidden.length === 0;
  rows.push([
    'reduce',
    JSON.stringify(reduced),
    'sem animacao, tudo visivel',
    redOk ? 'OK' : 'DIFF',
  ]);
  if (!redOk) failures.push(`reduce: ${JSON.stringify(reduced)}`);
  await rctx.close();

  await browser.close();
  close();

  for (const r of rows) console.log(r.join(' | '));
  if (failures.length > 0) {
    console.log(`\n${failures.length} diferencas:`);
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
  console.log('\nparidade OK');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
