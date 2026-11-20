import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { inlineScriptHashes, withScriptHashes } from '../scripts/csp-hashes.mjs';

const page = html => { const dir = mkdtempSync(join(tmpdir(), 'csp-')); const file = join(dir, 'index.html'); writeFileSync(file, html); return file; };
const sha = text => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

test('inline scripts are hashed; external scripts and JSON-LD are not', () => {
  const file = page('<script>a()</script><script type="module">b()</script><script src="/x.js"></script><script type="application/ld+json">{}</script>');
  assert.deepEqual(inlineScriptHashes([file]), [sha('a()'), sha('b()')].sort());
});

test('inline event handlers are refused, since a hash cannot allow them', () => {
  assert.throws(() => inlineScriptHashes([page('<button onclick="x()">x</button>')]), /inline event handler/);
});

test('the hashes replace unsafe-inline in script-src only', () => {
  const headers = "Content-Security-Policy: script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
  assert.equal(withScriptHashes(headers, ["'sha256-x'"]), "Content-Security-Policy: script-src 'self' 'sha256-x'; style-src 'self' 'unsafe-inline'");
  assert.throws(() => withScriptHashes('script-src *', []));
});
