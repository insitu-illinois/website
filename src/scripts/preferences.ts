// Both sets of controls persist the complete current state, so neither erases the other.
// The theme is stored only once the visitor has chosen it with the night-mode toggle.
export function savePreferences(reset = false): boolean {
  const root = document.documentElement;
  if (reset) {
    delete root.dataset.themeChosen;
    root.dataset.theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'light';
  }
  let saved = true;
  try {
    if (reset) localStorage.removeItem('insitu-accessibility');
    else localStorage.setItem('insitu-accessibility', JSON.stringify({
      textSize: root.dataset.textSize || '100',
      reduceMotion: root.dataset.reduceMotion === 'true',
      highContrast: root.dataset.highContrast === 'true',
      ...(root.dataset.themeChosen === 'true' ? { theme: root.dataset.theme === 'night' ? 'night' : 'light' } : {}),
    }));
  } catch { saved = false; }
  document.dispatchEvent(new Event('insitu:preferences'));
  return saved;
}
