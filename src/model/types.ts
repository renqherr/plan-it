export interface Task {
  id: string;
  title: string;
  notes?: string;
  groupId: string | null;
  tagIds: string[];
  scheduledAt: string | null; // ISO date/time
  completed: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  version: number;
  updatedAt: string; // ISO — used for last-write-wins
  tasks: Task[];
  groups: Group[];
  tags: Tag[];
}

/** Credentials for the shared jsonbin bin. Encoded (encrypted) into the QR in Phase 4. */
export interface SyncConfig {
  binId: string;
  accessKey: string;
  v: number; // config format version
}
