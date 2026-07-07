/** RFC-4122 v4 id. `crypto.randomUUID` is available in secure contexts
 *  (HTTPS + localhost), which covers GitHub Pages and local dev. */
export function uuid(): string {
  return crypto.randomUUID();
}
