import { existsSync } from 'node:fs';
import process from 'node:process';
import { STATIC_DIR, launchBrowser, startStaticServer } from './static-server.mjs';

async function scrollThrough(page, step = 400, wait = 120) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(wait);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(wait);
}

const ROUTES = ['/', '/404', '/obrigado', '/politica-de-privacidade'];

const REVEAL_TARGETS = [
  '[data-r]',
  '.w > span',
  '.svc h3',
  '.svc p',
  '.diffs > li',
  '.next > li',
  '.channels > .channel',
  '.card',
  '.portrait',
  '.portrait figcaption',
];

function findHidden(selectors) {
  const out = [];
  const clipped = (value) =>
    value !== 'none' && !/^inset\(0px( 0px)*( round [^)]*)?\)$/.test(value);
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    if (nodes.length === 0) {
      out.push(`${sel} ausente`);
      continue;
    }
    for (const el of nodes) {
      const cs = getComputedStyle(el);
      if (Number(cs.opacity) < 1) {
        out.push(`${sel} opacity ${cs.opacity}`);
        break;
      }
      if (clipped(cs.clipPath)) {
        out.push(`${sel} clip-path ${cs.clipPath}`);
        break;
      }
    }
  }
  for (const el of document.querySelectorAll('.svc svg *')) {
    const offset = getComputedStyle(el).strokeDashoffset;
    if (offset !== '0' && offset !== '0px') {
      out.push(`.svc svg stroke-dashoffset ${offset}`);
      break;
    }
  }
  return out;
}

async function withPage(ctx, base, route, fn) {
  const page = await ctx.newPage();
  try {
    await page.goto(base + route, { waitUntil: 'load' });
    return await fn(page);
  } finally {
    await page.close();
  }
}

const checks = {
  async overflow({ browser, base }) {
    const fails = [];
    for (const width of [360, 390, 768, 1024, 1280, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      try {
        for (const route of ROUTES) {
          await withPage(ctx, base, route, async (page) => {
            await page.waitForTimeout(150);
            const m = await page.evaluate(() => ({
              sw: document.documentElement.scrollWidth,
              iw: window.innerWidth,
            }));
            if (m.sw > m.iw) fails.push(`${route} @${width}: scrollWidth ${m.sw} > ${m.iw}`);
          });
        }
      } finally {
        await ctx.close();
      }
    }
    return fails;
  },

  async targets({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        await scrollThrough(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        return await page.evaluate(() => {
          const out = [];
          const always = new Set([
            ...document.querySelectorAll('a.lockup'),
            ...document.querySelectorAll('.proof a'),
          ]);
          const selector =
            'a, button, summary, input:not([type=radio]):not([type=hidden]), textarea, label.chip';
          const nodes = new Set([...document.querySelectorAll(selector), ...always]);
          const describe = (el, r) =>
            `${el.tagName.toLowerCase()}.${el.className || '-'} "${(el.textContent || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
          for (const el of nodes) {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            if (r.width <= 0 || r.height <= 0 || cs.visibility === 'hidden') continue;
            const forced = always.has(el);
            if (!forced) {
              if (el.closest('p') || el.classList.contains('skip-link')) continue;
              if (r.width < 44 || r.height < 44) out.push(`alvo < 44: ${describe(el, r)}`);
            } else if (r.height < 44) {
              out.push(`alvo < 44: ${describe(el, r)}`);
            }
            const strict =
              el.classList.contains('btn') || el.matches('input:not([type=radio]), textarea');
            if (strict && r.height < 48) out.push(`altura < 48: ${describe(el, r)}`);
          }
          return out;
        });
      });
    } finally {
      await ctx.close();
    }
  },

  async nojs({ browser, base }) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      javaScriptEnabled: false,
    });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        const out = await page.evaluate(findHidden, REVEAL_TARGETS);
        const extra = await page.evaluate(() => {
          const fails = [];
          const h1 = document.querySelector('h1');
          if (!h1) fails.push('h1 ausente');
          else if (getComputedStyle(h1).opacity !== '1')
            fails.push(`h1 opacity ${getComputedStyle(h1).opacity}`);
          const form = document.querySelector('#form-orcamento');
          if (!form) fails.push('#form-orcamento ausente');
          else if (form.method !== 'post') fails.push(`form method ${form.method} (esperado post)`);
          return fails;
        });
        return [...out, ...extra];
      });
    } finally {
      await ctx.close();
    }
  },

  async reduced({ browser, base }) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'reduce',
    });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        await page.waitForTimeout(500);
        const out = await page.evaluate(() => {
          const out = [];
          const aurora = document.querySelector('.hero .aurora');
          if (!aurora) out.push('.hero .aurora ausente');
          else if (getComputedStyle(aurora).animationName !== 'none') out.push('aurora animada');
          for (const el of document.querySelectorAll('.scroller')) {
            if (getComputedStyle(el).animationName !== 'none') out.push('.scroller animado');
          }
          if (getComputedStyle(document.documentElement).scrollBehavior !== 'auto') {
            out.push('scroll-behavior != auto');
          }
          const steps = document.querySelector('.steps');
          if (!steps) out.push('.steps ausente');
          else if (getComputedStyle(steps).getPropertyValue('--p').trim() !== '1')
            out.push('--p != 1');
          return out;
        });
        const hidden = await page.evaluate(findHidden, REVEAL_TARGETS);
        return [...out, ...hidden];
      });
    } finally {
      await ctx.close();
    }
  },

  async reveal({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        const fails = [];
        await scrollThrough(page);
        const state = await page.evaluate(() => ({
          pending: [...document.querySelectorAll('[data-r]')].filter(
            (el) => !el.classList.contains('in'),
          ).length,
          scrolled: document.querySelector('.site-header')?.classList.contains('scrolled') ?? null,
          y: window.scrollY,
        }));
        if (state.pending > 0) fails.push(`${state.pending} [data-r] sem .in`);
        if (state.scrolled === null) fails.push('.site-header ausente');
        else if (state.y > 24 && !state.scrolled) fails.push('.site-header sem .scrolled');
        await page.evaluate(() => {
          const el = document.querySelector('#processo');
          if (el) el.scrollIntoView({ block: 'center' });
        });
        await page.waitForTimeout(500);
        const on = await page.evaluate(
          () => document.querySelector('a[data-nav="processo"]')?.classList.contains('on') ?? null,
        );
        if (on === null) fails.push('a[data-nav="processo"] ausente');
        else if (!on) fails.push('a[data-nav="processo"] sem .on');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        const stale = await page.evaluate(() => document.querySelectorAll('a[data-nav].on').length);
        if (stale > 0) fails.push(`${stale} a[data-nav] com .on no hero`);
        const delays = await page.evaluate(() =>
          [...document.querySelectorAll('[class]')]
            .map((el) => ({ el, cls: [...el.classList].find((c) => /^d\d+$/.test(c)) }))
            .filter(
              ({ el, cls }) => cls && getComputedStyle(el).getPropertyValue('--d').trim() === '',
            )
            .map(({ cls }) => cls),
        );
        for (const cls of delays) fails.push(`classe de delay inexistente: .${cls}`);
        return fails;
      });
    } finally {
      await ctx.close();
    }
  },

  async fallback({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      const page = await ctx.newPage();
      await page.route(
        (url) => url.origin === base && /\.m?js$/i.test(url.pathname),
        (route) => route.abort(),
      );
      await page.route(
        (url) => url.origin === base && !/\.[a-z0-9]+$/i.test(url.pathname),
        async (route) => {
          const response = await route.fetch();
          const html = (await response.text()).replace(
            /<script type="module"[^>]*>[\s\S]*?<\/script>/g,
            '',
          );
          await route.fulfill({ response, body: html });
        },
      );
      await page.goto(`${base}/`, { waitUntil: 'load' });
      await page.waitForTimeout(3500);
      const ready = await page.evaluate(() =>
        document.documentElement.classList.contains('js-ready'),
      );
      const hidden = await page.evaluate(findHidden, REVEAL_TARGETS);
      await page.close();
      const fails = [];
      if (ready) fails.push('js-ready permaneceu');
      return [...fails, ...hidden];
    } finally {
      await ctx.close();
    }
  },

  async mocks({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        const fails = [];
        const has = await page.evaluate(() => !!document.querySelector('.screen .scroller'));
        if (!has) return ['.screen .scroller ausente'];
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const before = await page.evaluate(
          () => getComputedStyle(document.querySelector('.screen .scroller')).animationPlayState,
        );
        if (before !== 'paused') fails.push(`antes de visivel: ${before} (esperado paused)`);
        await page.evaluate(() =>
          document.querySelector('.screen').scrollIntoView({ block: 'center' }),
        );
        await page.waitForTimeout(600);
        const after = await page.evaluate(
          () => getComputedStyle(document.querySelector('.screen .scroller')).animationPlayState,
        );
        if (after !== 'running') fails.push(`visivel: ${after} (esperado running)`);
        return fails;
      });
    } finally {
      await ctx.close();
    }
  },

  async tilt({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        const fine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
        if (!fine) return ['contexto sem pointer: fine'];
        const card = page.locator('.card.tilt').first();
        if ((await card.count()) === 0) return ['.card.tilt ausente'];
        await card.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          () => document.querySelector('.card.tilt')?.classList.contains('settled'),
          null,
          { timeout: 5000 },
        );
        const box = await card.boundingBox();
        if (!box) return ['.card.tilt sem caixa'];
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1, { steps: 5 });
        await page.waitForTimeout(500);
        const transform = await card.evaluate((el) => getComputedStyle(el).transform);
        return transform === 'none' ? ['tilt sem transform apos hover'] : [];
      });
    } finally {
      await ctx.close();
    }
  },

  async form({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      return await withPage(ctx, base, '/', async (page) => {
        const fails = [];
        const method = await page.evaluate(
          () => document.querySelector('#form-orcamento')?.method ?? null,
        );
        if (method === null) return ['#form-orcamento ausente'];
        if (method !== 'post') fails.push(`form method ${method} (esperado post)`);
        await page.fill('#nome', 'Fulano');
        await page.fill('#email', 'fulano@exemplo.com');
        await page.locator('#form-orcamento button[type=submit]').click();
        await page.waitForTimeout(400);
        const state = await page.evaluate(() => ({
          url: location.href,
          pending: document.querySelector('#form-pendente')?.hidden === false,
          status: (document.querySelector('#form-status')?.textContent || '').trim(),
        }));
        if (state.url.includes('?') || /fulano/i.test(state.url))
          fails.push(`dados na URL: ${state.url}`);
        if (!state.pending) fails.push('#form-pendente oculto apos envio');
        if (!state.status) fails.push('#form-status vazio apos envio');
        return fails;
      });
    } finally {
      await ctx.close();
    }
  },

  async secondary({ browser, base }) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const fails = [];
    try {
      for (const route of ['/404', '/obrigado', '/politica-de-privacidade']) {
        await withPage(ctx, base, route, async (page) => {
          const r = await page.evaluate(() => {
            const aurora = document.querySelector('.aurora');
            return {
              header: !!document.querySelector('header'),
              footer: !!document.querySelector('footer'),
              reveal: !!document.querySelector('[data-r]'),
              aurora: aurora ? getComputedStyle(aurora).animationName : null,
            };
          });
          if (!r.header) fails.push(`${route}: sem header`);
          if (!r.footer) fails.push(`${route}: sem footer`);
          if (r.reveal) fails.push(`${route}: contem [data-r]`);
          if (r.aurora === null) fails.push(`${route}: sem .aurora`);
          else if (r.aurora !== 'none') fails.push(`${route}: aurora animada (${r.aurora})`);
        });
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },
};

const args = process.argv.slice(2);
if (args.includes('--list')) {
  console.log(Object.keys(checks).join('\n'));
  process.exit(0);
}

const only = args.find((a) => a.startsWith('--check='));
const names = only ? only.slice('--check='.length).split(',').filter(Boolean) : Object.keys(checks);

if (!existsSync(STATIC_DIR)) {
  console.log('FAIL: build ausente');
  process.exit(1);
}

let pass = 0;
let fail = 0;
const { server, base } = await startStaticServer();
let browser;
try {
  browser = await launchBrowser();
  for (const name of names) {
    if (!checks[name]) {
      console.log(`FAIL ${name}: verificacao desconhecida`);
      fail++;
      continue;
    }
    let failures;
    try {
      failures = await checks[name]({ browser, base });
    } catch (error) {
      failures = [`erro: ${error.message.split('\n')[0]}`];
    }
    if (failures.length === 0) {
      console.log(`PASS ${name}`);
      pass++;
    } else {
      console.log(`FAIL ${name}: ${failures.join(' | ')}`);
      fail++;
    }
  }
} finally {
  if (browser) await browser.close();
  server.close();
}
console.log(`RESUMO: ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
