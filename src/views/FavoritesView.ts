import { el } from '../lib/dom';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { taskSections } from '../components/TaskList';
import { pageHeader } from '../components/PageHeader';
import { emptyState } from '../components/EmptyState';

export function renderFavorites(): { header: HTMLElement; content: HTMLElement } {
  const header = pageHeader({ title: t('favorites.title'), subtitle: t('favorites.subtitle') });

  const favorites = getState().tasks.filter((task) => task.favorite);
  const content = el('main', { class: 'shell__content' }, []);

  if (favorites.length === 0) {
    content.append(emptyState('⭐', t('favorites.empty')));
  } else {
    for (const node of taskSections(favorites)) content.append(node);
  }

  return { header, content };
}
