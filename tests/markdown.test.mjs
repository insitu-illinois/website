import {test} from 'node:test';
import assert from 'node:assert/strict';
import {markdown} from '../src/lib/markdown.mjs';
test('CMS prose preserves headings and links but cannot execute HTML or embed tracking images',()=>{
  const html=markdown('# Heading\n\n**Research** [PDF](/media/paper.pdf)\n\n<script>alert(1)</script><img src="https://tracker.invalid/pixel" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');
  assert.match(html,/<h2>Heading<\/h2>/);assert.match(html,/<strong>Research<\/strong>/);assert.match(html,/href="\/media\/paper.pdf"/);
  assert.doesNotMatch(html,/script|onerror|<img|javascript:/);
});
