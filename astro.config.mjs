import vercel from '@astrojs/vercel';
import { defineConfig, envField, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://agenciadmarques.com.br',
  output: 'static',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'never',
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      RATE_LIMIT_SALT: envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
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
