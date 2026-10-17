import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const ROOT = process.cwd();

function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  const fallback = join(ROOT, 'dist');
  if (existsSync(fallback)) return fallback;
  return null;
}

const STATIC_DIR = resolveStaticDir();

const ORIGIN = 'https://agenciadmarques.com.br';
const HOME_TITLE = 'Sites, sistemas e automações em Ibitinga/SP | Dmarques';
const OFFICIAL_NAME = 'Dmarques Desenvolvimento Web';

function walk(dir, exts) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      out.push(...walk(full, exts));
    } else if (!exts || exts.includes(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return file.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');
}

function read(file) {
  return readFileSync(file, 'utf8');
}

const ROUTES = {
  '/': ['index.html'],
  '/404': ['404.html'],
  '/obrigado': ['obrigado/index.html', 'obrigado.html'],
  '/erro-envio/limite': ['erro-envio/limite/index.html', 'erro-envio/limite.html'],
  '/erro-envio/invalido': ['erro-envio/invalido/index.html', 'erro-envio/invalido.html'],
  '/erro-envio/falha': ['erro-envio/falha/index.html', 'erro-envio/falha.html'],
};

const SECONDARY = Object.keys(ROUTES).filter((r) => r !== '/');

function readPage(route) {
  if (!STATIC_DIR) return null;
  for (const candidate of ROUTES[route]) {
    const file = join(STATIC_DIR, candidate);
    if (existsSync(file)) return read(file);
  }
  return null;
}

function needBuild() {
  return STATIC_DIR ? null : ['build ausente'];
}

function needPage(route) {
  const html = readPage(route);
  return html === null ? [`pagina ${route} ausente (build ausente?)`] : null;
}

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number.parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function attrOf(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  if (!m) return null;
  return decode(m[1] ?? m[2] ?? '');
}

function metaContent(html, attr, key) {
  const out = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attrOf(m[0], attr) === key) out.push(attrOf(m[0], 'content') ?? '');
  }
  return out;
}

function hasMeta(html, attr, key) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some((m) => attrOf(m[0], attr) === key);
}

function linkHrefs(html, relValue) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const r = attrOf(m[0], 'rel');
    if (r?.toLowerCase().split(/\s+/).includes(relValue)) out.push(attrOf(m[0], 'href') ?? '');
  }
  return out;
}

function titleOf(html) {
  const all = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  return all.map((m) => decode(m[1]).trim());
}

function collapse(text) {
  return decode(text).replace(/\s+/g, ' ').trim();
}

function textOf(html) {
  return collapse(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function jsonLdBlocks(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((m) => m[1]);
}

function parseLd(html) {
  const blocks = jsonLdBlocks(html);
  if (blocks.length !== 1) return null;
  try {
    return JSON.parse(blocks[0]);
  } catch {
    return null;
  }
}

function footerOf(html) {
  const m = /<footer\b[^>]*>[\s\S]*?<\/footer>/i.exec(html);
  return m ? m[0] : null;
}

function equal(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function staticFile(path) {
  return STATIC_DIR ? join(STATIC_DIR, path.replace(/^\//, '')) : null;
}

const checks = {
  'head-home'() {
    const miss = needBuild() ?? needPage('/');
    if (miss) return miss;
    const html = readPage('/');
    const fails = [];
    const titles = titleOf(html);
    if (titles.length !== 1) fails.push(`title: esperado 1, achado ${titles.length}`);
    else if (titles[0] !== HOME_TITLE) fails.push(`title divergente: "${titles[0]}"`);
    const descs = metaContent(html, 'name', 'description');
    if (descs.length !== 1) fails.push(`description: esperado 1, achado ${descs.length}`);
    else {
      const d = descs[0];
      if (d.length < 120 || d.length > 160) fails.push(`description com ${d.length} caracteres`);
      for (const word of ['Ibitinga', 'sites', 'sistemas', 'automações']) {
        if (!d.includes(word)) fails.push(`description sem "${word}"`);
      }
    }
    const canon = linkHrefs(html, 'canonical');
    if (canon.length !== 1) fails.push(`canonical: esperado 1, achado ${canon.length}`);
    else if (canon[0] !== `${ORIGIN}/`) fails.push(`canonical divergente: ${canon[0]}`);
    if (hasMeta(html, 'name', 'robots')) fails.push('meta robots presente na home');
    return fails;
  },

  secundarias() {
    const miss = needBuild();
    if (miss) return miss;
    const fails = [];
    for (const route of SECONDARY) {
      const pageMiss = needPage(route);
      if (pageMiss) {
        fails.push(...pageMiss);
        continue;
      }
      const html = readPage(route);
      const titles = titleOf(html);
      if (titles.length !== 1 || !titles[0].endsWith(` | ${OFFICIAL_NAME}`)) {
        fails.push(`${route}: title invalido "${titles.join(' / ')}"`);
      }
      const descs = metaContent(html, 'name', 'description');
      if (descs.length !== 1 || descs[0].trim() === '') {
        fails.push(`${route}: description ausente ou duplicada`);
      }
      const robots = metaContent(html, 'name', 'robots');
      if (robots.length !== 1 || robots[0] !== 'noindex') {
        fails.push(`${route}: meta robots deve ser noindex`);
      }
      if (linkHrefs(html, 'canonical').length !== 0) fails.push(`${route}: canonical presente`);
    }
    return fails;
  },

  'og-twitter'() {
    const miss = needBuild();
    if (miss) return miss;
    const fails = [];
    for (const route of Object.keys(ROUTES)) {
      const pageMiss = needPage(route);
      if (pageMiss) {
        fails.push(...pageMiss);
        continue;
      }
      const html = readPage(route);
      const one = (attr, key) => {
        const v = metaContent(html, attr, key);
        if (v.length !== 1) {
          fails.push(`${route}: ${key} esperado 1, achado ${v.length}`);
          return null;
        }
        return v[0];
      };
      const title = titleOf(html)[0] ?? null;
      const desc = metaContent(html, 'name', 'description')[0] ?? null;
      const expectEq = (key, actual, expected) => {
        if (actual !== null && actual !== expected) {
          fails.push(`${route}: ${key} "${actual}" difere de "${expected}"`);
        }
      };
      expectEq('og:type', one('property', 'og:type'), 'website');
      expectEq('og:locale', one('property', 'og:locale'), 'pt_BR');
      expectEq('og:site_name', one('property', 'og:site_name'), OFFICIAL_NAME);
      const ogTitle = one('property', 'og:title');
      const ogDesc = one('property', 'og:description');
      expectEq('og:title', ogTitle, title);
      expectEq('og:description', ogDesc, desc);
      const ogUrl = one('property', 'og:url');
      if (ogUrl !== null && !ogUrl.startsWith(`${ORIGIN}/`)) {
        fails.push(`${route}: og:url fora de ${ORIGIN}/`);
      }
      const ogImage = one('property', 'og:image');
      expectEq('og:image', ogImage, `${ORIGIN}/og-image.jpg`);
      expectEq('og:image:width', one('property', 'og:image:width'), '1200');
      expectEq('og:image:height', one('property', 'og:image:height'), '630');
      expectEq('og:image:type', one('property', 'og:image:type'), 'image/jpeg');
      const ogAlt = one('property', 'og:image:alt');
      if (ogAlt !== null && ogAlt.trim() === '') fails.push(`${route}: og:image:alt vazio`);
      expectEq('twitter:card', one('name', 'twitter:card'), 'summary_large_image');
      expectEq('twitter:title', one('name', 'twitter:title'), ogTitle);
      expectEq('twitter:description', one('name', 'twitter:description'), ogDesc);
      expectEq('twitter:image', one('name', 'twitter:image'), ogImage);
      const twAlt = one('name', 'twitter:image:alt');
      if (twAlt !== null && twAlt.trim() === '') fails.push(`${route}: twitter:image:alt vazio`);
    }
    return fails;
  },

  async 'og-image'() {
    const fails = [];
    const built = STATIC_DIR ? join(STATIC_DIR, 'og-image.jpg') : null;
    const source = join(ROOT, 'public', 'og-image.jpg');
    if (!built || !existsSync(built)) fails.push('og-image.jpg ausente no build');
    if (!existsSync(source)) fails.push('public/og-image.jpg ausente');
    for (const file of [built, source]) {
      if (!file || !existsSync(file)) continue;
      const meta = await sharp(file).metadata();
      if (meta.width !== 1200 || meta.height !== 630) {
        fails.push(`${rel(file)}: dimensoes ${meta.width}x${meta.height}`);
      }
      if (meta.format !== 'jpeg') fails.push(`${rel(file)}: formato ${meta.format}`);
      if (statSync(file).size >= 300 * 1024) fails.push(`${rel(file)}: maior que 300 KB`);
    }
    return fails;
  },

  icones() {
    const miss = needBuild();
    if (miss) return miss;
    const fails = [];
    for (const route of Object.keys(ROUTES)) {
      const pageMiss = needPage(route);
      if (pageMiss) {
        fails.push(...pageMiss);
        continue;
      }
      const html = readPage(route);
      const theme = metaContent(html, 'name', 'theme-color');
      if (theme.length !== 1 || theme[0].toLowerCase() !== '#070a14') {
        fails.push(`${route}: theme-color deve ser #070A14 (1 ocorrencia)`);
      }
      const icons = linkHrefs(html, 'icon');
      const apple = linkHrefs(html, 'apple-touch-icon');
      for (const href of ['/favicon.ico', '/favicon-32x32.png']) {
        if (!icons.includes(href)) fails.push(`${route}: link icon ${href} ausente`);
      }
      if (!apple.includes('/apple-touch-icon.png')) {
        fails.push(`${route}: apple-touch-icon ausente`);
      }
      for (const href of [...icons, ...apple]) {
        if (!href.startsWith('/')) continue;
        const file = staticFile(href.split('?')[0]);
        if (!existsSync(file)) fails.push(`${route}: arquivo ${href} ausente no build`);
      }
    }
    return [...new Set(fails)];
  },

  sitemap() {
    const miss = needBuild();
    if (miss) return miss;
    const fails = [];
    const indexFile = join(STATIC_DIR, 'sitemap-index.xml');
    const zeroFile = join(STATIC_DIR, 'sitemap-0.xml');
    if (!existsSync(indexFile)) fails.push('sitemap-index.xml ausente');
    if (!existsSync(zeroFile)) fails.push('sitemap-0.xml ausente');
    if (fails.length > 0) return fails;
    const index = read(indexFile);
    const zero = read(zeroFile);
    if (!index.includes(`<loc>${ORIGIN}/sitemap-0.xml</loc>`)) {
      fails.push('sitemap-index sem referencia a sitemap-0.xml');
    }
    const locs = [...zero.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    if (!equal(locs, [`${ORIGIN}/`])) fails.push(`sitemap-0 lista: ${locs.join(', ')}`);
    for (const [name, body] of [
      ['sitemap-index.xml', index],
      ['sitemap-0.xml', zero],
    ]) {
      for (const bad of ['obrigado', 'erro-envio', '404', '/api/']) {
        if (body.includes(bad)) fails.push(`${name} contem "${bad}"`);
      }
    }
    return fails;
  },

  robots() {
    const miss = needBuild();
    if (miss) return miss;
    const file = join(STATIC_DIR, 'robots.txt');
    if (!existsSync(file)) return ['robots.txt ausente'];
    const lines = read(file)
      .split(/\r?\n/)
      .map((l) => l.trim());
    const fails = [];
    for (const want of ['User-agent: *', 'Allow: /', `Sitemap: ${ORIGIN}/sitemap-index.xml`]) {
      if (!lines.includes(want)) fails.push(`linha ausente: ${want}`);
    }
    for (const line of lines) {
      if (/^Disallow:\s*\S/i.test(line)) fails.push(`Disallow com caminho: ${line}`);
    }
    return fails;
  },

  'json-ld'() {
    const miss = needBuild() ?? needPage('/');
    if (miss) return miss;
    const fails = [];
    for (const route of Object.keys(ROUTES)) {
      if (route === '/') continue;
      const html = readPage(route);
      if (html !== null && jsonLdBlocks(html).length !== 0) {
        fails.push(`${route}: JSON-LD nao deve existir`);
      }
    }
    const html = readPage('/');
    const blocks = jsonLdBlocks(html);
    if (blocks.length !== 1) {
      fails.push(`home: esperado 1 bloco JSON-LD, achado ${blocks.length}`);
      return fails;
    }
    if (blocks[0].includes('<')) fails.push('bloco JSON-LD contem "<" cru');
    let ld;
    try {
      ld = JSON.parse(blocks[0]);
    } catch {
      fails.push('JSON-LD invalido');
      return fails;
    }
    const expect = (label, actual, expected) => {
      if (!equal(actual, expected)) fails.push(`${label}: ${JSON.stringify(actual)}`);
    };
    expect('@context', ld['@context'], 'https://schema.org');
    expect('@type', ld['@type'], ['ProfessionalService', 'LocalBusiness']);
    expect('@id', ld['@id'], `${ORIGIN}/#organization`);
    expect('name', ld.name, OFFICIAL_NAME);
    expect('url', ld.url, `${ORIGIN}/`);
    if (typeof ld.telephone !== 'string' || !/^\+[1-9]\d{10,14}$/.test(ld.telephone)) {
      fails.push(`telephone: ${JSON.stringify(ld.telephone)}`);
    }
    expect('email', ld.email, 'contato@agenciadmarques.com.br');
    const addr = ld.address ?? {};
    expect('addressLocality', addr.addressLocality, 'Ibitinga');
    expect('addressRegion', addr.addressRegion, 'SP');
    expect('addressCountry', addr.addressCountry, 'BR');
    if ('streetAddress' in addr) fails.push('streetAddress presente');
    if (!Array.isArray(ld.areaServed) || ld.areaServed.length !== 6) {
      fails.push('areaServed deve ter 6 itens');
    } else if (!ld.areaServed.every((a) => a?.['@type'] === 'City')) {
      fails.push('areaServed com item que nao e City');
    }
    const same = Array.isArray(ld.sameAs) ? ld.sameAs : [];
    for (const url of [
      'https://www.instagram.com/agenciadmarques/',
      'https://share.google/5cU7xCYeXu5uWD9Yq',
    ]) {
      if (!same.includes(url)) fails.push(`sameAs sem ${url}`);
    }
    expect('founder', ld.founder, { '@type': 'Person', name: 'Felipe Salles' });
    if (!Array.isArray(ld.openingHoursSpecification) || ld.openingHoursSpecification.length !== 2) {
      fails.push('openingHoursSpecification deve ter 2 itens');
    }
    if ('priceRange' in ld) fails.push('priceRange presente');
    for (const key of ['logo', 'image']) {
      const value = typeof ld[key] === 'object' && ld[key] !== null ? ld[key].url : ld[key];
      if (typeof value !== 'string' || !value.startsWith(`${ORIGIN}/`)) {
        fails.push(`${key}: ${JSON.stringify(value)}`);
        continue;
      }
      const file = staticFile(new URL(value).pathname);
      if (!existsSync(file)) fails.push(`${key}: arquivo ${new URL(value).pathname} ausente`);
    }
    return fails;
  },

  nap() {
    const miss = needBuild() ?? needPage('/');
    if (miss) return miss;
    const ld = parseLd(readPage('/'));
    if (!ld) return ['JSON-LD da home ausente ou invalido'];
    const fails = [];
    const ldDigits = String(ld.telephone ?? '').replace(/\D/g, '');
    for (const route of ['/', '/404', '/obrigado']) {
      const pageMiss = needPage(route);
      if (pageMiss) {
        fails.push(...pageMiss);
        continue;
      }
      const html = readPage(route);
      const footer = footerOf(html);
      if (!footer) {
        fails.push(`${route}: footer ausente`);
        continue;
      }
      const text = textOf(footer);
      const phone = /\((\d{2})\)\s*(\d{5})-(\d{4})/.exec(text);
      if (!phone) fails.push(`${route}: telefone no rodape fora do formato (DD) DDDDD-DDDD`);
      else if (`55${phone[1]}${phone[2]}${phone[3]}` !== ldDigits) {
        fails.push(`${route}: telefone do rodape difere do JSON-LD`);
      }
      if (!footer.includes(`mailto:${ld.email}`)) fails.push(`${route}: mailto ausente`);
      if (!text.includes(ld.email)) fails.push(`${route}: texto do e-mail ausente`);
      const copy = /<p\b[^>]*class="[^"]*foot-copy[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(footer);
      const copyText = copy ? textOf(copy[1]) : '';
      if (!copy) fails.push(`${route}: foot-copy ausente`);
      else if (
        !new RegExp(`^© \\d{4} ${ld.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(copyText)
      ) {
        fails.push(`${route}: foot-copy "${copyText}" nao casa com o nome do JSON-LD`);
      }
      if (route === '/') {
        const place = `${ld.address?.addressLocality} · ${ld.address?.addressRegion}`;
        if (!text.includes(place)) fails.push(`${route}: rodape sem "${place}"`);
      }
    }
    return fails;
  },

  marca() {
    const miss = needBuild();
    if (miss) return miss;
    const fails = [];
    for (const file of walk(STATIC_DIR, ['.html'])) {
      if (decode(read(file)).includes('Soluções Web')) fails.push(rel(file));
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
let pass = 0;
let fail = 0;
for (const name of names) {
  if (!checks[name]) {
    console.log(`FAIL ${name}: verificacao desconhecida`);
    fail++;
    continue;
  }
  const failures = await checks[name]();
  if (failures.length === 0) {
    console.log(`PASS ${name}`);
    pass++;
  } else {
    console.log(`FAIL ${name}: ${failures.join(' | ')}`);
    fail++;
  }
}
console.log(`RESUMO: ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
