import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Articles de fallback pour quand la base de données est vide ou indisponible
const fallbackArticles: NewsArticle[] = [
  {
    id: 'fallback-1',
    title: 'SIB 2026 : Le Salon International du B�timent et de la Logistique',
    excerpt: 'Découvrez le plus grand événement portuaire d\'Afrique du Nord prévu pour 2026. Une occasion unique de réseautage et de découvertes.',
    content: 'SIB 2026 est le rendez-vous incontournable des professionnels du secteur portuaire et logistique. Cet événement majeur réunira les acteurs clés de l\'industrie maritime pour échanger sur les innovations, les défis et les opportunités du secteur.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-15'),
    category: 'Événements',
    tags: ['SIB', 'salon', 'port', 'logistique'],
    featured: true,
    image: 'https://picsum.photos/seed/port/800/400',
    readTime: 3,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 1250
  },
  {
    id: 'fallback-2',
    title: 'Innovation Portuaire : Les Technologies qui Transforment nos Ports',
    excerpt: 'Intelligence artificielle, automatisation, IoT : les ports modernes adoptent les technologies de pointe pour améliorer leur efficacité.',
    content: 'Les ports du monde entier investissent massivement dans les nouvelles technologies. De l\'automatisation des grues à l\'intelligence artificielle pour optimiser les flux, découvrez les innovations qui façonnent l\'avenir du secteur maritime.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-10'),
    category: 'Innovation',
    tags: ['technologie', 'innovation', 'automatisation', 'IA'],
    featured: true,
    image: 'https://picsum.photos/seed/technology/800/400',
    readTime: 5,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 890
  },
  {
    id: 'fallback-3',
    title: 'Développement Durable : Les Ports s\'engagent pour l\'Environnement',
    excerpt: 'Les initiatives écologiques se multiplient dans les ports pour réduire l\'empreinte carbone du transport maritime.',
    content: 'Face aux enjeux climatiques, les ports adoptent des stratégies ambitieuses pour réduire leur impact environnemental. Énergies renouvelables, électrification des quais, gestion des déchets : tour d\'horizon des bonnes pratiques.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-05'),
    category: 'Environnement',
    tags: ['écologie', 'développement durable', 'environnement'],
    featured: true,
    image: 'https://picsum.photos/seed/nature/800/400',
    readTime: 4,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 756
  },
  {
    id: 'fallback-4',
    title: 'Le Commerce Maritime en Méditerranée : Perspectives 2026',
    excerpt: 'Analyse des tendances du commerce maritime méditerranéen et des opportunités pour les acteurs du secteur.',
    content: 'La Méditerranée reste un carrefour stratégique pour le commerce mondial. Avec l\'évolution des routes commerciales et les nouveaux accords, le bassin méditerranéen offre de nombreuses opportunités de croissance.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-28'),
    category: 'Commerce',
    tags: ['commerce', 'méditerranée', 'import-export'],
    featured: false,
    image: 'https://picsum.photos/seed/trade/800/400',
    readTime: 6,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 620
  },
  {
    id: 'fallback-5',
    title: 'Formation et Emploi : Les Métiers du Port de Demain',
    excerpt: 'Le secteur portuaire recrute ! Découvrez les formations et les opportunités de carrière dans l\'industrie maritime.',
    content: 'Le secteur portuaire est en pleine mutation et recherche de nouveaux talents. Des métiers traditionnels aux nouvelles spécialités liées à la digitalisation, les opportunités sont nombreuses pour ceux qui souhaitent faire carrière dans ce domaine.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-20'),
    category: 'Emploi',
    tags: ['emploi', 'formation', 'carrière', 'métiers'],
    featured: false,
    image: 'https://picsum.photos/seed/career/800/400',
    readTime: 4,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 543
  },
  {
    id: 'fallback-6',
    title: 'Sécurité Portuaire : Les Nouvelles Normes Internationales',
    excerpt: 'Les standards de sécurité évoluent pour répondre aux nouveaux défis du transport maritime mondial.',
    content: 'La sécurité reste une priorité absolue dans les installations portuaires. Cybersécurité, contrôle des accès, prévention des risques : découvrez les dernières réglementations et innovations en matière de sécurité portuaire.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-15'),
    category: 'Sécurité',
    tags: ['sécurité', 'normes', 'réglementation'],
    featured: false,
    image: 'https://picsum.photos/seed/security/800/400',
    readTime: 5,
    source: 'SIB',
    sourceUrl: 'https://sib2026.ma/actualite-portuaire/',
    views: 412
  }
];

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  title_en?: string | null;
  excerpt_en?: string | null;
  content_en?: string | null;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  featured: boolean;
  image: string; // Image toujours définie avec fallback
  readTime: number;
  source: 'SIB' | 'external';
  sourceUrl?: string;
  views: number;
}

interface NewsState {
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  categories: string[];
  isLoading: boolean;
  selectedCategory: string;
  searchTerm: string;
  
  // Actions
  fetchNews: () => Promise<void>;
  fetchFromOfficialSite: () => Promise<void>;
  getArticleById: (id: string) => NewsArticle | null;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  getFilteredArticles: () => NewsArticle[];
  createNewsArticle: (articleData: Partial<NewsArticle>) => Promise<void>;
  updateNewsArticle: (id: string, updates: Partial<NewsArticle>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;
}


export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  featuredArticles: [],
  categories: [],
  isLoading: false,
  selectedCategory: '',
  searchTerm: '',

  fetchNews: async () => {
    set({ isLoading: true });
    try {
      // Essayer de charger depuis Supabase
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, category, featured_image, is_published, published_at, views, slug, title_en, excerpt_en, content_en')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Erreur Supabase, utilisation du fallback:', error);
        throw error;
      }

      let articles: NewsArticle[] = [];

      if (data && data.length > 0) {
        // Images de fallback par catégorie (picsum.photos - hotlinking libre et fiable)
        const fallbackImages: Record<string, string> = {
          'Événements': 'https://picsum.photos/seed/port/800/400',
          'Innovation': 'https://picsum.photos/seed/technology/800/400',
          'Environnement': 'https://picsum.photos/seed/nature/800/400',
          'Commerce': 'https://picsum.photos/seed/trade/800/400',
          'Emploi': 'https://picsum.photos/seed/career/800/400',
          'Sécurité': 'https://picsum.photos/seed/security/800/400',
          'Actualité': 'https://picsum.photos/seed/news/800/400'
        };

        // Articles depuis la base de données
        articles = data.map((article: any, index: number) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt ? article.excerpt.replace(/<[^>]*>/g, '').trim() : '',
          content: article.content,
          title_en: article.title_en || null,
          excerpt_en: article.excerpt_en || null,
          content_en: article.content_en || null,
          author: 'SIB Event',
          publishedAt: new Date(article.published_at || ''),
          category: article.category || 'Actualité',
          tags: [],
          featured: index < 3,
          image: (() => {
            const img = article.featured_image;
            if (!img) return fallbackImages[article.category || 'Actualité'] || fallbackImages['Actualité'];
            if (img.startsWith('http')) return img;
            // Chemin relatif Supabase storage → construire l'URL complète
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            return `${supabaseUrl}/storage/v1/object/public/${img}`;
          })(),
          readTime: Math.ceil((article.content || '').replace(/<[^>]*>/g, '').split(' ').length / 200),
          source: 'SIB' as const,
          views: article.views || 0
        }));
        console.log(`✅ ${articles.length} articles chargés depuis Supabase`);
      } else {
        // Utiliser les articles de fallback
        articles = fallbackArticles;
        console.log('📰 Utilisation des articles de fallback');
      }

      const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
      const categories = [...new Set(articles.map(article => article.category))];

      set({
        articles,
        featuredArticles: featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 3),
        categories,
        isLoading: false
      });
    } catch (_error) {
      console.error('Erreur chargement articles, utilisation du fallback:', _error);
      // En cas d'erreur, utiliser les articles de fallback
      const categories = [...new Set(fallbackArticles.map(article => article.category))];
      set({ 
        articles: fallbackArticles,
        featuredArticles: fallbackArticles.filter(a => a.featured).slice(0, 3),
        categories,
        isLoading: false 
      });
    }
  },

  fetchFromOfficialSite: async () => {
    set({ isLoading: true });
    try {
      
      // Appeler l'Edge Function de synchronisation
      const { data, error } = await supabase.functions.invoke('sync-news-articles', {
        body: {}
      });

      if (error) {
        console.error('❌ Error syncing articles:', error);
        throw error;
      }


      // Recharger les articles depuis la base de données
      await get().fetchNews();

      return data;
    } catch (error) {
      console.error('❌ Failed to sync articles:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  getFilteredArticles: () => {
    const { articles, selectedCategory, searchTerm } = get();
    
    return articles.filter(article => {
      const title = article.title || '';
      const excerpt = article.excerpt || '';
      const tags = article.tags || [];
      const search = searchTerm.toLowerCase();

      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        title.toLowerCase().includes(search) ||
        excerpt.toLowerCase().includes(search) ||
        tags.some(tag => tag.toLowerCase().includes(search));
      
      return matchesCategory && matchesSearch;
    });
  },

  getArticleById: (id: string) => {
    const { articles } = get();
    return articles.find(article => article.id === id) || null;
  },

  createNewsArticle: async (articleData: Partial<NewsArticle>) => {
    set({ isLoading: true });

    try {

      // Insérer dans la base de données
      const { data, error } = await supabase
        .from('news_articles')
        .insert([{
          title: articleData.title || 'Sans titre',
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          category: articleData.category || 'Général',
          featured_image: articleData.image || null,
          is_published: true,
          published_at: new Date().toISOString(),
          views: 0
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur insertion article:', error);
        throw new Error(error.message || JSON.stringify(error));
      }


      // Recharger les articles
      await get().fetchNews();

      set({ isLoading: false });
    } catch (_error) {
      console.error('❌ Erreur création article:', _error);
      set({ isLoading: false });
      throw _error;
    }
  },

  updateNewsArticle: async (id: string, updates: Partial<NewsArticle>) => {
    try {

      // Mettre à jour dans la base de données
      const { error } = await supabase
        .from('news_articles')
        .update({
          title: updates.title,
          excerpt: updates.excerpt,
          content: updates.content,
          category: updates.category,
          featured_image: updates.image,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur mise à jour article:', error);
        throw error;
      }


      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur mise à jour article:', _error);
      throw _error;
    }
  },

  deleteNewsArticle: async (id: string) => {
    try {

      // Supprimer de la base de données
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression article:', error);
        throw error;
      }


      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur suppression article:', _error);
      throw _error;
    }
  }
}));