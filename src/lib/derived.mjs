const id = value => typeof value === 'string' ? value : value?.id;
const includes = (items, value) => (items ?? []).some(item=>id(item)===value);
const byTitle = (a,b) => (a.data.name ?? a.data.title).localeCompare(b.data.name ?? b.data.title);
export const newest = records => [...records].sort((a,b)=>(String(b.data.date || b.data.publicationDate || b.data.year || '')).localeCompare(String(a.data.date || a.data.publicationDate || a.data.year || '')) || byTitle(a,b));
export const visible = (data, development=false) => Object.fromEntries(Object.entries(data).map(([name,records])=>[name,records.filter(r=>development || !r.data.draft)]));
export const referenced = (records, references) => (references ?? []).map(ref=>records.find(r=>r.id===id(ref))).filter(Boolean);
export const peopleGroups = people => [
  { title:'Current members', key:'current' },
  { title:'Collaborators', key:'collaborator' },
  { title:'Alumni', key:'alumni' },
].map(group => ({...group, items: people.filter(person => {
  const role = person.data.role;
  return (['collaborator','alumni'].includes(role) ? role : 'current') === group.key;
}).sort((a,b) => (a.data.order ?? 100) - (b.data.order ?? 100) || byTitle(a,b))}));
export function personLists(data, person) {
  return {
    publications:newest(data.publications.filter(r=>includes(r.data.labAuthors,person))),
    presentations:newest(data.presentations.filter(r=>includes(r.data.presenters,person))),
    recognition:newest(data.recognition.filter(r=>includes(r.data.recipients,person))),
    projects:data.projects.filter(r=>includes(r.data.team,person)).sort(byTitle),
    news:newest((data.news ?? []).filter(r=>includes(r.data.people,person))),
  };
}
export const projectLists = (data,project) => ({ publications:newest(data.publications.filter(r=>id(r.data.project)===project)),presentations:newest(data.presentations.filter(r=>id(r.data.project)===project)),news:newest((data.news ?? []).filter(r=>id(r.data.relatedProject)===project)) });
export function themeLists(data,theme) {
  const projects=data.projects.filter(r=>includes(r.data.themes,theme)).sort(byTitle);
  const publications=newest(data.publications.filter(r=>includes(r.data.themes,theme)));
  const presentations=newest(data.presentations.filter(r=>includes(r.data.themes,theme)));
  const peopleIds=new Set([...projects.flatMap(r=>r.data.team ?? []),...publications.flatMap(r=>r.data.labAuthors ?? []),...presentations.flatMap(r=>r.data.presenters ?? [])].map(id));
  const news=newest((data.news ?? []).filter(r=>includes(r.data.themes,theme)));
  const recognition=newest((data.recognition ?? []).filter(r=>includes(r.data.themes,theme)));
  return {projects,publications,presentations,news,recognition,people:data.people.filter(r=>peopleIds.has(r.id)||includes(r.data.themes,theme)).sort(byTitle),otherThemes:data.themes.filter(r=>r.id!==theme)};
}
export function recordPeople(data, record) {
  const field={projects:'team',publications:'labAuthors',presentations:'presenters',recognition:'recipients',news:'people'}[record.collection];
  return field ? referenced(data.people,record.data[field]) : [];
}
export function personThemes(data, person) {
  const lists=personLists(data,person.id);
  const ids=new Set([...(person.data.themes ?? []),...['projects','publications','presentations'].flatMap(key=>lists[key].flatMap(r=>r.data.themes ?? []))].map(id));
  return data.themes.filter(theme=>ids.has(theme.id));
}
export const relatedPapers = (data,paper) => newest(data.publications.filter(r=>r.id!==paper.id && (paper.data.themes ?? []).some(theme=>includes(r.data.themes,id(theme))))).slice(0,3);
export const homeLists = data => ({publications:newest(data.publications).slice(0,3),projects:data.projects.filter(r=>r.data.featured).sort(byTitle).slice(0,3),news:newest(data.news).slice(0,3)});
export const orders = {publications:['journal','conference','chapter','thesis','preprint'],presentations:['invited','conference','poster','demo','workshop','exhibition'],recognition:['award','grant','fellowship','scholarship'],projects:['active','completed']};
export const grouped = (data,name) => orders[name].map(type=>({type,items:newest(data[name].filter(r=>r.data[name==='projects'?'status':'type']===type))}));
