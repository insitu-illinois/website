import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRaw, validate } from '../scripts/validate-content.mjs';
import { visible, personLists, projectLists, themeLists, relatedPapers, homeLists, grouped, orders, referenced, peopleGroups, recordPeople, personThemes, newest } from '../src/lib/derived.mjs';
const raw=loadRaw();
const data=visible(raw);
const entry=(id,data)=>({id,data});

test('all seed records validate; drafts are visible only in development',()=>{
  assert.doesNotThrow(()=>validate(raw));
  assert.equal(data.people.length,raw.people.filter(r=>!r.data.draft).length);
  assert.equal(visible(raw,true).people.length,raw.people.length);
  assert.ok(!Object.values(data).flat().some(r=>r.data.draft));
  assert.equal(data.publications.length,raw.publications.filter(r=>!r.data.draft).length);
});
test('an entry saved by the CMS may leave optional relationships blank',()=>{
  const fixture=structuredClone(raw);
  fixture.news.push({id:'cms-empty-relations',collection:'news',data:{slug:'cms-empty-relations',draft:true,title:'CMS test',type:'lab-life',relatedPublication:'',relatedProject:'',image:null}});
  assert.doesNotThrow(()=>validate(fixture));
  fixture.news.at(-1).data.relatedProject='missing-project';
  assert.throws(()=>validate(fixture), /Unknown projects reference/);
});
test('all person lists use references, never citation string matching',()=>{
  const fixture={...data,
    publications:[entry('yes',{labAuthors:[{id:'person'}],authors:'External author',year:2020}),entry('no',{labAuthors:[],authors:'person',year:2021})],
    presentations:[entry('talk',{presenters:['person'],date:'2020'})],
    recognition:[entry('grant',{recipients:['person'],year:2017})],
    projects:[entry('project',{team:['person'],name:'Project'})],
  };
  assert.deepEqual(Object.fromEntries(Object.entries(personLists(fixture,'person')).map(([k,v])=>[k,v.map(r=>r.id)])),{publications:['yes'],presentations:['talk'],recognition:['grant'],projects:['project'],news:[]});

});
test('project lists match the project reference',()=>{
  const fixture={...data,publications:[entry('yes',{title:'Yes',project:'project'}),entry('no',{title:'No',project:'other'})],presentations:[entry('talk',{title:'Talk',project:{id:'project'}})]};
  assert.deepEqual(projectLists(fixture,'project').publications.map(r=>r.id),['yes']);
  assert.deepEqual(projectLists(fixture,'project').presentations.map(r=>r.id),['talk']);
  assert.equal(projectLists(fixture,'empty').publications.length,0);
});
test('theme people are a deduplicated union of projects, papers, and talks',()=>{
  const fixture={...data,people:['brian-graves','laura-shackelford','ogulcan-durmaz'].map(id=>entry(id,{name:id})),projects:[entry('p',{name:'P',themes:['accessibility'],team:['brian-graves']})],publications:[entry('q',{title:'Q',themes:['accessibility'],labAuthors:['laura-shackelford'],year:2020})],presentations:[entry('r',{title:'R',themes:['accessibility'],presenters:['ogulcan-durmaz','laura-shackelford'],date:'2020'})]};
  const result=themeLists(fixture,'accessibility');
  assert.deepEqual(new Set(result.people.map(r=>r.id)),new Set(['brian-graves','laura-shackelford','ogulcan-durmaz']));
  assert.equal(result.otherThemes.length,data.themes.filter(t=>t.id!=='accessibility').length);assert.ok(result.otherThemes.every(r=>r.id!=='accessibility'));
  assert.equal(result.projects.length,1);assert.equal(result.publications.length,1);assert.equal(result.presentations.length,1);
});
test('related papers exclude themselves and cap shared-theme matches at three',()=>{
  const publications=Array.from({length:6},(_,i)=>entry(String(i),{title:String(i),themes:i===5?['other']:['same'],year:2000+i}));
  assert.deepEqual(relatedPapers({...data,publications},publications[0]).map(r=>r.id),['4','3','2']);
});
test('home lists sort newest first and cap results at three; featured flag is required',()=>{
  const result=homeLists({...data,publications:[entry('new',{title:'New',year:2020}),entry('old',{title:'Old',year:2019})],projects:Array.from({length:6},(_,i)=>entry(String(i),{name:String(i),featured:i<4})),news:Array.from({length:6},(_,i)=>entry(String(i),{title:String(i),date:`202${i}`}))});
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
  const people=visible({people:[...data.people,entry('unapproved-person',{draft:true})]}).people;
  assert.equal(referenced(people,['unapproved-person']).length,0);
  assert.equal(referenced([entry('approved',{draft:false})],['approved']).length,1);
});
test('images without alt text, invalid calendar dates, and mismatched slugs fail validation',()=>{
  for(const change of [d=>d.people[0].data.photo={src:'/media/photo.jpg',alt:''},d=>d.news[0].data.date='2025-02-30',d=>d.people[0].data.slug='wrong']){
    const broken=structuredClone(raw);change(broken);assert.throws(()=>validate(broken));
  }
});

import { hasPersonPage, entryUrl } from '../src/lib/format.mjs';
import { crawlerPolicy } from '../src/config/site.mjs';
test('roles automatically choose the three People sections',()=>{
  const people=[entry('director',{name:'Director',role:'director'}),entry('member',{name:'Member',role:'member'}),entry('collaborator',{name:'Collaborator',role:'collaborator'}),entry('alumnus',{name:'Alumnus',role:'alumni'})];
  const groups=peopleGroups(people);
  assert.deepEqual(groups.map(g=>g.title),['Current members','Collaborators','Alumni']);
  assert.deepEqual(groups.map(g=>g.items.length),[2,1,1]);
  const changed=structuredClone(people);
  changed.find(p=>p.id==='member').data.role='alumni';
  assert.deepEqual(peopleGroups(changed).map(g=>g.items.length),[1,1,2]);
});
test('only people with a nonblank biography get profile links',()=>{
  const person={collection:'people',id:'person',data:{bio:'  '}};
  assert.equal(hasPersonPage(person),false);assert.equal(entryUrl(person),undefined);
  person.data.bio='Approved biography';
  assert.equal(hasPersonPage(person),true);assert.equal(entryUrl(person),'/people/person/');
});
test('the launch switch controls both crawler-policy states',()=>{
  const site=new URL('https://example.org');
  assert.equal(crawlerPolicy(false,site),'User-agent: *\nDisallow: /\n');
  assert.equal(crawlerPolicy(true,site),'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.org/sitemap.xml\n');
});

import { mapUrl } from '../src/lib/location.mjs';
test('news tags connect people, themes, and projects without matching body text',()=>{
 const news=[entry('tagged',{title:'Tagged',people:['laura-shackelford'],themes:['situated-learning'],relatedProject:'vrchaeology'}),entry('text-only',{title:'Laura Shackelford',people:[],themes:[]})];
 const fixture={...data,news};
 assert.deepEqual(personLists(fixture,'laura-shackelford').news.map(r=>r.id),['tagged']);
 assert.deepEqual(themeLists(fixture,'situated-learning').news.map(r=>r.id),['tagged']);
 assert.deepEqual(projectLists(fixture,'vrchaeology').news.map(r=>r.id),['tagged']);
 assert.deepEqual(recordPeople(fixture,{...news[0],collection:'news'}).map(r=>r.id),['laura-shackelford']);
});
test('direct interests and work themes merge without duplicates, excluding draft work',()=>{
 const fixture=visible({...data,projects:[entry('hidden',{draft:true,name:'Hidden',themes:['accessibility'],team:['sarvin-eshaghi']})]});
 const person=entry('sarvin-eshaghi',{name:'Sarvin',themes:['heritage-public-space','heritage-public-space']});
 assert.deepEqual(personThemes(fixture,person).map(r=>r.id),['heritage-public-space']);
 assert.ok(themeLists({...fixture,people:[person]},'heritage-public-space').people.some(r=>r.id===person.id));
});
test('publication dates sort within a year and blank dates fall back to the year',()=>{
 assert.deepEqual(newest([entry('year',{title:'Year',year:2025,publicationDate:''}),entry('early',{title:'Early',year:2026,publicationDate:'2026-01-01'}),entry('late',{title:'Late',year:2026,publicationDate:'2026-04-10'})]).map(r=>r.id),['late','early','year']);
});
test('only Google-provided map embed URLs are accepted',()=>{
 assert.equal(mapUrl(''), '');
 assert.ok(mapUrl('https://www.google.com/maps/embed?pb=verified').startsWith('https://www.google.com/maps/embed?'));
 for(const url of ['javascript:alert(1)','https://evil.example/maps/embed?pb=a','https://www.google.com/maps?pb=a','https://user:password@www.google.com/maps/embed?pb=a']) assert.throws(()=>mapUrl(url));
});
