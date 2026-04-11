import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageCircle,
  Download,
  Share2,
  Star,
  Award,
  Clock,
  Building2,
  Eye,
  Heart,
  Target,
  Zap,
  Mail,
  Phone,
  CheckCircle,
  Send,
  Package,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useExhibitorStore } from '../../store/exhibitorStore';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNewsStore } from '../../store/newsStore';
import { ROUTES } from '../../lib/routes';
import PublicAvailability from '../availability/PublicAvailability';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getHeroSection,
  getAboutSection,
  getGallerySection,
  getTestimonialsSection
} from '../../utils/miniSiteHelpers';

export default function ExhibitorDetailPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();

  // Chat interne : exposants, partenaires, visiteurs VIP uniquement
  const canChat = isAuthenticated && (
    user?.type === 'exhibitor' ||
    user?.type === 'partner' ||
    user?.type === 'admin' ||
    (user?.type === 'visitor' && user?.visitor_level === 'vip')
  );
  const { id } = useParams<{ id: string }>();
  const { exhibitors, selectExhibitor, selectedExhibitor, fetchExhibitors } = useExhibitorStore();
  const { articles, fetchNews } = useNewsStore();
  // activeTab temporairement retiré (non utilisé)

  useEffect(() => {
    // Charger les exposants si pas encore chargés
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  useEffect(() => {
    if (id) {
      selectExhibitor(id);
    }
  }, [id, selectExhibitor, exhibitors]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = () => {
    const availabilitySection = document.getElementById("disponibilites");
    if (availabilitySection) {
      availabilitySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fonction pour gérer le clic sur le bouton Message (chat interne)
  const handleMessageClick = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour utiliser la messagerie');
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!canChat) {
      toast.error('La messagerie est réservée aux exposants, partenaires et visiteurs VIP');
      return;
    }
    if (selectedExhibitor?.userId) {
      navigate(`/messages?userId=${selectedExhibitor.userId}`);
    } else if (selectedExhibitor?.id) {
      navigate(`/messages?exhibitorId=${selectedExhibitor.id}`);
    }
  };

  // Afficher loading pendant le chargement
  if (exhibitors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement de l'exposant...
          </h3>
        </div>
      </div>
    );
  }

  // Vérifier si l'exposant existe
  if (!selectedExhibitor && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Exposant non trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            L'exposant avec l'ID "{id}" n'existe pas ou a été supprimé.
          </p>
          <Link to={ROUTES.EXHIBITORS}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux exposants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // local non-null alias pour simplifier les accès (après la garde)
  const exhibitor = selectedExhibitor!;

  // Les données du mini-site sont maintenant chargées depuis Supabase
  // Extract sections using helper functions
  const heroSection = getHeroSection(exhibitor.miniSite);
  const aboutSection = getAboutSection(exhibitor.miniSite);
  const gallerySection = getGallerySection(exhibitor.miniSite);
  const testimonialsSection = getTestimonialsSection(exhibitor.miniSite);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Sticky */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Bouton de retour */}
            <Link to={ROUTES.EXHIBITORS}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux exposants
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <img
                src={exhibitor.logo}
                alt={exhibitor.companyName}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-bold text-gray-900">{exhibitor.companyName}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors">Accueil</a>
              <a href="#apropos" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
              <a href="#produits" className="text-gray-700 hover:text-blue-600 transition-colors">Produits</a>
              <a href="#actualites" className="text-gray-700 hover:text-blue-600 transition-colors">Actualités</a>
              <a href="#galerie" className="text-gray-700 hover:text-blue-600 transition-colors">Galerie</a>
              <a href="#disponibilites" className="text-gray-700 hover:text-blue-600 transition-colors">Disponibilités</a>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                size="sm"
                variant="default"
                onClick={() => navigate(`/minisite/${exhibitor.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Mini-site
              </Button>
              <Button size="sm"
                variant="outline"
                onClick={handleAppointmentClick}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="relative h-96 bg-cover bg-center" style={{
        backgroundImage: `url(${heroSection?.backgroundImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200'})`
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {heroSection?.title || exhibitor.companyName}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {heroSection?.subtitle || exhibitor.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const solutionsSection = document.getElementById('produits');
                  if (solutionsSection) {
                    solutionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                {heroSection?.ctaText || 'Découvrir nos solutions'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => {
                  toast.info('Catalogue PDF non disponible pour cet exposant.');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger catalogue
              </Button>
            </div>
            
            {/* Stats Hero */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {heroSection?.stats?.map((stat, index) => (
                <motion.div
                  key={`stat-${stat.label || stat.number}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white text-sm opacity-90">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {aboutSection?.title || 'À propos de nous'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {aboutSection?.description || exhibitor.description}
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {aboutSection?.values?.map((value: string, index: number) => {
              if (!value) return null;
              return (
                <motion.div
                  key={`value-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-white rounded-lg shadow-sm"
                >
                  <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{value}</h3>
                </motion.div>
              );
            })}
          </div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Certifications & Accréditations
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {aboutSection?.certifications?.map((cert) => (
                <Badge key={cert.name} variant="success" className="px-4 py-2">
                  <Award className="h-4 w-4 mr-2" />
                  {cert.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section - Design Amélioré */}
      <section id="produits" className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Package className="h-4 w-4 mr-2" />
              Nos Solutions
            </Badge>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Produits & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre gamme de solutions innovantes pour l'industrie du bâtiment et bâtiment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitor.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Image avec overlay gradient */}
                  <div className="relative h-52 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Package className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges en haut */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <Badge className="bg-white/95 text-blue-700 shadow-lg backdrop-blur-sm">
                        {product.category}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Vedette
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Spécifications avec icône */}
                    {product.specifications && (
                      <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-start gap-2">
                          <Settings className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">{product.specifications}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                          const contactSection = document.getElementById('contact');
                          if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                            setTimeout(() => {
                              const messageField = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                              if (messageField) {
                                messageField.value = `Demande de devis pour : ${product.name}\n\nCatégorie : ${product.category}\nSpécifications : ${product.specifications || 'À définir'}\n\nMerci de me faire parvenir un devis détaillé.`;
                              }
                            }, 500);
                          }
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Devis
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => {
                          toast.success('?? Téléchargement de la fiche technique...');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all"
                        onClick={handleAppointmentClick}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* CTA en bas de section */}
          {exhibitor.products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                onClick={handleMessageClick}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {canChat ? 'Envoyer un message' : 'Contactez cet exposant'}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* News Section */}
      <section id="actualites" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Actualités & Innovations
            </h2>
            <p className="text-lg text-gray-600">
              Restez informé de nos dernières nouvelles et innovations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.slice(0, 6).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="success" size="sm">
                        {article.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Link to={`${ROUTES.NEWS}/${article.id}`}>
                        <Button variant="outline" size="sm">
                          Lire la suite
                        </Button>
                      </Link>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.readTime} min de lecture</span>
                        <span className="mx-2">•</span>
                        <span>{article.views} vues</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerie" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Galerie & Réalisations
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos projets et réalisations en images
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallerySection?.images?.map((image, index) => (
              <motion.div
                key={`gallery-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                <img
                  src={image.url}
                  alt={image.alt || `Réalisation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-lg text-gray-600">
              Ce que disent nos partenaires de nos solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonialsSection?.testimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={testimonial.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-sm text-gray-500">{testimonial.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center mb-3">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={`star-${i}`} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>

                    <p className="text-gray-700 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section id="disponibilites" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prendre Rendez-vous
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Consultez les créneaux disponibles de {exhibitor.companyName} et réservez votre rencontre.
            </p>
          </motion.div>
          <PublicAvailability userId={exhibitor.id} />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600">
              Prêt à discuter de vos besoins ? Contactez notre équipe pour un devis personnalisé
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations de contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">contact@portsolutions.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600"></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">123 Port Avenue, Amsterdam, Netherlands</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nos engagements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Réponse sous 24h ouvrées</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Devis gratuit et personnalisé</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Accompagnement technique complet</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Support multilingue</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Demander un devis
                </h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input type="text"
                        name="firstName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre prénom"
                        required
                       aria-label="Votre prénom" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input type="text"
                        name="lastName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom"
                        required
                       aria-label="Votre nom" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="votre.email@entreprise.com"
                      required
                     aria-label="votre.email@entreprise.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Société
                    </label>
                    <input type="text"
                      name="company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de votre société"
                     aria-label="Nom de votre société" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input type="tel"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33 1 23 45 67 89"
                     aria-label="+33 1 23 45 67 89" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objet *
                    </label>
                    <select
                      name="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="quote">Demande de devis</option>
                      <option value="information">Demande d'informations</option>
                      <option value="partnership">Partenariat commercial</option>
                      <option value="support">Support technique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre projet et vos besoins..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();

                      toast.success(`?? Message envoyé avec succès ! Nous vous répondrons sous 24h.`);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ma demande
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer vos opérations BTP ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 500 ports dans le monde qui font confiance à nos solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const demoData = {
                    company: selectedExhibitor?.companyName,
                    products: selectedExhibitor?.products.length || 0,
                    duration: '30 minutes',
                    format: 'Démonstration interactive'
                  };
                  
                  toast.success(`?? Démonstration programmée pour ${demoData.company}`);
                }}
              >
                <Target className="h-5 w-5 mr-2" />
                Demander une démonstration
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => {
                  toast.info('Catalogue complet non disponible pour cet exposant.');
                }}
              >
                <Download className="h-5 w-5 mr-2" />
                Télécharger notre catalogue
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Mini-Site */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
        <img
          src={exhibitor.logo}
          alt={exhibitor.companyName}
          className="h-10 w-10 rounded-lg"
        />
        <span className="font-bold text-xl">{exhibitor.companyName}</span>
              </div>
              <p className="text-gray-400 mb-4">
                {exhibitor.description}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  {exhibitor.miniSite?.views || 0} vues
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><a href="#apropos" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#produits" className="text-gray-400 hover:text-white transition-colors">Produits</a></li>
                <li><a href="#actualites" className="text-gray-400 hover:text-white transition-colors">Actualités</a></li>
              </ul>
            </div>

            {/* SIB Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">SIB 2026</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>1-3 Avril 2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Casablanca, Maroc</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Stand {exhibitor.id === '1' ? 'A-12' : exhibitor.id === '2' ? 'B-08' : 'C-15'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {exhibitor.companyName}. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              Propulsé par SIB 2026
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - positionné au-dessus du widget chatbot */}
      <div className="fixed bottom-24 right-6 z-50">
        <div className="flex flex-col space-y-3">
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            title={t('ui.contact_info')}
            onClick={handleMessageClick}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            title={t('ui.book_appointment')}
            onClick={handleAppointmentClick}
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            onClick={() => {
              let favorites: string[] = [];
              try {
                const stored = localStorage.getItem('SIB-favorites');
                if (stored) {
                  favorites = JSON.parse(stored);
                }
              } catch (e) {
                console.error('Failed to parse favorites:', e);
                favorites = [];
              }
              const isFavorite = favorites.includes(exhibitor.id);

              if (isFavorite) {
                const newFavorites = favorites.filter((id: string) => id !== exhibitor.id);
                localStorage.setItem('SIB-favorites', JSON.stringify(newFavorites));
                toast.success(`Favoris mis à jour — retiré: ${exhibitor.companyName}`);
              } else {
                favorites.push(exhibitor.id);
                localStorage.setItem('SIB-favorites', JSON.stringify(favorites));
                toast.success(`Favoris mis à jour — ajouté: ${exhibitor.companyName}`);
              }
            }}
            title={t('ui.add_remove_favorite')}
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
