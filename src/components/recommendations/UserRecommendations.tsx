import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { Exhibitor, Product } from '../../types';
import { ROUTES } from '../../lib/routes';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

interface Recommendation {
  itemId: string;
  itemType: string;
  similarityScore: number;
}

interface RecommendationWithDetails extends Recommendation {
  exhibitor?: Exhibitor;
  product?: Product;
}

const UserRecommendations: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) {
        setError("Veuillez vous connecter pour voir les recommandations.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await SupabaseService.getRecommendationsForUser(user.id, 6);

        // ⚡ FIX N+1: Fetch exhibitors ONCE instead of once per recommendation
        const exhibitors = await SupabaseService.getExhibitors();

        // Enrichir les recommandations avec les détails des exposants/produits
        const enrichedRecommendations = data.map((rec) => {
          if (rec.itemType === 'exhibitor') {
            const exhibitor = exhibitors.find(e => e.id === rec.itemId);
            return { ...rec, exhibitor };
          } else if (rec.itemType === 'product') {
            // Chercher le produit dans tous les exposants
            let foundProduct: Product | undefined;
            for (const exhibitor of exhibitors) {
              foundProduct = exhibitor.products.find(p => p.id === rec.itemId);
              if (foundProduct) break;
            }
            return { ...rec, product: foundProduct };
          }
          return rec;
        });

        setRecommendations(enrichedRecommendations.filter(r => r.exhibitor || r.product));
      } catch (err) {
        console.error("Erreur lors du chargement des recommandations:", err);
        setError("Impossible de charger les recommandations pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const handleItemClick = (rec: RecommendationWithDetails) => {
    if (rec.exhibitor) {
      navigate(ROUTES.EXHIBITOR_DETAIL.replace(':id', rec.exhibitor.id));
    } else if (rec.product) {
      // Naviguer vers la page du produit ou de l'exposant qui possède le produit
      // Pour simplifier, on pourrait naviguer vers l'exposant
      const exhibitors = recommendations.filter(r => r.exhibitor).map(r => r.exhibitor!);
      const ownerExhibitor = exhibitors.find(e => e.products.some(p => p.id === rec.product!.id));
      if (ownerExhibitor) {
        navigate(ROUTES.EXHIBITOR_DETAIL.replace(':id', ownerExhibitor.id));
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Recommandations pour vous</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Chargement des recommandations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Recommandations pour vous</h2>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Recommandations pour vous</h2>
        </div>
        <p className="text-gray-600">Aucune recommandation disponible pour le moment. Complétez votre profil pour obtenir des suggestions personnalisées.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">Recommandations pour vous</h2>
        <TrendingUp className="w-4 h-4 text-green-600 ml-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const item = rec.exhibitor || rec.product;
          if (!item) return null;

          const isExhibitor = !!rec.exhibitor;
          const title = isExhibitor ? (rec.exhibitor as Exhibitor).companyName : (rec.product as Product).name;
          const description = isExhibitor 
            ? (rec.exhibitor as Exhibitor).description 
            : (rec.product as Product).description;
          const logo = isExhibitor ? (rec.exhibitor as Exhibitor).logo : undefined;
          const category = isExhibitor 
            ? (rec.exhibitor as Exhibitor).category 
            : (rec.product as Product).category;

          return (
            <div
              key={rec.itemId}
              onClick={() => handleItemClick(rec)}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {logo && (
                <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={logo} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {title}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 mb-2 uppercase">{category}</p>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {isExhibitor ? 'Exposant' : 'Produit'}
                </span>
                <span className="text-blue-600 font-medium">
                  {Math.round(rec.similarityScore * 100)}% de correspondance
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserRecommendations;
