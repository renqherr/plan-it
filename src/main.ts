import './styles/app.css';
import { el, clear } from './lib/dom';
import { BottomNav } from './components/BottomNav';
import { renderPlaceholder } from './views/placeholder';
import { renderToday } from './views/TodayView';
import { renderFavorites } from './views/FavoritesView';
import { renderGroups, renderGroupDetail } from './views/GroupsView';
import { renderSync } from './views/SyncView';
import { currentRoute, onRouteChange, type Route } from './router';
import { onLangChange } from './i18n/i18n';
import { subscribe } from './state/store';
import { onRerender } from './lib/rerender';
import { initSync } from './sync/sync';

const root = document.getElementById('app');
if (!root) throw new Error('#app root not found');

function viewFor(route: Route): { header: HTMLElement; content: HTMLElement } {
  switch (route.tab) {
    case 'today':
      return renderToday();
    case 'favorites':
      return renderFavorites();
    case 'groups':
      return route.groupId ? renderGroupDetail(route.groupId) : renderGroups();
    case 'sync':
      return renderSync();
    default:
      return renderPlaceholder(route.tab);
  }
}

function render(route: Route): void {
  const { header, content } = viewFor(route);
  const shell = el('div', { class: 'shell' }, [header, content]);

  clear(root!);
  root!.append(shell, BottomNav(route.tab));
}

render(currentRoute());
onRouteChange(render);
onLangChange(() => render(currentRoute()));
subscribe(() => render(currentRoute()));
onRerender(() => render(currentRoute()));

// Kick off cloud sync (no-op until a bin is configured).
initSync();
