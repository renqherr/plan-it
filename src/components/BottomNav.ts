import { el, svg } from '../lib/dom';
import { icons } from '../lib/icons';
import { t } from '../i18n/i18n';
import type { TKey } from '../i18n/translations';
import { navigate, type Route } from '../router';

interface NavItem {
  route: Route;
  labelKey: TKey;
  icon: string;
}

const ITEMS: NavItem[] = [
  { route: 'today', labelKey: 'nav.today', icon: icons.today },
  { route: 'groups', labelKey: 'nav.groups', icon: icons.groups },
  { route: 'favorites', labelKey: 'nav.favorites', icon: icons.favorites },
  { route: 'sync', labelKey: 'nav.sync', icon: icons.sync },
];

export function BottomNav(active: Route): HTMLElement {
  return el(
    'nav',
    { class: 'bottom-nav', 'aria-label': 'Primary' },
    ITEMS.map((item) =>
      el(
        'button',
        {
          class: 'bottom-nav__item',
          'aria-current': item.route === active ? 'page' : false,
          onClick: () => navigate(item.route),
        },
        [svg(item.icon), t(item.labelKey)],
      ),
    ),
  );
}
