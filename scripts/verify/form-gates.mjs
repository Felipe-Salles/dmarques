import { existsSync } from 'node:fs';
import process from 'node:process';
import { launchBrowser, STATIC_DIR, startStaticServer } from './static-server.mjs';

const FORM = '#form-orcamento';
const SUBMIT = `${FORM} button[type="submit"]`;
const SUBMIT_LABEL = 'Enviar pedido de orçamento';
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const ERROR_PAGES = {
  '/erro-envio/limite': 'Recebemos muitos pedidos em pouco tempo.',
  '/erro-envio/invalido': 'Faltou preencher algo.',
  '/erro-envio/falha': 'Não conseguimos enviar agora.',
};

const DEEP_LINK_ROUTES = [
  '/',
  '/obrigado',
  ...Object.keys(ERROR_PAGES),
  '/politica-de-privacidade',
];

const POLICY_TERMS = [
  'Art. 7º, V',
  'Art. 7º, IX',
  'Art. 18',
  'Vercel',
  'Resend',
  'Upstash',
  'GoDaddy',
  'Estados Unidos',
  '6 meses',
  'ANPD',
  'decisões automatizadas',
  'Última atualização',
];

const IGNORED_HOSTS = [/\.kaspersky-labs\.com$/];

const args = process.argv.slice(2);
const live = args.includes('--live');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function newContext(browser, options = {}) {
  return browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
    ...options,
  });
}

function mockApi(page, respond) {
  const seen = [];
  return page
    .route('**/api/orcamento', async (route) => {
      const request = route.request();
      seen.push({
        method: request.method(),
        headers: request.headers(),
        body: request.postData() ?? '',
      });
      await respond(route, seen.length);
    })
    .then(() => seen);
}

const json =
  (status, data, headers = {}) =>
  (route) =>
    route.fulfill({
      status,
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(data),
    });

async function openHome(ctx, base) {
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.locator(FORM).scrollIntoViewIfNeeded();
  return page;
}

async function openReady(ctx, base) {
  const page = await openHome(ctx, base);
  await page.waitForFunction(() => document.querySelector('#email')?.disabled === true, null, {
    timeout: 5000,
  });
  return page;
}

async function pickChannel(page, label) {
  await page.locator('fieldset.canal label.chip', { hasText: label }).click();
}

async function pickType(page, label) {
  await page.locator('label.chip', { hasText: label }).click();
}

const params = (body) => new URLSearchParams(body);

const state = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      visible: el.offsetParent !== null && cs.visibility !== 'hidden',
      disabled: el.hasAttribute('disabled'),
      invalid: el.getAttribute('aria-invalid'),
      described: el.getAttribute('aria-describedby'),
      type: el.getAttribute('type'),
      inputmode: el.getAttribute('inputmode'),
      autocomplete: el.getAttribute('autocomplete'),
      placeholder: el.getAttribute('placeholder'),
      value: el.value ?? null,
      hidden: el.hidden,
      text: (el.textContent || '').trim(),
      href: el.getAttribute('href'),
    };
  }, selector);

const activeId = (page) => page.evaluate(() => document.activeElement?.id ?? '');
const activeValue = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el?.matches?.('input[name="canal"]') ? el.value : '';
  });

async function fillBasic(page, nome = 'Ana', contact = '16996111785', field = '#whatsapp') {
  await page.fill('#nome', nome);
  await page.fill(field, contact);
}

const localChecks = {
  async semJsPostNativo({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser, { javaScriptEnabled: false });
    try {
      const page = await ctx.newPage();
      const seen = await mockApi(page, (route) =>
        route.fulfill({ status: 303, headers: { Location: '/obrigado' } }),
      );
      await page.goto(`${base}/`, { waitUntil: 'load' });
      const info = await page.evaluate(() => {
        const form = document.querySelector('#form-orcamento');
        const hp = document.querySelector('.hp input[name="empresa-site"]');
        return {
          method: form?.getAttribute('method'),
          action: form?.getAttribute('action'),
          hp: hp?.getAttribute('tabindex') ?? null,
          elapsed: !!document.querySelector('input[name="elapsed-ms"]'),
          pending: !!document.querySelector('#form-pendente'),
        };
      });
      if (info.method !== 'post') fails.push(`method ${info.method}`);
      if (info.action !== '/api/orcamento') fails.push(`action ${info.action}`);
      if (info.hp !== '-1') fails.push('honeypot sem tabindex=-1');
      if (!info.elapsed) fails.push('elapsed-ms ausente');
      if (info.pending) fails.push('#form-pendente presente');
      await fillBasic(page);
      await Promise.all([page.waitForURL('**/obrigado', { timeout: 10000 }), page.click(SUBMIT)]);
      const h1 = (await page.locator('h1').first().textContent())?.trim();
      if (h1 !== 'Pedido enviado.') fails.push(`h1 "${h1}"`);
      const req = seen[0];
      if (!req) fails.push('nenhuma requisicao ao endpoint');
      else {
        if (!/application\/x-www-form-urlencoded/.test(req.headers['content-type'] ?? ''))
          fails.push(`content-type ${req.headers['content-type']}`);
        const body = params(req.body);
        if (!body.get('nome')) fails.push('nome ausente no corpo');
        if (body.get('canal') !== 'whatsapp') fails.push(`canal ${body.get('canal')}`);
        if (!body.get('whatsapp')) fails.push('whatsapp vazio no corpo');
        if (body.get('email') !== '') fails.push(`email nao vazio: ${body.get('email')}`);
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async validacaoInline({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      const seen = await mockApi(page, json(200, { ok: true }));
      const before = await state(page, '#nome');
      await page.click(SUBMIT);
      await page.waitForTimeout(150);
      const nome = await state(page, '#nome');
      const wa = await state(page, '#whatsapp');
      const email = await state(page, '#email');
      if (nome.invalid !== 'true') fails.push('#nome sem aria-invalid');
      if (!nome.described?.includes('erro-nome')) fails.push('#nome sem erro-nome');
      if (wa.invalid !== 'true') fails.push('#whatsapp sem aria-invalid');
      if (!wa.described?.includes('erro-whatsapp')) fails.push('#whatsapp sem erro-whatsapp');
      if (email.invalid) fails.push('#email com aria-invalid');
      if ((await activeId(page)) !== 'nome') fails.push('foco fora de #nome');
      const status = (await state(page, '#form-status')).text;
      if (status !== 'Há 2 campos para corrigir.') fails.push(`status "${status}"`);
      const extra = await page.evaluate(
        () => !!document.querySelector('#erro-contato') || !!document.querySelector('.err-contato'),
      );
      if (extra) fails.push('#erro-contato ou .err-contato presente');
      if (seen.length) fails.push('requisicao enviada com formulario invalido');
      await page.fill('#whatsapp', '16996111785');
      await page.locator('#whatsapp').blur();
      const formatted = (await state(page, '#whatsapp')).value;
      if (formatted !== '(16) 99611-1785') fails.push(`mascara "${formatted}"`);
      await page.fill('#nome', 'Ana');
      await page.waitForTimeout(100);
      const nomeOk = await state(page, '#nome');
      const waOk = await state(page, '#whatsapp');
      if (nomeOk.invalid) fails.push('#nome manteve aria-invalid');
      if (waOk.invalid) fails.push('#whatsapp manteve aria-invalid');
      if (nomeOk.described !== before.described)
        fails.push(`aria-describedby de #nome nao restaurado (${nomeOk.described})`);
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async sucesso({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      const seen = await mockApi(page, async (route) => {
        await sleep(500);
        await json(200, { ok: true })(route);
      });
      await fillBasic(page, 'Ana Souza');
      await page.click(SUBMIT);
      await page.waitForTimeout(200);
      const btn = await page.evaluate(() => {
        const b = document.querySelector('#form-orcamento button[type="submit"]');
        return {
          disabled: b.disabled,
          aria: b.getAttribute('aria-disabled'),
          label: b.querySelector('.btn-label')?.textContent?.trim(),
        };
      });
      if (!btn.disabled) fails.push('botao nao desabilitado enviando');
      if (btn.aria !== 'true') fails.push('botao sem aria-disabled');
      if (btn.label !== 'Enviando…') fails.push(`rotulo "${btn.label}"`);
      await page.waitForFunction(
        () => document.querySelector('#form-orcamento')?.classList.contains('done'),
        null,
        { timeout: 5000 },
      );
      const req = seen[0];
      if (!req) fails.push('sem requisicao');
      else {
        if (!/application\/x-www-form-urlencoded/.test(req.headers['content-type'] ?? ''))
          fails.push(`content-type ${req.headers['content-type']}`);
        if (!/application\/json/.test(req.headers.accept ?? ''))
          fails.push(`accept ${req.headers.accept}`);
        const elapsed = params(req.body).get('elapsed-ms');
        if (!/^\d+$/.test(elapsed ?? '')) fails.push(`elapsed-ms "${elapsed}"`);
      }
      if ((await activeId(page)) !== 'ok-title') fails.push('foco fora de #ok-title');
      const status = (await state(page, '#form-status')).text;
      if (!status.includes('Pedido enviado.')) fails.push(`status "${status}"`);
      const href = (await state(page, '#ok-wa')).href ?? '';
      if (!decodeURIComponent(href.split('text=')[1] ?? '').includes('Ana Souza'))
        fails.push(`#ok-wa sem nome: ${href}`);
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async falha({ browser, base }) {
    const fails = [];
    const typeLabel = 'Automação de processo';
    for (const mode of ['502', 'abort']) {
      const ctx = await newContext(browser);
      try {
        const page = await openReady(ctx, base);
        if (mode === '502') await mockApi(page, json(502, { ok: false, code: 'failed' }));
        else await page.route('**/api/orcamento', (route) => route.abort());
        await fillBasic(page, 'Ana');
        await pickType(page, typeLabel);
        await page.click(SUBMIT);
        await page.waitForFunction(() => !document.querySelector('#form-erro')?.hidden, null, {
          timeout: 5000,
        });
        const tag = `[${mode}]`;
        if ((await activeId(page)) !== 'form-erro-t')
          fails.push(`${tag} foco fora de #form-erro-t`);
        const values = await page.evaluate(() => ({
          nome: document.querySelector('#nome').value,
          wa: document.querySelector('#whatsapp').value,
          ro: document.querySelector('#nome').readOnly,
          dis: document.querySelector('input[name="tipo-projeto"]').disabled,
        }));
        if (values.nome !== 'Ana') fails.push(`${tag} nome perdido`);
        if (!values.wa) fails.push(`${tag} whatsapp perdido`);
        if (values.ro || values.dis) fails.push(`${tag} campos nao editaveis`);
        const href = (await state(page, '#form-erro-wa')).href ?? '';
        if (!href.includes(encodeURIComponent('Sou Ana'))) fails.push(`${tag} href sem nome`);
        if (!href.includes(encodeURIComponent(typeLabel))) fails.push(`${tag} href sem tipo`);
      } finally {
        await ctx.close();
      }
    }
    return fails;
  },

  async limite({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      await mockApi(page, json(429, { ok: false, code: 'rate' }, { 'Retry-After': '2' }));
      await fillBasic(page);
      await page.click(SUBMIT);
      await page.waitForFunction(() => !document.querySelector('#form-limite')?.hidden, null, {
        timeout: 5000,
      });
      if ((await activeId(page)) !== 'form-limite-t') fails.push('foco fora de #form-limite-t');
      const locked = await page.evaluate(() => ({
        disabled: document.querySelector('#form-orcamento button[type="submit"]').disabled,
        label: document.querySelector('.btn-label').textContent.trim(),
      }));
      if (!locked.disabled) fails.push('botao nao desabilitado');
      if (locked.label !== 'Tente novamente em alguns minutos')
        fails.push(`rotulo "${locked.label}"`);
      await page.waitForTimeout(2500);
      const after = await page.evaluate(() => ({
        disabled: document.querySelector('#form-orcamento button[type="submit"]').disabled,
        label: document.querySelector('.btn-label').textContent.trim(),
      }));
      if (after.disabled) fails.push('botao continuou desabilitado');
      if (after.label !== SUBMIT_LABEL) fails.push(`rotulo final "${after.label}"`);
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async erro400({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      let fields = ['email'];
      await mockApi(page, (route) => json(400, { ok: false, code: 'invalid', fields })(route));
      await pickChannel(page, 'E-mail');
      await fillBasic(page, 'Ana', 'ana@exemplo.com.br', '#email');
      await page.click(SUBMIT);
      await page.waitForFunction(
        () => document.querySelector('#email')?.getAttribute('aria-invalid') === 'true',
        null,
        { timeout: 5000 },
      );
      if ((await activeId(page)) !== 'email') fails.push('foco fora de #email');
      fields = ['canal'];
      await page.click(SUBMIT);
      await page.waitForFunction(() => !document.querySelector('#form-erro')?.hidden, null, {
        timeout: 5000,
      });
    } catch (error) {
      fails.push(error.message.split('\n')[0]);
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async redeSemAnalytics({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await ctx.newPage();
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      await page.locator(FORM).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const origin = new URL(base).origin;
      const urls = [];
      page.on('request', (request) => {
        if (/^https?:/.test(request.url())) urls.push(request.url());
      });
      await mockApi(page, json(200, { ok: true }));
      await page.focus('#nome');
      await fillBasic(page);
      await page.click(SUBMIT);
      await page.waitForFunction(
        () => document.querySelector('#form-orcamento')?.classList.contains('done'),
        null,
        { timeout: 5000 },
      );
      await page.waitForTimeout(300);
      for (const url of urls) {
        const parsed = new URL(url);
        if (IGNORED_HOSTS.some((host) => host.test(parsed.hostname))) continue;
        if (parsed.origin !== origin) fails.push(`outra origem: ${url}`);
        else if (parsed.pathname !== '/api/orcamento')
          fails.push(`caminho extra: ${parsed.pathname}`);
      }
      if (!urls.some((url) => url.endsWith('/api/orcamento'))) fails.push('envio nao observado');
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async deepLinks({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      for (const route of DEEP_LINK_ROUTES) {
        const page = await ctx.newPage();
        try {
          await page.goto(base + route, { waitUntil: 'load' });
          const result = await page.evaluate(() => {
            const links = [...document.querySelectorAll('a[href*="wa.me/"]')].map((a) => ({
              href: a.getAttribute('href'),
              rel: a.getAttribute('rel') ?? '',
            }));
            const svc = [...document.querySelectorAll('.svc-wa')].map((a) => ({
              href: a.getAttribute('href') ?? '',
              label: a.getAttribute('aria-label') ?? '',
            }));
            return { links, svc, items: document.querySelectorAll('li.svc').length };
          });
          if (result.links.length === 0) fails.push(`${route}: nenhum link wa.me`);
          for (const link of result.links) {
            let text = '';
            try {
              text = new URL(link.href).searchParams.get('text') ?? '';
            } catch {
              text = '';
            }
            if (!text) fails.push(`${route}: wa.me sem text= (${link.href})`);
            if (!link.rel.includes('noopener')) fails.push(`${route}: wa.me sem noopener`);
          }
          if (route === '/') {
            if (result.svc.length !== result.items || result.items === 0)
              fails.push(`.svc-wa ${result.svc.length} != li.svc ${result.items}`);
            for (const item of result.svc) {
              if (!decodeURIComponent(item.href).includes('quero falar sobre'))
                fails.push(`.svc-wa sem "quero falar sobre": ${item.href}`);
              if (!item.label.startsWith('Falar sobre isso no WhatsApp'))
                fails.push(`.svc-wa aria-label "${item.label}"`);
            }
          }
        } finally {
          await page.close();
        }
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async politica({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await ctx.newPage();
      await page.goto(`${base}/politica-de-privacidade`, { waitUntil: 'load' });
      const info = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Nesta página"]');
        const anchors = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
        return {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('main h2').length,
          nav: !!nav,
          anchors: anchors.length,
          broken: anchors
            .filter((a) => !document.getElementById(a.getAttribute('href').slice(1)))
            .map((a) => a.getAttribute('href')),
          caption: !!document.querySelector('table caption'),
          text: document.body.textContent,
        };
      });
      if (info.h1 !== 1) fails.push(`h1 = ${info.h1}`);
      if (info.h2 !== 10) fails.push(`h2 = ${info.h2}`);
      if (!info.nav) fails.push('nav "Nesta página" ausente');
      if (info.anchors !== 10) fails.push(`ancoras = ${info.anchors}`);
      if (info.broken.length) fails.push(`ancoras quebradas: ${info.broken.join(',')}`);
      if (!info.caption) fails.push('table sem caption');
      for (const term of POLICY_TERMS) {
        if (!info.text.includes(term)) fails.push(`termo ausente: ${term}`);
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async avisoLgpd({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openHome(ctx, base);
      const info = await page.evaluate(() => {
        const submit = document.querySelector('#form-orcamento button[type="submit"]');
        const legal = document.querySelector('#form-orcamento p.legal');
        return {
          adjacent: !!submit && !!legal && submit.nextElementSibling === legal,
          text: legal?.textContent ?? '',
          link: !!legal?.querySelector('a[href="/politica-de-privacidade"]'),
          checkbox: !!document.querySelector('#form-orcamento input[type="checkbox"]'),
        };
      });
      if (!info.adjacent) fails.push('p.legal nao esta logo apos o submit');
      if (!info.text.includes('Usamos seus dados só para responder a este pedido.'))
        fails.push('texto do aviso diferente');
      if (!info.link) fails.push('link da politica ausente no aviso');
      if (info.checkbox) fails.push('checkbox presente no form');
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async paginasErro({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      for (const [route, title] of Object.entries(ERROR_PAGES)) {
        const page = await ctx.newPage();
        try {
          const response = await page.goto(base + route, { waitUntil: 'load' });
          if (response?.status() !== 200) fails.push(`${route}: status ${response?.status()}`);
          const info = await page.evaluate(() => ({
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
            h1: document.querySelector('h1')?.textContent?.trim() ?? '',
          }));
          if (!info.robots.includes('noindex')) fails.push(`${route}: sem noindex`);
          if (info.h1 !== title) fails.push(`${route}: h1 "${info.h1}"`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async canalPadrao({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      const info = await page.evaluate(() => ({
        checked: document.querySelector('input[name="canal"][value="whatsapp"]')?.checked,
        legend: document.querySelector('fieldset.canal legend')?.textContent?.trim(),
        note: !!document.querySelector('#contato-nota-obrigatorio'),
        text: document.body.textContent.includes('Preencha WhatsApp ou e-mail'),
      }));
      if (!info.checked) fails.push('radio whatsapp nao marcado');
      if (info.legend !== 'Prefiro contato por') fails.push(`legend "${info.legend}"`);
      if (info.note) fails.push('#contato-nota-obrigatorio presente');
      if (info.text) fails.push('texto "Preencha WhatsApp ou e-mail" presente');
      const wa = await state(page, '#whatsapp');
      const email = await state(page, '#email');
      if (!wa.visible) fails.push('#whatsapp invisivel');
      if (wa.type !== 'tel' || wa.inputmode !== 'tel' || wa.autocomplete !== 'tel')
        fails.push('atributos de #whatsapp');
      if (wa.placeholder !== '(16) 99999-9999') fails.push(`placeholder "${wa.placeholder}"`);
      if (email.visible) fails.push('#email visivel por padrao');
      if (!email.disabled) fails.push('#email sem disabled');
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async canalTrocaJs({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser);
    try {
      const page = await openReady(ctx, base);
      await page.click(SUBMIT);
      await page.waitForTimeout(150);
      await pickChannel(page, 'E-mail');
      await page.waitForTimeout(100);
      const email = await state(page, '#email');
      const wa = await state(page, '#whatsapp');
      if (!email.visible || email.disabled) fails.push('#email nao ativo apos trocar');
      if (email.type !== 'email' || email.inputmode !== 'email' || email.autocomplete !== 'email')
        fails.push('atributos de #email');
      if (email.placeholder !== 'voce@empresa.com.br')
        fails.push(`placeholder "${email.placeholder}"`);
      if (wa.visible) fails.push('#whatsapp visivel apos trocar');
      if (!wa.disabled) fails.push('#whatsapp sem disabled');
      if (wa.invalid) fails.push('#whatsapp manteve aria-invalid');
      if ((await activeValue(page)) !== 'email') fails.push('foco fora do radio email');
      await page.keyboard.press('Tab');
      if ((await activeId(page)) !== 'email') fails.push(`Tab levou a "${await activeId(page)}"`);
      await pickChannel(page, 'WhatsApp');
      await page.waitForTimeout(100);
      const waBack = await state(page, '#whatsapp');
      const emailBack = await state(page, '#email');
      if (!waBack.visible || waBack.disabled) fails.push('#whatsapp nao restaurado');
      if (emailBack.visible || !emailBack.disabled) fails.push('#email nao restaurado');
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async canalTrocaSemJs({ browser, base }) {
    const fails = [];
    const ctx = await newContext(browser, { javaScriptEnabled: false });
    try {
      const page = await ctx.newPage();
      await page.goto(`${base}/`, { waitUntil: 'load' });
      const has = await page.evaluate(() => CSS.supports('selector(:has(*))'));
      if (!has) {
        console.log(
          'NOTA canalTrocaSemJs: navegador sem :has(), fallback com os dois campos visiveis',
        );
        return fails;
      }
      const wa = await state(page, '#whatsapp');
      const email = await state(page, '#email');
      if (!wa.visible || email.visible) fails.push('estado inicial incorreto');
      await pickChannel(page, 'E-mail');
      const waAfter = await state(page, '#whatsapp');
      const emailAfter = await state(page, '#email');
      if (!emailAfter.visible) fails.push('#email nao apareceu');
      if (waAfter.visible) fails.push('#whatsapp continuou visivel');
      if (waAfter.disabled || emailAfter.disabled) fails.push('disabled aplicado sem JS');
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async canalEnviaSoEscolhido({ browser, base }) {
    const fails = [];
    const cases = [
      {
        label: 'E-mail',
        canal: 'email',
        field: '#email',
        value: 'ana@exemplo.com.br',
        other: 'whatsapp',
      },
      {
        label: 'WhatsApp',
        canal: 'whatsapp',
        field: '#whatsapp',
        value: '16996111785',
        other: 'email',
      },
    ];
    for (const item of cases) {
      const ctx = await newContext(browser);
      try {
        const page = await openReady(ctx, base);
        const seen = await mockApi(page, json(200, { ok: true }));
        await pickChannel(page, item.label);
        await fillBasic(page, 'Ana', item.value, item.field);
        await page.click(SUBMIT);
        await page.waitForFunction(
          () => document.querySelector('#form-orcamento')?.classList.contains('done'),
          null,
          { timeout: 5000 },
        );
        const body = params(seen[0]?.body ?? '');
        if (body.get('canal') !== item.canal)
          fails.push(`[${item.canal}] canal ${body.get('canal')}`);
        if (!body.get(item.canal)) fails.push(`[${item.canal}] ${item.canal}= vazio`);
        if (body.has(item.other)) fails.push(`[${item.canal}] corpo contem ${item.other}`);
      } finally {
        await ctx.close();
      }
    }
    const ctx = await newContext(browser, { javaScriptEnabled: false });
    try {
      const page = await ctx.newPage();
      const seen = await mockApi(page, (route) =>
        route.fulfill({ status: 303, headers: { Location: '/obrigado' } }),
      );
      await page.goto(`${base}/`, { waitUntil: 'load' });
      const has = await page.evaluate(() => CSS.supports('selector(:has(*))'));
      if (has) {
        await pickChannel(page, 'E-mail');
        await page.fill('#nome', 'Ana');
        await page.fill('#email', 'ana@exemplo.com.br');
        await Promise.all([page.waitForURL('**/obrigado', { timeout: 10000 }), page.click(SUBMIT)]);
        const body = params(seen[0]?.body ?? '');
        if (body.get('canal') !== 'email') fails.push(`[sem JS] canal ${body.get('canal')}`);
        if (!body.get('email')) fails.push('[sem JS] email vazio');
        if (body.get('whatsapp') !== '') fails.push('[sem JS] whatsapp nao vazio');
      }
    } finally {
      await ctx.close();
    }
    return fails;
  },
};

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
}

function liveContext(browser) {
  return newContext(
    browser,
    bypass ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': bypass } } : {},
  );
}

const liveChecks = {
  async cookiesZero({ browser, base }) {
    const fails = [];
    const ctx = await liveContext(browser);
    try {
      const page = await ctx.newPage();
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      await page.locator(FORM).scrollIntoViewIfNeeded();
      await page.focus('#nome');
      await page.keyboard.type('Teste de cookies');
      await page.waitForTimeout(500);
      const cookies = await ctx.cookies();
      if (cookies.length) fails.push(`cookies: ${cookies.map((c) => c.name).join(',')}`);
      const info = await page.evaluate(() => ({
        cookie: document.cookie,
        local: localStorage.length,
        session: sessionStorage.length,
      }));
      if (info.cookie !== '') fails.push('document.cookie nao vazio');
      if (info.local !== 0) fails.push(`localStorage ${info.local}`);
      if (info.session !== 0) fails.push(`sessionStorage ${info.session}`);
    } finally {
      await ctx.close();
    }
    return fails;
  },

  async terceiros({ browser, base }) {
    const fails = [];
    const ctx = await liveContext(browser);
    try {
      const page = await ctx.newPage();
      const origin = new URL(base).origin;
      const outside = new Set();
      page.on('request', (request) => {
        if (!/^https?:/.test(request.url())) return;
        const target = new URL(request.url());
        if (IGNORED_HOSTS.some((host) => host.test(target.hostname))) return;
        if (target.origin !== origin) outside.add(target.origin);
      });
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      await page.waitForTimeout(500);
      for (const found of outside) fails.push(`requisicao a ${found}`);
    } finally {
      await ctx.close();
    }
    return fails;
  },
};

if (args.includes('--list')) {
  console.log(Object.keys(live ? liveChecks : localChecks).join('\n'));
  process.exit(0);
}

let base;
let server;
if (live) {
  const preview = process.env.PREVIEW_URL;
  if (!preview) {
    console.log('FAIL: modo --live exige a variavel PREVIEW_URL');
    process.exit(2);
  }
  base = preview.replace(/\/+$/, '');
} else {
  if (!existsSync(STATIC_DIR)) {
    console.log('FAIL: build ausente');
    process.exit(1);
  }
  ({ server, base } = await startStaticServer());
}

const checks = live ? liveChecks : localChecks;
const only = args.find((a) => a.startsWith('--check='));
const names = only ? only.slice('--check='.length).split(',').filter(Boolean) : Object.keys(checks);

let pass = 0;
let fail = 0;
let browser;
try {
  browser = await launchBrowser();
  for (const name of names) {
    if (!checks[name]) {
      console.log(`FAIL: ${name} verificacao desconhecida`);
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
      console.log(`PASS: ${name}`);
      pass++;
    } else {
      console.log(`FAIL: ${name} - ${failures.join(' | ')}`);
      fail++;
    }
  }
} finally {
  if (browser) await browser.close();
  if (server) server.close();
}
console.log(`RESUMO: ${pass} PASS / ${fail} FAIL${live ? ' (live)' : ''}`);
process.exit(fail > 0 ? 1 : 0);
