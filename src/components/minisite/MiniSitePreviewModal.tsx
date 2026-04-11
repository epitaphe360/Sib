import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { X, Edit, Check, AlertCircle } from 'lucide-react';

interface MiniSitePreviewModalProps {
  data: any;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isCreating?: boolean;
}

export const MiniSitePreviewModal: React.FC<MiniSitePreviewModalProps> = ({
  data,
  onConfirm,
  onEdit,
  onCancel,
  isCreating = false
}) => {
  if (!data) return null;

  const { company, logo, description, products, socials, contact, stats } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 relative">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Prévisualisation de votre mini-site</h2>
              <p className="text-blue-100">{t('minisite.preview.verify')}</p>
            </div>
            <button aria-label="Close"
              onClick={onCancel}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
              disabled={isCreating}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Statistiques de scraping */}
          {stats && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Résultats du scraping</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.productsFound || 0}</div>
                  <div className="text-sm text-blue-700">{t('minisite.preview.products_found')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.imagesFound || 0}</div>
                  <div className="text-sm text-blue-700">Images trouvées</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.socialsFound || 0}</div>
                  <div className="text-sm text-blue-700">Réseaux sociaux</div>
                </div>
              </div>
            </div>
          )}

          {/* Informations principales */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                Informations de l'entreprise
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  {logo && (
                    <img 
                      src={logo} 
                      alt={company} 
                      className="w-20 h-20 object-contain rounded-lg border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 text-sm mb-1">Nom de l'entreprise</div>
                    <div className="text-lg font-bold text-gray-900">{company || 'Non trouvé'}</div>
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700 text-sm mb-1">Description</div>
                  <div className="text-gray-900">{description || 'Aucune description trouvée'}</div>
                </div>

                {contact && (
                  <div className="grid grid-cols-2 gap-4">
                    {contact.email && (
                      <div>
                        <div className="font-semibold text-gray-700 text-sm mb-1">Email</div>
                        <div className="text-gray-900">{contact.email}</div>
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <div className="font-semibold text-gray-700 text-sm mb-1">Téléphone</div>
                        <div className="text-gray-900">{contact.phone}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Produits */}
          {products && products.length > 0 && (
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    {t('minisite.section.products')}
                  </span>
                  <Badge variant="info">{products.length} trouvés</Badge>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {products.slice(0, 5).map((product: any) => (
                    <div key={`product-${product.name || product.id}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">{product.description}</div>
                          )}
                          {product.price && (
                            <div className="text-sm font-semibold text-blue-600 mt-1">{product.price}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length > 5 && (
                    <div className="text-center text-sm text-gray-500">
                      {t('minisite.preview.more_products', { count: products.length - 5 })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Réseaux sociaux */}
          {socials && socials.length > 0 && (
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Réseaux Sociaux
                  </span>
                  <Badge variant="info">{socials.length} trouvés</Badge>
                </h3>
                <div className="space-y-2">
                  {socials.map((social: string) => (
                    <a
                      key={social}
                      href={social}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm truncate"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Message si peu de données */}
          {(!products || products.length === 0) && (!socials || socials.length === 0) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-900">Peu d'informations trouvées</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Le scraping a trouvé peu d'informations. Vous pourrez compléter manuellement après la création.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onEdit}
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{t('minisite.preview.edit')}</span>
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={onConfirm}
                disabled={isCreating}
                className="flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t('minisite.preview.create')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

