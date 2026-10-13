import {test} from 'node:test';
import assert from 'node:assert/strict';
import {markdown} from '../src/lib/markdown.mjs';
test('CMS prose preserves headings and links but cannot execute HTML or embed tracking images',()=>{
  const html=markdown('# Heading\n\n**Research** [PDF](/media/paper.pdf)\n\n<script>alert(1)</script><img src="https://tracker.invalid/pixel" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');
  assert.match(html,/<h2>Heading<\/h2>/);assert.match(html,/<strong>Research<\/strong>/);assert.match(html,/href="\/media\/paper.pdf"/);
  assert.doesNotMatch(html,/script|onerror|<img|javascript:/);
});

test('person references link prose names without nesting links or altering code',()=>{
 const people=[{id:'brian-graves',data:{name:'Brian Graves',role:'phd',bio:'Researcher'}}];
 const result=markdown('Brian Graves and **Brian Graves**. [Brian Graves](https://example.com) and `Brian Graves`.',people);
 assert.match(result, /href="\/people\/brian-graves\/"/);
 assert.match(result, /<a href="https:\/\/example.com">Brian Graves<\/a>/);
 assert.match(result, /<code>Brian Graves<\/code>/);
 assert.ok(!result.includes('<a href="https://example.com"><a'));
});
