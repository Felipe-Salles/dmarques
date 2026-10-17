import { existsSync, readFileSync } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { STATIC_DIR, launchBrowser, startStaticServer } from './verify/static-server.mjs';

const OUT = join(process.cwd(), 'public', 'og-image.jpg');
const TMP = join(tmpdir(), `dmarques-og-${process.pid}.png`);
const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 300 * 1024;
const QUALITIES = [82, 76, 70, 64];
const INDEX = join(STATIC_DIR, 'index.html');

if (!existsSync(INDEX)) {
  console.error('build ausente: rode pnpm build antes');
  process.exit(1);
}

const html = readFileSync(INDEX, 'utf8');
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
const fontStyle = styleBlocks.find((css) => css.includes('@font-face'));
if (!fontStyle || !fontStyle.includes('--font-display')) {
  console.error('bloco de fontes ausente');
  process.exit(1);
}

const asDataUri = (file) =>
  `data:image/png;base64,${readFileSync(join(process.cwd(), 'src', 'assets', 'brand', file)).toString('base64')}`;

const template = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>${fontStyle}</style>
<style>
html, body { margin: 0; padding: 0; }
body {
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  overflow: hidden;
  position: relative;
  background: #070a14;
  font-family: var(--font-sans);
}
.aurora {
  position: absolute;
  inset: 0;
  opacity: 0.9;
  background:
    radial-gradient(34% 38% at 42% 46%, rgba(0,200,255,.42), rgba(0,200,255,.14) 45%, transparent 72%),
    radial-gradient(40% 46% at 62% 36%, rgba(58,91,255,.5), rgba(14,30,91,.32) 50%, transparent 74%),
    radial-gradient(26% 30% at 50% 60%, rgba(14,30,91,.85), transparent 72%);
}
.content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  text-align: center;
}
.lockup { display: flex; align-items: center; gap: 16px; }
.lockup img.s { height: 64px; width: auto; display: block; }
.lockup img.l { height: 46px; width: auto; display: block; }
h1 {
  margin: 0;
  max-width: 560px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 56px;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #f2f4f7;
  text-wrap: balance;
}
h1 span { color: #00c8ff; }
</style>
</head>
<body>
<div class="aurora"></div>
<div class="content">
  <div class="lockup">
    <img class="s" alt="" src="${asDataUri('simbolo.png')}">
    <img class="l" alt="" src="${asDataUri('logotipo.png')}">
  </div>
  <h1>Software sob medida, com <span>acabamento de produto.</span></h1>
</div>
</body>
</html>`;

const { base, close } = await startStaticServer();
let browser;
try {
  browser = await launchBrowser();
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('data:') || url.startsWith(`${base}/`)) return route.fallback();
    return route.abort();
  });
  await page.route(`${base}/__og.html`, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: template }),
  );
  await page.goto(`${base}/__og.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--font-display');
    const family = raw.split(',')[0].trim();
    return document.fonts.check(`600 56px ${family}`);
  });
  if (!loaded) {
    console.error('fonte Sora nao carregou');
    process.exit(1);
  }
  await page.screenshot({ path: TMP, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });

  let written = false;
  for (const quality of QUALITIES) {
    const buffer = await sharp(TMP).jpeg({ quality, mozjpeg: true }).toBuffer();
    if (buffer.length >= MAX_BYTES) continue;
    const meta = await sharp(buffer).metadata();
    if (meta.width !== WIDTH || meta.height !== HEIGHT || meta.format !== 'jpeg') {
      console.error('dimensoes ou formato invalidos');
      process.exit(1);
    }
    await writeFile(OUT, buffer);
    console.log(`saida ${WIDTH}x${HEIGHT} ${buffer.length} bytes q${quality}`);
    written = true;
    break;
  }
  if (!written) {
    console.error('imagem acima de 300 KB');
    process.exit(1);
  }
} finally {
  if (browser) await browser.close();
  close();
  await rm(TMP, { force: true });
}
