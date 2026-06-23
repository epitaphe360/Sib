/**
 * Polyfill Web Crypto pour React Native (Supabase Auth OTP / PKCE).
 * Sans cela : "Cannot read property 'getRandomValues' of undefined"
 */
import { getRandomBytes, randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

function ensureCryptoPolyfill(): void {
  if (Platform.OS === 'web') return;

  const root = globalThis as typeof globalThis & { crypto?: Crypto };
  const cryptoObj = root.crypto ?? ({} as Crypto);

  if (typeof cryptoObj.getRandomValues !== 'function') {
    Object.defineProperty(cryptoObj, 'getRandomValues', {
      value: (array: ArrayBufferView) => {
        const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        view.set(getRandomBytes(view.length));
        return array;
      },
    });
  }

  if (typeof cryptoObj.randomUUID !== 'function') {
    Object.defineProperty(cryptoObj, 'randomUUID', {
      value: () => randomUUID(),
    });
  }

  root.crypto = cryptoObj;
}

ensureCryptoPolyfill();
