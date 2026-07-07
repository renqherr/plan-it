import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { TaskItem } from '../components/TaskItem';
import { openTaskEditor } from '../components/TaskEditor';
import { LanguageToggle } from '../components/LanguageToggle';

export function renderToday(): { header: HTMLElement; content: HTMLElement } {
  const header = el('header', { class: 'shell__header' }, [
    el('div', { class: 'shell__titles' }, [
      el('h1', { class: 'shell__title' }, [t('today.title')]),
      el('p', { class: 'shell__subtitle' }, [t('today.subtitle')]),
    ]),
    LanguageToggle(),
  ]);

  const tasks = getState().tasks;
  const active = tasks.filter((task) => !task.completed);
  const done = tasks.filter((task) => task.completed);

  const content = el('main', { class: 'shell__content' }, []);

  if (tasks.length === 0) {
    content.append(
      el('div', { class: 'empty-state' }, [
        el('div', { class: 'empty-state__emoji' }, ['📋']),
        el('p', {}, [t('today.empty')]),
      ]),
    );
  } else {
    if (active.length) {
      content.append(el('ul', { class: 'task-list' }, active.map((task) => TaskItem(task, openTaskEditor))));
    }
    if (done.length) {
      content.append(
        el('h2', { class: 'section-label' }, [`${t('today.completed')} · ${done.length}`]),
        el('ul', { class: 'task-list' }, done.map((task) => TaskItem(task, openTaskEditor))),
      );
    }
  }

  // Floating action button, anchored to the app column (same centering trick as the nav).
  const fab = el(
    'button',
    { class: 'fab', 'aria-label': t('action.add'), onClick: () => openTaskEditor() },
    [svg(ui.plus('fab__icon'))],
  );
  content.append(el('div', { class: 'fab-layer' }, [fab]));

  return { header, content };
}
