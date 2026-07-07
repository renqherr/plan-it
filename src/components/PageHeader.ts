import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { LanguageToggle } from './LanguageToggle';

interface HeaderOptions {
  title: string;
  subtitle?: string;
  /** When set, shows a back button that runs this handler. */
  onBack?: () => void;
  /** Optional dot color shown before the title (e.g. group color). */
  dotColor?: string;
  /** Replaces the language toggle in the trailing slot (e.g. an edit button). */
  trailing?: HTMLElement;
}

export function pageHeader(opts: HeaderOptions): HTMLElement {
  const children: (Node | string)[] = [];

  if (opts.onBack) {
    children.push(
      el(
        'button',
        { class: 'icon-btn header__back', type: 'button', 'aria-label': t('nav.back'), onClick: opts.onBack },
        [svg(ui.back('icon-btn__icon'))],
      ),
    );
  }

  const titleRow: (Node | string)[] = [];
  if (opts.dotColor) titleRow.push(el('span', { class: 'dot dot--lg', style: `background:${opts.dotColor}` }, []));
  titleRow.push(el('h1', { class: 'shell__title' }, [opts.title]));

  const titles: (Node | string)[] = [el('div', { class: 'shell__title-row' }, titleRow)];
  if (opts.subtitle) titles.push(el('p', { class: 'shell__subtitle' }, [opts.subtitle]));

  children.push(el('div', { class: 'shell__titles' }, titles));
  children.push(opts.trailing ?? LanguageToggle());

  return el('header', { class: 'shell__header' }, children);
}
