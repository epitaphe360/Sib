import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrintRecord {
  id: string;
  badgeCode: string;
  fullName: string;
  printedAt: string;
  stationId: string;
}

const KEY = '@sib/print_history';
const STATION_ID = 'MOBILE-STATION';

export async function getPrintHistory(): Promise<PrintRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PrintRecord[];
  } catch {
    return [];
  }
}

export async function recordPrint(badgeCode: string, fullName: string): Promise<void> {
  const history = await getPrintHistory();
  const record: PrintRecord = {
    id: `${Date.now()}`,
    badgeCode,
    fullName,
    printedAt: new Date().toISOString(),
    stationId: STATION_ID,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([record, ...history].slice(0, 100)));
}

export function getPrintStats(history: PrintRecord[]) {
  const today = new Date().toDateString();
  const todayCount = history.filter((r) => new Date(r.printedAt).toDateString() === today).length;
  return { total: history.length, today: todayCount };
}
