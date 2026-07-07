export type SyncState = 'disconnected' | 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncStatus {
  state: SyncState;
  /** Error message key/text for the 'error' state. */
  message?: string;
  /** ISO time of the last successful sync. */
  lastSyncedAt?: string;
}

let status: SyncStatus = { state: 'disconnected' };
const listeners = new Set<(s: SyncStatus) => void>();

export function getStatus(): SyncStatus {
  return status;
}

export function setStatus(next: Partial<SyncStatus> & { state: SyncState }): void {
  status = { ...status, ...next };
  for (const fn of listeners) fn(status);
}

export function onStatusChange(fn: (s: SyncStatus) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
