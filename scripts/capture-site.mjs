import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { STATIC_DIR, launchBrowser, startStaticServer } from './verify/static-server.mjs';

const OUT = join(process.cwd(), 'src', 'content', 'cases', 'dmarques-capture.webp');
const TMP = join(tmpdir(), `dmarques-capture-${process.pid}.png`);
const WIDTH = Number(process.env.CAPTURE_WIDTH || 1000);
const QUALITY = Number(process.env.CAPTURE_QUALITY || 80);

if (!existsSync(STATIC_DIR)) {
  console.error('build ausente: rode pnpm build antes');
  process.exit(1);
}

const { base, close } = await startStaticServer();
let browser;
try {
  browser = await launchBrowser();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '#projetos, .wa-float { display: none !important }' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: TMP, fullPage: true });
  const meta = await sharp(TMP).metadata();
  const info = await sharp(TMP).resize({ width: WIDTH }).webp({ quality: QUALITY }).toFile(OUT);
  console.log(`fonte ${meta.width}x${meta.height}`);
  console.log(`saida ${info.width}x${info.height} ${info.size} bytes`);
} finally {
  if (browser) await browser.close();
  close();
  await rm(TMP, { force: true });
}
