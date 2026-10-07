import { indexingEnabled, crawlerPolicy } from '../config/site.mjs';
export function GET({site}:{site:URL}) {
  return new Response(crawlerPolicy(indexingEnabled,site),{headers:{'Content-Type':'text/plain'}});
}
