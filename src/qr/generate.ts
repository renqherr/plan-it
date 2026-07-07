/** Render text into a QR code PNG data URL. The `qrcode` lib is loaded on
 *  demand so it stays out of the main bundle. */
export async function toQrDataUrl(text: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
