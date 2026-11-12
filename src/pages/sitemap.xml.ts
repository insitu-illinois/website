import {readdirSync} from 'node:fs';
import {content} from '../lib/content';
import {hasPersonPage} from '../lib/format.mjs';
import {contentDates,newest} from '../lib/lastmod.mjs';
const folder=(name:string)=>readdirSync(`src/content/${name}`).filter(file=>file.endsWith('.json')).map(file=>`src/content/${name}/${file}`);
const all=()=>readdirSync('src/content').flatMap(folder);
// The content files each page reads; its lastmod is the newest of them.
const sources:Record<string,()=>string[]>={
  '':all,
  about:()=>['src/content/pages/about.json','src/content/pages/values.json',...folder('themes')],
  projects:()=>folder('projects'),
  publications:()=>folder('publications'),
  presentations:()=>folder('presentations'),
  'awards-funding':()=>folder('recognition'),
  people:()=>folder('people'),
  news:()=>folder('news'),
  join:()=>['src/content/pages/join.json'],
  accessibility:()=>['src/content/pages/accessibility.json'],
};
export async function GET({site}:{site:URL}) {
  const data=await content();
  const dates=contentDates();
  const pages:[string,string[]][]=Object.entries(sources).map(([path,files])=>[path,files()]);
  for(const collection of ['people','themes','projects','publications','news'] as const)for(const entry of data[collection])if(collection!=='people'||hasPersonPage(entry))pages.push([`${collection}/${entry.id}`,[`src/content/${collection}/${entry.id}.json`]]);
  for(let p=2;p<=Math.ceil(data.news.length/6);p++)pages.push([`news/${p}`,folder('news')]);
  const urls=pages.map(([path,files])=>`<url><loc>${new URL(path?`/${path}/`:'/',site).href}</loc><lastmod>${newest(dates,files)}</lastmod></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
