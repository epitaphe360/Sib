import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ProductService } from '../services/products/productService';
import { ROUTES } from '../lib/routes';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, Mail, Star, CheckCircle, Clock, FileText, Play, Package, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getEmbedUrl } from '../utils/videoUtils';

export default function ProductDetailPage() {
  const { exhibitorId, productId } = useParams<{ exhibitorId: string; productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!productId) { setError('Produit introuvable'); setLoading(false); return; }
      try {
        setLoading(true);
        const p = await ProductService.getProductById(productId);
        setProduct(p);
      } catch (e) {
        console.error(e);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const bookRdv = () => {
    if (!exhibitorId) return;
    const target = `${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`;
    if (!isAuthenticated) navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(target)}`);
    else navigate(target);
  };

  const contactExhibitor = () => {
    // Optionally this page could receive exhibitor email via location state; fallback toast
    toast.info("Contactez l'exposant depuis sa page détaillée");
    if (exhibitorId) navigate(`/exhibitors/${exhibitorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Chargement du produitâ…</div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-red-600 mb-4">{error || 'Produit non trouvé'}</p>
        {exhibitorId && (
          <Link to={`/exhibitors/${exhibitorId}`} className="text-blue-600 underline">Retour à l'exposant</Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => exhibitorId ? navigate(`/exhibitors/${exhibitorId}`) : navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">Aucune image</div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {product.images.slice(1).map((img, idx) => (
                    <img key={`img-${img.slice(-20)}-${idx}`} src={img} alt={`${product.name}-${idx}`} className="w-20 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </Card>

            <div>
              {/* En-tête avec badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(product as any).is_new && (
                  <Badge variant="success" size="sm" className="bg-green-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" /> Nouveau
                  </Badge>
                )}
                {(product as any).certified && (
                  <Badge variant="default" size="sm" className="bg-blue-500 text-white">
                    <Shield className="h-3 w-3 mr-1" /> Certifié
                  </Badge>
                )}
                <Badge variant="default" size="sm">{product.category}</Badge>
                {product.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Prix et disponibilité */}
              <div className="flex items-center gap-4 mb-4">
                {(product as any).price && (
                  <div className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((product as any).price)}
                  </div>
                )}
                {(product as any).original_price && (
                  <div className="text-lg text-gray-400 line-through">{(product as any).original_price}</div>
                )}
              </div>

              {/* Statut stock et livraison */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {(product as any).in_stock !== undefined && (
                  <div className={`flex items-center gap-1 ${(product as any).in_stock ? 'text-green-600' : 'text-red-600'}`}>
                    {(product as any).in_stock ? (
                      <><CheckCircle className="h-4 w-4" /> En stock</>
                    ) : (
                      <><Package className="h-4 w-4" /> Sur commande</>
                    )}
                  </div>
                )}
                {(product as any).delivery_time && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" /> {(product as any).delivery_time}
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Vidéo de présentation */}
              {(product as any).video_url && getEmbedUrl((product as any).video_url) && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-red-500" /> Vidéo de présentation
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={getEmbedUrl((product as any).video_url)!}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Vidéo ${product.name}`}
                    />
                  </div>
                </Card>
              )}

              {product.specifications && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-2">Spécifications</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{product.specifications}</p>
                </Card>
              )}

              {product.technicalSpecs && product.technicalSpecs.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-2">Caractéristiques techniques</h3>
                  <ul className="list-disc pl-6 text-sm text-gray-700">
                    {product.technicalSpecs.map((s) => (
                      <li key={`spec-${s.name}`}>{s.name}: {s.value}{s.unit ? ` ${s.unit}` : ''}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Documents téléchargeables */}
              {(product as any).documents && (product as any).documents.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Documents à télécharger
                  </h3>
                  <div className="space-y-2">
                    {(product as any).documents.map((doc: any, idx: number) => (
                      <a
                        key={`doc-${idx}`}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                            {doc.type || 'PDF'}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span className="text-xs">{doc.size}</span>
                          <Download className="h-4 w-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="default" onClick={bookRdv}>
                  <Calendar className="h-4 w-4 mr-2" /> Prendre RDV
                </Button>
                <Button variant="outline" onClick={contactExhibitor}>
                  <Mail className="h-4 w-4 mr-2" /> Contacter
                </Button>
                {product.brochure && (
                  <a href={product.brochure} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Brochure</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


