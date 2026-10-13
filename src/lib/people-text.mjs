import {hasPersonPage} from './format.mjs';
export function personHref(person){return hasPersonPage(person)?`/people/${person.id}/`:`/people/#person-${person.id}`;}
export function peopleTextParts(text='',people=[]){
 const found=[];
 for(const person of people){const name=person.data.name;let from=0,index;while(name&&(index=text.indexOf(name,from))!==-1){const end=index+name.length;if(!/[\p{L}\p{N}]/u.test(text[index-1]??'')&&!/[\p{L}\p{N}]/u.test(text[end]??''))found.push({index,end,person});from=end;}}
 found.sort((a,b)=>a.index-b.index||b.end-a.end);const parts=[];let cursor=0;
 for(const m of found){if(m.index<cursor)continue;if(m.index>cursor)parts.push({text:text.slice(cursor,m.index)});parts.push({text:text.slice(m.index,m.end),person:m.person});cursor=m.end;}if(cursor<text.length)parts.push({text:text.slice(cursor)});return parts;
}
export function unmentionedPeople(text,people){const linked=new Set(peopleTextParts(text,people).filter(p=>p.person).map(p=>p.person.id));return people.filter(p=>!linked.has(p.id));}
