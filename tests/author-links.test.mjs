import test from 'node:test';
import assert from 'node:assert/strict';
import {authorParts} from '../src/lib/author-links.mjs';
const laura={id:'laura-shackelford'};
test('author linking preserves citation spelling and order, including initials',()=>{
 for(const text of ['Laura Shackelford, Someone Else','Shackelford L, Huang WD','M. Author; L. Shackelford; Last Author']){
 const parts=authorParts(text,[laura]);assert.equal(parts.map(p=>p.text).join(''),text);assert.equal(parts.filter(p=>p.person).length,1);
 }
 assert.equal(authorParts('Laura Shackelfordson', [laura]).filter(p=>p.person).length,0);
 assert.equal(authorParts('Laura Shackelford', []).filter(p=>p.person).length,0);
});
