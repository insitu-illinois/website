// Apply saved preferences before the page is painted. Storage may be unavailable.
(() => {
  try {
    const preferences = JSON.parse(localStorage.getItem('insitu-accessibility') || '{}');
    const root = document.documentElement;
    if (['125', '150', '200'].includes(preferences.textSize)) root.dataset.textSize = preferences.textSize;
    if (preferences.reduceMotion === true) root.dataset.reduceMotion = 'true';
    if (preferences.highContrast === true) root.dataset.highContrast = 'true';
  } catch { /* The default presentation remains usable. */ }
})();
