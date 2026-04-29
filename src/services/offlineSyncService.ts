/**
 * Service de synchronisation offline — Badge Scanner — SIB 2026
 *
 * Sur un salon, le réseau est souvent saturé.
 * Ce service permet de scanner des badges hors-ligne et de les synchroniser
 * automatiquement dès que le réseau revient.
 *
 * Stockage : IndexedDB via l'API native (pas de dépendance externe)
 * Sync : listener navigator.onLine + periodic retry toutes les 30s
 */
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PendingScan {
  id: string;
  visitorId: string;
  scannedBy: string;     // ID du personnel sécurité / exposant
  scannedAt: string;     // ISO string
  location?: string;     // Entrée A, Stand B12, etc.
  badgeType: 'visitor' | 'exhibitor' | 'partner' | 'vip' | 'press';
  syncStatus: 'pending' | 'syncing' | 'done' | 'error';
  retryCount: number;
  errorMessage?: string;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = 'sib2026-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-scans';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('scannedAt', 'scannedAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(scan: PendingScan): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(scan);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGetPending(): Promise<PendingScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('syncStatus');
    const req = index.getAll('pending');
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Classe principale ────────────────────────────────────────────────────────

class OfflineSyncService {
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private listeners: Array<(pending: number) => void> = [];

  /** Enregistre un scan (fonctionne online et offline) */
  async recordScan(data: Omit<PendingScan, 'id' | 'syncStatus' | 'retryCount'>): Promise<void> {
    const scan: PendingScan = {
      ...data,
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      syncStatus: 'pending',
      retryCount: 0,
    };

    // Si online → tenter sync directe
    if (navigator.onLine) {
      try {
        await this.syncSingle(scan);
        return;
      } catch {
        // Fallback vers la file offline
      }
    }

    await dbPut(scan);
    this.notifyListeners();
  }

  /** Sync d'un scan unique vers Supabase */
  private async syncSingle(scan: PendingScan): Promise<void> {
    if (!supabase) throw new Error('Supabase non disponible');

    await supabase.from('badge_scans').insert({
      id: scan.id,
      visitor_id: scan.visitorId,
      scanned_by: scan.scannedBy,
      scanned_at: scan.scannedAt,
      location: scan.location,
      badge_type: scan.badgeType,
    });
  }

  /** Synchronise tous les scans en attente */
  async syncPending(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine || !supabase) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const pending = await dbGetPending();
      if (pending.length === 0) return { synced: 0, failed: 0 };

      for (const scan of pending) {
        try {
          await dbPut({ ...scan, syncStatus: 'syncing' });
          await this.syncSingle(scan);
          await dbDelete(scan.id);
          synced++;
        } catch (err) {
          const retryCount = scan.retryCount + 1;
          if (retryCount >= 5) {
            // Abandon après 5 tentatives
            await dbPut({
              ...scan,
              syncStatus: 'error',
              retryCount,
              errorMessage: err instanceof Error ? err.message : 'Erreur inconnue',
            });
          } else {
            await dbPut({ ...scan, syncStatus: 'pending', retryCount });
          }
          failed++;
        }
      }
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { synced, failed };
  }

  /** Nombre de scans en attente */
  async getPendingCount(): Promise<number> {
    try {
      const pending = await dbGetPending();
      return pending.length;
    } catch {
      return 0;
    }
  }

  /** Démarre la surveillance + retry automatique */
  startSync(): void {
    // Sync dès que le réseau revient
    window.addEventListener('online', () => this.syncPending());

    // Retry toutes les 30 secondes
    this.syncTimer = setInterval(() => {
      if (navigator.onLine) this.syncPending();
    }, 30_000);

    // Sync initiale au démarrage
    if (navigator.onLine) this.syncPending();
  }

  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    window.removeEventListener('online', () => this.syncPending());
  }

  /** S'abonner aux changements du nombre de scans en attente */
  onPendingChange(listener: (pending: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.getPendingCount().then(count => {
      this.listeners.forEach(l => l(count));
    });
  }
}

export const offlineSyncService = new OfflineSyncService();
