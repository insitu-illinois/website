// Shared timing comes from the design tokens. Semantic states change immediately;
// only the visual transition waits for the short settling interval.
export const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reduceMotion==='true';
const active=new Map<HTMLElement,Animation>();
export function motionOptions(decorative=false) {
  const style=getComputedStyle(document.documentElement);
  return {duration:reducedMotion()?0:parseFloat(style.getPropertyValue(decorative?'--dur-decorative':'--dur-med')),delay:reducedMotion()?0:parseFloat(style.getPropertyValue('--delay-settle')),easing:style.getPropertyValue('--ease-standard').trim(),fill:'both' as FillMode};
}
export async function animateSurface(el:HTMLElement,opening:boolean) {
  active.get(el)?.cancel();
  if(reducedMotion())return true;
  const frames=[{opacity:0,transform:'translateY(-0.25rem)'},{opacity:1,transform:'translateY(0)'}];
  const animation=el.animate(opening?frames:[...frames].reverse(),motionOptions());
  active.set(el,animation);
  try {await animation.finished; if(active.get(el)!==animation)return false; active.delete(el);animation.cancel();return true;} catch {return false;}
}
export async function setVisible(el:HTMLElement,open:boolean,reserveSpace=false) {
  const current=el.dataset.visibility??String(!el.hidden&&getComputedStyle(el).visibility!=='hidden');
  if(current===String(open))return;
  el.dataset.visibility=String(open);
  el.inert=!open;
  el.setAttribute('aria-hidden',String(!open));
  if(open){el.hidden=false;el.style.visibility='visible';}
  if(await animateSurface(el,open)) {
    if(reserveSpace)el.style.visibility=open?'visible':'hidden';
    else el.hidden=!open;
  }
}
export async function closeDialog(dialog:HTMLDialogElement) {
  if(!dialog.open||dialog.dataset.closing)return;
  dialog.dataset.closing='true';
  await animateSurface(dialog,false);
  dialog.close();delete dialog.dataset.closing;
}
const detailsVersions=new WeakMap<HTMLDetailsElement,number>();
export async function setDetailsOpen(details:HTMLDetailsElement,open:boolean) {
  if((details.dataset.expanded??String(details.open))===String(open))return;
  const version=(detailsVersions.get(details)||0)+1;detailsVersions.set(details,version);
  details.dataset.expanded=String(open);
  const summary=details.querySelector('summary')!;summary.setAttribute('aria-expanded',String(open));
  const children=[...details.children].filter(el=>el!==summary) as HTMLElement[];
  if(open)details.open=true;
  children.forEach(el=>el.inert=!open);
  await Promise.all(children.map(el=>animateSurface(el,open)));
  if(detailsVersions.get(details)===version)details.open=open;
}
function settleAll(){if(reducedMotion())active.forEach(animation=>animation.finish());}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',settleAll);
new MutationObserver(settleAll).observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
