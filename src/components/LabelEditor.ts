import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { PALETTE } from '../lib/palette';

interface LabelEditorOptions {
  titleText: string;
  placeholder: string;
  name?: string;
  color?: string;
  onSave: (name: string, color: string) => void;
  onDelete?: () => void;
}

/** Shared bottom-sheet editor for a named, colored label (group or tag). */
export function openLabelEditor(opts: LabelEditorOptions): void {
  let color = opts.color ?? PALETTE[0];

  const nameInput = el('input', {
    class: 'field__input',
    type: 'text',
    value: opts.name ?? '',
    placeholder: opts.placeholder,
    'aria-label': opts.placeholder,
    maxlength: 60,
    autocomplete: 'off',
  }) as HTMLInputElement;

  const swatches = PALETTE.map((c) => {
    const swatch = el('button', {
      type: 'button',
      class: `swatch${c === color ? ' is-selected' : ''}`,
      style: `background:${c}`,
      'aria-label': c,
      'aria-pressed': c === color,
      onClick: () => {
        color = c;
        for (const s of swatches) {
          const active = s === swatch;
          s.classList.toggle('is-selected', active);
          s.setAttribute('aria-pressed', String(active));
        }
      },
    });
    return swatch;
  });

  function close(): void {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') close();
  }

  function save(e: Event): void {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    opts.onSave(name, color);
    close();
  }

  const header = el('div', { class: 'sheet__header' }, [
    el('h2', { class: 'sheet__title' }, [opts.titleText]),
    el(
      'button',
      { class: 'icon-btn', type: 'button', 'aria-label': t('editor.close'), onClick: close },
      [svg(ui.close('icon-btn__icon'))],
    ),
  ]);

  const footer = el('div', { class: 'sheet__footer' }, [
    ...(opts.onDelete
      ? [
          el(
            'button',
            {
              class: 'btn btn--danger',
              type: 'button',
              onClick: () => {
                opts.onDelete!();
                close();
              },
            },
            [svg(ui.trash('btn__icon')), t('editor.delete')],
          ),
        ]
      : []),
    el('button', { class: 'btn btn--primary', type: 'submit' }, [t('editor.save')]),
  ]);

  const form = el('form', { class: 'sheet__form', onSubmit: save }, [
    el('div', { class: 'field' }, [nameInput]),
    el('div', { class: 'field' }, [
      el('label', { class: 'field__label' }, [t('label.color')]),
      el('div', { class: 'swatch-row' }, swatches),
    ]),
    footer,
  ]);

  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, [header, form]);
  const overlay = el(
    'div',
    { class: 'overlay', onClick: (e: Event) => e.target === overlay && close() },
    [sheet],
  );

  document.body.append(overlay);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    nameInput.focus();
  });
}
