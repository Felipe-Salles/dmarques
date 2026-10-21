import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { headersFor, loadRules } from './headers.mjs';

const ROOT = process.cwd();

export function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  return join(ROOT, 'dist');
}

export const STATIC_DIR = resolveStaticDir();

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

function locate(pathname, base) {
  const root = resolve(base);
  const target = resolve(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return null;
  const candidates = [target, join(target, 'index.html'), `${target}.html`];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function stripUpgrade(value) {
  return String(value)
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && part !== 'upgrade-insecure-requests')
    .join('; ');
}

export function startStaticServer(root = STATIC_DIR, options = {}) {
  const configPath = join(root, '..', 'config.json');
  const withHeaders = options.withHeaders ?? existsSync(configPath);
  const rules = withHeaders
    ? loadRules({ configPath, vercelJsonPath: join(ROOT, 'vercel.json') })
    : [];
  return new Promise((resolveStart, rejectStart) => {
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
        file = locate(pathname, root);
      } catch {
        res.writeHead(400).end();
        return;
      }
      let status = 200;
      if (!file) {
        const notFound = join(resolve(root), '404.html');
        if (!existsSync(notFound)) {
          res.writeHead(404).end('not found');
          return;
        }
        file = notFound;
        status = 404;
      }
      const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
      const extra = headersFor(rules, pathname);
      for (const name of ['content-security-policy', 'content-security-policy-report-only']) {
        if (extra[name] !== undefined) extra[name] = stripUpgrade(extra[name]);
      }
      res.writeHead(status, { 'content-type': type, ...extra });
      res.end(readFileSync(file));
    });
    server.once('error', rejectStart);
    server.listen(0, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      resolveStart({ server, base: url, url, close: () => server.close() });
    });
  });
}

export async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch {
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      return await chromium.launch({ channel: 'msedge' });
    }
  }
}
