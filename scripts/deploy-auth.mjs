import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import astroConfig from '../astro.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, '.cloudflare-lab');
mkdirSync(directory, { recursive: true, mode: 0o700 });
const configPath = resolve(directory, 'auth-worker.json');
writeFileSync(configPath, JSON.stringify({
  name: 'insitu-cms-auth',
  account_id: '8ff08acf55c2976a352f2dcc15b7612f',
  main: resolve(root, 'infra/cms-auth/index.js'),
  compatibility_date: '2023-03-24',
  workers_dev: true,
  keep_vars: true,
  vars: { ALLOWED_DOMAINS: new URL(astroConfig.site).hostname },
}, null, 2));
const result = spawnSync(process.execPath, [resolve(root, 'scripts/deploy-lab.mjs'), configPath], {
  cwd: root, env: process.env, stdio: 'inherit',
});
process.exit(result.status ?? 1);
