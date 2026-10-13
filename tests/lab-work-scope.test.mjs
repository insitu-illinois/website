import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const read=c=>readdirSync(`src/content/${c}`).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(`src/content/${c}/${f}`,'utf8')));
const core=new Set(['sepehr-vaez-afshar','laura-shackelford','ogulcan-durmaz','brian-graves','sarvin-eshaghi']);
test('published work belongs to the five approved core people; joint authors remain intact',()=>{
 const projects=new Set(read('projects').filter(d=>!d.draft&&d.team?.some(p=>core.has(p))).map(d=>d.slug));
 for(const [c,field] of Object.entries({projects:'team',publications:'labAuthors',news:'people',recognition:'recipients',presentations:'presenters'})){
  for(const d of read(c).filter(d=>!d.draft))assert.ok(d[field]?.some(p=>core.has(p))||(c==='news'&&projects.has(d.relatedProject)),`${c}/${d.slug} is outside the approved scope`);
 }
 const joint=read('publications').find(d=>d.slug==='tam-pa-ling-environment-2024');
 assert.ok(joint.labAuthors.includes('alexandra-zachwieja'));
 assert.match(joint.authors,/Zachwieja/);
});
test('Lily remains listed as an undergraduate with her confirmed degree program',()=>{
 const lily=read('people').find(d=>d.slug==='lily-meyer');assert.equal(lily.role,'undergrad');assert.equal(lily.draft,false);assert.match(lily.affiliations,/Computer Science \+ Education/);
});
