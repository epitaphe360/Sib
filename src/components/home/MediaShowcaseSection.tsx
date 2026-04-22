/**
 * SIB 2026 — MediaShowcaseSection
 * Galerie media, grille masonry-like, lightbox epure.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabaseMedia } from '../../hooks/useSupabaseContent';
import { useWordPressMedia } from '../../hooks/useWordPressContent';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { IMAGES } from '../../lib/images';

interface MediaItem {
  id: string | number;
  title: string;
  url: string;
  thumbnail?: string;
  alt?: string;
}

const Lightbox: React.FC<{ image: string; title: string; onClose: () => void }> = ({ image, title, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      aria-label="Fermer"
    >
      <X className="w-5 h-5" />
    </button>
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
      className="max-w-6xl w-full"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
      />
      {title && (
        <p className="text-white/90 text-center mt-4 text-base font-medium tracking-wide">{title}</p>
      )}
    </motion.div>
  </motion.div>
);

export const MediaShowcaseSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const { t } = useTranslation();

  const { data: supabaseMedia, loading: supabaseLoading } = useSupabaseMedia(8, 'image');
  const { data: wpMedia, loading: wpLoading } = useWordPressMedia(8);

  const mediaItems = supabaseMedia?.length > 0 ? supabaseMedia : wpMedia;
  const loading = supabaseLoading || wpLoading;

  const defaultMedia: MediaItem[] = [
    { id: 1, title: 'Architecture', url: IMAGES.hero.architecture, alt: 'Architecture moderne' },
    { id: 2, title: 'Chantier', url: IMAGES.hero.construction, alt: 'Chantier' },
    { id: 3, title: 'Rencontre B2B', url: IMAGES.business.meeting, alt: 'Rencontre B2B' },
    { id: 4, title: 'Exposition', url: IMAGES.events.expo, alt: 'Exposition' },
    { id: 5, title: 'Matériaux', url: IMAGES.materials.steel, alt: 'Matériaux' },
    { id: 6, title: 'Design', url: IMAGES.hero.design, alt: 'Design' },
    { id: 7, title: 'Innovation', url: IMAGES.tech.innovation, alt: 'Innovation' },
    { id: 8, title: 'Conférence', url: IMAGES.events.conference, alt: 'Conférence' },
  ];

  const displayMedia = mediaItems || defaultMedia;

  return (
    <>
      <section className="relative py-20 lg:py-24 bg-primary-900 overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <div className="sib-kicker mb-4 justify-center !text-accent-500">
              {t('media.gallery_badge')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
              {t('media.gallery_title')}
            </h2>
            <p className="text-base lg:text-lg text-white/70 leading-relaxed">
              {t('media.gallery_desc')}
            </p>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {displayMedia.map((item: any, index: number) => (
                <motion.button
                  type="button"
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-primary-900"
                  onClick={() => setSelectedImage(item)}
                >
                  <SmartImage
                    source={item.thumbnail || item.url || IMAGES.business.meeting}
                    aspect="1/1"
                    rounded="none"
                    zoom
                    imgClassName="transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-semibold truncate tracking-tight">
                      {item.title}
                    </p>
                  </div>

                  {/* Expand icon */}
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Expand className="w-3.5 h-3.5 text-white" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/media-library">
              <Button variant="accent" size="lg" className="group">
                {t('media.view_gallery')}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
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
