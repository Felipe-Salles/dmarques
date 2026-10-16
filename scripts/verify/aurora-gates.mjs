import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  const fallback = join(ROOT, 'dist');
  if (existsSync(fallback)) return fallback;
  return null;
}

const STATIC_DIR = resolveStaticDir();

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

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function read(file) {
  return readFileSync(file, 'utf8');
}

const ROUTES = {
  '/': ['index.html'],
  '/404': ['404.html'],
  '/obrigado': ['obrigado/index.html', 'obrigado.html'],
};

function readPage(route) {
  if (!STATIC_DIR) return null;
  for (const candidate of ROUTES[route]) {
    const file = join(STATIC_DIR, candidate);
    if (existsSync(file)) return read(file);
  }
  return null;
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function collapse(text) {
  return text.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function sectionById(html, id) {
  const open = new RegExp(`<section\\b[^>]*\\sid="${id}"[^>]*>`, 'i').exec(html);
  if (!open) return null;
  let depth = 1;
  const tag = /<(\/?)section\b[^>]*>/gi;
  tag.lastIndex = open.index + open[0].length;
  let m = tag.exec(html);
  while (m) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(open.index, m.index + m[0].length);
    m = tag.exec(html);
  }
  return html.slice(open.index);
}

function needBuild() {
  return STATIC_DIR ? null : ['build ausente'];
}

function needPage(route) {
  const html = readPage(route);
  return html === null ? [`pagina ${route} ausente (build ausente?)`] : null;
}

const checks = {
  palette() {
    const re =
      /6c4cff|108,\s*76,\s*255|--color-accent|--color-light|--nav-height|--space-gutter|--font-(body|text|heading)|outfit|dm sans|cursor-glow|hero-glow/i;
    const exts = ['.astro', '.ts', '.mjs', '.js', '.css', '.md', '.yaml', '.svg', '.json'];
    const fails = [];
    for (const file of [...walk(SRC, exts), ...walk(join(ROOT, 'public'), exts)]) {
      const lines = read(file).split('\n');
      lines.forEach((text, i) => {
        if (re.test(text)) fails.push(`${rel(file)}:${i + 1}`);
      });
    }
    return fails;
  },

  removed() {
    const targets = [
      'src/components/FaqSection.astro',
      'src/components/DifferentiatorsSection.astro',
      'src/components/CtaFinal.astro',
      'src/scripts/glow.ts',
      'src/scripts/particles.ts',
      'src/scripts/particles.pure.ts',
      'src/scripts/particles.pure.test.mjs',
      'src/content/faq',
      'src/assets/hero-render-placeholder.webp',
    ];
    const fails = targets.filter((t) => existsSync(join(ROOT, t))).map((t) => `existe: ${t}`);
    for (const file of walk(SRC, ['.astro', '.ts', '.mjs', '.js'])) {
      if (read(file).includes('getFaq')) fails.push(`getFaq em ${rel(file)}`);
    }
    return fails;
  },

  fonts() {
    const missing = needBuild();
    if (missing) return missing;
    const fails = [];
    for (const file of walk(STATIC_DIR, ['.html', '.css', '.js'])) {
      const text = read(file);
      if (/fonts\.googleapis|fonts\.gstatic/.test(text)) fails.push(`CDN de fontes em ${rel(file)}`);
    }
    const html = readPage('/');
    if (html === null) return [...fails, 'index.html ausente'];
    for (const family of ['Sora', 'Inter Tight', 'JetBrains Mono']) {
      if (!html.includes(family)) fails.push(`index.html sem ${family}`);
    }
    const preloads = (html.match(/<link\b[^>]*>/gi) || []).filter(
      (tag) => /rel="preload"/i.test(tag) && /as="font"/i.test(tag),
    );
    if (preloads.length !== 2) fails.push(`preload de fonte: ${preloads.length} (esperado 2)`);
    return fails;
  },

  structure() {
    const missing = needBuild() || needPage('/');
    if (missing) return missing;
    const html = readPage('/');
    const ids = [];
    const re = /<section\b[^>]*\sid="([^"]+)"/gi;
    let m = re.exec(html);
    while (m) {
      ids.push(m[1]);
      m = re.exec(html);
    }
    const fails = [];
    const order = ['servicos', 'projetos', 'processo', 'sobre', 'contato'];
    let cursor = -1;
    for (const id of order) {
      const at = ids.indexOf(id, cursor + 1);
      if (at === -1) fails.push(`secao ausente ou fora de ordem: ${id} (ids: ${ids.join(',')})`);
      else cursor = at;
    }
    for (const banned of ['id="faq"', 'id="diferenciais"', 'cta-final']) {
      if (html.includes(banned)) fails.push(`presente: ${banned}`);
    }
    return fails;
  },

  jargon() {
    const missing = needBuild() || needPage('/');
    if (missing) return missing;
    const text = visibleText(readPage('/'));
    const found = text.match(/\b(LCP|TBT|CLS|CSP)\b/g);
    return found ? [`jargao tecnico visivel: ${[...new Set(found)].join(', ')}`] : [];
  },

  cta() {
    const missing = needBuild() || needPage('/');
    if (missing) return missing;
    const html = readPage('/');
    const fails = [];
    const re = /<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let m = re.exec(html);
    while (m) {
      const text = collapse(m[2].replace(/<[^>]+>/g, ' '));
      if (/or[cç]amento/i.test(text) && text !== 'Pedir orçamento' && text !== 'Enviar pedido de orçamento') {
        fails.push(`CTA divergente: "${text}"`);
      }
      m = re.exec(html);
    }
    return fails;
  },

  form() {
    const missing = needBuild() || needPage('/');
    if (missing) return missing;
    const html = readPage('/');
    const fails = [];
    const inputs = html.match(/<input\b[^>]*>/gi) || [];
    const radios = inputs.filter(
      (tag) => /type="radio"/i.test(tag) && /name="tipo-projeto"/i.test(tag),
    );
    if (radios.length < 5) fails.push(`radios tipo-projeto: ${radios.length} (esperado >= 5)`);
    if (radios.some((tag) => /\srequired\b/i.test(tag))) fails.push('radio com required');
    for (const name of ['nome', 'whatsapp', 'email', 'mensagem']) {
      if (!new RegExp(`<(input|textarea)\\b[^>]*name="${name}"`, 'i').test(html)) {
        fails.push(`campo ausente: ${name}`);
      }
    }
    const formTag = html.match(/<form\b[^>]*id="form-orcamento"[^>]*>/i)?.[0] ?? '';
    if (!formTag) fails.push('form-orcamento ausente');
    else if (!/\smethod="post"/i.test(formTag)) fails.push('form sem method="post"');
    if (!/\saria-live=/i.test(html)) fails.push('sem aria-live');
    if (/<select/i.test(html)) fails.push('contem select');
    return fails;
  },

  aurora() {
    const missing = needBuild();
    if (missing) return missing;
    const fails = [];
    for (const file of walk(STATIC_DIR, ['.css'])) {
      const text = read(file);
      const rule = /([^{}]+)\{([^{}]*)\}/g;
      let m = rule.exec(text);
      while (m) {
        if (m[1].includes('.aurora') && /(?<![-\w])filter\s*:\s*blur/i.test(m[2])) {
          fails.push(`filter:blur em ${rel(file)} (${collapse(m[1]).slice(0, 60)})`);
        }
        m = rule.exec(text);
      }
    }
    return fails;
  },

  contact() {
    const missing = needBuild() || needPage('/');
    if (missing) return missing;
    const html = readPage('/');
    const fails = [];
    const section = sectionById(html, 'contato');
    if (!section) return ['section#contato ausente'];
    for (const needle of [
      'contato@agenciadmarques.com.br',
      'wa.me/5516996111785',
      'instagram.com/agenciadmarques',
    ]) {
      if (!section.includes(needle)) fails.push(`contato sem ${needle}`);
    }
    const footer = /<footer\b[\s\S]*?<\/footer>/i.exec(html);
    if (!footer) {
      fails.push('footer ausente');
    } else if (footer[0].includes('instagram.com/agenciadmarques')) {
      fails.push('footer contem instagram.com/agenciadmarques');
    }
    if (/hotmail/i.test(html)) fails.push('index.html contem hotmail');
    return fails;
  },

  lockup() {
    const missing = needBuild();
    if (missing) return missing;
    const fails = [];
    for (const route of ['/', '/404']) {
      const html = readPage(route);
      if (html === null) {
        fails.push(`pagina ${route} ausente`);
        continue;
      }
      for (const name of ['logotipo', 'simbolo']) {
        const count = (html.match(new RegExp(`<img\\b[^>]*src="[^"]*${name}`, 'gi')) || []).length;
        if (count < 2) fails.push(`${route}: ${name} em ${count} img (esperado >= 2)`);
      }
    }
    return fails;
  },

  secondary() {
    const missing = needBuild();
    if (missing) return missing;
    const fails = [];
    for (const route of ['/404', '/obrigado']) {
      const html = readPage(route);
      if (html === null) {
        fails.push(`pagina ${route} ausente`);
        continue;
      }
      if (!/<header\b/i.test(html)) fails.push(`${route}: sem header`);
      if (!/<footer\b/i.test(html)) fails.push(`${route}: sem footer`);
      if (!/aurora/.test(html)) fails.push(`${route}: sem aurora`);
      if (/\sdata-r=/.test(html)) fails.push(`${route}: contem data-r`);
    }
    return fails;
  },

  blank() {
    const missing = needBuild();
    if (missing) return missing;
    const fails = [];
    for (const file of walk(STATIC_DIR, ['.html'])) {
      const tags = read(file).match(/<a\b[^>]*>/gi) || [];
      for (const tag of tags) {
        if (/target="_blank"/i.test(tag) && !/rel="[^"]*noopener/i.test(tag)) {
          fails.push(`${rel(file)}: ${tag.slice(0, 80)}`);
        }
      }
    }
    return fails;
  },

  tokens() {
    const defined = new Set();
    const declRe = /(--[\w-]+)\s*:/g;
    const addDecls = (text) => {
      let m = declRe.exec(text);
      while (m) {
        defined.add(m[1]);
        m = declRe.exec(text);
      }
      declRe.lastIndex = 0;
    };
    const stripCssComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const srcFiles = walk(SRC, ['.astro', '.css', '.ts']);
    for (const file of srcFiles) {
      const ext = extname(file);
      const text = stripCssComments(read(file));
      if (ext === '.css') addDecls(text);
      else if (ext === '.astro') {
        const blocks = text.match(/<style\b[\s\S]*?<\/style>/gi) || [];
        for (const block of blocks) addDecls(block);
      }
    }
    for (const file of walk(join(SRC, 'scripts'), ['.ts'])) {
      const re = /setProperty\(\s*['"`](--[\w-]+)/g;
      const text = read(file);
      let m = re.exec(text);
      while (m) {
        defined.add(m[1]);
        m = re.exec(text);
      }
    }
    const configPath = join(ROOT, 'astro.config.mjs');
    if (existsSync(configPath)) {
      const re = /cssVariable:\s*['"](--[\w-]+)['"]/g;
      const text = read(configPath);
      let m = re.exec(text);
      while (m) {
        defined.add(m[1]);
        m = re.exec(text);
      }
    }
    const fails = [];
    for (const file of srcFiles) {
      const text = stripCssComments(read(file));
      const use = /var\(\s*(--[\w-]+)\s*([,)])/g;
      let m = use.exec(text);
      while (m) {
        if (m[2] !== ',' && !defined.has(m[1])) {
          fails.push(`${rel(file)}:${lineOf(text, m.index)}:${m[1]}`);
        }
        m = use.exec(text);
      }
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
  const failures = checks[name]();
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
