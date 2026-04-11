import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Building2, ExternalLink, Loader2, Eye } from 'lucide-react';

interface MiniSitePreview {
  id: string;
  exhibitor_id: string;
  company_name: string;
  category: string;
  sector: string;
  theme: string;
  views: number;
  logo_url?: string;
}

export default function MiniSiteDirectory() {
  const [minisites, setMinisites] = useState<MiniSitePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMinisites();
  }, []);

  const loadMinisites = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les mini-sites publiés avec leurs exposants
      const { data: sites } = await SupabaseService.getPublishedMiniSites();
      
      if (sites) {
        setMinisites(sites);
      }
    } catch (error) {
      console.error('Erreur chargement mini-sites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mini-sites des Exposants
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez les présentations détaillées de nos exposants
          </p>
        </div>

        {minisites.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucun mini-site disponible
            </h2>
            <p className="text-gray-500">
              Les exposants n'ont pas encore créé leurs mini-sites vitrines.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {minisites.map((site) => (
              <Card
                key={site.id}
                className="hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.company_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-white/80" />
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{site.views || 0}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {site.company_name || 'Exposant'}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {site.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {site.sector}
                    </span>
                  </div>

                  <Link to={`/minisite/${site.exhibitor_id}`}>
                    <Button className="w-full group">
                      Voir le mini-site
                      <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
