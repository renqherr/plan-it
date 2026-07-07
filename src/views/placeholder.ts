import { el } from '../lib/dom';
import { t } from '../i18n/i18n';
import type { TKey } from '../i18n/translations';
import { LanguageToggle } from '../components/LanguageToggle';
import type { Route } from '../router';

interface ViewMeta {
  titleKey: TKey;
  subtitleKey: TKey;
  emptyKey: TKey;
  emoji: string;
}

const META: Record<Route, ViewMeta> = {
  today: { titleKey: 'today.title', subtitleKey: 'today.subtitle', emptyKey: 'today.empty', emoji: '📋' },
  groups: { titleKey: 'groups.title', subtitleKey: 'groups.subtitle', emptyKey: 'groups.empty', emoji: '🗂️' },
  favorites: { titleKey: 'favorites.title', subtitleKey: 'favorites.subtitle', emptyKey: 'favorites.empty', emoji: '⭐' },
  sync: { titleKey: 'sync.title', subtitleKey: 'sync.subtitle', emptyKey: 'sync.empty', emoji: '🔗' },
};

/** Renders the header + content body for a route (Phase 0 placeholder). */
export function renderView(route: Route): { header: HTMLElement; content: HTMLElement } {
  const meta = META[route];

  const header = el('header', { class: 'shell__header' }, [
    el('div', { class: 'shell__titles' }, [
      el('h1', { class: 'shell__title' }, [t(meta.titleKey)]),
      el('p', { class: 'shell__subtitle' }, [t(meta.subtitleKey)]),
    ]),
    LanguageToggle(),
  ]);

  const content = el('main', { class: 'shell__content' }, [
    el('div', { class: 'empty-state' }, [
      el('div', { class: 'empty-state__emoji' }, [meta.emoji]),
      el('p', {}, [t(meta.emptyKey)]),
    ]),
  ]);

  return { header, content };
}
