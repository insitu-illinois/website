import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

test('every editor field, including nested images and page text, has useful help',()=>{
  const config=parse(readFileSync('public/admin/config.yml','utf8'));
  function check(fields) {
    for(const field of fields) {
      assert.ok(typeof field.hint==='string' && field.hint.length>15,field.name);
      if(field.fields) check(field.fields);
    }
  }
  for(const collection of config.collections) {
    if(collection.fields) check(collection.fields);
    for(const file of collection.files ?? []) check(file.fields);
  }
  const publications=config.collections.find(c=>c.name==='publications');
  assert.ok(publications.fields.find(f=>f.name==='authors'));
  assert.ok(publications.fields.find(f=>f.name==='labAuthors'));
});
test('the editor dependency uses a fixed full version',()=>{
  const html=readFileSync('public/admin/index.html','utf8');
  assert.match(html,/https:\/\/unpkg\.com\/@sveltia\/cms@\d+\.\d+\.\d+\/dist\/sveltia-cms\.js/);
});
