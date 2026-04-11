import { supabase, isSupabaseReady } from '../lib/supabase';

// Whitelist of allowed tables - prevents SQL injection and unauthorized access
const ALLOWED_TABLES = [
  'exhibitors',
  'products',
  'events',
  'news_articles',
  'partners',
  'mini_sites',
  'users',
  'activities',
  'analytics',
  'appointments',
  'conversations',
  'messages',
  'time_slots',
  'event_registrations',
  'networking_recommendations',
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];

// Safe columns to select per table - prevents exposure of sensitive data
const SAFE_COLUMNS: Record<AllowedTable, string> = {
  'exhibitors': 'id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info',
  'products': 'id, exhibitor_id, name, description, category, images, specifications, price, featured',
  'events': 'id, title, description, type, event_date, start_time, end_time, location, capacity, registered, category, virtual, featured, meeting_link, tags',
  'news_articles': 'id, title, content, excerpt, author, tags, featured_image, published, published_at, views',
  'partners': 'id, company_name, partner_type, description, logo_url, website, sector, verified, featured, contact_info',
  'mini_sites': 'id, exhibitor_id, theme, custom_colors, sections, published, view_count, updated_at',
  'users': 'id, email, name, type, visitor_level, status, created_at, updated_at',
  'activities': 'id, user_id, activity_type, description, related_entity_type, related_entity_id, is_public, created_at',
  'analytics': 'id, user_id, event_type, event_data, session_id, created_at',
  'appointments': 'id, exhibitor_id, visitor_id, time_slot_id, status, message, meeting_type, created_at',
  'conversations': 'id, participants, type, title, is_active, last_message_at, created_at',
  'messages': 'id, conversation_id, sender_id, content, message_type, read, created_at',
  'time_slots': 'id, user_id, date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location',
  'event_registrations': 'id, event_id, user_id, registration_type, status, registration_date, attended_at',
  'networking_recommendations': 'id, user_id, recommended_user_id, recommendation_type, score, reasons, category, viewed, contacted',
};

/**
 * Validates if a table name is in the allowed list
 */
function validateTable(tableName: string): asserts tableName is AllowedTable {
  if (!ALLOWED_TABLES.includes(tableName as AllowedTable)) {
    throw new Error(`Table "${tableName}" is not allowed. Access denied.`);
  }
}

/**
 * API Service with security validations
 * IMPORTANT: This service is for PUBLIC read-only access
 * For authenticated operations, use SupabaseService directly
 */
export const apiService = {
  /**
   * Get all records from an allowed table
   * Only returns safe columns to prevent data exposure
   */
  async getAll(tableName: string) {
    if (!isSupabaseReady() || !supabase) {
      console.warn('Supabase is not configured. Returning empty array.');
      return [];
    }

    validateTable(tableName);
    const columns = SAFE_COLUMNS[tableName];

    const { data, error } = await supabase
      .from(tableName)
      .select(columns);

    if (error) {
      console.error(`API Service error fetching ${tableName}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Get a single record by ID from an allowed table
   * Only returns safe columns to prevent data exposure
   */
  async getById(tableName: string, id: string) {
    if (!isSupabaseReady() || !supabase) {
      console.warn('Supabase is not configured. Returning null.');
      return null;
    }

    validateTable(tableName);
    const columns = SAFE_COLUMNS[tableName];

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID parameter');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`API Service error fetching ${tableName}/${id}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async create(_tableName: string, _newData: any) {
    throw new Error('Create operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async update(_tableName: string, _id: string, _updatedData: any) {
    throw new Error('Update operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },

  /**
   * DEPRECATED: Use SupabaseService for authenticated operations
   * This method is disabled for security reasons
   */
  async delete(_tableName: string, _id: string) {
    throw new Error('Delete operations are not allowed through apiService. Use SupabaseService for authenticated operations.');
  },
};

