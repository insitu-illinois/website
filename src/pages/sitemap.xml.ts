import {content} from '../lib/content';
import {hasPersonPage} from '../lib/format.mjs';
export async function GET({site}:{site:URL}) {
  const data=await content();
  const paths=['','about','projects','publications','presentations','awards-funding','people','news','join'];
  for(const collection of ['people','themes','projects','publications','news'])for(const entry of data[collection])if(collection!=='people'||hasPersonPage(entry))paths.push(`${collection}/${entry.id}`);
  for(let p=2;p<=Math.ceil(data.news.length/6);p++)paths.push(`news/${p}`);
  const urls=paths.map(path=>new URL(path?`/${path}/`:'/',site).href);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${url}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
