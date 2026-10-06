import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { models, fieldsFor, makeSchema } from './lib/content-model.mjs';

// IDs are always filenames; a validator requires the stored slug to match.
export const collections = Object.fromEntries(Object.keys(models).map(name => [name, defineCollection({
  loader: glob({ pattern: '*.json', base: `./src/content/${name}`, generateId: ({ entry }) => entry.replace(/\.json$/, '') }),
  schema: makeSchema(z, reference, fieldsFor(name)),
})]));
