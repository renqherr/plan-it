import { el } from '../lib/dom';
import { t } from '../i18n/i18n';
import { TaskItem } from './TaskItem';
import { openTaskEditor } from './TaskEditor';
import { bySchedule } from '../state/selectors';
import type { Task } from '../model/types';

/** Renders active tasks (schedule-sorted) plus a collapsible completed section.
 *  Returns an array of nodes to append into a view's content. */
export function taskSections(tasks: Task[]): HTMLElement[] {
  const active = tasks.filter((task) => !task.completed).sort(bySchedule);
  const done = tasks.filter((task) => task.completed);
  const nodes: HTMLElement[] = [];

  if (active.length) {
    nodes.push(el('ul', { class: 'task-list' }, active.map((task) => TaskItem(task, openTaskEditor))));
  }
  if (done.length) {
    nodes.push(
      el('h2', { class: 'section-label' }, [`${t('today.completed')} · ${done.length}`]),
      el('ul', { class: 'task-list' }, done.map((task) => TaskItem(task, openTaskEditor))),
    );
  }
  return nodes;
}
