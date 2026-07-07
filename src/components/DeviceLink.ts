import { el, svg } from '../lib/dom';
import { ui } from '../lib/icons';
import { t } from '../i18n/i18n';
import { getConfig, connect } from '../sync/sync';
import { encryptConfig, decryptConfig } from '../crypto/passphrase';
import { toQrDataUrl } from '../qr/generate';
import { startScanner, type RunningScanner } from '../qr/scan';

/** Build a bottom-sheet shell. Returns the overlay, its body container, and a close fn. */
function makeSheet(titleText: string, onClose?: () => void): {
  overlay: HTMLElement;
  body: HTMLElement;
  close: () => void;
} {
  const body = el('div', { class: 'sheet__form' }, []);

  function close(): void {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    onClose?.();
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') close();
  }

  const header = el('div', { class: 'sheet__header' }, [
    el('h2', { class: 'sheet__title' }, [titleText]),
    el(
      'button',
      { class: 'icon-btn', type: 'button', 'aria-label': t('editor.close'), onClick: close },
      [svg(ui.close('icon-btn__icon'))],
    ),
  ]);

  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, [header, body]);
  const overlay = el(
    'div',
    { class: 'overlay', onClick: (e: Event) => e.target === overlay && close() },
    [sheet],
  );

  document.body.append(overlay);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  return { overlay, body, close };
}

/** Export: encrypt the current config under a passphrase and show it as a QR. */
export function openExportSheet(): void {
  const config = getConfig();
  if (!config) return;

  const { body } = makeSheet(t('qr.link'));

  const passInput = el('input', {
    class: 'field__input',
    type: 'password',
    placeholder: t('qr.passphraseNew'),
    'aria-label': t('qr.passphrase'),
    autocomplete: 'off',
  }) as HTMLInputElement;

  const result = el('div', { class: 'qr-result' }, []);

  async function generate(e: Event): Promise<void> {
    e.preventDefault();
    const pass = passInput.value;
    if (!pass) {
      passInput.focus();
      return;
    }
    const code = await encryptConfig(config!, pass);
    const dataUrl = await toQrDataUrl(code);

    let copied = false;
    const copyBtn = el(
      'button',
      {
        class: 'btn btn--danger',
        type: 'button',
        onClick: () => {
          void navigator.clipboard?.writeText(code);
          if (!copied) {
            copied = true;
            copyBtn.textContent = t('qr.copied');
          }
        },
      },
      [t('qr.copy')],
    );

    result.replaceChildren(
      el('img', { class: 'qr-img', src: dataUrl, alt: 'QR code', width: 240, height: 240 }),
      copyBtn,
    );
  }

  body.append(
    el('p', { class: 'field__hint' }, [t('qr.export.help')]),
    el('form', { class: 'sheet__form', onSubmit: generate }, [
      el('div', { class: 'field' }, [passInput]),
      el('button', { class: 'btn btn--primary', type: 'submit' }, [t('qr.generate')]),
    ]),
    result,
  );
  requestAnimationFrame(() => passInput.focus());
}

/** Import: scan (or paste) an encrypted code, decrypt with the passphrase, connect. */
export function openImportSheet(): void {
  let scanner: RunningScanner | null = null;
  let closed = false;

  const { body, close } = makeSheet(t('qr.scan'), () => {
    closed = true;
    void scanner?.stop();
  });

  const passInput = el('input', {
    class: 'field__input',
    type: 'password',
    placeholder: t('qr.passphraseEnter'),
    'aria-label': t('qr.passphrase'),
    autocomplete: 'off',
  }) as HTMLInputElement;

  const pasteInput = el('textarea', {
    class: 'field__input field__textarea',
    placeholder: t('qr.pastePlaceholder'),
    rows: 2,
  }) as HTMLTextAreaElement;

  const errorEl = el('p', { class: 'sync-status__msg' }, []);
  const reader = el('div', { id: 'qr-reader', class: 'qr-reader' }, []);

  async function tryImport(blob: string): Promise<void> {
    errorEl.textContent = '';
    try {
      const cfg = await decryptConfig(blob.trim(), passInput.value);
      close();
      await connect(cfg); // status surfaces in the Sync view
    } catch {
      errorEl.textContent = t('qr.error.passphrase');
    }
  }

  body.append(
    el('p', { class: 'field__hint' }, [t('qr.import.help')]),
    el('div', { class: 'field' }, [passInput]),
    reader,
    el('div', { class: 'field' }, [pasteInput]),
    el(
      'button',
      {
        class: 'btn btn--primary',
        type: 'button',
        onClick: () => {
          if (pasteInput.value.trim()) void tryImport(pasteInput.value);
        },
      },
      [t('sync.connect')],
    ),
    errorEl,
  );

  // Attempt the camera; fall back to paste if unavailable.
  startScanner('qr-reader', (text) => void tryImport(text))
    .then((s) => {
      if (closed) void s.stop(); // sheet closed before the camera started
      else scanner = s;
    })
    .catch(() => {
      reader.remove();
      if (!closed) errorEl.textContent = t('qr.error.camera');
    });

  requestAnimationFrame(() => passInput.focus());
}
