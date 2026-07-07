import { getState, setState } from './store';
import type { Group, Tag, Task } from '../model/types';
import { uuid } from '../lib/uuid';
import { nextColor } from '../lib/palette';

export interface TaskInput {
  title: string;
  notes?: string;
  groupId?: string | null;
  tagIds?: string[];
  scheduledAt?: string | null;
}

export function addTask(input: TaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuid(),
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    groupId: input.groupId ?? null,
    tagIds: input.tagIds ?? [],
    scheduledAt: input.scheduledAt ?? null,
    completed: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    order: getState().tasks.length,
  };
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
  return task;
}

function patchTask(id: string, patch: Partial<Task>): void {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)),
  }));
}

export function updateTask(id: string, input: TaskInput): void {
  patchTask(id, {
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    groupId: input.groupId ?? null,
    tagIds: input.tagIds ?? [],
    scheduledAt: input.scheduledAt ?? null,
  });
}

export function toggleComplete(id: string): void {
  const task = getState().tasks.find((t) => t.id === id);
  if (task) patchTask(id, { completed: !task.completed });
}

export function toggleFavorite(id: string): void {
  const task = getState().tasks.find((t) => t.id === id);
  if (task) patchTask(id, { favorite: !task.favorite });
}

export function deleteTask(id: string): void {
  setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
}

/* ---- Groups ---- */

export function addGroup(name: string, color?: string): Group {
  const group: Group = {
    id: uuid(),
    name: name.trim(),
    color: color ?? nextColor(getState().groups.length),
    order: getState().groups.length,
  };
  setState((s) => ({ ...s, groups: [...s.groups, group] }));
  return group;
}

export function updateGroup(id: string, patch: Partial<Pick<Group, 'name' | 'color'>>): void {
  setState((s) => ({
    ...s,
    groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }));
}

/** Delete a group and unassign it from any tasks. */
export function deleteGroup(id: string): void {
  setState((s) => ({
    ...s,
    groups: s.groups.filter((g) => g.id !== id),
    tasks: s.tasks.map((t) => (t.groupId === id ? { ...t, groupId: null } : t)),
  }));
}

/* ---- Tags ---- */

export function addTag(name: string, color?: string): Tag {
  const tag: Tag = {
    id: uuid(),
    name: name.trim(),
    color: color ?? nextColor(getState().tags.length),
  };
  setState((s) => ({ ...s, tags: [...s.tags, tag] }));
  return tag;
}

export function updateTag(id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>): void {
  setState((s) => ({
    ...s,
    tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

/** Delete a tag and remove it from any tasks that referenced it. */
export function deleteTag(id: string): void {
  setState((s) => ({
    ...s,
    tags: s.tags.filter((t) => t.id !== id),
    tasks: s.tasks.map((t) =>
      t.tagIds.includes(id) ? { ...t, tagIds: t.tagIds.filter((tid) => tid !== id) } : t,
    ),
  }));
}
