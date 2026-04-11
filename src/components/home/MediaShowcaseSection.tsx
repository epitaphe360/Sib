/**
 * Section Galerie Média sur la HomePage
 * Affiche photos/vidéos depuis Supabase (ou WordPress en fallback)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabaseMedia } from '../../hooks/useSupabaseContent';
import { useWordPressMedia } from '../../hooks/useWordPressContent';
import { useTranslation } from '../../hooks/useTranslation';

interface MediaItem {
  id: string | number;
  title: string;
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface LightboxProps {
  image: string;
  title: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ image, title, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-SIB-gold transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-6xl w-full"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        {title && (
          <p className="text-white text-center mt-4 text-lg">{title}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export const MediaShowcaseSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const { t } = useTranslation();
  
  // Essayer Supabase d'abord, puis WordPress
  const { data: supabaseMedia, loading: supabaseLoading } = useSupabaseMedia(8, 'image');
  const { data: wpMedia, loading: wpLoading } = useWordPressMedia(8);
  
  const mediaItems = supabaseMedia?.length > 0 ? supabaseMedia : wpMedia;
  const loading = supabaseLoading || wpLoading;

  // Médias par défaut si aucune source disponible
  const defaultMedia: MediaItem[] = [
    {
      id: 1,
      title: 'Port moderne',
      url: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800',
      alt: 'Port moderne'
    },
    {
      id: 2,
      title: 'Container shipping',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      alt: 'Container shipping'
    },
    {
      id: 3,
      title: 'Terminal portuaire',
      url: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?w=800',
      alt: 'Terminal portuaire'
    },
    {
      id: 4,
      title: 'construction et BTP',
      url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
      alt: 'construction et BTP'
    },
    {
      id: 5,
      title: 'Smart Port',
      url: 'https://images.unsplash.com/photo-1605745341075-1a8f0b1d064e?w=800',
      alt: 'Smart Port'
    },
    {
      id: 6,
      title: 'Shipping vessels',
      url: 'https://images.unsplash.com/photo-1568876694728-451bbf694b83?w=800',
      alt: 'Shipping vessels'
    },
    {
      id: 7,
      title: 'Port infrastructure',
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      alt: 'Port infrastructure'
    },
    {
      id: 8,
      title: 'Maritime technology',
      url: 'https://images.unsplash.com/photo-1534313916812-f0b8a3d19e7a?w=800',
      alt: 'Maritime technology'
    }
  ];

  const displayMedia = mediaItems || defaultMedia;

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-SIB-primary to-blue-900 relative overflow-hidden">
        {/* Pattern lumineux */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
              <ImageIcon className="w-6 h-6 text-SIB-gold" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {t('media.gallery_badge')}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('media.gallery_title')}
            </h2>
            
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              {t('media.gallery_desc')}
            </p>
          </motion.div>

          {/* Grid de médias */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {displayMedia.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer shadow-lg"
                  onClick={() => setSelectedImage(item)}
                >
                  <img
                    src={item.thumbnail || item.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'}
                    alt={item.alt || item.title || 'Image du salon'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                    }}
                  />
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-gradient-to-t from-SIB-primary via-SIB-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-semibold truncate">
                      {item.title}
                    </p>
                  </div>

                  {/* Icône agrandir */}
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bouton Voir toute la galerie */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/media-library"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-SIB-gold to-amber-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>{t('media.view_gallery')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <Lightbox
            image={selectedImage.url}
            title={selectedImage.title}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
