import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { toggleComplete, toggleFavorite } from '../state/actions';
import type { Task } from '../model/types';

/** A single task row: complete toggle · title/notes (tap to edit) · favorite star. */
export function TaskItem(task: Task, onEdit: (id: string) => void): HTMLElement {
  const checkbox = el(
    'button',
    {
      class: 'task__check',
      'aria-label': task.completed ? t('task.incomplete') : t('task.complete'),
      'aria-pressed': task.completed,
      onClick: (e: Event) => {
        e.stopPropagation();
        toggleComplete(task.id);
      },
    },
    [svg(task.completed ? ui.check('task__icon') : ui.circle('task__icon'))],
  );

  const body = el('div', { class: 'task__body' }, [
    el('span', { class: 'task__title' }, [task.title]),
    ...(task.notes ? [el('span', { class: 'task__notes' }, [task.notes])] : []),
  ]);

  const star = el(
    'button',
    {
      class: `task__star${task.favorite ? ' is-active' : ''}`,
      'aria-label': task.favorite ? t('task.unfavorite') : t('task.favorite'),
      'aria-pressed': task.favorite,
      onClick: (e: Event) => {
        e.stopPropagation();
        toggleFavorite(task.id);
      },
    },
    [svg(ui.star('task__icon', task.favorite))],
  );

  return el(
    'li',
    {
      class: `task${task.completed ? ' is-completed' : ''}`,
      onClick: () => onEdit(task.id),
    },
    [checkbox, body, star],
  );
}
