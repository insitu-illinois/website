// After the build, allow exactly the site's own inline scripts in the Content-Security-Policy.
// Every executable inline <script> in dist/ is hashed (SHA-256) and listed in script-src in dist/_headers,
// replacing 'unsafe-inline'. Data blocks such as JSON-LD are not executed and need no hash.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = process.argv[2] ?? 'dist';
const html = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === 'admin' ? [] : html(join(dir, e.name))) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
const executable = attrs => { const type = attrs.match(/\stype=["']?([^"'\s>]+)/i)?.[1]?.toLowerCase(); return !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript'; };

export function inlineScriptHashes(files) {
  const hashes = new Set();
  for (const file of files) {
    const page = readFileSync(file, 'utf8');
    if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(page.replace(/<script[\s\S]*?<\/script>/gi, ''))) throw new Error(`${file} has an inline event handler; move it into a script.`);
    for (const [, attrs, body] of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\ssrc=/i.test(attrs) || !executable(attrs)) continue;
      hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

export function withScriptHashes(headers, hashes) {
  const marker = "script-src 'self' 'unsafe-inline'";
  if (!headers.includes(marker)) throw new Error(`_headers no longer contains "${marker}"; update scripts/csp-hashes.mjs.`);
  return headers.replace(marker, ["script-src 'self'", ...hashes].join(' '));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hashes = inlineScriptHashes(html(dist));
  const file = join(dist, '_headers');
  writeFileSync(file, withScriptHashes(readFileSync(file, 'utf8'), hashes));
  console.log(`CSP: allowed ${hashes.length} inline scripts by hash.`);
}
