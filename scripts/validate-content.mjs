import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { z } from 'zod';
import { models, fieldsFor, makeSchema } from '../src/lib/content-model.mjs';
export function loadRaw() {
  return Object.fromEntries(Object.keys(models).map(name => [name,readdirSync(`src/content/${name}`).filter(f=>f.endsWith('.json')).map(file => ({ id:file.replace(/\.json$/,''),collection:name,data:JSON.parse(readFileSync(`src/content/${name}/${file}`,'utf8')) }))]));
}
export function validate(data) {
  for (const [name, records] of Object.entries(data)) for (const record of records) {
    const reference = target => z.string().refine(id=>data[target].some(r=>r.id===id), `Unknown ${target} reference`);
    const parsed = makeSchema(z,reference,fieldsFor(name)).safeParse(record.data);
    if (!parsed.success) throw new Error(`${name}/${record.id}: ${parsed.error.message}`);
    if (record.data.slug !== record.id) throw new Error(`${name}/${record.id}: slug must match filename`);
    for (const [field,spec] of Object.entries(fieldsFor(name))) {
      const value=record.data[field];
      if (spec.kind==='image' && value && !existsSync(`public${value.src}`)) throw new Error(`${name}/${record.id}: missing image ${field}`);
      if (spec.kind==='gallery') for (const media of value??[]) if (!existsSync(`public${media.src}`)) throw new Error(`${name}/${record.id}: missing gallery image ${media.src}`);
      if (spec.kind==='file' && value && !existsSync(`public${value}`)) throw new Error(`${name}/${record.id}: missing file ${field}`);
    }
    if (!record.data.draft && name==='people' && !record.data.role) throw new Error(`${record.id}: published people need a confirmed role`);
    if (!record.data.draft && name==='publications' && !record.data.authors?.trim()) throw new Error(`${record.id}: published papers need the full author list`);
  }
}
if (process.argv[1]?.endsWith('validate-content.mjs')) { const data=loadRaw(); validate(data); console.log(`Validated ${Object.values(data).flat().length} content records.`); }
