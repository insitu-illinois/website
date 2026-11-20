// Apply preferences before the page is painted. Storage may be unavailable.
// The theme follows the device's light/dark setting until the visitor presses the night-mode toggle;
// only then is a theme saved, and from then on the saved choice wins.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const system = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  const followSystem = () => { root.dataset.theme = system && system.matches ? 'night' : 'light'; };
  let preferences = {};
  try {
    preferences = JSON.parse(localStorage.getItem('insitu-accessibility') || '{}') || {};
    if (localStorage.getItem('insitu-field-mode') === '1') root.dataset.egg = 'field';
  } catch { preferences = {}; }
  if (preferences.theme === 'light' || preferences.theme === 'night') {
    root.dataset.theme = preferences.theme;
    root.dataset.themeChosen = 'true';
  } else followSystem();
  if (['125', '150', '200'].includes(preferences.textSize)) root.dataset.textSize = preferences.textSize;
  if (preferences.reduceMotion === true) root.dataset.reduceMotion = 'true';
  if (preferences.highContrast === true) root.dataset.highContrast = 'true';
  // While no choice is saved, keep matching the device if its setting changes during the visit.
  if (system && system.addEventListener) system.addEventListener('change', () => {
    if (root.dataset.themeChosen === 'true') return;
    followSystem();
    document.dispatchEvent(new Event('insitu:preferences'));
  });
})();
