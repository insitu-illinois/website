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
