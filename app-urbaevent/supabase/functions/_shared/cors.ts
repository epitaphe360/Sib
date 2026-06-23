/**
 * CORS Headers for Supabase Edge Functions
 * Used to allow cross-origin requests from the frontend
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, x-supabase-auth',
  'Access-Control-Expose-Headers': 'content-length, x-json',
  'Access-Control-Max-Age': '86400',
};

