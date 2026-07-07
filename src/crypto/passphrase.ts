import type { SyncConfig } from '../model/types';

/**
 * Passphrase-based encryption of the sync config for the QR payload.
 * Scheme: PBKDF2(SHA-256, 150k) → AES-GCM-256. Wire format is
 * base64( salt[16] || iv[12] || ciphertext ). Uses only the Web Crypto API
 * (available in secure contexts — HTTPS and localhost).
 */

const SALT_BYTES = 16;
const IV_BYTES = 12;
const ITERATIONS = 150_000;

export class PassphraseError extends Error {
  constructor(message = 'Wrong passphrase or invalid code') {
    super(message);
    this.name = 'PassphraseError';
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptConfig(config: SyncConfig, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(config));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv } as AesGcmParams, key, plaintext),
  );

  const out = new Uint8Array(salt.length + iv.length + ciphertext.length);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(ciphertext, salt.length + iv.length);
  return bytesToBase64(out);
}

export async function decryptConfig(blob: string, passphrase: string): Promise<SyncConfig> {
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(blob);
  } catch {
    throw new PassphraseError();
  }
  if (bytes.length <= SALT_BYTES + IV_BYTES) throw new PassphraseError();

  const salt = bytes.slice(0, SALT_BYTES);
  const iv = bytes.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ciphertext = bytes.slice(SALT_BYTES + IV_BYTES);
  const key = await deriveKey(passphrase, salt);

  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv } as AesGcmParams, key, ciphertext);
  } catch {
    // Wrong passphrase → GCM authentication tag fails.
    throw new PassphraseError();
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(plaintext)) as SyncConfig;
    if (!parsed.binId || !parsed.accessKey) throw new Error();
    return parsed;
  } catch {
    throw new PassphraseError();
  }
}
