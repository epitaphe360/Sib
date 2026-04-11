import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, User, Tag as TagIcon } from 'lucide-react';
import { sanitizeArticleContent } from '@/utils/sanitizeHtml';

interface ShortcodeProps {
  content: string;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string | null;
  tags: string[];
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

/**
 * Composant pour parser et rendre les shortcodes dans le contenu
 * Usage: <ShortcodeRenderer content="Texte avec [article id='123'] dedans" />
 */
export function ShortcodeRenderer({ content }: ShortcodeProps) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseAndRenderShortcodes();
  }, [content]);

  const parseAndRenderShortcodes = async () => {
    setLoading(true);
    
    // Regex pour détecter les shortcodes [article id="..."]
    const shortcodeRegex = /\[article\s+id=["']([^"']+)["']\]/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    // Trouver tous les shortcodes
    const matches = Array.from(content.matchAll(shortcodeRegex));
    
    if (matches.length === 0) {
      // Pas de shortcode, retourner le contenu tel quel
      setRenderedContent([content]);
      setLoading(false);
      return;
    }

    // Charger tous les articles nécessaires
    const articleIds = matches.map(m => m[1]);
    const articles = await loadArticles(articleIds);

    // Parser le contenu
    while ((match = shortcodeRegex.exec(content)) !== null) {
      // Ajouter le texte avant le shortcode
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIndex++}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Ajouter l'article rendu
      const articleId = match[1];
      const article = articles.find(a => a.id === articleId);
      
      if (article) {
        parts.push(
          <ArticleDisplay key={`article-${keyIndex++}`} article={article} />
        );
      } else {
        parts.push(
          <div key={`error-${keyIndex++}`} className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ Article non trouvé (ID: {articleId})
          </div>
        );
      }

      lastIndex = shortcodeRegex.lastIndex;
    }

    // Ajouter le texte après le dernier shortcode
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    setRenderedContent(parts);
    setLoading(false);
  };

  const loadArticles = async (ids: string[]): Promise<ArticleData[]> => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, author, category, tags, image_url, published_at, created_at, published')
        .in('id', ids)
        .eq('published', true) // Seulement les articles publiés
        .range(0, 49);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur chargement articles:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return <div className="shortcode-content">{renderedContent}</div>;
}

/**
 * Composant pour afficher un article
 */
function ArticleDisplay({ article }: { article: ArticleData }) {
  return (
    <Card className="my-6 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image à la une */}
      {article.image_url && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Catégorie et statut */}
        <div className="flex items-center space-x-2 mb-3">
          {article.category && (
            <Badge variant="secondary" className="text-xs">
              📁 {article.category}
            </Badge>
          )}
          <Badge variant="default" className="text-xs">
            ✅ Publié
          </Badge>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-gray-600 text-lg mb-4 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Contenu - Sanitized to prevent XSS attacks */}
        <div
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content) }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
            <TagIcon className="h-4 w-4 text-gray-400" />
            {article.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Hook pour utiliser le shortcode renderer
 * Usage: const renderedContent = useShortcodeParser(content)
 */
export function useShortcodeParser(content: string) {
  return <ShortcodeRenderer content={content} />;
}

export default ShortcodeRenderer;
