import {peopleTextParts,personHref} from './people-text.mjs';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
// CMS Markdown is content, never executable HTML. Images use the dedicated alt-required fields.
export function markdown(value='',people=[]) {
  const linkText=tokens=>tokens.flatMap(token=>{
    if(['link','image','code','codespan','html'].includes(token.type))return [token];
    if(token.tokens) return [{...token,tokens:linkText(token.tokens)}];
    if(token.items) return [{...token,items:token.items.map(item=>({...item,tokens:linkText(item.tokens)}))}];
    if(token.type!=='text')return [token];
    return peopleTextParts(token.text,people).map(part=>part.person?{type:'link',raw:part.text,href:personHref(part.person),title:null,tokens:[{type:'text',raw:part.text,text:part.text}]}:{...token,raw:part.text,text:part.text});
  });
  const tokens=marked.lexer(value);
  const linked=linkText(tokens);linked.links=tokens.links;
  return sanitizeHtml(marked.parser(linked), {
    allowedTags:['p','h2','h3','h4','ul','ol','li','strong','em','a','blockquote','code','pre','br','hr','del'],
    allowedAttributes:{a:['href','title']},
    allowedSchemes:['https','http','mailto'], allowProtocolRelative:false,
    transformTags:{h1:'h2'},
  });
}
