import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const support = JSON.parse(readFileSync('src/content/pages/support.json', 'utf8'));

test('Support & connections content is editable data with safe links', () => {
  assert.ok(support.title.trim());
  assert.ok(support.researchSupport.every(name => typeof name === 'string' && name.trim()));
  for (const partner of support.atIllinois) {
    assert.ok(partner.name.trim());
    assert.match(partner.url ?? '', /^(https?:\/\/\S+)?$/);
  }
});

test('the CMS offers the Support & connections page', () => {
  const config = readFileSync('public/admin/config.yml', 'utf8');
  assert.match(config, /file: src\/content\/pages\/support\.json/);
});
