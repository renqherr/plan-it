import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { toggleComplete, toggleFavorite } from '../state/actions';
import { groupById, tagsByIds } from '../state/selectors';
import { formatSchedule, isOverdue } from '../lib/date';
import type { Task } from '../model/types';

/** A single task row: complete toggle · title/notes/meta (tap to edit) · favorite star. */
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

  const bodyChildren: (Node | string)[] = [el('span', { class: 'task__title' }, [task.title])];
  if (task.notes) bodyChildren.push(el('span', { class: 'task__notes' }, [task.notes]));

  const meta = buildMeta(task);
  if (meta) bodyChildren.push(meta);

  const body = el('div', { class: 'task__body' }, bodyChildren);

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

function buildMeta(task: Task): HTMLElement | null {
  const parts: HTMLElement[] = [];

  if (task.scheduledAt) {
    const overdue = !task.completed && isOverdue(task.scheduledAt);
    parts.push(
      el('span', { class: `task__schedule${overdue ? ' is-overdue' : ''}` }, [
        formatSchedule(task.scheduledAt),
      ]),
    );
  }

  const group = groupById(task.groupId);
  if (group) {
    parts.push(
      el('span', { class: 'task__group' }, [
        el('span', { class: 'dot', style: `background:${group.color}` }, []),
        group.name,
      ]),
    );
  }

  for (const tag of tagsByIds(task.tagIds)) {
    parts.push(el('span', { class: 'tag-chip', style: `--chip:${tag.color}` }, [tag.name]));
  }

  return parts.length ? el('div', { class: 'task__meta' }, parts) : null;
}
