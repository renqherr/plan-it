import { el } from '../lib/dom';

export function emptyState(emoji: string, message: string): HTMLElement {
  return el('div', { class: 'empty-state' }, [
    el('div', { class: 'empty-state__emoji' }, [emoji]),
    el('p', {}, [message]),
  ]);
}
