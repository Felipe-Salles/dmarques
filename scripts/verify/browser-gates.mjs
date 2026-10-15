import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const ROOT = process.cwd();

function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  return join(ROOT, 'dist');
}

const STATIC_DIR = resolveStaticDir();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

function locate(pathname) {
  const root = resolve(STATIC_DIR);
  const target = resolve(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return null;
  const candidates = [target, join(target, 'index.html'), `${target}.html`];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function startServer() {
  return new Promise((resolveStart) => {
    const server = createServer((req, res) => {
      let pathname;
      try {
        pathname = new URL(req.url, 'http://127.0.0.1').pathname;
      } catch {
        res.writeHead(400).end();
        return;
      }
      let file;
      try {
        file = locate(pathname);
      } catch {
        res.writeHead(400).end();
        return;
      }
      let status = 200;
      if (!file) {
        const notFound = join(resolve(STATIC_DIR), '404.html');
        if (!existsSync(notFound)) {
          res.writeHead(404).end('not found');
          return;
        }
        file = notFound;
        status = 404;
      }
      const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(status, { 'content-type': type });
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => {
      resolveStart({ server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function launch() {
  try {
    return await chromium.launch();
  } catch {
    return await chromium.launch({ channel: 'chrome' });
  }
}

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
              el.classList.contains('btn') ||
              el.matches('input:not([type=radio]), textarea');
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
        return await page.evaluate(() => {
          const out = [];
          for (const el of document.querySelectorAll('[data-r]')) {
            if (getComputedStyle(el).opacity !== '1') out.push(`[data-r] opacity ${getComputedStyle(el).opacity}`);
          }
          const h1 = document.querySelector('h1');
          if (!h1) out.push('h1 ausente');
          else if (getComputedStyle(h1).opacity !== '1') out.push(`h1 opacity ${getComputedStyle(h1).opacity}`);
          for (const el of document.querySelectorAll('.w > span')) {
            if (Number(getComputedStyle(el).opacity) < 1) out.push('.w > span com opacity < 1');
          }
          return out;
        });
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
        return await page.evaluate(() => {
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
          else if (getComputedStyle(steps).getPropertyValue('--p').trim() !== '1') out.push('--p != 1');
          for (const el of document.querySelectorAll('[data-r]')) {
            if (getComputedStyle(el).opacity !== '1') out.push('[data-r] opacity != 1');
          }
          return out;
        });
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
          pending: [...document.querySelectorAll('[data-r]')].filter((el) => !el.classList.contains('in')).length,
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
        (url) => url.origin === base && !/\.[a-z0-9]+$/i.test(url.pathname),
        async (route) => {
          const response = await route.fetch();
          const html = (await response.text()).replace(
            /<script type="module">[\s\S]*?<\/script>/g,
            '',
          );
          await route.fulfill({ response, body: html });
        },
      );
      await page.goto(`${base}/`, { waitUntil: 'load' });
      await page.waitForTimeout(3500);
      const result = await page.evaluate(() => ({
        ready: document.documentElement.classList.contains('js-ready'),
        hidden: [...document.querySelectorAll('[data-r]')].filter(
          (el) => getComputedStyle(el).opacity !== '1',
        ).length,
      }));
      await page.close();
      const fails = [];
      if (result.ready) fails.push('js-ready permaneceu');
      if (result.hidden > 0) fails.push(`${result.hidden} [data-r] invisiveis`);
      return fails;
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
        await page.evaluate(() => document.querySelector('.screen').scrollIntoView({ block: 'center' }));
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
const { server, base } = await startServer();
let browser;
try {
  browser = await launch();
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
