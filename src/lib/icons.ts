/** Inline SVG icons (stroke = currentColor so they follow nav state). */

const wrap = (paths: string) =>
  `<svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const icons = {
  today: wrap(
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  ),
  groups: wrap(
    '<path d="M4 6h16M4 12h16M4 18h10"/>',
  ),
  favorites: wrap(
    '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.6 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>',
  ),
  sync: wrap(
    '<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8-5M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8 5"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  ),
};

/** Generic icon with a caller-supplied class. `fill` lets stars render solid. */
const glyph = (paths: string, cls: string, fill = 'none') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const ui = {
  circle: (cls: string) => glyph('<circle cx="12" cy="12" r="9"/>', cls),
  check: (cls: string) =>
    glyph('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>', cls),
  star: (cls: string, filled: boolean) =>
    glyph(
      '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.6 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>',
      cls,
      filled ? 'currentColor' : 'none',
    ),
  plus: (cls: string) => glyph('<path d="M12 5v14M5 12h14"/>', cls),
  close: (cls: string) => glyph('<path d="M6 6l12 12M18 6L6 18"/>', cls),
  trash: (cls: string) =>
    glyph('<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>', cls),
};
