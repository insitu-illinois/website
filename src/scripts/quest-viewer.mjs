import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Render only while a short interaction settles; there is no continuous animation loop.
export async function mountQuest(button) {
  const canvas=button.querySelector('canvas');
  const fallback=button.querySelector('[data-model-fallback]');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true});
  if(!context){fallback.textContent='View game availability';button.dataset.model='unavailable';return;}
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.4;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);
    camera.position.set(0,.35,4.5);camera.lookAt(0,0,0);
    const white=getComputedStyle(document.documentElement).getPropertyValue('--white').trim();
    scene.add(new THREE.HemisphereLight(white,white,2));
    const key=new THREE.DirectionalLight(white,3);key.position.set(2,4,5);scene.add(key);
    const rim=new THREE.DirectionalLight(white,2);rim.position.set(-3,2,-2);scene.add(rim);
    const assembly=new THREE.Group();scene.add(assembly);
    const loader=new GLTFLoader();
    const models=await Promise.all(['headset','left','right'].map(name=>loader.loadAsync(`/media/models/quest-3/${name}.glb`)));
    const groups=models.map((gltf,index)=>{
      const model=gltf.scene;
      const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const group=new THREE.Group();group.add(model);
      const scale=(index===0?1.8:.72)/Math.max(size.x,size.y,size.z);
      group.scale.setScalar(scale);assembly.add(group);return group;
    });
    const [headset,left,right]=groups;
    headset.position.set(0,.25,0);headset.rotation.set(.12,.22,0);
    left.position.set(-.95,-.6,.25);left.rotation.set(1.1,Math.PI+.2,-.35);left.rotateOnWorldAxis(new THREE.Vector3(0,0,1),Math.PI);
    right.position.set(.95,-.6,.25);right.rotation.set(1.1,Math.PI-.2,.35);right.rotateOnWorldAxis(new THREE.Vector3(0,0,1),Math.PI);
    const area=button.closest('.headset-area');
    const initial=groups.map(group=>group.quaternion.clone());
    const target=initial.map(value=>value.clone());
    const angles=groups.map(()=>[0,0]);
    groups.forEach((group,index)=>group.traverse(child=>{child.userData.part=index;}));
    let selected=0,frame=0,drag=null,suppressClick=false;
    const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.reduceMotion==='true';
    const draw=()=>renderer.render(scene,camera);
    function animate(){
      frame=0;let moving=false;
      groups.forEach((group,index)=>{
        if(reduced())group.quaternion.copy(target[index]);
        else group.quaternion.slerp(target[index],.2);
        if(group.quaternion.angleTo(target[index])>.001)moving=true;
      });
      draw();if(moving)frame=requestAnimationFrame(animate);
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(animate);}
    function choose(index,announce=true){selected=index;button.dataset.selected=String(index);if(announce)area.querySelector('[data-model-status]').textContent=['Headset','Left controller','Right controller'][index]+' selected.';}
    function rotate(dx,dy){
      const qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),dx*Math.PI/180);
      const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dy*Math.PI/180);
      target[selected].premultiply(qx).premultiply(qy).normalize();
      angles[selected][0]+=dx;angles[selected][1]+=dy;
      button.dataset.rotations=JSON.stringify(angles);schedule();
    }
    function reset(){target[selected].copy(initial[selected]);angles[selected]=[0,0];button.dataset.rotations=JSON.stringify(angles);schedule();}
    button.addEventListener('keydown',event=>{
      const directions={ArrowLeft:[0,-30],ArrowRight:[0,30],ArrowUp:[-30,0],ArrowDown:[30,0]};
      if(directions[event.key]){event.preventDefault();rotate(...directions[event.key]);}
      else if(['1','2','3'].includes(event.key)){event.preventDefault();choose(Number(event.key)-1);}
      else if(event.key==='Home'){event.preventDefault();reset();}
    });
    const raycaster=new THREE.Raycaster();
    button.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      suppressClick=false;
      const rect=canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera);
      const hit=raycaster.intersectObjects(groups,true)[0];
      if(!hit)return;
      choose(hit.object.userData.part);
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,total:0};button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove',event=>{
      if(!drag)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      drag.total+=Math.abs(dx)+Math.abs(dy);
      if(drag.total>5){suppressClick=true;button.dataset.dragging='true';rotate(dy*.65,dx*.65);}
      drag.x=event.clientX;drag.y=event.clientY;
    });
    const stop=()=>{drag=null;delete button.dataset.dragging;};
    button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);
    // A drag rotates a part; it must not accidentally activate the availability note.
    button.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
    const motion=matchMedia('(prefers-reduced-motion:reduce)');motion.addEventListener('change',schedule);
    const preferences=new MutationObserver(schedule);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
    choose(0,false);button.dataset.rotations=JSON.stringify(angles);
    const resize=new ResizeObserver(()=>{const {width,height}=button.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();});resize.observe(button);
    canvas.hidden=false;fallback.hidden=true;button.dataset.model='ready';draw();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.hidden=true;fallback.hidden=false;fallback.textContent='View game availability';button.dataset.model='unavailable';});
    addEventListener('pagehide',event=>{if(event.persisted)return;cancelAnimationFrame(frame);resize.disconnect();preferences.disconnect();renderer.dispose();},{once:true});
  } catch {
    renderer?.dispose();canvas.hidden=true;fallback.hidden=false;fallback.textContent='View game availability';button.dataset.model='unavailable';
  }
}
