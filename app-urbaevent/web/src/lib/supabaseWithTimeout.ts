/**
 * Wrapper Supabase avec timeout et retry automatiques
 * Utilise les helpers de apiHelpers.ts
 */

import { supabase } from './supabase';
import { robustAPICall } from '../utils/apiHelpers';

/**
 * Wrapper pour les appels Supabase select avec timeout/retry
 */
export async function supabaseSelect<T = any>(
  tableName: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    single?: boolean;
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const { select = '*', filters = {}, single = false, timeout = 10000, retryOptions } = options;

  return robustAPICall(
    async () => {
      let query = supabase.from(tableName).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (single) {
        return await query.single();
      }

      return await query;
    },
    { timeout, retry: retryOptions || { maxRetries: 3 } }
  );
}

/**
 * Wrapper pour les appels Supabase insert avec timeout/retry
 */
export async function supabaseInsert<T = any>(
  tableName: string,
  data: any,
  options: {
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const { timeout = 10000, retryOptions } = options;

  return robustAPICall(
    async () => {
      return await supabase.from(tableName).insert(data).select().single();
    },
    { timeout, retry: retryOptions || { maxRetries: 2 } } // Less retries for inserts
  );
}

/**
 * Wrapper pour les appels Supabase update avec timeout/retry
 */
export async function supabaseUpdate<T = any>(
  tableName: string,
  updates: any,
  filters: Record<string, any>,
  options: {
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const { timeout = 10000, retryOptions } = options;

  return robustAPICall(
    async () => {
      let query = supabase.from(tableName).update(updates);

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      return await query.select();
    },
    { timeout, retry: retryOptions || { maxRetries: 2 } }
  );
}

/**
 * Wrapper pour les appels Supabase delete avec timeout/retry
 */
export async function supabaseDelete(
  tableName: string,
  filters: Record<string, any>,
  options: {
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: any | null; error: any }> {
  const { timeout = 10000, retryOptions } = options;

  return robustAPICall(
    async () => {
      let query = supabase.from(tableName).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      return await query;
    },
    { timeout, retry: retryOptions || { maxRetries: 1 } } // Less retries for deletes
  );
}

/**
 * Wrapper pour les RPC calls avec timeout/retry
 */
export async function supabaseRPC<T = any>(
  functionName: string,
  params: any = {},
  options: {
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const { timeout = 15000, retryOptions } = options; // Longer timeout for RPC

  return robustAPICall(
    async () => {
      return await supabase.rpc(functionName, params);
    },
    { timeout, retry: retryOptions || { maxRetries: 3 } }
  );
}

/**
 * Wrapper pour les storage uploads avec timeout
 */
export async function supabaseStorageUpload(
  bucket: string,
  path: string,
  file: File,
  options: {
    timeout?: number;
    retryOptions?: any;
  } = {}
): Promise<{ data: any | null; error: any }> {
  const { timeout = 30000, retryOptions } = options; // Longer timeout for uploads

  return robustAPICall(
    async () => {
      return await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    },
    { timeout, retry: retryOptions || { maxRetries: 2 }, rateLimit: false } // No rate limit for uploads
  );
}

export default {
  select: supabaseSelect,
  insert: supabaseInsert,
  update: supabaseUpdate,
  delete: supabaseDelete,
  rpc: supabaseRPC,
  storageUpload: supabaseStorageUpload
};
