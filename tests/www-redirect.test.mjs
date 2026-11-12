import test from 'node:test';
import assert from 'node:assert/strict';
import { wwwRedirect } from '../worker/redirect.js';

test('www redirects permanently to the same path and query on the bare domain',()=>{
  const response=wwwRedirect(new Request('https://www.insituillinois.com/about/?tab=1'));
  assert.equal(response.status,301);
  assert.equal(response.headers.get('Location'),'https://insituillinois.com/about/?tab=1');
});
test('the bare domain and the workers.dev address are served, not redirected',()=>{
  assert.equal(wwwRedirect(new Request('https://insituillinois.com/about/')),null);
  assert.equal(wwwRedirect(new Request('https://insitu-illinois.insituillinois.workers.dev/')),null);
});
