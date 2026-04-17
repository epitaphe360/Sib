import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Plus,
  Loader,
  Eye,
  Save
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';
import { useNewsStore } from '../../store/newsStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';

interface NewArticleForm {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
  readTime: number;
  sourceUrl: string;
}

export default function NewsArticleCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuthStore();
  const { createNewsArticle, updateNewsArticle, getArticleById, fetchNews, articles } = useNewsStore(); // Added updateNewsArticle, getArticleById, fetchNews, articles
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<NewArticleForm>({
    title: '',
    excerpt: '',
    content: '',
    author: (user?.profile?.firstName || '') + ' ' + (user?.profile?.lastName || ''),
    category: '',
    tags: [],
    featured: false,
    image: '',
    readTime: 5,
    sourceUrl: ''
  });

  useEffect(() => {
    const loadArticle = async () => {
      if (isEditMode && editId) {
        // Ensure articles are loaded
        if (articles.length === 0) {
           await fetchNews();
        }

        const article = getArticleById(editId);
        if (article) {
          setFormData({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            author: article.author,
            category: article.category,
            tags: article.tags || [],
            featured: article.featured,
            image: article.image || '',
            readTime: article.readTime,
            sourceUrl: article.sourceUrl || ''
          });
        }
      }
    };

    loadArticle();
  }, [isEditMode, editId, getArticleById, fetchNews, articles.length]); // Dependencies

  const [newTag, setNewTag] = useState('');

  const categories = [
    'Événement',
    'Innovation',
    'Partenariat',
    'Durabilité',
    'Formation',
    'Commerce',
    'Technologie',
    'Infrastructure'
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
        featured: formData.featured,
        image: formData.image,
        readTime: formData.readTime,
        source: 'SIB' as const,
        sourceUrl: formData.sourceUrl,
        // Don't update publishedAt on edit, only on create
        ...(isEditMode ? {} : { publishedAt: new Date() }),
        views: isEditMode ? undefined : 0
      };

      if (isEditMode && editId) {
        await updateNewsArticle(editId, articleData);
        toast.success(`✏️ Article mis à jour : ${formData.title}`);
      } else {
        await createNewsArticle(articleData as any);
        toast.success(`✅ Article publié : ${formData.title}`);
      }

      // Rediriger vers la page des actualités
      navigate(ROUTES.ADMIN_NEWS); // Changed from ROUTES.NEWS to ADMIN_NEWS to go back to admin list

    } catch (error) {
      setIsSubmitting(false);
      const action = isEditMode ? 'modification' : 'création';
      toast.error(error instanceof Error ? `Erreur ${action} article: ${error.message}` : `Erreur inconnue lors de la ${action} de l'article`);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = (content || '').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleContentChange = (content: string) => {
    const readTime = calculateReadTime(content);
    setFormData({
      ...formData,
      content,
      readTime
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Admin
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Mettre à jour les informations de l\'article' : 'Publier une nouvelle actualité bâtiment'}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'article *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre accrocheur de votre article"
                  />
                </div>

                {/* Extrait */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extrait/Résumé *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Résumé de l'article qui apparaîtra dans la liste..."
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu de l'article *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rédigez le contenu complet de votre article..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Temps de lecture estimé: {formData.readTime} minute{formData.readTime > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de couverture
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="w-32 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* URL Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL source (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://source-originale.com/article"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Métadonnées */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Métadonnées</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Article à la une</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mots-clés</h3>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajouter un tag"
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center font-medium rounded-full px-2.5 py-1 text-sm bg-SIB-primary/10 text-SIB-primary border border-SIB-primary/20 cursor-pointer hover:bg-SIB-primary/20"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Masquer' : 'Prévisualiser'}
                </Button>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title || !formData.excerpt || !formData.content || !formData.category}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Publier l'Article
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Aperçu de l'Article
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                    Fermer
                  </Button>
                </div>

                {/* Article Preview */}
                <article className="prose prose-lg max-w-none">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt={formData.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <Badge variant="info" size="sm">
                      {formData.category}
                    </Badge>
                    <span>{new Date().toLocaleDateString('fr-FR')}</span>
                    <span>{formData.readTime} min de lecture</span>
                    <span>Par {formData.author}</span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {formData.title}
                  </h1>

                  <p className="text-xl text-gray-600 mb-6 italic">
                    {formData.excerpt}
                  </p>

                  <div className="text-gray-800 whitespace-pre-wrap">
                    {formData.content}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Mots-clés :</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="info" size="sm">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
