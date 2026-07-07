/** Tiny hash-based router — works on GitHub Pages without server rewrites. */

export type Route = 'today' | 'groups' | 'favorites' | 'sync';

const ROUTES: Route[] = ['today', 'groups', 'favorites', 'sync'];

export function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '') as Route;
  return ROUTES.includes(hash) ? hash : 'today';
}

export function navigate(route: Route): void {
  window.location.hash = `/${route}`;
}

export function onRouteChange(handler: (route: Route) => void): void {
  window.addEventListener('hashchange', () => handler(currentRoute()));
}
