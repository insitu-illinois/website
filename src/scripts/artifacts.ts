export {};
// Hidden artifacts, the field journal and a small Easter egg. Everything is optional, stored only in this browser,
// and none of it gates any content.
type Artifact = { id: string; name: string; note: string; page: string; section: number; right: string; top: string; icon: string };

const svg = (inner: string) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
const ARTIFACTS: Artifact[] = [
  { id: 'headset', name: 'The headset', note: 'A passthrough relic from the early XR days.', page: '/', section: 1, right: '3%', top: '38%', icon: svg("<rect x='6' y='20' width='52' height='26' rx='10'/><circle cx='22' cy='33' r='6'/><circle cx='42' cy='33' r='6'/><path d='M26 20c2-4 10-4 12 0'/>") },
  { id: 'controller', name: 'The controller', note: 'Still warm. Someone was mid-level.', page: '/', section: 3, right: '5%', top: '58%', icon: svg("<path d='M16 22h32a12 12 0 0 1 12 12l-3 12a6 6 0 0 1-10 2l-4-6H21l-4 6a6 6 0 0 1-10-2L4 34a12 12 0 0 1 12-12z'/><path d='M20 30v8M16 34h8'/><circle cx='42' cy='32' r='2'/><circle cx='48' cy='36' r='2'/>") },
  { id: 'columns', name: 'The column', note: 'A fragment of a heritage site, digitally preserved.', page: '/about/', section: 1, right: '4%', top: '46%', icon: svg("<path d='M6 20L32 8l26 12'/><path d='M10 22h44M14 26v22M26 26v22M38 26v22M50 26v22M8 50h48'/>") },
  { id: 'compass', name: 'The compass', note: 'Points to wherever the research goes next.', page: '/people/', section: 0, right: '6%', top: '30%', icon: svg("<circle cx='32' cy='32' r='26'/><path d='M42 22L36 36 22 42l6-14z'/>") },
  { id: 'trowel', name: 'The trowel', note: 'Field-tested in a virtual cave.', page: '/projects/', section: 0, right: '5%', top: '55%', icon: svg("<path d='M38 10l16 16-14 14-16-16z'/><path d='M26 38L10 54M10 54h6M10 54v-6'/>") },
  { id: 'book', name: 'The field notebook', note: 'Dog-eared pages, mostly citations.', page: '/publications/', section: 0, right: '4%', top: '42%', icon: svg("<path d='M6 12c10-3 20-1 26 5 6-6 16-8 26-5v38c-10-3-20-1-26 5-6-6-16-8-26-5z'/><path d='M32 17v38'/>") },
  { id: 'mask', name: 'The mask', note: 'Found beside the news desk. Nobody asked.', page: '/news/', section: 0, right: '5%', top: '50%', icon: svg("<path d='M10 14c8-4 36-4 44 0v14c0 14-10 24-22 24S10 42 10 28z'/><path d='M20 26c3-2 7-2 10 1M34 27c3-3 7-3 10-1M24 40c5 4 11 4 16 0'/>") },
  { id: 'key', name: 'The key', note: 'It opens the door marked Join.', page: '/join/', section: 0, right: '6%', top: '40%', icon: svg("<circle cx='20' cy='32' r='10'/><path d='M30 32h28M50 32v8M42 32v6'/>") },
];
const KEY = 'insitu-artifacts', OFF = 'insitu-artifacts-off', FIELD = 'insitu-field-mode';
const root = document.documentElement;
const read = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string | null) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* storage unavailable: the game simply does not persist */ } };
const found = new Set<string>((() => { try { return JSON.parse(read(KEY) || '[]'); } catch { return []; } })());
const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && root.dataset.reduceMotion !== 'true';
const here = location.pathname.replace(/index\.html$/, '');

const counter = document.querySelector<HTMLButtonElement>('[data-journal-open]');
const count = document.querySelector<HTMLElement>('[data-journal-count]');
const dialog = document.querySelector<HTMLDialogElement>('[data-journal]');
const list = document.querySelector<HTMLElement>('[data-journal-list]');
const progress = document.querySelector<HTMLElement>('[data-journal-progress]');
const hint = document.querySelector<HTMLElement>('[data-journal-hint]');
const artifactToggle = document.querySelector<HTMLInputElement>('[data-artifacts-toggle]');
const eggRow = document.querySelector<HTMLElement>('[data-egg-row]');
const eggToggle = document.querySelector<HTMLInputElement>('[data-egg-toggle]');

const toast = document.createElement('div');
toast.className = 'play-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
document.body.append(toast);
let toastTimer = 0;
const say = (message: string) => {
  toast.textContent = message; toast.classList.add('show');
  window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
};

const fieldMode = (on: boolean) => {
  if (on) root.dataset.egg = 'field'; else delete root.dataset.egg;
  write(FIELD, on ? '1' : null);
  if (eggToggle) eggToggle.checked = on;
};
const eggUnlocked = () => read('insitu-egg-found') === '1';
const unlockEgg = () => { write('insitu-egg-found', '1'); if (eggRow) eggRow.hidden = false; };

const render = () => {
  if (!counter || !count) return;
  counter.hidden = false;
  count.textContent = `${found.size}/${ARTIFACTS.length}`;
  counter.setAttribute('aria-label', `Field journal: ${found.size} of ${ARTIFACTS.length} artifacts found`);
  if (list) list.innerHTML = ARTIFACTS.map((a) => found.has(a.id)
    ? `<li class="found"><span class="journal-icon">${a.icon}</span><span><strong>${a.name}</strong><br>${a.note}</span></li>`
    : `<li><span class="journal-icon dim">${a.icon}</span><span><strong>Not found yet</strong><br>Look around ${a.page === '/' ? 'the home page' : 'the ' + a.page.replaceAll('/', '') + ' page'}.</span></li>`).join('');
  if (progress) progress.textContent = found.size === ARTIFACTS.length
    ? 'Every artifact found. Field notes complete.' : `${found.size} of ${ARTIFACTS.length} artifacts found. They hide in the margins of the pages.`;
  if (hint) hint.textContent = found.size === ARTIFACTS.length || eggUnlocked() ? 'A rumour says the slash in the logo has secrets. Try it seven times.' : '';
  if (eggRow) eggRow.hidden = !eggUnlocked();
  if (eggToggle) eggToggle.checked = root.dataset.egg === 'field';
};

const burst = (from: DOMRect) => {
  if (!motion() || !counter) return;
  const to = counter.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'artifact-fly';
  dot.style.cssText = `left:${from.left + from.width / 2}px;top:${from.top + from.height / 2}px`;
  document.body.append(dot);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
  dot.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.3)`, opacity: .2 }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished
    .then(() => { dot.remove(); counter.classList.remove('pop'); void counter.offsetWidth; counter.classList.add('pop'); }).catch(() => dot.remove());
};

const collect = (artifact: Artifact, button: HTMLButtonElement) => {
  if (found.has(artifact.id)) return;
  found.add(artifact.id); write(KEY, JSON.stringify([...found]));
  burst(button.getBoundingClientRect());
  button.classList.add('collected'); button.disabled = true;
  render();
  if (found.size === ARTIFACTS.length) { unlockEgg(); render(); say('All artifacts found. Open the field journal for a secret.'); }
  else say(`Artifact found: ${artifact.name} (${found.size}/${ARTIFACTS.length})`);
};

const place = () => {
  document.querySelectorAll('.artifact').forEach((el) => el.remove());
  if (read(OFF) === '1') return;
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.main-content > section'));
  for (const artifact of ARTIFACTS.filter((a) => a.page === here)) {
    const host = sections[artifact.section] || sections[0];
    if (!host) continue;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'artifact';
    button.style.cssText = `right:${artifact.right};top:${artifact.top}`;
    button.innerHTML = artifact.icon;
    button.setAttribute('aria-label', found.has(artifact.id) ? `${artifact.name}, already collected` : `Hidden artifact: ${artifact.name}. Collect it`);
    if (found.has(artifact.id)) { button.classList.add('collected'); button.disabled = true; }
    button.addEventListener('click', () => collect(artifact, button));
    host.append(button);
  }
};

counter?.addEventListener('click', () => { render(); dialog?.showModal(); });
dialog?.querySelector('[data-journal-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
artifactToggle?.addEventListener('change', () => { write(OFF, artifactToggle.checked ? null : '1'); place(); });
eggToggle?.addEventListener('change', () => fieldMode(eggToggle.checked));
if (artifactToggle) artifactToggle.checked = read(OFF) !== '1';

// Easter egg: seven quick clicks on the slash in the logo, or the classic Konami code.
let clicks = 0, clickTimer = 0;
document.addEventListener('click', (event) => {
  const slash = (event.target as Element | null)?.closest('.wordmark span');
  if (!slash) return;
  event.preventDefault(); event.stopPropagation();
  clicks += 1; window.clearTimeout(clickTimer); clickTimer = window.setTimeout(() => { clicks = 0; }, 2500);
  (slash as HTMLElement).animate([{ transform: 'rotate(0)' }, { transform: `rotate(${clicks * 51}deg) scale(1.25)` }], { duration: 260, fill: 'forwards' });
  if (clicks >= 7) { clicks = 0; unlockEgg(); const on = root.dataset.egg !== 'field'; fieldMode(on); render(); say(on ? 'Field mode unlocked. Hello, researcher.' : 'Field mode off.'); }
}, true);
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let step = 0;
document.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement | null;
  if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
  step = event.key.toLowerCase() === konami[step].toLowerCase() ? step + 1 : (event.key === konami[0] ? 1 : 0);
  if (step === konami.length) { step = 0; unlockEgg(); const on = root.dataset.egg !== 'field'; fieldMode(on); render(); say(on ? 'Field mode unlocked. Hello, researcher.' : 'Field mode off.'); }
});

render();
place();
