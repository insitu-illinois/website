import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRaw,validate} from '../scripts/validate-content.mjs';

test('project galleries require local files and meaningful alt text; credits require roles and names',()=>{
  const raw=loadRaw();
  assert.doesNotThrow(()=>validate(raw));
  for(const change of [
    d=>{d.gallery[0].alt=' ';},
    d=>{d.gallery[0].src='https://example.org/tracker.jpg';},
    d=>{d.gallery[0].src='/media/missing-image.webp';},
    d=>{d.credits[0].role=' ';},
    d=>{d.credits[0].names='';},
  ]) {
    const fixture=structuredClone(raw);
    change(fixture.projects.find(project=>project.id==='vrchaeology').data);
    assert.throws(()=>validate(fixture));
  }
  const optional=structuredClone(raw);
  const project=optional.projects.find(project=>project.id==='vrchaeology').data;
  project.gallery=null;project.credits=null;
  assert.doesNotThrow(()=>validate(optional));
});
