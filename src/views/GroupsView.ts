import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { getState } from '../state/store';
import { addGroup, updateGroup, deleteGroup, addTag, updateTag, deleteTag } from '../state/actions';
import { countTasksInGroup } from '../state/selectors';
import { taskSections } from '../components/TaskList';
import { openTaskEditor } from '../components/TaskEditor';
import { openLabelEditor } from '../components/LabelEditor';
import { pageHeader } from '../components/PageHeader';
import { fabLayer } from '../components/Fab';
import { emptyState } from '../components/EmptyState';
import { navigate, navigateGroup } from '../router';

export function renderGroups(): { header: HTMLElement; content: HTMLElement } {
  const header = pageHeader({ title: t('groups.title'), subtitle: t('groups.subtitle') });
  const { groups, tags } = getState();

  const content = el('main', { class: 'shell__content' }, []);

  // Groups list
  content.append(el('h2', { class: 'section-label' }, [t('groups.section')]));
  if (groups.length === 0) {
    content.append(emptyState('🗂️', t('groups.empty')));
  } else {
    content.append(
      el(
        'ul',
        { class: 'group-list' },
        groups.map((group) =>
          el(
            'li',
            { class: 'group-row', onClick: () => navigateGroup(group.id) },
            [
              el('span', { class: 'dot', style: `background:${group.color}` }, []),
              el('span', { class: 'group-row__name' }, [group.name]),
              el('span', { class: 'group-row__count' }, [String(countTasksInGroup(group.id))]),
              svg(ui.chevron('group-row__chevron')),
            ],
          ),
        ),
      ),
    );
  }

  // Tags management
  const tagsHeader = el('div', { class: 'section-head' }, [
    el('h2', { class: 'section-label' }, [t('tags.section')]),
    el(
      'button',
      {
        class: 'text-btn',
        onClick: () =>
          openLabelEditor({
            titleText: t('tag.newTitle'),
            placeholder: t('tag.namePlaceholder'),
            onSave: (name, color) => addTag(name, color),
          }),
      },
      [svg(ui.plus('text-btn__icon')), t('tags.add')],
    ),
  ]);
  content.append(tagsHeader);

  if (tags.length === 0) {
    content.append(el('p', { class: 'field__hint' }, [t('tags.empty')]));
  } else {
    content.append(
      el(
        'div',
        { class: 'chip-row' },
        tags.map((tag) =>
          el(
            'button',
            {
              class: 'tag-chip tag-chip--interactive',
              style: `--chip:${tag.color}`,
              onClick: () =>
                openLabelEditor({
                  titleText: t('tag.editTitle'),
                  placeholder: t('tag.namePlaceholder'),
                  name: tag.name,
                  color: tag.color,
                  onSave: (name, color) => updateTag(tag.id, { name, color }),
                  onDelete: () => deleteTag(tag.id),
                }),
            },
            [tag.name],
          ),
        ),
      ),
    );
  }

  content.append(
    fabLayer(t('groups.add'), () =>
      openLabelEditor({
        titleText: t('group.newTitle'),
        placeholder: t('group.namePlaceholder'),
        onSave: (name, color) => addGroup(name, color),
      }),
    ),
  );

  return { header, content };
}

export function renderGroupDetail(groupId: string): { header: HTMLElement; content: HTMLElement } {
  const group = getState().groups.find((g) => g.id === groupId);
  if (!group) {
    // Group was deleted — fall back to the list.
    navigate('groups');
    return renderGroups();
  }

  const editBtn = el(
    'button',
    {
      class: 'icon-btn',
      type: 'button',
      'aria-label': t('group.editTitle'),
      onClick: () =>
        openLabelEditor({
          titleText: t('group.editTitle'),
          placeholder: t('group.namePlaceholder'),
          name: group.name,
          color: group.color,
          onSave: (name, color) => updateGroup(group.id, { name, color }),
          onDelete: () => {
            deleteGroup(group.id);
            navigate('groups');
          },
        }),
    },
    [svg(ui.pencil('icon-btn__icon'))],
  );

  const header = pageHeader({
    title: group.name,
    dotColor: group.color,
    onBack: () => navigate('groups'),
    trailing: editBtn,
  });

  const tasks = getState().tasks.filter((task) => task.groupId === group.id);
  const content = el('main', { class: 'shell__content' }, []);

  if (tasks.length === 0) {
    content.append(emptyState('🗂️', t('group.empty')));
  } else {
    for (const node of taskSections(tasks)) content.append(node);
  }

  content.append(fabLayer(t('action.add'), () => openTaskEditor(undefined, { groupId: group.id })));
  return { header, content };
}
