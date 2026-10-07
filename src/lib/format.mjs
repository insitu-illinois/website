export const roles = { faculty:'Faculty', phd:'PhD student', ms:'Master’s student', undergrad:'Undergraduate', collaborator:'Collaborator', alumni:'Alumni', visitor:'Visitor' };
export const labels = { active:'Active projects', completed:'Completed projects', journal:'Journal articles', conference:'Conference papers', chapter:'Chapters', thesis:'Theses', preprint:'Preprints', invited:'Invited talks', poster:'Posters', demo:'Demos', workshop:'Workshops', exhibition:'Exhibitions', award:'Awards', grant:'Grants', fellowship:'Fellowships', scholarship:'Scholarships', paper:'Paper', talk:'Talk', 'lab-life':'Lab life', press:'Press' };
export function dateLabel(value) {
  if (!value || value.length === 4) return value;
  return new Intl.DateTimeFormat('en-US', {year:'numeric', month:'long', ...(value.length === 10 ? {day:'numeric'} : {}),timeZone:'UTC'}).format(new Date(value.length === 7 ? value+'-01T12:00:00Z' : value+'T12:00:00Z'));
}
export const entryUrl = record => ['people','projects','themes','publications','news'].includes(record.collection) ? `/${record.collection}/${record.id}/` : undefined;
