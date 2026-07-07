/** App-level re-render signal for view-local UI state (filters, etc.) that
 *  lives outside the store. main.ts subscribes and re-renders the active view. */
const EVENT = 'app:rerender';

export function rerender(): void {
  window.dispatchEvent(new Event(EVENT));
}

export function onRerender(fn: () => void): void {
  window.addEventListener(EVENT, fn);
}
