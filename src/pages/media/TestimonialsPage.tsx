import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Search, Star } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';
import { MediaCard } from '../../components/media/MediaCard';
import { ROUTES } from '../../lib/routes';
import { PageHero } from '../../components/ui/PageHero';

export const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const filters = { type: 'testimonial' as const, status: 'published' as const };
      const data = await mediaService.getMedia(filters);
      setTestimonials(data);
    } catch (error) {
      console.error('Erreur chargement témoignages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        badge={<><MessageSquare className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Témoignages</span></>}
        title={<>{t('pages.testimonials.title')}</>}
        subtitle={t('pages.testimonials.description')}
        py="py-16 md:py-20"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('media.testimonial.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('media.testimonial.no_results')}</h3>
            <p className="text-gray-500">{t('media.testimonial.no_results_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <MediaCard key={testimonial.id} media={testimonial} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




export default TestimonialsPage;
