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

    'today.title': 'Today',
    'today.subtitle': 'Your scheduled tasks',
    'today.empty': 'No tasks yet. Tap + to add your first one.',
    'today.completed': 'Completed',

    'action.add': 'Add task',

    'editor.newTitle': 'New task',
    'editor.editTitle': 'Edit task',
    'editor.titlePlaceholder': 'What needs doing?',
    'editor.notesPlaceholder': 'Notes (optional)',
    'editor.save': 'Save',
    'editor.cancel': 'Cancel',
    'editor.delete': 'Delete',
    'editor.close': 'Close',

    'task.complete': 'Mark complete',
    'task.incomplete': 'Mark as not done',
    'task.favorite': 'Add to favorites',
    'task.unfavorite': 'Remove from favorites',

    'groups.title': 'Groups',
    'groups.subtitle': 'Organize by list or project',
    'groups.empty': 'Groups arrive in Phase 2.',

    'favorites.title': 'Favorites',
    'favorites.subtitle': 'Your starred tasks',
    'favorites.empty': 'Star tasks to see them here (Phase 2).',

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

    'today.title': 'Hoy',
    'today.subtitle': 'Tus tareas programadas',
    'today.empty': 'Aún no hay tareas. Toca + para añadir la primera.',
    'today.completed': 'Completadas',

    'action.add': 'Añadir tarea',

    'editor.newTitle': 'Nueva tarea',
    'editor.editTitle': 'Editar tarea',
    'editor.titlePlaceholder': '¿Qué hay que hacer?',
    'editor.notesPlaceholder': 'Notas (opcional)',
    'editor.save': 'Guardar',
    'editor.cancel': 'Cancelar',
    'editor.delete': 'Eliminar',
    'editor.close': 'Cerrar',

    'task.complete': 'Marcar como completada',
    'task.incomplete': 'Marcar como no completada',
    'task.favorite': 'Añadir a favoritas',
    'task.unfavorite': 'Quitar de favoritas',

    'groups.title': 'Grupos',
    'groups.subtitle': 'Organiza por lista o proyecto',
    'groups.empty': 'Los grupos llegan en la Fase 2.',

    'favorites.title': 'Favoritas',
    'favorites.subtitle': 'Tus tareas destacadas',
    'favorites.empty': 'Marca tareas para verlas aquí (Fase 2).',

    'sync.title': 'Sincronizar',
    'sync.subtitle': 'Vincula tus dispositivos',
    'sync.empty': 'La sincronización por QR con contraseña llega en la Fase 4.',

    'lang.aria': 'Cambiar idioma',
  },
} as const;

export type TKey = keyof (typeof dict)['en'];
