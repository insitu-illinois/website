// Last-change dates for the sitemap, read from git history of the content files.
// A shallow clone would give every file the date of its one commit, so the build refuses it.
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();

// Map of repository path → YYYY-MM-DD of the newest commit that touched it.
export function contentDates(root='src/content') {
  if(git('rev-parse','--is-shallow-repository')==='true') throw new Error('The sitemap needs full git history for lastmod dates; check out with fetch-depth 0.');
  const dates=new Map();
  let date='';
  for(const line of git('log','--format=@%cs','--name-only','--',root).split('\n')) {
    if(line.startsWith('@')) date=line.slice(1);
    else if(line&&!dates.has(line)) dates.set(line,date);
  }
  return dates;
}

// Newest date among the given files. Files not yet committed count from their saved time.
export function newest(dates,files) {
  return files.map(file=>dates.get(file)??statSync(file).mtime.toISOString().slice(0,10)).sort().at(-1);
}
