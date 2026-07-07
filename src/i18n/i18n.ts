import { dict, type Lang, type TKey } from './translations';

const STORAGE_KEY = 'plan-it:lang';
const listeners = new Set<() => void>();

function detect(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'es') return saved;
  // Fall back to the browser preference, defaulting to English.
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

let current: Lang = detect();
document.documentElement.lang = current;

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach((fn) => fn());
}

/** Subscribe to language changes; returns an unsubscribe function. */
export function onLangChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a key for the active language, falling back to English then the key. */
export function t(key: TKey): string {
  return dict[current][key] ?? dict.en[key] ?? key;
}
