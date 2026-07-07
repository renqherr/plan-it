import type { AppState } from '../model/types';
import { loadState, saveState } from '../persistence/localCache';

type Listener = (state: AppState) => void;

const listeners = new Set<Listener>();
let state: AppState = loadState();

export function getState(): AppState {
  return state;
}

/** Apply an immutable update, stamp `updatedAt`, persist, and notify. */
export function setState(updater: (s: AppState) => AppState): void {
  state = { ...updater(state), updatedAt: new Date().toISOString() };
  saveState(state);
  for (const fn of listeners) fn(state);
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
