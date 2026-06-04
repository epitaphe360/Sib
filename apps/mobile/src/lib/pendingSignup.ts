import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@urbaevent/pending-signup';

export type SignupIntent = 'free' | 'vip';

export interface PendingSignup {
  intent: SignupIntent;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  phone?: string;
  company?: string;
  position?: string;
  createdAt: string;
}

export async function savePendingSignup(data: Omit<PendingSignup, 'createdAt'>): Promise<void> {
  const payload: PendingSignup = { ...data, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function loadPendingSignup(): Promise<PendingSignup | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}

export async function clearPendingSignup(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
