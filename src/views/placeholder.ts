import { el } from '../lib/dom';
import { t } from '../i18n/i18n';
import type { TKey } from '../i18n/translations';
import { pageHeader } from '../components/PageHeader';
import { emptyState } from '../components/EmptyState';
import type { Tab } from '../router';

interface ViewMeta {
  titleKey: TKey;
  subtitleKey: TKey;
  emptyKey: TKey;
  emoji: string;
}

// Only tabs without a dedicated view yet fall back here (currently: Sync).
const META: Partial<Record<Tab, ViewMeta>> = {
  sync: { titleKey: 'sync.title', subtitleKey: 'sync.subtitle', emptyKey: 'sync.empty', emoji: '🔗' },
};

export function renderPlaceholder(tab: Tab): { header: HTMLElement; content: HTMLElement } {
  const meta = META[tab] ?? META.sync!;
  const header = pageHeader({ title: t(meta.titleKey), subtitle: t(meta.subtitleKey) });
  const content = el('main', { class: 'shell__content' }, [emptyState(meta.emoji, t(meta.emptyKey))]);
  return { header, content };
}
