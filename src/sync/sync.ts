import type { AppState, SyncConfig } from '../model/types';
import { getState, hydrate, subscribe, type ChangeOrigin } from '../state/store';
import { readBin, writeBin, SyncError } from '../persistence/jsonbinClient';
import { loadConfig, saveConfig, clearConfig } from '../persistence/syncConfig';
import { setStatus } from './status';
import { debounce } from '../lib/debounce';

const PUSH_DEBOUNCE_MS = 1500;

let config: SyncConfig | null = null;

const schedulePush = debounce(() => {
  void push();
}, PUSH_DEBOUNCE_MS);

/** Map a thrown error to a status update and rethrow-free return. */
function reportError(err: unknown): void {
  if (err instanceof SyncError && err.kind === 'network') {
    setStatus({ state: 'offline' });
  } else if (err instanceof SyncError) {
    setStatus({ state: 'error', message: err.message });
  } else {
    setStatus({ state: 'error', message: 'Unexpected sync error' });
  }
}

async function push(): Promise<void> {
  if (!config) return;
  setStatus({ state: 'syncing' });
  try {
    await writeBin(config, getState());
    setStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() });
  } catch (err) {
    reportError(err);
  }
}

/**
 * Reconcile local and remote via whole-state last-write-wins:
 * newer `updatedAt` wins. If the bin is empty/new (404), seed it with local.
 */
async function pullAndMerge(): Promise<void> {
  if (!config) return;
  setStatus({ state: 'syncing' });
  try {
    let remote: AppState;
    try {
      remote = await readBin(config);
    } catch (err) {
      if (err instanceof SyncError && err.kind === 'notfound') {
        // Fresh bin — initialize it from local state.
        await writeBin(config, getState());
        setStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() });
        return;
      }
      throw err;
    }

    const local = getState();
    if (Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)) {
      hydrate(remote); // remote is newer — adopt it
    } else if (Date.parse(local.updatedAt) > Date.parse(remote.updatedAt)) {
      await writeBin(config, local); // local is newer — push it up
    }
    setStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() });
  } catch (err) {
    reportError(err);
  }
}

/** Wire store changes to a debounced push, and react to connectivity changes. */
function attachListeners(): void {
  subscribe((_state: AppState, origin: ChangeOrigin) => {
    if (origin === 'local' && config) schedulePush();
  });
  window.addEventListener('online', () => {
    if (config) void pullAndMerge();
  });
}

/** Call once on startup. Loads any saved config and performs an initial sync. */
export function initSync(): void {
  attachListeners();
  config = loadConfig();
  if (!config) {
    setStatus({ state: 'disconnected' });
    return;
  }
  if (!navigator.onLine) {
    setStatus({ state: 'offline' });
    return;
  }
  void pullAndMerge();
}

/**
 * Connect to a bin: validate credentials by reading (or seeding a fresh bin),
 * merge, and only persist the config once it is known good. On failure the
 * config is left unset so the UI stays on the connect form.
 */
export async function connect(next: SyncConfig): Promise<void> {
  setStatus({ state: 'syncing' });
  const local = getState();
  try {
    let remote: AppState | null = null;
    try {
      remote = await readBin(next);
    } catch (err) {
      if (err instanceof SyncError && err.kind === 'notfound') {
        await writeBin(next, local); // seed a fresh/empty bin
      } else {
        throw err;
      }
    }

    // Credentials are valid — commit the config.
    config = next;
    saveConfig(next);

    if (remote && Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)) {
      hydrate(remote);
    } else if (remote && Date.parse(local.updatedAt) > Date.parse(remote.updatedAt)) {
      await writeBin(next, local);
    }
    setStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() });
  } catch (err) {
    reportError(err);
  }
}

export function disconnect(): void {
  schedulePush.cancel();
  config = null;
  clearConfig();
  setStatus({ state: 'disconnected' });
}

/** Manual "sync now" — flush any pending push, then reconcile. */
export async function syncNow(): Promise<void> {
  if (!config) return;
  await pullAndMerge();
}

export function isConnected(): boolean {
  return config !== null;
}
