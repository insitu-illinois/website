// One field model drives both Astro's Zod schemas and the Sveltia forms.
const text = (required = false) => ({ kind: 'text', required });
const long = () => ({ kind: 'text', widget: 'text' });
const select = (...options) => ({ kind: 'select', options });
const refs = (collection, multiple = true) => ({ kind: 'reference', collection, multiple });
const image = () => ({ kind: 'image' });
const url = () => ({ kind: 'url' });
const date = () => ({ kind: 'date' });
const year = () => ({ kind: 'number', min: 1000, max: 9999 });
const body = () => ({ kind: 'text', widget: 'markdown' });
export const common = {
  slug: { kind: 'slug', required: true },
  draft: { kind: 'boolean', default: false },
};
export const models = {
  themes: { name: text(true), question: long(), description: long(), image: image() },
  people: {
    name: text(true), role: select('faculty', 'phd', 'ms', 'undergrad', 'collaborator', 'alumni', 'visitor'),
    photo: image(), bio: long(), website: url(), scholar: url(), email: { kind: 'email' },
    order: { kind: 'number', default: 100, min: 0 },
  },
  projects: {
    name: text(true), shortDescription: long(), heroMedia: image(), body: body(),
    status: { ...select('active', 'completed'), required: true },
    featured: { kind: 'boolean', default: false }, themes: refs('themes'), team: refs('people'), funding: refs('recognition'),
  },
  publications: {
    title: text(true), authors: long(), labAuthors: refs('people'), summary: long(), year: year(), venue: text(),
    type: { ...select('journal', 'conference', 'chapter', 'thesis', 'preprint'), required: true },
    award: text(), pdf: { kind: 'file' }, doi: url(), code: url(), bibtex: long(),
    project: refs('projects', false), themes: refs('themes'), thumbnail: image(),
  },
  presentations: {
    title: text(true), type: { ...select('invited', 'conference', 'poster', 'demo', 'workshop', 'exhibition'), required: true },
    venue: text(), location: text(), date: date(), presenters: refs('people'), project: refs('projects', false),
    themes: refs('themes'), slides: url(), video: url(),
  },
  recognition: {
    title: text(true), type: { ...select('award', 'grant', 'fellowship', 'scholarship'), required: true },
    recipients: refs('people'), awardingBody: text(), year: year(), link: url(), description: long(),
  },
  news: {
    title: text(true), date: date(), type: { ...select('paper', 'award', 'talk', 'lab-life', 'press'), required: true },
    body: body(), image: image(), externalLink: url(), relatedPublication: refs('publications', false), relatedProject: refs('projects', false),
  },
};
export const slugPattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$';
export const datePattern = '^\\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\\d|3[01]))?)?$';
export const mediaPattern = '^/media/(?!.*\\.\\.)(?!.*[?#]).+\\.(?:png|jpg|jpeg|webp|avif|gif|svg)$';
export function fieldsFor(name) { return { ...common, ...models[name] }; }
export function makeSchema(z, reference, fields) {
  const optionalString = (schema) => z.union([schema, z.literal('')]).nullish().transform(v => v ?? '');
  const shape = {};
  for (const [name, field] of Object.entries(fields)) {
    let s;
    switch (field.kind) {
      case 'slug': s = z.string().regex(new RegExp(slugPattern)); break;
      case 'boolean': s = z.boolean().default(field.default); break;
      case 'number':
        s = z.number().int().min(field.min ?? 0).max(field.max ?? Number.MAX_SAFE_INTEGER);
        s = field.default === undefined ? s.nullish() : s.default(field.default); break;
      case 'select': s = z.enum(field.options); if (!field.required) s = s.nullish(); break;
      case 'reference':
        s = reference(field.collection);
        s = field.multiple ? z.array(s).nullish().transform(v => v ?? []) : s.nullish(); break;
      case 'image':
        s = z.object({ src: z.string().regex(new RegExp(mediaPattern)), alt: z.string().trim().min(1) }).strict().nullish(); break;
      case 'date':
        s = optionalString(z.string().regex(new RegExp(datePattern)).refine(value => {
          if (value.length !== 10) return true;
          const d = new Date(value + 'T12:00:00Z');
          return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
        }, 'Use a real calendar date.')); break;
      case 'url': s = optionalString(z.string().url().refine(v => /^https?:\/\//.test(v), 'Use an http or https URL.')); break;
      case 'file': s = optionalString(z.string().regex(/^\/media\/(?!.*\.\.).+$/)); break;
      case 'email': s = optionalString(z.string().email()); break;
      default: s = field.required ? z.string().trim().min(1) : z.string().nullish().transform(v => v ?? '');
    }
    shape[name] = s;
  }
  return z.object(shape).strict();
}
