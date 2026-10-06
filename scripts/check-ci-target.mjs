import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// CI uses a per-Worker lab token, while local releases use the isolated OAuth login.
const account = '8ff08acf55c2976a352f2dcc15b7612f';
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
assert.equal(config.account_id, account, 'Configuration must target the lab account.');
assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, account, 'CI must target the lab account.');
assert.equal(config.name, 'insitu-illinois', 'CI must deploy the existing site Worker.');
assert.equal(config.assets?.directory, './dist', 'Only built assets may be published.');
console.log('Verified the lab account, site Worker, and built assets directory.');
