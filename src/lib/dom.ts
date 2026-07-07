/** Minimal DOM helpers — keeps view code declarative without a framework. */

type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

/** Parse an inline SVG string into an element (for icons). */
export function svg(markup: string): SVGElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = markup.trim();
  return wrapper.firstElementChild as SVGElement;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}
