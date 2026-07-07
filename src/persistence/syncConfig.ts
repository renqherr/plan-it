import type { SyncConfig } from '../model/types';

const KEY = 'plan-it:sync';
export const CONFIG_VERSION = 1;

export function loadConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SyncConfig>;
    if (!parsed.binId || !parsed.accessKey) return null;
    return { binId: parsed.binId, accessKey: parsed.accessKey, v: parsed.v ?? CONFIG_VERSION };
  } catch {
    return null;
  }
}

export function saveConfig(config: SyncConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(KEY);
}
