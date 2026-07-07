import { getState, setState } from './store';
import type { Task } from '../model/types';
import { uuid } from '../lib/uuid';

export interface TaskInput {
  title: string;
  notes?: string;
}

export function addTask(input: TaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuid(),
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    groupId: null,
    tagIds: [],
    scheduledAt: null,
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
