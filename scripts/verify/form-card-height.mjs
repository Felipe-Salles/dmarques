import process from 'node:process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchBrowser, startStaticServer } from './static-server.mjs';

const TOLERANCE_PX = 40;
const VIEWPORT = { width: 1440, height: 900 };

let failed = false;

function report(ok, message) {
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${message}`);
}

async function measureSketch(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    const url = pathToFileURL(resolve('.planning/sketches/001-aurora-landing/index.html')).href;
    await page.goto(url, { waitUntil: 'load', timeout: 20000 }).catch(() => {
      console.log('WARN: sketch carregou sem todos os recursos externos');
    });
    await page.evaluate(() => document.fonts.ready).catch(() => {
      console.log('WARN: fontes do sketch indisponiveis');
    });
    return await page.evaluate(
      () => document.querySelector('#quoteForm').getBoundingClientRect().height,
    );
  } finally {
    await context.close();
  }
}

async function measureSite(browser, base, options, clickEmail) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: 'reduce',
    ...options,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() =>
      document.querySelector('#form-orcamento').scrollIntoView({ block: 'center' }),
    );
    await page.waitForTimeout(400);
    if (clickEmail) {
      await page.locator('.chip', { hasText: 'E-mail' }).first().click();
      await page.waitForTimeout(200);
    }
    return await page.evaluate(() => {
      const form = document.querySelector('#form-orcamento');
      const visible = (id) => document.querySelector(id).offsetParent !== null;
      return {
        height: form.getBoundingClientRect().height,
        wa: visible('#whatsapp'),
        email: visible('#email'),
        has: CSS.supports('selector(:has(*))'),
      };
    });
  } finally {
    await context.close();
  }
}

function check(name, sketch, result) {
  const limit = sketch + TOLERANCE_PX;
  const h = result.height.toFixed(1);
  report(
    result.height <= limit,
    `${name}: card ${h}px, sketch ${sketch.toFixed(1)}px, limite ${limit.toFixed(1)}px`,
  );
  if (!result.has) {
    console.log(`WARN: ${name}: navegador sem :has(), sanidade de visibilidade ignorada`);
    return;
  }
  report(result.wa !== result.email, `${name}: exatamente um campo de contato visivel`);
}

const server = await startStaticServer();
let browser;
try {
  browser = await launchBrowser();
  const sketch = await measureSketch(browser);
  check('JS / WhatsApp', sketch, await measureSite(browser, server.base, {}, false));
  check('sem JS', sketch, await measureSite(browser, server.base, { javaScriptEnabled: false }, false));
  check('JS / E-mail', sketch, await measureSite(browser, server.base, {}, true));
} catch (error) {
  failed = true;
  console.log(`FAIL: ${error.message}`);
} finally {
  if (browser) await browser.close();
  server.close();
}

process.exit(failed ? 1 : 0);
