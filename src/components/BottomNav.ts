import { el, svg } from '../lib/dom';
import { icons } from '../lib/icons';
import { t } from '../i18n/i18n';
import type { TKey } from '../i18n/translations';
import { navigate, type Tab } from '../router';

interface NavItem {
  tab: Tab;
  labelKey: TKey;
  icon: string;
}

const ITEMS: NavItem[] = [
  { tab: 'today', labelKey: 'nav.today', icon: icons.today },
  { tab: 'groups', labelKey: 'nav.groups', icon: icons.groups },
  { tab: 'favorites', labelKey: 'nav.favorites', icon: icons.favorites },
  { tab: 'sync', labelKey: 'nav.sync', icon: icons.sync },
];

export function BottomNav(active: Tab): HTMLElement {
  return el(
    'nav',
    { class: 'bottom-nav', 'aria-label': 'Primary' },
    ITEMS.map((item) =>
      el(
        'button',
        {
          class: 'bottom-nav__item',
          'aria-current': item.tab === active ? 'page' : false,
          onClick: () => navigate(item.tab),
        },
        [svg(item.icon), t(item.labelKey)],
      ),
    ),
  );
}
