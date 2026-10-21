import { defineConfig } from 'astro/config';

export default defineConfig({
  // The only site-origin setting. Change here when a custom domain is attached.
  site: 'https://insituillinois.com',
  output: 'static',
  trailingSlash: 'always',
});
