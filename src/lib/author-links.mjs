// Explicit citation spellings avoid linking unrelated authors with the same surname.
const aliases={
 'laura-shackelford':['Laura L. Shackelford','Laura Shackelford','L. Shackelford','Shackelford L'],
 'sepehr-vaez-afshar':['Sepehr Vaez Afshar','Sepehr VaezAfshar'],
 'sarvin-eshaghi':['Sarvin Eshaghi'],
 'ogulcan-durmaz':['Ogulcan Durmaz'],
 'brian-graves':['Brian Graves'],
};
export function authorParts(text,people=[]){
 const matches=[];
 for(const person of people){
  for(const name of aliases[person.id]??[]){
   let from=0,index;
   while((index=text.indexOf(name,from))!==-1){
    const end=index+name.length;
    if(!/[\p{L}\p{N}]/u.test(text[index-1]??'')&&!/[\p{L}\p{N}]/u.test(text[end]??''))matches.push({index,end,person});
    from=end;
   }
  }
 }
 matches.sort((a,b)=>a.index-b.index||b.end-a.end);
 const parts=[];let cursor=0;
 for(const m of matches){if(m.index<cursor)continue;if(m.index>cursor)parts.push({text:text.slice(cursor,m.index)});parts.push({text:text.slice(m.index,m.end),person:m.person});cursor=m.end;}
 if(cursor<text.length)parts.push({text:text.slice(cursor)});
 return parts;
}
