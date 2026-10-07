import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
// CMS Markdown is content, never executable HTML. Images use the dedicated alt-required fields.
export function markdown(value='') {
  return sanitizeHtml(marked.parse(value,{async:false}), {
    allowedTags:['p','h2','h3','h4','ul','ol','li','strong','em','a','blockquote','code','pre','br','hr','del'],
    allowedAttributes:{a:['href','title']},
    allowedSchemes:['https','http','mailto'], allowProtocolRelative:false,
    transformTags:{h1:'h2'},
  });
}
