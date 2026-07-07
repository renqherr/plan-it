import type { AppState } from '../model/types';
import { loadState, saveState } from '../persistence/localCache';

/** 'local' = a user mutation (should sync out); 'remote' = hydrated from the cloud. */
export type ChangeOrigin = 'local' | 'remote';
type Listener = (state: AppState, origin: ChangeOrigin) => void;

const listeners = new Set<Listener>();
let state: AppState = loadState();

export function getState(): AppState {
  return state;
}

/** Apply an immutable user update: stamp `updatedAt`, persist, notify (local). */
export function setState(updater: (s: AppState) => AppState): void {
  state = { ...updater(state), updatedAt: new Date().toISOString() };
  saveState(state);
  emit('local');
}

/** Replace state with a remote snapshot: keep its `updatedAt`, persist, notify (remote). */
export function hydrate(remote: AppState): void {
  state = remote;
  saveState(state);
  emit('remote');
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(origin: ChangeOrigin): void {
  for (const fn of listeners) fn(state, origin);
}
