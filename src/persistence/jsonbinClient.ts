import type { AppState, SyncConfig } from '../model/types';

const BASE = 'https://api.jsonbin.io/v3';

export type SyncErrorKind = 'auth' | 'notfound' | 'network' | 'server' | 'bad-data';

export class SyncError extends Error {
  constructor(
    public kind: SyncErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

function headers(config: SyncConfig): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Access-Key': config.accessKey,
  };
}

async function request(url: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // Fetch rejects on network failure / offline / CORS.
    throw new SyncError('network', 'Network request failed');
  }
  if (res.status === 401 || res.status === 403) {
    throw new SyncError('auth', 'Invalid access key');
  }
  if (res.status === 404) {
    throw new SyncError('notfound', 'Bin not found');
  }
  if (!res.ok) {
    throw new SyncError('server', `Server error (${res.status})`);
  }
  return res;
}

/** Read the latest record from the bin. */
export async function readBin(config: SyncConfig): Promise<AppState> {
  const res = await request(`${BASE}/b/${config.binId}/latest`, {
    method: 'GET',
    headers: headers(config),
  });
  const json = (await res.json()) as { record?: unknown };
  const record = json.record;
  if (!record || typeof record !== 'object' || !Array.isArray((record as AppState).tasks)) {
    throw new SyncError('bad-data', 'Remote data is not a valid Plan-It state');
  }
  return record as AppState;
}

/** Overwrite the bin with the given state. */
export async function writeBin(config: SyncConfig, state: AppState): Promise<void> {
  await request(`${BASE}/b/${config.binId}`, {
    method: 'PUT',
    headers: headers(config),
    body: JSON.stringify(state),
  });
}
