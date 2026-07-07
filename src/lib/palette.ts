/** Shared color palette for groups and tags. Values are theme-independent
 *  hues that read well on both light and dark surfaces. */
export const PALETTE = [
  '#4f6bed', // blue
  '#30a46c', // green
  '#e5484d', // red
  '#f5a623', // amber
  '#9c6ade', // purple
  '#14b8c4', // teal
  '#eb5aa7', // pink
  '#6b7280', // slate
] as const;

export function nextColor(usedCount: number): string {
  return PALETTE[usedCount % PALETTE.length];
}
