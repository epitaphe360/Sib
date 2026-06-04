import AsyncStorage from '@react-native-async-storage/async-storage';

const QR_CACHE_KEY = '@urbaevent/last-qr';

export interface CachedQR {
  qrData: string;
  expiresAt: string;
  savedAt: string;
}

export async function saveCachedQR(qrData: string, expiresAt: Date): Promise<void> {
  const payload: CachedQR = {
    qrData,
    expiresAt: expiresAt.toISOString(),
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(QR_CACHE_KEY, JSON.stringify(payload));
}

export async function loadCachedQR(): Promise<CachedQR | null> {
  try {
    const raw = await AsyncStorage.getItem(QR_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedQR;
  } catch {
    return null;
  }
}
