// Pointer spotlight and scroll reveals. Both are enhancements: without them every section is simply visible.
const root = document.documentElement;
const spotlight = '.home-update-card,.records>.card,.home-other-projects li,.home-themes a,.resource-links>a,.shelf-picker button';
document.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  const target = (event.target as Element | null)?.closest<HTMLElement>(spotlight);
  if (!target) return;
  const box = target.getBoundingClientRect();
  target.style.setProperty('--mx', `${Math.round(event.clientX - box.left)}px`);
  target.style.setProperty('--my', `${Math.round(event.clientY - box.top)}px`);
}, { passive: true });

if ('IntersectionObserver' in window && root.classList.contains('js')) {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.main-content > section'));
  const below = sections.filter((section) => section.getBoundingClientRect().top > window.innerHeight * 0.9);
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  below.forEach((section) => { section.classList.add('reveal'); observer.observe(section); });
}

// The ambient light takes the tone of whichever section is crossing the middle of the screen.
const tones = ['indigo', 'teal', 'amber', 'violet', 'teal'];
const toned = Array.from(document.querySelectorAll<HTMLElement>('.main-content > section'));
if ('IntersectionObserver' in window && toned.length) {
  const toneObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) root.dataset.tone = tones[toned.indexOf(entry.target as HTMLElement) % tones.length];
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  toned.forEach((section) => toneObserver.observe(section));
}

// Hero scene: a lazily loaded WebGL accent, skipped when motion is reduced or contrast is raised.
const hero = document.querySelector<HTMLElement>('.home-hero');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || root.dataset.reduceMotion === 'true' || root.dataset.highContrast === 'true';
if (hero && !calm) {
  const load = () => import('./hero-scene').then((scene) => scene.mountHeroScene(hero)).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1500 }); else setTimeout(load, 600);
}
