/** Tiny hash-based router — works on GitHub Pages without server rewrites. */

export type Tab = 'today' | 'groups' | 'favorites' | 'sync';

export interface Route {
  tab: Tab;
  /** Set when viewing a single group's detail (nested under the Groups tab). */
  groupId?: string;
}

const TABS: Tab[] = ['today', 'groups', 'favorites', 'sync'];

export function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [seg, param] = hash.split('/');
  if (seg === 'group' && param) return { tab: 'groups', groupId: param };
  return { tab: (TABS as string[]).includes(seg) ? (seg as Tab) : 'today' };
}

export function navigate(tab: Tab): void {
  window.location.hash = `/${tab}`;
}

export function navigateGroup(id: string): void {
  window.location.hash = `/group/${id}`;
}

export function onRouteChange(handler: (route: Route) => void): void {
  window.addEventListener('hashchange', () => handler(currentRoute()));
}
