import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Package, CheckCircle, Tag, Truck, Play, FileText,
  Download, ExternalLink, TrendingDown, Info, Star,
  AlertTriangle, Award
} from 'lucide-react';

interface ProductDetailModalProps {
  product: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    images?: string[];
    price?: number;
    originalPrice?: number;
    specifications?: string;
    technicalSpecs?: Array<{ name: string; value: string; unit?: string }>;
    featured?: boolean;
    isNew?: boolean;
    inStock?: boolean;
    certified?: boolean;
    deliveryTime?: string;
    videoUrl?: string;
    documents?: Array<{ name: string; url: string; type?: string }>;
    brochure?: string;
  } | null;
  exhibitorName?: string;
  onClose: () => void;
}

export default function ProductDetailModal({ product, exhibitorName, onClose }: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  const images = product.images?.filter(Boolean) || [];
  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100)
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                {product.category || 'Produit'}
              </span>
              {exhibitorName && (
                <span className="text-xs text-gray-400 truncate hidden sm:block">par {exhibitorName}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

              {/* Colonne gauche — galerie */}
              <div className="bg-gray-50 p-5 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-gray-100">
                {/* Image principale */}
                <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 aspect-square">
                  {images[activeImage] ? (
                    <img
                      src={images[activeImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-200" />
                    </div>
                  )}
                  {/* Badges superposés */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.featured && (
                      <span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                        <Star className="h-3 w-3" /> Vedette
                      </span>
                    )}
                    {product.isNew && (
                      <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                        Nouveau
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  {product.inStock === false && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <div className="bg-white/90 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Rupture de stock
                      </div>
                    </div>
                  )}
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          activeImage === i ? 'border-[#1e3a5f]' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Badges infos rapides */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    product.inStock !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    {product.inStock !== false ? 'En stock' : 'Rupture'}
                  </div>
                  {product.certified && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <Award className="h-3.5 w-3.5 shrink-0" />
                      Certifié
                    </div>
                  )}
                  {product.deliveryTime && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100 col-span-2">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      Livraison : {product.deliveryTime}
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite — détails */}
              <div className="p-6 space-y-5">
                {/* Titre & Prix */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h2>
                  {(product.price || product.originalPrice) && (
                    <div className="flex items-baseline gap-3 mt-2">
                      {product.price && (
                        <span className="text-2xl font-bold text-[#1e3a5f]">
                          {product.price.toLocaleString('fr-MA')} <span className="text-base font-medium">MAD</span>
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-base text-gray-400 line-through">
                          {product.originalPrice!.toLocaleString('fr-MA')} MAD
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" /> Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Spécifications textuelles */}
                {product.specifications && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Spécifications
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.specifications}
                    </p>
                  </div>
                )}

                {/* Spécifications techniques (tableau) */}
                {product.technicalSpecs && product.technicalSpecs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5" /> Fiche technique
                    </h4>
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      {product.technicalSpecs.map((spec, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                            i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          <span className="text-gray-500 font-medium">{spec.name}</span>
                          <span className="text-gray-900 font-semibold">
                            {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vidéo */}
                {product.videoUrl && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Vidéo produit
                    </h4>
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                    >
                      <div className="p-2 bg-[#1e3a5f] rounded-lg">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1e3a5f]">
                        Voir la vidéo de présentation
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  </div>
                )}

                {/* Documents */}
                {product.documents && product.documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Documents
                    </h4>
                    <div className="space-y-2">
                      {product.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                        >
                          <Download className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#1e3a5f] truncate">
                            {doc.name}
                          </span>
                          {doc.type && (
                            <span className="text-xs text-gray-400 uppercase shrink-0 ml-auto">{doc.type}</span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brochure */}
                {product.brochure && (
                  <a
                    href={product.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm hover:bg-[#1e4976] transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger la brochure
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
