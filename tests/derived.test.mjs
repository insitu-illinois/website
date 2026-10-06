import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRaw, validate } from '../scripts/validate-content.mjs';
import { visible, personLists, projectLists, themeLists, relatedPapers, homeLists, grouped, orders, referenced } from '../src/lib/derived.mjs';
const raw=loadRaw();
const data=visible(raw);
const entry=(id,data)=>({id,data});

test('all seed records validate; drafts are visible only in development',()=>{
  assert.doesNotThrow(()=>validate(raw));
  assert.equal(data.people.length,5);
  assert.ok(visible(raw,true).people.some(r=>r.id==='lily-meyer'));
  assert.ok(!Object.values(data).flat().some(r=>r.data.draft));
  assert.equal(data.publications.length,3);
});
test('all four person lists use references, never citation string matching',()=>{
  const fixture={...data,
    publications:[entry('yes',{labAuthors:[{id:'person'}],authors:'External author',year:2020}),entry('no',{labAuthors:[],authors:'person',year:2021})],
    presentations:[entry('talk',{presenters:['person'],date:'2020'})],
    recognition:[entry('grant',{recipients:['person'],year:2017})],
    projects:[entry('project',{team:['person'],name:'Project'})],
  };
  assert.deepEqual(Object.fromEntries(Object.entries(personLists(fixture,'person')).map(([k,v])=>[k,v.map(r=>r.id)])),{publications:['yes'],presentations:['talk'],recognition:['grant'],projects:['project']});
  const laura=personLists(data,'laura-shackelford');
  assert.equal(laura.publications.length,3);assert.equal(laura.presentations.length,4);assert.equal(laura.recognition.length,2);
  assert.equal(personLists(data,'sepehr-vaez-afshar').projects[0].id,'xr-us-museums');
});
test('project lists match the project reference',()=>{
  assert.equal(projectLists(data,'vrchaeology').publications.length,3);
  assert.equal(projectLists(data,'vrchaeology').presentations.length,4);
  assert.equal(projectLists(data,'chi311').publications.length,0);
});
test('theme people are a deduplicated union of projects, papers, and talks',()=>{
  const fixture={...data,projects:[entry('p',{name:'P',themes:['accessibility'],team:['brian-graves']})],publications:[entry('q',{title:'Q',themes:['accessibility'],labAuthors:['laura-shackelford'],year:2020})],presentations:[entry('r',{title:'R',themes:['accessibility'],presenters:['ogulcan-durmaz','laura-shackelford'],date:'2020'})]};
  const result=themeLists(fixture,'accessibility');
  assert.deepEqual(new Set(result.people.map(r=>r.id)),new Set(['brian-graves','laura-shackelford','ogulcan-durmaz']));
  assert.equal(result.otherThemes.length,3);assert.ok(result.otherThemes.every(r=>r.id!=='accessibility'));
  assert.equal(result.projects.length,1);assert.equal(result.publications.length,1);assert.equal(result.presentations.length,1);
});
test('related papers exclude themselves and cap shared-theme matches at three',()=>{
  const publications=Array.from({length:6},(_,i)=>entry(String(i),{title:String(i),themes:i===5?['other']:['same'],year:2000+i}));
  assert.deepEqual(relatedPapers({...data,publications},publications[0]).map(r=>r.id),['4','3','2']);
});
test('home lists sort newest first and cap results at three; featured flag is required',()=>{
  const result=homeLists({...data,projects:Array.from({length:6},(_,i)=>entry(String(i),{name:String(i),featured:i<4})),news:Array.from({length:6},(_,i)=>entry(String(i),{title:String(i),date:`202${i}`}))});
  assert.equal(result.publications[0].data.year,2020);assert.equal(result.projects.length,3);
  assert.deepEqual(result.news.map(r=>r.id),['5','4','3']);
});
test('fixed groups include every enum in the required order, including scholarships',()=>{
  for(const name of Object.keys(orders)){
    const groups=grouped(data,name);assert.deepEqual(groups.map(g=>g.type),orders[name]);
    assert.equal(groups.reduce((n,g)=>n+g.items.length,0),data[name].length);
  }
});
test('references to draft records do not leak into published lists',()=>{
  assert.equal(referenced(data.people,['lily-meyer']).length,0);
  assert.equal(referenced(data.people,['laura-shackelford']).length,1);
});
test('images without alt text, invalid calendar dates, and mismatched slugs fail validation',()=>{
  for(const change of [d=>d.people[0].data.photo={src:'/media/photo.jpg',alt:''},d=>d.news[0].data.date='2025-02-30',d=>d.people[0].data.slug='wrong']){
    const broken=structuredClone(raw);change(broken);assert.throws(()=>validate(broken));
  }
});
