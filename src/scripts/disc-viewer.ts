import {motionOptions,reducedMotion} from './motion';
export function mountDisc(root:HTMLElement) {
  const disc=root.querySelector<HTMLButtonElement>('[data-disc-spin]')!;
  const model=disc.querySelector<HTMLElement>('[data-disc-model]')!;
  const actions=root.querySelector<HTMLElement>('[data-disc-actions]')!;
  let lifted=false,x=0,y=0,z=0,drag: {id:number;x:number;y:number;distance:number}|null=null;
  let spin:Animation|undefined,suppressClick=false;
  function render(){
    model.style.transform=lifted?`translateZ(var(--space-6)) translateY(-4%) scale(1.06) rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`:'none';
    disc.dataset.rotation=`${x},${y},${z}`;
  }
  function setLifted(value:boolean){
    spin?.cancel();lifted=value;x=value?-12:0;y=value?180:0;z=0;
    disc.setAttribute('aria-pressed',String(value));disc.setAttribute('aria-label',value?'Return the VRchaeology disc to its tray':'Lift and turn the VRchaeology disc');
    actions.hidden=!value;render();
  }
  function turn(dx:number,dy:number){spin?.cancel();x+=dx;y+=dy;render();}
  function rotate(full=false){
    spin?.cancel();const from=model.style.transform;y+=full?360:180;z+=full?360:0;render();
    if(!reducedMotion())spin=model.animate([{transform:from},{transform:model.style.transform}],{...motionOptions(true),duration:motionOptions(true).duration*(full?2:1)});
  }
  disc.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){suppressClick=false;return;}setLifted(!lifted);});
  actions.querySelector('[data-disc-flip]')!.addEventListener('click',()=>rotate());
  actions.querySelector('[data-disc-turn]')!.addEventListener('click',()=>rotate(true));
  disc.addEventListener('keydown',event=>{
    const offsets:Record<string,number[]>={ArrowLeft:[0,-30],ArrowRight:[0,30],ArrowUp:[-30,0],ArrowDown:[30,0]};
    if(offsets[event.key]){event.preventDefault();if(!lifted)setLifted(true);turn(...offsets[event.key] as [number,number]);}
    if(event.key==='Home'){event.preventDefault();setLifted(false);}
    if(event.key==='Escape'&&lifted){event.preventDefault();event.stopPropagation();setLifted(false);}
  });
  disc.addEventListener('pointerdown',event=>{if(event.button!==0)return;disc.setPointerCapture(event.pointerId);if(!lifted)return;spin?.cancel();suppressClick=false;drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0};disc.setPointerCapture(event.pointerId);});
  disc.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=drag.y-event.clientY;drag.distance+=Math.abs(dx)+Math.abs(dy);if(drag.distance>5){suppressClick=true;disc.dataset.dragging='true';turn(dy*.7,dx*.7);}drag.x=event.clientX;drag.y=event.clientY;});
  const stop=()=>{drag=null;delete disc.dataset.dragging;};disc.addEventListener('pointerup',stop);disc.addEventListener('pointercancel',stop);
  root.querySelector('[data-case-close]')!.addEventListener('click',()=>setLifted(false));
  new MutationObserver(()=>{if(root.dataset.open!=='true')setLifted(false);}).observe(root,{attributes:true,attributeFilter:['data-open']});
  const settle=()=>{if(reducedMotion())spin?.finish();};
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
}
