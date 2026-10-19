import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import {
  collectCsp,
  DEFAULT_CSP_MODE,
  headerNameFor,
  reshapeRoutes,
} from '../src/lib/finalize-headers.pure.mjs';

const ROOT = process.cwd();
const CONFIG = join(ROOT, '.vercel', 'output', 'config.json');

try {
  if (!existsSync(CONFIG)) throw new Error('.vercel/output/config.json ausente');
  const mode = process.env.CSP_MODE || DEFAULT_CSP_MODE;
  const name = headerNameFor(mode);
  const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
  const before = config.routes.filter(
    (r) => Object.keys(r.headers ?? {}).join() === 'content-security-policy',
  ).length;
  collectCsp(config.routes);
  config.routes = reshapeRoutes(config.routes, mode);
  writeFileSync(CONFIG, JSON.stringify(config, null, 2));
  console.log(
    `finalize-headers: modo ${mode}, cabecalho ${name}, ${before} rotas CSP por pagina substituidas`,
  );
} catch (error) {
  console.log(`FAIL: ${error.message}`);
  process.exit(1);
}
