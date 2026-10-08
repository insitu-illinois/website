import { writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import { models, fieldsFor, slugPattern, datePattern, mediaPattern } from '../src/lib/content-model.mjs';
import { roles } from '../src/lib/format.mjs';
const hints = {
  draft: 'Turn on to hide this entry from the website while you prepare it; GitHub files remain public.',
  name: 'Enter the name as it should appear on the website.',
  title: 'Enter the approved title in sentence case, keeping proper names capitalized.',
  role: 'Collaborator and Alumni have their own sections; all other roles appear under Current members.',
  bio: 'Use an approved biography. Alumni biographies are saved but not displayed; other roles get a profile page. Leave blank for a list entry only.',
  linkedin: 'Paste this person’s verified LinkedIn profile URL, or leave blank; do not use a search results page.',
  proposed: 'Keep on while the lab is reviewing these values; the website will clearly label them as proposed.',
  participation: 'Write one sentence about accessibility and participation; it appears on Home and About.',
  context: 'Write one sentence about people and their real-world contexts; it appears on Home and About.',
  collaboration: 'Write one sentence about collaboration across disciplines; it appears on Home and About.',
  developerName: 'Enter the name to credit for website development, or leave blank to hide the credit.',
  website: 'Paste the full address of the person’s website, or leave blank.',
  universityProfile: 'Paste the verified university directory page for this person, or leave blank.',
  affiliations: 'List confirmed current appointments and affiliations, one per line; leave blank if not supplied.',
  people: 'Select the people mentioned in this news item; it will appear on their profiles automatically.',
  address: 'Enter the public lab address, including the building and room if visitors need them.',
  mapEmbedUrl: 'Paste only the Google Maps embed URL from Share → Embed a map, not the full iframe code.',
  directionsUrl: 'Paste the Google Maps link visitors should open for directions.',
  scholar: 'Paste the person’s Google Scholar profile address, or leave blank.',
  email: 'Enter the contact email; in Lab contact, this single address is shared by Join, About, and the footer.',
  order: 'Smaller numbers appear first within the person’s section; equal numbers sort by name.',
  question: 'Write the guiding research question for this theme.',
  description: 'Write a short, approved description for readers.',
  shortDescription: 'Summarize the project briefly for project lists.',
  body: 'Write the approved page text; use headings, paragraphs, lists, and links as needed.',
  status: 'Choose whether this project is active or completed.',
  featured: 'Turn on to make this project eligible for the three featured spots on Home.',
  themes: 'Choose the research themes connected to this work.',
  team: 'Choose the people involved; the project will also appear on their profile pages.',
  funding: 'Choose the awards or grants supporting this project.',
  authors: 'Enter every author in citation order, including external co-authors; also fill Lab authors separately.',
  labAuthors: 'Select the lab people who authored this paper so it appears on their profiles; keep the full Authors text too.',
  summary: 'Write a short, approved summary of the paper.',
  year: 'Enter the four-digit year, or leave blank if it is unknown.',
  venue: 'Enter the journal, conference, or host institution as appropriate.',
  type: 'Choose the category that best describes this entry.',
  award: 'Enter a confirmed award label for this paper, or leave blank.',
  pdf: 'Upload the paper PDF, or leave blank if no shareable copy is available.',
  doi: 'Paste the full DOI link, starting with https://doi.org/, or leave blank.',
  code: 'Paste the full link to the code repository, or leave blank.',
  bibtex: 'Paste the verified BibTeX citation to enable the copy-citation button.',
  project: 'Choose the related lab project, or leave blank if there is no confirmed connection.',
  location: 'Enter the city or event location, or leave blank if unknown.',
  presenters: 'Choose the people who presented this work so it appears on their profiles.',
  slides: 'Paste the full link to publicly available slides, or leave blank.',
  video: 'Paste the full link to the presentation video, or leave blank.',
  recipients: 'Choose the people who received this recognition so it appears on their profiles.',
  awardingBody: 'Enter the organization that gave the award or funding.',
  link: 'Paste the full link to the award or grant announcement, or leave blank.',
  externalLink: 'Paste the full link to the original news story, or leave blank.',
  relatedPublication: 'Choose the paper mentioned in this news item, or leave blank.',
  relatedProject: 'Choose the project mentioned in this news item, or leave blank.',
  statement: 'Enter the approved introductory statement for Home.',
  institution: 'Enter the university affiliation displayed in the footer.',
};
const labels = { linkedin: 'LinkedIn', scholar: 'Google Scholar', developerName: 'Developer name', universityProfile: 'University profile', publicationDate: 'Publication date', mapEmbedUrl: 'Map embed URL', directionsUrl: 'Directions link', labAuthors: 'Lab authors', heroMedia: 'Hero image', shortDescription: 'Short description', relatedPublication: 'Related publication', relatedProject: 'Related project', awardingBody: 'Awarding body', externalLink: 'External link', bibtex: 'BibTeX', doi: 'DOI URL', pdf: 'PDF', phd: 'PhD' };
const label = name => labels[name] ?? name[0].toUpperCase() + name.slice(1);
function field(name, f) {
  const result = { name, label: label(name), widget: f.widget ?? 'string', required: Boolean(f.required), hint: hints[name] };
  if (f.default !== undefined) result.default = f.default;
  switch (f.kind) {
    case 'boolean': result.widget = 'boolean'; break;
    case 'slug': result.pattern = [slugPattern, 'Use lowercase letters, numbers, and hyphens.']; result.hint = 'Permanent identifier. Do not change after publishing; other records refer to it.'; break;
    case 'number': Object.assign(result, { widget: 'number', value_type: 'int', min: f.min, ...(f.max ? {max:f.max} : {}) }); break;
    case 'select': Object.assign(result, { widget: 'select', options: name==='role' ? f.options.map(value=>({label:roles[value],value})) : f.options }); break;
    case 'reference':
      Object.assign(result, { widget: 'relation', collection: f.collection, search_fields: [models[f.collection].name ? 'name' : 'title'], value_field: '{{slug}}', display_fields: [models[f.collection].name ? 'name' : 'title'], multiple: f.multiple }); break;
    case 'image':
      Object.assign(result, { widget: 'object', collapsed: true, hint: 'Optional. Adding an image requires both a file and meaningful alt text.', fields: [
        { name: 'src', label: 'Image', widget: 'image', required: true, hint: 'Upload or choose the image file you have permission to publish.', pattern: [mediaPattern, 'Upload an image to the media folder.'], choose_url: false },
        { name: 'alt', label: 'Alt text', widget: 'string', required: true, hint: 'Describe the image for people who cannot see it; for a headshot, use Portrait of followed by the person’s name.', pattern: ['.*\\S.*', 'Describe the image.'] },
      ] }); break;
    case 'date': result.pattern = [datePattern, 'Use YYYY, YYYY-MM, or YYYY-MM-DD.']; result.hint = 'Keep only the precision that is known. Leave blank if the date is unknown.'; break;
    case 'url': result.pattern = ['^https?://\\S+$', 'Use a full http or https URL.']; break;
    case 'email': result.pattern = ['^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', 'Use an email address.']; break;
    case 'file': Object.assign(result, { widget: 'file', choose_url: false, pattern: ['^/media/(?!.*\\.\\.).+$', 'Upload the file to the media folder.'] }); break;
  }
  if (!result.hint) throw new Error(`Missing editor hint for ${name}`);
  return result;
}
const collections = Object.keys(models).map(name => ({
  name, label: label(name), folder: `src/content/${name}`, create: true, format: 'json', extension: 'json',
  identifier_field: models[name].name ? 'name' : 'title', slug: '{{fields.slug}}',
  fields: Object.entries(fieldsFor(name)).map(([n,f]) => field(n,f)),
}));
collections.push({ name: 'pages', label: 'Page text', files: [
  { name: 'home', label: 'Home', file: 'src/content/pages/home.json', fields: [field('title',{required:true}),field('statement',{}),field('draft',{kind:'boolean',default:false})] },
  ...['about','join','accessibility'].map(name => ({name,label:label(name),file:`src/content/pages/${name}.json`,fields:[field('title',{required:true}),field('body',{widget:'markdown'}),field('draft',{kind:'boolean',default:false})]})),
  { name:'values',label:'Lab values',file:'src/content/pages/values.json',fields:[field('title',{required:true}),field('participation',{widget:'text',required:true}),field('context',{widget:'text',required:true}),field('collaboration',{widget:'text',required:true}),field('body',{widget:'markdown'}),field('proposed',{kind:'boolean',default:true}),field('draft',{kind:'boolean',default:true})] },
  { name:'location',label:'Lab location',file:'src/content/pages/location.json',fields:[field('address',{widget:'text'}),field('mapEmbedUrl',{kind:'url'}),field('directionsUrl',{kind:'url'}),field('draft',{kind:'boolean',default:true})] },
  { name:'footer',label:'Lab contact',file:'src/content/pages/footer.json',fields:[field('email',{kind:'email',required:true}),field('institution',{}),field('developerName',{}),field('draft',{kind:'boolean',default:false})] },
] });
const config = {
  backend: { name:'github',repo:'insitu-illinois/website',branch:'main',auth_scope:'public_repo',...(process.env.CMS_AUTH_URL ? {base_url:process.env.CMS_AUTH_URL} : {}) },
  media_folder:'public/media', public_folder:'/media', collections,
};
writeFileSync('public/admin/config.yml', '# Generated from src/lib/content-model.mjs.\n' + stringify(config));
