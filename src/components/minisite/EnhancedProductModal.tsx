import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  CheckCircle2,
  MessageCircle,
  Share2,
  Mail,
  Linkedin,
  Twitter,
  Copy,
  Check,
  FileText,
  Download,
  Truck,
  Award,
  TrendingUp,
  Info,
  List,
  Settings,
  Package
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import { getEmbedUrl } from '../../utils/videoUtils';

interface EnhancedProductModalProps {
  product: any;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  onClose: () => void;
  onContactClick: () => void;
}

// Composant Image Sécurisée
const SafeImage: React.FC<{ src?: string; alt: string; className?: string; fallback: React.ReactNode }> = ({ src, alt, className, fallback }) => {
  const [error, setError] = useState(false);
  if (!src || error) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export default function EnhancedProductModal({ product: rawProduct, theme, onClose, onContactClick }: EnhancedProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'specs'>('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  // Mapper snake_case vers camelCase (fallback si pas déjà transformé)
  const product = {
    ...rawProduct,
    isNew: rawProduct.is_new ?? rawProduct.isNew ?? false,
    inStock: rawProduct.in_stock ?? rawProduct.inStock ?? true,
    certified: rawProduct.certified ?? false,
    deliveryTime: rawProduct.delivery_time ?? rawProduct.deliveryTime,
    originalPrice: rawProduct.original_price ?? rawProduct.originalPrice,
    videoUrl: rawProduct.video_url ?? rawProduct.videoUrl,
    documents: rawProduct.documents ?? [],
    specifications: rawProduct.specifications ?? '',
  };

  // Préparer la galerie d'images
  const images = product.images?.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : [];

  // Navigation galerie
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Partage
  const shareProduct = (platform: string) => {
    const url = window.location.href;
    const text = `Découvrez ${product.name}`;
    
    switch (platform) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        toast.success('Lien copié !');
        setTimeout(() => setCopiedLink(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  // Badges produit
  const renderBadges = () => {
    const badges = [];
    if (product.isNew) badges.push({ label: 'Nouveau', icon: TrendingUp, color: 'bg-blue-500' });
    if (product.inStock !== false) badges.push({ label: 'En stock', icon: CheckCircle2, color: 'bg-green-500' });
    if (product.certified) badges.push({ label: 'Certifié', icon: Award, color: 'bg-purple-500' });
    if (product.deliveryTime) badges.push({ label: `Livraison: ${product.deliveryTime}`, icon: Truck, color: 'bg-orange-500' });
    
    return badges.map((badge, idx) => (
      <div key={idx} className={`${badge.color} text-white px-3 py-1 rounded-full text-xs flex items-center gap-1`}>
        <badge.icon className="h-3 w-3" />
        {badge.label}
      </div>
    ));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec Galerie d'Images */}
        <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Image principale */}
          {images.length > 0 ? (
            <SafeImage 
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)` }}>
                  <Package className="h-24 w-24" style={{ color: theme.primaryColor }} />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)` }}>
              <Package className="h-24 w-24" style={{ color: theme.primaryColor }} />
            </div>
          )}

          {/* Navigation galerie */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
              
              {/* Indicateurs */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* Bouton Partage */}
          <div className="absolute top-4 right-16 z-10">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Menu de partage */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-2 min-w-[180px]"
                >
                  <button onClick={() => shareProduct('email')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Email</span>
                  </button>
                  <button onClick={() => shareProduct('linkedin')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                  <button onClick={() => shareProduct('twitter')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button onClick={() => shareProduct('copy')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left">
                    {copiedLink ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                    <span className="text-sm">{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Badge catégorie */}
          {product.category && (
            <div className="absolute bottom-4 left-4">
              <Badge style={{ backgroundColor: theme.accentColor, color: 'white' }} className="text-sm">
                {product.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Contenu Principal */}
        <div className="overflow-y-auto max-h-[calc(90vh-20rem)]">
          <div className="p-6">
            {/* En-tête produit */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-3" style={{ color: theme.primaryColor }}>
                {product.name}
              </h2>
              
              {/* Badges informatifs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {renderBadges()}
              </div>

              {/* Prix */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold" style={{ color: theme.accentColor }}>
                  {typeof product.price === 'number' 
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)
                    : product.price || 'Sur devis'}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
                )}
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'border-current font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeTab === 'overview' ? { color: theme.primaryColor } : {}}
                >
                  <Info className="h-4 w-4" />
                  Vue d'ensemble
                </button>
                {product.features?.length > 0 && (
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'features'
                        ? 'border-current font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'features' ? { color: theme.primaryColor } : {}}
                  >
                    <List className="h-4 w-4" />
                    Caractéristiques
                  </button>
                )}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'specs'
                        ? 'border-current font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'specs' ? { color: theme.primaryColor } : {}}
                  >
                    <Settings className="h-4 w-4" />
                    Spécifications
                  </button>
                )}
              </div>
            </div>

            {/* Contenu des onglets */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Onglet Vue d'ensemble */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-gray-800">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {product.description || 'Aucune description disponible pour ce produit.'}
                      </p>
                    </div>

                    {/* Vidéo si disponible */}
                    {getEmbedUrl(product.videoUrl) && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">Vidéo de démonstration</h3>
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <iframe
                            src={getEmbedUrl(product.videoUrl)!}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Documents téléchargeables */}
                    {product.documents?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">Documents</h3>
                        <div className="space-y-2">
                          {product.documents.map((doc: any, idx: number) => (
                            <a
                              key={idx}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                                  <FileText className="h-5 w-5" style={{ color: theme.primaryColor }} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.size || 'PDF'}</p>
                                </div>
                              </div>
                              <Download className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Caractéristiques */}
                {activeTab === 'features' && product.features?.length > 0 && (
                  <div>
                    <ul className="space-y-3">
                      {product.features.map((feature: string, idx: number) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: theme.accentColor }} />
                          <span className="text-gray-700">{typeof feature === 'string' ? feature : (feature?.name || feature?.title || '')}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Onglet Spécifications */}
                {activeTab === 'specs' && product.specifications && (
                  <div className="space-y-4">
                    {typeof product.specifications === 'string' ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">{product.specifications}</p>
                      </div>
                    ) : Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value], idx) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{key}</span>
                            <p className="text-lg font-semibold text-gray-800 mt-1">{String(value)}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer avec actions */}
          <div className="border-t bg-gray-50 p-6">
            <div className="flex gap-3">
              <Button 
                className="flex-1 text-white font-semibold py-3"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={() => {
                  onContactClick();
                  onClose();
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Demander un devis
              </Button>
              <Button 
                variant="outline" 
                className="py-3"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
