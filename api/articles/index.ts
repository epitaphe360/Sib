/**
 * API Endpoint pour lister tous les articles publiés
 * Compatible avec WordPress et Elementor Pro
 * 
 * Usage: GET /api/articles?limit=10&offset=0&category=Événement
 * Returns: JSON avec liste des articles
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

  const { 
    limit = '10', 
    offset = '0', 
    category,
    search 
  } = req.query;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('news_articles')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    // Filtrer par catégorie si spécifié
    if (category) {
      query = query.eq('category', category);
    }

    // Recherche par titre si spécifié
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    // Formater la réponse pour WordPress/Elementor
    const response = {
      success: true,
      data: articles || [],
      pagination: {
        total: count || 0,
        limit: limitNum,
        offset: offsetNum,
        hasMore: count ? (offsetNum + limitNum) < count : false,
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
