import './styles/app.css';
import { el, clear } from './lib/dom';
import { BottomNav } from './components/BottomNav';
import { renderView } from './views/placeholder';
import { renderToday } from './views/TodayView';
import { currentRoute, onRouteChange, type Route } from './router';
import { onLangChange } from './i18n/i18n';
import { subscribe } from './state/store';

const root = document.getElementById('app');
if (!root) throw new Error('#app root not found');

function viewFor(route: Route): { header: HTMLElement; content: HTMLElement } {
  return route === 'today' ? renderToday() : renderView(route);
}

function render(route: Route): void {
  const { header, content } = viewFor(route);
  const shell = el('div', { class: 'shell' }, [header, content]);

  clear(root!);
  root!.append(shell, BottomNav(route));
}

render(currentRoute());
onRouteChange(render);
onLangChange(() => render(currentRoute()));
subscribe(() => render(currentRoute()));
