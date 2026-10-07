import test from 'node:test';
import assert from 'node:assert/strict';
import relay from '../infra/cms-auth/index.js';

const origin = 'https://auth.example.test';
const env = { ALLOWED_DOMAINS: 'site.example.test', GITHUB_CLIENT_ID: 'test-id', GITHUB_CLIENT_SECRET: 'test-only' };

test('OAuth relay rejects another site before authorization', async () => {
  const response = await relay.fetch(new Request(`${origin}/auth?provider=github&site_id=other.example.test`), env);
  assert.equal(response.headers.get('Location'), null);
  assert.match(await response.text(), /UNSUPPORTED_DOMAIN/);
});

test('OAuth relay requests public repository scope and sets a secure CSRF cookie', async () => {
  const response = await relay.fetch(new Request(`${origin}/auth?provider=github&site_id=site.example.test&scope=public_repo`), env);
  assert.equal(response.status, 302);
  const destination = new URL(response.headers.get('Location'));
  assert.equal(destination.hostname, 'github.com');
  assert.equal(destination.searchParams.get('scope'), 'public_repo');
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly.*SameSite=Lax; Secure/);
});

test('OAuth relay blocks callbacks with a mismatched CSRF state', async () => {
  const response = await relay.fetch(new Request(`${origin}/callback?code=test&state=wrong`, {
    headers: { Cookie: `csrf-token=github_${'a'.repeat(32)}` },
  }), env);
  assert.match(await response.text(), /CSRF_DETECTED/);
});

test('OAuth relay refuses login until the client credentials are configured', async () => {
  const response = await relay.fetch(new Request(`${origin}/auth?provider=github&site_id=site.example.test`), { ALLOWED_DOMAINS: env.ALLOWED_DOMAINS });
  assert.match(await response.text(), /MISCONFIGURED_CLIENT/);
});
