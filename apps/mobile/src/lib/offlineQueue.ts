import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@urbaevent/offline-scan-queue';

export interface PendingScanLog {
  id: string;
  qrData: string;
  zone: string;
  valid: boolean;
  reason?: string;
  userId?: string;
  userName?: string;
  userType?: string;
  userLevel?: string;
  scannedAt: string;
}

export async function enqueueScanLog(entry: Omit<PendingScanLog, 'id'>): Promise<void> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue: PendingScanLog[] = raw ? JSON.parse(raw) : [];
  queue.push({ ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
}

export async function getPendingScanLogs(): Promise<PendingScanLog[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearPendingScanLogs(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
