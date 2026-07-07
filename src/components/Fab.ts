import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';

/** Floating "+" button anchored to the app column (same centering trick as the nav). */
export function fabLayer(label: string, onClick: () => void): HTMLElement {
  const fab = el('button', { class: 'fab', 'aria-label': label, onClick }, [svg(ui.plus('fab__icon'))]);
  return el('div', { class: 'fab-layer' }, [fab]);
}
