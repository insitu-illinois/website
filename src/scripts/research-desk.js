const root=document.querySelector('.research-desk');
if(root){
const projects=JSON.parse(root.querySelector('[data-desk-content]').textContent);
const detail = root.querySelector('#detail-content');
const visited = new Set();
const motion = root.querySelector('#motion');
const deviceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dialog = root.querySelector('#photo-dialog');
const inspector=root.querySelector('#inspect-dialog');
function openInspector(index){select(index);inspector.showModal();document.dispatchEvent(new CustomEvent('inspect-project',{detail:index}));if(!deviceMotion.matches&&!motion.checked)inspector.animate([{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:400,easing:'cubic-bezier(.2,.7,.3,1)'});}
root.querySelector('#close-inspect').onclick=()=>inspector.close();
inspector.addEventListener('close',()=>document.dispatchEvent(new Event('inspect-close')));
inspector.addEventListener('click',e=>{if(e.target===inspector){const r=inspector.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)inspector.close();}});

function node(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
function select(index){
 visited.add(index);const p=projects[index];
 root.querySelectorAll('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.project)===index)));
 root.querySelector('#progress').textContent=`${visited.size} of 4 projects explored`;
 root.querySelector('#project-index').textContent=`Project 0${index+1} / 04`;
 detail.replaceChildren(node('h2',p.name),node('p',p.shortDescription||p.body,'description'));
 detail.querySelector('h2').id='inspect-title';
 if(p.gallery?.length){
  const image=node('img');image.src=p.gallery[0].src;image.alt=p.gallery[0].alt;image.className='preview-image';detail.append(image);
  const gallery=node('div',null,'gallery');
  p.gallery.slice(0,3).forEach(media=>{const b=node('button');b.type='button';b.setAttribute('aria-label',`Enlarge: ${media.caption}`);const img=node('img');img.src=media.src;img.alt='';b.append(img);b.onclick=()=>{const large=root.querySelector('#large-photo');large.src=media.src;large.alt=media.alt;root.querySelector('#photo-caption').textContent=media.caption;dialog.showModal();};gallery.append(b);});
  detail.append(gallery,node('p','Select a scene to look closer.','gallery-label'));
 }else{detail.append(node('p','Project imagery has not been added yet.','gallery-label'));}
 if(p.people.length){const team=node('details');team.className='team-disclosure';team.append(node('summary','Project team'),node('p',p.people.join(' · '),'names'));detail.append(team);}
 root.querySelector('#project-link').href=`/projects/${p.slug}/`;
 if(!deviceMotion.matches&&!motion.checked){detail.animate([{transform:'translateY(6px)'},{transform:'translateY(0)'}],{duration:220,easing:'ease-out'});}
}
root.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openInspector(Number(b.dataset.project))));
motion.checked=deviceMotion.matches||document.documentElement.dataset.reduceMotion==='true';motion.onchange=()=>root.classList.toggle('reduce-motion',motion.checked);
root.querySelector('#close-photo').onclick=()=>dialog.close();
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
select(0);
new MutationObserver(()=>{motion.checked=deviceMotion.matches||document.documentElement.dataset.reduceMotion==='true';root.classList.toggle('reduce-motion',motion.checked);motion.dispatchEvent(new Event('change'));}).observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();import('./research-desk-scene.js').then(m=>m.initDesk(root,projects)).catch(()=>{});}}, {rootMargin:'200px'});observer.observe(root);
}
