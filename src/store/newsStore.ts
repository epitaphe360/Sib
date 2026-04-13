import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Articles de fallback pour quand la base de données est vide ou indisponible
const fallbackArticles: NewsArticle[] = [
  {
    id: 'fallback-1',
    title: 'SIB 2026 : Le Salon International du Bâtiment et de la Logistique',
    excerpt: 'Découvrez le plus grand événement bâtiment d\'Afrique du Nord prévu pour 2026. Une occasion unique de réseautage et de découvertes.',
    content: 'SIB 2026 est le rendez-vous incontournable des professionnels du secteur du bâtiment et logistique. Cet événement majeur réunira les acteurs clés de l\'industrie du bâtiment pour échanger sur les innovations, les défis et les opportunités du secteur.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-15'),
    category: 'Événements',
    tags: ['SIB', 'salon', 'bâtiment', 'logistique'],
    featured: true,
    image: 'https://picsum.photos/seed/bâtiment/800/400',
    readTime: 3,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
    views: 1250
  },
  {
    id: 'fallback-2',
    title: 'Innovation BTP : Les Technologies qui Transforment nos Bâtiments',
    excerpt: 'Intelligence artificielle, automatisation, IoT : les bâtiments modernes adoptent les technologies de pointe pour améliorer leur efficacité.',
    content: 'Les bâtiments du monde entier investissent massivement dans les nouvelles technologies. De l\'automatisation des grues à l\'intelligence artificielle pour optimiser les flux, découvrez les innovations qui façonnent l\'avenir du secteur de la construction.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-10'),
    category: 'Innovation',
    tags: ['technologie', 'innovation', 'automatisation', 'IA'],
    featured: true,
    image: 'https://picsum.photos/seed/technology/800/400',
    readTime: 5,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
    views: 890
  },
  {
    id: 'fallback-3',
    title: 'Développement Durable : Les Bâtiments s\'engagent pour l\'Environnement',
    excerpt: 'Les initiatives écologiques se multiplient dans les bâtiments pour réduire l\'empreinte carbone du transport construction.',
    content: 'Face aux enjeux climatiques, les bâtiments adoptent des stratégies ambitieuses pour réduire leur impact environnemental. Énergies renouvelables, électrification des chantiers, réduction des déchets de construction : tour d\'horizon des bonnes pratiques.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-12-05'),
    category: 'Environnement',
    tags: ['écologie', 'développement durable', 'environnement'],
    featured: true,
    image: 'https://picsum.photos/seed/nature/800/400',
    readTime: 4,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
    views: 756
  },
  {
    id: 'fallback-4',
    title: 'Le Commerce Bâtiment en Méditerranée : Perspectives 2026',
    excerpt: 'Analyse des tendances du commerce construction méditerranéen et des opportunités pour les acteurs du secteur.',
    content: 'La Méditerranée reste un carrefour stratégique pour le commerce mondial. Avec l\'évolution des routes commerciales et les nouveaux accords, le bassin méditerranéen offre de nombreuses opportunités de croissance.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-28'),
    category: 'Commerce',
    tags: ['commerce', 'méditerranée', 'import-export'],
    featured: false,
    image: 'https://picsum.photos/seed/trade/800/400',
    readTime: 6,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
    views: 620
  },
  {
    id: 'fallback-5',
    title: 'Formation et Emploi : Les Métiers du Bâtiment de Demain',
    excerpt: 'Le secteur du bâtiment recrute ! Découvrez les formations et les opportunités de carrière dans l\'industrie du bâtiment.',
    content: 'Le secteur du bâtiment est en pleine mutation et recherche de nouveaux talents. Des métiers traditionnels aux nouvelles spécialités liées à la digitalisation, les opportunités sont nombreuses pour ceux qui souhaitent faire carrière dans ce domaine.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-20'),
    category: 'Emploi',
    tags: ['emploi', 'formation', 'carrière', 'métiers'],
    featured: false,
    image: 'https://picsum.photos/seed/career/800/400',
    readTime: 4,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
    views: 543
  },
  {
    id: 'fallback-6',
    title: 'Sécurité Chantier : Les Nouvelles Normes Internationales',
    excerpt: 'Les standards de sécurité évoluent pour répondre aux nouveaux défis du transport construction mondial.',
    content: 'La sécurité reste une priorité absolue dans les installations BTP. Cybersécurité, contrôle des accès, prévention des risques : découvrez les dernières réglementations et innovations en matière de sécurité bâtiment.',
    author: 'Équipe SIB',
    publishedAt: new Date('2025-11-15'),
    category: 'Sécurité',
    tags: ['sécurité', 'normes', 'réglementation'],
    featured: false,
    image: 'https://picsum.photos/seed/security/800/400',
    readTime: 5,
    source: 'sibs',
    sourceUrl: 'https://sibevent.com/actualite-bâtiment/',
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
  source: 'sibs' | 'external';
  sourceUrl?: string;
  views: number;
}

interface NewsState {
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  categories: string[];
  totalArticles: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  selectedCategory: string;
  searchTerm: string;
  
  // Actions
  fetchNews: (reset?: boolean) => Promise<void>;
  loadMoreNews: () => Promise<void>;
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
  totalArticles: 0,
  currentPage: 0,
  pageSize: 12,
  hasMore: true,
  isLoading: false,
  selectedCategory: '',
  searchTerm: '',

  fetchNews: async (reset = true) => {
    set({ isLoading: true });
    try {
      const state = get();
      const nextPage = reset ? 0 : state.currentPage;
      const offset = nextPage * state.pageSize;

      // Essayer de charger depuis Supabase
      const { data, error, count } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, category, featured_image, is_published, published_at, views, slug, title_en, excerpt_en, content_en', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(offset, offset + state.pageSize - 1);

      if (error) {
        console.warn('⚠️ Erreur Supabase, utilisation du fallback:', error);
        throw error;
      }

      let pageArticles: NewsArticle[] = [];

      if (data && data.length > 0) {
        // Images de fallback par catégorie (picsum.photos - hotlinking libre et fiable)
        const fallbackImages: Record<string, string> = {
          'Événements': 'https://picsum.photos/seed/bâtiment/800/400',
          'Innovation': 'https://picsum.photos/seed/technology/800/400',
          'Environnement': 'https://picsum.photos/seed/nature/800/400',
          'Commerce': 'https://picsum.photos/seed/trade/800/400',
          'Emploi': 'https://picsum.photos/seed/career/800/400',
          'Sécurité': 'https://picsum.photos/seed/security/800/400',
          'Actualité': 'https://picsum.photos/seed/news/800/400'
        };

        // Articles depuis la base de données
        pageArticles = data.map((article: any, index: number) => ({
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
          featured: reset ? index < 3 : false,
          image: (() => {
            const img = article.featured_image;
            if (!img) return fallbackImages[article.category || 'Actualité'] || fallbackImages['Actualité'];
            if (img.startsWith('http')) return img;
            // Chemin relatif Supabase storage → construire l'URL complète
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            return `${supabaseUrl}/storage/v1/object/public/${img}`;
          })(),
          readTime: Math.ceil((article.content || '').replace(/<[^>]*>/g, '').split(' ').length / 200),
          source: 'sibs' as const,
          views: article.views || 0
        }));
        console.log(`✅ ${pageArticles.length} articles chargés depuis Supabase (page)`);
      } else {
        // Utiliser les articles de fallback
        pageArticles = fallbackArticles;
        console.log('📰 Utilisation des articles de fallback');
      }

      const mergedArticles = reset
        ? pageArticles
        : [...state.articles, ...pageArticles.filter(article => !state.articles.some(existing => existing.id === article.id))];

      const featuredArticles = mergedArticles.filter(a => a.featured).slice(0, 3);
      const categories = [...new Set(mergedArticles.map(article => article.category))];
      const resolvedTotal = count ?? mergedArticles.length;

      set({
        articles: mergedArticles,
        featuredArticles: featuredArticles.length > 0 ? featuredArticles : mergedArticles.slice(0, 3),
        categories,
        totalArticles: resolvedTotal,
        currentPage: reset ? 1 : nextPage + 1,
        hasMore: mergedArticles.length < resolvedTotal,
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
        totalArticles: fallbackArticles.length,
        currentPage: 1,
        hasMore: false,
        isLoading: false 
      });
    }
  },

  loadMoreNews: async () => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;
    await get().fetchNews(false);
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
      await get().fetchNews(true);

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
      await get().fetchNews(true);

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
      await get().fetchNews(true);
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
      await get().fetchNews(true);
    } catch (_error) {
      console.error('❌ Erreur suppression article:', _error);
      throw _error;
    }
  }
}));