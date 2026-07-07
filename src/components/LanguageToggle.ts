import { el } from '../lib/dom';
import { getLang, setLang, t } from '../i18n/i18n';
import { LANGS } from '../i18n/translations';

/** Segmented EN / ES control. */
export function LanguageToggle(): HTMLElement {
  const active = getLang();
  return el(
    'div',
    { class: 'lang-toggle', role: 'group', 'aria-label': t('lang.aria') },
    LANGS.map((lang) =>
      el(
        'button',
        {
          class: 'lang-toggle__btn',
          'aria-pressed': lang.code === active,
          onClick: () => setLang(lang.code),
        },
        [lang.label],
      ),
    ),
  );
}
