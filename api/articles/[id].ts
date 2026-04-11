/**
 * API Endpoint pour récupérer un article par son ID
 * Compatible avec WordPress et Elementor Pro
 * 
 * Usage: GET /api/articles/[id]
 * Returns: JSON avec les données de l'article
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
    return res.status(400).json({ error: 'Article ID required' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: article, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Formater la réponse pour WordPress/Elementor
    const response = {
      success: true,
      data: {
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        author: article.author,
        category: article.category,
        tags: article.tags || [],
        image_url: article.image_url,
        published_at: article.published_at,
        created_at: article.created_at,
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
