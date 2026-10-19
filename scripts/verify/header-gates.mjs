import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { checkCsp, checkNonCspHeaders, headersFor, loadRules } from './headers.mjs';
import { STATIC_DIR } from './static-server.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const live = args.includes('--live');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const expectArg = args.find((a) => a.startsWith('--expect='));
const expect = expectArg ? expectArg.slice('--expect='.length) : 'none';

if (!['none', 'report-only', 'enforce'].includes(expect)) {
  console.log(`FAIL: valor invalido para --expect: ${expect}`);
  process.exit(2);
}

const SECURITY_HEADERS = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'content-security-policy',
  'content-security-policy-report-only',
];

const FIXED_PATHS = ['/', '/obrigado', '/obrigado/', '/nao-existe'];
const TAIL_PATHS = ['/og-image.jpg', '/api/orcamento'];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function offlineAsset() {
  const found = walk(join(STATIC_DIR, '_astro')).find((f) => f.endsWith('.js'));
  if (!found) return null;
  return `/${found
    .slice(STATIC_DIR.length + 1)
    .split('\\')
    .join('/')}`;
}

async function liveFetch(base, path) {
  const headers = bypass ? { 'x-vercel-protection-bypass': bypass } : {};
  const response = await fetch(base + path, { redirect: 'manual', headers });
  const out = {};
  response.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  const text = path === '/' ? await response.text() : '';
  await response.arrayBuffer().catch(() => null);
  return { status: response.status, headers: out, text };
}

async function collect(base) {
  const results = [];
  if (live) {
    const home = await liveFetch(base, '/');
    const match = /\/_astro\/[^"'\s>]+\.js/.exec(home.text);
    const paths = [...FIXED_PATHS, ...(match ? [match[0]] : []), ...TAIL_PATHS];
    for (const path of paths) {
      const res = path === '/' ? home : await liveFetch(base, path);
      const mitigated = res.headers['x-vercel-mitigated'] !== undefined;
      if (mitigated) {
        console.log(`AVISO: ${path} bloqueado pelo WAF; cabecalhos nao avaliados`);
      }
      results.push({ path, status: res.status, headers: res.headers, skip: mitigated });
    }
  } else {
    const configPath = join(STATIC_DIR, '..', 'config.json');
    if (!existsSync(STATIC_DIR) || !existsSync(configPath)) {
      throw new Error('build ausente');
    }
    const rules = loadRules({ configPath, vercelJsonPath: join(ROOT, 'vercel.json') });
    const asset = offlineAsset();
    const paths = [...FIXED_PATHS, ...(asset ? [asset] : []), ...TAIL_PATHS];
    for (const path of paths) {
      results.push({ path, status: 'offline', headers: headersFor(rules, path), skip: false });
    }
  }
  for (const r of results) {
    const present = SECURITY_HEADERS.filter((name) => r.headers[name] !== undefined);
    console.log(`INFO: ${r.path} ${r.status} ${present.join(',')}`);
  }
  return results;
}

function perPath(results, fn) {
  const failures = [];
  for (const r of results) {
    if (r.skip) continue;
    for (const failure of fn(r)) failures.push(`${r.path}: ${failure}`);
  }
  return failures;
}

const checks = {
  naoCsp: async ({ results }) => perPath(results, (r) => checkNonCspHeaders(r.headers)),
  csp: async ({ results }) => perPath(results, (r) => checkCsp(r.headers, expect)),
  poweredBy: async ({ results }) => {
    if (!live) return [];
    return perPath(results, (r) =>
      r.headers['x-powered-by'] !== undefined ? ['x-powered-by presente'] : [],
    );
  },
  status: async ({ results }) => {
    if (!live) return [];
    const failures = [];
    const expected = { '/': [200], '/nao-existe': [404], '/api/orcamento': [405] };
    for (const r of results) {
      const want = expected[r.path];
      if (!want) continue;
      if (r.skip && r.path === '/api/orcamento') continue;
      if (!want.includes(r.status)) {
        failures.push(`${r.path}: status ${r.status}, esperado ${want.join('/')}`);
      }
    }
    return failures;
  },
  artefatos: async () => {
    if (live) return [];
    const failures = [];
    const functionsDir = join(STATIC_DIR, '..', 'functions');
    const maps = [...walk(STATIC_DIR), ...walk(functionsDir)].filter((f) => f.endsWith('.map'));
    for (const m of maps) failures.push(`sourcemap encontrado: ${m}`);
    for (const file of walk(STATIC_DIR)) {
      if (/\.(js|css)$/.test(file) && readFileSync(file, 'utf8').includes('sourceMappingURL')) {
        failures.push(`sourceMappingURL em ${file}`);
      }
      if (
        file.endsWith('.html') &&
        /http-equiv=["']?content-security-policy/i.test(readFileSync(file, 'utf8'))
      ) {
        failures.push(`meta CSP em ${file}`);
      }
    }
    return failures;
  },
};

if (args.includes('--list')) {
  console.log(Object.keys(checks).join('\n'));
  process.exit(0);
}

let base = '';
if (live) {
  const preview = process.env.PREVIEW_URL;
  if (!preview) {
    console.log('FAIL: modo --live exige a variavel PREVIEW_URL');
    process.exit(2);
  }
  base = preview.replace(/\/+$/, '');
}

const only = args.find((a) => a.startsWith('--check='));
const names = only ? only.slice('--check='.length).split(',').filter(Boolean) : Object.keys(checks);

let pass = 0;
let fail = 0;
let results = [];
let collectError = null;
try {
  results = await collect(base);
} catch (error) {
  collectError = error.message.split('\n')[0];
}

for (const name of names) {
  if (!checks[name]) {
    console.log(`FAIL: ${name} verificacao desconhecida`);
    fail++;
    continue;
  }
  let failures;
  if (collectError && name !== 'artefatos') {
    failures = [`erro: ${collectError}`];
  } else {
    try {
      failures = await checks[name]({ results, base });
    } catch (error) {
      failures = [`erro: ${error.message.split('\n')[0]}`];
    }
  }
  if (failures.length === 0) {
    console.log(`PASS: ${name}`);
    pass++;
  } else {
    console.log(`FAIL: ${name} - ${failures.join(' | ')}`);
    fail++;
  }
}
console.log(`RESUMO: ${pass} PASS / ${fail} FAIL${live ? ' (live)' : ''}`);
process.exit(fail > 0 ? 1 : 0);
