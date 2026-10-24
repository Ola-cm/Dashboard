import { useSyncExternalStore } from 'react';

const THEME_KEY = 'dashboard-theme';
const WALLPAPER_KEY = 'dashboard-wallpaper';
export const THEMES = ['light', 'dark', 'spider', 'cherry'];
const DEFAULT_THEME = 'light';

// Module-level store rather than per-component state: the sidebar's theme button and the Theme
// page are mounted at the same time, and both have to reflect a change made from either one.
let state = { theme: readTheme(), wallpaper: readWallpaper() };
const listeners = new Set();

function readTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Private browsing / blocked storage — fall back to the default theme instead of crashing.
    return DEFAULT_THEME;
  }
}

function readWallpaper() {
  try {
    return localStorage.getItem(WALLPAPER_KEY);
  } catch {
    return null;
  }
}

function apply({ theme, wallpaper }) {
  const root = document.documentElement;
  if (theme === DEFAULT_THEME) {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  if (wallpaper) {
    root.setAttribute('data-wallpaper', 'custom');
    root.style.setProperty('--custom-wallpaper', `url("${wallpaper}")`);
  } else {
    root.removeAttribute('data-wallpaper');
    root.style.removeProperty('--custom-wallpaper');
  }
}

function update(patch) {
  state = { ...state, ...patch };
  apply(state);
  listeners.forEach((listener) => listener());
}

apply(state);

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Nothing to persist to if storage is unavailable — the theme still applies for this visit.
  }
  update({ theme });
}

export function cycleTheme() {
  setTheme(THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length]);
}

// Throws if the browser refuses to store it (quota exceeded) so the caller can tell the user,
// instead of the wallpaper silently vanishing on the next page load.
export function setWallpaper(dataUrl) {
  localStorage.setItem(WALLPAPER_KEY, dataUrl);
  update({ wallpaper: dataUrl });
}

export function clearWallpaper() {
  try {
    localStorage.removeItem(WALLPAPER_KEY);
  } catch {
    // Already effectively cleared if storage is unavailable.
  }
  update({ wallpaper: null });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, () => state);
  return { ...current, setTheme, cycleTheme, setWallpaper, clearWallpaper };
}
