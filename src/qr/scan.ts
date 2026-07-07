export interface RunningScanner {
  stop: () => Promise<void>;
}

/**
 * Start the rear camera scanning into the element with the given id.
 * Calls `onDecode` with the first decoded string, then stops itself.
 * Throws if the camera can't be started (no permission / no device) —
 * callers should fall back to manual paste.
 */
export async function startScanner(
  elementId: string,
  onDecode: (text: string) => void,
): Promise<RunningScanner> {
  const { Html5Qrcode } = await import('html5-qrcode');
  const scanner = new Html5Qrcode(elementId, { verbose: false });
  let stopped = false;

  const stop = async (): Promise<void> => {
    if (stopped) return;
    stopped = true;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // Already stopped / not running — ignore.
    }
  };

  await scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText) => {
      void stop().then(() => onDecode(decodedText));
    },
    () => {
      // Per-frame decode failures are normal; ignore.
    },
  );

  return { stop };
}
