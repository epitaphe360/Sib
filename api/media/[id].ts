/**
 * API Endpoint pour récupérer un média par son ID
 * Compatible avec WordPress et Elementor Pro
 * 
 * Usage: GET /api/media/[id]
 * Returns: JSON avec les données du média
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  // CORS headers pour permettre l'accès depuis WordPress
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Media ID required' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: media, error } = await supabase
      .from('media_contents')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching media:', error);
      return res.status(404).json({ error: 'Media not found' });
    }

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Formater la réponse pour WordPress/Elementor
    const response = {
      success: true,
      data: {
        id: media.id,
        type: media.type,
        title: media.title,
        description: media.description,
        video_url: media.video_url,
        audio_url: media.audio_url,
        thumbnail_url: media.thumbnail_url,
        category: media.category,
        status: media.status,
        views_count: media.views_count || 0,
        likes_count: media.likes_count || 0,
        shares_count: media.shares_count || 0,
        tags: media.tags || [],
        duration: media.duration,
        created_at: media.created_at,
      },
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
