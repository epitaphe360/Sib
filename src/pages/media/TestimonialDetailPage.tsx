import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, BookmarkPlus, Quote, ThumbsUp, Building2, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VideoStreamPlayer } from '../../components/media/VideoStreamPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  title: string;
  description: string;
  content_url?: string;
  thumbnail_url?: string;
  category?: string;
  speaker_name: string;
  speaker_title?: string;
  speaker_company?: string;
  speaker_avatar?: string;
  quote_text?: string;
  published_date?: string;
  rating?: number;
  is_video?: boolean;
  created_at: string;
}

export const TestimonialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

  useEffect(() => {
    if (id) {
      loadTestimonial();
    }
  }, [id]);

  const loadTestimonial = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, content_url:video_url, thumbnail_url, category, speaker_name, speaker_title, speaker_company, speaker_avatar, quote_text, published_date:published_at, rating, is_video, created_at')
        .eq('id', id)
        .eq('type', 'testimonial')
        .maybeSingle();

      if (error) throw error;
      setTestimonial(data);
    } catch (error) {
      console.error('Error loading testimonial:', error);
      toast.error('Erreur lors du chargement du témoignage');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
    toast.success(isHelpful ? 'Merci !' : 'Merci pour votre retour !');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: testimonial?.title,
        text: testimonial?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Témoignage introuvable</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player or Quote Card */}
            {testimonial.is_video && testimonial.content_url ? (
              <div className="relative">
                <Badge 
                  variant="default" 
                  className="absolute top-4 left-4 z-10 bg-green-600"
                >
                  💬 Témoignage Vidéo
                </Badge>
                <VideoStreamPlayer
                  src={testimonial.content_url}
                  poster={testimonial.thumbnail_url}
                  title={testimonial.title}
                  isLive={false}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
                <Quote className="h-12 w-12 text-green-600 mb-4" />
                <blockquote className="text-2xl font-medium text-gray-900 italic mb-6">
                  "{testimonial.quote_text || testimonial.description}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  {testimonial.speaker_avatar ? (
                    <img
                      src={testimonial.speaker_avatar}
                      alt={testimonial.speaker_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-white">
                        {testimonial.speaker_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.speaker_name}
                    </div>
                    {testimonial.speaker_title && (
                      <div className="text-sm text-gray-600">
                        {testimonial.speaker_title}
                      </div>
                    )}
                    {testimonial.speaker_company && (
                      <div className="text-sm text-gray-600">
                        {testimonial.speaker_company}
                      </div>
                    )}
                  </div>
                </div>
                {testimonial.rating && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    {renderStars(testimonial.rating)}
                  </div>
                )}
              </div>
            )}

            {/* Title & Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Quote className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600 uppercase">Témoignage</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {testimonial.title}
              </h1>

              {testimonial.category && (
                <Badge variant="secondary" className="mb-4">{testimonial.category}</Badge>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={isHelpful ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleHelpful}
                  className={isHelpful ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {isHelpful ? 'Utile' : 'Utile ?'}
                </Button>
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {isSaved ? 'Enregistré' : 'Enregistrer'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>

              {/* Stats */}
              {testimonial.published_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Publié le {formatDate(testimonial.published_date)}
                </div>
              )}
            </div>

            {/* Full Testimonial */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Témoignage complet
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {testimonial.description}
                </p>
              </div>
            </div>

            {/* About the Person */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de {testimonial.speaker_name}
              </h2>
              <div className="flex items-start space-x-4">
                {testimonial.speaker_avatar ? (
                  <img
                    src={testimonial.speaker_avatar}
                    alt={testimonial.speaker_name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {testimonial.speaker_name}
                  </h3>
                  {testimonial.speaker_title && (
                    <p className="text-gray-600 mb-1">{testimonial.speaker_title}</p>
                  )}
                  {testimonial.speaker_company && (
                    <p className="text-gray-600 flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {testimonial.speaker_company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Related Testimonials */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Autres témoignages
              </h2>
              <p className="text-gray-600 text-sm">
                Découvrez ce que disent les autres participants...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Speaker Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profil
              </h3>
              <div className="text-center">
                {testimonial.speaker_avatar ? (
                  <img
                    src={testimonial.speaker_avatar}
                    alt={testimonial.speaker_name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-semibold text-green-600">
                      {testimonial.speaker_name.charAt(0)}
                    </span>
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 mb-1">
                  {testimonial.speaker_name}
                </h4>
                {testimonial.speaker_title && (
                  <p className="text-sm text-gray-600 mb-1">
                    {testimonial.speaker_title}
                  </p>
                )}
                {testimonial.speaker_company && (
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {testimonial.speaker_company}
                  </p>
                )}
              </div>
            </div>

            {/* Rating Card */}
            {testimonial.rating && (
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg p-6 text-white text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  {testimonial.rating.toFixed(1)}
                </div>
                <div className="mb-3">{renderStars(testimonial.rating)}</div>
                <p className="text-sm text-green-100">
                  Note attribuée par le participant
                </p>
              </div>
            )}

            {/* Testimonials Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Témoignages SIB
              </h3>
              <p className="text-sm text-gray-600">
                Découvrez les retours d'expérience authentiques de nos participants et exposants.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="text-lg font-semibold mb-2">
                Partagez votre expérience
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Vous aussi, racontez votre expérience SIB et inspirez la communauté
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/testimonials/submit">
                  Laisser un témoignage
                </Link>
              </Button>
            </div>

            {/* Browse More */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Plus de témoignages
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Explorez tous les témoignages
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/media/testimonials">
                  Voir tous les témoignages
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
