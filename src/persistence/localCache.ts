import type { AppState } from '../model/types';

const KEY = 'plan-it:state';
export const SCHEMA_VERSION = 1;

export function emptyState(): AppState {
  return {
    version: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    tasks: [],
    groups: [],
    tags: [],
  };
}

/** Load state from localStorage, tolerating missing/corrupt data. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || !Array.isArray(parsed.tasks)) return emptyState();
    // Merge over an empty base so newly-added fields always exist.
    return { ...emptyState(), ...parsed } as AppState;
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota or private-mode failures are non-fatal; in-memory state still works.
  }
}
