import { el } from '../lib/dom';
import { t, getLang } from '../i18n/i18n';
import type { TKey } from '../i18n/translations';
import { pageHeader } from '../components/PageHeader';
import { getStatus, onStatusChange, type SyncState } from '../sync/status';
import { connect, disconnect, syncNow, isConnected } from '../sync/sync';
import { CONFIG_VERSION } from '../persistence/syncConfig';
import { rerender } from '../lib/rerender';

// Preserve form input across status-driven re-renders.
let draftBinId = '';
let draftAccessKey = '';

// Re-render the active view whenever sync status changes.
onStatusChange(() => rerender());

const STATUS_KEY: Record<SyncState, TKey> = {
  disconnected: 'sync.status.disconnected',
  idle: 'sync.status.idle',
  syncing: 'sync.status.syncing',
  error: 'sync.status.error',
  offline: 'sync.status.offline',
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(getLang() === 'es' ? 'es-ES' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function renderSync(): { header: HTMLElement; content: HTMLElement } {
  const header = pageHeader({ title: t('sync.title'), subtitle: t('sync.subtitle') });
  const status = getStatus();
  const content = el('main', { class: 'shell__content' }, []);

  // Status card
  const statusLines: (Node | string)[] = [
    el('div', { class: 'sync-status__row' }, [
      el('span', { class: `sync-dot sync-dot--${status.state}` }, []),
      el('span', { class: 'sync-status__text' }, [t(STATUS_KEY[status.state])]),
    ]),
  ];
  if (status.state === 'error' && status.message) {
    statusLines.push(el('p', { class: 'sync-status__msg' }, [status.message]));
  }
  if (status.lastSyncedAt) {
    statusLines.push(
      el('p', { class: 'field__hint' }, [`${t('sync.lastSynced')}: ${formatTime(status.lastSyncedAt)}`]),
    );
  }
  content.append(el('div', { class: 'card sync-status' }, statusLines));

  content.append(isConnected() ? connectedPanel() : connectForm(status.state === 'syncing'));

  return { header, content };
}

function connectForm(busy: boolean): HTMLElement {
  const binInput = el('input', {
    class: 'field__input',
    type: 'text',
    value: draftBinId,
    placeholder: t('sync.binId'),
    'aria-label': t('sync.binId'),
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: false,
    oninput: (e: Event) => (draftBinId = (e.target as HTMLInputElement).value),
  }) as HTMLInputElement;

  const keyInput = el('input', {
    class: 'field__input',
    type: 'password',
    value: draftAccessKey,
    placeholder: t('sync.accessKey'),
    'aria-label': t('sync.accessKey'),
    autocomplete: 'off',
    oninput: (e: Event) => (draftAccessKey = (e.target as HTMLInputElement).value),
  }) as HTMLInputElement;

  function submit(e: Event): void {
    e.preventDefault();
    const binId = draftBinId.trim();
    const accessKey = draftAccessKey.trim();
    if (!binId || !accessKey) return;
    void connect({ binId, accessKey, v: CONFIG_VERSION });
  }

  const form = el('form', { class: 'sheet__form', onSubmit: submit }, [
    el('div', { class: 'field' }, [el('label', { class: 'field__label' }, [t('sync.binId')]), binInput]),
    el('div', { class: 'field' }, [el('label', { class: 'field__label' }, [t('sync.accessKey')]), keyInput]),
    el('button', { class: 'btn btn--primary', type: 'submit', disabled: busy }, [t('sync.connect')]),
  ]);

  const help = el('details', { class: 'help' }, [
    el('summary', { class: 'help__summary' }, [t('sync.help.title')]),
    el('p', { class: 'help__body' }, [t('sync.help.body')]),
  ]);

  return el('div', {}, [form, help]);
}

function connectedPanel(): HTMLElement {
  const busy = getStatus().state === 'syncing';
  return el('div', { class: 'sheet__form' }, [
    el('p', { class: 'field__hint' }, [t('sync.connected')]),
    el('button', { class: 'btn btn--primary', type: 'button', disabled: busy, onClick: () => void syncNow() }, [
      t('sync.syncNow'),
    ]),
    el('button', { class: 'btn btn--danger', type: 'button', onClick: () => disconnect() }, [
      t('sync.disconnect'),
    ]),
  ]);
}
