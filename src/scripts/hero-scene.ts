// @ts-nocheck -- three ships no type declarations in this project (quest-viewer.mjs is untyped too).
import * as THREE from 'three';

// A faint, slowly turning wireframe with a halo of points behind the home hero. Decorative only.
export function mountHeroScene(hero: HTMLElement): void {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
  const canvas = renderer.domElement;
  canvas.className = 'hero-scene';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 7);
  const group = new THREE.Group();
  scene.add(group);

  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 }));
  const core = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.15, 0)), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }));
  const count = 520;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * 2.399963;
    const reach = 2.75 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.7;
    positions.set([Math.cos(angle) * radius * reach, y * reach, Math.sin(angle) * radius * reach], i * 3);
  }
  const cloudGeometry = new THREE.BufferGeometry();
  cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const cloud = new THREE.Points(cloudGeometry, new THREE.PointsMaterial({ size: 0.045, transparent: true, opacity: 0.75, sizeAttenuation: true }));
  group.add(wire, core, cloud);

  const paint = () => {
    const light = document.documentElement.dataset.theme === 'light';
    (wire.material as THREE.LineBasicMaterial).color.set(light ? '#3451d1' : '#7c9cff');
    (core.material as THREE.LineBasicMaterial).color.set(light ? '#0b8f84' : '#5eead4');
    (cloud.material as THREE.PointsMaterial).color.set(light ? '#7c4dff' : '#a9bdff');
  };
  paint();
  document.addEventListener('insitu:preferences', paint);

  const size = () => {
    const box = hero.getBoundingClientRect();
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
    const halfWidth = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    group.position.x = box.width > 760 ? halfWidth * 0.58 : 0;
    group.scale.setScalar(box.width > 760 ? 1 : 0.8);
  };
  size();
  new ResizeObserver(size).observe(hero);

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(hero);
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    wire.rotation.y += 0.0032; wire.rotation.x += 0.0011;
    core.rotation.y -= 0.0055; core.rotation.z += 0.0021;
    cloud.rotation.y -= 0.0012;
    group.rotation.y += (pointer.x * 0.5 - group.rotation.y) * 0.02;
    group.rotation.x += (pointer.y * 0.3 - group.rotation.x) * 0.02;
    renderer.render(scene, camera);
  };
  tick();
  requestAnimationFrame(() => canvas.classList.add('ready'));
}
