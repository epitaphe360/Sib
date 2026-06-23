import React, { memo } from 'react';
import { Star, Heart } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: string;
  category?: string;
  features?: string[];
}

interface ProductsSectionProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onFavoriteClick?: (productId: string) => void;
}

// OPTIMIZATION: Memoized products section component
export const ProductsSection: React.FC<ProductsSectionProps> = memo(({
  products,
  onProductClick,
  onFavoriteClick
}) => {
  if (products.length === 0) {
    return (
      <section id="produits" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Produits & Services</h2>
          <div className="text-center text-gray-500 py-12">
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produits" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Produits & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {onFavoriteClick && (
                      <button
                        onClick={() => onFavoriteClick(product.id)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    {product.category && (
                      <Badge
                        variant="default"
                        className="absolute bottom-3 left-3 bg-blue-600 text-white"
                      >
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                    {product.features && product.features.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {product.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="text-sm text-gray-500 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      {product.price && (
                        <span className="text-lg font-bold text-blue-600">{product.price}</span>
                      )}
                      {onProductClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProductClick(product)}
                        >
                          En savoir plus
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});

ProductsSection.displayName = 'ProductsSection';
