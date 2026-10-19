import { createHash } from 'node:crypto';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { JS_READY } from './src/lib/js-ready.ts';

const jsReadyHash = `sha256-${createHash('sha256').update(JS_READY).digest('base64')}`;

export default defineConfig({
  site: 'https://agenciadmarques.com.br',
  output: 'static',
  adapter: vercel({ staticHeaders: true }),
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !pathname.startsWith('/obrigado') && !pathname.startsWith('/erro-envio');
      },
    }),
  ],
  build: {
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
  security: {
    csp: {
      scriptDirective: { hashes: [jsReadyHash] },
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-src 'none'",
        "worker-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ],
    },
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      RATE_LIMIT_SALT: envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KV_REST_API_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      KV_REST_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Sora',
      cssVariable: '--font-display',
      weights: [600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter Tight',
      cssVariable: '--font-sans',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
      optimizedFallbacks: true,
      display: 'swap',
    },
  ],
});
