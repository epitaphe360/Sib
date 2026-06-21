/**
 * HMAC-SHA256 pour React Native (crypto.subtle absent).
 * Utilise expo-crypto pour le digest SHA-256.
 */
import * as ExpoCrypto from 'expo-crypto';

const BLOCK_SIZE = 64;

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
  return new Uint8Array(hash);
}

export async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  let k = key;
  if (k.length > BLOCK_SIZE) {
    k = await sha256(k);
  }

  const padded = new Uint8Array(BLOCK_SIZE);
  padded.set(k);

  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = padded[i] ^ 0x36;
    opad[i] = padded[i] ^ 0x5c;
  }

  const inner = new Uint8Array(BLOCK_SIZE + message.length);
  inner.set(ipad);
  inner.set(message, BLOCK_SIZE);
  const innerHash = await sha256(inner);

  const outer = new Uint8Array(BLOCK_SIZE + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, BLOCK_SIZE);
  return sha256(outer);
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
