import { getState } from './store';
import type { Group, Tag, Task } from '../model/types';
import { scheduleSortKey } from '../lib/date';

export function groupById(id: string | null): Group | undefined {
  if (!id) return undefined;
  return getState().groups.find((g) => g.id === id);
}

export function tagsByIds(ids: string[]): Tag[] {
  const all = getState().tags;
  return ids.map((id) => all.find((t) => t.id === id)).filter((t): t is Tag => Boolean(t));
}

export function countTasksInGroup(groupId: string): number {
  return getState().tasks.filter((t) => t.groupId === groupId && !t.completed).length;
}

/** Sort tasks by schedule (soonest first), unscheduled last, newest-created as tiebreak. */
export function bySchedule(a: Task, b: Task): number {
  const ka = scheduleSortKey(a.scheduledAt);
  const kb = scheduleSortKey(b.scheduledAt);
  if (ka !== kb) return ka - kb;
  return b.createdAt.localeCompare(a.createdAt);
}
