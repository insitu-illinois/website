import { writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import { models, fieldsFor, slugPattern, datePattern, mediaPattern } from '../src/lib/content-model.mjs';
const labels = { labAuthors: 'Lab authors', heroMedia: 'Hero image', shortDescription: 'Short description', relatedPublication: 'Related publication', relatedProject: 'Related project', awardingBody: 'Awarding body', externalLink: 'External link', bibtex: 'BibTeX', doi: 'DOI URL', pdf: 'PDF', phd: 'PhD' };
const label = name => labels[name] ?? name[0].toUpperCase() + name.slice(1);
function field(name, f) {
  const result = { name, label: label(name), widget: f.widget ?? 'string', required: Boolean(f.required) };
  if (f.default !== undefined) result.default = f.default;
  switch (f.kind) {
    case 'boolean': result.widget = 'boolean'; break;
    case 'slug': result.pattern = [slugPattern, 'Use lowercase letters, numbers, and hyphens.']; result.hint = 'Permanent identifier. Do not change after publishing; other records refer to it.'; break;
    case 'number': Object.assign(result, { widget: 'number', value_type: 'int', min: f.min, ...(f.max ? {max:f.max} : {}) }); break;
    case 'select': Object.assign(result, { widget: 'select', options: f.options }); break;
    case 'reference':
      Object.assign(result, { widget: 'relation', collection: f.collection, search_fields: [models[f.collection].name ? 'name' : 'title'], value_field: '{{slug}}', display_fields: [models[f.collection].name ? 'name' : 'title'], multiple: f.multiple }); break;
    case 'image':
      Object.assign(result, { widget: 'object', collapsed: true, hint: 'Optional. Adding an image requires both a file and meaningful alt text.', fields: [
        { name: 'src', label: 'Image', widget: 'image', required: true, pattern: [mediaPattern, 'Upload an image to the media folder.'], choose_url: false },
        { name: 'alt', label: 'Alt text', widget: 'string', required: true, pattern: ['.*\\S.*', 'Describe the image.'] },
      ] }); break;
    case 'date': result.pattern = [datePattern, 'Use YYYY, YYYY-MM, or YYYY-MM-DD.']; result.hint = 'Keep only the precision that is known. Leave blank if the date is unknown.'; break;
    case 'url': result.pattern = ['^https?://\\S+$', 'Use a full http or https URL.']; break;
    case 'email': result.pattern = ['^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', 'Use an email address.']; break;
    case 'file': Object.assign(result, { widget: 'file', choose_url: false, pattern: ['^/media/(?!.*\\.\\.).+$', 'Upload the file to the media folder.'] }); break;
  }
  return result;
}
const collections = Object.keys(models).map(name => ({
  name, label: label(name), folder: `src/content/${name}`, create: true, format: 'json', extension: 'json',
  identifier_field: models[name].name ? 'name' : 'title', slug: '{{fields.slug}}',
  fields: Object.entries(fieldsFor(name)).map(([n,f]) => field(n,f)),
}));
collections.push({ name: 'pages', label: 'Page text', files: [
  { name: 'home', label: 'Home', file: 'src/content/pages/home.json', fields: [field('title',{required:true}),field('statement',{}),field('draft',{kind:'boolean',default:false})] },
  ...['about','join'].map(name => ({name,label:label(name),file:`src/content/pages/${name}.json`,fields:[field('title',{required:true}),field('body',{widget:'markdown'}),field('draft',{kind:'boolean',default:false})]})),
  { name:'footer',label:'Footer contact',file:'src/content/pages/footer.json',fields:[field('email',{kind:'email'}),field('institution',{}),field('draft',{kind:'boolean',default:false})] },
] });
const config = {
  backend: { name:'github',repo:'insitu-illinois/website',branch:'main',auth_scope:'public_repo',...(process.env.CMS_AUTH_URL ? {base_url:process.env.CMS_AUTH_URL} : {}) },
  media_folder:'public/media', public_folder:'/media', collections,
};
writeFileSync('public/admin/config.yml', '# Generated from src/lib/content-model.mjs.\n' + stringify(config));
