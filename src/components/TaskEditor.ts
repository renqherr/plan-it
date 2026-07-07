import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { addTask, updateTask, deleteTask } from '../state/actions';

/** Open a bottom-sheet editor to create (no id) or edit an existing task. */
export function openTaskEditor(taskId?: string): void {
  const existing = taskId ? getState().tasks.find((task) => task.id === taskId) : undefined;

  const titleInput = el('input', {
    class: 'field__input',
    type: 'text',
    value: existing?.title ?? '',
    placeholder: t('editor.titlePlaceholder'),
    'aria-label': t('editor.titlePlaceholder'),
    maxlength: 200,
    autocomplete: 'off',
  }) as HTMLInputElement;

  const notesInput = el('textarea', {
    class: 'field__input field__textarea',
    placeholder: t('editor.notesPlaceholder'),
    'aria-label': t('editor.notesPlaceholder'),
    rows: 3,
    maxlength: 2000,
  }) as HTMLTextAreaElement;
  notesInput.value = existing?.notes ?? '';

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
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    if (existing) updateTask(existing.id, { title, notes: notesInput.value });
    else addTask({ title, notes: notesInput.value });
    close();
  }

  const closeBtn = el(
    'button',
    { class: 'icon-btn', type: 'button', 'aria-label': t('editor.close'), onClick: close },
    [svg(ui.close('icon-btn__icon'))],
  );

  const header = el('div', { class: 'sheet__header' }, [
    el('h2', { class: 'sheet__title' }, [existing ? t('editor.editTitle') : t('editor.newTitle')]),
    closeBtn,
  ]);

  const footer = el('div', { class: 'sheet__footer' }, [
    ...(existing
      ? [
          el(
            'button',
            {
              class: 'btn btn--danger',
              type: 'button',
              onClick: () => {
                deleteTask(existing.id);
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
    el('div', { class: 'field' }, [titleInput]),
    el('div', { class: 'field' }, [notesInput]),
    footer,
  ]);

  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, [header, form]);

  const overlay = el(
    'div',
    {
      class: 'overlay',
      onClick: (e: Event) => {
        if (e.target === overlay) close();
      },
    },
    [sheet],
  );

  document.body.append(overlay);
  document.addEventListener('keydown', onKey);
  // Trigger the open transition on the next frame.
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    titleInput.focus();
  });
}
