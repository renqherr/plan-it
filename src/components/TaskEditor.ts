import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { addTask, updateTask, deleteTask } from '../state/actions';
import { toDatetimeLocal, fromDatetimeLocal } from '../lib/date';

function labeled(labelText: string, control: Node): HTMLElement {
  return el('div', { class: 'field' }, [
    el('label', { class: 'field__label' }, [labelText]),
    control,
  ]);
}

/** Open a bottom-sheet editor to create (no id) or edit an existing task.
 *  `preset.groupId` pre-selects a group when creating from a group's detail. */
export function openTaskEditor(taskId?: string, preset?: { groupId?: string }): void {
  const existing = taskId ? getState().tasks.find((task) => task.id === taskId) : undefined;
  const { groups, tags } = getState();

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
    rows: 2,
    maxlength: 2000,
  }) as HTMLTextAreaElement;
  notesInput.value = existing?.notes ?? '';

  const scheduleInput = el('input', {
    class: 'field__input',
    type: 'datetime-local',
    value: toDatetimeLocal(existing?.scheduledAt ?? null),
  }) as HTMLInputElement;

  const groupSelect = el(
    'select',
    { class: 'field__input' },
    [
      el('option', { value: '' }, [t('editor.noGroup')]),
      ...groups.map((g) => el('option', { value: g.id }, [g.name])),
    ],
  ) as HTMLSelectElement;
  groupSelect.value = existing?.groupId ?? preset?.groupId ?? '';

  const selectedTags = new Set(existing?.tagIds ?? []);
  const tagsControl = tags.length
    ? el(
        'div',
        { class: 'chip-row' },
        tags.map((tag) => {
          const chip = el(
            'button',
            {
              type: 'button',
              class: `chip-select${selectedTags.has(tag.id) ? ' is-selected' : ''}`,
              style: `--chip:${tag.color}`,
              'aria-pressed': selectedTags.has(tag.id),
              onClick: () => {
                if (selectedTags.has(tag.id)) selectedTags.delete(tag.id);
                else selectedTags.add(tag.id);
                chip.classList.toggle('is-selected');
                chip.setAttribute('aria-pressed', String(selectedTags.has(tag.id)));
              },
            },
            [tag.name],
          );
          return chip;
        }),
      )
    : el('p', { class: 'field__hint' }, [t('editor.noTags')]);

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
    const payload = {
      title,
      notes: notesInput.value,
      groupId: groupSelect.value || null,
      tagIds: [...selectedTags],
      scheduledAt: fromDatetimeLocal(scheduleInput.value),
    };
    if (existing) updateTask(existing.id, payload);
    else addTask(payload);
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
    labeled(t('editor.schedule'), scheduleInput),
    labeled(t('editor.group'), groupSelect),
    labeled(t('editor.tags'), tagsControl),
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
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    titleInput.focus();
  });
}
