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
    let targetX=0,targetY=0,frame=0;
    const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.reduceMotion==='true';
    const draw=()=>renderer.render(scene,camera);
    function animate(){
      frame=0;
      assembly.rotation.x+=(targetX-assembly.rotation.x)*.13;
      assembly.rotation.y+=(targetY-assembly.rotation.y)*.13;
      left.position.y=-.6+assembly.rotation.y*.25;right.position.y=-.6-assembly.rotation.y*.25;
      draw();
      if(Math.abs(targetX-assembly.rotation.x)+Math.abs(targetY-assembly.rotation.y)>.001)frame=requestAnimationFrame(animate);
    }
    function move(x,y){
      targetX=reduced()?0:x;targetY=reduced()?0:y;
      if(reduced()){cancelAnimationFrame(frame);frame=0;assembly.rotation.set(0,0,0);left.position.y=-.6;right.position.y=-.6;draw();}
      else if(!frame)frame=requestAnimationFrame(animate);
    }
    button.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const box=button.getBoundingClientRect();move((event.clientY-box.top-box.height/2)/box.height*.18,(event.clientX-box.left-box.width/2)/box.width*.35);});
    button.addEventListener('pointerleave',()=>move(0,0));button.addEventListener('focus',()=>move(-.03,.12));button.addEventListener('blur',()=>move(0,0));
    const motion=matchMedia('(prefers-reduced-motion:reduce)');motion.addEventListener('change',()=>move(0,0));
    const preferences=new MutationObserver(()=>move(0,0));preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
    const resize=new ResizeObserver(()=>{const {width,height}=button.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();});resize.observe(button);
    canvas.hidden=false;fallback.hidden=true;button.dataset.model='ready';draw();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.hidden=true;fallback.hidden=false;fallback.textContent='View game availability';button.dataset.model='unavailable';});
    addEventListener('pagehide',event=>{if(event.persisted)return;cancelAnimationFrame(frame);resize.disconnect();preferences.disconnect();renderer.dispose();},{once:true});
  } catch {
    renderer?.dispose();canvas.hidden=true;fallback.hidden=false;fallback.textContent='View game availability';button.dataset.model='unavailable';
  }
}
