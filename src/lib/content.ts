import { getCollection } from 'astro:content';
import { models } from './content-model.mjs';
import { visible } from './derived.mjs';

export async function content() {
  const entries=await Promise.all((Object.keys(models) as (keyof typeof models)[]).map(async name=>[name,await getCollection(name)]));
  return visible(Object.fromEntries(entries),import.meta.env.DEV);
}
