/** Trailing debounce. Returns a callable with a `.flush()` and `.cancel()`. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): { (...args: A): void; flush: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;

  const run = (): void => {
    if (pending) {
      fn(...pending);
      pending = null;
    }
    timer = null;
  };

  const debounced = (...args: A): void => {
    pending = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, wait);
  };

  debounced.flush = (): void => {
    if (timer) clearTimeout(timer);
    run();
  };

  debounced.cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
  };

  return debounced;
}
