import { defineConfig } from 'astro/config';

export default defineConfig({
  // The only site-origin setting. Replace after Cloudflare assigns the account subdomain.
  site: 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
});
