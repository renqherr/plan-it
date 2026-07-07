export type Lang = 'en' | 'es';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

/** Flat, dotted translation keys. `en` is the source of truth for the key set. */
export const dict = {
  en: {
    'nav.today': 'Today',
    'nav.groups': 'Groups',
    'nav.favorites': 'Favorites',
    'nav.sync': 'Sync',
    'nav.back': 'Back',

    'today.title': 'Today',
    'today.subtitle': 'Your scheduled tasks',
    'today.empty': 'No tasks yet. Tap + to add your first one.',
    'today.noMatch': 'No tasks match this filter.',
    'today.completed': 'Completed',
    'filter.all': 'All',

    'action.add': 'Add task',

    'editor.newTitle': 'New task',
    'editor.editTitle': 'Edit task',
    'editor.titlePlaceholder': 'What needs doing?',
    'editor.notesPlaceholder': 'Notes (optional)',
    'editor.save': 'Save',
    'editor.cancel': 'Cancel',
    'editor.delete': 'Delete',
    'editor.close': 'Close',
    'editor.schedule': 'Schedule',
    'editor.group': 'Group',
    'editor.noGroup': 'No group',
    'editor.tags': 'Tags',
    'editor.noTags': 'No tags yet — create one from the Groups tab.',

    'task.complete': 'Mark complete',
    'task.incomplete': 'Mark as not done',
    'task.favorite': 'Add to favorites',
    'task.unfavorite': 'Remove from favorites',

    'groups.title': 'Groups',
    'groups.subtitle': 'Organize by list or project',
    'groups.empty': 'No groups yet. Create one to organize tasks.',
    'groups.section': 'Groups',
    'groups.add': 'New group',
    'group.newTitle': 'New group',
    'group.editTitle': 'Edit group',
    'group.namePlaceholder': 'Group name',
    'group.empty': 'No tasks in this group yet.',

    'tags.section': 'Tags',
    'tags.add': 'New tag',
    'tags.empty': 'No tags yet.',
    'tag.newTitle': 'New tag',
    'tag.editTitle': 'Edit tag',
    'tag.namePlaceholder': 'Tag name',

    'label.color': 'Color',

    'favorites.title': 'Favorites',
    'favorites.subtitle': 'Your starred tasks',
    'favorites.empty': 'No favorites yet. Tap the star on a task.',

    'sync.title': 'Sync',
    'sync.subtitle': 'Link your devices',
    'sync.empty': 'QR sync with passphrase lands in Phase 4.',

    'lang.aria': 'Change language',
  },
  es: {
    'nav.today': 'Hoy',
    'nav.groups': 'Grupos',
    'nav.favorites': 'Favoritas',
    'nav.sync': 'Sincronizar',
    'nav.back': 'Atrás',

    'today.title': 'Hoy',
    'today.subtitle': 'Tus tareas programadas',
    'today.empty': 'Aún no hay tareas. Toca + para añadir la primera.',
    'today.noMatch': 'Ninguna tarea coincide con este filtro.',
    'today.completed': 'Completadas',
    'filter.all': 'Todas',

    'action.add': 'Añadir tarea',

    'editor.newTitle': 'Nueva tarea',
    'editor.editTitle': 'Editar tarea',
    'editor.titlePlaceholder': '¿Qué hay que hacer?',
    'editor.notesPlaceholder': 'Notas (opcional)',
    'editor.save': 'Guardar',
    'editor.cancel': 'Cancelar',
    'editor.delete': 'Eliminar',
    'editor.close': 'Cerrar',
    'editor.schedule': 'Programar',
    'editor.group': 'Grupo',
    'editor.noGroup': 'Sin grupo',
    'editor.tags': 'Etiquetas',
    'editor.noTags': 'Aún no hay etiquetas: crea una desde la pestaña Grupos.',

    'task.complete': 'Marcar como completada',
    'task.incomplete': 'Marcar como no completada',
    'task.favorite': 'Añadir a favoritas',
    'task.unfavorite': 'Quitar de favoritas',

    'groups.title': 'Grupos',
    'groups.subtitle': 'Organiza por lista o proyecto',
    'groups.empty': 'Aún no hay grupos. Crea uno para organizar tus tareas.',
    'groups.section': 'Grupos',
    'groups.add': 'Nuevo grupo',
    'group.newTitle': 'Nuevo grupo',
    'group.editTitle': 'Editar grupo',
    'group.namePlaceholder': 'Nombre del grupo',
    'group.empty': 'Este grupo aún no tiene tareas.',

    'tags.section': 'Etiquetas',
    'tags.add': 'Nueva etiqueta',
    'tags.empty': 'Aún no hay etiquetas.',
    'tag.newTitle': 'Nueva etiqueta',
    'tag.editTitle': 'Editar etiqueta',
    'tag.namePlaceholder': 'Nombre de la etiqueta',

    'label.color': 'Color',

    'favorites.title': 'Favoritas',
    'favorites.subtitle': 'Tus tareas destacadas',
    'favorites.empty': 'Aún no hay favoritas. Toca la estrella de una tarea.',

    'sync.title': 'Sincronizar',
    'sync.subtitle': 'Vincula tus dispositivos',
    'sync.empty': 'La sincronización por QR con contraseña llega en la Fase 4.',

    'lang.aria': 'Cambiar idioma',
  },
} as const;

export type TKey = keyof (typeof dict)['en'];
