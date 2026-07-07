import { el } from '../lib/dom';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { taskSections } from '../components/TaskList';
import { openTaskEditor } from '../components/TaskEditor';
import { pageHeader } from '../components/PageHeader';
import { fabLayer } from '../components/Fab';
import { emptyState } from '../components/EmptyState';
import { rerender } from '../lib/rerender';

// View-local filter state: null = all, otherwise a tag id.
let activeTagFilter: string | null = null;

export function renderToday(): { header: HTMLElement; content: HTMLElement } {
  const header = pageHeader({ title: t('today.title'), subtitle: t('today.subtitle') });

  const { tasks, tags } = getState();

  // Drop a stale filter if its tag was deleted.
  if (activeTagFilter && !tags.some((tag) => tag.id === activeTagFilter)) {
    activeTagFilter = null;
  }

  const content = el('main', { class: 'shell__content' }, []);

  if (tags.length) content.append(tagFilterBar(tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))));

  const visible = activeTagFilter
    ? tasks.filter((task) => task.tagIds.includes(activeTagFilter as string))
    : tasks;

  if (tasks.length === 0) {
    content.append(emptyState('📋', t('today.empty')));
  } else if (visible.length === 0) {
    content.append(emptyState('🔍', t('today.noMatch')));
  } else {
    for (const node of taskSections(visible)) content.append(node);
  }

  content.append(fabLayer(t('action.add'), () => openTaskEditor()));
  return { header, content };
}

function tagFilterBar(tags: { id: string; name: string; color: string }[]): HTMLElement {
  const chip = (id: string | null, label: string, color?: string) =>
    el(
      'button',
      {
        class: `filter-chip${activeTagFilter === id ? ' is-active' : ''}`,
        style: color ? `--chip:${color}` : false,
        onClick: () => {
          activeTagFilter = id;
          rerender();
        },
      },
      [label],
    );

  return el('div', { class: 'filter-bar' }, [
    chip(null, t('filter.all')),
    ...tags.map((tag) => chip(tag.id, tag.name, tag.color)),
  ]);
}
